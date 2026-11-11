import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Button } from './ui';
import { accAdmin, formatChf, formatDate, type FirmActivity, type FirmUsage } from '../lib/accounting/api';
import { FiduciaryUsagePanel, freshnessColor, relativeTime } from './AdminFiduciaryUsage';
import { adminDisplay as displayType } from '../lib/adminTheme';
import { colors, fontSize, radius, spacing } from '../lib/theme';

// Super Admin › Fiduciaires › one firm: who they are, when each member was
// last connected, what they did (usage panel, journal), their clients,
// invitations, notes and the admin actions. Same layout idea as the company
// detail page (app/(admin)/organizations/[id].tsx). Internal tool: French only.

const STATUS: Record<string, string> = { ACTIVE: 'Active', SUSPENDED: 'Suspendue', BLOCKED: 'Bloquée', PENDING_CLIENT: 'Attente client', PENDING_FIRM: 'Attente fiduciaire', REFUSED: 'Refusé', REVOKED: 'Révoqué', CANCELLED: 'Annulé', PENDING: 'En attente', ACCEPTED: 'Acceptée' };

export function AdminFirmDetail({ id }: { id: string }) {
  const [summary, setSummary] = useState<Record<string, any> | null>(null);
  const [activity, setActivity] = useState<FirmActivity | null>(null);
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [tick, setTick] = useState(0);

  const loadHeader = useCallback(async () => {
    const [f, a] = await Promise.all([accAdmin.firms(), accAdmin.activity()]);
    setSummary((f.data ?? []).find((x: any) => x.id === id) ?? null);
    setActivity((a.data ?? []).find((x) => x.firm_id === id) ?? null);
  }, [id]);

  useEffect(() => {
    accAdmin.am().then(({ data }) => {
      setAllowed(!!data);
      if (data) loadHeader();
    });
  }, [loadHeader]);

  if (allowed === null) return <Text style={styles.muted}>Chargement…</Text>;
  if (!allowed) return <Text style={styles.muted}>Cette page est réservée à l’équipe Cantia.</Text>;
  const f = summary;
  const seen = activity?.last_seen_at ?? activity?.last_sign_in_at ?? null;

  return (
    <View style={{ gap: spacing.lg }}>
      <View style={styles.card}>
        <View style={styles.firmHead}>
          <View style={styles.avatar}>
            <Feather name="briefcase" size={20} color={colors.primary} />
          </View>
          <View style={{ flex: 1, minWidth: 220, gap: 4 }}>
            <Text style={styles.h1}>
              {f?.name ?? 'Fiduciaire'}
              {f?.verified ? '  ✓' : ''}
            </Text>
            <Text style={styles.small}>{[f?.city, f?.owner_email, f?.created_at ? `inscrite le ${formatDate(f.created_at, 'fr')}` : null].filter(Boolean).join(' · ')}</Text>
            {f?.suspicious ? <Text style={styles.warn}>⚠ {f.suspicious}</Text> : null}
          </View>
          {f ? <Pill label={STATUS[f.status] ?? f.status} tone={f.status === 'ACTIVE' ? 'ok' : 'bad'} /> : null}
          {f?.partner ? <Pill label="Partner" tone="accent" /> : null}
        </View>
        <View style={styles.presence}>
          <View style={[styles.activityDot, { backgroundColor: freshnessColor(seen) }]} />
          <Text style={styles.activityText}>
            <Text style={styles.activityStrong}>Vu {relativeTime(seen)}</Text>
            {activity?.last_sign_in_at ? `  ·  Dernière connexion ${relativeTime(activity.last_sign_in_at)}` : ''}
            {`  ·  Dernière action ${relativeTime(activity?.last_action_at ?? null)}`}
          </Text>
        </View>
      </View>

      <View style={styles.kpis}>
        <Kpi label="Membres" value={String(f?.members ?? '–')} />
        <Kpi label="Mandants actifs" value={String(f?.active_clients ?? '–')} hint={f ? `${f.pending} en attente` : undefined} />
        <Kpi label="Jours actifs" value={activity ? `${activity.active_days_30}` : '–'} hint="sur les 30 derniers jours" />
        <Kpi label="Fonctions utilisées" value={activity ? `${activity.features_used} / ${activity.features_total}` : '–'} />
        <Kpi label="Invitations" value={String(f?.invitations ?? '–')} hint={f ? `${f.acquired} clients acquis` : undefined} />
      </View>

      <FirmBody key={tick} id={id} onChanged={() => { loadHeader(); setTick((t) => t + 1); }} />
    </View>
  );
}

function FirmBody({ id, onChanged }: { id: string; onChanged: () => void }) {
  const [detail, setDetail] = useState<Record<string, any> | null>(null);
  const [usage, setUsage] = useState<FirmUsage | null>(null);
  const [note, setNote] = useState('');
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [d, u] = await Promise.all([accAdmin.firm(id), accAdmin.usage(id)]);
    setDetail(d.data);
    setUsage(u.data);
  }, [id]);
  useEffect(() => {
    load();
  }, [load]);

  async function run(action: () => Promise<{ error: string | null }>) {
    setBusy(true);
    const { error } = await action();
    setBusy(false);
    setMessage(error ?? 'Enregistré.');
    await load();
    onChanged();
  }

  if (!detail) return <Text style={styles.muted}>Chargement…</Text>;
  const firm = detail.firm ?? {};
  return (
    <View style={styles.detail}>
      <View style={styles.actions}>
        <Button title={firm.verified ? 'Retirer la vérification' : 'Vérifier'} variant="secondary" onPress={() => run(() => accAdmin.setFirm(id, { verified: !firm.verified }))} disabled={busy} />
        {firm.status !== 'ACTIVE' ? <Button title="Réactiver" variant="secondary" onPress={() => run(() => accAdmin.setFirm(id, { status: 'ACTIVE' }))} disabled={busy} /> : null}
        {firm.status === 'ACTIVE' ? <Button title="Suspendre" variant="secondary" onPress={() => run(() => accAdmin.setFirm(id, { status: 'SUSPENDED' }))} disabled={busy} /> : null}
        {firm.status !== 'BLOCKED' ? <Button title="Bloquer" variant="danger" onPress={() => run(() => accAdmin.setFirm(id, { status: 'BLOCKED' }))} disabled={busy} /> : null}
      </View>
      {message ? <Text style={styles.small}>{message}</Text> : null}
      <Text style={styles.small}>
        {[firm.phone, firm.address, [firm.postal_code, firm.city].filter(Boolean).join(' '), firm.ide_number, firm.website, firm.mandates_range ? `${firm.mandates_range} mandats` : null, (firm.software ?? []).join(', ')].filter(Boolean).join(' · ')}
      </Text>

      {usage ? (
        <View style={styles.usageCard}>
          <Text style={styles.usageTitle}>Connexions et utilisation</Text>
          <Text style={styles.small}>Qui s’est connecté et quand, ce que chaque membre a ouvert et fait sur accounting.cantia.ch.</Text>
          <FiduciaryUsagePanel usage={usage} />
        </View>
      ) : null}


      <Block title="Mandants">
        <TextInput value={reason} onChangeText={setReason} placeholder="Raison (pour retirer un accès)" placeholderTextColor={colors.textMuted} style={styles.input} />
        {(detail.clients ?? []).map((c: any) => (
          <View key={c.access_id} style={styles.clientRow}>
            <Text style={[styles.row, { flex: 1 }]}>
              {c.organization} · {STATUS[c.status] ?? c.status} · {c.source} · {(c.permissions ?? []).length} droits
            </Text>
            {c.status === 'ACTIVE' ? (
              <Pressable onPress={() => reason.trim().length >= 3 && run(() => accAdmin.removeAccess(c.access_id, reason.trim()))} disabled={busy || reason.trim().length < 3}>
                <Text style={[styles.link, reason.trim().length < 3 && { opacity: 0.4 }]}>Retirer l’accès</Text>
              </Pressable>
            ) : null}
          </View>
        ))}
      </Block>

      <Block title="Invitations">
        {(detail.invitations ?? []).map((i: any, idx: number) => (
          <Text key={idx} style={styles.row}>
            {i.kind} · {i.email} {i.company_name ? `(${i.company_name})` : ''} · {STATUS[i.status] ?? i.status}
            {i.organization ? ` → ${i.organization}` : ''}
            {i.partner_code ? ` · code ${i.partner_code}` : ''}
          </Text>
        ))}
      </Block>

      <Block title="Cantia Partners">
        {(detail.partners ?? []).length === 0 ? <Text style={styles.row}>Aucun profil partenaire.</Text> : null}
        {(detail.partners ?? []).map((p: any, idx: number) => (
          <Text key={idx} style={styles.row}>
            {p.name} · {p.status} · {p.referrals} rattachés · {p.paying} payants · {formatChf(p.commissions_chf)} de commissions
          </Text>
        ))}
      </Block>

      <Block title="Notes">
        <TextInput value={note} onChangeText={setNote} placeholder="Ajouter une note interne" placeholderTextColor={colors.textMuted} style={styles.input} multiline />
        <View style={styles.actions}>
          <Button
            title="Ajouter"
            variant="secondary"
            onPress={() =>
              run(async () => {
                const r = await accAdmin.addNote(id, note);
                if (!r.error) setNote('');
                return r;
              })
            }
            disabled={busy || !note.trim()}
          />
        </View>
        {(detail.notes ?? []).map((n: any) => (
          <Text key={n.id} style={styles.row}>
            {formatDate(n.created_at, 'fr')} · {n.author} : {n.body}
          </Text>
        ))}
      </Block>

      <Block title="Journal">
        {(detail.audit ?? []).slice(0, 40).map((a: any, idx: number) => (
          <Text key={idx} style={styles.row}>
            {formatDate(a.created_at, 'fr')} · {a.action}
            {a.organization ? ` · ${a.organization}` : ''}
            {a.actor ? ` · ${a.actor}` : ''}
          </Text>
        ))}
      </Block>
    </View>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.blockCard}>
      <Text style={styles.blockTitle}>{title}</Text>
      {children}
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


function Pill({ label, tone }: { label: string; tone: 'ok' | 'bad' | 'accent' }) {
  const c = tone === 'ok' ? { bg: colors.successSoft, fg: colors.success } : tone === 'bad' ? { bg: colors.dangerSoft, fg: colors.danger } : { bg: colors.primarySoft, fg: colors.primary };
  return (
    <View style={[styles.pill, { backgroundColor: c.bg }]}>
      <Text style={[styles.pillText, { color: c.fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  presence: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.bg, borderRadius: radius.md, paddingVertical: 10, paddingHorizontal: spacing.md },
  wrap: { width: '100%', maxWidth: 1180, alignSelf: 'center', padding: spacing.xl, paddingBottom: 80, gap: spacing.lg },
  eyebrow: { fontSize: 12, fontWeight: '700', color: colors.primary, textTransform: 'uppercase', letterSpacing: 1 },
  h1: { ...displayType, fontSize: 26, fontWeight: '800', color: colors.text },
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
  detail: { gap: spacing.lg },
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
  blockCard: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.lg, gap: 8 },
  usageCard: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.sm },
  usageTitle: { fontSize: fontSize.md, fontWeight: '800', color: colors.text },
});
