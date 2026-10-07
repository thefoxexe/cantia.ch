import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Feather } from '@expo/vector-icons';
import { Btn, Sheet, kit } from '../admin/ledger/kit';
import { fill, shortDate, type ScheduleCopy } from '../../lib/schedule/copy';
import { importStats, isMspdi, parseMspdi, parseScheduleSheet, type ImportPlan } from '../../lib/schedule/imports';
import { colors, fontSize, radius, spacing } from '../../lib/theme';

// Excel or MS Project file → preview → lines added to the planning.
export function ImportSheet({ c, workdays, onClose, onImport }: { c: ScheduleCopy; workdays: number[]; onClose: () => void; onImport: (plan: ImportPlan) => Promise<string | null> }) {
  const [file, setFile] = useState<string | null>(null);
  const [plan, setPlan] = useState<ImportPlan | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pick = async () => {
    setError(null);
    const res = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true });
    if (res.canceled || !res.assets?.length) return;
    const asset = res.assets[0];
    setBusy(true);
    try {
      const name = asset.name ?? '';
      const buf = await fetch(asset.uri).then((r) => r.arrayBuffer());
      let next: ImportPlan | null = null;
      if (/\.(xml|mspdi)$/i.test(name) || (!/\.xls[xm]?$/i.test(name) && isMspdi(new TextDecoder().decode(buf.slice(0, 4000))))) {
        const text = new TextDecoder().decode(buf);
        if (!isMspdi(text)) throw new Error(c.importErrorFormat);
        next = parseMspdi(text, workdays);
      } else if (/\.(xlsx|xlsm|xls|csv)$/i.test(name)) {
        const XLSX = await import('xlsx');
        const wb = XLSX.read(buf, { type: 'array', cellDates: true });
        const ws = wb.Sheets[wb.SheetNames[0]];
        next = parseScheduleSheet(XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, raw: true, defval: null }), workdays);
      } else {
        throw new Error(c.importErrorFormat);
      }
      if (!next.lines.length) throw new Error(c.importErrorEmpty);
      setFile(name);
      setPlan(next);
    } catch (e) {
      setPlan(null);
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const st = plan ? importStats(plan) : null;
  const depth = (key: string | null, n = 0): number => {
    const l = key ? plan?.lines.find((x) => x.key === key) : null;
    return l && n < 10 ? depth(l.parent, n + 1) : n;
  };

  return (
    <Sheet
      title={c.importTitle}
      onClose={onClose}
      footer={
        <>
          <Btn label={c.cancel} onPress={onClose} grow />
          <Btn
            label={busy ? '…' : c.importDo}
            icon="upload"
            variant="primary"
            grow
            disabled={busy || !plan}
            onPress={async () => {
              if (!plan) return;
              setBusy(true);
              setError(await onImport(plan));
              setBusy(false);
            }}
          />
        </>
      }
    >
      <Text style={kit.hint}>{c.importHint}</Text>
      <Btn label={file ?? c.importPick} icon={file ? 'file' : 'folder'} onPress={pick} disabled={busy} />
      {plan && st ? (
        <>
          <Text style={[kit.body, { fontWeight: '700' }]}>{fill(c.importPreview, { p: st.phases, t: st.tasks, m: st.milestones, l: st.links })}</Text>
          {plan.skipped ? <Text style={kit.hint}>{fill(c.importSkipped, { n: plan.skipped })}</Text> : null}
          <ScrollView style={styles.preview}>
            {plan.lines.slice(0, 200).map((l) => (
              <View key={l.key} style={[styles.row, { paddingLeft: 8 + (depth(l.parent) * 14) }]}>
                <Feather name={l.kind === 'phase' ? 'folder' : l.kind === 'milestone' ? 'flag' : 'minus'} size={13} color={l.kind === 'phase' ? colors.primary : colors.textMuted} />
                <Text style={[styles.name, l.kind === 'phase' && { fontWeight: '700' }]} numberOfLines={1}>
                  {l.name}
                </Text>
                <Text style={styles.dates}>{l.kind === 'phase' ? '' : l.start_date ? `${shortDate(l.start_date)}${l.kind === 'task' ? ` → ${shortDate(l.end_date)}` : ''}` : '—'}</Text>
              </View>
            ))}
          </ScrollView>
          <Text style={kit.hint}>{c.importAppend}</Text>
        </>
      ) : null}
      {error ? <Text style={{ color: colors.danger }}>{error}</Text> : null}
    </Sheet>
  );
}

const styles = StyleSheet.create({
  preview: { maxHeight: 280, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6, paddingRight: 8, borderBottomWidth: 1, borderBottomColor: colors.border },
  name: { flex: 1, fontSize: fontSize.sm, color: colors.text },
  dates: { fontSize: 12, color: colors.textMuted, fontVariant: ['tabular-nums'] },
});
