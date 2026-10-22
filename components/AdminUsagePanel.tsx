import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, fontSize, radius, spacing } from '../lib/theme';

// Super Admin: the "Utilisation" panel shared by Fiduciaires and
// Entreprises — people, 30-day activity, features, screens, latest actions.
// Internal tool: French only.

export interface UsageData {
  features: { key: string; label?: string; count: number; last_at: string | null; extra: string | null }[];
  members: {
    user_id: string;
    name: string | null;
    email: string;
    role: string;
    last_seen_at: string | null;
    last_sign_in_at: string | null;
    active_days_30: number;
    top_areas: string[];
  }[];
  areas: { area: string; views: number; users: number; days: number; last_at: string }[];
  daily: { day: string; views: number; users: number }[];
  recent: { at: string; kind: 'action' | 'screen'; key: string; label?: string; actor: string | null; client?: string | null; views?: number }[];
}

export interface UsageLabels {
  feature: (key: string) => string;
  area: (area: string) => string;
  action: (key: string, label: string | undefined, count: number | undefined) => string;
  role: (role: string) => string;
  // Features that are yes/no (logo, directory…), shown as "oui".
  flags?: string[];
  // Who did an action nobody is recorded for (e.g. "client").
  unknownActor?: string;
}

export function relativeTime(iso: string | null): string {
  if (!iso) return 'jamais';
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 2) return 'à l’instant';
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.round(hours / 24);
  if (days === 1) return 'hier';
  if (days < 30) return `il y a ${days} jours`;
  return new Date(iso).toLocaleDateString('fr-CH', { day: 'numeric', month: 'short', year: 'numeric' });
}

function dateTime(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('fr-CH', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// Green under a week, amber under a month, red beyond (or never).
export function freshnessColor(iso: string | null): string {
  if (!iso) return colors.danger;
  const days = (Date.now() - new Date(iso).getTime()) / 86400000;
  return days < 7 ? colors.success : days < 30 ? colors.warning : colors.danger;
}

export function UsagePanel({ usage, labels }: { usage: UsageData; labels: UsageLabels }) {
  const used = usage.features.filter((f) => f.count > 0);
  const unused = usage.features.filter((f) => f.count === 0);
  const maxViews = Math.max(1, ...usage.daily.map((d) => d.views));
  const totalViews = usage.daily.reduce((n, d) => n + d.views, 0);
  const activeDays = usage.daily.filter((d) => d.views > 0).length;

  return (
    <View style={st.wrap}>
      <Text style={st.title}>Personnes</Text>
      <View style={st.list}>
        {usage.members.map((m) => (
          <View key={m.user_id} style={st.person}>
            <View style={[st.dot, { backgroundColor: freshnessColor(m.last_seen_at ?? m.last_sign_in_at) }]} />
            <View style={{ flex: 1, minWidth: 200 }}>
              <Text style={st.strong}>
                {m.name || m.email} <Text style={st.muted}>· {labels.role(m.role)}</Text>
              </Text>
              <Text style={st.muted}>{m.email}</Text>
              {m.top_areas.length > 0 ? <Text style={st.muted}>Utilise surtout : {m.top_areas.slice(0, 3).map(labels.area).join(' · ')}</Text> : null}
            </View>
            <View style={st.personMeta}>
              <Text style={st.metaStrong}>Vu {relativeTime(m.last_seen_at)}</Text>
              <Text style={st.muted}>Connexion {relativeTime(m.last_sign_in_at)}</Text>
              <Text style={st.muted}>{m.active_days_30} jour{m.active_days_30 > 1 ? 's' : ''} actif{m.active_days_30 > 1 ? 's' : ''} / 30</Text>
            </View>
          </View>
        ))}
      </View>

      <Text style={st.title}>Activité des 30 derniers jours</Text>
      <View style={st.chartCard}>
        <Text style={st.muted}>
          {totalViews} écran{totalViews > 1 ? 's' : ''} ouvert{totalViews > 1 ? 's' : ''} sur {activeDays} jour{activeDays > 1 ? 's' : ''}
        </Text>
        <View style={st.chart} accessibilityLabel={`Activité quotidienne, maximum ${maxViews} écrans par jour`}>
          {usage.daily.map((d) => (
            <View key={d.day} style={st.barSlot}>
              <View style={[st.bar, { height: d.views > 0 ? Math.max(3, (d.views / maxViews) * 64) : 1, backgroundColor: d.views > 0 ? colors.primary : colors.border }]} />
            </View>
          ))}
        </View>
        <View style={st.chartAxis}>
          <Text style={st.axis}>{new Date(usage.daily[0]?.day ?? Date.now()).toLocaleDateString('fr-CH', { day: 'numeric', month: 'short' })}</Text>
          <Text style={st.axis}>max {maxViews} / jour</Text>
          <Text style={st.axis}>aujourd’hui</Text>
        </View>
      </View>

      <Text style={st.title}>
        Fonctions utilisées ({used.length} / {usage.features.length})
      </Text>
      <View style={st.grid}>
        {used.map((f) => (
          <View key={f.key} style={st.feature}>
            <Feather name="check-circle" size={14} color={colors.success} />
            <View style={{ flex: 1 }}>
              <Text style={st.strong}>{f.label ?? labels.feature(f.key)}</Text>
              <Text style={st.muted}>
                {[labels.flags?.includes(f.key) ? 'oui' : String(f.count), f.extra, f.last_at ? `dernier ${relativeTime(f.last_at)}` : null].filter(Boolean).join(' · ')}
              </Text>
            </View>
          </View>
        ))}
      </View>
      {unused.length > 0 ? (
        <Text style={st.muted}>Jamais utilisé : {unused.map((f) => f.label ?? labels.feature(f.key)).join(', ')}</Text>
      ) : null}

      <Text style={st.title}>Écrans et exports (90 jours)</Text>
      {usage.areas.length === 0 ? (
        <Text style={st.muted}>Rien d’enregistré pour l’instant : le suivi des écrans démarre avec cette version.</Text>
      ) : (
        <View style={st.list}>
          {usage.areas.map((a) => (
            <View key={a.area} style={st.areaRow}>
              <Text style={[st.row, { flex: 1 }]}>{labels.area(a.area)}</Text>
              <Text style={st.num}>{a.views}×</Text>
              <Text style={st.areaMeta}>
                {a.days} j · {a.users} pers. · {relativeTime(a.last_at)}
              </Text>
            </View>
          ))}
        </View>
      )}

      <Text style={st.title}>Dernières actions</Text>
      {usage.recent.length === 0 ? <Text style={st.muted}>Aucune action enregistrée.</Text> : null}
      <View style={st.list}>
        {usage.recent.slice(0, 30).map((r, i) => (
          <View key={`${r.at}-${i}`} style={st.event}>
            <Feather name={r.kind === 'action' ? 'zap' : 'eye'} size={13} color={r.kind === 'action' ? colors.primary : colors.textMuted} style={{ marginTop: 3 }} />
            <View style={{ flex: 1 }}>
              <Text style={st.row}>
                {r.kind === 'action' ? labels.action(r.key, r.label, r.views) : `${labels.area(r.key)}${r.views && r.views > 1 ? ` (${r.views}× ce jour-là)` : ''}`}
                {r.client ? <Text style={st.muted}> · {r.client}</Text> : null}
              </Text>
              <Text style={st.muted}>
                {[r.actor ?? (r.kind === 'action' ? labels.unknownActor ?? null : null), dateTime(r.at)].filter(Boolean).join(' · ')}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  wrap: { gap: spacing.md },
  title: { fontSize: fontSize.xs, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: spacing.sm },
  list: { gap: 6 },
  person: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start', gap: spacing.md, backgroundColor: colors.bg, borderRadius: radius.md, padding: spacing.md },
  dot: { width: 8, height: 8, borderRadius: 4, marginTop: 6 },
  personMeta: { alignItems: 'flex-end', gap: 1 },
  strong: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text },
  metaStrong: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text },
  muted: { fontSize: 12, color: colors.textMuted, fontWeight: '400' },
  row: { fontSize: fontSize.sm, color: colors.text, lineHeight: 20 },
  chartCard: { backgroundColor: colors.bg, borderRadius: radius.md, padding: spacing.md, gap: spacing.sm },
  chart: { flexDirection: 'row', alignItems: 'flex-end', height: 66, gap: 2 },
  barSlot: { flex: 1, alignItems: 'stretch', justifyContent: 'flex-end' },
  bar: { borderTopLeftRadius: 2, borderTopRightRadius: 2 },
  chartAxis: { flexDirection: 'row', justifyContent: 'space-between' },
  axis: { fontSize: 11, color: colors.textMuted, fontVariant: ['tabular-nums'] },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  feature: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start', flexGrow: 1, flexBasis: 240, backgroundColor: colors.successSoft, borderRadius: radius.md, padding: spacing.sm },
  areaRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border, paddingVertical: 6 },
  num: { fontSize: fontSize.sm, fontWeight: '800', color: colors.text, fontVariant: ['tabular-nums'], minWidth: 40, textAlign: 'right' },
  areaMeta: { fontSize: 12, color: colors.textMuted, minWidth: 170, textAlign: 'right' },
  event: { flexDirection: 'row', gap: spacing.sm },
});
