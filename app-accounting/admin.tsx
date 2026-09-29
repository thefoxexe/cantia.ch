import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Head from 'expo-router/head';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Button } from '../components/ui';
import { AccNav, AccPage, NavButton, PAGE_MAX } from '../components/accounting/AccountingChrome';
import { accAdmin, formatChf, formatDate } from '../lib/accounting/api';
import { usePartnerSession } from '../lib/partners/session';
import { displayType } from '../lib/marketingTheme';
import { colors, fontSize, radius, spacing } from '../lib/theme';

// Cantia administration of Accounting (accounting.admin permission, checked
// by every database function; this screen only decides what to show).
// Internal tool: French only.

type Firms = NonNullable<Awaited<ReturnType<typeof accAdmin.firms>>['data']>;
type Overview = NonNullable<Awaited<ReturnType<typeof accAdmin.overview>>['data']>;

const STATUS: Record<string, string> = { ACTIVE: 'Active', SUSPENDED: 'Suspendue', BLOCKED: 'Bloquée', PENDING_CLIENT: 'Attente client', PENDING_FIRM: 'Attente fiduciaire', REFUSED: 'Refusé', REVOKED: 'Révoqué', CANCELLED: 'Annulé', PENDING: 'En attente', ACCEPTED: 'Acceptée' };

export default function AccountingAdmin() {
  const router = useRouter();
  const session = usePartnerSession();
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [firms, setFirms] = useState<Firms>([]);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [o, f] = await Promise.all([accAdmin.overview(), accAdmin.firms()]);
    setOverview(o.data);
    setFirms(f.data ?? []);
  }, []);

  useEffect(() => {
    if (session === null) {
      router.replace('/connexion?next=%2Fadmin');
      return;
    }
    if (!session) return;
    accAdmin.am().then(({ data }) => {
      setAllowed(!!data);
      if (data) load();
    });
  }, [session, router, load]);

  const q = query.trim().toLowerCase();
  const list = firms.filter((f) => !q || [f.name, f.city, f.owner_email].filter(Boolean).join(' ').toLowerCase().includes(q));

  return (
    <AccPage nav={<AccNav right={<NavButton href="/espace" label="Espace" />} />}>
      <Head>
        <title>Administration · Cantia Fiduciaires</title>
        <meta name="robots" content="noindex" />
      </Head>
      <View style={styles.wrap}>
        {allowed === null ? (
          <Text style={styles.muted}>Chargement…</Text>
        ) : !allowed ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Accès réservé</Text>
            <Text style={styles.muted}>Cette page est réservée à l’équipe Cantia.</Text>
          </View>
        ) : (
          <>
            <Text style={styles.eyebrow}>Administration</Text>
            <Text style={styles.h1}>Fiduciaires</Text>
            {overview ? (
              <View style={styles.kpis}>
                <Kpi label="Fiduciaires" value={String(overview.firms)} hint={`${overview.firms_new_30d} en 30 jours`} />
                <Kpi label="Actives" value={String(overview.firms_active)} hint="au moins un mandant" />
                <Kpi label="Mandants liés" value={String(overview.linked_clients)} />
                <Kpi label="Clients acquis" value={String(overview.acquired_clients)} />
                <Kpi label="MRR acquis" value={formatChf(overview.acquired_mrr_chf)} />
                <Kpi label="Partenaires" value={String(overview.partner_firms)} />
                <Kpi label="Suspectes" value={String(overview.suspicious)} warn={overview.suspicious > 0} />
              </View>
            ) : null}
            <TextInput value={query} onChangeText={setQuery} placeholder="Rechercher une fiduciaire, une ville, un e-mail…" placeholderTextColor={colors.textMuted} style={styles.input} />
            {list.length === 0 ? <Text style={styles.muted}>Aucune fiduciaire.</Text> : null}
            {list.map((f) => (
              <View key={f.id} style={styles.card}>
                <Pressable onPress={() => setOpen(open === f.id ? null : f.id)} style={styles.firmHead}>
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
                  <Feather name={open === f.id ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textMuted} />
                </Pressable>
                <View style={styles.metrics}>
                  <Metric label="Membres" value={f.members} />
                  <Metric label="Mandants actifs" value={f.active_clients} />
                  <Metric label="En attente" value={f.pending} />
                  <Metric label="Invitations" value={f.invitations} />
                  <Metric label="Clients acquis" value={f.acquired} />
                </View>
                {open === f.id ? <FirmDetail id={f.id} onChanged={load} /> : null}
              </View>
            ))}
          </>
        )}
      </View>
    </AccPage>
  );
}

function FirmDetail({ id, onChanged }: { id: string; onChanged: () => void }) {
  const [detail, setDetail] = useState<Record<string, any> | null>(null);
  const [note, setNote] = useState('');
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => setDetail((await accAdmin.firm(id)).data), [id]);
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

      <Block title="Membres">
        {(detail.members ?? []).map((m: any) => (
          <Text key={m.user_id} style={styles.row}>
            {m.name || m.email} · {m.email} · {m.role}
          </Text>
        ))}
      </Block>

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
    <View style={{ gap: 6 }}>
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
  wrap: { width: '100%', maxWidth: PAGE_MAX, alignSelf: 'center', paddingHorizontal: spacing.lg, paddingTop: spacing.xl, gap: spacing.md },
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
});
