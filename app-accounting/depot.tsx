import { useCallback, useEffect, useState } from 'react';
import { Image, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Head from 'expo-router/head';
import { useLocalSearchParams } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { Feather } from '@expo/vector-icons';
import { Button } from '../components/ui';
import { SignaturePad } from '../components/SignaturePad';
import { BrandLockup } from '../components/brand/Logo';
import { useAccCopy } from '../lib/accounting/locale';
import { fill } from '../lib/accounting/copy';
import { useProCopy } from '../lib/accounting/proCopy';
import { invokeFunction } from '../lib/api/functions';
import { supabase } from '../lib/supabase';
import { displayType } from '../lib/marketingTheme';
import { colors, fontSize, radius, spacing } from '../lib/theme';

// accounting.cantia.ch/depot?t=… — the private link of a fiduciary's client
// that is not on Cantia: send the documents asked for, sign what the firm
// submits. No account; the token is the key (checked in the database).

interface PortalRequest {
  id: string;
  title: string;
  details: string | null;
  due_date: string | null;
  status: 'open' | 'answered' | 'done';
  client_message: string | null;
  answered_at: string | null;
  files: { id: string; file_name: string; size_bytes: number | null }[];
}
interface PortalApproval {
  id: string;
  kind: string;
  title: string;
  message: string | null;
  file_url: string | null;
  file_name: string | null;
  file_sha256: string | null;
  due_date: string | null;
  status: 'pending' | 'approved' | 'rejected';
  signer_name: string | null;
  decided_at: string | null;
}
interface Portal {
  client: { name: string; contact_name: string | null; locale: 'fr' | 'de' | 'it' };
  firm: { name: string; logo_data: string | null; brand_color: string | null; phone: string | null; email: string | null; website: string | null; city: string | null };
  requests: PortalRequest[];
  approvals: PortalApproval[];
}

const swiss = (iso: string | null) => (iso ? `${iso.slice(8, 10)}.${iso.slice(5, 7)}.${iso.slice(0, 4)}` : '');

export default function ClientPortal() {
  const { t: tokenParam } = useLocalSearchParams<{ t?: string }>();
  const token = typeof tokenParam === 'string' ? tokenParam : '';
  const { setLocale } = useAccCopy();
  const p = useProCopy();
  const t = p.portal;
  const [data, setData] = useState<Portal | null | undefined>(undefined);

  const load = useCallback(async () => {
    if (!token) return setData(null);
    const { data: d } = await invokeFunction<Portal>('fiduciary-portal', { action: 'get', token });
    setData(d ?? null);
    return d;
  }, [token]);

  useEffect(() => {
    load().then((d) => {
      if (d?.client?.locale) setLocale(d.client.locale);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [load]);

  const accent = data?.firm.brand_color && /^#[0-9a-f]{6}$/i.test(data.firm.brand_color) ? data.firm.brand_color : colors.primary;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Head>
        <title>{data ? `${data.firm.name} · ${t.title}` : t.title}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      {data === undefined ? (
        <Text style={styles.muted}>{p.common.loading}</Text>
      ) : data === null ? (
        <View style={[styles.card, { alignItems: 'center', gap: spacing.md }]}>
          <Feather name="link-2" size={26} color={colors.danger} />
          <Text style={styles.h1}>{t.invalid}</Text>
          <Text style={styles.muted}>{t.invalidText}</Text>
        </View>
      ) : (
        <>
          <View style={[styles.header, { borderTopColor: accent }]}>
            {data.firm.logo_data ? (
              <Image source={{ uri: data.firm.logo_data }} style={styles.logo} resizeMode="contain" accessibilityLabel={data.firm.name} />
            ) : (
              <Text style={[styles.firmName, { color: accent }]}>{data.firm.name}</Text>
            )}
            <View style={styles.secure}>
              <Feather name="lock" size={12} color={colors.success} />
              <Text style={styles.secureText}>{t.secure}</Text>
            </View>
          </View>

          <View style={{ gap: 6 }}>
            <Text style={styles.h1}>{fill(t.hello, { name: data.client.contact_name || data.client.name })}</Text>
            <Text style={styles.lead}>{fill(t.intro, { firm: data.firm.name })}</Text>
          </View>

          {data.approvals.length ? (
            <View style={{ gap: spacing.md }}>
              <Text style={styles.h2}>{t.toSign}</Text>
              {data.approvals.map((a) => (
                <ApprovalCard key={a.id} token={token} approval={a} accent={accent} onDone={load} />
              ))}
            </View>
          ) : null}

          <View style={{ gap: spacing.md }}>
            <Text style={styles.h2}>{t.requests}</Text>
            {data.requests.filter((r) => r.status !== 'done').length === 0 ? (
              <View style={[styles.card, styles.row]}>
                <Feather name="check-circle" size={18} color={colors.success} />
                <Text style={styles.body}>{t.noRequests}</Text>
              </View>
            ) : null}
            {data.requests.map((r) => (
              <RequestCard key={r.id} token={token} request={r} accent={accent} onDone={load} />
            ))}
          </View>

          <View style={styles.footer}>
            <Text style={styles.small}>
              {fill(t.contact, { firm: data.firm.name })}
              {data.firm.phone ? ` · ${data.firm.phone}` : ''}
              {data.firm.email ? ` · ${data.firm.email}` : ''}
            </Text>
            <View style={[styles.row, { opacity: 0.7 }]}>
              <Text style={styles.small}>{t.poweredBy}</Text>
              <BrandLockup height={18} compact />
            </View>
          </View>
        </>
      )}
    </ScrollView>
  );
}

function RequestCard({ token, request: r, accent, onDone }: { token: string; request: PortalRequest; accent: string; onDone: () => void }) {
  const p = useProCopy();
  const t = p.portal;
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const open = r.status === 'open' || r.status === 'answered';

  async function addFiles() {
    setError(null);
    const res = await DocumentPicker.getDocumentAsync({ type: '*/*', multiple: true, copyToCacheDirectory: true });
    if (res.canceled || !res.assets?.length) return;
    setBusy(true);
    try {
      for (const f of res.assets) {
        const blob = await fetch(f.uri).then((x) => x.blob());
        if (blob.size > 20 * 1024 * 1024) throw new Error(t.tooBig);
        const { data: up, error: e1 } = await invokeFunction<{ path: string; upload_token: string }>('fiduciary-portal', {
          action: 'upload',
          token,
          request_id: r.id,
          file_name: f.name,
          size: blob.size,
        });
        if (e1 || !up) throw new Error(e1 ?? '—');
        const { error: e2 } = await supabase.storage.from('opus-storage').uploadToSignedUrl(up.path, up.upload_token, blob, { contentType: f.mimeType ?? blob.type ?? 'application/octet-stream' });
        if (e2) throw new Error(e2.message);
        const { error: e3 } = await invokeFunction('fiduciary-portal', { action: 'attach', token, request_id: r.id, path: up.path, file_name: f.name, size: blob.size });
        if (e3) throw new Error(e3);
      }
      onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function send() {
    setBusy(true);
    setError(null);
    const { error: e } = await invokeFunction('fiduciary-portal', { action: 'answer', token, request_id: r.id, message: message.trim() || null });
    setBusy(false);
    if (e) return setError(e);
    setSent(true);
    setMessage('');
    onDone();
  }

  return (
    <View style={[styles.card, r.status === 'answered' && { borderColor: colors.success }]}>
      <View style={styles.cardHead}>
        <View style={{ flex: 1, minWidth: 0, gap: 3 }}>
          <Text style={styles.cardTitle}>{r.title}</Text>
          {r.due_date ? <Text style={[styles.small, { color: accent, fontWeight: '700' }]}>{fill(t.due, { date: swiss(r.due_date) })}</Text> : null}
        </View>
        {r.status === 'answered' && r.answered_at ? <Text style={[styles.small, { color: colors.success, fontWeight: '700' }]}>{fill(t.answered, { date: swiss(r.answered_at.slice(0, 10)) })}</Text> : null}
        {r.status === 'done' ? <Text style={[styles.small, { color: colors.textMuted, fontWeight: '700' }]}>{t.done}</Text> : null}
      </View>
      {r.details ? <Text style={styles.body}>{r.details}</Text> : null}
      {r.files.length ? (
        <View style={{ gap: 4 }}>
          {r.files.map((f) => (
            <View key={f.id} style={styles.file}>
              <Feather name="paperclip" size={13} color={colors.textMuted} />
              <Text style={[styles.body, { flex: 1 }]} numberOfLines={1}>
                {f.file_name}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
      {open ? (
        <>
          <Button title={busy ? t.uploading : t.addFiles} icon="upload" variant="secondary" onPress={addFiles} disabled={busy} />
          <TextInput value={message} onChangeText={setMessage} placeholder={t.message} placeholderTextColor={colors.textMuted} multiline style={[styles.input, { minHeight: 64 }]} maxLength={2000} />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          {sent ? <Text style={styles.success}>{t.sent}</Text> : null}
          <Pressable onPress={send} disabled={busy || (!r.files.length && !message.trim())} style={[styles.cta, { backgroundColor: accent }, (busy || (!r.files.length && !message.trim())) && { opacity: 0.45 }]}>
            <Feather name="send" size={15} color="#fff" />
            <Text style={styles.ctaText}>{t.send}</Text>
          </Pressable>
        </>
      ) : null}
    </View>
  );
}

function ApprovalCard({ token, approval: a, accent, onDone }: { token: string; approval: PortalApproval; accent: string; onDone: () => void }) {
  const p = useProCopy();
  const t = p.portal;
  const [name, setName] = useState('');
  const [signature, setSignature] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function decide(accept: boolean) {
    setBusy(true);
    setError(null);
    const { error: e } = await invokeFunction('fiduciary-portal', { action: 'decide', token, approval_id: a.id, accept, signer_name: name.trim(), signature: accept ? signature : null, reason: accept ? null : reason.trim() });
    setBusy(false);
    if (e) setError(e);
    else onDone();
  }

  return (
    <View style={[styles.card, a.status === 'pending' && { borderColor: accent, borderWidth: 1.5 }]}>
      <View style={styles.cardHead}>
        <View style={{ flex: 1, minWidth: 0, gap: 3 }}>
          <Text style={styles.cardTitle}>{a.title}</Text>
          {a.due_date && a.status === 'pending' ? <Text style={[styles.small, { color: accent, fontWeight: '700' }]}>{fill(t.due, { date: swiss(a.due_date) })}</Text> : null}
        </View>
      </View>
      {a.message ? <Text style={styles.body}>{a.message}</Text> : null}
      {a.file_url ? (
        <Pressable onPress={() => (Platform.OS === 'web' ? window.open(a.file_url!, '_blank', 'noopener') : Linking.openURL(a.file_url!))} style={styles.file}>
          <Feather name="file-text" size={15} color={accent} />
          <Text style={[styles.body, { flex: 1, color: accent, fontWeight: '700' }]} numberOfLines={1}>
            {a.file_name ?? t.read}
          </Text>
          <Feather name="external-link" size={14} color={accent} />
        </Pressable>
      ) : null}
      {a.status === 'approved' ? (
        <View style={styles.row}>
          <Feather name="check-circle" size={16} color={colors.success} />
          <Text style={[styles.body, { color: colors.success, fontWeight: '700' }]}>{fill(t.signed, { date: swiss(a.decided_at?.slice(0, 10) ?? null) })}</Text>
        </View>
      ) : a.status === 'rejected' ? (
        <Text style={[styles.body, { color: colors.danger, fontWeight: '700' }]}>{fill(t.rejected, { date: swiss(a.decided_at?.slice(0, 10) ?? null) })}</Text>
      ) : rejecting ? (
        <>
          <TextInput value={reason} onChangeText={setReason} placeholder={t.rejectReason} placeholderTextColor={colors.textMuted} multiline style={[styles.input, { minHeight: 70 }]} maxLength={1000} />
          <TextInput value={name} onChangeText={setName} placeholder={t.signName} placeholderTextColor={colors.textMuted} style={styles.input} maxLength={120} />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <View style={styles.row}>
            <Button title={t.confirmReject} variant="danger" onPress={() => decide(false)} loading={busy} disabled={!reason.trim()} />
            <Pressable onPress={() => setRejecting(false)}>
              <Text style={styles.linkMuted}>{p.common.cancel}</Text>
            </Pressable>
          </View>
        </>
      ) : (
        <>
          <TextInput value={name} onChangeText={setName} placeholder={t.signName} placeholderTextColor={colors.textMuted} style={styles.input} maxLength={120} autoComplete="name" />
          <Text style={styles.label}>{t.signHere}</Text>
          <SignaturePad onChange={setSignature} labels={{ hint: t.signHere, saved: '✓', clear: t.clear }} />
          <Text style={styles.small}>{t.legal}</Text>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Pressable onPress={() => decide(true)} disabled={busy || !name.trim() || !signature} style={[styles.cta, { backgroundColor: accent }, (busy || !name.trim() || !signature) && { opacity: 0.45 }]}>
            <Feather name="edit-3" size={15} color="#fff" />
            <Text style={styles.ctaText}>{t.approve}</Text>
          </Pressable>
          <Pressable onPress={() => setRejecting(true)} style={{ alignSelf: 'center' }}>
            <Text style={styles.linkMuted}>{t.reject}</Text>
          </Pressable>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { width: '100%', maxWidth: 680, alignSelf: 'center', padding: spacing.lg, paddingBottom: 64, gap: spacing.xl },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md, paddingTop: spacing.md, borderTopWidth: 4, flexWrap: 'wrap' },
  logo: { width: 180, height: 56 },
  firmName: { ...displayType, fontSize: 22, fontWeight: '800' },
  secure: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: colors.successSoft, borderRadius: 999, paddingVertical: 4, paddingHorizontal: 10 },
  secureText: { fontSize: 11, fontWeight: '700', color: colors.success },
  h1: { ...displayType, fontSize: 28, lineHeight: 33, fontWeight: '800', color: colors.text },
  h2: { fontSize: fontSize.lg, fontWeight: '800', color: colors.text },
  lead: { fontSize: fontSize.md, lineHeight: 23, color: colors.textMuted },
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.md },
  cardHead: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  cardTitle: { fontSize: fontSize.md, fontWeight: '800', color: colors.text },
  body: { fontSize: fontSize.sm, lineHeight: 20, color: colors.text },
  small: { fontSize: 12, lineHeight: 17, color: colors.textMuted },
  muted: { fontSize: fontSize.sm, color: colors.textMuted, textAlign: 'center' },
  label: { fontSize: fontSize.xs, color: colors.textMuted, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' },
  file: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.sm, borderRadius: radius.md, backgroundColor: colors.bg },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingVertical: 10, paddingHorizontal: 12, fontSize: fontSize.md, color: colors.text, backgroundColor: colors.surface, textAlignVertical: 'top' },
  cta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 13, borderRadius: radius.md },
  ctaText: { color: '#fff', fontSize: fontSize.md, fontWeight: '800' },
  error: { fontSize: fontSize.sm, color: colors.danger },
  success: { fontSize: fontSize.sm, color: colors.success },
  linkMuted: { fontSize: fontSize.sm, color: colors.textMuted, fontWeight: '600' },
  footer: { gap: spacing.sm, alignItems: 'center', paddingTop: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border },
});
