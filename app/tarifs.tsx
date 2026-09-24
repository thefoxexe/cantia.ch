import { ScrollView, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Link } from 'expo-router';
import { Button, Container, Screen } from '../components/ui';
import { Heading } from '../components/Heading';
import { MarketingHead } from '../components/MarketingHead';
import { MarketingFooter, MarketingNav } from '../components/MarketingChrome';
import { PricingSection } from '../components/PricingSection';
import { SwissCross } from '../components/SwissCross';
import { colors, fontSize, radius, spacing } from '../lib/theme';
import { marketingFonts } from '../lib/marketingTheme';
import { marketingPageTitle } from '../lib/marketingSeoTitles';
import { authHref } from '../lib/appHost';
import { getAppLocale } from '../lib/translations';

// Standalone, indexable pricing page — the homepage already has a #pricing
// section (scrolled into view from the nav), but an external directory
// (Capterra, GetApp…) wants one stable URL to link as "pricing", not a hash
// anchor. This is also now the destination of the "Voir les tarifs" sitelink
// on the /logiciel-chantier Google Ads campaign, so it needs its own hero
// rather than dropping straight into the price table with no context.
// PricingSection itself is reused as-is (it fetches live plan data and
// already renders its own eyebrow/title/subtitle), so this page never
// drifts out of sync with the real prices.
export default function TarifsPage() {
  const locale = getAppLocale();
  return (
    <Screen style={{ padding: 0 }}>
      <MarketingHead
        title={marketingPageTitle('tarifs', locale)}
        description="Les tarifs de Cantia, le logiciel suisse de gestion pour entreprises du bâtiment : devis, factures, chantiers, RH et trésorerie. Sans engagement, essai gratuit."
      />
      <MarketingNav />
      <ScrollView>
        <Container style={styles.hero}>
          <View style={styles.kickerPill}>
            <SwissCross size={13} />
            <Text style={styles.kickerText}>Tarifs · Sans engagement</Text>
          </View>
          <Heading level={1} style={styles.title}>
            Un abonnement, aucune mauvaise surprise
          </Heading>
          <Text style={styles.subtitle}>
            Devis et factures illimités sur chaque plan, dès le premier jour — pas de quota mensuel qui se déclenche
            en pleine saison. Essai gratuit 14 jours, résiliable à tout moment depuis votre compte.
          </Text>
          <View style={styles.ctaRow}>
            <Link href={authHref('signup')} asChild>
              <Button title="Essai gratuit 14 jours" onPress={() => {}} icon="arrow-up-right" />
            </Link>
          </View>
          <View style={styles.trustRow}>
            <Text style={styles.trustItem}>Hébergé en Suisse</Text>
            <Text style={styles.trustDot}>·</Text>
            <Text style={styles.trustItem}>QR-facture conforme</Text>
            <Text style={styles.trustDot}>·</Text>
            <Text style={styles.trustItem}>Résiliable à tout moment</Text>
          </View>
        </Container>

        <PricingSection />
        <MarketingFooter />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    maxWidth: 900,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.lg,
    alignItems: 'center',
  },
  kickerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    marginBottom: spacing.md,
  },
  kickerText: {
    fontFamily: marketingFonts.body,
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.primaryDark,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  title: {
    fontFamily: marketingFonts.display,
    fontSize: 40,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: -0.6,
    lineHeight: 46,
    textAlign: 'center',
    maxWidth: 620,
  } as unknown as ViewStyle,
  subtitle: {
    fontFamily: marketingFonts.body,
    fontSize: fontSize.md,
    color: colors.textMuted,
    marginTop: spacing.md,
    lineHeight: 24,
    textAlign: 'center',
    maxWidth: 560,
  },
  ctaRow: { marginTop: spacing.xl },
  trustRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: spacing.xs, marginTop: spacing.lg },
  trustItem: { fontFamily: marketingFonts.body, fontSize: fontSize.xs, color: colors.textMuted, fontWeight: '600' },
  trustDot: { fontFamily: marketingFonts.body, fontSize: fontSize.xs, color: colors.border },
});
