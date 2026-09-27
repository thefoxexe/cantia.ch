import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SwissCross } from './SwissCross';
import { SectionHead } from './landing/SectionHead';
import { pageWrap } from './landing/PageHero';
import { bodyInk, ink, rule } from './landing/brand';
import { breakpoints, colors, spacing } from '../lib/theme';
import { marketingFonts } from '../lib/marketingTheme';
import { useTranslation } from '../lib/translations';

export function SwissSection() {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const isTablet = width < breakpoints.desktop;
  const FACTS: { icon: keyof typeof Feather.glyphMap | 'hosting'; title: string; text: string }[] = [
    { icon: 'dollar-sign', title: t('swissSection.factChfTitle'), text: t('swissSection.factChfText') },
    { icon: 'percent', title: t('swissSection.factVatTitle'), text: t('swissSection.factVatText') },
    { icon: 'credit-card', title: t('swissSection.factQrTitle'), text: t('swissSection.factQrText') },
    { icon: 'hosting', title: t('swissSection.factHostingTitle'), text: t('swissSection.factHostingText') },
  ];
  return (
    <View style={styles.outer}>
      <SectionHead title={t('swissSection.title')} intro={t('swissSection.text')} />
      <View style={[styles.columns, isTablet && styles.columnsCompact]}>
        {FACTS.map((f, i) => (
          <View
            key={f.title}
            style={[styles.column, isTablet ? styles.columnCompact : i > 0 && styles.columnDivider]}
          >
            {f.icon === 'hosting' ? <SwissCross size={16} /> : <Feather name={f.icon} size={18} color={colors.primary} />}
            <Text style={styles.cardTitle}>{f.title}</Text>
            <Text style={styles.cardText}>{f.text}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: { ...pageWrap, paddingTop: 96, paddingBottom: spacing.xxl },
  columns: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: rule },
  columnsCompact: { flexDirection: 'row', flexWrap: 'wrap', borderBottomWidth: 0 },
  column: { flex: 1, gap: spacing.sm, paddingRight: spacing.lg, paddingBottom: spacing.xl },
  columnDivider: { borderLeftWidth: 1, borderLeftColor: rule, paddingLeft: spacing.lg },
  columnCompact: { flexBasis: '50%', flexGrow: 1, minWidth: 220, borderTopWidth: 1, borderTopColor: rule, paddingTop: spacing.lg },
  cardTitle: { fontFamily: marketingFonts.body, fontSize: 17, fontWeight: '700', color: ink },
  cardText: { fontFamily: marketingFonts.body, fontSize: 15, color: bodyInk, lineHeight: 22 },
});
