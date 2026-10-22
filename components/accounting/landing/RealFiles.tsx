import { useMemo, useState } from 'react';
import { Image, Platform, Pressable, ScrollView, StyleSheet, Text, View, type ImageSourcePropType, type TextStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSiteCopy } from '../../../lib/accounting/siteCopy';
import { formatEntries } from '../../../lib/accounting/exports';
import { ech0217Report, extVatRows } from '../../../lib/accounting/extVat';
import { CLIENT, JOURNAL, VAT_SUMMARY_Q3_2026 } from '../../../lib/accounting/sampleBooks';
import { buildAfcForm, FIGURE_LABELS } from '../../../lib/vat/afcForm';
import { LABELS_DE, LABELS_IT } from '../../../lib/vat/figureLabels';
import { buildEch0217Xml } from '../../../lib/vat/ech0217';
import { fill } from '../../../lib/accounting/copy';
import { displayType, monoType } from '../../../lib/marketingTheme';
import { colors, radius, spacing } from '../../../lib/theme';
import { Window } from './Mockups';

// "With what it works, and what really comes out": the software next to the
// files themselves, computed on the page by the same export code as the
// workspace, from the books of the end-to-end check
// (lib/accounting/sampleBooks.ts). The preview is the file itself, read back
// line by line, drawn like the export screen of the workspace; each file can
// be downloaded.

type Key = 'banana' | 'abacus' | 'winbiz' | 'xml' | 'form';
type File = { name: string; mime: string; content: string };
type SoftwareId = 'banana' | 'abacus' | 'winbiz' | 'csv' | 'afc' | 'bexio';

// The real logos of the software and of the AFC portal (assets/software).
const LOGOS: Record<SoftwareId, ImageSourcePropType> = {
  banana: require('../../../assets/software/banana.png'),
  abacus: require('../../../assets/software/abacus.png'),
  winbiz: require('../../../assets/software/winbiz.png'),
  csv: require('../../../assets/software/excel.png'),
  afc: require('../../../assets/software/confederation.png'),
  bexio: require('../../../assets/integrations/bexio-logo.png'),
};
const TAB_LOGO: Record<Key, SoftwareId> = { banana: 'banana', abacus: 'abacus', winbiz: 'winbiz', xml: 'afc', form: 'afc' };

const LINE = '#EDE3D3';
const SOFT = '#FBF7F0';
const num: TextStyle = { ...monoType, fontVariant: ['tabular-nums'] };

const settings = {
  vatLiable: true,
  vatMethod: 'effective' as const,
  vatBasisDefault: 'invoiced' as const,
  vatPeriodicity: 'trimestrielle' as const,
  vatLiableSince: null,
  vatRounding: 'aucun' as const,
  ideNumber: CLIENT.ide_number,
};

function buildFiles() {
  const out: Partial<Record<Key, File>> = {};
  for (const format of ['banana', 'abacus', 'winbiz'] as const) {
    const f = formatEntries(format, JOURNAL);
    out[format] = { name: `bonvin-journal-${format}.${f.extension}`, mime: f.mime, content: f.content };
  }
  const { rows } = extVatRows(VAT_SUMMARY_Q3_2026);
  // A fixed generation time, so the page renders the same on the server and in the browser.
  const xml = buildEch0217Xml(CLIENT, '2026-07-01', '2026-10-01', 'cantia-bonvin-2026-Q3', settings, ech0217Report(rows)).xml.replace(
    /<generationTime>[^<]+</,
    '<generationTime>2026-10-21T21:18:53<',
  );
  out.xml = { name: 'bonvin-tva-2026-T3-eCH-0217.xml', mime: 'application/xml', content: xml };
  const form = buildAfcForm(rows, 'effective', {}, false);
  const lines = [...form.turnover, ...form.tax, ...form.other]
    .map((l) => ({ figure: l.figure, amount: Number(l.tax ?? l.amount ?? l.turnover ?? 0) }))
    .filter((l) => l.amount !== 0);
  if (!lines.some((l) => l.figure === '500')) lines.push({ figure: '500', amount: form.payable });
  out.form = {
    name: 'bonvin-tva-2026-T3-formulaire.csv',
    mime: 'text/csv;charset=utf-8',
    content: '﻿' + ['Chiffre;CHF', ...lines.map((l) => `${l.figure};${l.amount.toFixed(2)}`)].join('\r\n') + '\r\n',
  };
  return { files: out as Record<Key, File>, form, formLines: lines };
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

// The journal file read back: header + rows, split on its own delimiter.
function readTable(content: string) {
  const text = content.replace(/^﻿/, '').replace(/[\r\n]+$/, '');
  const lines = text.split(/\r?\n/);
  const sep = lines[0].includes('\t') ? '\t' : ';';
  const split = (l: string) => l.split(sep).map((c) => c.replace(/^"|"$/g, '').replace(/""/g, '"'));
  const head = split(lines[0]);
  const rows = lines.slice(1).map(split);
  // The free-text column is the one with the longest values.
  const avg = head.map((_, i) => rows.reduce((s, r) => s + (r[i]?.length ?? 0), 0) / Math.max(1, rows.length));
  const textCol = avg.indexOf(Math.max(...avg));
  const amountCol = head.findIndex((h) => /amount|betrag|montant/i.test(h));
  return { head, rows, textCol, amountCol };
}

const CHF = (n: number) =>
  n.toLocaleString('de-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/[’']/g, '’');

export function RealFiles({ wide }: { wide: boolean }) {
  const { s, locale } = useSiteCopy();
  const t = s.realFiles;
  const { files, form, formLines } = useMemo(buildFiles, []);
  const [tab, setTab] = useState<Key>('banana');
  const file = files[tab];
  const labels = locale === 'de' ? LABELS_DE : locale === 'it' ? LABELS_IT : FIGURE_LABELS;
  const lineCount = file.content.replace(/^﻿/, '').trimEnd().split(/\r?\n/).length;

  return (
    <View style={styles.band} nativeID="formats">
      <View style={[styles.inner, wide && styles.innerWide]}>
        <View style={[styles.left, wide && { flex: 0.82 }]}>
          <Text style={styles.eyebrow}>{t.eyebrow}</Text>
          <Text style={[styles.h2, wide && { fontSize: 38, lineHeight: 45 }]} role="heading" aria-level={2}>
            {t.title}
          </Text>
          <Text style={styles.lead}>{t.text}</Text>
          <View style={styles.list}>
            {t.software.map((sw, i) => (
              <View key={sw.id} style={[styles.swRow, i > 0 && styles.swRowLine]}>
                <SoftwareMark id={sw.id as SoftwareId} />
                <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
                  <Text style={styles.swName}>{sw.name}</Text>
                  <Text style={styles.swWhat}>{sw.what}</Text>
                </View>
                {wide ? (
                  <View style={styles.swFile}>
                    <Text style={styles.swFileText} numberOfLines={2}>
                      {sw.file}
                    </Text>
                  </View>
                ) : null}
              </View>
            ))}
          </View>
          <View style={styles.rule}>
            <Feather name="info" size={14} color={colors.primary} style={{ marginTop: 2 }} />
            <Text style={styles.ruleText}>{t.vatRule}</Text>
          </View>
        </View>

        <View style={[{ minWidth: 0 }, wide && { flex: 1.18 }]}>
          <Window url="accounting.cantia.ch/mandant" maxWidth={720} interactive>
            <View style={styles.winBody}>
              <View style={styles.winHead}>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.winTitle}>{t.windowTitle}</Text>
                  <Text style={styles.winSub} numberOfLines={1}>
                    {CLIENT.name} · {CLIENT.ide_number}
                  </Text>
                </View>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
                {(Object.keys(t.tabs) as Key[]).map((k) => {
                  const on = tab === k;
                  const logo = LOGOS[TAB_LOGO[k]];
                  return (
                    <Pressable key={k} onPress={() => setTab(k)} style={[styles.tab, on && styles.tabOn]} accessibilityRole="tab" aria-selected={on}>
                      <Image source={logo} style={styles.tabLogo} resizeMode="contain" />
                      <Text style={[styles.tabText, on && styles.tabTextOn]}>{t.tabs[k]}</Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              <View style={styles.card}>
                <View style={styles.fileBar}>
                  <Feather name="file-text" size={13} color={colors.primary} />
                  <Text style={styles.fileName} numberOfLines={1}>
                    {file.name}
                  </Text>
                  <Text style={styles.fileMeta}>{fill(t.lines, { n: lineCount })}</Text>
                </View>
                {tab === 'xml' ? (
                  <XmlView xml={file.content} t={t} form={form} />
                ) : tab === 'form' ? (
                  <FormView lines={formLines} labels={labels} t={t} />
                ) : (
                  <JournalView content={file.content} wide={wide} more={t.more} />
                )}
              </View>

              <View style={styles.winFoot}>
                <Text style={styles.note}>{t.note}</Text>
                {Platform.OS === 'web' ? (
                  <Pressable onPress={() => download(file)} style={styles.download} accessibilityRole="button">
                    <Feather name="download" size={14} color="#FFFFFF" />
                    <Text style={styles.downloadText}>{t.download}</Text>
                  </Pressable>
                ) : null}
              </View>
            </View>
          </Window>
        </View>
      </View>
    </View>
  );
}

function SoftwareMark({ id }: { id: SoftwareId }) {
  return (
    <View style={styles.logoBox}>
      <Image source={LOGOS[id]} style={styles.logo} resizeMode="contain" accessibilityIgnoresInvertColors />
    </View>
  );
}

const SHOWN = 9;

function JournalView({ content, wide, more }: { content: string; wide: boolean; more: string }) {
  const { head, rows, textCol, amountCol } = useMemo(() => readTable(content), [content]);
  // The last lines: the third quarter of 2026, with its VAT codes and the VAT return.
  const shown = rows.slice(-SHOWN);
  const vatCol = head.findIndex((h) => /vat|mwst|tva/i.test(h));
  if (!wide) {
    // Phone: the text on its own line, the other columns of the file below.
    return (
      <View>
        {shown.map((r, i) => (
          <View key={i} style={[styles.mRow, i > 0 && styles.rowLine]}>
            <View style={styles.mHead}>
              <Text style={[styles.mText, { flex: 1 }]} numberOfLines={1}>
                {r[textCol]}
              </Text>
              {r[vatCol] ? <Text style={[styles.vatChip, num]}>{r[vatCol]}</Text> : null}
            </View>
            <Text style={[styles.mCells, num]} numberOfLines={1}>
              {r.filter((v, c) => c !== textCol && c !== vatCol && v !== '').join(' · ')}
            </Text>
          </View>
        ))}
        <Text style={styles.more}>{fill(more, { n: rows.length - shown.length })}</Text>
      </View>
    );
  }
  const width = (c: number) => {
    const h = head[c];
    if (/date|datum/i.test(h)) return 74;
    if (c === amountCol) return 70;
    if (c === vatCol) return 62;
    if (/debit|credit|soll|haben|débit|crédit/i.test(h)) return 80;
    return 34;
  };
  return (
    <View>
      <View>
        <View style={[styles.tRow, styles.tHead]}>
          {head.map((h, c) => (
            <Text key={h} style={[styles.th, c === textCol ? { flex: 1, flexBasis: 0, minWidth: 0 } : { width: width(c) }, c === amountCol && { textAlign: 'right' }]} numberOfLines={2}>
              {h}
            </Text>
          ))}
        </View>
        {shown.map((r, i) => (
          <View key={i} style={[styles.tRow, i > 0 && styles.rowLine]}>
            {r.map((v, c) => (
              <Text
                key={c}
                style={[c === textCol ? [styles.td, { flex: 1, flexBasis: 0, minWidth: 0 }] : [styles.td, num, { width: width(c) }], c === amountCol && { textAlign: 'right' }, c === vatCol && v ? styles.vatCode : null]}
                numberOfLines={1}
              >
                {v}
              </Text>
            ))}
          </View>
        ))}
        <Text style={styles.more}>{fill(more, { n: rows.length - shown.length })}</Text>
      </View>
    </View>
  );
}

type T = ReturnType<typeof useSiteCopy>['s']['realFiles'];

function XmlView({ xml, t, form }: { xml: string; t: T; form: ReturnType<typeof buildFiles>['form'] }) {
  const facts: [string, string][] = [
    [t.xmlKeys.uid, CLIENT.ide_number ?? ''],
    [t.xmlKeys.period, '01.07.2026 – 30.09.2026'],
    [t.xmlKeys.kind, t.xmlKeys.kindValue],
    [t.xmlKeys.turnover, CHF(12000)],
    [t.xmlKeys.due, CHF(form.totalTax)],
    [t.xmlKeys.input, CHF(form.totalInputTax)],
    [t.xmlKeys.payable, CHF(form.payable)],
  ];
  const excerpt = xml.split('\n').slice(0, 13).join('\n');
  return (
    <View style={{ padding: 14, gap: 14 }}>
      <View style={styles.facts}>
        {facts.map(([k, v], i) => (
          <View key={k} style={[styles.fact, i > 0 && styles.rowLine, i === facts.length - 1 && styles.factTotal]}>
            <Text style={styles.factK} numberOfLines={1}>
              {k}
            </Text>
            <Text style={[styles.factV, num, i === facts.length - 1 && { fontWeight: '800', color: colors.text }]}>{v}</Text>
          </View>
        ))}
      </View>
      <View style={{ gap: 6 }}>
        <Text style={styles.small}>{t.xmlExcerpt}</Text>
        <ScrollView horizontal style={styles.code} showsHorizontalScrollIndicator={false}>
          <Text style={styles.codeText} selectable>
            {excerpt.split(/(<[^>]+>)/).map((part, i) => (
              <Text key={i} style={part.startsWith('<') ? styles.codeTag : null}>
                {part}
              </Text>
            ))}
          </Text>
        </ScrollView>
      </View>
    </View>
  );
}

function FormView({ lines, labels, t }: { lines: { figure: string; amount: number }[]; labels: Record<string, string>; t: T }) {
  return (
    <View>
      <View style={[styles.tRow, styles.tHead]}>
        <Text style={[styles.th, { width: 52 }]}>{t.formCols.figure}</Text>
        <Text style={[styles.th, { flex: 1 }]}>{t.formCols.label}</Text>
        <Text style={[styles.th, { width: 90, textAlign: 'right' }]}>{t.formCols.amount}</Text>
      </View>
      {lines.map((l, i) => {
        const total = l.figure === '500';
        return (
          <View key={l.figure} style={[styles.tRow, i > 0 && styles.rowLine, total && styles.factTotal]}>
            <Text style={[styles.td, num, { width: 52, color: colors.primary, fontWeight: '700' }]}>{l.figure}</Text>
            <Text style={[styles.td, { flex: 1 }, total && { fontWeight: '800' }]} numberOfLines={1}>
              {labels[l.figure] ?? ''}
            </Text>
            <Text style={[styles.td, num, { width: 90, textAlign: 'right' }, total && { fontWeight: '800' }]}>{CHF(l.amount)}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  band: { backgroundColor: colors.bg, paddingVertical: 80 },
  inner: { width: '100%', maxWidth: 1180, alignSelf: 'center', paddingHorizontal: spacing.lg, gap: 40 },
  innerWide: { flexDirection: 'row', alignItems: 'flex-start', gap: 56 },
  left: { gap: 16 },
  eyebrow: { fontSize: 12, fontWeight: '800', letterSpacing: 1.6, textTransform: 'uppercase', color: colors.primary },
  h2: { ...displayType, fontSize: 30, lineHeight: 36, fontWeight: '800', color: colors.text },
  lead: { fontSize: 16, lineHeight: 25, color: colors.textMuted, maxWidth: 560 },

  list: { marginTop: 8, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, overflow: 'hidden' },
  swRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 13, paddingHorizontal: 16 },
  swRowLine: { borderTopWidth: 1, borderTopColor: LINE },
  logoBox: { width: 42, height: 42, borderRadius: 10, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: LINE, alignItems: 'center', justifyContent: 'center' },
  logo: { width: 30, height: 30 },
  swName: { fontSize: 15, fontWeight: '800', color: colors.text },
  swWhat: { fontSize: 13, lineHeight: 18, color: colors.textMuted },
  swFile: { maxWidth: 150, backgroundColor: SOFT, borderWidth: 1, borderColor: LINE, borderRadius: 6, paddingVertical: 4, paddingHorizontal: 8 },
  swFileText: { fontSize: 11, lineHeight: 15, color: colors.textMuted, textAlign: 'right' },
  rule: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', padding: 12, borderRadius: radius.md, backgroundColor: colors.primarySoft },
  ruleText: { flex: 1, fontSize: 13, lineHeight: 19, color: colors.text },

  winBody: { padding: 18, gap: 14, backgroundColor: '#FFFDF9' },
  winHead: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  winTitle: { fontSize: 18, fontWeight: '800', color: colors.text, letterSpacing: -0.2 },
  winSub: { fontSize: 12.5, color: colors.textMuted, marginTop: 2 },
  tabs: { flexDirection: 'row', gap: 4, padding: 3, backgroundColor: SOFT, borderWidth: 1, borderColor: LINE, borderRadius: 8 },
  tab: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 7, paddingHorizontal: 11, borderRadius: 6 },
  tabOn: { backgroundColor: colors.surface, shadowColor: '#2B211A', shadowOpacity: 0.08, shadowRadius: 4, shadowOffset: { width: 0, height: 1 } },
  tabLogo: { width: 15, height: 15 },
  tabText: { fontSize: 12.5, fontWeight: '700', color: colors.textMuted },
  tabTextOn: { color: colors.text },

  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: LINE, borderRadius: 8, overflow: 'hidden' },
  fileBar: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: LINE, backgroundColor: SOFT },
  fileName: { ...monoType, flex: 1, fontSize: 11.5, color: colors.text },
  fileMeta: { fontSize: 11, color: colors.textMuted },
  tRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 8 },
  tHead: { borderBottomWidth: 1, borderBottomColor: LINE },
  rowLine: { borderTopWidth: 1, borderTopColor: '#F4ECE0' },
  th: { fontSize: 10.5, fontWeight: '800', letterSpacing: 0.3, color: colors.textMuted },
  td: { fontSize: 12, color: colors.text },
  vatCode: { color: colors.primary, fontWeight: '700' },
  more: { fontSize: 11.5, color: colors.textMuted, paddingHorizontal: 14, paddingVertical: 10, borderTopWidth: 1, borderTopColor: LINE },
  mRow: { paddingHorizontal: 14, paddingVertical: 9, gap: 3 },
  mHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  mText: { fontSize: 13, fontWeight: '700', color: colors.text },
  vatChip: { fontSize: 10.5, fontWeight: '700', color: colors.primary, backgroundColor: colors.primarySoft, borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1, overflow: 'hidden' },
  mCells: { fontSize: 11, color: colors.textMuted },

  facts: { borderWidth: 1, borderColor: LINE, borderRadius: 8, overflow: 'hidden' },
  fact: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingHorizontal: 12, paddingVertical: 8 },
  factTotal: { backgroundColor: colors.primarySoft },
  factK: { flex: 1, fontSize: 12.5, color: colors.textMuted },
  factV: { fontSize: 12.5, color: colors.text },
  small: { fontSize: 11, fontWeight: '800', letterSpacing: 0.4, textTransform: 'uppercase', color: colors.textMuted },
  code: { backgroundColor: SOFT, borderWidth: 1, borderColor: LINE, borderRadius: 8, padding: 12, maxHeight: 220 },
  codeText: { ...monoType, fontSize: 10.5, lineHeight: 16, color: colors.text },
  codeTag: { color: colors.primary },

  winFoot: { gap: 12 },
  note: { fontSize: 12, lineHeight: 18, color: colors.textMuted },
  download: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start', backgroundColor: colors.primary, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8 },
  downloadText: { fontSize: 13, fontWeight: '800', color: '#FFFFFF' },
});
