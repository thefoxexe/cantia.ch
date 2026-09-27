import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Link } from 'expo-router';
import { breakpoints, colors, spacing } from '../../lib/theme';
import { marketingFonts, monoType } from '../../lib/marketingTheme';
import { bodyInk, ink, rule } from './brand';
import type { useMarketingDict } from '../../lib/i18n';

type Dict = ReturnType<typeof useMarketingDict>;
export type DocumentId = Dict['documents']['docs'][number]['id'];

// Real exports: each image is the actual output of the app's own PDF
// generator (supabase/functions/generate-*-pdf) run with sample data, not a
// mockup. `callouts` are the vertical positions (share of the image height)
// of the numbered markers, in the same order as the document's `points`.
const DOCUMENTS: Record<DocumentId, { uri: string; aspect: number; callouts: string[] }> = {
  facture: { uri: '/showcase/facture-exemple.png', aspect: 1819 / 2573, callouts: ['36%', '4.5%', '78%'] },
  devis: { uri: '/showcase/devis-signe.webp', aspect: 1429 / 1546, callouts: ['25.5%', '47%', '88.5%'] },
  rapport: { uri: '/showcase/rapport-chantier.webp', aspect: 1429 / 1506, callouts: ['40.5%', '55%', '84.5%', '93.8%'] },
  salaire: { uri: '/showcase/fiche-salaire.webp', aspect: 1429 / 1182, callouts: ['47%', '74%', '88.5%'] },
};

// One real document with numbered markers on its right edge and the
// matching numbered legend beside it (below it on narrow screens).
export function AnnotatedDocument({
  doc,
  hrefFor,
}: {
  doc: Dict['documents']['docs'][number];
  hrefFor: (slug: string) => string;
}) {
  const { width } = useWindowDimensions();
  const compact = width < breakpoints.desktop;
  const meta = DOCUMENTS[doc.id];
  return (
    <View style={[styles.split, compact && styles.splitCompact]}>
      <View style={[styles.figure, !compact && { flex: 1 }]}>
        <View style={styles.sheet}>
          <Image source={{ uri: meta.uri }} style={[styles.image, { aspectRatio: meta.aspect }]} resizeMode="contain" accessibilityLabel={doc.alt} />
          {meta.callouts.map((top, i) => (
            <View key={top} style={[styles.callout, { top: top as any }]} pointerEvents="none">
              <View style={styles.calloutLine} />
              <Text style={styles.calloutNum}>{i + 1}</Text>
            </View>
          ))}
        </View>
      </View>
      <View style={!compact ? { flex: 1 } : undefined}>
        {doc.points.map((p, i) => (
          <View key={p.title} style={styles.legendRow}>
            <Text style={styles.legendNum}>{i + 1}</Text>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={styles.legendTitle}>{p.title}</Text>
              <Text style={styles.bodyText}>{p.text}</Text>
            </View>
          </View>
        ))}
        <Link href={hrefFor(doc.linkSlug) as any}>
          <Text style={styles.link}>{doc.link} →</Text>
        </Link>
      </View>
    </View>
  );
}

// The homepage's document section: numbered tabs (same interaction language
// as the situations carousel) switching between the real exports.
export function DocumentShowcase({ dict, hrefFor }: { dict: Dict['documents']; hrefFor: (slug: string) => string }) {
  const [current, setCurrent] = useState(0);
  const active = dict.docs[current];
  return (
    <View>
      <Text style={styles.hint}>{dict.hint}</Text>
      <View style={styles.tabs}>
        {dict.docs.map((d, i) => (
          <Pressable
            key={d.id}
            onPress={() => setCurrent(i)}
            style={({ hovered }: any) => [styles.tab, hovered && styles.tabHover, i === current && styles.tabActive]}
          >
            <Text style={[styles.tabNum, i === current && styles.tabTextActive]}>{String(i + 1).padStart(2, '0')}</Text>
            <Text style={[styles.tabText, i === current && styles.tabTextActive]}>{d.tab}</Text>
          </Pressable>
        ))}
      </View>
      <AnnotatedDocument doc={active} hrefFor={hrefFor} />
    </View>
  );
}

const styles = StyleSheet.create({
  hint: { ...monoType, fontSize: 11, color: colors.textMuted, marginBottom: spacing.md },
  tabs: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.xxl },
  tab: { flexDirection: 'row', alignItems: 'baseline', gap: 8, paddingVertical: 10, paddingHorizontal: 14, borderWidth: 1, borderColor: rule, borderRadius: 3, backgroundColor: colors.bg, cursor: 'pointer' } as any,
  tabHover: { borderColor: ink },
  tabActive: { backgroundColor: ink, borderColor: ink },
  tabNum: { ...monoType, fontSize: 10, color: colors.primary },
  tabText: { fontFamily: marketingFonts.body, fontSize: 15, fontWeight: '600', color: ink },
  tabTextActive: { color: '#FBF6EE' },

  split: { flexDirection: 'row', gap: 64, alignItems: 'center' },
  splitCompact: { flexDirection: 'column', gap: spacing.xxl, alignItems: 'stretch' },
  figure: { alignItems: 'center', paddingRight: 44 },
  sheet: {
    width: '100%',
    maxWidth: 480,
    position: 'relative',
    borderWidth: 1,
    borderColor: rule,
    backgroundColor: '#fff',
    shadowColor: '#231A12',
    shadowOpacity: 0.1,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
  } as any,
  image: { width: '100%' },
  callout: { position: 'absolute', right: -44, flexDirection: 'row', alignItems: 'center', width: 70, marginTop: -12 },
  calloutLine: { flex: 1, borderTopWidth: 1, borderStyle: 'dashed', borderTopColor: colors.primary },
  calloutNum: { ...monoType, width: 24, height: 24, lineHeight: 21, borderRadius: 12, borderWidth: 1.5, borderColor: colors.primary, backgroundColor: colors.bg, color: colors.primary, fontSize: 11, textAlign: 'center' },
  legendRow: { flexDirection: 'row', gap: spacing.lg, paddingVertical: spacing.lg, borderTopWidth: 1, borderTopColor: rule },
  legendNum: { ...monoType, width: 26, height: 26, lineHeight: 23, borderRadius: 13, borderWidth: 1.5, borderColor: colors.primary, color: colors.primary, fontSize: 12, textAlign: 'center' },
  legendTitle: { fontFamily: marketingFonts.body, fontSize: 18, fontWeight: '700', color: ink },
  bodyText: { fontFamily: marketingFonts.body, fontSize: 16, lineHeight: 25, color: bodyInk },
  link: { fontFamily: marketingFonts.body, fontSize: 15, fontWeight: '600', color: colors.primary, marginTop: spacing.lg },
});
