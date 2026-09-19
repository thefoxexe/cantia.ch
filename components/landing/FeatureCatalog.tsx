import { Text, View, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { Disclosure } from './Disclosure';
import { colors, spacing } from '../../lib/theme';
import { landingFonts } from '../../lib/landingTheme';
import type { useMarketingDict } from '../../lib/i18n';

type Dict = ReturnType<typeof useMarketingDict>;

export function FeatureCatalog({ dict, hrefFor }: { dict: Dict['catalog']; hrefFor: (slug: string) => string }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.heading}>
        <Text style={styles.title}>{dict.title}</Text>
        <Text style={styles.subtitle}>{dict.subtitle}</Text>
      </View>
      <View style={styles.groups}>
        {dict.groups.map((group) => (
          <Disclosure key={group.title} title={group.title} subtitle={group.subtitle} variant="card">
            <View style={{ gap: spacing.sm }}>
              {group.items.map((item) => (
                <View key={item.title} style={styles.item}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  <Text style={styles.itemText}>{item.text}</Text>
                </View>
              ))}
            </View>
            <Link href={hrefFor(group.linkSlug) as any}>
              <Text style={styles.groupLink}>{group.linkLabel} →</Text>
            </Link>
          </Disclosure>
        ))}
      </View>
      <Text style={styles.planNote}>{dict.planNote}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: spacing.xxxl },
  heading: { marginBottom: spacing.lg, gap: spacing.xs },
  title: { fontFamily: landingFonts.body, fontSize: 22, fontWeight: '600', color: colors.text, letterSpacing: -0.5, lineHeight: 28 },
  subtitle: { fontFamily: landingFonts.body, fontSize: 14, color: colors.textMuted, lineHeight: 21 },
  groups: { gap: spacing.sm },
  item: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.sm, gap: 2 },
  itemTitle: { fontFamily: landingFonts.body, fontSize: 13, fontWeight: '600', color: colors.text },
  itemText: { fontFamily: landingFonts.body, fontSize: 12.5, color: colors.textMuted, lineHeight: 18 },
  groupLink: { fontFamily: landingFonts.body, fontSize: 12, fontWeight: '700', color: colors.primary, marginTop: spacing.xs },
  planNote: { fontFamily: landingFonts.body, fontSize: 12, color: colors.textMuted, textAlign: 'center', marginTop: spacing.lg },
});
