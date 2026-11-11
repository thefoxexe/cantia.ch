import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Container, EmptyState, LoadingScreen } from '../../../components/ui';
import { AdminErrorBanner } from '../../../components/AdminErrorBanner';
import { AdminRefreshButton } from '../../../components/AdminRefreshButton';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';
import { listActivity, type ActivityEvent, type ActivityKind } from '../../../lib/api/admin';
import { adminDisplay as displayType } from '../../../lib/adminTheme';
import { CANCEL_REASON_LABELS } from '../../../components/AdminCancellationReasons';
import { PLAN_LABEL } from '../../../components/AdminEmailAudience';

// Super Admin › Journal: everything that happens on the platform, newest
// first, grouped by day (admin_activity_feed). The chips narrow it to one
// or several kinds; « Afficher plus » loads the next 150 events.

const PAGE = 150;

const KINDS: { id: ActivityKind; label: string; icon: keyof typeof Feather.glyphMap; color: string; soft: string }[] = [
  { id: 'signup', label: 'Inscriptions', icon: 'user-plus', color: colors.primary, soft: colors.primarySoft },
  { id: 'company', label: 'Entreprises', icon: 'briefcase', color: colors.primary, soft: colors.primarySoft },
  { id: 'subscription', label: 'Abonnements', icon: 'credit-card', color: colors.success, soft: colors.successSoft },
  { id: 'cancel_reason', label: 'Résiliations', icon: 'message-circle', color: colors.danger, soft: colors.dangerSoft },
  { id: 'email', label: 'E-mails', icon: 'mail', color: colors.slate, soft: colors.slateSoft },
  { id: 'fiduciary', label: 'Fiduciaires', icon: 'shield', color: colors.plum, soft: colors.plumSoft },
  { id: 'partner', label: 'Partenaires', icon: 'award', color: colors.plum, soft: colors.plumSoft },
  { id: 'sync_error', label: 'Erreurs Bexio', icon: 'alert-triangle', color: colors.danger, soft: colors.dangerSoft },
  { id: 'lead', label: 'Leads du blog', icon: 'download', color: colors.moss, soft: colors.mossSoft },
  { id: 'admin', label: 'Actions admin', icon: 'tool', color: colors.textMuted, soft: colors.surfaceAlt },
];
const KIND_BY_ID = Object.fromEntries(KINDS.map((k) => [k.id, k])) as Record<ActivityKind, (typeof KINDS)[number]>;

// Subscription events that are bad news get the red badge.
const NEGATIVE_ACTIONS = new Set(['canceled', 'email_failed', 'scheduled_failed']);

// What a fiduciary or a partner did, in words (fiduciary_audit_log and
// partner_audit_log keep a technical action key).
const ACTION_LABEL: Record<string, string> = {
  firm_created: 'Cabinet créé',
  firm_profile_updated: 'Profil du cabinet modifié',
  client_invited: 'Client invité',
  new_client_joined: 'Nouveau client rattaché',
  external_client_created: 'Client hors Cantia ajouté',
  external_client_updated: 'Client hors Cantia modifié',
  external_client_new_link: 'Nouveau lien envoyé à un client',
  request_created: 'Demande envoyée au client',
  request_open: 'Demande rouverte',
  request_answered: 'Demande répondue par le client',
  request_done: 'Demande terminée',
  request_cancelled: 'Demande annulée',
  request_remind: 'Client relancé',
  work_created: 'Travail créé',
  work_todo: 'Travail à faire',
  work_in_progress: 'Travail en cours',
  work_waiting_client: 'Travail en attente du client',
  work_review: 'Travail en révision',
  work_done: 'Travail terminé',
  partner_updated: 'Partenaire modifié',
  terms_set: 'Conditions de commission fixées',
};

function dayKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function dayLabel(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today.getTime() - 864e5);
  if (dayKey(iso) === dayKey(today.toISOString())) return 'Aujourd’hui';
  if (dayKey(iso) === dayKey(yesterday.toISOString())) return 'Hier';
  const label = d.toLocaleDateString('fr-CH', { weekday: 'long', day: 'numeric', month: 'long', ...(d.getFullYear() !== today.getFullYear() ? { year: 'numeric' } : {}) });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function timeLabel(iso: string): string {
  return new Date(iso).toLocaleTimeString('fr-CH', { hour: '2-digit', minute: '2-digit' });
}

function headline(e: ActivityEvent): string {
  if (e.kind === 'fiduciary' || e.kind === 'partner') return ACTION_LABEL[e.action] ?? e.action;
  return e.title;
}

// Plan ids and cancellation reason keys, in words.
function readable(e: ActivityEvent): string | null {
  if (!e.detail) return null;
  if (e.kind === 'subscription') return e.detail.split(' → ').map((id) => PLAN_LABEL[id] ?? id).join(' → ');
  if (e.kind === 'cancel_reason') return e.detail.replace(/^[a-z_]+/, (k) => CANCEL_REASON_LABELS[k] ?? k);
  return e.detail;
}

// The line under the headline: who it is about, then the detail.
function subline(e: ActivityEvent): string {
  const who = e.kind === 'fiduciary' ? e.title : e.kind === 'partner' ? e.title : e.kind === 'email' ? null : e.organization_name;
  const parts = [who, e.kind === 'fiduciary' && e.organization_name ? `client : ${e.organization_name}` : null, readable(e)];
  if (e.kind === 'email' && e.organization_name) parts.push(e.organization_name);
  return parts.filter(Boolean).join(' · ');
}

export default function AdminJournal() {
  const router = useRouter();
  const [rows, setRows] = useState<ActivityEvent[]>([]);
  const [kinds, setKinds] = useState<ActivityKind[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { rows: r, error: err } = await listActivity({ limit: PAGE, kinds });
    setRows(r);
    setHasMore(r.length === PAGE);
    setError(err);
    setLoading(false);
  }, [kinds]);

  useEffect(() => {
    load();
  }, [load]);

  async function loadMore() {
    const last = rows[rows.length - 1];
    if (!last) return;
    setLoadingMore(true);
    const { rows: r, error: err } = await listActivity({ limit: PAGE, kinds, before: last.at });
    setRows((prev) => [...prev, ...r]);
    setHasMore(r.length === PAGE);
    if (err) setError(err);
    setLoadingMore(false);
  }

  function toggleKind(k: ActivityKind) {
    setKinds((prev) => (prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k]));
  }

  // Today's count per kind, shown at the top.
  const today = useMemo(() => {
    const key = dayKey(new Date().toISOString());
    const counts = new Map<ActivityKind, number>();
    for (const e of rows) if (dayKey(e.at) === key) counts.set(e.kind, (counts.get(e.kind) ?? 0) + 1);
    return counts;
  }, [rows]);

  const groups = useMemo(() => {
    const out: { key: string; label: string; items: ActivityEvent[] }[] = [];
    for (const e of rows) {
      const key = dayKey(e.at);
      const last = out[out.length - 1];
      if (last && last.key === key) last.items.push(e);
      else out.push({ key, label: dayLabel(e.at), items: [e] });
    }
    return out;
  }, [rows]);

  return (
    // style={{ flex: 1 }}: see the other admin pages, the page does not
    // scroll on web without it.
    <ScrollView style={{ flex: 1 }}>
      <Container style={styles.container}>
        <View style={styles.header}>
          <View style={{ flexGrow: 1, flexBasis: 240, minWidth: 0 }}>
            <Text style={styles.title}>Journal</Text>
            <Text style={styles.hint}>
              Tout ce qui se passe sur Cantia : inscriptions, abonnements, e-mails envoyés, activité des fiduciaires et des partenaires, erreurs Bexio et
              actions admin. Le plus récent en premier.
            </Text>
          </View>
          <AdminRefreshButton onPress={load} loading={loading} />
        </View>

        {today.size ? (
          <View style={styles.todayRow}>
            <Text style={styles.todayLabel}>Aujourd’hui</Text>
            {[...today.entries()].map(([k, n]) => (
              <View key={k} style={[styles.todayPill, { backgroundColor: KIND_BY_ID[k].soft }]}>
                <Feather name={KIND_BY_ID[k].icon} size={12} color={KIND_BY_ID[k].color} />
                <Text style={[styles.todayPillText, { color: KIND_BY_ID[k].color }]}>
                  {KIND_BY_ID[k].label} {n}
                </Text>
              </View>
            ))}
          </View>
        ) : null}

        <View style={styles.chips}>
          <Pressable onPress={() => setKinds([])} style={[styles.chip, kinds.length === 0 && styles.chipActive]}>
            <Text style={[styles.chipText, kinds.length === 0 && styles.chipTextActive]}>Tout</Text>
          </Pressable>
          {KINDS.map((k) => {
            const active = kinds.includes(k.id);
            return (
              <Pressable key={k.id} onPress={() => toggleKind(k.id)} style={[styles.chip, active && styles.chipActive]}>
                <Feather name={k.icon} size={12} color={active ? colors.primary : colors.textMuted} />
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{k.label}</Text>
              </Pressable>
            );
          })}
        </View>

        {error ? <AdminErrorBanner message={error} /> : null}

        {loading ? (
          <LoadingScreen label="Chargement…" />
        ) : rows.length === 0 ? (
          <EmptyState title="Rien pour l’instant" subtitle={kinds.length ? 'Aucun événement de ce type.' : undefined} />
        ) : (
          <View style={{ gap: spacing.lg }}>
            {groups.map((g) => (
              <View key={g.key} style={{ gap: spacing.xs }}>
                <Text style={styles.day}>{g.label}</Text>
                <View style={styles.card}>
                  {g.items.map((e, i) => {
                    const k = KIND_BY_ID[e.kind] ?? KIND_BY_ID.admin;
                    const negative = NEGATIVE_ACTIONS.has(e.action);
                    const color = negative ? colors.danger : k.color;
                    const soft = negative ? colors.dangerSoft : k.soft;
                    const sub = subline(e);
                    const canOpen = !!e.organization_id;
                    return (
                      <Pressable
                        key={`${e.at}-${e.kind}-${i}`}
                        disabled={!canOpen}
                        onPress={() => canOpen && router.push(`/(admin)/organizations/${e.organization_id}` as any)}
                        style={({ pressed }) => [styles.row, i > 0 && styles.rowBorder, pressed && canOpen && styles.rowPressed]}
                      >
                        <View style={[styles.icon, { backgroundColor: soft }]}>
                          <Feather name={k.icon} size={15} color={color} />
                        </View>
                        <View style={{ flex: 1, minWidth: 0 }}>
                          <Text style={[styles.rowTitle, negative && { color: colors.danger }]}>{headline(e)}</Text>
                          {sub ? <Text style={styles.rowSub}>{sub}</Text> : null}
                          {e.actor ? <Text style={styles.rowActor}>par {e.actor}</Text> : null}
                        </View>
                        <View style={styles.rowEnd}>
                          <Text style={styles.time}>{timeLabel(e.at)}</Text>
                          {canOpen ? <Feather name="chevron-right" size={14} color={colors.textMuted} /> : null}
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ))}
            {hasMore ? (
              <Pressable onPress={loadMore} disabled={loadingMore} style={styles.more}>
                <Text style={styles.moreText}>{loadingMore ? 'Chargement…' : 'Afficher plus'}</Text>
              </Pressable>
            ) : null}
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
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  title: {
    ...displayType,
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.text,
  },
  hint: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    lineHeight: 18,
    marginTop: 4,
    maxWidth: 640,
  },
  todayRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
  },
  todayLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.textMuted,
    marginRight: 2,
  },
  todayPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  todayPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primarySoft,
  },
  chipText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: colors.textMuted,
  },
  chipTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  day: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.textMuted,
    paddingHorizontal: 2,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  rowBorder: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  rowPressed: {
    backgroundColor: colors.bg,
  },
  icon: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTitle: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
  },
  rowSub: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
    lineHeight: 17,
  },
  rowActor: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  rowEnd: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  time: {
    fontSize: 11.5,
    fontWeight: '600',
    color: colors.textMuted,
    fontVariant: ['tabular-nums'],
  },
  more: {
    alignSelf: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  moreText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
  },
});
