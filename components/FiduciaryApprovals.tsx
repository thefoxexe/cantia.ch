import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { decideFiduciaryApproval, getFiduciaryApprovals, type FiduciaryApprovalForClient } from '../lib/api/fiduciary';
import { getSignedUrl } from '../lib/api/storage';
import { downloadFile } from '../lib/downloadFile';
import { SignaturePad } from './SignaturePad';
import { Button, Card } from './ui';
import { getAppLocale, useTranslation } from '../lib/translations';
import { colors, fontSize, radius, spacing } from '../lib/theme';

// Paramètres › Fiduciaire: documents the fiduciary submits for approval
// (annual accounts, tax return…). The person reads, signs or refuses with a
// reason; the database keeps the proof.

const formatDate = (iso: string) => new Date(iso.length === 10 ? `${iso}T00:00:00` : iso).toLocaleDateString(`${getAppLocale()}-CH`, { day: '2-digit', month: '2-digit', year: 'numeric' });

export function FiduciaryApprovals({ orgId }: { orgId: string }) {
  const { t } = useTranslation();
  const [rows, setRows] = useState<FiduciaryApprovalForClient[] | null>(null);
  const [showDone, setShowDone] = useState(false);
  const load = useCallback(async () => setRows(await getFiduciaryApprovals(orgId)), [orgId]);
  useEffect(() => {
    load();
  }, [load]);
  if (!rows || rows.length === 0) return null;
  const pending = rows.filter((r) => r.status === 'pending');
  const done = rows.filter((r) => r.status !== 'pending');
  return (
    <View style={styles.stack}>
      <Text style={styles.sectionTitle}>
        {t('fiduciary.sign.title')}
        {pending.length ? <Text style={styles.count}>{`  ${pending.length}`}</Text> : null}
      </Text>
      <Text style={styles.muted}>{t('fiduciary.sign.intro')}</Text>
      {pending.map((a) => (
        <ApprovalItem key={a.id} approval={a} onDone={load} />
      ))}
      {done.length ? (
        <Pressable onPress={() => setShowDone((v) => !v)}>
          <Text style={styles.link}>{showDone ? t('fiduciary.sign.hideDone') : t('fiduciary.sign.showDone', { count: done.length })}</Text>
        </Pressable>
      ) : null}
      {showDone ? done.map((a) => <ApprovalItem key={a.id} approval={a} onDone={load} />) : null}
    </View>
  );
}

function ApprovalItem({ approval: a, onDone }: { approval: FiduciaryApprovalForClient; onDone: () => void }) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [signature, setSignature] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function open() {
    if (!a.file_path) return;
    const url = await getSignedUrl(a.file_path);
    if (url) await downloadFile(url, a.file_name ?? 'document.pdf');
  }

  async function decide(accept: boolean) {
    setBusy(true);
    setError(null);
    const { error: e } = await decideFiduciaryApproval(a.id, accept, name.trim(), accept ? signature : null, accept ? null : reason.trim());
    setBusy(false);
    if (e) setError(e);
    else onDone();
  }

  return (
    <Card style={[styles.card, a.status === 'pending' && styles.pending]}>
      <View style={styles.head}>
        <View style={styles.icon}>
          <Feather name="edit-3" size={16} color={colors.primary} />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={styles.cardTitle}>{a.title}</Text>
          <Text style={styles.muted}>
            {[a.firm_name, formatDate(a.created_at), a.due_date && a.status === 'pending' ? t('fiduciary.sign.due', { date: formatDate(a.due_date) }) : null].filter(Boolean).join(' · ')}
          </Text>
        </View>
      </View>
      {a.message ? <Text style={styles.body}>{a.message}</Text> : null}
      {a.file_path ? (
        <Pressable onPress={open} style={styles.file}>
          <Feather name="file-text" size={15} color={colors.primary} />
          <Text style={[styles.link, { flex: 1 }]} numberOfLines={1}>
            {a.file_name ?? t('fiduciary.sign.open')}
          </Text>
          <Feather name="download" size={14} color={colors.primary} />
        </Pressable>
      ) : null}
      {a.status === 'approved' ? (
        <Text style={[styles.body, { color: colors.success, fontWeight: '700' }]}>{t('fiduciary.sign.signed', { name: a.signer_name ?? '', date: a.decided_at ? formatDate(a.decided_at) : '' })}</Text>
      ) : a.status === 'rejected' ? (
        <Text style={[styles.body, { color: colors.danger, fontWeight: '700' }]}>
          {t('fiduciary.sign.rejected', { date: a.decided_at ? formatDate(a.decided_at) : '' })}
          {a.rejection_reason ? ` · ${a.rejection_reason}` : ''}
        </Text>
      ) : rejecting ? (
        <View style={{ gap: spacing.sm }}>
          <TextInput value={reason} onChangeText={setReason} placeholder={t('fiduciary.sign.reason')} placeholderTextColor={colors.textMuted} multiline style={[styles.input, { minHeight: 70 }]} maxLength={1000} />
          <TextInput value={name} onChangeText={setName} placeholder={t('fiduciary.sign.name')} placeholderTextColor={colors.textMuted} style={styles.input} maxLength={120} />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <View style={styles.actions}>
            <Button title={t('fiduciary.sign.confirmReject')} variant="danger" onPress={() => decide(false)} loading={busy} disabled={!reason.trim()} />
            <Pressable onPress={() => setRejecting(false)}>
              <Text style={styles.linkMuted}>{t('common.cancel', { defaultValue: 'Annuler' })}</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <View style={{ gap: spacing.sm }}>
          <TextInput value={name} onChangeText={setName} placeholder={t('fiduciary.sign.name')} placeholderTextColor={colors.textMuted} style={styles.input} maxLength={120} />
          <SignaturePad onChange={setSignature} labels={{ hint: t('fiduciary.sign.pad'), saved: t('fiduciary.sign.saved'), clear: t('fiduciary.sign.clear') }} />
          <Text style={styles.small}>{t('fiduciary.sign.legal')}</Text>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <View style={styles.actions}>
            <Button title={t('fiduciary.sign.approve')} icon="check" onPress={() => decide(true)} loading={busy} disabled={!name.trim() || !signature} />
            <Pressable onPress={() => setRejecting(true)}>
              <Text style={styles.linkMuted}>{t('fiduciary.sign.reject')}</Text>
            </Pressable>
          </View>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  stack: { gap: spacing.md },
  sectionTitle: { fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  count: { color: colors.primary, fontWeight: '800' },
  muted: { fontSize: fontSize.sm, lineHeight: 19, color: colors.textMuted },
  small: { fontSize: 12, lineHeight: 17, color: colors.textMuted },
  body: { fontSize: fontSize.sm, lineHeight: 20, color: colors.text },
  card: { gap: spacing.md },
  pending: { borderColor: colors.primary, borderWidth: 1.5 },
  head: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  icon: { width: 34, height: 34, borderRadius: radius.md, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  file: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.sm, borderRadius: radius.md, backgroundColor: colors.bg },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingVertical: 10, paddingHorizontal: 12, fontSize: fontSize.md, color: colors.text, backgroundColor: colors.surface, textAlignVertical: 'top' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.md },
  link: { fontSize: fontSize.sm, color: colors.primary, fontWeight: '700' },
  linkMuted: { fontSize: fontSize.sm, color: colors.textMuted, fontWeight: '600' },
  error: { fontSize: fontSize.sm, color: colors.danger },
});
