import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Button, Card } from './ui';
import { SendToFiduciaryModal, fiduciaryShareCopy } from './SendToFiduciaryModal';
import { listSharedDocuments, withdrawSharedDocument, type SharedDocument } from '../lib/api/fiduciaryShare';
import { getSignedUrl } from '../lib/api/storage';
import { downloadFile } from '../lib/downloadFile';
import { colors, fontSize, radius, spacing } from '../lib/theme';

// Paramètres › Fiduciaire: send any document + what was already sent
// (with « consulté » once the fiduciary opened its documents).
const ICONS: Record<string, keyof typeof Feather.glyphMap> = {
  invoice: 'file-text',
  expense: 'shopping-bag',
  payslip: 'user',
  salary_certificate: 'award',
  vat: 'percent',
  closing: 'book',
  bank: 'credit-card',
  document: 'paperclip',
};

export function FiduciarySharedList({ orgId, firmNames }: { orgId: string; firmNames: Record<string, string> }) {
  const c = fiduciaryShareCopy();
  const [rows, setRows] = useState<SharedDocument[] | null>(null);
  const [open, setOpen] = useState(false);

  const load = useCallback(async () => {
    const { rows: list } = await listSharedDocuments(orgId);
    setRows(list);
  }, [orgId]);

  useEffect(() => {
    load();
  }, [load]);

  async function openFile(path: string) {
    const url = await getSignedUrl(path, 300);
    if (url) await downloadFile(url, path.split('/').pop()?.replace(/^\d+-/, '') ?? 'document');
  }

  return (
    <Card style={styles.card}>
      <View style={styles.head}>
        <Text style={styles.title}>{c.sentTitle}</Text>
        <Button title={c.sendDoc} icon="upload" variant="secondary" onPress={() => setOpen(true)} />
      </View>
      {rows && !rows.length ? <Text style={styles.muted}>{c.sentNone}</Text> : null}
      {(rows ?? []).map((r) => (
        <View key={r.id} style={styles.row}>
          <Feather name={ICONS[r.kind] ?? 'paperclip'} size={16} color={colors.primary} />
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={styles.body} numberOfLines={1}>
              {r.title}
            </Text>
            <Text style={styles.small}>
              {firmNames[r.firm_id] ?? ''} · {new Date(r.created_at).toLocaleDateString('fr-CH')} · {r.seen_at ? c.seen : c.notSeen}
            </Text>
          </View>
          {r.file_path ? (
            <Pressable onPress={() => openFile(r.file_path!)} hitSlop={8}>
              <Feather name="download" size={16} color={colors.text} />
            </Pressable>
          ) : null}
          <Pressable
            onPress={async () => {
              await withdrawSharedDocument(r);
              load();
            }}
            hitSlop={8}
          >
            <Text style={styles.withdraw}>{c.withdraw}</Text>
          </Pressable>
        </View>
      ))}
      <SendToFiduciaryModal visible={open} onClose={() => setOpen(false)} onSent={load} orgId={orgId} kind="document" title="" pickFile />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.sm },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: spacing.sm },
  title: { fontSize: fontSize.md, fontWeight: '800', color: colors.text },
  muted: { fontSize: fontSize.sm, color: colors.textMuted },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
  body: { fontSize: fontSize.md, color: colors.text },
  small: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
  withdraw: { fontSize: fontSize.sm, color: colors.danger, fontWeight: '600', paddingHorizontal: 4, borderRadius: radius.sm },
});
