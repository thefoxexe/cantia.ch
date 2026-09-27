import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Link } from 'expo-router';
import { breakpoints, colors, spacing } from '../../lib/theme';
import { displayType, marketingFonts, monoType } from '../../lib/marketingTheme';
import { bodyInk, ink, rule } from './brand';
import type { useMarketingDict } from '../../lib/i18n';

type Dict = ReturnType<typeof useMarketingDict>;

// Every feature at a glance, laid out like a drawing's nomenclature (parts
// list): one ruled row per usage, the page it links to as the reference.
// Replaces the old stack of closed accordion cards, where visitors had to
// click six times to learn what the product does.
export function FeatureCatalog({ dict, hrefFor }: { dict: Dict['catalog']; hrefFor: (slug: string) => string }) {
  const { width } = useWindowDimensions();
  const compact = width < breakpoints.desktop;
  return (
    <View>
      {!compact ? (
        <View style={[styles.row, styles.headRow]}>
          <Text style={[styles.headCell, styles.refCol]}>{dict.columns.ref}</Text>
          <Text style={[styles.headCell, styles.titleCol]}>{dict.columns.usage}</Text>
          <Text style={[styles.headCell, styles.itemsCol]}>{dict.columns.content}</Text>
        </View>
      ) : null}
      {dict.groups.map((group) => (
        <Link key={group.title} href={hrefFor(group.linkSlug) as any} asChild>
          <Pressable style={StyleSheet.flatten([styles.row, compact && styles.rowCompact])}>
            <Text style={[styles.ref, !compact && styles.refCol]}>/{group.linkSlug}</Text>
            <View style={!compact ? styles.titleCol : undefined}>
              <Text role="heading" aria-level={3} style={styles.title}>{group.title}</Text>
              <Text style={styles.subtitle}>{group.subtitle}</Text>
            </View>
            <View style={[!compact ? styles.itemsCol : undefined, styles.itemsWrap]}>
              <Text style={styles.items}>{group.items.map((i) => i.title).join(' · ')}</Text>
              <Text style={styles.link}>{group.linkLabel} →</Text>
            </View>
          </Pressable>
        </Link>
      ))}
      <Text style={styles.planNote}>{dict.planNote}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.xl, paddingVertical: spacing.lg + 2, borderBottomWidth: 1, borderBottomColor: rule },
  rowCompact: { flexDirection: 'column', gap: spacing.sm },
  headRow: { paddingVertical: spacing.sm, borderTopWidth: 1.5, borderTopColor: ink, borderBottomColor: ink },
  headCell: { ...monoType, fontSize: 10, letterSpacing: 0.5, textTransform: 'uppercase', color: colors.textMuted },
  refCol: { width: 150 },
  titleCol: { flex: 1.1 },
  itemsCol: { flex: 1.3 },
  ref: { ...monoType, fontSize: 11, color: colors.primary, paddingTop: 8 },
  title: { ...displayType, fontSize: 30, fontWeight: '800', lineHeight: 32, color: ink },
  subtitle: { fontFamily: marketingFonts.body, fontSize: 15, color: bodyInk, marginTop: 6, lineHeight: 22 },
  itemsWrap: { gap: spacing.sm, paddingTop: 4 },
  items: { fontFamily: marketingFonts.body, fontSize: 15, lineHeight: 24, color: ink },
  link: { fontFamily: marketingFonts.body, fontSize: 14, fontWeight: '600', color: colors.primary },
  planNote: { ...monoType, fontSize: 11, color: colors.textMuted, marginTop: spacing.lg },
});
