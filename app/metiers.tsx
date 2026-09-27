import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Link } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Screen } from '../components/ui';
import { PageHero, pageWrap } from '../components/landing/PageHero';
import { bodyInk, ink, rule } from '../components/landing/brand';
import { MarketingHead } from '../components/MarketingHead';
import { MarketingFooter, MarketingNav } from '../components/MarketingChrome';
import { breakpoints, colors, spacing } from '../lib/theme';
import { displayType, marketingFonts, monoType } from '../lib/marketingTheme';
import { authHref } from '../lib/appHost';
import { getTradePage, TRADE_PAGE_SLUGS, pluralTradeName } from '../lib/tradeLandingPages';
import { getAppLocale, useTranslation } from '../lib/translations';
import { marketingPageTitle } from '../lib/marketingSeoTitles';

const TRADE_ICONS: Record<string, keyof typeof Feather.glyphMap> = {
  charpentier: 'layout',
  macon: 'grid',
  electricien: 'zap',
  plombier: 'droplet',
  peintre: 'edit-3',
  menuisier: 'tool',
  'entreprise-generale': 'briefcase',
  paysagiste: 'sun',
  couvreur: 'home',
  chauffagiste: 'thermometer',
  carreleur: 'square',
  platrier: 'layers',
  'genie-civil': 'trending-up',
  terrassier: 'truck',
  'entreprise-renovation': 'refresh-cw',
  serrurier: 'lock',
  ferblantier: 'wind',
  facadier: 'columns',
  etancheur: 'umbrella',
  'construction-bois': 'feather',
  vitrier: 'square',
  parqueteur: 'grid',
  echafaudeur: 'bar-chart-2',
  demolition: 'x-octagon',
};

export default function MetiersScreen() {
  const { t } = useTranslation();
  const locale = getAppLocale();
  const tradeHrefPrefix = locale === 'de' ? '/de/' : locale === 'it' ? '/it/' : '/';
  const { width } = useWindowDimensions();
  const twoCols = width >= breakpoints.desktop;
  return (
    <Screen style={{ padding: 0 }}>
      <MarketingHead title={marketingPageTitle('metiers', locale)} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <MarketingNav />

        <PageHero
          kicker={t('metiersPage.eyebrow')}
          title={t('metiersPage.title')}
          lede={t('metiersPage.subtitle')}
          cta={{ title: t('solutionPage.ctaTrial'), href: authHref('signup') }}
        />

        {/* A typographic index rather than a wall of icon cards: every trade
            readable at a glance, one ruled row each, two columns on desktop. */}
        <View style={[styles.wrap, styles.index, twoCols && styles.indexTwoCols]}>
          {TRADE_PAGE_SLUGS.map((slug) => {
            const trade = getTradePage(slug, locale)!;
            return (
              <Link key={slug} href={`${tradeHrefPrefix}${slug}` as any} asChild>
                <Pressable style={StyleSheet.flatten([styles.row, twoCols && styles.rowHalf])}>
                  <Feather name={TRADE_ICONS[slug] ?? 'tool'} size={18} color={colors.primary} style={{ marginTop: 6 }} />
                  <View style={{ flex: 1, gap: 4 }}>
                    <Text style={styles.name}>{locale === 'fr' ? pluralTradeName(trade.tradeName) : trade.tradeName}</Text>
                    <Text style={styles.text} numberOfLines={2}>{trade.hero.subtitle}</Text>
                  </View>
                  <Text style={styles.arrow}>→</Text>
                </Pressable>
              </Link>
            );
          })}
        </View>

        <View style={[styles.wrap, { paddingTop: spacing.xxl, paddingBottom: 96 }]}>
          <Text style={styles.note}>
            {t('metiersPage.noteBefore')}
            <Link href={(locale === 'de' ? '/de/sur-mesure' : locale === 'it' ? '/it/sur-mesure' : '/sur-mesure') as any}><Text style={styles.noteLink}>{t('metiersPage.noteLink')}</Text></Link>.
          </Text>
        </View>

        <MarketingFooter />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: pageWrap,
  index: { borderTopWidth: 1.5, borderTopColor: ink, marginTop: spacing.xxl },
  indexTwoCols: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 48 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.lg, paddingVertical: spacing.lg, borderBottomWidth: 1, borderBottomColor: rule },
  rowHalf: { width: 'calc(50% - 24px)' as any },
  name: { ...displayType, fontSize: 28, fontWeight: '800', lineHeight: 30, color: ink },
  text: { fontFamily: marketingFonts.body, fontSize: 15, lineHeight: 22, color: bodyInk },
  arrow: { fontSize: 18, color: colors.primary, marginTop: 4 },
  note: { fontFamily: marketingFonts.body, fontSize: 16, lineHeight: 25, color: bodyInk, maxWidth: 680 },
  noteLink: { color: colors.primary, fontWeight: '600', textDecorationLine: 'underline' },
});
