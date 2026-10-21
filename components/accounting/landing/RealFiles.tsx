import { useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSiteCopy } from '../../../lib/accounting/siteCopy';
import { formatEntries } from '../../../lib/accounting/exports';
import { ech0217Report, extVatRows } from '../../../lib/accounting/extVat';
import { CLIENT, JOURNAL, VAT_SUMMARY_Q3_2026 } from '../../../lib/accounting/sampleBooks';
import { buildAfcForm } from '../../../lib/vat/afcForm';
import { buildEch0217Xml } from '../../../lib/vat/ech0217';
import { fill } from '../../../lib/accounting/copy';
import { displayType, monoType } from '../../../lib/marketingTheme';
import { colors, radius, spacing } from '../../../lib/theme';

// "With what it works, and what really comes out": the software and formats
// next to the files themselves, computed on the page by the same export code
// as the workspace, from the books of the end-to-end check
// (lib/accounting/sampleBooks.ts). Each one can be downloaded.

type Key = 'banana' | 'abacus' | 'winbiz' | 'xml' | 'form';
type File = { name: string; mime: string; content: string };

function buildFiles(): Record<Key, File> {
  const out: Partial<Record<Key, File>> = {};
  for (const format of ['banana', 'abacus', 'winbiz'] as const) {
    const f = formatEntries(format, JOURNAL);
    out[format] = { name: `bonvin-journal-${format}.${f.extension}`, mime: f.mime, content: f.content };
  }
  const { rows } = extVatRows(VAT_SUMMARY_Q3_2026);
  const settings = {
    vatLiable: true,
    vatMethod: 'effective' as const,
    vatBasisDefault: 'invoiced' as const,
    vatPeriodicity: 'trimestrielle' as const,
    vatLiableSince: null,
    vatRounding: 'aucun' as const,
    ideNumber: CLIENT.ide_number,
  };
  // A fixed generation time, so the page renders the same on the server and in the browser.
  const xml = buildEch0217Xml(CLIENT, '2026-07-01', '2026-10-01', 'cantia-bonvin-2026-Q3', settings, ech0217Report(rows)).xml.replace(
    /<generationTime>[^<]+</,
    '<generationTime>2026-10-21T21:18:53<',
  );
  out.xml = { name: 'bonvin-tva-2026-T3-eCH-0217.xml', mime: 'application/xml', content: xml };
  const form = buildAfcForm(rows, 'effective', {}, false);
  const lines = [...form.turnover, ...form.tax, ...form.other].filter((l) => Number(l.tax ?? l.amount ?? l.turnover ?? 0) !== 0);
  out.form = {
    name: 'bonvin-tva-2026-T3-formulaire.csv',
    mime: 'text/csv;charset=utf-8',
    content: '﻿' + ['Chiffre;CHF', ...lines.map((l) => `${l.figure};${Number(l.tax ?? l.amount ?? l.turnover ?? 0).toFixed(2)}`), `500;${form.payable.toFixed(2)}`].join('\r\n') + '\r\n',
  };
  return out as Record<Key, File>;
}

function download(file: File) {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return;
  const url = URL.createObjectURL(new Blob([file.content], { type: file.mime }));
  const a = document.createElement('a');
  a.href = url;
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export function RealFiles({ wide }: { wide: boolean }) {
  const { s } = useSiteCopy();
  const t = s.realFiles;
  const files = useMemo(buildFiles, []);
  const [tab, setTab] = useState<Key>('banana');
  const file = files[tab];
  const text = file.content.replace(/^﻿/, '').replace(/\r\n/g, '\n').trimEnd();
  const shown = tab === 'xml' || tab === 'form' ? text : text.replace(/\t/g, '  →  ');

  return (
    <View style={styles.band} nativeID="formats">
      <View style={[styles.inner, wide && styles.innerWide]}>
        <View style={[styles.left, wide && { flex: 0.85 }]}>
          <Text style={styles.eyebrow}>{t.eyebrow}</Text>
          <Text style={[styles.h2, wide && { fontSize: 38, lineHeight: 45 }]} role="heading" aria-level={2}>
            {t.title}
          </Text>
          <Text style={styles.lead}>{t.text}</Text>
          <View style={styles.grid}>
            {t.software.map((sw) => (
              <View key={sw.name} style={[styles.tile, { flexBasis: wide ? '46%' : '100%' }]}>
                <View style={styles.tileHead}>
                  <View style={[styles.mark, { backgroundColor: sw.color }]}>
                    <Text style={styles.markText}>{sw.name.slice(0, 1)}</Text>
                  </View>
                  <Text style={styles.tileName}>{sw.name}</Text>
                </View>
                <Text style={styles.tileWhat}>{sw.what}</Text>
                <Text style={styles.tileFile}>{sw.file}</Text>
              </View>
            ))}
          </View>
          <View style={styles.rule}>
            <Feather name="info" size={14} color={colors.primary} />
            <Text style={styles.ruleText}>{t.vatRule}</Text>
          </View>
        </View>

        <View style={[styles.viewer, wide && { flex: 1.15 }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
            {(Object.keys(t.tabs) as Key[]).map((k) => (
              <Pressable key={k} onPress={() => setTab(k)} style={[styles.tab, tab === k && styles.tabOn]} accessibilityRole="tab" aria-selected={tab === k}>
                <Text style={[styles.tabText, tab === k && styles.tabTextOn]}>{t.tabs[k]}</Text>
              </Pressable>
            ))}
          </ScrollView>
          <View style={styles.fileBar}>
            <Feather name="file-text" size={13} color="#B9AD9C" />
            <Text style={styles.fileName} numberOfLines={1}>
              {file.name}
            </Text>
            <Text style={styles.fileMeta}>{fill(t.lines, { n: text.split('\n').length })}</Text>
          </View>
          <ScrollView horizontal style={styles.codeScroll} contentContainerStyle={{ flexGrow: 1 }}>
            <ScrollView style={{ maxHeight: 380 }} nestedScrollEnabled>
              <Text style={styles.code} selectable>
                {shown}
              </Text>
            </ScrollView>
          </ScrollView>
          <View style={styles.viewerFoot}>
            <Text style={styles.note}>{t.note}</Text>
            {Platform.OS === 'web' ? (
              <Pressable onPress={() => download(file)} style={styles.download} accessibilityRole="button">
                <Feather name="download" size={14} color="#16120E" />
                <Text style={styles.downloadText}>{t.download}</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      </View>
    </View>
  );
}

const INK = '#16120E';

const styles = StyleSheet.create({
  band: { backgroundColor: colors.surface, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.border, paddingVertical: 72 },
  inner: { width: '100%', maxWidth: 1180, alignSelf: 'center', paddingHorizontal: spacing.lg, gap: 40 },
  innerWide: { flexDirection: 'row', alignItems: 'flex-start', gap: 56 },
  left: { gap: 16 },
  eyebrow: { fontSize: 12, fontWeight: '800', letterSpacing: 1.6, textTransform: 'uppercase', color: colors.primary },
  h2: { ...displayType, fontSize: 30, lineHeight: 36, fontWeight: '800', color: colors.text },
  lead: { fontSize: 16, lineHeight: 25, color: colors.textMuted, maxWidth: 560 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 8 },
  tile: { flexGrow: 1, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: 14, gap: 6, backgroundColor: colors.bg },
  tileHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  mark: { width: 28, height: 28, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  markText: { color: '#FFFFFF', fontWeight: '900', fontSize: 14 },
  tileName: { fontSize: 16, fontWeight: '800', color: colors.text },
  tileWhat: { fontSize: 13, lineHeight: 18, color: colors.text },
  tileFile: { ...monoType, fontSize: 11.5, color: colors.textMuted },
  rule: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', marginTop: 4, padding: 12, borderRadius: radius.md, backgroundColor: colors.primarySoft },
  ruleText: { flex: 1, fontSize: 13, lineHeight: 19, color: colors.text },
  viewer: { backgroundColor: INK, borderRadius: radius.lg, overflow: 'hidden', minWidth: 0 },
  tabs: { flexDirection: 'row', gap: 4, paddingHorizontal: 10, paddingTop: 10 },
  tab: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
  tabOn: { backgroundColor: '#2A231C' },
  tabText: { fontSize: 13, fontWeight: '700', color: '#9C8F7E' },
  tabTextOn: { color: '#F7F1E6' },
  fileBar: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#2A231C' },
  fileName: { ...monoType, flex: 1, fontSize: 12, color: '#F7F1E6' },
  fileMeta: { ...monoType, fontSize: 11, color: '#9C8F7E' },
  codeScroll: { paddingHorizontal: 16, paddingVertical: 14 },
  code: { ...monoType, fontSize: 11.5, lineHeight: 18, color: '#E9DFCF' },
  viewerFoot: { gap: 12, padding: 16, borderTopWidth: 1, borderTopColor: '#2A231C' },
  note: { fontSize: 12, lineHeight: 18, color: '#B9AD9C' },
  download: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start', backgroundColor: '#F7F1E6', paddingVertical: 9, paddingHorizontal: 14, borderRadius: 8 },
  downloadText: { fontSize: 13, fontWeight: '800', color: INK },
});
