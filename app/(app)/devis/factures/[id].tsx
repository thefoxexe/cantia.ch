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
import { confirm } from '../../../../lib/confirm';
import { Button, Card, Container, Field, LoadingScreen, Screen, StatusBadge } from '../../../../components/ui';
import { ProjectPicker } from '../../../../components/ProjectPicker';
import { colors, fontSize, radius, spacing } from '../../../../lib/theme';
import { generatePaymentReference, formatReferenceForDisplay } from '../../../../lib/qrReference';
import { DEFAULT_FACTURE_EMAIL_MESSAGE } from '../../../../lib/emailDefaults';
import type { Facture, FactureItem, FacturePayment, FactureStatus, Plan, Project } from '../../../../lib/types';

const DEPOSIT_PRESETS = [20, 30, 50];

function todayDisplay(): string {
  return new Date().toLocaleDateString('fr-CH');
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
  const [emailModalVisible, setEmailModalVisible] = useState(false);
  const [emailMessage, setEmailMessage] = useState('');

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
        .select('iban, plan_id, facture_email_message')
        .eq('id', f.organization_id)
        .single();
      setOrgIban(org?.iban ?? null);
      setDefaultEmailMessage(org?.facture_email_message ?? DEFAULT_FACTURE_EMAIL_MESSAGE);
      if (org?.plan_id) {
        const { data: planRow } = await supabase.from('plans').select('*').eq('id', org.plan_id).single();
        setPlan(planRow ?? null);
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

  function handleOpenEmailModal() {
    setEmailMessage(defaultEmailMessage);
    setEmailModalVisible(true);
  }

  async function handleSendEmail() {
    if (!facture) return;
    setSendingEmail(true);
    setError(null);
    const { sent, error: sendError } = await sendFactureEmail(id, emailMessage);
    setSendingEmail(false);
    if (sendError || !sent) {
      setError(sendError ?? "Échec de l'envoi de l'e-mail.");
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
    await setStatus('sent');
    generateFacturePdf(id);
  }

  async function handleDownloadPdf() {
    setBusy(true);
    setError(null);
    const { url, error: genError } = await generateFacturePdf(id);
    setBusy(false);
    if (genError || !url) {
      setError(genError ?? 'Échec de la génération du PDF.');
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

  async function handleDeleteOrCancel() {
    const isDraft = facture?.status === 'draft';
    const ok = await confirm(
      isDraft ? 'Supprimer cette facture ?' : 'Annuler cette facture ?',
      isDraft
        ? `La facture ${facture?.number ?? ''} sera définitivement supprimée.`
        : `La facture ${facture?.number ?? ''} sera marquée comme annulée.`,
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
      setPaymentError('Date invalide (format JJ.MM.AAAA).');
      return;
    }
    const amount = Number(paymentAmount.replace(',', '.'));
    if (!amount || amount <= 0) {
      setPaymentError('Entrez un montant supérieur à 0.');
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
    const ok = await confirm('Supprimer ce paiement ?', `Le paiement de CHF ${Number(payment.amount).toFixed(2)} sera retiré.`);
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
      setDepositError('Entrez un pourcentage entre 1 et 100.');
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

  const actionRows: ActionRow[] = [
    { key: 'pdf', icon: 'download', label: 'Télécharger le PDF', onPress: handleDownloadPdf },
    ...(facture.status === 'draft'
      ? ([{ key: 'finalize', icon: 'check', label: 'Finaliser', onPress: handleFinalize }] as ActionRow[])
      : []),
    ...(facture.status !== 'draft' && facture.status !== 'cancelled'
      ? ([
          ...(facture.status !== 'paid'
            ? ([
                {
                  key: 'record-payment',
                  icon: 'plus-circle',
                  label: 'Enregistrer un paiement',
                  onPress: () => {
                    setPaymentDate(todayDisplay());
                    setPaymentAmount(remaining.toFixed(2));
                    setPaymentError(null);
                    setPaymentModalVisible(true);
                    setActionsOpen(false);
                  },
                },
                { key: 'mark-paid', icon: 'check-circle', label: 'Marquer payée', onPress: handleMarkPaid },
              ] as ActionRow[])
            : []),
          {
            key: 'deposit',
            icon: 'percent',
            label: 'Facturer un acompte',
            disabled: !canDeposit,
            onPress: () => {
              setDepositError(null);
              setDepositModalVisible(true);
              setActionsOpen(false);
            },
          },
        ] as ActionRow[])
      : []),
    { key: 'duplicate', icon: 'copy', label: 'Dupliquer', onPress: handleDuplicate },
    ...(facture.devis_id
      ? ([{ key: 'devis', icon: 'file-text', label: 'Voir le devis', onPress: () => router.push(`/(app)/devis/${facture.devis_id}`) }] as ActionRow[])
      : []),
    ...(isAdmin && facture.status !== 'cancelled'
      ? ([
          {
            key: 'delete-or-cancel',
            icon: facture.status === 'draft' ? 'trash-2' : 'slash',
            label: facture.status === 'draft' ? 'Supprimer la facture' : 'Annuler la facture',
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
                  <Text style={styles.depositBadgeText}>Acompte</Text>
                </View>
              ) : null}
            </View>
            <StatusBadge status={facture.status} />
          </View>
          <Text style={styles.client}>{facture.client_name}</Text>
          {facture.client_address ? <Text style={styles.meta}>{facture.client_address}</Text> : null}
          {facture.client_email ? <Text style={styles.meta}>{facture.client_email}</Text> : null}
          <Text style={[styles.meta, overdue && styles.overdue]}>
            {overdue ? 'En retard · ' : ''}Échéance {new Date(facture.due_date).toLocaleDateString('fr-CH')}
          </Text>
          <View style={styles.projectPickerRow}>
            <ProjectPicker organizationId={facture.organization_id} selectedProject={linkedProject} onSelect={handleProjectChange} />
          </View>
          {!facture.client_email ? (
            <Text style={styles.copyLinkHint}>Ajoutez l'email du client pour générer un lien de consultation sécurisé.</Text>
          ) : facture.status === 'draft' ? (
            <Text style={styles.copyLinkHint}>
              Cliquez sur "Actions" ci-dessous puis "Finaliser" pour pouvoir copier le lien client ou l'envoyer par e-mail.
            </Text>
          ) : (
            <View style={styles.clientLinkRow}>
              <Button
                title={linkCopied ? 'Lien copié !' : 'Copier le lien client'}
                variant="secondary"
                icon={linkCopied ? 'check' : 'link'}
                onPress={handleCopyClientLink}
                style={styles.clientLinkButton}
              />
              <Button
                title={emailSent ? 'E-mail envoyé !' : 'Envoyer par e-mail'}
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
              L'envoi par e-mail est réservé à un plan supérieur — copiez le lien client ci-dessus, ou passez à un plan payant pour l'activer.
            </Text>
          ) : null}
        </Card>

        {paymentRef ? (
          <View style={styles.refCard}>
            <Feather name="hash" size={16} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.refLabel}>Référence de paiement</Text>
              <Text selectable style={styles.refValue}>
                {formatReferenceForDisplay(paymentRef.reference, paymentRef.type)}
              </Text>
              <Text style={styles.refHint}>Appui long pour copier</Text>
            </View>
          </View>
        ) : null}

        <Button
          title="Actions"
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
                    <Text style={styles.soonBadgeText}>Bientôt disponible</Text>
                  </View>
                ) : null}
              </Pressable>
            ))}
          </Card>
        ) : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Text style={styles.sectionTitle}>Lignes</Text>
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
              <Text style={styles.meta}>Sous-total</Text>
              <Text style={styles.meta}>CHF {subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.meta}>TVA ({facture.vat_rate}%)</Text>
              <Text style={styles.meta}>CHF {vat.toFixed(2)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total TTC</Text>
              <Text style={styles.totalLabel}>CHF {total.toFixed(2)}</Text>
            </View>
          </View>
        </Card>

        {payments.length || facture.status === 'sent' || facture.status === 'partial' ? (
          <>
            <Text style={styles.sectionTitle}>Paiements</Text>
            <Card>
              <View style={styles.totalRow}>
                <Text style={styles.meta}>Payé</Text>
                <Text style={styles.meta}>CHF {totalPaid.toFixed(2)}</Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Reste dû</Text>
                <Text style={styles.totalLabel}>CHF {remaining.toFixed(2)}</Text>
              </View>
              {payments.length ? (
                <View style={styles.totalsBlock}>
                  {payments.map((p) => (
                    <View key={p.id} style={styles.paymentRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.itemDesc}>CHF {Number(p.amount).toFixed(2)}</Text>
                        <Text style={styles.meta}>{new Date(p.paid_at).toLocaleDateString('fr-CH')}</Text>
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
            <Text style={styles.modalTitle}>Enregistrer un paiement</Text>
            <Text style={styles.meta}>Montant reçu et date de réception. Un paiement partiel réduit simplement le solde restant dû.</Text>
            <Field label="Montant (CHF)" value={paymentAmount} onChangeText={setPaymentAmount} keyboardType="decimal-pad" />
            <Field label="Date (JJ.MM.AAAA)" value={paymentDate} onChangeText={setPaymentDate} />
            {paymentError ? <Text style={styles.error}>{paymentError}</Text> : null}
            <View style={styles.modalActions}>
              <Button title="Annuler" variant="secondary" onPress={() => setPaymentModalVisible(false)} style={{ flex: 1 }} />
              <Button title="Confirmer" onPress={handleRecordPayment} loading={busy} style={{ flex: 1 }} />
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={depositModalVisible} transparent animationType="fade" onRequestClose={() => setDepositModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Facturer un acompte</Text>
            <Text style={styles.meta}>Pourcentage du montant total du devis à facturer maintenant.</Text>
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
            <Field label="Pourcentage (%)" value={depositPercent} onChangeText={setDepositPercent} keyboardType="decimal-pad" />
            {depositError ? <Text style={styles.error}>{depositError}</Text> : null}
            <View style={styles.modalActions}>
              <Button title="Annuler" variant="secondary" onPress={() => setDepositModalVisible(false)} style={{ flex: 1 }} />
              <Button title="Créer la facture" onPress={handleCreateDeposit} loading={busy} style={{ flex: 1 }} />
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={emailModalVisible} transparent animationType="fade" onRequestClose={() => setEmailModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Envoyer par e-mail</Text>
            <Text style={styles.meta}>
              Modifiable pour cet envoi uniquement — le message par défaut se règle dans Compte → E-mails.
            </Text>
            <Field
              label="Message"
              value={emailMessage}
              onChangeText={setEmailMessage}
              multiline
              numberOfLines={4}
              style={{ minHeight: 90, textAlignVertical: 'top', paddingTop: spacing.sm }}
            />
            <Text style={styles.lockedNoticeText}>
              Le PDF joint et le lien sécurisé « Consulter cette facture en ligne » sont toujours ajoutés automatiquement à
              la suite — non modifiables.
            </Text>
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <View style={styles.modalActions}>
              <Button title="Annuler" variant="secondary" onPress={() => setEmailModalVisible(false)} style={{ flex: 1 }} />
              <Button title="Envoyer" onPress={handleSendEmail} loading={sendingEmail} style={{ flex: 1 }} />
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
