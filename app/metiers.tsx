import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Container, Screen } from '../components/ui';
import { MarketingFooter, MarketingNav } from '../components/MarketingChrome';
import { colors, fontSize, radius, spacing } from '../lib/theme';
import { marketingFonts } from '../lib/marketingTheme';
import { TRADE_PAGES, TRADE_PAGE_SLUGS, pluralTradeName } from '../lib/tradeLandingPages';

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
  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <MarketingNav />

        <Container style={styles.heroOuter}>
          <Text style={styles.eyebrow}>Cantia pour votre métier</Text>
          <Text style={styles.title}>Un logiciel de gestion adapté aux métiers du bâtiment</Text>
          <Text style={styles.subtitle}>
            Cantia centralise devis, chantiers, équipes et facturation. Découvrez comment il peut s'adapter au
            quotidien de votre métier.
          </Text>
        </Container>

        <Container style={styles.grid}>
          {TRADE_PAGE_SLUGS.map((slug) => {
            const trade = TRADE_PAGES[slug];
            return (
              // The sizing (flexGrow/flexBasis/maxWidth) lives on this plain
              // outer View, not on the Pressable inside <Link asChild> — Link
              // clones its child onto the <a> tag it renders, but doesn't
              // carry flex-sizing props onto that tag, so a card sized only
              // via the Pressable's own style silently loses its width and
              // stretches to fill the row instead of sitting in a grid.
              <View key={slug} style={styles.cardOuter}>
                <Link href={`/${slug}` as any} asChild>
                  <Pressable style={({ hovered }: any) => [styles.card, hovered && styles.cardHovered]}>
                    {({ hovered }: any) => (
                      <>
                        <View style={[styles.cardIcon, hovered && styles.cardIconHovered]}>
                          <Feather name={TRADE_ICONS[slug] ?? 'tool'} size={18} color={hovered ? '#fff' : colors.primary} />
                        </View>
                        <Text style={styles.cardTitle}>{pluralTradeName(trade.tradeName)}</Text>
                        <Text style={styles.cardText} numberOfLines={3}>
                          {trade.hero.subtitle}
                        </Text>
                        <View style={styles.cardLinkRow}>
                          <Text style={styles.cardLinkText}>Découvrir</Text>
                          <Feather name="arrow-right" size={13} color={colors.primary} />
                        </View>
                      </>
                    )}
                  </Pressable>
                </Link>
              </View>
            );
          })}
        </Container>

        <Container style={styles.noteOuter}>
          <Text style={styles.note}>
            Votre métier n'est pas encore listé ? Cantia s'adapte à la plupart des corps de métier du bâtiment
            suisse, <Link href="/sur-mesure"><Text style={styles.noteLink}>parlez-nous de votre activité</Text></Link>.
          </Text>
        </Container>

        <MarketingFooter />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1 },
  heroOuter: {
    maxWidth: 780,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
    alignItems: 'center',
  },
  eyebrow: {
    fontFamily: marketingFonts.body,
    fontSize: fontSize.xs,
    fontWeight: '800',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1.4,
    marginBottom: spacing.sm,
  },
  title: {
    fontFamily: marketingFonts.display,
    fontSize: 38,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: -0.5,
    textAlign: 'center',
    lineHeight: 44,
  },
  subtitle: {
    fontFamily: marketingFonts.body,
    fontSize: fontSize.md,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.md,
    lineHeight: 23,
    maxWidth: 560,
  },
  grid: {
    maxWidth: 1080,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  cardOuter: {
    flexGrow: 1,
    flexBasis: 250,
    maxWidth: 320,
  },
  card: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
    transitionProperty: 'transform, border-color, box-shadow',
    transitionDuration: '0.2s',
  } as any,
  cardHovered: {
    borderColor: colors.primary,
    transform: [{ translateY: -3 }],
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
  },
  cardIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
    transitionProperty: 'background-color',
    transitionDuration: '0.2s',
  } as any,
  cardIconHovered: { backgroundColor: colors.primary },
  cardTitle: { fontFamily: marketingFonts.body, fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  cardText: { fontFamily: marketingFonts.body, fontSize: fontSize.sm, color: colors.textMuted, lineHeight: 19 },
  cardLinkRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: spacing.xs },
  cardLinkText: { fontFamily: marketingFonts.body, fontSize: fontSize.xs, fontWeight: '700', color: colors.primary },
  noteOuter: {
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
    alignItems: 'center',
  },
  note: {
    fontFamily: marketingFonts.body,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  noteLink: { color: colors.primary, fontWeight: '700', textDecorationLine: 'underline' },
});
