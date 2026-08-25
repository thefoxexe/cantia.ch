import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Container, EmptyState, Field, LoadingScreen } from '../../../components/ui';
import { AdminErrorBanner } from '../../../components/AdminErrorBanner';
import { InternalTag } from '../../../components/InternalTag';
import { PaymentStatusIcon } from '../../../components/PaymentStatusIcon';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';
import { getOrgBillingStatuses, getRevenueOverview, listOrganizations } from '../../../lib/api/admin';
import type { AdminOrgBillingStatus, AdminOrganizationSummary, AdminRevenueOverview } from '../../../lib/types';

const PAGE_SIZE = 50;

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-CH', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatChf(amount: number): string {
  return new Intl.NumberFormat('fr-CH', { style: 'currency', currency: 'CHF', maximumFractionDigits: 0 }).format(amount);
}

function RevenueTile({
  label,
  value,
  icon,
  accent,
  meta,
}: {
  label: string;
  value: string;
  icon: keyof typeof Feather.glyphMap;
  accent?: string;
  meta?: string;
}) {
  return (
    <View style={styles.tile}>
      <View style={[styles.tileIcon, accent ? { backgroundColor: `${accent}22` } : null]}>
        <Feather name={icon} size={16} color={accent ?? colors.primary} />
      </View>
      <Text style={[styles.tileValue, accent ? { color: accent } : null]}>{value}</Text>
      <Text style={styles.tileLabel}>{label}</Text>
      {meta ? <Text style={styles.tileMeta}>{meta}</Text> : null}
    </View>
  );
}

// Aggregate numbers come straight from Stripe (via admin-billing-overview),
// not guessed from local plan prices — a trialing sub, an active discount,
// or an org that never converted all show up correctly rather than as full
// list-price revenue that was never actually collected.
function RevenueOverview({ overview, loading, error }: { overview: AdminRevenueOverview | null; loading: boolean; error: string | null }) {
  if (loading) return <Text style={styles.emptyText}>Calcul du CA et du MRR auprès de Stripe…</Text>;
  if (error) return <AdminErrorBanner message={error} />;
  if (!overview) return null;

  return (
    <>
      <View style={styles.grid}>
        <RevenueTile label="MRR actif" value={formatChf(overview.mrr_active_chf)} icon="trending-up" />
        <RevenueTile label="ARR (MRR × 12)" value={formatChf(overview.arr_chf)} icon="bar-chart-2" />
        <RevenueTile label="MRR en attente (essais)" value={formatChf(overview.mrr_trialing_chf)} icon="clock" />
        <RevenueTile label="CA ce mois" value={formatChf(overview.ca_this_month_chf)} icon="calendar" />
        <RevenueTile label="CA total encaissé" value={formatChf(overview.ca_total_chf)} icon="dollar-sign" />
      </View>

      <Text style={styles.sectionTitle}>Mouvement ce mois-ci</Text>
      <View style={styles.grid}>
        <RevenueTile label="Nouveau MRR" value={`+${formatChf(overview.new_mrr_this_month_chf)}`} icon="arrow-up-right" accent={colors.success} />
        <RevenueTile
          label="MRR perdu (résiliations)"
          value={overview.churned_mrr_this_month_chf > 0 ? `−${formatChf(overview.churned_mrr_this_month_chf)}` : formatChf(0)}
          icon="arrow-down-right"
          accent={overview.churned_mrr_this_month_chf > 0 ? colors.danger : undefined}
          meta={overview.churned_count_this_month > 0 ? `${overview.churned_count_this_month} résiliation${overview.churned_count_this_month > 1 ? 's' : ''}` : undefined}
        />
        <RevenueTile
          label="MRR net"
          value={`${overview.net_mrr_this_month_chf >= 0 ? '+' : '−'}${formatChf(Math.abs(overview.net_mrr_this_month_chf))}`}
          icon={overview.net_mrr_this_month_chf >= 0 ? 'trending-up' : 'trending-down'}
          accent={overview.net_mrr_this_month_chf >= 0 ? colors.success : colors.danger}
        />
      </View>

      {overview.by_plan.length > 0 ? (
        <>
          <Text style={styles.sectionTitle}>MRR par plan</Text>
          <View style={styles.list}>
            {overview.by_plan.map((p) => (
              <View key={p.plan_id} style={styles.breakdownRow}>
                <Text style={styles.breakdownName}>{p.plan_name}</Text>
                <Text style={styles.breakdownMeta}>
                  {p.active_count} payant{p.active_count > 1 ? 's' : ''}
                  {p.trialing_count > 0 ? ` · ${p.trialing_count} en essai` : ''}
                </Text>
                <Text style={styles.breakdownValue}>{formatChf(p.mrr_chf)}</Text>
              </View>
            ))}
          </View>
        </>
      ) : null}

      <Text style={styles.sectionTitle}>Codes promo</Text>
      <View style={styles.list}>
        {overview.promo_codes.length === 0 ? (
          <Text style={styles.emptyText}>Aucun code promo utilisé à ce jour.</Text>
        ) : (
          overview.promo_codes.map((code) => (
            <View key={code.code} style={styles.breakdownRow}>
              <Text style={styles.breakdownName}>{code.code}</Text>
              <Text style={styles.breakdownMeta}>
                {code.org_count} entreprise{code.org_count > 1 ? 's' : ''} · {code.active_count} payant{code.active_count > 1 ? 's' : ''}
                {code.trialing_count > 0 ? ` · ${code.trialing_count} en essai` : ''}
              </Text>
            </View>
          ))
        )}
      </View>
    </>
  );
}

// Reuses admin_list_organizations rather than a separate RPC/table — the
// subscription-relevant fields (plan, subscription_status, trial_ends_at)
// already live on organizations, no need for a parallel billing view.
export default function AdminSubscriptionsList() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [rows, setRows] = useState<AdminOrganizationSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [billing, setBilling] = useState<Record<string, AdminOrgBillingStatus>>({});
  const [overview, setOverview] = useState<AdminRevenueOverview | null>(null);
  const [overviewLoading, setOverviewLoading] = useState(true);
  const [overviewError, setOverviewError] = useState<string | null>(null);

  const load = useCallback(async (query: string) => {
    setLoading(true);
    const { rows: r, total: t, error: err } = await listOrganizations(query, PAGE_SIZE, 0);
    setRows(r);
    setTotal(t);
    setError(err);
    setLoading(false);
    getOrgBillingStatuses(r.map((o) => o.id)).then(({ statuses }) => setBilling(statuses));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => load(search), 250);
    return () => clearTimeout(timer);
  }, [search, load]);

  useEffect(() => {
    setOverviewLoading(true);
    getRevenueOverview().then(({ overview: o, error: err }) => {
      setOverview(o);
      setOverviewError(err);
      setOverviewLoading(false);
    });
  }, []);

  return (
    <ScrollView>
      <Container style={styles.container}>
        <Text style={styles.title}>Abonnements {total > 0 ? `(${total})` : ''}</Text>

        <RevenueOverview overview={overview} loading={overviewLoading} error={overviewError} />

        <Text style={styles.sectionTitle}>Entreprises</Text>
        <Field label="Rechercher" placeholder="Nom de l'entreprise…" value={search} onChangeText={setSearch} />
        {error ? <AdminErrorBanner message={error} /> : null}
        {loading ? (
          <LoadingScreen label="Chargement…" />
        ) : rows.length === 0 ? (
          <EmptyState title="Aucune entreprise trouvée" />
        ) : (
          <View style={styles.list}>
            {rows.map((org) => {
              const isTrial = !!org.trial_ends_at && new Date(org.trial_ends_at).getTime() > Date.now();
              return (
                <Pressable
                  key={org.id}
                  style={[styles.row, org.is_internal && styles.rowInternal]}
                  onPress={() => router.push(`/(admin)/organizations/${org.id}` as any)}
                >
                  <View style={{ flex: 1 }}>
                    <View style={styles.rowTitleLine}>
                      <Text style={styles.rowTitle}>{org.name}</Text>
                      {org.is_internal && org.internal_label ? <InternalTag label={org.internal_label} /> : null}
                    </View>
                    <Text style={styles.rowSubtitle}>{org.plan_name}</Text>
                  </View>
                  <PaymentStatusIcon status={billing[org.id]} />
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.rowMeta}>{org.subscription_status ?? (isTrial ? 'Essai' : 'Sans abonnement')}</Text>
                    {isTrial ? <Text style={styles.rowMeta}>Jusqu'au {formatDate(org.trial_ends_at)}</Text> : null}
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}
      </Container>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.lg,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  tile: {
    minWidth: 160,
    flexGrow: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  tileIcon: {
    width: 30,
    height: 30,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  tileValue: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  tileLabel: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    fontWeight: '500',
  },
  tileMeta: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
    marginTop: spacing.md,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  breakdownName: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
    minWidth: 100,
  },
  breakdownMeta: {
    flex: 1,
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  breakdownValue: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.primary,
    fontVariant: ['tabular-nums'],
  },
  list: {
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  rowInternal: {
    opacity: 0.55,
  },
  rowTitleLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  rowTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  rowSubtitle: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  rowMeta: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
});
