import { useCallback, useState } from 'react';
import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useAuth } from '../../../lib/auth-context';
import { supabase } from '../../../lib/supabase';
import { getSignedUrl } from '../../../lib/api/storage';
import { generateDevisPdf } from '../../../lib/api/pdf';
import { downloadFile } from '../../../lib/downloadFile';
import { duplicateDevis, sendDevisEmail } from '../../../lib/api/devis';
import { translateEmailMessage } from '../../../lib/api/ai';
import { convertDevisToFacture, listFacturesForDevis } from '../../../lib/api/factures';
import { publicDevisUrl } from '../../../lib/api/publicPortal';
import { createTrameFromDevis } from '../../../lib/api/trames';
import { getDevisBexioMapping, getIntegration, pushClientToBexio, pushDevisToBexio } from '../../../lib/api/integrations';
import { confirm } from '../../../lib/confirm';
import { Button, Card, Container, Field, LangToggle, LoadingScreen, Screen, StatusBadge } from '../../../components/ui';
import { RowActionMenu } from '../../../components/RowActionMenu';
import { StatusDropdown } from '../../../components/StatusDropdown';
import { ProjectPicker } from '../../../components/ProjectPicker';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';
import { defaultDevisEmailMessage } from '../../../lib/emailDefaults';
import { getAppLocale, useTranslation } from '../../../lib/translations';
import type { Devis, DevisItem, DevisStatus, Facture, Plan, Project } from '../../../lib/types';

type RelatedFacture = Pick<Facture, 'id' | 'number' | 'status' | 'is_deposit'>;

const STATUS_FLOW: DevisStatus[] = ['draft', 'ready', 'sent', 'accepted', 'refused'];

export default function DevisDetailScreen() {
  const { t } = useTranslation();
  const STATUS_LABELS: Record<DevisStatus, string> = {
    draft: t('common.status.draft'),
    ready: t('common.status.ready'),
    sent: t('common.status.sent'),
    accepted: t('common.status.accepted'),
    refused: t('common.status.refused'),
  };
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { organization, role } = useAuth();
  const isAdmin = role === 'owner' || role === 'admin';
  const [devis, setDevis] = useState<Devis | null>(null);
  const [items, setItems] = useState<DevisItem[]>([]);
  const [linkedProject, setLinkedProject] = useState<Project | null>(null);
  const [generating, setGenerating] = useState(false);
  const [converting, setConverting] = useState(false);
  const [relatedFactures, setRelatedFactures] = useState<RelatedFacture[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [trameModalVisible, setTrameModalVisible] = useState(false);
  const [trameName, setTrameName] = useState('');
  const [savingTrame, setSavingTrame] = useState(false);
  const [trameError, setTrameError] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [emailModalVisible, setEmailModalVisible] = useState(false);
  const [emailMessage, setEmailMessage] = useState('');
  const [translatingMessage, setTranslatingMessage] = useState(false);
  const [translateError, setTranslateError] = useState<string | null>(null);
  // Which language the message box currently reads as being in — drives the
  // FR/DE toggle's slide position. Seeded from this devis's resolved locale
  // when the modal opens (a reasonable starting guess, not a hard rule: the
  // org's own saved message could be in either language regardless of any
  // locale setting), then updated to whichever side the member actually
  // translates into. Deliberately independent of the member's own current
  // UI language — translating is a free choice in either direction, not
  // something the platform's own current locale should constrain.
  const [messageLocale, setMessageLocale] = useState<'fr' | 'de'>('fr');
  const [bexioConnected, setBexioConnected] = useState(false);
  const [bexioExternalId, setBexioExternalId] = useState<string | null>(null);
  const [bexioLastSyncedAt, setBexioLastSyncedAt] = useState<string | null>(null);
  const [pushingBexio, setPushingBexio] = useState(false);

  const load = useCallback(async () => {
    const [{ data: d }, { data: i }, f] = await Promise.all([
      supabase.from('devis').select('*').eq('id', id).single(),
      supabase.from('devis_items').select('*').eq('devis_id', id).order('sort_order', { ascending: true }),
      listFacturesForDevis(id),
    ]);
    setDevis(d ?? null);
    setItems(i ?? []);
    setRelatedFactures(f);
    if (organization) {
      const { data: planRow } = await supabase.from('plans').select('*').eq('id', organization.plan_id).single();
      setPlan(planRow ?? null);
      if (planRow?.has_bexio_integration && d) {
        const [{ data: integration }, mapping] = await Promise.all([
          getIntegration(organization.id, 'bexio'),
          getDevisBexioMapping(organization.id, id),
        ]);
        setBexioConnected(integration?.status === 'connected');
        setBexioExternalId(mapping.externalId);
        setBexioLastSyncedAt(mapping.lastSyncedAt);
      } else {
        setBexioConnected(false);
        setBexioExternalId(null);
        setBexioLastSyncedAt(null);
      }
    }
    if (d?.project_id) {
      const { data: p } = await supabase.from('projects').select('*').eq('id', d.project_id).single();
      setLinkedProject(p ?? null);
    } else {
      setLinkedProject(null);
    }
  }, [id, organization]);

  async function handleProjectChange(project: Project | null) {
    setLinkedProject(project);
    await supabase.from('devis').update({ project_id: project?.id ?? null }).eq('id', id);
  }

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  // Accepting a devis creates its final invoice on the spot — no separate
  // "transformer en facture" step — and jumps straight to it, since that's
  // the next thing the user needs after acceptance. Skipped if a non-deposit
  // facture already exists for this devis (re-accepting shouldn't duplicate it).
  async function changeStatus(status: DevisStatus) {
    const wasDraft = devis?.status === 'draft';
    await supabase.from('devis').update({ status }).eq('id', id);
    // Finalizing (leaving draft) generates the PDF right away so it's ready
    // the moment the org wants to copy the client link or send it by e-mail
    // — both of those also regenerate on their own, this is just convenience.
    if (wasDraft && status !== 'draft') {
      generateDevisPdf(id);
    }
    if (status === 'accepted' && !relatedFactures.some((f) => !f.is_deposit)) {
      setConverting(true);
      setError(null);
      const { id: newId, error: rpcError } = await convertDevisToFacture(id);
      setConverting(false);
      if (rpcError) {
        setError(rpcError);
        load();
        return;
      }
      if (newId) {
        router.push(`/(app)/devis/factures/${newId}`);
        return;
      }
    }
    load();
  }

  async function handleGeneratePdf() {
    setGenerating(true);
    setError(null);
    const { error } = await generateDevisPdf(id);
    setGenerating(false);
    if (error) {
      setError(error);
      return;
    }
    load();
  }

  async function openPdf() {
    if (!devis?.pdf_path) return;
    const url = await getSignedUrl(devis.pdf_path);
    if (!url) return;
    const { error: dlError } = await downloadFile(url, `Devis ${devis.number || devis.client_name}.pdf`);
    if (dlError) setError(dlError);
  }

  async function handleDuplicate() {
    setError(null);
    const { id: newId, error: dupError } = await duplicateDevis(id);
    if (dupError) {
      setError(dupError);
      return;
    }
    if (newId) router.push(`/(app)/devis/${newId}`);
  }

  async function handleDelete() {
    const ok = await confirm(t('devisDetail.deleteConfirmTitle'), t('devisDetail.deleteConfirmBody', { number: devis?.number ?? '' }));
    if (!ok) return;
    setError(null);
    const { error: delError } = await supabase.from('devis').delete().eq('id', id);
    if (delError) {
      setError(delError.message);
      return;
    }
    router.replace('/(app)/devis');
  }

  // Per-document override of the org's default document locale (see
  // compte/entreprise.tsx's own fr/de picker) — for the occasional client who
  // needs this one devis in the other language without changing the whole
  // org's default. null clears the override back to "inherit the org's".
  async function handleSetDocLocale(locale: 'fr' | 'de' | null) {
    if (!devis) return;
    const { error: updateError } = await supabase.from('devis').update({ locale }).eq('id', devis.id);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setDevis({ ...devis, locale });
  }

  // The public link is only ever checkable client-side by the client's own
  // email matching devis.client_email (see accept_public_devis RPC) — so
  // without an email on file, the link would never verify.
  async function handleCopyClientLink() {
    if (!devis) return;
    await Clipboard.setStringAsync(publicDevisUrl(devis.public_token));
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  }

  function handleOpenEmailModal() {
    // The message actually reaching the client should match this devis's own
    // resolved locale (its override, or else the org's default) — not
    // necessarily whatever language the sender is currently browsing the app
    // in — same reasoning as resolveDocLocale server-side. Only a starting
    // guess for the toggle though (see messageLocale above), never a
    // constraint on which direction the member can translate afterwards.
    const docLocale = devis?.locale ?? (organization?.locale === 'de' ? 'de' : 'fr');
    setEmailMessage(organization?.devis_email_message ?? defaultDevisEmailMessage(docLocale));
    setMessageLocale(docLocale);
    setTranslateError(null);
    setEmailModalVisible(true);
  }

  // Translates the current message text into whichever language the member
  // actually taps on the toggle — a free choice either way, not dictated by
  // this devis's resolved locale, the org's default, or the member's own
  // current UI language. (Earlier version always targeted the devis's
  // resolved locale, which broke exactly the case a German-locale member
  // reported: their message was already in French and they wanted it in
  // German, but the button only ever offered French — following whatever
  // the org's default document locale happened to be, regardless of what
  // language the member was actually working in or wanted.)
  async function handleTranslateMessage(target: 'fr' | 'de') {
    if (!organization || !emailMessage.trim() || translatingMessage || target === messageLocale) return;
    setTranslatingMessage(true);
    setTranslateError(null);
    const { text, error: translateErr } = await translateEmailMessage(organization.id, emailMessage, target);
    setTranslatingMessage(false);
    if (translateErr || !text) {
      setTranslateError(translateErr ?? t('devisDetail.translateFailed'));
      return;
    }
    setEmailMessage(text);
    setMessageLocale(target);
  }

  async function handleConfirmSendEmail() {
    if (!devis) return;
    setSendingEmail(true);
    setError(null);
    const { sent, error: sendError } = await sendDevisEmail(id, emailMessage);
    setSendingEmail(false);
    if (sendError || !sent) {
      setError(sendError ?? t('devisDetail.emailSendFailed'));
      return;
    }
    setEmailModalVisible(false);
    setEmailSent(true);
    setTimeout(() => setEmailSent(false), 2500);
    load();
  }

  async function handlePushToBexio() {
    if (!devis || pushingBexio) return;
    setPushingBexio(true);
    setError(null);
    const { error: pushError } = await pushDevisToBexio(devis.organization_id, devis.id);
    setPushingBexio(false);
    if (pushError) {
      setError(pushError);
      return;
    }
    load();
  }

  // Same shortcut as the facture detail screen: a client created in Cantia
  // (rather than pulled from Bexio) has no Bexio contact yet, which is what
  // triggers this error. Pushes that client to Bexio, then retries the
  // devis push in one tap instead of sending the user to the client's own
  // page or Compte > Intégrations.
  async function handleSyncClientsAndRetryPush() {
    if (!devis || !devis.client_id || pushingBexio) return;
    setPushingBexio(true);
    setError(null);
    const { error: clientPushError } = await pushClientToBexio(devis.organization_id, devis.client_id);
    if (clientPushError) {
      setPushingBexio(false);
      setError(clientPushError);
      return;
    }
    const { error: pushError } = await pushDevisToBexio(devis.organization_id, devis.id);
    setPushingBexio(false);
    if (pushError) {
      setError(pushError);
      return;
    }
    load();
  }

  async function handleSaveTrame() {
    if (!organization) return;
    if (!trameName.trim()) {
      setTrameError(t('devisDetail.trameNameRequired'));
      return;
    }
    setSavingTrame(true);
    setTrameError(null);
    const { id: newId, error: createError } = await createTrameFromDevis(organization.id, trameName.trim(), id);
    setSavingTrame(false);
    if (createError || !newId) {
      setTrameError(createError ?? t('devisDetail.createFailed'));
      return;
    }
    setTrameModalVisible(false);
    router.push(`/(app)/devis/trames/${newId}`);
  }

  if (!devis) {
    return (
      <Screen>
        <LoadingScreen />
      </Screen>
    );
  }

  const subtotal = items.reduce((sum, it) => sum + Number(it.quantity) * Number(it.unit_price), 0);
  const vat = subtotal * (Number(devis.vat_rate) / 100);
  const total = subtotal + vat;
  const canPushToBexio = !!plan?.has_bexio_integration && bexioConnected && devis.status !== 'draft' && !!devis.client_id;

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll}>
      <Container>
        <Card>
          <View style={styles.headerRow}>
            <Text style={styles.number}>{devis.number}</Text>
            <View style={styles.headerRight}>
              <StatusDropdown status={devis.status} options={STATUS_FLOW} labels={STATUS_LABELS} onChange={changeStatus} />
              <RowActionMenu
                actions={[
                  { key: 'duplicate', icon: 'copy', label: t('devisDetail.duplicate'), onPress: handleDuplicate },
                  {
                    key: 'save-trame',
                    icon: 'layout',
                    label: t('devisDetail.saveAsTrame'),
                    onPress: () => {
                      setTrameName('');
                      setTrameError(null);
                      setTrameModalVisible(true);
                    },
                  },
                  ...(isAdmin
                    ? [{ key: 'delete', icon: 'trash-2' as const, label: t('devisDetail.delete'), danger: true, onPress: handleDelete }]
                    : []),
                ]}
              />
            </View>
          </View>
          <Text style={styles.client}>{devis.client_name}</Text>
          {devis.client_address ? <Text style={styles.meta}>{devis.client_address}</Text> : null}
          {devis.client_email ? <Text style={styles.meta}>{devis.client_email}</Text> : null}
          {bexioExternalId ? (
            <View style={styles.bexioBadge}>
              <Feather name="check-circle" size={12} color={colors.success} />
              <Text style={styles.bexioBadgeText}>
                {devis.bexio_document_nr ? t('devisDetail.bexioDocNr', { number: devis.bexio_document_nr }) : t('devisDetail.bexioSynced')}
                {bexioLastSyncedAt ? ` · ${new Date(bexioLastSyncedAt).toLocaleDateString(`${getAppLocale()}-CH`)}` : ''}
              </Text>
            </View>
          ) : null}
          {canPushToBexio ? (
            <Button
              title={bexioExternalId ? t('devisDetail.resyncBexio') : t('devisDetail.sendToBexio')}
              variant="secondary"
              icon="refresh-cw"
              onPress={handlePushToBexio}
              loading={pushingBexio}
              style={{ marginTop: spacing.md }}
            />
          ) : null}
          <View style={styles.projectPickerRow}>
            <ProjectPicker organizationId={devis.organization_id} selectedProject={linkedProject} onSelect={handleProjectChange} />
          </View>
          {!devis.client_email ? (
            <Text style={styles.copyLinkHint}>{t('devisDetail.emailRequiredForLink')}</Text>
          ) : devis.status === 'draft' ? (
            <Text style={styles.copyLinkHint}>
              {t('devisDetail.readyToSendHint')}
            </Text>
          ) : (
            <View style={styles.clientLinkRow}>
              <Button
                title={linkCopied ? t('devisDetail.linkCopied') : t('devisDetail.copyClientLink')}
                variant="secondary"
                icon={linkCopied ? 'check' : 'link'}
                onPress={handleCopyClientLink}
                style={styles.clientLinkButton}
              />
              <Button
                title={emailSent ? t('devisDetail.emailSent') : t('devisDetail.sendByEmail')}
                variant="secondary"
                icon={emailSent ? 'check' : 'mail'}
                disabled={plan?.has_email_sending === false}
                onPress={handleOpenEmailModal}
                style={styles.clientLinkButton}
              />
            </View>
          )}
          {plan?.has_email_sending === false ? (
            <Text style={styles.copyLinkHint}>
              {t('devisDetail.emailPaidPlanOnly')}
            </Text>
          ) : null}
          {plan?.has_document_locale_override ? (
            <View style={styles.docLocaleBlock}>
              <Text style={styles.docLocaleLabel}>{t('devisDetail.documentLocaleLabel')}</Text>
              <Text style={styles.copyLinkHint}>{t('devisDetail.documentLocaleHint')}</Text>
              <View style={styles.docLocaleChips}>
                {([null, 'fr', 'de'] as const).map((loc) => (
                  <Pressable
                    key={loc ?? 'auto'}
                    onPress={() => handleSetDocLocale(loc)}
                    style={[styles.docLocaleChip, devis.locale === loc && styles.docLocaleChipActive]}
                  >
                    <Text style={[styles.docLocaleChipText, devis.locale === loc && styles.docLocaleChipTextActive]}>
                      {loc === 'fr' ? t('entreprise.localeFr') : loc === 'de' ? t('entreprise.localeDe') : t('devisDetail.documentLocaleAuto')}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ) : null}
        </Card>

        {devis.client_signed_at ? (
          <Card style={styles.signatureCard}>
            <View style={styles.signatureHeader}>
              <Feather name="check-circle" size={16} color={colors.success} />
              <Text style={styles.signatureTitle}>{t('devisDetail.signedElectronically')}</Text>
            </View>
            <Text style={styles.meta}>
              {devis.client_signer_name ? t('devisDetail.signedBy', { name: devis.client_signer_name }) : ''}
              {new Date(devis.client_signed_at).toLocaleString(`${getAppLocale()}-CH`, {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
            {devis.client_signature_data ? (
              <Image source={{ uri: devis.client_signature_data }} style={styles.signatureImage} resizeMode="contain" />
            ) : null}
            <Text style={styles.signatureFootnote}>
              {t('devisDetail.signatureFootnote')}
            </Text>
          </Card>
        ) : null}

        <Text style={styles.sectionTitle}>{t('devisDetail.linesTitle')}</Text>
        <Card>
          {items.map((it, idx) => (
            <View key={it.id} style={[styles.itemRow, idx > 0 && styles.itemRowBorder]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemDesc}>{it.description}</Text>
                <Text style={styles.meta}>
                  {it.quantity} {it.unit} × CHF {Number(it.unit_price).toFixed(2)}
                </Text>
              </View>
              <Text style={styles.itemTotal}>CHF {(Number(it.quantity) * Number(it.unit_price)).toFixed(2)}</Text>
            </View>
          ))}
          <View style={styles.totalsBlock}>
            <View style={styles.totalRow}>
              <Text style={styles.meta}>{t('devisDetail.subtotal')}</Text>
              <Text style={styles.meta}>CHF {subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.meta}>{t('devisDetail.vat', { rate: devis.vat_rate })}</Text>
              <Text style={styles.meta}>CHF {vat.toFixed(2)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>{t('devisDetail.totalInclVat')}</Text>
              <Text style={styles.totalLabel}>CHF {total.toFixed(2)}</Text>
            </View>
          </View>
        </Card>

        {error ? (
          <View>
            <Text style={styles.error}>{error}</Text>
            {error.includes("n'est pas relié à un contact Bexio") ? (
              <Button
                title={t('devisDetail.linkClientToBexioRetry')}
                variant="secondary"
                icon="refresh-cw"
                onPress={handleSyncClientsAndRetryPush}
                loading={pushingBexio}
                style={styles.errorBlockButton}
              />
            ) : null}
          </View>
        ) : null}
        {error?.includes('plan payant') ? (
          <Button
            title={t('devisDetail.upgradeToPaidPlan')}
            icon="arrow-up-circle"
            variant="secondary"
            onPress={() => router.push('/(app)/compte/facturation')}
            style={{ marginTop: spacing.sm }}
          />
        ) : null}

        <Button
          title={devis.pdf_path ? t('devisDetail.regeneratePdf') : t('devisDetail.generatePdf')}
          onPress={handleGeneratePdf}
          loading={generating}
          disabled={devis.status === 'draft'}
          style={{ marginTop: spacing.lg }}
        />
        {devis.status === 'draft' ? (
          <Text style={styles.pdfHint}>{t('devisDetail.readyToGeneratePdfHint')}</Text>
        ) : null}
        {devis.pdf_path ? (
          <Button
            title={t('devisDetail.openPdf')}
            icon="file-text"
            onPress={openPdf}
            variant="secondary"
            style={{ marginTop: spacing.md }}
          />
        ) : null}

        {relatedFactures.length ? (
          <>
            <Text style={styles.sectionTitle}>{t('devisDetail.linkedFacturesTitle')}</Text>
            <Card style={{ padding: 0, overflow: 'hidden' }}>
              {relatedFactures.map((f, idx) => (
                <Pressable
                  key={f.id}
                  onPress={() => router.push(`/(app)/devis/factures/${f.id}`)}
                  style={[styles.factureRow, idx > 0 && styles.itemRowBorder]}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemDesc}>{f.number}</Text>
                    <Text style={styles.meta}>{f.is_deposit ? t('devisDetail.deposit') : t('devisDetail.finalFacture')}</Text>
                  </View>
                  <StatusBadge status={f.status} />
                  <Feather name="chevron-right" size={16} color={colors.textMuted} />
                </Pressable>
              ))}
            </Card>
          </>
        ) : null}

      </Container>
      </ScrollView>

      <Modal visible={trameModalVisible} transparent animationType="fade" onRequestClose={() => setTrameModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{t('devisDetail.saveAsTrameTitle')}</Text>
            <Text style={styles.meta}>{t('devisDetail.saveAsTrameHint')}</Text>
            <Field label={t('devisDetail.trameNameLabel')} value={trameName} onChangeText={setTrameName} placeholder={t('devisDetail.trameNamePlaceholder')} />
            {trameError ? <Text style={styles.error}>{trameError}</Text> : null}
            <View style={styles.modalActions}>
              <Button title={t('devisDetail.cancel')} variant="secondary" onPress={() => setTrameModalVisible(false)} style={{ flex: 1 }} />
              <Button title={t('devisDetail.save')} onPress={handleSaveTrame} loading={savingTrame} style={{ flex: 1 }} />
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={emailModalVisible} transparent animationType="fade" onRequestClose={() => setEmailModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{t('devisDetail.sendEmailTitle')}</Text>
            <Text style={styles.meta}>
              {t('devisDetail.sendEmailHint')}
            </Text>
            <Field
              label={t('devisDetail.messageLabel')}
              value={emailMessage}
              onChangeText={setEmailMessage}
              multiline
              numberOfLines={4}
              style={{ minHeight: 90, textAlignVertical: 'top', paddingTop: spacing.sm }}
            />
            <View style={styles.translateRow}>
              <Text style={styles.translateLinkText}>{t('devisDetail.translateLabel')}</Text>
              <LangToggle value={messageLocale} onChange={handleTranslateMessage} loading={translatingMessage} />
            </View>
            {translateError ? <Text style={styles.error}>{translateError}</Text> : null}
            <Text style={styles.lockedNoticeText}>
              {t('devisDetail.lockedNoticeText')}
            </Text>
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <View style={styles.modalActions}>
              <Button title={t('devisDetail.cancel')} variant="secondary" onPress={() => setEmailModalVisible(false)} style={{ flex: 1 }} />
              <Button title={t('devisDetail.send')} onPress={handleConfirmSendEmail} loading={sendingEmail} style={{ flex: 1 }} />
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: spacing.xl,
    paddingBottom: spacing.xxl * 2,
  },
  headerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  number: {
    fontSize: fontSize.lg,
    fontWeight: '800',
    color: colors.text,
  },
  client: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
  },
  meta: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  projectPickerRow: {
    marginTop: spacing.sm,
  },
  bexioBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.xs,
  },
  bexioBadgeText: {
    fontSize: fontSize.xs,
    color: colors.success,
    fontWeight: '600',
  },
  clientLinkRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  clientLinkButton: {
    flexGrow: 1,
  },
  copyLinkHint: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: spacing.md,
  },
  translateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  translateLinkText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.textMuted,
  },
  docLocaleBlock: {
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  docLocaleLabel: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
  },
  docLocaleChips: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  docLocaleChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  docLocaleChipActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  docLocaleChipText: {
    fontSize: fontSize.xs,
    color: colors.text,
  },
  docLocaleChipTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  signatureCard: {
    marginTop: spacing.md,
  },
  signatureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  signatureTitle: {
    fontSize: fontSize.sm,
    fontWeight: '800',
    color: colors.success,
  },
  signatureImage: {
    width: '100%',
    height: 90,
    marginTop: spacing.sm,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
  },
  signatureFootnote: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  itemRowBorder: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  itemDesc: {
    fontSize: fontSize.md,
    color: colors.text,
  },
  itemTotal: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
  },
  totalsBlock: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    gap: spacing.xs,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  totalLabel: {
    fontSize: fontSize.md,
    fontWeight: '800',
    color: colors.text,
  },
  error: {
    color: colors.danger,
    fontSize: fontSize.sm,
    marginTop: spacing.md,
  },
  errorBlockButton: {
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
  },
  lockedNoticeText: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    lineHeight: 16,
  },
  pdfHint: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  factureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  modalTitle: {
    fontSize: fontSize.lg,
    fontWeight: '800',
    color: colors.text,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
});
