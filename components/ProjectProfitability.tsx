import { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../lib/auth-context';
import { supabase } from '../lib/supabase';
import { listProjectExpenses, createProjectExpense, deleteProjectExpense } from '../lib/api/expenses';
import { Button, Card, EmptyState, Field } from './ui';
import { getAppLocale, useTranslation } from '../lib/translations';
import { colors, fontSize, radius, spacing } from '../lib/theme';
import type { Plan, ProjectExpense } from '../lib/types';

const HOURS_PER_DAY = 8;

function chf(n: number): string {
  return `CHF ${n.toLocaleString(`${getAppLocale()}-CH`, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

// Business days (Mon–Fri) in [start, end], inclusive — a simple stand-in
// for real worked hours since the app doesn't have separate time-clock
// entries: it reuses whatever's already in the Planning module instead of
// asking the team to log hours twice.
function businessDays(startIso: string, endIso: string): number {
  const start = new Date(startIso);
  const end = new Date(endIso);
  let count = 0;
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const day = d.getDay();
    if (day !== 0 && day !== 6) count++;
  }
  return count;
}

export function ProjectProfitability({ projectId, organizationId }: { projectId: string; organizationId: string }) {
  const { t } = useTranslation();
  const { user, organization } = useAuth();
  const router = useRouter();
  const [expenses, setExpenses] = useState<ProjectExpense[]>([]);
  const [devisedTotal, setDevisedTotal] = useState(0);
  const [extraWorksTotal, setExtraWorksTotal] = useState(0);
  const [laborDays, setLaborDays] = useState(0);
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [label, setLabel] = useState('');
  const [amount, setAmount] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [expensesList, { data: devisList }, { data: extraWorksList }, { data: assignments }, { data: planRow }] = await Promise.all([
      listProjectExpenses(projectId),
      supabase.from('devis').select('id').eq('project_id', projectId).eq('status', 'accepted'),
      supabase.from('extra_works').select('id').eq('project_id', projectId).eq('status', 'accepted'),
      supabase.from('planning_assignments').select('starts_on, ends_on').eq('project_id', projectId),
      organization ? supabase.from('plans').select('*').eq('id', organization.plan_id).single() : Promise.resolve({ data: null }),
    ]);
    setExpenses(expensesList);
    setPlan(planRow ?? null);

    const devisIds = (devisList ?? []).map((d) => d.id);
    if (devisIds.length) {
      const { data: items } = await supabase.from('devis_items').select('devis_id, quantity, unit_price').in('devis_id', devisIds);
      setDevisedTotal((items ?? []).reduce((sum, it) => sum + Number(it.quantity) * Number(it.unit_price), 0));
    } else {
      setDevisedTotal(0);
    }

    const extraWorkIds = (extraWorksList ?? []).map((w) => w.id);
    if (extraWorkIds.length) {
      const { data: items } = await supabase.from('extra_work_items').select('extra_work_id, quantity, unit_price').in('extra_work_id', extraWorkIds);
      setExtraWorksTotal((items ?? []).reduce((sum, it) => sum + Number(it.quantity) * Number(it.unit_price), 0));
    } else {
      setExtraWorksTotal(0);
    }

    setLaborDays((assignments ?? []).reduce((sum, a) => sum + businessDays(a.starts_on, a.ends_on), 0));
    setLoading(false);
  }, [projectId, organization]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const hourlyCost = organization?.hourly_cost ?? 0;
  const materialCost = useMemo(() => expenses.reduce((sum, e) => sum + Number(e.amount), 0), [expenses]);
  const laborCost = laborDays * HOURS_PER_DAY * hourlyCost;
  const totalCost = materialCost + laborCost;
  const totalRevenue = devisedTotal + extraWorksTotal;
  const margin = totalRevenue - totalCost;
  const marginPct = totalRevenue > 0 ? (margin / totalRevenue) * 100 : null;

  const tone =
    marginPct === null
      ? { fg: colors.textMuted, bg: colors.surfaceAlt, label: t('projectProfitability.toneWaiting') }
      : marginPct < 0
        ? { fg: colors.danger, bg: colors.dangerSoft, label: t('projectProfitability.toneLoss') }
        : marginPct < 15
          ? { fg: colors.warning, bg: colors.warningSoft, label: t('projectProfitability.toneTight') }
          : { fg: colors.success, bg: colors.successSoft, label: t('projectProfitability.toneProfitable') };

  async function handleAddExpense() {
    if (!label.trim() || !amount.trim()) return;
    setSaving(true);
    const { error } = await createProjectExpense(organizationId, projectId, label.trim(), Number(amount) || 0, user?.id ?? null);
    setSaving(false);
    if (!error) {
      setLabel('');
      setAmount('');
      setAddOpen(false);
      load();
    }
  }

  async function handleDelete(id: string) {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    await deleteProjectExpense(id);
  }

  if (loading) return null;

  if (plan && !plan.has_profitability) {
    return (
      <Card style={styles.upsell}>
        <Feather name="trending-up" size={22} color={colors.accent} />
        <Text style={styles.upsellTitle}>{t('projectProfitability.upsellTitle')}</Text>
        <Text style={styles.upsellText}>{t('projectProfitability.upsellText')}</Text>
        <Text style={styles.upsellText}>{t('projectProfitability.upsellPlanHint')}</Text>
        <Button
          title={t('projectProfitability.seePlans')}
          variant="secondary"
          icon="arrow-right"
          onPress={() => router.push('/(app)/compte')}
          style={{ marginTop: spacing.md }}
        />
      </Card>
    );
  }

  return (
    <View style={{ gap: spacing.lg }}>
      {hourlyCost === 0 ? (
        <Card style={styles.noticeCard}>
          <Feather name="info" size={16} color={colors.accent} />
          <Text style={styles.noticeText}>{t('projectProfitability.hourlyCostNotice')}</Text>
        </Card>
      ) : null}

      <Card style={[styles.summaryCard, { borderColor: tone.fg }]}>
        <View style={[styles.toneBadge, { backgroundColor: tone.bg }]}>
          <Text style={[styles.toneBadgeText, { color: tone.fg }]}>{tone.label}</Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>{t('projectProfitability.devised')}</Text>
          <Text style={styles.summaryValue}>{chf(devisedTotal)}</Text>
        </View>
        {extraWorksTotal > 0 ? (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t('projectProfitability.extraWorks')}</Text>
            <Text style={styles.summaryValue}>{chf(extraWorksTotal)}</Text>
          </View>
        ) : null}
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>{t('projectProfitability.materialCost')}</Text>
          <Text style={styles.summaryValueMuted}>− {chf(materialCost)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>
            {t('projectProfitability.laborCost', { days: laborDays, hours: HOURS_PER_DAY, rate: chf(hourlyCost) })}
          </Text>
          <Text style={styles.summaryValueMuted}>− {chf(laborCost)}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryRow}>
          <Text style={styles.marginLabel}>{t('projectProfitability.margin')}</Text>
          <Text style={[styles.marginValue, { color: tone.fg }]}>
            {chf(margin)}
            {marginPct !== null ? ` (${marginPct.toFixed(0)}%)` : ''}
          </Text>
        </View>
      </Card>

      <View>
        <View style={styles.expensesHeader}>
          <Text style={styles.sectionTitle}>{t('projectProfitability.expensesTitle')}</Text>
          <Pressable onPress={() => setAddOpen((v) => !v)} style={styles.addButton} hitSlop={8}>
            <Feather name={addOpen ? 'x' : 'plus'} size={16} color={colors.primary} />
            <Text style={styles.addButtonText}>{addOpen ? t('projectProfitability.cancel') : t('projectProfitability.addExpense')}</Text>
          </Pressable>
        </View>

        {addOpen ? (
          <Card style={styles.addCard}>
            <Field label={t('projectProfitability.descriptionLabel')} value={label} onChangeText={setLabel} placeholder={t('projectProfitability.descriptionPlaceholder')} />
            <Field label={t('projectProfitability.amountLabel')} value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholder="0" />
            <Button title={t('projectProfitability.save')} icon="check" onPress={handleAddExpense} loading={saving} style={{ marginTop: spacing.sm }} />
          </Card>
        ) : null}

        {expenses.length === 0 ? (
          <EmptyState title={t('projectProfitability.emptyTitle')} subtitle={t('projectProfitability.emptySubtitle')} />
        ) : (
          <View style={{ gap: spacing.sm }}>
            {expenses.map((e) => (
              <Card key={e.id} style={styles.expenseRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.expenseLabel} numberOfLines={1}>{e.label}</Text>
                  <Text style={styles.expenseDate}>{new Date(e.created_at).toLocaleDateString(`${getAppLocale()}-CH`)}</Text>
                </View>
                <Text style={styles.expenseAmount}>{chf(Number(e.amount))}</Text>
                <Pressable onPress={() => handleDelete(e.id)} hitSlop={8} style={styles.deleteButton}>
                  <Feather name="trash-2" size={15} color={colors.danger} />
                </Pressable>
              </Card>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  upsell: {
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  upsellTitle: {
    fontSize: fontSize.lg,
    fontWeight: '800',
    color: colors.text,
    marginTop: spacing.sm,
  },
  upsellText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    lineHeight: 20,
  },
  noticeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.accentSoft,
    borderColor: colors.accent,
  },
  noticeText: {
    flex: 1,
    fontSize: fontSize.xs,
    color: colors.text,
    lineHeight: 17,
  },
  summaryCard: {
    borderWidth: 1.5,
    gap: spacing.sm,
  },
  toneBadge: {
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    marginBottom: spacing.xs,
  },
  toneBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: '800',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
  },
  summaryLabel: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    flexShrink: 1,
  },
  summaryValue: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  summaryValueMuted: {
    fontSize: fontSize.sm,
    color: colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xs,
  },
  marginLabel: {
    fontSize: fontSize.md,
    fontWeight: '800',
    color: colors.text,
  },
  marginValue: {
    fontSize: fontSize.lg,
    fontWeight: '800',
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  expensesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addButtonText: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.primary,
  },
  addCard: {
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  expenseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  expenseLabel: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
  },
  expenseDate: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  expenseAmount: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
  },
  deleteButton: {
    padding: 4,
  },
});
