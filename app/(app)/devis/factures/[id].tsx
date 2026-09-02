import { useCallback, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useAuth } from '../../../../lib/auth-context';
import { supabase } from '../../../../lib/supabase';
import { generateFacturePdf } from '../../../../lib/api/pdf';
import { downloadFile } from '../../../../lib/downloadFile';
import { publicFactureUrl } from '../../../../lib/api/publicPortal';
import {
  duplicateFacture,
  convertDevisToFacture,
  listFacturesForDevis,
  listFacturePayments,
  addFacturePayment,
  deleteFacturePayment,
  recomputeFactureDepositDeduction,
  sendFactureEmail,
} from '../../../../lib/api/factures';
import { translateEmailMessage } from '../../../../lib/api/ai';
import { confirm } from '../../../../lib/confirm';
import { getFactureBexioMapping, getIntegration, pushClientToBexio, pushFactureToBexio } from '../../../../lib/api/integrations';
import { Button, Card, Container, Field, LoadingScreen, Screen, StatusBadge } from '../../../../components/ui';
import { ProjectPicker } from '../../../../components/ProjectPicker';
import { colors, fontSize, radius, spacing } from '../../../../lib/theme';
import { generatePaymentReference, formatReferenceForDisplay } from '../../../../lib/qrReference';
import { defaultFactureEmailMessage } from '../../../../lib/emailDefaults';
import { getAppLocale, useTranslation } from '../../../../lib/translations';
import type { Facture, FactureItem, FacturePayment, FactureStatus, Plan, Project } from '../../../../lib/types';

const DEPOSIT_PRESETS = [20, 30, 50];

function todayDisplay(): string {
  return new Date().toLocaleDateString(`${getAppLocale()}-CH`);
}

// "JJ.MM.AAAA" -> ISO "AAAA-MM-JJ", or null if unparsable.
function parseSwissDate(value: string): string | null {
  const m = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(value.trim());
  if (!m) return null;
  const [, d, mo, y] = m;
  const iso = `${y}-${mo.padStart(2, '0')}-${d.padStart(2, '0')}`;
  return Number.isNaN(new Date(iso).getTime()) ? null : iso;
}

interface ActionRow {
  key: string;
  icon: React.ComponentProps<typeof Feather>['name'];
  label: string;
  onPress: () => void;
  disabled?: boolean;
  soon?: boolean;
  danger?: boolean;
}

// Chiffr-style: a single full-width "Actions" button right under the header
// (status + reference), expanding into a panel whose contents depend on the
// facture's status — instead of a small status-only dropdown up top, which
// buried anything beyond "change status" at the very bottom of the page,
// past however many line items the facture has.
export default function FactureDetailScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { role } = useAuth();
  const isAdmin = role === 'owner' || role === 'admin';
  const [facture, setFacture] = useState<Facture | null>(null);
  const [items, setItems] = useState<FactureItem[]>([]);
  const [payments, setPayments] = useState<FacturePayment[]>([]);
  const [orgIban, setOrgIban] = useState<string | null>(null);
  const [siblingFactures, setSiblingFactures] = useState<{ id: string; is_deposit: boolean }[]>([]);
  const [linkedProject, setLinkedProject] = useState<Project | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [defaultEmailMessage, setDefaultEmailMessage] = useState('');
  const [bexioConnected, setBexioConnected] = useState(false);
  const [bexioExternalId, setBexioExternalId] = useState<string | null>(null);
  const [bexioLastSyncedAt, setBexioLastSyncedAt] = useState<string | null>(null);
  const [pushingBexio, setPushingBexio] = useState(false);
  const [emailModalVisible, setEmailModalVisible] = useState(false);
  const [emailMessage, setEmailMessage] = useState('');
  const [orgLocale, setOrgLocale] = useState<'fr' | 'de'>('fr');
  const [translatingMessage, setTranslatingMessage] = useState(false);
  const [translateError, setTranslateError] = useState<string | null>(null);

  const [depositModalVisible, setDepositModalVisible] = useState(false);
  const [depositPercent, setDepositPercent] = useState('30');
  const [depositError, setDepositError] = useState<string | null>(null);

  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('0');
  const [paymentDate, setPaymentDate] = useState(todayDisplay());
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [{ data: f }, { data: i }, p] = await Promise.all([
      supabase.from('factures').select('*').eq('id', id).single(),
      supabase.from('facture_items').select('*').eq('facture_id', id).order('sort_order', { ascending: true }),
      listFacturePayments(id),
    ]);
    setFacture(f ?? null);
    setItems(i ?? []);
    setPayments(p);
    if (f?.organization_id) {
      const { data: org } = await supabase
        .from('organizations')
        .select('iban, plan_id, facture_email_message, locale')
        .eq('id', f.organization_id)
        .single();
      setOrgIban(org?.iban ?? null);
      // The message actually reaching the client should match this facture's
      // own resolved locale (its override, or else the org's default) — not
      // necessarily whatever language the sender is currently browsing the
      // app in — same reasoning as resolveDocLocale server-side.
      const resolvedOrgLocale: 'fr' | 'de' = org?.locale === 'de' ? 'de' : 'fr';
      setOrgLocale(resolvedOrgLocale);
      const docLocale = f.locale ?? resolvedOrgLocale;
      setDefaultEmailMessage(org?.facture_email_message ?? defaultFactureEmailMessage(docLocale));
      if (org?.plan_id) {
        const { data: planRow } = await supabase.from('plans').select('*').eq('id', org.plan_id).single();
        setPlan(planRow ?? null);
        if (planRow?.has_bexio_integration) {
          const [{ data: integration }, mapping] = await Promise.all([
            getIntegration(f.organization_id, 'bexio'),
            getFactureBexioMapping(f.organization_id, id),
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
    }
    setSiblingFactures(f?.devis_id ? await listFacturesForDevis(f.devis_id) : []);
    if (f?.project_id) {
      const { data: p } = await supabase.from('projects').select('*').eq('id', f.project_id).single();
      setLinkedProject(p ?? null);
    } else {
      setLinkedProject(null);
    }
  }, [id]);

  async function handleProjectChange(project: Project | null) {
    setLinkedProject(project);
    await supabase.from('factures').update({ project_id: project?.id ?? null }).eq('id', id);
  }

  async function handleCopyClientLink() {
    if (!facture) return;
    await Clipboard.setStringAsync(publicFactureUrl(facture.public_token));
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  }

  // Per-document override of the org's default document locale (see
  // compte/entreprise.tsx's own fr/de picker) — for the occasional client who
  // needs this one facture in the other language without changing the whole
  // org's default. null clears the override back to "inherit the org's".
  async function handleSetDocLocale(locale: 'fr' | 'de' | null) {
    if (!facture) return;
    const { error: updateError } = await supabase.from('factures').update({ locale }).eq('id', facture.id);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    // Reload rather than patch local state in place — defaultEmailMessage
    // (the compose modal's prefill) is derived from the facture's locale at
    // load time and needs to be recomputed too, not just `facture` itself.
    await load();
  }

  function handleOpenEmailModal() {
    setEmailMessage(defaultEmailMessage);
    setTranslateError(null);
    setEmailModalVisible(true);
  }

  // Translates the current message text into this facture's own resolved
  // locale — for when it doesn't match (e.g. an org-saved French default
  // message being sent alongside a facture whose own override is German).
  async function handleTranslateMessage() {
    if (!facture || !emailMessage.trim() || translatingMessage) return;
    const docLocale = facture.locale ?? orgLocale;
    setTranslatingMessage(true);
    setTranslateError(null);
    const { text, error: translateErr } = await translateEmailMessage(facture.organization_id, emailMessage, docLocale);
    setTranslatingMessage(false);
    if (translateErr || !text) {
      setTranslateError(translateErr ?? t('factureDetail.translateFailed'));
      return;
    }
    setEmailMessage(text);
  }

  async function handleSendEmail() {
    if (!facture) return;
    setSendingEmail(true);
    setError(null);
    const { sent, error: sendError } = await sendFactureEmail(id, emailMessage);
    setSendingEmail(false);
    if (sendError || !sent) {
      setError(sendError ?? t('factureDetail.emailSendFailed'));
      return;
    }
    setEmailModalVisible(false);
    setEmailSent(true);
    setTimeout(() => setEmailSent(false), 2500);
    load();
  }

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function setStatus(status: FactureStatus, paidAt?: string | null) {
    const patch: { status: FactureStatus; paid_at?: string | null } = { status };
    if (paidAt !== undefined) patch.paid_at = paidAt;
    await supabase.from('factures').update(patch).eq('id', id);
    setActionsOpen(false);
    load();
  }

  // Generates the PDF right away so it's ready the moment the org wants to
  // copy the client link or send it by e-mail — both of those also
  // regenerate on their own, this is just convenience.
  async function handleFinalize() {
    setBusy(true);
    await setStatus('sent');
    setBusy(false);
    generateFacturePdf(id);
  }

  async function handleDownloadPdf() {
    setBusy(true);
    setError(null);
    const { url, error: genError } = await generateFacturePdf(id);
    setBusy(false);
    if (genError || !url) {
      setError(genError ?? t('factureDetail.pdfGenFailed'));
      return;
    }
    setActionsOpen(false);
    const { error: dlError } = await downloadFile(url, `Facture ${facture?.number || facture?.client_name}.pdf`);
    if (dlError) setError(dlError);
    load();
  }

  async function handleDuplicate() {
    setError(null);
    setActionsOpen(false);
    const { id: newId, error: dupError } = await duplicateFacture(id);
    if (dupError) {
      setError(dupError);
      return;
    }
    if (newId) router.push(`/(app)/devis/factures/${newId}`);
  }

  async function handlePushToBexio() {
    if (!facture || pushingBexio) return;
    setPushingBexio(true);
    setError(null);
    setActionsOpen(false);
    const { error: pushError } = await pushFactureToBexio(facture.organization_id, facture.id);
    setPushingBexio(false);
    if (pushError) {
      setError(pushError);
      return;
    }
    load();
  }

  // Shown as a shortcut under the "client not linked to a Bexio contact"
  // error — a client created in Cantia (rather than pulled from Bexio) has
  // no Bexio contact yet, which is what triggers this error. Pushes that
  // client to Bexio, then retries the facture push in one tap instead of
  // sending the user to the client's own page or Compte > Intégrations.
  async function handleSyncClientsAndRetryPush() {
    if (!facture || !facture.client_id || pushingBexio) return;
    setPushingBexio(true);
    setError(null);
    const { error: clientPushError } = await pushClientToBexio(facture.organization_id, facture.client_id);
    if (clientPushError) {
      setPushingBexio(false);
      setError(clientPushError);
      return;
    }
    const { error: pushError } = await pushFactureToBexio(facture.organization_id, facture.id);
    setPushingBexio(false);
    if (pushError) {
      setError(pushError);
      return;
    }
    load();
  }

  async function handleDeleteOrCancel() {
    const isDraft = facture?.status === 'draft';
    const ok = await confirm(
      isDraft ? t('factureDetail.deleteConfirmTitle') : t('factureDetail.cancelConfirmTitle'),
      isDraft
        ? t('factureDetail.deleteConfirmBody', { number: facture?.number ?? '' })
        : t('factureDetail.cancelConfirmBody', { number: facture?.number ?? '' }),
    );
    if (!ok) return;
    setError(null);
    if (isDraft) {
      const { error: delError } = await supabase.from('factures').delete().eq('id', id);
      if (delError) {
        setError(delError.message);
        return;
      }
      if (facture?.is_deposit && facture.devis_id) await recomputeFactureDepositDeduction(facture.devis_id);
      router.replace('/(app)/devis/factures');
      return;
    }
    await setStatus('cancelled');
    if (facture?.is_deposit && facture.devis_id) await recomputeFactureDepositDeduction(facture.devis_id);
  }

  async function handleRecordPayment() {
    const iso = parseSwissDate(paymentDate);
    if (!iso) {
      setPaymentError(t('factureDetail.invalidDate'));
      return;
    }
    const amount = Number(paymentAmount.replace(',', '.'));
    if (!amount || amount <= 0) {
      setPaymentError(t('factureDetail.invalidAmount'));
      return;
    }
    setPaymentError(null);
    setBusy(true);
    const { error: payError } = await addFacturePayment(id, amount, new Date(iso).toISOString(), total);
    setBusy(false);
    if (payError) {
      setPaymentError(payError);
      return;
    }
    setPaymentModalVisible(false);
    generateFacturePdf(id);
    load();
  }

  // One-tap "fully paid now" — records whatever's still owed as a single
  // payment (dated today) so the ledger stays accurate, rather than just
  // flipping the status flag without a matching entry.
  async function handleMarkPaid() {
    setBusy(true);
    setActionsOpen(false);
    if (remaining > 0.01) {
      await addFacturePayment(id, remaining, new Date().toISOString(), total);
    } else {
      await setStatus('paid', new Date().toISOString());
    }
    setBusy(false);
    generateFacturePdf(id);
    load();
  }

  async function handleDeletePayment(payment: FacturePayment) {
    const ok = await confirm(t('factureDetail.deletePaymentConfirmTitle'), t('factureDetail.deletePaymentConfirmBody', { amount: Number(payment.amount).toFixed(2) }));
    if (!ok) return;
    const { error: delError } = await deleteFacturePayment(payment.id, id, total);
    if (delError) {
      setError(delError);
      return;
    }
    generateFacturePdf(id);
    load();
  }

  async function handleCreateDeposit() {
    if (!facture?.devis_id) return;
    const percent = Number(depositPercent.replace(',', '.'));
    if (!percent || percent <= 0 || percent > 100) {
      setDepositError(t('factureDetail.invalidPercent'));
      return;
    }
    setBusy(true);
    setDepositError(null);
    const { id: newId, error: rpcError } = await convertDevisToFacture(facture.devis_id, percent);
    setBusy(false);
    if (rpcError) {
      setDepositError(rpcError);
      return;
    }
    setDepositModalVisible(false);
    router.push(`/(app)/devis/factures/${newId}`);
  }

  if (!facture) {
    return (
      <Screen>
        <LoadingScreen />
      </Screen>
    );
  }

  const subtotal = items.reduce((sum, it) => sum + Number(it.quantity) * Number(it.unit_price), 0);
  const vat = subtotal * (Number(facture.vat_rate) / 100);
  const total = subtotal + vat;
  const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);
  const remaining = Math.max(0, total - totalPaid);
  const overdue =
    (facture.status === 'sent' || facture.status === 'partial') && facture.due_date < new Date().toISOString().slice(0, 10);
  const paymentRef = generatePaymentReference(orgIban, facture.id);

  const canDeposit = !facture.is_deposit && !!facture.devis_id && !siblingFactures.some((f) => f.is_deposit);
  const canPushToBexio =
    !!plan?.has_bexio_integration && bexioConnected && facture.status !== 'draft' && facture.status !== 'cancelled' && !!facture.client_id;

  const actionRows: ActionRow[] = [
    { key: 'pdf', icon: 'download', label: t('factureDetail.downloadPdf'), onPress: handleDownloadPdf },
    ...(facture.status === 'draft'
      ? ([{ key: 'finalize', icon: 'check', label: t('factureDetail.finalize'), onPress: handleFinalize }] as ActionRow[])
      : []),
    ...(facture.status !== 'draft' && facture.status !== 'cancelled'
      ? ([
          ...(facture.status !== 'paid'
            ? ([
                {
                  key: 'record-payment',
                  icon: 'plus-circle',
                  label: t('factureDetail.recordPayment'),
                  onPress: () => {
                    setPaymentDate(todayDisplay());
                    setPaymentAmount(remaining.toFixed(2));
                    setPaymentError(null);
                    setPaymentModalVisible(true);
                    setActionsOpen(false);
                  },
                },
                { key: 'mark-paid', icon: 'check-circle', label: t('factureDetail.markPaid'), onPress: handleMarkPaid },
              ] as ActionRow[])
            : []),
          {
            key: 'deposit',
            icon: 'percent',
            label: t('factureDetail.invoiceDeposit'),
            disabled: !canDeposit,
            onPress: () => {
              setDepositError(null);
              setDepositModalVisible(true);
              setActionsOpen(false);
            },
          },
        ] as ActionRow[])
      : []),
    { key: 'duplicate', icon: 'copy', label: t('factureDetail.duplicate'), onPress: handleDuplicate },
    ...(facture.devis_id
      ? ([{ key: 'devis', icon: 'file-text', label: t('factureDetail.viewDevis'), onPress: () => router.push(`/(app)/devis/${facture.devis_id}`) }] as ActionRow[])
      : []),
    ...(isAdmin && facture.status !== 'cancelled'
      ? ([
          {
            key: 'delete-or-cancel',
            icon: facture.status === 'draft' ? 'trash-2' : 'slash',
            label: facture.status === 'draft' ? t('factureDetail.deleteFacture') : t('factureDetail.cancelFacture'),
            danger: true,
            onPress: handleDeleteOrCancel,
          },
        ] as ActionRow[])
      : []),
  ];

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll}>
      <Container>
        <Card>
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <Text style={styles.number}>{facture.number}</Text>
              {facture.is_deposit ? (
                <View style={styles.depositBadge}>
                  <Text style={styles.depositBadgeText}>{t('factureDetail.deposit')}</Text>
                </View>
              ) : null}
            </View>
            <StatusBadge status={facture.status} />
          </View>
          <Text style={styles.client}>{facture.client_name}</Text>
          {facture.client_address ? <Text style={styles.meta}>{facture.client_address}</Text> : null}
          {facture.client_email ? <Text style={styles.meta}>{facture.client_email}</Text> : null}
          <Text style={[styles.meta, overdue && styles.overdue]}>
            {overdue ? t('factureDetail.overduePrefix') : ''}{t('factureDetail.dueDate', { date: new Date(facture.due_date).toLocaleDateString(`${getAppLocale()}-CH`) })}
          </Text>
          {bexioExternalId ? (
            <View style={styles.bexioBadge}>
              <Feather name="check-circle" size={12} color={colors.success} />
              <Text style={styles.bexioBadgeText}>
                {t('factureDetail.bexioSynced')}{bexioLastSyncedAt ? ` · ${new Date(bexioLastSyncedAt).toLocaleDateString(`${getAppLocale()}-CH`)}` : ''}
              </Text>
            </View>
          ) : null}
          {canPushToBexio ? (
            <Button
              title={bexioExternalId ? t('factureDetail.resyncBexio') : t('factureDetail.sendToBexio')}
              variant="secondary"
              icon="refresh-cw"
              onPress={handlePushToBexio}
              loading={pushingBexio}
              style={{ marginTop: spacing.md }}
            />
          ) : null}
          <View style={styles.projectPickerRow}>
            <ProjectPicker organizationId={facture.organization_id} selectedProject={linkedProject} onSelect={handleProjectChange} />
          </View>
          {facture.status === 'draft' ? (
            <>
              <Button
                title={t('factureDetail.finalizeDraft')}
                icon="check"
                onPress={handleFinalize}
                loading={busy}
                style={{ marginTop: spacing.md }}
              />
              <Text style={styles.copyLinkHint}>
                {facture.client_email
                  ? t('factureDetail.finalizedHintWithEmail')
                  : t('factureDetail.finalizedHintNoEmail')}
              </Text>
            </>
          ) : !facture.client_email ? (
            <Text style={styles.copyLinkHint}>{t('factureDetail.emailRequiredForLink')}</Text>
          ) : (
            <View style={styles.clientLinkRow}>
              <Button
                title={linkCopied ? t('factureDetail.linkCopied') : t('factureDetail.copyClientLink')}
                variant="secondary"
                icon={linkCopied ? 'check' : 'link'}
                onPress={handleCopyClientLink}
                style={styles.clientLinkButton}
              />
              <Button
                title={emailSent ? t('factureDetail.emailSent') : t('factureDetail.sendByEmail')}
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
              {t('factureDetail.emailPaidPlanOnly')}
            </Text>
          ) : null}
          {plan?.has_document_locale_override ? (
            <View style={styles.docLocaleBlock}>
              <Text style={styles.docLocaleLabel}>{t('factureDetail.documentLocaleLabel')}</Text>
              <Text style={styles.copyLinkHint}>{t('factureDetail.documentLocaleHint')}</Text>
              <View style={styles.docLocaleChips}>
                {([null, 'fr', 'de'] as const).map((loc) => (
                  <Pressable
                    key={loc ?? 'auto'}
                    onPress={() => handleSetDocLocale(loc)}
                    style={[styles.docLocaleChip, facture.locale === loc && styles.docLocaleChipActive]}
                  >
                    <Text style={[styles.docLocaleChipText, facture.locale === loc && styles.docLocaleChipTextActive]}>
                      {loc === 'fr' ? t('entreprise.localeFr') : loc === 'de' ? t('entreprise.localeDe') : t('factureDetail.documentLocaleAuto')}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ) : null}
        </Card>

        {paymentRef ? (
          <View style={styles.refCard}>
            <Feather name="hash" size={16} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.refLabel}>{t('factureDetail.paymentRefLabel')}</Text>
              <Text selectable style={styles.refValue}>
                {formatReferenceForDisplay(paymentRef.reference, paymentRef.type)}
              </Text>
              <Text style={styles.refHint}>{t('factureDetail.longPressToCopy')}</Text>
            </View>
          </View>
        ) : null}

        <Button
          title={t('factureDetail.actions')}
          icon={actionsOpen ? 'chevron-up' : 'chevron-down'}
          onPress={() => setActionsOpen((v) => !v)}
          loading={busy}
          style={{ marginTop: spacing.md }}
        />
        {actionsOpen ? (
          <Card style={styles.actionsPanel}>
            {actionRows.map((action, i) => (
              <Pressable
                key={action.key}
                disabled={action.disabled}
                onPress={action.onPress}
                style={[styles.actionRow, i > 0 && styles.actionRowBorder, action.disabled && styles.actionRowDisabled]}
              >
                <Feather name={action.icon} size={16} color={action.danger ? colors.danger : colors.text} />
                <Text style={[styles.actionRowText, action.danger && styles.actionRowTextDanger]}>{action.label}</Text>
                {action.soon ? (
                  <View style={styles.soonBadge}>
                    <Text style={styles.soonBadgeText}>{t('factureDetail.soonAvailable')}</Text>
                  </View>
                ) : null}
              </Pressable>
            ))}
          </Card>
        ) : null}
        {error ? (
          <View>
            <Text style={styles.error}>{error}</Text>
            {error.includes("n'est pas relié à un contact Bexio") ? (
              <Button
                title={t('factureDetail.linkClientToBexioRetry')}
                variant="secondary"
                icon="refresh-cw"
                onPress={handleSyncClientsAndRetryPush}
                loading={pushingBexio}
                style={styles.errorBlockButton}
              />
            ) : null}
          </View>
        ) : null}

        <Text style={styles.sectionTitle}>{t('factureDetail.linesTitle')}</Text>
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
              <Text style={styles.meta}>{t('factureDetail.subtotal')}</Text>
              <Text style={styles.meta}>CHF {subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.meta}>{t('factureDetail.vat', { rate: facture.vat_rate })}</Text>
              <Text style={styles.meta}>CHF {vat.toFixed(2)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>{t('factureDetail.totalInclVat')}</Text>
              <Text style={styles.totalLabel}>CHF {total.toFixed(2)}</Text>
            </View>
          </View>
        </Card>

        {payments.length || facture.status === 'sent' || facture.status === 'partial' ? (
          <>
            <Text style={styles.sectionTitle}>{t('factureDetail.paymentsTitle')}</Text>
            <Card>
              <View style={styles.totalRow}>
                <Text style={styles.meta}>{t('factureDetail.paid')}</Text>
                <Text style={styles.meta}>CHF {totalPaid.toFixed(2)}</Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>{t('factureDetail.remainingDue')}</Text>
                <Text style={styles.totalLabel}>CHF {remaining.toFixed(2)}</Text>
              </View>
              {payments.length ? (
                <View style={styles.totalsBlock}>
                  {payments.map((p) => (
                    <View key={p.id} style={styles.paymentRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.itemDesc}>CHF {Number(p.amount).toFixed(2)}</Text>
                        <Text style={styles.meta}>{new Date(p.paid_at).toLocaleDateString(`${getAppLocale()}-CH`)}</Text>
                      </View>
                      {isAdmin ? (
                        <Pressable onPress={() => handleDeletePayment(p)} hitSlop={8}>
                          <Feather name="trash-2" size={16} color={colors.danger} />
                        </Pressable>
                      ) : null}
                    </View>
                  ))}
                </View>
              ) : null}
            </Card>
          </>
        ) : null}
      </Container>
      </ScrollView>

      <Modal visible={paymentModalVisible} transparent animationType="fade" onRequestClose={() => setPaymentModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{t('factureDetail.recordPaymentTitle')}</Text>
            <Text style={styles.meta}>{t('factureDetail.recordPaymentHint')}</Text>
            <Field label={t('factureDetail.amountLabel')} value={paymentAmount} onChangeText={setPaymentAmount} keyboardType="decimal-pad" />
            <Field label={t('factureDetail.dateLabel')} value={paymentDate} onChangeText={setPaymentDate} />
            {paymentError ? <Text style={styles.error}>{paymentError}</Text> : null}
            <View style={styles.modalActions}>
              <Button title={t('factureDetail.cancel')} variant="secondary" onPress={() => setPaymentModalVisible(false)} style={{ flex: 1 }} />
              <Button title={t('factureDetail.confirm')} onPress={handleRecordPayment} loading={busy} style={{ flex: 1 }} />
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={depositModalVisible} transparent animationType="fade" onRequestClose={() => setDepositModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{t('factureDetail.invoiceDepositTitle')}</Text>
            <Text style={styles.meta}>{t('factureDetail.invoiceDepositHint')}</Text>
            <View style={styles.percentPresets}>
              {DEPOSIT_PRESETS.map((p) => (
                <Pressable
                  key={p}
                  onPress={() => setDepositPercent(String(p))}
                  style={[styles.percentChip, depositPercent === String(p) && styles.percentChipActive]}
                >
                  <Text style={[styles.percentChipText, depositPercent === String(p) && styles.percentChipTextActive]}>{p}%</Text>
                </Pressable>
              ))}
            </View>
            <Field label={t('factureDetail.percentLabel')} value={depositPercent} onChangeText={setDepositPercent} keyboardType="decimal-pad" />
            {depositError ? <Text style={styles.error}>{depositError}</Text> : null}
            <View style={styles.modalActions}>
              <Button title={t('factureDetail.cancel')} variant="secondary" onPress={() => setDepositModalVisible(false)} style={{ flex: 1 }} />
              <Button title={t('factureDetail.createFacture')} onPress={handleCreateDeposit} loading={busy} style={{ flex: 1 }} />
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={emailModalVisible} transparent animationType="fade" onRequestClose={() => setEmailModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{t('factureDetail.sendEmailTitle')}</Text>
            <Text style={styles.meta}>
              {t('factureDetail.sendEmailHint')}
            </Text>
            <Field
              label={t('factureDetail.messageLabel')}
              value={emailMessage}
              onChangeText={setEmailMessage}
              multiline
              numberOfLines={4}
              style={{ minHeight: 90, textAlignVertical: 'top', paddingTop: spacing.sm }}
            />
            <Pressable onPress={handleTranslateMessage} disabled={translatingMessage} style={styles.translateLink}>
              <Feather name="globe" size={13} color={colors.primary} />
              <Text style={styles.translateLinkText}>
                {translatingMessage
                  ? t('factureDetail.translating')
                  : t('factureDetail.translateToLang', {
                      lang: (facture?.locale ?? orgLocale) === 'de' ? t('entreprise.localeDe') : t('entreprise.localeFr'),
                    })}
              </Text>
            </Pressable>
            {translateError ? <Text style={styles.error}>{translateError}</Text> : null}
            <Text style={styles.lockedNoticeText}>
              {t('factureDetail.lockedNoticeText')}
            </Text>
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <View style={styles.modalActions}>
              <Button title={t('factureDetail.cancel')} variant="secondary" onPress={() => setEmailModalVisible(false)} style={{ flex: 1 }} />
              <Button title={t('factureDetail.send')} onPress={handleSendEmail} loading={sendingEmail} style={{ flex: 1 }} />
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  depositBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: colors.accentSoft,
  },
  depositBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.accent,
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
  overdue: {
    color: colors.danger,
    fontWeight: '600',
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
  translateLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  translateLinkText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.primary,
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
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  refCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  refLabel: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  refValue: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
    marginTop: 2,
    fontVariant: ['tabular-nums'],
  },
  refHint: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  actionsPanel: {
    padding: 0,
    overflow: 'hidden',
    marginTop: spacing.sm,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  actionRowBorder: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionRowDisabled: {
    opacity: 0.45,
  },
  actionRowText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  actionRowTextDanger: {
    color: colors.danger,
  },
  soonBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: colors.surfaceAlt,
  },
  soonBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.textMuted,
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
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
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
  percentPresets: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  percentChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
  },
  percentChipActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  percentChipText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
  },
  percentChipTextActive: {
    color: colors.primary,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
});
