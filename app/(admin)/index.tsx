import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { AdminErrorBanner } from '../../components/AdminErrorBanner';
import { AdminRefreshButton } from '../../components/AdminRefreshButton';
import { GrowthChart, CashCollectedChart } from '../../components/charts/LazyCharts';
import { TrialForecast } from '../../components/TrialForecast';
import { colors, fontSize, radius, spacing } from '../../lib/theme';
import { useAdminData } from '../../lib/adminDataContext';
import type { AdminRevenueOverview } from '../../lib/types';
import { adminDisplay } from '../../lib/adminTheme';
import { listActivity, type ActivityEvent, type AdminAttention } from '../../lib/api/admin';
import { partnersAdmin, type AdminOverview as PartnersOverview } from '../../lib/partners/api';
import { accAdmin } from '../../lib/accounting/api';
import { AdminCard, AdminEmpty, AdminPage, AdminSection, Kpi, KpiRow, formatChf, ink } from '../../components/admin/kit';
import { KIND_BY_ID, NEGATIVE_ACTIONS, headline, subline } from '../../components/admin/activity';

type IconName = keyof typeof Feather.glyphMap;

// Super Admin › Accueil. Read from top to bottom: what waits for me, how the
// business is doing, then the detail (trials, ecosystem, money over time).

interface TodoItem {
  key: string;
  icon: IconName;
  text: string;
  hint?: string;
  href: string;
  // urgent: an action to take; info: good to know.
  level: 'urgent' | 'info';
}

const plural = (n: number, one: string, many: string) => `${n} ${n > 1 ? many : one}`;

function todoItems(a: AdminAttention | null, overview: AdminRevenueOverview | null): TodoItem[] {
  if (!a) return [];
  const items: TodoItem[] = [];
  const push = (n: number, item: Omit<TodoItem, 'text'> & { text: (n: number) => string }) => {
    if (n > 0) items.push({ ...item, text: item.text(n) });
  };
  push(a.past_due, { key: 'past_due', icon: 'alert-octagon', level: 'urgent', href: '/(admin)/subscriptions', text: (n) => `${plural(n, 'paiement', 'paiements')} en retard`, hint: 'Le moyen de paiement a été refusé : à relancer.' });
  push(a.outreach_failed, { key: 'outreach_failed', icon: 'x-circle', level: 'urgent', href: '/(admin)/registre?onglet=envois', text: (n) => `${plural(n, 'e-mail de bienvenue', 'e-mails de bienvenue')} pas parti${n > 1 ? 's' : ''}`, hint: 'Envoi refusé : à corriger ou renvoyer.' });
  push(a.outreach_drafts, { key: 'outreach_drafts', icon: 'send', level: 'urgent', href: '/(admin)/registre?onglet=envois', text: (n) => `${plural(n, 'e-mail de bienvenue', 'e-mails de bienvenue')} à valider`, hint: 'Adresse pas certaine : à relire avant l’envoi.' });
  push(a.trial_requests, { key: 'trial_requests', icon: 'gift', level: 'urgent', href: '/(admin)/registre?onglet=envois', text: (n) => `${plural(n, 'demande', 'demandes')} de 3 mois offerts`, hint: 'Formulaire de cantia.ch/nouvelle-entreprise : envoyer le code.' });
  push(a.partner_payouts, { key: 'partner_payouts', icon: 'award', level: 'urgent', href: '/(admin)/partners', text: (n) => `${plural(n, 'virement', 'virements')} partenaire à faire` });
  push(a.fiduciaries_suspicious, { key: 'fiduciaries', icon: 'shield', level: 'urgent', href: '/(admin)/fiduciaires', text: (n) => `${plural(n, 'fiduciaire', 'fiduciaires')} à vérifier` });
  push(a.trials_ending_3d, { key: 'trials', icon: 'clock', level: 'info', href: '/(admin)/subscriptions', text: (n) => `${plural(n, 'essai se termine', 'essais se terminent')} dans les 3 jours`, hint: 'Un bon moment pour un appel.' });
  push(overview?.scheduled_cancellations_count ?? 0, { key: 'cancel', icon: 'log-out', level: 'info', href: '/(admin)/subscriptions', text: (n) => `${plural(n, 'résiliation programmée', 'résiliations programmées')}`, hint: 'Encore actifs jusqu’à la fin de la période.' });
  push(a.cancellation_reasons_7d, { key: 'reasons', icon: 'message-circle', level: 'info', href: '/(admin)/subscriptions', text: (n) => `${plural(n, 'motif de résiliation reçu', 'motifs de résiliation reçus')} cette semaine` });
  push(a.signups_24h, { key: 'signups', icon: 'user-plus', level: 'info', href: '/(admin)/organizations', text: (n) => `${plural(n, 'nouvelle inscription', 'nouvelles inscriptions')} en 24 heures` });
  push(a.incomplete_signups_7d, { key: 'incomplete', icon: 'user-x', level: 'info', href: '/(admin)/organizations', text: (n) => `${plural(n, 'inscription', 'inscriptions')} pas terminée${n > 1 ? 's' : ''} cette semaine`, hint: 'Compte créé, aucun plan choisi.' });
  return items;
}

function TodoList({ items }: { items: TodoItem[] }) {
  const router = useRouter();
  if (items.length === 0) {
    return (
      <AdminCard>
        <AdminEmpty icon="check" title="Rien à traiter" text="Pas de paiement en retard, pas d’e-mail à valider, pas de virement à faire." />
      </AdminCard>
    );
  }
  return (
    <AdminCard padded={false}>
      {items.map((item, i) => (
        <Pressable
          key={item.key}
          onPress={() => router.push(item.href as any)}
          style={({ hovered }: any) => [styles.todo, i > 0 && styles.todoBorder, hovered && styles.todoHover]}
        >
          <View style={[styles.todoIcon, item.level === 'urgent' ? styles.todoIconUrgent : styles.todoIconInfo]}>
            <Feather name={item.icon} size={15} color={item.level === 'urgent' ? colors.primary : colors.textMuted} />
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={styles.todoText}>{item.text}</Text>
            {item.hint ? <Text style={styles.todoHint}>{item.hint}</Text> : null}
          </View>
          <Feather name="chevron-right" size={16} color={colors.textMuted} />
        </Pressable>
      ))}
    </AdminCard>
  );
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.round(diff / 60000);
  if (min < 1) return 'à l’instant';
  if (min < 60) return `il y a ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `il y a ${h} h`;
  const d = Math.round(h / 24);
  if (d === 1) return 'hier';
  if (d < 7) return `il y a ${d} jours`;
  return new Date(iso).toLocaleDateString('fr-CH', { day: 'numeric', month: 'short' });
}

function RecentActivity() {
  const router = useRouter();
  const [rows, setRows] = useState<ActivityEvent[] | null>(null);
  useEffect(() => {
    listActivity({ limit: 9 }).then(({ rows: r }) => setRows(r));
  }, []);
  return (
    <AdminCard padded={false}>
      {rows === null ? (
        <Text style={styles.loadingText}>Chargement…</Text>
      ) : rows.length === 0 ? (
        <AdminEmpty icon="activity" title="Pas encore d’activité" />
      ) : (
        rows.map((e, i) => {
          const kind = KIND_BY_ID[e.kind];
          const bad = NEGATIVE_ACTIONS.has(e.action) || e.kind === 'sync_error';
          const sub = subline(e);
          return (
            <Pressable
              key={`${e.at}-${i}`}
              onPress={() => (e.organization_id ? router.push(`/(admin)/organizations/${e.organization_id}` as any) : router.push('/(admin)/logs' as any))}
              style={({ hovered }: any) => [styles.event, i > 0 && styles.todoBorder, hovered && styles.todoHover]}
            >
              <View style={[styles.eventIcon, { backgroundColor: bad ? colors.dangerSoft : kind?.soft ?? colors.surfaceAlt }]}>
                <Feather name={kind?.icon ?? 'circle'} size={13} color={bad ? colors.danger : kind?.color ?? colors.textMuted} />
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.eventTitle} numberOfLines={1}>
                  {headline(e)}
                </Text>
                {sub ? (
                  <Text style={styles.eventSub} numberOfLines={1}>
                    {sub}
                  </Text>
                ) : null}
              </View>
              <Text style={styles.eventTime}>{relativeTime(e.at)}</Text>
            </Pressable>
          );
        })
      )}
      <Pressable onPress={() => router.replace('/(admin)/logs' as any)} style={({ hovered }: any) => [styles.cardFootLink, hovered && styles.todoHover]}>
        <Text style={styles.cardFootText}>Tout le journal</Text>
        <Feather name="arrow-right" size={13} color={colors.primary} />
      </Pressable>
    </AdminCard>
  );
}

// The one figure this business exists to grow, on the side menu's ink.
function MrrCard({ overview, cancelPct }: { overview: AdminRevenueOverview; cancelPct: number | null }) {
  const up = overview.net_mrr_this_month_chf >= 0;
  return (
    <View style={styles.mrr}>
      <Text style={styles.mrrLabel}>Revenu récurrent mensuel</Text>
      <Text style={styles.mrrValue} adjustsFontSizeToFit numberOfLines={1}>
        {formatChf(overview.mrr_active_chf)}
      </Text>
      <View style={styles.mrrMeta}>
        <View style={[styles.mrrChip, { backgroundColor: up ? 'rgba(143,220,154,0.14)' : 'rgba(244,163,163,0.14)' }]}>
          <Feather name={up ? 'arrow-up-right' : 'arrow-down-right'} size={12} color={up ? '#9fdca8' : '#f4a3a3'} />
          <Text style={[styles.mrrChipText, { color: up ? '#9fdca8' : '#f4a3a3' }]}>
            {up ? '+' : '−'}
            {formatChf(Math.abs(overview.net_mrr_this_month_chf))} ce mois
          </Text>
        </View>
        <Text style={styles.mrrSub}>ARR {formatChf(overview.arr_chf)}</Text>
      </View>
      <View style={styles.mrrSplit}>
        <View style={styles.mrrSplitCell}>
          <Text style={styles.mrrSplitValue}>{formatChf(overview.new_mrr_this_month_chf)}</Text>
          <Text style={styles.mrrSplitLabel}>Nouveau ce mois</Text>
        </View>
        <View style={styles.mrrSplitCell}>
          <Text style={styles.mrrSplitValue}>{formatChf(overview.churned_mrr_this_month_chf)}</Text>
          <Text style={styles.mrrSplitLabel}>Perdu ce mois</Text>
        </View>
        <View style={styles.mrrSplitCell}>
          <Text style={styles.mrrSplitValue}>{formatChf(overview.mrr_trialing_chf)}</Text>
          <Text style={styles.mrrSplitLabel}>En essai</Text>
        </View>
      </View>
      {cancelPct !== null && cancelPct > 0 ? (
        <Text style={styles.mrrWarn}>
          {cancelPct.toLocaleString('fr-CH', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} % des abonnements vivants ont une résiliation programmée.
        </Text>
      ) : null}
    </View>
  );
}

type AccountingOverview = NonNullable<Awaited<ReturnType<typeof accAdmin.overview>>['data']>;

function Ecosystem() {
  const router = useRouter();
  const [partners, setPartners] = useState<PartnersOverview | null>(null);
  const [fiduciaries, setFiduciaries] = useState<AccountingOverview | null>(null);
  useEffect(() => {
    partnersAdmin.overview().then(({ data }) => setPartners(data));
    accAdmin.overview().then(({ data }) => setFiduciaries(data));
  }, []);
  const row = (label: string, value: string) => (
    <View style={styles.ecoLine}>
      <Text style={styles.ecoLineLabel}>{label}</Text>
      <Text style={styles.ecoLineValue}>{value}</Text>
    </View>
  );
  return (
    <View style={styles.ecoRow}>
      <AdminCard style={styles.ecoCard} onPress={() => router.replace('/(admin)/partners' as any)}>
        <View style={styles.ecoHead}>
          <Feather name="award" size={15} color={colors.plum} />
          <Text style={styles.ecoTitle}>Cantia Partners</Text>
          <Feather name="chevron-right" size={16} color={colors.textMuted} />
        </View>
        {row('Partenaires actifs', partners ? String(partners.partners_active) : '—')}
        {row('Clients payants amenés', partners ? String(partners.paying_customers) : '—')}
        {row('Commissions dues', partners ? formatChf(Number(partners.available_chf) + Number(partners.pending_chf)) : '—')}
      </AdminCard>
      <AdminCard style={styles.ecoCard} onPress={() => router.replace('/(admin)/fiduciaires' as any)}>
        <View style={styles.ecoHead}>
          <Feather name="shield" size={15} color={colors.plum} />
          <Text style={styles.ecoTitle}>Cantia Accounting</Text>
          <Feather name="chevron-right" size={16} color={colors.textMuted} />
        </View>
        {row('Fiduciaires', fiduciaries ? String(fiduciaries.firms) : '—')}
        {row('Mandants liés', fiduciaries ? String(fiduciaries.linked_clients) : '—')}
        {row('MRR acquis par les fiduciaires', fiduciaries ? formatChf(Number(fiduciaries.acquired_mrr_chf)) : '—')}
      </AdminCard>
    </View>
  );
}

function greeting(): string {
  const h = new Date().getHours();
  return h < 5 ? 'Bonsoir' : h < 12 ? 'Bonjour' : h < 18 ? 'Bon après-midi' : 'Bonsoir';
}

export default function AdminHome() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  // Two columns once the page itself (window minus the side menu) is wide enough.
  const wide = width >= 1100;
  const { stats, overview, trialForecast, attention, refreshing, error, newSignal, refresh } = useAdminData();

  const signupsThisWeek = useMemo(() => (overview?.timeseries ?? []).slice(-7).reduce((sum, p) => sum + p.signups, 0), [overview]);
  const scheduledCancelPct = useMemo(() => {
    if (!overview) return null;
    const base = overview.active_count + overview.trialing_count + overview.trialing_cancelling_count;
    return base > 0 ? (overview.scheduled_cancellations_count / base) * 100 : 0;
  }, [overview]);
  const todos = useMemo(() => todoItems(attention, overview), [attention, overview]);
  const urgent = todos.filter((t) => t.level === 'urgent').length;
  const today = new Date().toLocaleDateString('fr-CH', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <AdminPage
      eyebrow={today}
      title={greeting()}
      subtitle={urgent > 0 ? `${plural(urgent, 'point attend', 'points attendent')} une action.` : 'Rien d’urgent : tout est à jour.'}
      actions={<AdminRefreshButton onPress={refresh} loading={refreshing} hasSignal={newSignal} />}
    >
      {error ? <AdminErrorBanner message={error} /> : null}

      <AdminSection title="Chiffres du moment">
        <View style={[styles.columns, wide && styles.columnsWide]}>
          {overview ? (
            <View style={wide ? styles.colSideFixed : undefined}>
              <MrrCard overview={overview} cancelPct={scheduledCancelPct} />
            </View>
          ) : null}
          <View style={[{ gap: spacing.md }, wide ? styles.colMain : undefined]}>
            <KpiRow>
              <Kpi label="Clients payants" value={String(overview?.active_count ?? stats?.paid_subscriptions_count ?? 0)} icon="check-circle" tone="success" onPress={() => router.push('/(admin)/subscriptions' as any)} />
              <Kpi label="En essai" value={String(overview?.trialing_count ?? stats?.active_trials_count ?? 0)} icon="clock" sub={overview && overview.trialing_cancelling_count > 0 ? `dont ${overview.trialing_cancelling_count} déjà résilié${overview.trialing_cancelling_count > 1 ? 's' : ''}` : undefined} onPress={() => router.push('/(admin)/subscriptions' as any)} />
              <Kpi label="Offerts" value={String(stats?.complimentary_count ?? overview?.complimentary_count ?? 0)} icon="gift" sub="Comptes gratuits à vie" />
            </KpiRow>
            <KpiRow>
              <Kpi label="Inscriptions 7 j" value={String(signupsThisWeek)} icon="user-plus" tone="primary" onPress={() => router.push('/(admin)/organizations' as any)} />
              <Kpi label="Entreprises" value={(stats?.organizations_count ?? 0).toLocaleString('fr-CH')} icon="briefcase" sub={`${(stats?.users_count ?? 0).toLocaleString('fr-CH')} utilisateurs`} onPress={() => router.push('/(admin)/organizations' as any)} />
              <Kpi
                label="Encaissé"
                value={overview ? formatChf(overview.ca_this_month_chf) : '—'}
                icon="dollar-sign"
                tone="success"
                sub={overview ? `Ce mois, net des frais Stripe · ${formatChf(overview.ca_total_chf)} au total` : undefined}
                onPress={() => router.push('/(admin)/rentabilite' as any)}
              />
            </KpiRow>
          </View>
        </View>
      </AdminSection>

      <View style={[styles.columns, wide && styles.columnsWide]}>
        <View style={[styles.stack, wide && styles.colMain]}>
          {todos.length > 0 ? (
            <AdminSection
              title={urgent > 0 ? 'À traiter' : 'À savoir'}
              subtitle={urgent > 0 ? 'Ce qui attend une action, puis ce qui est bon à savoir.' : 'Rien d’urgent, seulement ce qui est bon à savoir.'}
            >
              <TodoList items={todos} />
            </AdminSection>
          ) : null}
          <AdminSection title="Essais en cours" subtitle="Par date de fin, avec le montant réel facturé à la conversion.">
            <TrialForecast rows={trialForecast} />
          </AdminSection>
          <AdminSection title="Écosystème">
            <Ecosystem />
          </AdminSection>
        </View>
        <AdminSection title="Dernière activité" style={wide ? styles.colSide : undefined}>
          <RecentActivity />
        </AdminSection>
      </View>

      {overview ? (
        <AdminSection title="Croissance" subtitle="Inscriptions, argent encaissé et clients payants cumulés, par période.">
          <GrowthChart points={overview.timeseries} />
        </AdminSection>
      ) : null}


      {overview ? (
        <AdminSection title="Cash encaissé par mois" subtitle="Factures Stripe payées, frais Stripe déduits.">
          <CashCollectedChart points={overview.timeseries} />
        </AdminSection>
      ) : null}
    </AdminPage>
  );
}

const styles = StyleSheet.create({
  columns: { gap: spacing.xl },
  columnsWide: { flexDirection: 'row', alignItems: 'flex-start' },
  colMain: { flex: 1.35, minWidth: 0 },
  colSide: { flex: 1, minWidth: 0 },
  colSideFixed: { width: 340 },
  stack: { gap: spacing.xl },
  ecoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  ecoCard: { flexGrow: 1, flexBasis: 240, minWidth: 0 },
  todo: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  todoBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  todoHover: { backgroundColor: colors.bg },
  todoIcon: { width: 32, height: 32, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center' },
  todoIconUrgent: { backgroundColor: colors.primarySoft },
  todoIconInfo: { backgroundColor: colors.surfaceAlt },
  todoText: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text },
  todoHint: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 1 },
  loadingText: { fontSize: fontSize.xs, color: colors.textMuted, padding: spacing.lg },
  event: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.lg, paddingVertical: 10 },
  eventIcon: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  eventTitle: { fontSize: fontSize.sm, fontWeight: '600', color: colors.text },
  eventSub: { fontSize: 11.5, color: colors.textMuted, marginTop: 1 },
  eventTime: { fontSize: 11.5, color: colors.textMuted, fontVariant: ['tabular-nums'] },
  cardFootLink: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
  cardFootText: { fontSize: fontSize.xs, fontWeight: '700', color: colors.primary },
  mrr: { backgroundColor: ink.bg, borderRadius: radius.xl, padding: spacing.xl, gap: spacing.sm },
  mrrLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', color: ink.accent },
  mrrValue: { ...adminDisplay, fontSize: 42, lineHeight: 48, fontWeight: '700', color: ink.text, fontVariant: ['tabular-nums'] },
  mrrMeta: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.md },
  mrrChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.pill },
  mrrChipText: { fontSize: fontSize.xs, fontWeight: '700' },
  mrrSub: { fontSize: fontSize.xs, color: ink.muted, fontWeight: '600' },
  mrrSplit: { flexDirection: 'row', gap: spacing.md, borderTopWidth: 1, borderTopColor: ink.line, marginTop: spacing.sm, paddingTop: spacing.md },
  mrrSplitCell: { flex: 1, minWidth: 0, gap: 2 },
  mrrSplitValue: { fontSize: fontSize.md, fontWeight: '700', color: ink.text, fontVariant: ['tabular-nums'] },
  mrrSplitLabel: { fontSize: 11, color: ink.muted },
  mrrWarn: { fontSize: fontSize.xs, color: '#f3c37a', marginTop: spacing.xs },
  ecoHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  ecoTitle: { flex: 1, fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  ecoLine: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md, paddingVertical: 5 },
  ecoLineLabel: { fontSize: fontSize.sm, color: colors.textMuted, flexShrink: 1 },
  ecoLineValue: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text, fontVariant: ['tabular-nums'] },
});
