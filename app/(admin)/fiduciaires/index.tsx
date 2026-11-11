import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { accAdmin, formatChf, formatDate, type FirmActivity } from '../../../lib/accounting/api';
import { freshnessColor, relativeTime } from '../../../components/AdminFiduciaryUsage';
import { adminDisplay as displayType } from '../../../lib/adminTheme';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';

// Super Admin › Fiduciaires: administration of Cantia Accounting (moved
// here from accounting.cantia.ch, one admin for everything). accounting.admin
// permission, checked
// by every database function; this screen only decides what to show).
// Internal tool: French only.

type Firms = NonNullable<Awaited<ReturnType<typeof accAdmin.firms>>['data']>;
type Overview = NonNullable<Awaited<ReturnType<typeof accAdmin.overview>>['data']>;

const STATUS: Record<string, string> = { ACTIVE: 'Active', SUSPENDED: 'Suspendue', BLOCKED: 'Bloquée', PENDING_CLIENT: 'Attente client', PENDING_FIRM: 'Attente fiduciaire', REFUSED: 'Refusé', REVOKED: 'Révoqué', CANCELLED: 'Annulé', PENDING: 'En attente', ACCEPTED: 'Acceptée' };

export default function AdminFiduciaires() {
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [firms, setFirms] = useState<Firms>([]);
  const [query, setQuery] = useState('');
  const router = useRouter();
  const [activity, setActivity] = useState<Record<string, FirmActivity>>({});
  const [sort, setSort] = useState<'recent' | 'activity'>('activity');

  const load = useCallback(async () => {
    const [o, f, a] = await Promise.all([accAdmin.overview(), accAdmin.firms(), accAdmin.activity()]);
    setOverview(o.data);
    setFirms(f.data ?? []);
    setActivity(Object.fromEntries((a.data ?? []).map((r) => [r.firm_id, r])));
  }, []);

  useEffect(() => {
    accAdmin.am().then(({ data }) => {
      setAllowed(!!data);
      if (data) load();
    });
  }, [load]);

  const q = query.trim().toLowerCase();
  const lastActive = (id: string) => {
    const a = activity[id];
    const t = [a?.last_seen_at, a?.last_action_at, a?.last_sign_in_at].filter(Boolean).map((d) => new Date(d as string).getTime());
    return t.length ? Math.max(...t) : 0;
  };
  const list = firms
    .filter((f) => !q || [f.name, f.city, f.owner_email].filter(Boolean).join(' ').toLowerCase().includes(q))
    .sort((a, b) => (sort === 'activity' ? lastActive(b.id) - lastActive(a.id) : new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
  const active7 = firms.filter((f) => Date.now() - lastActive(f.id) < 7 * 86400000).length;

  return (
    <ScrollView contentContainerStyle={styles.wrap}>
        {allowed === null ? (
          <Text style={styles.muted}>Chargement…</Text>
        ) : !allowed ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Accès réservé</Text>
            <Text style={styles.muted}>Cette page est réservée à l’équipe Cantia.</Text>
          </View>
        ) : (
          <>
            <Text style={styles.eyebrow}>Écosystème</Text>
            <Text style={styles.h1}>Cantia Accounting</Text>
            {overview ? (
              <View style={styles.kpis}>
                <Kpi label="Fiduciaires" value={String(overview.firms)} hint={`${overview.firms_new_30d} en 30 jours`} />
                <Kpi label="Actives" value={String(overview.firms_active)} hint="au moins un mandant" />
                <Kpi label="Utilisées cette semaine" value={String(active7)} hint="présence ou action < 7 jours" />
                <Kpi label="Mandants liés" value={String(overview.linked_clients)} />
                <Kpi label="Clients acquis" value={String(overview.acquired_clients)} />
                <Kpi label="MRR acquis" value={formatChf(overview.acquired_mrr_chf)} />
                <Kpi label="Partenaires" value={String(overview.partner_firms)} />
                <Kpi label="Suspectes" value={String(overview.suspicious)} warn={overview.suspicious > 0} />
              </View>
            ) : null}
            <TextInput value={query} onChangeText={setQuery} placeholder="Rechercher une fiduciaire, une ville, un e-mail…" placeholderTextColor={colors.textMuted} style={styles.input} />
            <View style={styles.sortRow}>
              <Text style={styles.small}>Trier par</Text>
              {(
                [
                  ['activity', 'Dernière activité'],
                  ['recent', 'Inscription la plus récente'],
                ] as const
              ).map(([k, label]) => (
                <Pressable key={k} onPress={() => setSort(k)} style={[styles.sortChip, sort === k && styles.sortChipActive]}>
                  <Text style={[styles.sortChipText, sort === k && styles.sortChipTextActive]}>{label}</Text>
                </Pressable>
              ))}
            </View>
            {list.length === 0 ? <Text style={styles.muted}>Aucune fiduciaire.</Text> : null}
            {list.map((f) => (
              <View key={f.id} style={styles.card}>
                <Pressable onPress={() => router.push(`/(admin)/fiduciaires/${f.id}` as any)} style={styles.firmHead}>
                  <View style={{ flex: 1, minWidth: 220 }}>
                    <Text style={styles.cardTitle}>
                      {f.name}
                      {f.verified ? '  ✓' : ''}
                    </Text>
                    <Text style={styles.small}>{[f.city, f.owner_email, `créée le ${formatDate(f.created_at, 'fr')}`].filter(Boolean).join(' · ')}</Text>
                    {f.suspicious ? <Text style={styles.warn}>⚠ {f.suspicious}</Text> : null}
                  </View>
                  <Pill label={STATUS[f.status] ?? f.status} tone={f.status === 'ACTIVE' ? 'ok' : 'bad'} />
                  {f.partner ? <Pill label="Partner" tone="accent" /> : null}
                  <Feather name="chevron-right" size={18} color={colors.textMuted} />
                </Pressable>
                <View style={styles.metrics}>
                  <Metric label="Membres" value={f.members} />
                  <Metric label="Mandants actifs" value={f.active_clients} />
                  <Metric label="En attente" value={f.pending} />
                  <Metric label="Invitations" value={f.invitations} />
                  <Metric label="Clients acquis" value={f.acquired} />
                </View>
                <ActivityLine a={activity[f.id]} />
              </View>
            ))}
          </>
        )}
    </ScrollView>
  );
}

// Presence and usage at a glance, on every card.
function ActivityLine({ a }: { a: FirmActivity | undefined }) {
  if (!a) return null;
  const seen = a.last_seen_at ?? a.last_sign_in_at;
  return (
    <View style={styles.activity}>
      <View style={[styles.activityDot, { backgroundColor: freshnessColor(seen) }]} />
      <Text style={styles.activityText}>
        <Text style={styles.activityStrong}>Vu {relativeTime(seen)}</Text>
        {'  ·  '}Dernière action {relativeTime(a.last_action_at)}
        {'  ·  '}
        {a.active_days_30} j actifs / 30
        {'  ·  '}
        {a.features_used} / {a.features_total} fonctions utilisées
      </Text>
    </View>
  );
}

function Kpi({ label, value, hint, warn = false }: { label: string; value: string; hint?: string; warn?: boolean }) {
  return (
    <View style={styles.kpi}>
      <Text style={styles.kpiLabel}>{label}</Text>
      <Text style={[styles.kpiValue, warn && { color: colors.danger }]}>{value}</Text>
      {hint ? <Text style={styles.small}>{hint}</Text> : null}
    </View>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <View style={{ minWidth: 100 }}>
      <Text style={styles.small}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

function Pill({ label, tone }: { label: string; tone: 'ok' | 'bad' | 'accent' }) {
  const c = tone === 'ok' ? { bg: colors.successSoft, fg: colors.success } : tone === 'bad' ? { bg: colors.dangerSoft, fg: colors.danger } : { bg: colors.primarySoft, fg: colors.primary };
  return (
    <View style={[styles.pill, { backgroundColor: c.bg }]}>
      <Text style={[styles.pillText, { color: c.fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%', maxWidth: 1180, alignSelf: 'center', padding: spacing.xl, paddingBottom: 80, gap: spacing.lg },
  eyebrow: { fontSize: 12, fontWeight: '700', color: colors.primary, textTransform: 'uppercase', letterSpacing: 1 },
  h1: { ...displayType, fontSize: 34, fontWeight: '800', color: colors.text },
  kpis: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  kpi: { flexGrow: 1, flexBasis: 150, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.lg, gap: 2 },
  kpiLabel: { fontSize: fontSize.xs, color: colors.textMuted, fontWeight: '600' },
  kpiValue: { ...displayType, fontSize: 24, fontWeight: '800', color: colors.text },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingVertical: 10, paddingHorizontal: 12, fontSize: fontSize.sm, color: colors.text, backgroundColor: colors.surface },
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.xl, gap: spacing.md },
  cardTitle: { fontSize: fontSize.lg, fontWeight: '800', color: colors.text },
  firmHead: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.md },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.lg },
  metricValue: { fontSize: fontSize.md, fontWeight: '800', color: colors.text },
  detail: { gap: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.md },
  blockTitle: { fontSize: fontSize.xs, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  row: { fontSize: fontSize.sm, color: colors.text, lineHeight: 20 },
  clientRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  pill: { borderRadius: 999, paddingVertical: 3, paddingHorizontal: 10 },
  pillText: { fontSize: 11, fontWeight: '700' },
  small: { fontSize: 12, color: colors.textMuted },
  muted: { fontSize: fontSize.sm, color: colors.textMuted },
  warn: { fontSize: 12, color: colors.danger, fontWeight: '700' },
  link: { fontSize: fontSize.sm, color: colors.danger, fontWeight: '700' },
  sortRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.sm },
  sortChip: { borderWidth: 1, borderColor: colors.border, borderRadius: 999, paddingVertical: 5, paddingHorizontal: 12, backgroundColor: colors.surface },
  sortChipActive: { backgroundColor: colors.primarySoft, borderColor: colors.primarySoft },
  sortChipText: { fontSize: 12, fontWeight: '600', color: colors.text },
  sortChipTextActive: { color: colors.primary, fontWeight: '700' },
  activity: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.bg, borderRadius: radius.md, paddingVertical: 8, paddingHorizontal: spacing.md },
  activityDot: { width: 8, height: 8, borderRadius: 4 },
  activityText: { flex: 1, fontSize: 12, color: colors.textMuted },
  activityStrong: { fontWeight: '700', color: colors.text },
  usageCard: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.sm },
  usageTitle: { fontSize: fontSize.md, fontWeight: '800', color: colors.text },
});
