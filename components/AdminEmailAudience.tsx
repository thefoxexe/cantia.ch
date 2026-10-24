import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { getEmailAudience, type AudienceFilters, type AudienceRow } from '../lib/api/newsletter';
import { SECTORS, sectorOf, tradeValuesForSector } from '../lib/trades';
import { fr } from '../lib/translations/fr';
import { colors, fontSize, radius, spacing } from '../lib/theme';

// Super Admin › E-mails: build an audience from what Cantia knows about each
// company (sector and trades, plan, account status, language, activity,
// modules used, sign-up channel), see who it is, then add it to the
// selection. Internal tool: French only.

const PLANS: { id: string; label: string }[] = [
  { id: 'solo', label: 'Essentiel' },
  { id: 'equipe', label: 'Équipe' },
  { id: 'pro', label: 'Entreprise' },
  { id: 'decouverte', label: 'Découverte' },
  { id: 'custom', label: 'Sur mesure' },
];
const PLAN_LABEL: Record<string, string> = Object.fromEntries(PLANS.map((p) => [p.id, p.label]));

const STATUSES: { id: string; label: string }[] = [
  { id: 'active', label: 'Abonné actif' },
  { id: 'trialing', label: 'En essai' },
  { id: 'trial_expired', label: 'Essai terminé' },
  { id: 'past_due', label: 'Paiement en retard' },
  { id: 'canceled', label: 'Résilié' },
  { id: 'none', label: 'Sans abonnement' },
];

const LOCALES: { id: string; label: string }[] = [
  { id: 'fr', label: 'Français' },
  { id: 'de', label: 'Allemand' },
  { id: 'it', label: 'Italien' },
];

const ACTIVITY: { id: AudienceFilters['activity'] | null; label: string }[] = [
  { id: null, label: 'Tous' },
  { id: 'active7', label: 'Actifs (7 j)' },
  { id: 'active30', label: 'Actifs (30 j)' },
  { id: 'inactive30', label: 'Inactifs depuis 30 j' },
  { id: 'never', label: 'N’a jamais rien ouvert' },
];

// Area prefixes as tracked by org_track (lib/api/usage.ts routeArea).
const MODULES: { id: string; label: string; areas: string[] }[] = [
  { id: 'devis', label: 'Devis', areas: ['devis'] },
  { id: 'factures', label: 'Factures', areas: ['factures'] },
  { id: 'soumissions', label: 'Soumissions', areas: ['metre', 'metres', 'soumissions'] },
  { id: 'planning', label: 'Planning', areas: ['planning'] },
  { id: 'gantt', label: 'Planning de chantier', areas: ['gantt'] },
  { id: 'rapports', label: 'Rapports', areas: ['rapports', 'rapport-new'] },
  { id: 'salaires', label: 'Salaires', areas: ['salaires', 'fiches-salaire', 'employes'] },
  { id: 'compta', label: 'Comptabilité', areas: ['compta'] },
  { id: 'tresorerie', label: 'Trésorerie', areas: ['tresorerie'] },
  { id: 'commercial', label: 'Commercial', areas: ['commercial'] },
];

const CHANNELS: { id: string; label: string }[] = [
  { id: 'site', label: 'Site cantia.ch' },
  { id: 'ai', label: 'Assistant IA' },
  { id: 'google_ads', label: 'Google Ads' },
  { id: 'blog', label: 'Blog' },
  { id: 'campaign', label: 'Campagne' },
  { id: 'partner', label: 'Partenaire' },
  { id: 'fiduciary', label: 'Fiduciaire' },
  { id: 'direct', label: 'Accès direct' },
  { id: 'unknown', label: 'Inconnu' },
];

const SINCE: { days: number | null; label: string }[] = [
  { days: null, label: 'Tous' },
  { days: 7, label: '7 derniers jours' },
  { days: 30, label: '30 derniers jours' },
  { days: 90, label: '3 derniers mois' },
];

function specialtyLabel(key: string): string {
  return (fr.specialties as Record<string, string>)[key] ?? key;
}

function sectorLabel(trade: string | null): string {
  return sectorOf(trade)?.label ?? trade ?? 'Sans secteur';
}

function ago(iso: string | null): string {
  if (!iso) return 'jamais';
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days <= 0) return 'aujourd’hui';
  if (days === 1) return 'hier';
  if (days < 30) return `il y a ${days} j`;
  if (days < 365) return `il y a ${Math.floor(days / 30)} mois`;
  return `il y a ${Math.floor(days / 365)} an${days >= 730 ? 's' : ''}`;
}

function toggle<T>(list: T[], v: T): T[] {
  return list.includes(v) ? list.filter((x) => x !== v) : [...list, v];
}

export interface AudienceAddition {
  rows: AudienceRow[];
  label: string;
  includesUnsubscribed: boolean;
  replace: boolean;
}

export function AdminEmailAudience({ onAdd }: { onAdd: (a: AudienceAddition) => void }) {
  const [base, setBase] = useState<AudienceRow[] | null>(null);
  const [sectors, setSectors] = useState<string[]>([]);
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [plans, setPlans] = useState<string[]>([]);
  const [statuses, setStatuses] = useState<string[]>([]);
  const [locales, setLocales] = useState<string[]>([]);
  const [activity, setActivity] = useState<AudienceFilters['activity'] | null>(null);
  const [used, setUsed] = useState<string[]>([]);
  const [notUsed, setNotUsed] = useState<string[]>([]);
  const [channels, setChannels] = useState<string[]>([]);
  const [since, setSince] = useState<number | null>(null);
  const [ownersOnly, setOwnersOnly] = useState(false);
  const [withUnsubscribed, setWithUnsubscribed] = useState(false);
  const [showMore, setShowMore] = useState(false);

  const [rows, setRows] = useState<AudienceRow[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showList, setShowList] = useState(false);

  // Counts on the chips: everyone, before any filter.
  useEffect(() => {
    getEmailAudience({ subscribed: null }).then(({ rows: r }) => setBase(r));
  }, []);

  const filters: AudienceFilters = useMemo(
    () => ({
      trades: sectors.flatMap(tradeValuesForSector),
      specialties,
      plans: plans.includes('custom') ? [...plans, 'illimite', 'custom-besson'] : plans,
      statuses,
      locales,
      activity: activity ?? undefined,
      used: used.flatMap((id) => MODULES.find((m) => m.id === id)?.areas ?? []),
      not_used: notUsed.flatMap((id) => MODULES.find((m) => m.id === id)?.areas ?? []),
      channels,
      created_days: since ?? undefined,
      owners_only: ownersOnly || undefined,
      subscribed: withUnsubscribed ? null : true,
    }),
    [sectors, specialties, plans, statuses, locales, activity, used, notUsed, channels, since, ownersOnly, withUnsubscribed],
  );

  useEffect(() => {
    let alive = true;
    setLoading(true);
    const timer = setTimeout(async () => {
      const { rows: r, error: err } = await getEmailAudience(filters);
      if (!alive) return;
      setRows(r);
      setError(err);
      setLoading(false);
    }, 250);
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [filters]);

  const sectorCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const r of base ?? []) {
      const k = sectorOf(r.trade)?.key ?? 'autre';
      m.set(k, (m.get(k) ?? 0) + 1);
    }
    return m;
  }, [base]);
  const specialtyCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const r of base ?? []) for (const s of r.specialties ?? []) m.set(s, (m.get(s) ?? 0) + 1);
    return m;
  }, [base]);

  // Trades of the chosen sectors, the ones somebody has first.
  const visibleSpecialties = useMemo(() => {
    const keys = SECTORS.filter((s) => sectors.includes(s.key)).flatMap((s) => s.specialties);
    return [...keys].sort((a, b) => (specialtyCounts.get(b) ?? 0) - (specialtyCounts.get(a) ?? 0));
  }, [sectors, specialtyCounts]);

  const breakdown = useMemo(() => {
    const byLocale = new Map<string, number>();
    const byPlan = new Map<string, number>();
    const orgs = new Set<string>();
    let unsubscribed = 0;
    for (const r of rows ?? []) {
      byLocale.set(r.locale, (byLocale.get(r.locale) ?? 0) + 1);
      const p = PLAN_LABEL[r.plan_id ?? ''] ?? (r.plan_id ? 'Sur mesure' : 'Sans plan');
      byPlan.set(p, (byPlan.get(p) ?? 0) + 1);
      orgs.add(r.organization_id);
      if (!r.subscribed) unsubscribed += 1;
    }
    return { byLocale, byPlan, orgs: orgs.size, unsubscribed };
  }, [rows]);

  const label = useMemo(() => {
    const parts: string[] = [];
    if (sectors.length) parts.push(sectors.map((k) => SECTORS.find((s) => s.key === k)?.label ?? k).join(', '));
    if (specialties.length) parts.push(specialties.map(specialtyLabel).join(', '));
    if (plans.length) parts.push(plans.map((p) => PLAN_LABEL[p] ?? p).join(', '));
    if (statuses.length) parts.push(statuses.map((s) => STATUSES.find((x) => x.id === s)?.label ?? s).join(', '));
    if (locales.length) parts.push(locales.map((l) => l.toUpperCase()).join('/'));
    if (activity) parts.push(ACTIVITY.find((a) => a.id === activity)?.label ?? activity);
    if (used.length) parts.push(`A utilisé ${used.map((u) => MODULES.find((m) => m.id === u)?.label).join(', ')}`);
    if (notUsed.length) parts.push(`Jamais ${notUsed.map((u) => MODULES.find((m) => m.id === u)?.label).join(', ')}`);
    if (channels.length) parts.push(`Canal ${channels.map((c) => CHANNELS.find((x) => x.id === c)?.label).join(', ')}`);
    if (since) parts.push(`Inscrits ${SINCE.find((s) => s.days === since)?.label.toLowerCase()}`);
    if (ownersOnly) parts.push('Propriétaires');
    return parts.length ? parts.join(' · ') : 'Tous les clients';
  }, [sectors, specialties, plans, statuses, locales, activity, used, notUsed, channels, since, ownersOnly]);

  const activeCount =
    sectors.length + specialties.length + plans.length + statuses.length + locales.length + (activity ? 1 : 0) + used.length + notUsed.length + channels.length + (since ? 1 : 0) + (ownersOnly ? 1 : 0);

  function reset() {
    setSectors([]);
    setSpecialties([]);
    setPlans([]);
    setStatuses([]);
    setLocales([]);
    setActivity(null);
    setUsed([]);
    setNotUsed([]);
    setChannels([]);
    setSince(null);
    setOwnersOnly(false);
    setWithUnsubscribed(false);
  }

  function add(replace: boolean) {
    if (!rows?.length) return;
    onAdd({ rows, label, includesUnsubscribed: breakdown.unsubscribed > 0, replace });
  }

  return (
    <View style={styles.card}>
      <View style={styles.headRow}>
        <View style={{ flex: 1, minWidth: 200 }}>
          <Text style={styles.title}>Ciblage</Text>
          <Text style={styles.hint}>Combinez les critères : chaque groupe réduit la liste, plusieurs choix dans un groupe s’additionnent.</Text>
        </View>
        {activeCount > 0 ? (
          <Pressable onPress={reset} hitSlop={6}>
            <Text style={styles.link}>Effacer les critères ({activeCount})</Text>
          </Pressable>
        ) : null}
      </View>

      <Group label="Secteur d’activité">
        {SECTORS.filter((s) => (sectorCounts.get(s.key) ?? 0) > 0 || sectors.includes(s.key)).map((s) => (
          <Chip
            key={s.key}
            label={s.label}
            count={sectorCounts.get(s.key)}
            on={sectors.includes(s.key)}
            onPress={() => {
              const next = toggle(sectors, s.key);
              setSectors(next);
              const allowed = new Set(SECTORS.filter((x) => next.includes(x.key)).flatMap((x) => x.specialties));
              setSpecialties((prev) => prev.filter((k) => allowed.has(k)));
            }}
          />
        ))}
        {SECTORS.filter((s) => !(sectorCounts.get(s.key) ?? 0) && !sectors.includes(s.key)).length ? (
          <Text style={styles.muted}>Les secteurs sans client sont masqués.</Text>
        ) : null}
      </Group>

      {visibleSpecialties.length ? (
        <Group label="Métiers">
          {visibleSpecialties.map((k) => (
            <Chip key={k} label={specialtyLabel(k)} count={specialtyCounts.get(k)} on={specialties.includes(k)} onPress={() => setSpecialties(toggle(specialties, k))} />
          ))}
        </Group>
      ) : null}

      <Group label="Plan">
        {PLANS.map((p) => (
          <Chip key={p.id} label={p.label} on={plans.includes(p.id)} onPress={() => setPlans(toggle(plans, p.id))} />
        ))}
      </Group>

      <Group label="Situation du compte">
        {STATUSES.map((s) => (
          <Chip key={s.id} label={s.label} on={statuses.includes(s.id)} onPress={() => setStatuses(toggle(statuses, s.id))} />
        ))}
      </Group>

      <Group label="Langue">
        {LOCALES.map((l) => (
          <Chip key={l.id} label={l.label} on={locales.includes(l.id)} onPress={() => setLocales(toggle(locales, l.id))} />
        ))}
      </Group>

      <Group label="Activité dans l’app">
        {ACTIVITY.map((a) => (
          <Chip key={a.label} label={a.label} on={activity === a.id} radio onPress={() => setActivity(a.id)} />
        ))}
      </Group>

      <Pressable onPress={() => setShowMore((v) => !v)} style={styles.moreToggle} hitSlop={4}>
        <Feather name={showMore ? 'chevron-up' : 'chevron-down'} size={14} color={colors.primary} />
        <Text style={styles.link}>{showMore ? 'Moins de critères' : 'Plus de critères : modules utilisés, canal d’inscription, ancienneté, rôle'}</Text>
      </Pressable>

      {showMore ? (
        <>
          <Group label="A déjà utilisé">
            {MODULES.map((m) => (
              <Chip
                key={m.id}
                label={m.label}
                on={used.includes(m.id)}
                onPress={() => {
                  setUsed(toggle(used, m.id));
                  setNotUsed((prev) => prev.filter((x) => x !== m.id));
                }}
              />
            ))}
          </Group>
          <Group label="N’a jamais utilisé">
            {MODULES.map((m) => (
              <Chip
                key={m.id}
                label={m.label}
                on={notUsed.includes(m.id)}
                onPress={() => {
                  setNotUsed(toggle(notUsed, m.id));
                  setUsed((prev) => prev.filter((x) => x !== m.id));
                }}
              />
            ))}
          </Group>
          <Text style={styles.muted}>L’utilisation des modules est mesurée depuis le 22 octobre 2026.</Text>
          <Group label="Canal d’inscription">
            {CHANNELS.map((c) => (
              <Chip key={c.id} label={c.label} on={channels.includes(c.id)} onPress={() => setChannels(toggle(channels, c.id))} />
            ))}
          </Group>
          <Group label="Entreprise inscrite">
            {SINCE.map((s) => (
              <Chip key={s.label} label={s.label} on={since === s.days} radio onPress={() => setSince(s.days)} />
            ))}
          </Group>
          <Group label="Dans chaque entreprise">
            <Chip label="Tous les membres" on={!ownersOnly} radio onPress={() => setOwnersOnly(false)} />
            <Chip label="Propriétaire seulement" on={ownersOnly} radio onPress={() => setOwnersOnly(true)} />
          </Group>
          <Group label="Newsletter">
            <Chip label="Abonnés seulement" on={!withUnsubscribed} radio onPress={() => setWithUnsubscribed(false)} />
            <Chip label="Inclure les désabonnés" on={withUnsubscribed} radio warning onPress={() => setWithUnsubscribed(true)} />
          </Group>
        </>
      ) : null}

      <View style={styles.result}>
        <View style={{ flex: 1, minWidth: 220, gap: 4 }}>
          <Text style={styles.resultCount}>
            {loading && !rows ? '…' : `${rows?.length ?? 0} personne${(rows?.length ?? 0) > 1 ? 's' : ''}`}
            <Text style={styles.resultSub}>
              {rows ? `  ·  ${breakdown.orgs} entreprise${breakdown.orgs > 1 ? 's' : ''}` : ''}
              {loading && rows ? '  ·  mise à jour…' : ''}
            </Text>
          </Text>
          <Text style={styles.muted} numberOfLines={2}>
            {label}
          </Text>
          {rows?.length ? (
            <View style={styles.breakRow}>
              {LOCALES.map((l) =>
                breakdown.byLocale.get(l.id) ? (
                  <Text key={l.id} style={styles.badge}>
                    {l.id.toUpperCase()} {breakdown.byLocale.get(l.id)}
                  </Text>
                ) : null,
              )}
              {[...breakdown.byPlan.entries()].map(([p, n]) => (
                <Text key={p} style={[styles.badge, styles.badgeSoft]}>
                  {p} {n}
                </Text>
              ))}
              {breakdown.unsubscribed ? <Text style={[styles.badge, styles.badgeWarn]}>{breakdown.unsubscribed} désabonné{breakdown.unsubscribed > 1 ? 's' : ''}</Text> : null}
            </View>
          ) : null}
        </View>
        <View style={styles.actions}>
          <Pressable onPress={() => add(false)} disabled={!rows?.length} style={[styles.btn, !rows?.length && { opacity: 0.4 }]}>
            <Feather name="plus" size={14} color="#fff" />
            <Text style={styles.btnText}>Ajouter à la sélection</Text>
          </Pressable>
          <Pressable onPress={() => add(true)} disabled={!rows?.length} style={[styles.btnGhost, !rows?.length && { opacity: 0.4 }]}>
            <Text style={styles.btnGhostText}>Remplacer la sélection</Text>
          </Pressable>
        </View>
      </View>
      {error ? <Text style={[styles.muted, { color: colors.danger }]}>{error}</Text> : null}

      {rows?.length ? (
        <Pressable onPress={() => setShowList((v) => !v)} style={styles.moreToggle} hitSlop={4}>
          <Feather name={showList ? 'chevron-up' : 'chevron-down'} size={14} color={colors.primary} />
          <Text style={styles.link}>{showList ? 'Masquer la liste' : 'Voir qui c’est'}</Text>
        </Pressable>
      ) : null}
      {showList && rows ? (
        <View style={styles.list}>
          {rows.slice(0, 60).map((r) => (
            <View key={r.user_id} style={styles.listRow}>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.listName} numberOfLines={1}>
                  {r.full_name || r.email}
                  <Text style={styles.listMeta}>  {r.locale.toUpperCase()}{r.role === 'owner' ? ' · propriétaire' : ''}</Text>
                </Text>
                <Text style={styles.listMeta} numberOfLines={1}>
                  {r.organization_name} · {sectorLabel(r.trade)}
                  {r.specialties?.length ? ` (${r.specialties.slice(0, 3).map(specialtyLabel).join(', ')})` : ''}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.listMeta}>{PLAN_LABEL[r.plan_id ?? ''] ?? r.plan_id ?? '—'}</Text>
                <Text style={styles.listMeta}>{ago(r.last_active_at)}</Text>
              </View>
            </View>
          ))}
          {rows.length > 60 ? <Text style={styles.muted}>… et {rows.length - 60} autres.</Text> : null}
        </View>
      ) : null}
    </View>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={styles.groupLabel}>{label}</Text>
      <View style={styles.chips}>{children}</View>
    </View>
  );
}

function Chip({ label, count, on, onPress, radio, warning }: { label: string; count?: number; on: boolean; onPress: () => void; radio?: boolean; warning?: boolean }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, on && (warning ? styles.chipWarn : styles.chipOn)]}>
      {on && !radio ? <Feather name="check" size={11} color={warning ? colors.danger : colors.primary} /> : null}
      <Text style={[styles.chipText, on && { color: warning ? colors.danger : colors.primary, fontWeight: '700' }]}>{label}</Text>
      {count != null ? <Text style={styles.chipCount}>{count}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, backgroundColor: colors.surface, padding: spacing.lg, gap: spacing.md, marginBottom: spacing.lg },
  headRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.sm },
  title: { fontSize: fontSize.lg, fontWeight: '800', color: colors.text },
  hint: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
  muted: { fontSize: fontSize.xs, color: colors.textMuted },
  link: { fontSize: fontSize.xs, color: colors.primary, fontWeight: '700' },
  groupLabel: { fontSize: 11, fontWeight: '800', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, alignItems: 'center' },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  chipOn: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  chipWarn: { borderColor: colors.danger, backgroundColor: colors.dangerSoft },
  chipText: { fontSize: fontSize.xs, color: colors.text },
  chipCount: { fontSize: 10, color: colors.textMuted, fontVariant: ['tabular-nums'] },
  moreToggle: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start' },
  result: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.md, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.primarySoft },
  resultCount: { fontSize: fontSize.lg, fontWeight: '800', color: colors.text, fontVariant: ['tabular-nums'] },
  resultSub: { fontSize: fontSize.sm, fontWeight: '600', color: colors.textMuted },
  breakRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 2 },
  badge: { fontSize: 10, fontWeight: '800', color: colors.primary, backgroundColor: colors.surface, paddingHorizontal: 6, paddingVertical: 2, borderRadius: radius.pill, overflow: 'hidden' },
  badgeSoft: { color: colors.textMuted },
  badgeWarn: { color: colors.danger },
  actions: { gap: 6, alignItems: 'stretch' },
  btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingHorizontal: spacing.md, paddingVertical: 9, borderRadius: radius.md, backgroundColor: colors.primary },
  btnText: { color: '#fff', fontWeight: '800', fontSize: fontSize.sm },
  btnGhost: { alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: 7, borderRadius: radius.md, borderWidth: 1, borderColor: colors.primary },
  btnGhostText: { color: colors.primary, fontWeight: '700', fontSize: fontSize.xs },
  list: { borderTopWidth: 1, borderTopColor: colors.border },
  listRow: { flexDirection: 'row', gap: spacing.md, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border },
  listName: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text },
  listMeta: { fontSize: 11, color: colors.textMuted, fontWeight: '400' },
});
