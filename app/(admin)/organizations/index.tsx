import { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Container, EmptyState, Field, LoadingScreen } from '../../../components/ui';
import { AdminErrorBanner } from '../../../components/AdminErrorBanner';
import { AdminOrgStatusPill } from '../../../components/AdminOrgStatusPill';
import { AdminRefreshButton } from '../../../components/AdminRefreshButton';
import { InternalTag } from '../../../components/InternalTag';
import { PaymentStatusIcon } from '../../../components/PaymentStatusIcon';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';
import { getOrgBillingStatuses, listOrganizations } from '../../../lib/api/admin';
import { getOrgStatus, type OrgStatusBucket } from '../../../lib/adminStatus';
import { downloadTextFile } from '../../../lib/downloadFile';
import type { AdminOrganizationSummary, AdminOrgBillingStatus } from '../../../lib/types';

function formatDateShort(iso: string | null): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('fr-CH', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatChfShort(amount: number): string {
  return new Intl.NumberFormat('fr-CH', { style: 'currency', currency: 'CHF' }).format(amount);
}

// The one line under a row's subtitle that answers "when, and how much" —
// the actual gap this was built for: the org list showed a bare payment
// icon with no date, so telling a trial about to convert apart from one
// that already got cancelled meant opening every org one by one.
function billingLine(billing: AdminOrgBillingStatus | undefined): string | null {
  if (!billing?.subscription_status) return null;
  if (billing.subscription_status === 'trialing' && billing.next_invoice_date) {
    const amount = billing.next_invoice_amount_chf != null ? ` · ${formatChfShort(billing.next_invoice_amount_chf)}` : '';
    return `Essai jusqu'au ${formatDateShort(billing.next_invoice_date)}${amount}`;
  }
  if (billing.cancel_at_period_end && billing.next_invoice_date) {
    return `Résilié — accès jusqu'au ${formatDateShort(billing.next_invoice_date)}`;
  }
  if (billing.will_be_charged && billing.next_invoice_date && billing.next_invoice_amount_chf != null) {
    return `Prochain paiement : ${formatChfShort(billing.next_invoice_amount_chf)} le ${formatDateShort(billing.next_invoice_date)}`;
  }
  return null;
}

function escapeCsv(value: string): string {
  return /[;"\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

function buildOrganizationsCsv(orgs: AdminOrganizationSummary[], billing: Record<string, AdminOrgBillingStatus>): string {
  const header = [
    'Nom', 'Adresse', 'NPA', 'Localité', 'E-mail', 'Téléphone', 'Propriétaire',
    'Plan', 'Statut', "Essai jusqu'au", 'Prochain paiement', 'Montant (CHF)', 'Membres', 'Créée le',
  ];
  const rows = orgs.map((org) => {
    const b = billing[org.id];
    return [
      org.name,
      org.street ?? '',
      org.postal_code ?? '',
      org.locality ?? '',
      org.email ?? '',
      org.phone ?? '',
      org.owner_email ?? '',
      org.plan_name ?? '',
      getOrgStatus(org).label,
      formatDateShort(org.trial_ends_at),
      formatDateShort(b?.next_invoice_date ?? null),
      b?.next_invoice_amount_chf != null ? b.next_invoice_amount_chf.toFixed(2) : '',
      String(org.member_count),
      formatDateShort(org.created_at),
    ]
      .map((v) => escapeCsv(v))
      .join(';');
  });
  return [header.join(';'), ...rows].join('\n');
}

const PAGE_SIZE = 30;

const STATUS_FILTERS: { key: OrgStatusBucket | null; label: string }[] = [
  { key: null, label: 'Toutes' },
  { key: 'paid', label: 'Payant' },
  { key: 'complimentary', label: 'Offert' },
  { key: 'trialing', label: 'Essai' },
  { key: 'incomplete', label: 'Inscription incomplète' },
  { key: 'plan_selected', label: 'Plan choisi' },
  { key: 'past_due', label: 'Paiement en retard' },
];

type SortKey = 'recent' | 'name' | 'members';

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'recent', label: 'Plus récentes' },
  { key: 'name', label: 'Nom' },
  { key: 'members', label: 'Plus de membres' },
];

function Row({ org, billing, onPress }: { org: AdminOrganizationSummary; billing: AdminOrgBillingStatus | undefined; onPress: () => void }) {
  const line = billingLine(billing);
  return (
    <Pressable style={[styles.row, org.is_internal && styles.rowInternal]} onPress={onPress}>
      <View style={{ flex: 1 }}>
        <View style={styles.rowTitleLine}>
          <Text style={styles.rowTitle}>{org.name}</Text>
          {org.is_internal && org.internal_label ? <InternalTag label={org.internal_label} /> : null}
        </View>
        <Text style={styles.rowSubtitle}>
          {org.owner_email ?? 'Sans propriétaire'} · {org.plan_name} · {org.member_count} membre{org.member_count > 1 ? 's' : ''}
          {org.private_modules_count > 0 ? ` · ${org.private_modules_count} module${org.private_modules_count > 1 ? 's' : ''} privé${org.private_modules_count > 1 ? 's' : ''}` : ''}
        </Text>
        {line ? <Text style={styles.rowBillingLine}>{line}</Text> : null}
      </View>
      <PaymentStatusIcon status={billing} />
      <AdminOrgStatusPill org={org} />
      <Feather name="chevron-right" size={18} color={colors.textMuted} />
    </Pressable>
  );
}

export default function AdminOrganizationsList() {
  const router = useRouter();
  const { status: statusParam } = useLocalSearchParams<{ status?: string }>();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrgStatusBucket | null>((statusParam as OrgStatusBucket) ?? null);
  const [sortBy, setSortBy] = useState<SortKey>('recent');
  const [rows, setRows] = useState<AdminOrganizationSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [billing, setBilling] = useState<Record<string, AdminOrgBillingStatus>>({});

  const load = useCallback(async (query: string) => {
    setLoading(true);
    const { rows: r, total: t, error: err } = await listOrganizations(query, PAGE_SIZE, 0);
    setRows(r);
    setTotal(t);
    setError(err);
    setLoading(false);
    // Non-blocking: the list renders immediately, real Stripe payment-method
    // status trickles in a moment later once this bulk call resolves.
    getOrgBillingStatuses(r.map((o) => o.id)).then(({ statuses }) => setBilling(statuses));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => load(search), 250);
    return () => clearTimeout(timer);
  }, [search, load]);

  // The status filter runs client-side over this single already-fetched page
  // (PAGE_SIZE=30, comfortably above the real org count today) — it does not
  // ask the server for a second page of a given status once totals grow past
  // that.
  const filteredRows = useMemo(() => {
    const base = statusFilter ? rows.filter((o) => getOrgStatus(o).bucket === statusFilter) : rows;
    const sorted = [...base];
    if (sortBy === 'name') sorted.sort((a, b) => a.name.localeCompare(b.name, 'fr-CH'));
    else if (sortBy === 'members') sorted.sort((a, b) => b.member_count - a.member_count);
    else sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return sorted;
  }, [rows, statusFilter, sortBy]);

  // Exports exactly what's currently on screen — the search box and status
  // chips above act as the targeting step (e.g. "Inscription incomplète" or
  // "Essai" only) before pulling the list out for outreach.
  const [exporting, setExporting] = useState(false);
  async function handleExport() {
    setExporting(true);
    const csv = buildOrganizationsCsv(filteredRows, billing);
    const { error: err } = await downloadTextFile(`cantia-entreprises-${new Date().toISOString().slice(0, 10)}.csv`, csv);
    if (err) setError(err);
    setExporting(false);
  }

  return (
    <ScrollView>
      <Container style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Entreprises {total > 0 ? `(${total})` : ''}</Text>
          <View style={styles.headerActions}>
            <Pressable
              style={styles.exportButton}
              onPress={handleExport}
              disabled={exporting || filteredRows.length === 0}
            >
              <Feather name="download" size={14} color={colors.text} />
              <Text style={styles.exportButtonText}>{exporting ? 'Export…' : 'Exporter CSV'}</Text>
            </Pressable>
            <AdminRefreshButton onPress={() => load(search)} loading={loading} />
          </View>
        </View>
        <Field label="Rechercher" placeholder="Nom de l'entreprise…" value={search} onChangeText={setSearch} />
        {/* flexWrap, not a horizontal ScrollView — a horizontal scroller
            nested inside this page's outer vertical ScrollView captured the
            touch/wheel gesture wherever it started over a chip, making the
            page "stuck" mid-scroll on mobile. Wrapping chips instead avoids
            that entirely and loses nothing at this chip count. */}
        <View style={styles.filterRow}>
          {STATUS_FILTERS.map((f) => (
            <Pressable
              key={f.label}
              style={[styles.filterChip, statusFilter === f.key && styles.filterChipActive]}
              onPress={() => setStatusFilter(f.key)}
            >
              <Text style={[styles.filterChipText, statusFilter === f.key && styles.filterChipTextActive]}>{f.label}</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.sortRow}>
          <Text style={styles.sortLabel}>Trier :</Text>
          <View style={styles.sortChipRow}>
            {SORT_OPTIONS.map((s) => (
              <Pressable
                key={s.key}
                style={[styles.filterChip, sortBy === s.key && styles.filterChipActive]}
                onPress={() => setSortBy(s.key)}
              >
                <Text style={[styles.filterChipText, sortBy === s.key && styles.filterChipTextActive]}>{s.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>
        {error ? <AdminErrorBanner message={error} /> : null}
        {loading ? (
          <LoadingScreen label="Chargement…" />
        ) : filteredRows.length === 0 ? (
          <EmptyState
            title="Aucune entreprise trouvée"
            subtitle={search ? 'Essayez une autre recherche.' : statusFilter ? 'Aucune entreprise dans ce statut.' : undefined}
          />
        ) : (
          <FlatList
            data={filteredRows}
            keyExtractor={(o) => o.id}
            renderItem={({ item }) => (
              <Row org={item} billing={billing[item.id]} onPress={() => router.push(`/(admin)/organizations/${item.id}` as any)} />
            )}
            ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
            scrollEnabled={false}
          />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.text,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  exportButtonText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  sortRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  sortLabel: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.textMuted,
  },
  sortChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.textMuted,
  },
  filterChipTextActive: {
    color: '#fff',
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
  rowBillingLine: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.primary,
    marginTop: 2,
  },
});
