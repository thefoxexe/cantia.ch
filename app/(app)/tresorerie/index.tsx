import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../../lib/auth-context';
import { supabase } from '../../../lib/supabase';
import { addCashSnapshot, buildForecast, listRecurringExpenses, upcomingRecurringCount } from '../../../lib/api/treasury';
import { Button, Card, EmptyState, LoadingScreen, PageHeader, Screen } from '../../../components/ui';
import { getAppLocale, useTranslation } from '../../../lib/translations';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';
import type { Plan, RecurringExpense, TreasuryForecast, TreasuryForecastItem, TreasuryItemKind } from '../../../lib/types';

type IconName = keyof typeof Feather.glyphMap;

const KIND_ICONS: Record<TreasuryItemKind, IconName> = {
  facture: 'file-text',
  salaire: 'users',
  'sous-traitant': 'briefcase',
  recurrente: 'repeat',
};

function isoToday(): string {
  return new Date().toISOString().slice(0, 10);
}

function addDaysIso(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function formatDateFr(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString(`${getAppLocale()}-CH`, { day: 'numeric', month: 'short', year: 'numeric' });
}

function daysUntil(iso: string): number {
  const today = new Date(`${isoToday()}T00:00:00Z`).getTime();
  const target = new Date(`${iso}T00:00:00Z`).getTime();
  return Math.round((target - today) / 86400000);
}

// Reads the pre-computed cumulative timeline (already sorted ascending by
// buildForecast) instead of re-summing items, so this stays a cheap lookup.
function projectedBalanceAt(forecast: TreasuryForecast, horizonIso: string): number {
  let balance = forecast.startingBalance;
  for (const point of forecast.timeline) {
    if (point.date > horizonIso) break;
    balance = point.balance;
  }
  return balance;
}

function kindLabel(t: ReturnType<typeof useTranslation>['t'], kind: TreasuryItemKind): string {
  switch (kind) {
    case 'facture':
      return t('treasury.kindFacture');
    case 'salaire':
      return t('treasury.kindSalaire');
    case 'sous-traitant':
      return t('treasury.kindSousTraitant');
    case 'recurrente':
      return t('treasury.kindRecurrente');
  }
}

export default function TreasuryScreen() {
  const { t } = useTranslation();
  const { organization, user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [forecast, setForecast] = useState<TreasuryForecast | null>(null);
  const [expenses, setExpenses] = useState<RecurringExpense[]>([]);
  const [plan, setPlan] = useState<Plan | null>(null);

  const [editingBalance, setEditingBalance] = useState(false);
  const [balanceInput, setBalanceInput] = useState('');
  const [savingBalance, setSavingBalance] = useState(false);

  // enabled_modules alone isn't a reliable gate here — an org that had
  // 'treasury' toggled on while on a plan that included it keeps that entry
  // if it later downgrades, and nothing else in this screen checked the
  // plan itself. Mirrors the same check on planning/index.tsx and rh/index.tsx.
  // Recurring expenses are still fetched here (for the "upcoming" banner)
  // but managed — created, edited, deleted — from the Dépenses screen now,
  // same as one-off expenses; this screen is forecast-only.
  const load = useCallback(async () => {
    if (!organization) return;
    setLoading(true);
    const [fc, exp, { data: planRow }] = await Promise.all([
      buildForecast(organization),
      listRecurringExpenses(organization.id),
      supabase.from('plans').select('*').eq('id', organization.plan_id).single(),
    ]);
    setForecast(fc);
    setExpenses(exp);
    setPlan(planRow ?? null);
    setLoading(false);
  }, [organization]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function saveBalance() {
    if (!organization) return;
    const value = Number(balanceInput.replace(',', '.'));
    if (Number.isNaN(value)) return;
    setSavingBalance(true);
    await addCashSnapshot(organization.id, value, user?.id);
    setSavingBalance(false);
    setEditingBalance(false);
    load();
  }

  const upcoming = useMemo(() => upcomingRecurringCount(expenses), [expenses]);
  const projected30 = useMemo(() => (forecast ? projectedBalanceAt(forecast, addDaysIso(isoToday(), 30)) : 0), [forecast]);
  const projected90 = useMemo(() => (forecast ? projectedBalanceAt(forecast, addDaysIso(isoToday(), 90)) : 0), [forecast]);

  const datedItems = useMemo(() => (forecast?.items ?? []).filter((it) => it.date), [forecast]);
  const undatedItems = useMemo(() => (forecast?.items ?? []).filter((it) => !it.date), [forecast]);

  if (!organization || loading) return <LoadingScreen />;

  if (plan && !plan.has_treasury) {
    return (
      <Screen style={{ padding: spacing.xl }}>
        <PageHeader title={t('treasury.title')} backTo="/(app)" />
        <Card style={styles.upsell}>
          <Feather name="archive" size={22} color={colors.accent} />
          <Text style={styles.upsellTitle}>{t('treasury.upsellTitle')}</Text>
          <Text style={styles.upsellText}>{t('treasury.upsellText')}</Text>
          <Text style={styles.upsellText}>{t('treasury.upsellPlanHint')}</Text>
          <Button title={t('treasury.seePlans')} variant="secondary" icon="arrow-right" onPress={() => router.push('/(app)/compte')} style={{ marginTop: spacing.md }} />
        </Card>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl * 2 }}>
        <PageHeader title={t('treasury.title')} backTo="/(app)" />
        <Text style={styles.pageSubtitle}>{t('treasury.subtitle')}</Text>

        {forecast ? (
          <View style={{ gap: spacing.lg }}>
            <Card style={styles.balanceCard}>
              <View style={styles.balanceTop}>
                <View>
                  <Text style={styles.balanceLabel}>{t('treasury.currentBalance')}</Text>
                  <Text style={styles.balanceMeta}>
                    {forecast.startingBalanceRecordedAt
                      ? t('treasury.updatedOn', { date: formatDateFr(forecast.startingBalanceRecordedAt.slice(0, 10)) })
                      : t('treasury.neverSet')}
                  </Text>
                </View>
                {!editingBalance ? (
                  <Pressable
                    onPress={() => {
                      setBalanceInput(String(forecast.startingBalance || ''));
                      setEditingBalance(true);
                    }}
                    hitSlop={8}
                    style={styles.balanceEditBtn}
                  >
                    <Feather name="edit-2" size={16} color={colors.primary} />
                  </Pressable>
                ) : null}
              </View>

              {editingBalance ? (
                <View style={styles.balanceEditRow}>
                  <TextInput
                    value={balanceInput}
                    onChangeText={setBalanceInput}
                    keyboardType="decimal-pad"
                    placeholder="0.00"
                    placeholderTextColor={colors.textMuted}
                    style={styles.balanceInput}
                    autoFocus
                  />
                  <Button title={t('treasury.save')} onPress={saveBalance} loading={savingBalance} style={{ flex: 0 }} />
                  <Button title={t('treasury.cancel')} variant="secondary" onPress={() => setEditingBalance(false)} style={{ flex: 0 }} />
                </View>
              ) : (
                <Text style={styles.balanceValue}>CHF {forecast.startingBalance.toFixed(2)}</Text>
              )}
            </Card>

            <View style={styles.kpiRow}>
              <Card style={styles.kpiTile}>
                <Text style={styles.kpiLabel}>{t('treasury.projected30')}</Text>
                <Text style={[styles.kpiValue, projected30 < 0 && styles.kpiValueDanger]}>CHF {projected30.toFixed(0)}</Text>
              </Card>
              <Card style={styles.kpiTile}>
                <Text style={styles.kpiLabel}>{t('treasury.projected90')}</Text>
                <Text style={[styles.kpiValue, projected90 < 0 && styles.kpiValueDanger]}>CHF {projected90.toFixed(0)}</Text>
              </Card>
            </View>

            {upcoming > 0 ? (
              <Pressable onPress={() => router.push('/(app)/depenses' as any)} style={styles.banner}>
                <Feather name="bell" size={16} color={colors.warning} />
                <Text style={styles.bannerText}>{t('treasury.upcomingBanner', { count: upcoming })}</Text>
                <Feather name="chevron-right" size={16} color={colors.warning} />
              </Pressable>
            ) : null}

            <Text style={styles.sectionTitle}>{t('treasury.upcomingMovements')}</Text>
            {datedItems.length === 0 && undatedItems.length === 0 ? (
              <Card>
                <EmptyState
                  title={t('treasury.emptyForecastTitle')}
                  subtitle={t('treasury.emptyForecastSubtitle')}
                />
              </Card>
            ) : (
              <View style={{ gap: spacing.sm }}>
                {datedItems.map((item, idx) => (
                  <ForecastItemRow key={`${item.kind}-${item.sourceId}-${idx}`} item={item} />
                ))}
              </View>
            )}

            {undatedItems.length > 0 ? (
              <>
                <Text style={styles.sectionTitleSmall}>{t('treasury.noKnownDueDate')}</Text>
                <View style={{ gap: spacing.sm }}>
                  {undatedItems.map((item, idx) => (
                    <ForecastItemRow key={`${item.kind}-${item.sourceId}-u${idx}`} item={item} />
                  ))}
                </View>
              </>
            ) : null}

            <Text style={styles.disclaimer}>{t('treasury.salaryDisclaimer')}</Text>
          </View>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

function ForecastItemRow({ item }: { item: TreasuryForecastItem }) {
  const { t } = useTranslation();
  const positive = item.amount >= 0;
  return (
    <Card style={styles.itemRow}>
      <View style={[styles.itemIcon, { backgroundColor: positive ? colors.successSoft : colors.dangerSoft }]}>
        <Feather name={KIND_ICONS[item.kind]} size={16} color={positive ? colors.success : colors.danger} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.itemLabel} numberOfLines={1}>
          {item.label}
        </Text>
        <View style={styles.itemMetaRow}>
          <Text style={styles.itemMeta}>{item.date ? formatDateFr(item.date) : kindLabel(t, item.kind)}</Text>
          {item.overdue ? <Text style={styles.overdueTag}>{t('treasury.overdue')}</Text> : null}
        </View>
      </View>
      <Text style={[styles.itemAmount, positive ? styles.itemAmountPositive : styles.itemAmountNegative]}>
        {positive ? '+' : ''}
        CHF {item.amount.toFixed(0)}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
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
  pageSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  balanceCard: {
    gap: spacing.sm,
  },
  balanceTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  balanceLabel: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.textMuted,
  },
  balanceMeta: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  balanceEditBtn: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceValue: {
    fontSize: fontSize.xxxl,
    fontWeight: '800',
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  balanceEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  balanceInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
    backgroundColor: colors.surface,
  },
  kpiRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  kpiTile: {
    flex: 1,
  },
  kpiLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    fontWeight: '600',
  },
  kpiValue: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    color: colors.text,
    marginTop: spacing.xs,
    fontVariant: ['tabular-nums'],
  },
  kpiValueDanger: {
    color: colors.danger,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.warningSoft,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  bannerText: {
    flex: 1,
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.warning,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
  },
  sectionTitleSmall: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  disclaimer: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    lineHeight: 18,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  itemIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemLabel: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  itemMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: 2,
  },
  itemMeta: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  overdueTag: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.danger,
    backgroundColor: colors.dangerSoft,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.sm,
  },
  itemAmount: {
    fontSize: fontSize.md,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  itemAmountPositive: {
    color: colors.success,
  },
  itemAmountNegative: {
    color: colors.danger,
  },
});
