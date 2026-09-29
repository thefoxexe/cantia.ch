import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Feather } from '@expo/vector-icons';
import {
  addFiduciaryRequestFile,
  answerFiduciaryRequest,
  getFiduciaryRequests,
  removeFiduciaryRequestFile,
  type FiduciaryRequestForClient,
} from '../lib/api/fiduciary';
import { getSignedUrl } from '../lib/api/storage';
import { downloadFile } from '../lib/downloadFile';
import { Button, Card } from './ui';
import { getAppLocale, useTranslation } from '../lib/translations';
import { colors, fontSize, radius, spacing } from '../lib/theme';

// Paramètres › Fiduciaire: what the company's fiduciary asked for (bank
// statements, receipts…). Files go straight to the fiduciary, no e-mail.
// Shown to everyone who handles the money, not only the admins.

const formatDate = (iso: string) => new Date(iso.length === 10 ? `${iso}T00:00:00` : iso).toLocaleDateString(`${getAppLocale()}-CH`, { day: '2-digit', month: '2-digit', year: 'numeric' });

export function FiduciaryRequests({ orgId }: { orgId: string }) {
  const { t } = useTranslation();
  const [rows, setRows] = useState<FiduciaryRequestForClient[] | null>(null);
  const [showDone, setShowDone] = useState(false);

  const load = useCallback(async () => {
    setRows(await getFiduciaryRequests(orgId));
  }, [orgId]);
  useEffect(() => {
    load();
  }, [load]);

  if (!rows || rows.length === 0) return null;
  const open = rows.filter((r) => r.status === 'open');
  const answered = rows.filter((r) => r.status === 'answered');
  const done = rows.filter((r) => r.status === 'done');

  return (
    <View style={styles.stack}>
      <Text style={styles.sectionTitle}>
        {t('fiduciary.req.title')}
        {open.length ? <Text style={styles.count}>{`  ${open.length}`}</Text> : null}
      </Text>
      <Text style={styles.muted}>{t('fiduciary.req.intro')}</Text>
      {open.map((r) => (
        <RequestItem key={r.id} orgId={orgId} request={r} onChanged={load} />
      ))}
      {answered.map((r) => (
        <RequestItem key={r.id} orgId={orgId} request={r} onChanged={load} />
      ))}
      {done.length ? (
        <Pressable onPress={() => setShowDone((v) => !v)}>
          <Text style={styles.link}>{showDone ? t('fiduciary.req.hideDone') : t('fiduciary.req.showDone', { count: done.length })}</Text>
        </Pressable>
      ) : null}
      {showDone ? done.map((r) => <RequestItem key={r.id} orgId={orgId} request={r} onChanged={load} />) : null}
    </View>
  );
}

function RequestItem({ orgId, request: r, onChanged }: { orgId: string; request: FiduciaryRequestForClient; onChanged: () => void }) {
  const { t } = useTranslation();
  const [message, setMessage] = useState(r.client_message ?? '');
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const editable = r.status === 'open' || r.status === 'answered';
  const late = r.status === 'open' && !!r.due_date && r.due_date < new Date().toISOString().slice(0, 10);

  async function pick() {
    const result = await DocumentPicker.getDocumentAsync({ multiple: true, copyToCacheDirectory: true });
    if (result.canceled || !result.assets?.length) return;
    setUploading(true);
    setError(null);
    for (const asset of result.assets) {
      const { error: err } = await addFiduciaryRequestFile(orgId, r.id, { uri: asset.uri, name: asset.name, mimeType: asset.mimeType, size: asset.size });
      if (err) setError(err);
    }
    setUploading(false);
    onChanged();
  }

  async function send() {
    setSending(true);
    setError(null);
    const { error: err } = await answerFiduciaryRequest(r.id, message);
    setSending(false);
    if (err) setError(err);
    else onChanged();
  }

  const statusLabel = r.status === 'open' ? (late ? t('fiduciary.req.late') : t('fiduciary.req.open')) : r.status === 'answered' ? t('fiduciary.req.answered') : t('fiduciary.req.done');
  const tone = r.status === 'open' ? (late ? styles.tagDanger : styles.tagWarning) : styles.tagSuccess;

  return (
    <Card style={[styles.card, r.status === 'open' && styles.cardOpen]}>
      <View style={styles.head}>
        <View style={{ flex: 1, minWidth: 200, gap: 2 }}>
          <Text style={styles.firm}>{r.firm_name}</Text>
          <Text style={styles.title}>{r.title}</Text>
          <Text style={styles.small}>
            {[t('fiduciary.req.askedOn', { date: formatDate(r.created_at) }), r.due_date ? t('fiduciary.req.dueOn', { date: formatDate(r.due_date) }) : null].filter(Boolean).join(' · ')}
          </Text>
        </View>
        <View style={[styles.tag, tone]}>
          <Text style={styles.tagText}>{statusLabel}</Text>
        </View>
      </View>
      {r.details ? <Text style={styles.body}>{r.details}</Text> : null}

      {r.files.length ? (
        <View style={{ gap: 6 }}>
          {r.files.map((f) => (
            <View key={f.id} style={styles.file}>
              <Feather name="file" size={14} color={colors.primary} />
              <Pressable
                style={{ flex: 1 }}
                onPress={async () => {
                  const url = await getSignedUrl(f.file_path, 300);
                  if (url) await downloadFile(url, f.file_name);
                }}
              >
                <Text style={styles.body} numberOfLines={1}>
                  {f.file_name}
                </Text>
              </Pressable>
              {r.status === 'open' ? (
                <Pressable onPress={() => removeFiduciaryRequestFile(f.id).then(onChanged)} hitSlop={8} accessibilityLabel={t('fiduciary.req.remove')}>
                  <Feather name="x" size={15} color={colors.textMuted} />
                </Pressable>
              ) : null}
            </View>
          ))}
        </View>
      ) : null}

      {editable ? (
        <>
          <Pressable onPress={pick} disabled={uploading} style={styles.drop} accessibilityRole="button">
            <Feather name="upload" size={16} color={colors.primary} />
            <Text style={styles.dropText}>{uploading ? t('fiduciary.req.uploading') : t('fiduciary.req.addFiles')}</Text>
          </Pressable>
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder={t('fiduciary.req.messagePlaceholder')}
            placeholderTextColor={colors.textMuted}
            style={styles.input}
            multiline
            maxLength={2000}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <View style={styles.actions}>
            <Button title={r.status === 'answered' ? t('fiduciary.req.sendAgain') : t('fiduciary.req.send')} icon="send" onPress={send} loading={sending} disabled={!message.trim() && r.files.length === 0} />
            {r.status === 'answered' && r.answered_at ? <Text style={styles.small}>{t('fiduciary.req.sentOn', { date: formatDate(r.answered_at) })}</Text> : null}
          </View>
        </>
      ) : r.client_message ? (
        <Text style={styles.quote}>{r.client_message}</Text>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  stack: { gap: spacing.md },
  sectionTitle: { fontSize: fontSize.md, fontWeight: '800', color: colors.text },
  count: { color: colors.primary },
  muted: { fontSize: fontSize.sm, color: colors.textMuted, lineHeight: 19 },
  card: { gap: spacing.sm },
  cardOpen: { borderColor: colors.primary },
  head: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start', gap: spacing.md },
  firm: { fontSize: 11, fontWeight: '700', letterSpacing: 0.4, textTransform: 'uppercase', color: colors.primary },
  title: { fontSize: fontSize.md, fontWeight: '800', color: colors.text },
  small: { fontSize: 12, color: colors.textMuted },
  body: { fontSize: fontSize.sm, color: colors.text, lineHeight: 20 },
  tag: { borderRadius: radius.sm, paddingVertical: 3, paddingHorizontal: 8 },
  tagWarning: { backgroundColor: colors.warningSoft },
  tagDanger: { backgroundColor: colors.dangerSoft },
  tagSuccess: { backgroundColor: colors.successSoft },
  tagText: { fontSize: 11, fontWeight: '800', color: colors.text },
  file: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingVertical: 8, paddingHorizontal: spacing.sm },
  drop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, borderWidth: 1.5, borderStyle: 'dashed', borderColor: colors.primary, borderRadius: radius.md, paddingVertical: spacing.md, backgroundColor: colors.primarySoft },
  dropText: { fontSize: fontSize.sm, fontWeight: '700', color: colors.primaryDark },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.sm, minHeight: 64, fontSize: fontSize.sm, color: colors.text, backgroundColor: colors.surface, textAlignVertical: 'top' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.md },
  link: { fontSize: fontSize.sm, fontWeight: '700', color: colors.primary },
  error: { fontSize: fontSize.sm, color: colors.danger },
  quote: { fontSize: fontSize.sm, color: colors.text, borderLeftWidth: 2, borderLeftColor: colors.success, paddingLeft: spacing.sm },
});
