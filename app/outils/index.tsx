import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Link } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Screen } from '../../components/ui';
import { MarketingHead } from '../../components/MarketingHead';
import { MarketingFooter, MarketingNav } from '../../components/MarketingChrome';
import { PageHero, pageWrap } from '../../components/landing/PageHero';
import { bodyInk, ink, rule } from '../../components/landing/brand';
import { TOOLS } from '../../lib/tools/registry';
import { breakpoints, colors, spacing } from '../../lib/theme';
import { marketingFonts } from '../../lib/marketingTheme';

// cantia.ch/outils: every free tool (lead magnets) on one page.

export default function ToolsHubPage() {
  const { width } = useWindowDimensions();
  const cols = width >= breakpoints.desktop ? 3 : width >= breakpoints.tablet ? 2 : 1;
  return (
    <Screen style={{ padding: 0 }}>
      <MarketingHead
        title="Outils gratuits pour les entreprises du bâtiment en Suisse | Cantia"
        description="Calculateurs gratuits : salaire net et charges, taux horaire, TVA, marge, intérêts de retard, indemnité de vacances. Aux règles suisses 2026, sans inscription."
      />
      <MarketingNav />
      <ScrollView>
        <PageHero
          kicker="Gratuit · Sans inscription"
          title="Outils gratuits"
          lede="Les calculs qu’un patron du bâtiment fait toutes les semaines, aux règles suisses en vigueur. Résultat immédiat, PDF à télécharger."
        />
        <View style={[pageWrap, styles.body]}>
          <View style={styles.grid}>
            {TOOLS.map((t) => (
              <Link key={t.slug} href={t.href as any} asChild>
                <Pressable style={StyleSheet.flatten([styles.card, { flexBasis: cols === 3 ? '31%' : cols === 2 ? '47%' : '100%' }])}>
                  <View style={styles.icon}>
                    <Feather name={t.icon as any} size={20} color={colors.primary} />
                  </View>
                  <Text style={styles.title}>{t.title}</Text>
                  <Text style={styles.text}>{t.text}</Text>
                  <Text style={styles.open}>Ouvrir l’outil →</Text>
                </Pressable>
              </Link>
            ))}
          </View>
        </View>
        <MarketingFooter />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { paddingBottom: spacing.xxxl },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.lg },
  card: { flexGrow: 1, gap: spacing.sm, padding: spacing.xl, borderWidth: 1, borderColor: rule, borderRadius: 4, backgroundColor: colors.surface, minHeight: 210 },
  icon: { width: 40, height: 40, borderRadius: 4, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: marketingFonts.body, fontSize: 19, fontWeight: '800', color: ink },
  text: { fontFamily: marketingFonts.body, fontSize: 14, lineHeight: 21, color: bodyInk },
  open: { fontFamily: marketingFonts.body, fontSize: 14, fontWeight: '700', color: colors.primary, marginTop: 'auto' },
});
