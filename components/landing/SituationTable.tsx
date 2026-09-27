import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Link } from 'expo-router';
import { breakpoints, colors, spacing } from '../../lib/theme';
import { displayType, landingFonts, monoType } from '../../lib/landingTheme';
import { bodyInk, ink, rule } from './brand';
import type { useMarketingDict } from '../../lib/i18n';

type Dict = ReturnType<typeof useMarketingDict>;

// Six everyday situations as a static before/after table: what gets said on
// site on the left, what Cantia does about it on the right. Replaces the
// auto-rotating carousel, which hid five cases out of six at any moment.
export function SituationTable({ dict, hrefFor }: { dict: Dict['stories']; hrefFor: (slug: string) => string }) {
  const { width } = useWindowDimensions();
  const compact = width < breakpoints.desktop;
  return (
    <View>
      {!compact ? (
        <View style={[styles.row, styles.headRow]}>
          <Text style={[styles.headCell, styles.fieldCol]}>{dict.cases[0]?.concreteLabel}</Text>
          <Text style={[styles.headCell, styles.answerCol]}>{dict.respondLabel}</Text>
        </View>
      ) : null}
      {dict.cases.map((c) => (
        <View key={c.id} style={[styles.row, compact && styles.rowCompact]}>
          <View style={[!compact && styles.fieldCol, styles.cellGap]}>
            <Text style={styles.context}>{c.context}</Text>
            <Text style={styles.question}>{c.question.replace(/\n/g, ' ')}</Text>
            <Text style={styles.quote}>{c.concreteText}</Text>
          </View>
          <View style={[!compact && styles.answerCol, styles.cellGap, compact && styles.answerCompact]}>
            {compact ? <Text style={styles.context}>{dict.respondLabel}</Text> : null}
            <Text style={styles.answerTitle}>{c.responseTitle}</Text>
            <Text style={styles.answerText}>{c.responseText}</Text>
            <Text style={styles.steps}>{c.steps.join('  →  ')}</Text>
            <Link href={hrefFor(c.linkSlug) as any}>
              <Text style={styles.link}>{c.linkLabel} →</Text>
            </Link>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.xxl, paddingVertical: spacing.xl, borderBottomWidth: 1, borderBottomColor: rule },
  rowCompact: { flexDirection: 'column', gap: spacing.lg },
  headRow: { paddingVertical: spacing.sm, borderTopWidth: 1.5, borderTopColor: ink, borderBottomColor: ink },
  headCell: { ...monoType, fontSize: 10, letterSpacing: 0.5, textTransform: 'uppercase', color: colors.textMuted },
  fieldCol: { width: '42%' },
  answerCol: { flex: 1 },
  answerCompact: { borderLeftWidth: 2, borderLeftColor: colors.primary, paddingLeft: spacing.lg },
  cellGap: { gap: spacing.sm },
  context: { ...monoType, fontSize: 10.5, letterSpacing: 0.4, textTransform: 'uppercase', color: colors.primary },
  question: { ...displayType, fontSize: 32, fontWeight: '800', lineHeight: 33, color: ink },
  quote: { fontFamily: landingFonts.body, fontSize: 16, fontStyle: 'italic', lineHeight: 24, color: bodyInk },
  answerTitle: { fontFamily: landingFonts.body, fontSize: 20, fontWeight: '700', lineHeight: 26, color: ink },
  answerText: { fontFamily: landingFonts.body, fontSize: 16, lineHeight: 25, color: bodyInk, maxWidth: 620 },
  steps: { ...monoType, fontSize: 11, color: ink, marginTop: 2 },
  link: { fontFamily: landingFonts.body, fontSize: 15, fontWeight: '600', color: colors.primary },
});
