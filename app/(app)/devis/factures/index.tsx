import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../../../lib/auth-context';
import { supabase } from '../../../../lib/supabase';
import { sendFactureReminder } from '../../../../lib/api/factures';
import { Card, EmptyState, Screen, StatusBadge } from '../../../../components/ui';
import { colors, fontSize, radius, spacing } from '../../../../lib/theme';
import type { Facture } from '../../../../lib/types';

type FilterKey = 'all' | 'overdue' | 'pending' | 'paid' | 'draft';

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function isOverdue(facture: Facture): boolean {
  return facture.status === 'sent' && facture.due_date < todayIso();
}

function isPending(facture: Facture): boolean {
  return facture.status === 'sent' && facture.due_date >= todayIso();
}

function isPaidThisMonth(facture: Facture): boolean {
  if (facture.status !== 'paid' || !facture.paid_at) return false;
  const now = new Date();
  const paidAt = new Date(facture.paid_at);
  return paidAt.getFullYear() === now.getFullYear() && paidAt.getMonth() === now.getMonth();
}

// Sorted so the dashboard reads as a worklist rather than a plain log:
// what's overdue floats to the top (soonest-overdue first), then what's
// still pending by due date, then everything else by recency.
function sortPriority(f: Facture): number {
  if (isOverdue(f)) return 0;
  if (isPending(f)) return 1;
  if (f.status === 'draft') return 2;
  if (f.status === 'paid') return 3;
  return 4;
}

function sortFactures(list: Facture[]): Facture[] {
  return [...list].sort((a, b) => {
    const pa = sortPriority(a);
    const pb = sortPriority(b);
    if (pa !== pb) return pa - pb;
    if (pa <= 1) return a.due_date < b.due_date ? -1 : a.due_date > b.due_date ? 1 : 0;
    return a.created_at < b.created_at ? 1 : a.created_at > b.created_at ? -1 : 0;
  });
}

function relativeReminder(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days <= 0) return "relancée aujourd'hui";
  if (days === 1) return 'relancée hier';
  return `relancée il y a ${days} j`;
}

export default function FacturesListScreen() {
  const { organization, role } = useAuth();
  const router = useRouter();
  const [factures, setFactures] = useState<Facture[]>([]);
  const [totals, setTotals] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterKey>('all');
  const [remindingId, setRemindingId] = useState<string | null>(null);
  const [reminderError, setReminderError] = useState<string | null>(null);
  const isAdmin = role === 'owner' || role === 'admin';

  const load = useCallback(async () => {
    if (!organization) return;
    setLoading(true);
    const { data: fData } = await supabase
      .from('factures')
      .select('*')
      .eq('organization_id', organization.id)
      .order('created_at', { ascending: false });
    const list = fData ?? [];
    setFactures(list);

    const ids = list.map((f) => f.id);
    if (ids.length) {
      const { data: itemsData } = await supabase.from('facture_items').select('facture_id, quantity, unit_price').in('facture_id', ids);
      const byFacture: Record<string, number> = {};
      for (const it of itemsData ?? []) {
        byFacture[it.facture_id] = (byFacture[it.facture_id] ?? 0) + Number(it.quantity) * Number(it.unit_price);
      }
      const withVat: Record<string, number> = {};
      for (const f of list) {
        withVat[f.id] = (byFacture[f.id] ?? 0) * (1 + Number(f.vat_rate) / 100);
      }
      setTotals(withVat);
    } else {
      setTotals({});
    }
    setLoading(false);
  }, [organization]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const kpis = useMemo(() => {
    let overdueSum = 0;
    let overdueCount = 0;
    let pendingSum = 0;
    let pendingCount = 0;
    let paidSum = 0;
    let draftCount = 0;
    for (const f of factures) {
      const amount = totals[f.id] ?? 0;
      if (isOverdue(f)) {
        overdueSum += amount;
        overdueCount += 1;
      } else if (isPending(f)) {
        pendingSum += amount;
        pendingCount += 1;
      }
      if (isPaidThisMonth(f)) paidSum += amount;
      if (f.status === 'draft') draftCount += 1;
    }
    return { overdueSum, overdueCount, pendingSum, pendingCount, paidSum, draftCount };
  }, [factures, totals]);

  const filtered = useMemo(() => {
    const sorted = sortFactures(factures);
    switch (filter) {
      case 'overdue':
        return sorted.filter(isOverdue);
      case 'pending':
        return sorted.filter(isPending);
      case 'paid':
        return sorted.filter((f) => f.status === 'paid');
      case 'draft':
        return sorted.filter((f) => f.status === 'draft');
      default:
        return sorted;
    }
  }, [factures, filter]);

  async function handleRemind(facture: Facture) {
    if (remindingId) return;
    setReminderError(null);
    setRemindingId(facture.id);
    const { sent, error } = await sendFactureReminder(facture.id);
    setRemindingId(null);
    if (!sent) {
      setReminderError(error ?? "Échec de l'envoi de la relance.");
      return;
    }
    load();
  }

  const filters: { key: FilterKey; label: string; count: number }[] = [
    { key: 'all', label: 'Toutes', count: factures.length },
    { key: 'overdue', label: 'En retard', count: kpis.overdueCount },
    { key: 'pending', label: 'À encaisser', count: kpis.pendingCount },
    { key: 'paid', label: 'Payées', count: factures.filter((f) => f.status === 'paid').length },
    { key: 'draft', label: 'Brouillons', count: kpis.draftCount },
  ];

  return (
    <Screen style={{ padding: spacing.xl }}>
      <View style={styles.container}>
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          refreshing={loading}
          onRefresh={load}
          contentContainerStyle={{ paddingBottom: spacing.xxl, gap: spacing.md }}
          ListHeaderComponent={
            <View style={{ marginBottom: spacing.lg }}>
              <View style={styles.kpiGrid}>
                <KpiTile
                  label="En retard"
                  amount={kpis.overdueSum}
                  count={kpis.overdueCount}
                  tone="danger"
                  icon="alert-triangle"
                />
                <KpiTile
                  label="À encaisser"
                  amount={kpis.pendingSum}
                  count={kpis.pendingCount}
                  tone="primary"
                  icon="clock"
                />
                <KpiTile label="Encaissé ce mois" amount={kpis.paidSum} tone="success" icon="check-circle" />
                <KpiTile label="Brouillons" count={kpis.draftCount} tone="muted" icon="file-text" hideAmount />
              </View>

              <View style={styles.filterRow}>
                {filters.map((f) => (
                  <Pressable
                    key={f.key}
                    onPress={() => setFilter(f.key)}
                    style={[styles.filterChip, filter === f.key && styles.filterChipActive]}
                  >
                    <Text style={[styles.filterChipText, filter === f.key && styles.filterChipTextActive]}>
                      {f.label} · {f.count}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {reminderError ? <Text style={styles.reminderError}>{reminderError}</Text> : null}
            </View>
          }
          ListEmptyComponent={
            !loading ? (
              <EmptyState
                title="Aucune facture"
                subtitle={filter === 'all' ? 'Transformez un devis accepté en facture depuis sa fiche.' : 'Rien dans ce filtre pour le moment.'}
              />
            ) : null
          }
          renderItem={({ item }) => {
            const overdue = isOverdue(item);
            const canRemind = isAdmin && item.status === 'sent' && !!item.client_email;
            const amount = totals[item.id] ?? 0;
            return (
              <Card style={styles.card}>
                <Pressable style={styles.cardTop} onPress={() => router.push(`/(app)/devis/factures/${item.id}`)}>
                  <View style={styles.cardBody}>
                    <View style={styles.row}>
                      <Text style={styles.number}>{item.number}</Text>
                      <StatusBadge status={item.status} />
                    </View>
                    <Text style={styles.client}>{item.client_name}</Text>
                    <View style={styles.metaRow}>
                      <Text style={[styles.meta, overdue && styles.overdue]}>
                        {overdue ? 'En retard · ' : ''}Échéance {new Date(item.due_date).toLocaleDateString('fr-CH')}
                      </Text>
                      <Text style={styles.amount}>CHF {amount.toFixed(2)}</Text>
                    </View>
                  </View>
                  <Feather name="chevron-right" size={18} color={colors.textMuted} />
                </Pressable>
                {canRemind ? (
                  <View style={styles.remindRow}>
                    {item.last_reminded_at ? (
                      <Text style={styles.remindHint}>{relativeReminder(item.last_reminded_at)}</Text>
                    ) : (
                      <View />
                    )}
                    <Pressable
                      onPress={() => handleRemind(item)}
                      disabled={remindingId === item.id}
                      style={[styles.remindButton, overdue && styles.remindButtonUrgent]}
                    >
                      {remindingId === item.id ? (
                        <ActivityIndicator size="small" color={overdue ? '#fff' : colors.primary} />
                      ) : (
                        <>
                          <Feather name="mail" size={12} color={overdue ? '#fff' : colors.primary} />
                          <Text style={[styles.remindButtonText, overdue && styles.remindButtonTextUrgent]}>Relancer</Text>
                        </>
                      )}
                    </Pressable>
                  </View>
                ) : null}
              </Card>
            );
          }}
        />
      </View>
    </Screen>
  );
}

const TONE_COLORS: Record<string, { fg: string; bg: string }> = {
  danger: { fg: colors.danger, bg: colors.dangerSoft },
  primary: { fg: colors.primary, bg: colors.primarySoft },
  success: { fg: colors.success, bg: colors.successSoft },
  muted: { fg: colors.textMuted, bg: colors.surfaceAlt },
};

function KpiTile({
  label,
  amount,
  count,
  tone,
  icon,
  hideAmount,
}: {
  label: string;
  amount?: number;
  count?: number;
  tone: keyof typeof TONE_COLORS;
  icon: React.ComponentProps<typeof Feather>['name'];
  hideAmount?: boolean;
}) {
  const t = TONE_COLORS[tone];
  return (
    <View style={styles.kpiTile}>
      <View style={[styles.kpiIcon, { backgroundColor: t.bg }]}>
        <Feather name={icon} size={14} color={t.fg} />
      </View>
      <Text style={styles.kpiLabel}>{label}</Text>
      {!hideAmount ? <Text style={styles.kpiAmount}>CHF {(amount ?? 0).toFixed(2)}</Text> : null}
      {count !== undefined ? (
        <Text style={styles.kpiCount}>
          {count} facture{count > 1 ? 's' : ''}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  kpiTile: {
    flexBasis: '47%',
    flexGrow: 1,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: 4,
  },
  kpiIcon: {
    width: 26,
    height: 26,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  kpiLabel: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.textMuted,
  },
  kpiAmount: {
    fontSize: fontSize.lg,
    fontWeight: '800',
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  kpiCount: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  filterChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  filterChipActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.textMuted,
  },
  filterChipTextActive: {
    color: colors.primary,
  },
  reminderError: {
    fontSize: fontSize.xs,
    color: colors.danger,
    marginTop: spacing.sm,
  },
  card: {
    padding: 0,
    overflow: 'hidden',
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
  },
  cardBody: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  number: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  client: {
    fontSize: fontSize.md,
    color: colors.text,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  meta: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  amount: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  overdue: {
    color: colors.danger,
    fontWeight: '600',
  },
  remindRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surfaceAlt,
  },
  remindHint: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  remindButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.primary,
    marginLeft: 'auto',
  },
  remindButtonUrgent: {
    backgroundColor: colors.danger,
    borderColor: colors.danger,
  },
  remindButtonText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.primary,
  },
  remindButtonTextUrgent: {
    color: '#fff',
  },
});
