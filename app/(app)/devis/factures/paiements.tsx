import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../../../lib/auth-context';
import {
  listPayableSubcontractorInvoices,
  listPayableExpenseReimbursements,
  setSubcontractorIban,
  setEmployeeIban,
  createPaymentBatch,
  listPaymentBatches,
  markPaymentBatchPaid,
  isValidIban,
  type PayableItem,
  type PaymentBatch,
} from '../../../../lib/api/payments';
import { downloadTextFile } from '../../../../lib/downloadFile';
import { Button, Card, EmptyState, LoadingScreen, PageHeader, Screen } from '../../../../components/ui';
import { getAppLocale, useTranslation } from '../../../../lib/translations';
import { colors, fontSize, radius, spacing } from '../../../../lib/theme';

type Kind = 'fournisseur' | 'remboursement';

function today(): string {
  return new Date().toISOString().slice(0, 10);
}
function inDays(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}
function chf(n: number): string {
  return `CHF ${n.toLocaleString(`${getAppLocale()}-CH`, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function PaymentsScreen() {
  const { t } = useTranslation();
  const { organization, user } = useAuth();
  const [kind, setKind] = useState<Kind>('fournisseur');
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<PayableItem[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [executionDate, setExecutionDate] = useState(inDays(2));
  const [batches, setBatches] = useState<PaymentBatch[]>([]);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ibanDrafts, setIbanDrafts] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    if (!organization) return;
    setLoading(true);
    const [payable, batchRows] = await Promise.all([
      kind === 'fournisseur' ? listPayableSubcontractorInvoices(organization.id) : listPayableExpenseReimbursements(organization.id),
      listPaymentBatches(organization.id),
    ]);
    setItems(payable);
    setBatches(batchRows.filter((b) => b.kind === kind));
    setSelected(new Set());
    setLoading(false);
  }, [organization, kind]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleSaveIban(item: PayableItem) {
    const iban = ibanDrafts[item.sourceId];
    if (!iban || !organization) return;
    if (item.sourceType === 'subcontractor_invoice') {
      await setSubcontractorIban(organization.id, item.sourceId, iban);
    } else if (item.employeeUserId) {
      await setEmployeeIban(organization.id, item.employeeUserId, iban);
    }
    load();
  }

  const total = items.filter((i) => selected.has(i.sourceId)).reduce((s, i) => s + i.amount, 0);

  async function handleGenerate() {
    if (!organization) return;
    const toSend = items.filter((i) => selected.has(i.sourceId));
    if (!toSend.length) return;
    setGenerating(true);
    setError(null);
    const { xml, error: err } = await createPaymentBatch(organization.id, kind, executionDate, organization.name, organization.iban ?? '', toSend, user?.id);
    setGenerating(false);
    if (err || !xml) {
      setError(err);
      return;
    }
    downloadTextFile(`pain001-${kind}-${executionDate}.xml`, xml, 'application/xml');
    load();
  }

  async function handleMarkPaid(batchId: string) {
    await markPaymentBatchPaid(batchId);
    load();
  }

  if (!organization) return <LoadingScreen />;

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: spacing.xl, paddingBottom: spacing.xxl * 2 }}>
        <PageHeader title={t('payments.title')} backTo="/(app)/devis/factures" />
        <Text style={styles.pageSubtitle}>{t('payments.subtitle')}</Text>

        <View style={styles.tabRow}>
          {(['fournisseur', 'remboursement'] as Kind[]).map((k) => (
            <Pressable key={k} onPress={() => setKind(k)} style={[styles.tabChip, kind === k && styles.tabChipActive]}>
              <Text style={[styles.tabChipText, kind === k && styles.tabChipTextActive]}>{t(`payments.kind_${k}` as any)}</Text>
            </Pressable>
          ))}
        </View>

        {loading ? (
          <LoadingScreen />
        ) : (
          <View style={{ gap: spacing.md, marginTop: spacing.lg }}>
            {items.length === 0 ? (
              <Card><EmptyState title={t('payments.emptyTitle')} subtitle={t('payments.emptySubtitle')} /></Card>
            ) : (
              <>
                {items.map((item) => (
                  <Card key={item.sourceId} style={styles.itemCard}>
                    <Pressable onPress={() => item.ibanValid && toggle(item.sourceId)} style={[styles.checkbox, selected.has(item.sourceId) && styles.checkboxOn, !item.ibanValid && styles.checkboxDisabled]}>
                      {selected.has(item.sourceId) ? <Feather name="check" size={13} color="#fff" /> : null}
                    </Pressable>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.itemName}>{item.creditorName}</Text>
                      <Text style={styles.itemMeta}>{item.remittanceInfo}</Text>
                      {!item.ibanValid ? (
                        <View style={styles.ibanRow}>
                          <Feather name="alert-triangle" size={12} color={colors.danger} />
                          <Text style={styles.ibanWarning}>{t('payments.noIban')}</Text>
                          <TextInput
                            style={styles.ibanInput}
                            placeholder="CH00 0000 0000 0000 0000 0"
                            value={ibanDrafts[item.sourceId] ?? ''}
                            onChangeText={(v) => setIbanDrafts((prev) => ({ ...prev, [item.sourceId]: v }))}
                            placeholderTextColor={colors.textMuted}
                          />
                          <Pressable onPress={() => handleSaveIban(item)} hitSlop={8}>
                            <Feather name="save" size={16} color={colors.primary} />
                          </Pressable>
                        </View>
                      ) : null}
                    </View>
                    <Text style={styles.itemAmount}>{chf(item.amount)}</Text>
                  </Card>
                ))}

                <View style={styles.dateRow}>
                  <Text style={styles.fieldLabel}>{t('payments.executionDate')}</Text>
                  <TextInput style={styles.dateInput} value={executionDate} onChangeText={setExecutionDate} placeholder="YYYY-MM-DD" />
                </View>

                {error ? <Text style={styles.error}>{error}</Text> : null}
                <Card style={styles.totalCard}>
                  <Text style={styles.totalLabel}>{t('payments.selectedTotal', { count: selected.size })}</Text>
                  <Text style={styles.totalValue}>{chf(total)}</Text>
                </Card>
                <Button title={t('payments.generate')} icon="file-text" onPress={handleGenerate} loading={generating} disabled={selected.size === 0} />
                <Text style={styles.disclaimer}>{t('payments.disclaimer')}</Text>
              </>
            )}

            {batches.length > 0 ? (
              <>
                <Text style={styles.sectionTitle}>{t('payments.historyTitle')}</Text>
                {batches.map((b) => (
                  <Card key={b.id} style={styles.batchRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.itemMeta}>{t('payments.batchDate', { date: b.executionDate })}</Text>
                      <View style={[styles.statusBadge, b.status === 'paye' && styles.statusBadgePaid]}>
                        <Text style={[styles.statusBadgeText, b.status === 'paye' && styles.statusBadgeTextPaid]}>{t(`payments.status_${b.status}` as any)}</Text>
                      </View>
                    </View>
                    <Text style={styles.itemAmount}>{chf(b.controlSum)}</Text>
                    {b.status === 'prepare' ? (
                      <Button title={t('payments.markPaid')} variant="secondary" onPress={() => handleMarkPaid(b.id)} />
                    ) : null}
                  </Card>
                ))}
              </>
            ) : null}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  pageSubtitle: { fontSize: fontSize.sm, color: colors.textMuted, lineHeight: 19, marginBottom: spacing.lg },
  tabRow: { flexDirection: 'row', gap: spacing.sm },
  tabChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border },
  tabChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  tabChipText: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text },
  tabChipTextActive: { color: '#fff' },
  itemCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  checkbox: { width: 22, height: 22, borderRadius: radius.sm, borderWidth: 1.5, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  checkboxOn: { backgroundColor: colors.success, borderColor: colors.success },
  checkboxDisabled: { opacity: 0.3 },
  itemName: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text },
  itemMeta: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
  itemAmount: { fontSize: fontSize.md, fontWeight: '800', color: colors.text, fontVariant: ['tabular-nums'] },
  ibanRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.xs },
  ibanWarning: { fontSize: fontSize.xs, color: colors.danger, fontWeight: '600' },
  ibanInput: { flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, paddingHorizontal: spacing.sm, paddingVertical: 4, fontSize: fontSize.xs, color: colors.text },
  dateRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  fieldLabel: { fontSize: fontSize.xs, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.4 },
  dateInput: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, fontSize: fontSize.sm, color: colors.text, width: 140, textAlign: 'right' },
  error: { fontSize: fontSize.sm, color: colors.danger },
  totalCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  totalLabel: { fontSize: fontSize.sm, fontWeight: '700', color: colors.textMuted },
  totalValue: { fontSize: fontSize.lg, fontWeight: '800', color: colors.text, fontVariant: ['tabular-nums'] },
  disclaimer: { fontSize: fontSize.xs, color: colors.textMuted, lineHeight: 16 },
  sectionTitle: { fontSize: fontSize.sm, fontWeight: '700', color: colors.textMuted, marginTop: spacing.md },
  batchRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  statusBadge: { alignSelf: 'flex-start', backgroundColor: colors.warningSoft, borderRadius: radius.pill, paddingHorizontal: spacing.sm, paddingVertical: 2, marginTop: 4 },
  statusBadgePaid: { backgroundColor: colors.successSoft },
  statusBadgeText: { fontSize: 10, fontWeight: '700', color: colors.warning },
  statusBadgeTextPaid: { color: colors.success },
});
