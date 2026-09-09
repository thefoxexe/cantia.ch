import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../../lib/auth-context';
import { supabase } from '../../../lib/supabase';
import { listOrganizationProjectExpenses } from '../../../lib/api/expenses';
import { listExpenses } from '../../../lib/api/treasury';
import { Button, Card, EmptyState, LoadingScreen, PageHeader, Screen } from '../../../components/ui';
import { getAppLocale, useTranslation } from '../../../lib/translations';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';
import type { Plan } from '../../../lib/types';

type Period = 'all' | 'month' | '30d';

interface UnifiedExpense {
  id: string;
  label: string;
  amount: number;
  date: string;
  projectId: string | null;
  projectName: string | null;
}

function chf(n: number): string {
  return `CHF ${n.toLocaleString(`${getAppLocale()}-CH`, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

function startOfMonthIso(): string {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
}

// A single, org-wide read view over the two expense sources that already
// exist: chantier-linked purchases (project_expenses, fed by each chantier's
// own Rentabilité tab) and general/overhead spend (Trésorerie's Dépenses
// ponctuelles). Nothing is created from here — this only answers "what did
// we spend, and where did it go", which neither source could answer alone.
export default function DepensesScreen() {
  const { t } = useTranslation();
  const { organization } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [chantierExpenses, setChantierExpenses] = useState<UnifiedExpense[]>([]);
  const [generalExpenses, setGeneralExpenses] = useState<UnifiedExpense[]>([]);
  const [period, setPeriod] = useState<Period>('month');
  const [projectFilter, setProjectFilter] = useState<'all' | 'general' | string>('all');

  const load = useCallback(async () => {
    if (!organization) return;
    setLoading(true);
    const { data: planRow } = organization.plan_id
      ? await supabase.from('plans').select('*').eq('id', organization.plan_id).single()
      : { data: null };
    setPlan((planRow as Plan) ?? null);

    const p = planRow as Plan | null;
    const [projectRows, generalRows] = await Promise.all([
      p?.has_profitability ? listOrganizationProjectExpenses(organization.id) : Promise.resolve([]),
      p?.has_treasury ? listExpenses(organization.id) : Promise.resolve([]),
    ]);
    setChantierExpenses(
      projectRows.map((e) => ({
        id: `p-${e.id}`,
        label: e.label,
        amount: Number(e.amount),
        date: e.created_at,
        projectId: e.project_id,
        projectName: e.projects?.name ?? null,
      })),
    );
    setGeneralExpenses(
      generalRows.map((e) => ({
        id: `g-${e.id}`,
        label: e.label,
        amount: Number(e.amount_chf),
        date: e.expense_date,
        projectId: null,
        projectName: null,
      })),
    );
    setLoading(false);
  }, [organization]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const all = useMemo(
    () => [...chantierExpenses, ...generalExpenses].sort((a, b) => (a.date < b.date ? 1 : -1)),
    [chantierExpenses, generalExpenses],
  );

  const projectOptions = useMemo(() => {
    const seen = new Map<string, string>();
    for (const e of chantierExpenses) {
      if (e.projectId && e.projectName && !seen.has(e.projectId)) seen.set(e.projectId, e.projectName);
    }
    return Array.from(seen.entries()).map(([id, name]) => ({ id, name }));
  }, [chantierExpenses]);

  const periodStart = period === 'month' ? startOfMonthIso() : period === '30d' ? isoDaysAgo(30) : null;
  const filtered = all.filter((e) => {
    if (periodStart && e.date.slice(0, 10) < periodStart) return false;
    if (projectFilter === 'general') return e.projectId === null;
    if (projectFilter !== 'all') return e.projectId === projectFilter;
    return true;
  });
  const total = filtered.reduce((sum, e) => sum + e.amount, 0);

  if (loading) return <LoadingScreen />;

  if (!plan?.has_profitability && !plan?.has_treasury) {
    return (
      <Screen style={{ padding: spacing.xl }}>
        <PageHeader title={t('depensesList.title')} backTo="/(app)" />
        <Card style={styles.upsell}>
          <Feather name="shopping-bag" size={22} color={colors.accent} />
          <Text style={styles.upsellTitle}>{t('depensesList.upsellTitle')}</Text>
          <Text style={styles.upsellText}>{t('depensesList.upsellText')}</Text>
          <Text style={styles.upsellText}>{t('depensesList.upsellPlanHint')}</Text>
          <Button title={t('depensesList.seePlans')} variant="secondary" icon="arrow-right" onPress={() => router.push('/(app)/compte')} style={{ marginTop: spacing.md }} />
        </Card>
      </Screen>
    );
  }

  return (
    <Screen style={{ padding: spacing.xl }}>
      <View style={styles.container}>
        <PageHeader title={t('depensesList.title')} backTo="/(app)" />
        <Text style={styles.pageSubtitle}>{t('depensesList.subtitle')}</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          {(['month', '30d', 'all'] as Period[]).map((p) => (
            <Pressable key={p} onPress={() => setPeriod(p)} style={[styles.chip, period === p && styles.chipActive]}>
              <Text style={[styles.chipText, period === p && styles.chipTextActive]}>{t(`depensesList.period_${p}`)}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {plan.has_profitability ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            <Pressable onPress={() => setProjectFilter('all')} style={[styles.chip, projectFilter === 'all' && styles.chipActive]}>
              <Text style={[styles.chipText, projectFilter === 'all' && styles.chipTextActive]}>{t('depensesList.filterAll')}</Text>
            </Pressable>
            {plan.has_treasury ? (
              <Pressable onPress={() => setProjectFilter('general')} style={[styles.chip, projectFilter === 'general' && styles.chipActive]}>
                <Text style={[styles.chipText, projectFilter === 'general' && styles.chipTextActive]}>{t('depensesList.filterGeneral')}</Text>
              </Pressable>
            ) : null}
            {projectOptions.map((p) => (
              <Pressable key={p.id} onPress={() => setProjectFilter(p.id)} style={[styles.chip, projectFilter === p.id && styles.chipActive]}>
                <Text style={[styles.chipText, projectFilter === p.id && styles.chipTextActive]} numberOfLines={1}>
                  {p.name}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        ) : null}

        <Card style={styles.totalCard}>
          <Text style={styles.totalLabel}>{t('depensesList.totalLabel')}</Text>
          <Text style={styles.totalValue}>{chf(total)}</Text>
          <Text style={styles.totalCount}>{t('depensesList.entryCount', { count: filtered.length })}</Text>
        </Card>

        {filtered.length === 0 ? (
          <EmptyState title={t('depensesList.emptyTitle')} subtitle={t('depensesList.emptySubtitle')} />
        ) : (
          <View style={{ gap: spacing.sm }}>
            {filtered.map((e) => {
              const row = (
                <Card style={styles.row}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowLabel} numberOfLines={1}>
                      {e.label || t('depensesList.noLabel')}
                    </Text>
                    <View style={styles.rowMeta}>
                      <View style={[styles.badge, e.projectId ? styles.badgeProject : styles.badgeGeneral]}>
                        <Text style={[styles.badgeText, e.projectId ? styles.badgeTextProject : styles.badgeTextGeneral]} numberOfLines={1}>
                          {e.projectName ?? t('depensesList.filterGeneral')}
                        </Text>
                      </View>
                      <Text style={styles.rowDate}>{new Date(e.date).toLocaleDateString(`${getAppLocale()}-CH`)}</Text>
                    </View>
                  </View>
                  <Text style={styles.rowAmount}>{chf(e.amount)}</Text>
                  {e.projectId ? <Feather name="chevron-right" size={16} color={colors.textMuted} /> : null}
                </Card>
              );
              return e.projectId ? (
                <Pressable key={e.id} onPress={() => router.push(`/(app)/chantiers/${e.projectId}/profitability` as any)}>
                  {row}
                </Pressable>
              ) : (
                <View key={e.id}>{row}</View>
              );
            })}
          </View>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  pageSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: -spacing.sm,
  },
  upsell: {
    alignItems: 'flex-start',
    gap: spacing.xs,
    marginTop: spacing.lg,
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
  chipRow: {
    gap: spacing.xs,
    paddingVertical: 2,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
  },
  chipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  chipText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    maxWidth: 180,
  },
  chipTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  totalCard: {
    gap: 2,
  },
  totalLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    fontWeight: '700',
  },
  totalValue: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.text,
  },
  totalCount: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  rowLabel: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
  },
  rowMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: 4,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
    maxWidth: 160,
  },
  badgeProject: {
    backgroundColor: colors.accentSoft,
  },
  badgeGeneral: {
    backgroundColor: colors.surfaceAlt,
  },
  badgeText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
  badgeTextProject: {
    color: colors.accent,
  },
  badgeTextGeneral: {
    color: colors.textMuted,
  },
  rowDate: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  rowAmount: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
  },
});
