import { useCallback, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../../../lib/auth-context';
import {
  listBankRules,
  createBankRule,
  setBankRuleActive,
  deleteBankRule,
  type BankRule,
} from '../../../../lib/api/bank';
import { listAccounts, listVatCodes, type AccountingAccount, type VatCode } from '../../../../lib/api/accounting';
import { listAssignableProjects } from '../../../../lib/api/subcontractors';
import { Button, Card, EmptyState, LoadingScreen, PageHeader, Screen } from '../../../../components/ui';
import { useTranslation } from '../../../../lib/translations';
import { colors, fontSize, radius, spacing } from '../../../../lib/theme';

const MATCH_FIELDS: BankRule['matchField'][] = ['counterparty_name', 'remittance_info', 'counterparty_iban'];

export default function BankRulesScreen() {
  const { t } = useTranslation();
  const { organization, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [rules, setRules] = useState<BankRule[]>([]);
  const [accounts, setAccounts] = useState<AccountingAccount[]>([]);
  const [vatCodes, setVatCodes] = useState<VatCode[]>([]);
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);

  const [formOpen, setFormOpen] = useState(false);
  const [name, setName] = useState('');
  const [matchField, setMatchField] = useState<BankRule['matchField']>('counterparty_name');
  const [matchPattern, setMatchPattern] = useState('');
  const [proposedAccountId, setProposedAccountId] = useState<string | null>(null);
  const [proposedVatCode, setProposedVatCode] = useState<string | null>(null);
  const [proposedProjectId, setProposedProjectId] = useState<string | null>(null);
  const [proposedTiers, setProposedTiers] = useState('');
  const [proposedLabel, setProposedLabel] = useState('');
  const [autoPost, setAutoPost] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [accountPickerOpen, setAccountPickerOpen] = useState(false);
  const [vatPickerOpen, setVatPickerOpen] = useState(false);
  const [projectPickerOpen, setProjectPickerOpen] = useState(false);

  const load = useCallback(async () => {
    if (!organization) return;
    setLoading(true);
    const [ruleRows, accountRows, vatRows, projectRows] = await Promise.all([
      listBankRules(organization.id),
      listAccounts(organization.id),
      listVatCodes(organization.id),
      listAssignableProjects(organization.id, []),
    ]);
    setRules(ruleRows);
    setAccounts(accountRows.filter((a) => a.type === 'charge'));
    setVatCodes(vatRows.filter((c) => c.category.startsWith('achat')));
    setProjects(projectRows);
    setLoading(false);
  }, [organization]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  function resetForm() {
    setName('');
    setMatchField('counterparty_name');
    setMatchPattern('');
    setProposedAccountId(null);
    setProposedVatCode(null);
    setProposedProjectId(null);
    setProposedTiers('');
    setProposedLabel('');
    setAutoPost(false);
    setError(null);
  }

  async function handleCreate() {
    if (!organization || !name.trim() || !matchPattern.trim()) return;
    setSaving(true);
    setError(null);
    const { error: err } = await createBankRule(
      organization.id,
      {
        name,
        matchField,
        matchPattern,
        proposedAccountId,
        proposedVatCode,
        proposedProjectId,
        proposedTiers: proposedTiers || null,
        proposedLabel: proposedLabel || null,
        autoPost,
      },
      user?.id,
    );
    setSaving(false);
    if (err) {
      setError(err);
      return;
    }
    setFormOpen(false);
    resetForm();
    load();
  }

  async function handleToggleActive(rule: BankRule) {
    await setBankRuleActive(rule.id, !rule.isActive);
    load();
  }

  async function handleDelete(rule: BankRule) {
    await deleteBankRule(rule.id);
    load();
  }

  const selectedAccount = accounts.find((a) => a.id === proposedAccountId);
  const selectedProject = projects.find((p) => p.id === proposedProjectId);

  if (!organization) return <LoadingScreen />;

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: spacing.xl, paddingBottom: spacing.xxl * 2 }}>
        <PageHeader title={t('bankRules.title')} backTo="/(app)/devis/factures/import-releve" />
        <Text style={styles.pageSubtitle}>{t('bankRules.subtitle')}</Text>

        {loading ? (
          <LoadingScreen />
        ) : (
          <View style={{ gap: spacing.md }}>
            {!formOpen ? (
              <Button title={t('bankRules.newRule')} icon="plus" onPress={() => { resetForm(); setFormOpen(true); }} />
            ) : (
              <Card style={{ gap: spacing.md }}>
                <Text style={styles.sectionTitle}>{t('bankRules.newRule')}</Text>
                <TextInput style={styles.input} placeholder={t('bankRules.namePlaceholder')} value={name} onChangeText={setName} placeholderTextColor={colors.textMuted} />

                <Text style={styles.fieldLabel}>{t('bankRules.matchFieldLabel')}</Text>
                <View style={styles.chips}>
                  {MATCH_FIELDS.map((f) => (
                    <Pressable key={f} onPress={() => setMatchField(f)} style={[styles.chip, matchField === f && styles.chipActive]}>
                      <Text style={[styles.chipText, matchField === f && styles.chipTextActive]}>{t(`bankRules.matchField_${f}` as any)}</Text>
                    </Pressable>
                  ))}
                </View>
                <TextInput style={styles.input} placeholder={t('bankRules.patternPlaceholder')} value={matchPattern} onChangeText={setMatchPattern} placeholderTextColor={colors.textMuted} />

                <Text style={styles.fieldLabel}>{t('bankRules.proposedAccount')}</Text>
                <Pressable style={styles.selectTrigger} onPress={() => setAccountPickerOpen(true)}>
                  <Text style={styles.selectTriggerText}>{selectedAccount ? `${selectedAccount.code} — ${selectedAccount.label}` : t('bankRules.pickAccountHint')}</Text>
                  <Feather name="chevron-right" size={16} color={colors.textMuted} />
                </Pressable>

                <Text style={styles.fieldLabel}>{t('bankRules.proposedVatCode')}</Text>
                <Pressable style={styles.selectTrigger} onPress={() => setVatPickerOpen(true)}>
                  <Text style={styles.selectTriggerText}>{proposedVatCode ?? t('bankRules.pickVatHint')}</Text>
                  <Feather name="chevron-right" size={16} color={colors.textMuted} />
                </Pressable>

                <Text style={styles.fieldLabel}>{t('bankRules.proposedProject')}</Text>
                <Pressable style={styles.selectTrigger} onPress={() => setProjectPickerOpen(true)}>
                  <Text style={styles.selectTriggerText}>{selectedProject?.name ?? t('bankRules.pickProjectHint')}</Text>
                  <Feather name="chevron-right" size={16} color={colors.textMuted} />
                </Pressable>

                <TextInput style={styles.input} placeholder={t('bankRules.tiersPlaceholder')} value={proposedTiers} onChangeText={setProposedTiers} placeholderTextColor={colors.textMuted} />
                <TextInput style={styles.input} placeholder={t('bankRules.labelPlaceholder')} value={proposedLabel} onChangeText={setProposedLabel} placeholderTextColor={colors.textMuted} />

                <View style={styles.autoPostRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldLabel}>{t('bankRules.autoPost')}</Text>
                    <Text style={styles.autoPostHint}>{t('bankRules.autoPostHint')}</Text>
                  </View>
                  <Switch value={autoPost} onValueChange={setAutoPost} trackColor={{ true: colors.primary }} />
                </View>

                {error ? <Text style={styles.error}>{error}</Text> : null}
                <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                  <Button title={t('bankRules.cancel')} variant="secondary" onPress={() => setFormOpen(false)} style={{ flex: 1 }} />
                  <Button title={t('bankRules.save')} onPress={handleCreate} loading={saving} disabled={!name.trim() || !matchPattern.trim()} style={{ flex: 1 }} />
                </View>
              </Card>
            )}

            {rules.length === 0 ? (
              <Card><EmptyState title={t('bankRules.emptyTitle')} subtitle={t('bankRules.emptySubtitle')} /></Card>
            ) : (
              rules.map((rule) => (
                <Card key={rule.id} style={[styles.ruleCard, !rule.isActive && { opacity: 0.5 }]}>
                  <View style={{ flex: 1 }}>
                    <View style={styles.ruleTitleRow}>
                      <Text style={styles.ruleName}>{rule.name}</Text>
                      {rule.autoPost ? (
                        <View style={styles.autoPostBadge}><Text style={styles.autoPostBadgeText}>{t('bankRules.autoPostBadge')}</Text></View>
                      ) : null}
                    </View>
                    <Text style={styles.ruleMeta}>{t(`bankRules.matchField_${rule.matchField}` as any)} · « {rule.matchPattern} »</Text>
                    {rule.proposedTiers ? <Text style={styles.ruleMeta}>{t('bankRules.tiersLabel')}: {rule.proposedTiers}</Text> : null}
                  </View>
                  <Pressable onPress={() => handleToggleActive(rule)} hitSlop={8} style={{ padding: spacing.xs }}>
                    <Feather name={rule.isActive ? 'toggle-right' : 'toggle-left'} size={22} color={rule.isActive ? colors.success : colors.textMuted} />
                  </Pressable>
                  <Pressable onPress={() => handleDelete(rule)} hitSlop={8} style={{ padding: spacing.xs }}>
                    <Feather name="trash-2" size={18} color={colors.danger} />
                  </Pressable>
                </Card>
              ))
            )}
          </View>
        )}
      </ScrollView>

      <Modal visible={accountPickerOpen} transparent animationType="fade" onRequestClose={() => setAccountPickerOpen(false)}>
        <View style={styles.backdrop}>
          <View style={styles.pickerCard}>
            <Text style={styles.sheetTitle}>{t('bankRules.pickAccountHint')}</Text>
            <ScrollView style={{ maxHeight: 380 }}>
              {accounts.map((a) => (
                <Pressable key={a.id} style={styles.pickerRow} onPress={() => { setProposedAccountId(a.id); setAccountPickerOpen(false); }}>
                  <Text style={styles.pickerRowText}>{a.code} — {a.label}</Text>
                </Pressable>
              ))}
            </ScrollView>
            <Button title={t('bankRules.cancel')} variant="secondary" onPress={() => setAccountPickerOpen(false)} style={{ marginTop: spacing.sm }} />
          </View>
        </View>
      </Modal>

      <Modal visible={vatPickerOpen} transparent animationType="fade" onRequestClose={() => setVatPickerOpen(false)}>
        <View style={styles.backdrop}>
          <View style={styles.pickerCard}>
            <Text style={styles.sheetTitle}>{t('bankRules.pickVatHint')}</Text>
            <ScrollView style={{ maxHeight: 380 }}>
              {vatCodes.map((c) => (
                <Pressable key={c.id} style={styles.pickerRow} onPress={() => { setProposedVatCode(c.code); setVatPickerOpen(false); }}>
                  <Text style={styles.pickerRowText}>{c.code} — {c.label} ({c.rate}%)</Text>
                </Pressable>
              ))}
            </ScrollView>
            <Button title={t('bankRules.cancel')} variant="secondary" onPress={() => setVatPickerOpen(false)} style={{ marginTop: spacing.sm }} />
          </View>
        </View>
      </Modal>

      <Modal visible={projectPickerOpen} transparent animationType="fade" onRequestClose={() => setProjectPickerOpen(false)}>
        <View style={styles.backdrop}>
          <View style={styles.pickerCard}>
            <Text style={styles.sheetTitle}>{t('bankRules.pickProjectHint')}</Text>
            <ScrollView style={{ maxHeight: 380 }}>
              {projects.map((p) => (
                <Pressable key={p.id} style={styles.pickerRow} onPress={() => { setProposedProjectId(p.id); setProjectPickerOpen(false); }}>
                  <Text style={styles.pickerRowText}>{p.name}</Text>
                </Pressable>
              ))}
            </ScrollView>
            <Button title={t('bankRules.cancel')} variant="secondary" onPress={() => setProjectPickerOpen(false)} style={{ marginTop: spacing.sm }} />
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  pageSubtitle: { fontSize: fontSize.sm, color: colors.textMuted, lineHeight: 19, marginBottom: spacing.lg },
  sectionTitle: { fontSize: fontSize.md, fontWeight: '800', color: colors.text },
  fieldLabel: { fontSize: fontSize.xs, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.4 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSize.sm,
    color: colors.text,
  },
  chips: { flexDirection: 'row', gap: spacing.xs, flexWrap: 'wrap' },
  chip: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: fontSize.xs, fontWeight: '600', color: colors.text },
  chipTextActive: { color: '#fff' },
  selectTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  selectTriggerText: { fontSize: fontSize.sm, color: colors.text, flex: 1 },
  autoPostRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.warningSoft, borderRadius: radius.md, padding: spacing.md },
  autoPostHint: { fontSize: fontSize.xs, color: colors.warning, marginTop: 2, lineHeight: 16 },
  error: { fontSize: fontSize.sm, color: colors.danger },
  ruleCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  ruleTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  ruleName: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text },
  ruleMeta: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
  autoPostBadge: { backgroundColor: colors.warningSoft, borderRadius: radius.pill, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  autoPostBadgeText: { fontSize: 10, fontWeight: '700', color: colors.warning },
  backdrop: { flex: 1, backgroundColor: 'rgba(15, 20, 18, 0.5)', alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  pickerCard: { width: '100%', maxWidth: 420, maxHeight: '80%', backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.xl },
  pickerRow: { paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  pickerRowText: { fontSize: fontSize.sm, color: colors.text },
  sheetTitle: { fontSize: fontSize.xl, fontWeight: '800', color: colors.text, marginBottom: spacing.lg },
});
