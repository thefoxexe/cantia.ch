import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { EmptyState, LoadingScreen } from '../ui';
import { AdminErrorBanner } from '../AdminErrorBanner';
import { colors, fontSize, radius, spacing } from '../../lib/theme';
import { callOutreach, listOutreach, updateOutreachDraft, type RegistryCompany } from '../../lib/api/admin';

// Super Admin › Nouvelles entreprises › À envoyer: the welcome e-mails
// written each morning at 07:30 (supabase/functions/registry-outreach), one
// per new company whose address is confirmed on its own site. Read, correct
// if needed, then send: nothing leaves without this click, 20 a day at most
// (the rest waits for the next day).

const MAX_PER_DAY = 20;

function zurichDayStart(): number {
  const now = new Date();
  const z = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Zurich' }));
  return now.getTime() - (z.getHours() * 3600 + z.getMinutes() * 60 + z.getSeconds()) * 1000;
}

export function OutreachPanel() {
  const [rows, setRows] = useState<RegistryCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { rows: r, error: err } = await listOutreach();
    setRows(r);
    setError(err);
    setLoading(false);
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  const drafts = useMemo(() => rows.filter((r) => r.outreach_status === 'draft' || r.outreach_status === 'failed'), [rows]);
  const sent = useMemo(() => rows.filter((r) => r.outreach_status === 'sent').sort((a, b) => (b.outreach_sent_at ?? '').localeCompare(a.outreach_sent_at ?? '')), [rows]);
  const sentToday = useMemo(() => {
    const start = zurichDayStart();
    return sent.filter((r) => r.outreach_sent_at && new Date(r.outreach_sent_at).getTime() >= start).length;
  }, [sent]);
  const room = Math.max(0, MAX_PER_DAY - sentToday);

  async function send(ids: string[]) {
    if (!ids.length) return;
    setBusy(ids.length > 1 ? 'all' : ids[0]);
    setError(null);
    setInfo(null);
    const { data, error: err } = await callOutreach({ action: 'send', ids });
    setBusy(null);
    if (err) setError(err);
    else {
      const parts = [`${data.sent} envoyé${data.sent > 1 ? 's' : ''}`];
      if (data.postponed) parts.push(`${data.postponed} pour demain (limite de ${MAX_PER_DAY} par jour)`);
      if (data.failed) parts.push(`${data.failed} en échec`);
      setInfo(parts.join(' · '));
    }
    load();
  }

  async function test(id: string) {
    setBusy(`test-${id}`);
    setError(null);
    const { data, error: err } = await callOutreach({ action: 'test', id });
    setBusy(null);
    if (err || !data?.ok) setError(err ?? data?.error ?? 'Le test n’est pas parti.');
    else setInfo('Test envoyé sur ton adresse.');
  }

  async function prepareNow() {
    setBusy('prepare');
    setError(null);
    const { data, error: err } = await callOutreach({ action: 'prepare_now' });
    setBusy(null);
    if (err) setError(err);
    else setInfo(data.sent || data.drafted ? `${data.sent} envoyé${data.sent > 1 ? 's' : ''} · ${data.drafted} nouveau${data.drafted > 1 ? 'x' : ''} brouillon${data.drafted > 1 ? 's' : ''}.` : 'Rien de nouveau.');
    load();
  }

  if (loading) return <LoadingScreen label="Chargement…" />;

  return (
    <View style={{ gap: spacing.md }}>
      <View style={styles.bar}>
        <Text style={styles.barText}>
          {drafts.length} à valider · {sentToday}/{MAX_PER_DAY} envoyés aujourd’hui · {sent.length} envoyés en tout
        </Text>
        <View style={styles.barActions}>
          <Pressable onPress={prepareNow} disabled={busy !== null} style={[styles.ghost, busy !== null && { opacity: 0.5 }]}>
            <Feather name="edit-3" size={14} color={colors.primary} />
            <Text style={styles.ghostText}>{busy === 'prepare' ? 'En cours…' : 'Lancer le passage du matin'}</Text>
          </Pressable>
          <Pressable
            onPress={() => send(drafts.slice(0, room).map((d) => d.id))}
            disabled={busy !== null || drafts.length === 0 || room === 0}
            style={[styles.primary, (busy !== null || drafts.length === 0 || room === 0) && { opacity: 0.5 }]}
          >
            <Feather name="send" size={14} color="#fff" />
            <Text style={styles.primaryText}>{busy === 'all' ? 'Envoi…' : `Tout envoyer (${Math.min(drafts.length, room)})`}</Text>
          </Pressable>
        </View>
      </View>
      <Text style={styles.hint}>
        Chaque matin à 7 h 30 : les nouvelles entreprises de Suisse romande dont l’e-mail est confirmé sur leur propre site partent
        automatiquement ; celles dont l’e-mail n’est pas certain attendent ici. Chaque e-mail contient un code personnel : 3 mois d’essai, une
        seule entreprise, valable 60 jours après l’envoi. Au plus 20 envois par jour. Expéditeur : info@cantia.ch.
      </Text>

      {error ? <AdminErrorBanner message={error} /> : null}
      {info ? <Text style={styles.info}>{info}</Text> : null}

      {drafts.length === 0 ? (
        <EmptyState title="Rien à valider" subtitle="Les e-mails pas certains arrivent ici chaque matin à 7 h 30 ; les e-mails confirmés partent seuls." />
      ) : (
        drafts.map((d) => (
          <DraftCard key={d.id} r={d} busy={busy} canSend={room > 0} onSend={() => send([d.id])} onTest={() => test(d.id)} onChanged={load} onError={setError} />
        ))
      )}

      {sent.length ? (
        <View style={{ gap: 6, marginTop: spacing.md }}>
          <Text style={styles.sectionTitle}>Envoyés</Text>
          {sent.slice(0, 30).map((r) => (
            <Text key={r.id} style={styles.sentRow}>
              {new Date(r.outreach_sent_at!).toLocaleDateString('fr-CH', { day: 'numeric', month: 'short' })} · {r.name} · {r.email} · code {r.outreach_code}
              {r.unsubscribed_at ? ' · désinscrit' : ''}
            </Text>
          ))}
        </View>
      ) : null}
    </View>
  );
}

function DraftCard({
  r,
  busy,
  canSend,
  onSend,
  onTest,
  onChanged,
  onError,
}: {
  r: RegistryCompany;
  busy: string | null;
  canSend: boolean;
  onSend: () => void;
  onTest: () => void;
  onChanged: () => void;
  onError: (e: string) => void;
}) {
  const [subject, setSubject] = useState(r.outreach_subject ?? '');
  const [body, setBody] = useState(r.outreach_body ?? '');
  const dirty = subject !== (r.outreach_subject ?? '') || body !== (r.outreach_body ?? '');

  async function save(): Promise<boolean> {
    if (!dirty) return true;
    const { error } = await updateOutreachDraft(r.id, { subject, body });
    if (error) {
      onError(error);
      return false;
    }
    return true;
  }

  async function skip() {
    const { error } = await updateOutreachDraft(r.id, { skip: true });
    if (error) onError(error);
    onChanged();
  }

  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={styles.name}>{r.name}</Text>
          <Text style={styles.sub}>
            {[r.town, r.canton, r.email].filter(Boolean).join(' · ')}
          </Text>
          {r.email_evidence ? <Text style={styles.evidence}>{r.email_check === 'manual' ? 'E-mail saisi à la main' : r.email_evidence}</Text> : null}
        </View>
        <Text style={styles.code}>{r.outreach_code}</Text>
      </View>
      {r.outreach_status === 'failed' ? <Text style={styles.failed}>Échec du dernier envoi : {r.outreach_error}</Text> : null}
      <TextInput value={subject} onChangeText={setSubject} onBlur={save} style={styles.subject} placeholder="Objet" placeholderTextColor={colors.textMuted} />
      <TextInput value={body} onChangeText={setBody} onBlur={save} multiline style={styles.body} textAlignVertical="top" />
      <Text style={styles.small}>[LIEN] devient le lien d’inscription avec le code. Le pied de page (Cantia · cantia.ch, lien de désinscription) est ajouté à l’envoi.</Text>
      <View style={styles.actions}>
        <Pressable onPress={async () => (await save()) && onSend()} disabled={busy !== null || !canSend} style={[styles.primary, (busy !== null || !canSend) && { opacity: 0.5 }]}>
          <Feather name="send" size={14} color="#fff" />
          <Text style={styles.primaryText}>{busy === r.id ? 'Envoi…' : canSend ? 'Envoyer' : 'Limite du jour atteinte'}</Text>
        </Pressable>
        <Pressable onPress={async () => (await save()) && onTest()} disabled={busy !== null} style={styles.ghost}>
          <Feather name="eye" size={14} color={colors.primary} />
          <Text style={styles.ghostText}>{busy === `test-${r.id}` ? 'Envoi du test…' : 'M’envoyer un test'}</Text>
        </Pressable>
        <Pressable onPress={skip} disabled={busy !== null} style={styles.ghost}>
          <Feather name="x" size={14} color={colors.textMuted} />
          <Text style={[styles.ghostText, { color: colors.textMuted }]}>Ne pas envoyer</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  barText: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text },
  barActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  hint: { fontSize: fontSize.xs, color: colors.textMuted, lineHeight: 18, maxWidth: 720 },
  info: { fontSize: fontSize.sm, color: colors.success, fontWeight: '600' },
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.md, gap: 8 },
  head: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  name: { fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  sub: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
  evidence: { fontSize: 11.5, color: colors.success, fontWeight: '600', marginTop: 2 },
  code: { fontSize: 12, fontWeight: '700', color: colors.primary, backgroundColor: colors.primarySoft, borderRadius: radius.pill, paddingHorizontal: 9, paddingVertical: 4, overflow: 'hidden' },
  failed: { fontSize: fontSize.xs, color: colors.danger, fontWeight: '600' },
  subject: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: 8, fontSize: fontSize.sm, fontWeight: '700', color: colors.text, backgroundColor: colors.bg },
  body: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md, minHeight: 260, fontSize: fontSize.sm, lineHeight: 21, color: colors.text, backgroundColor: colors.bg },
  small: { fontSize: 11.5, color: colors.textMuted },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  primary: { flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: colors.primary, borderRadius: radius.pill, paddingHorizontal: spacing.lg, paddingVertical: 9 },
  primaryText: { color: '#fff', fontSize: fontSize.sm, fontWeight: '700' },
  ghost: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: colors.border, borderRadius: radius.pill, paddingHorizontal: spacing.md, paddingVertical: 8 },
  ghostText: { fontSize: fontSize.sm, fontWeight: '600', color: colors.primary },
  sectionTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase', color: colors.textMuted },
  sentRow: { fontSize: fontSize.xs, color: colors.text },
});
