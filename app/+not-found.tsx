import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { Button, Container, Screen } from '../components/ui';
import { MarketingFooter, MarketingNav } from '../components/MarketingChrome';
import { colors, fontSize, spacing } from '../lib/theme';
import { marketingFonts } from '../lib/marketingTheme';

// Expo Router's built-in convention for a 404 — any unmatched route renders
// this instead of the framework's bare default page. Kept branded and on
// the same chrome (nav + footer) as the rest of the marketing site so a
// dead/mistyped link doesn't dead-end the visitor with no way back in.
export default function NotFoundScreen() {
  return (
    <Screen>
      <MarketingNav />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Container style={styles.container}>
          <Text style={styles.kicker}>Erreur 404</Text>
          <Text style={styles.title}>Cette page n'existe pas ou plus</Text>
          <Text style={styles.text}>
            Le lien est peut-être mal orthographié, ou la page a été déplacée. Retrouvez ce que vous cherchiez depuis
            l'accueil.
          </Text>
          <View style={styles.actions}>
            <Link href="/" asChild>
              <Button title="Retour à l'accueil" onPress={() => {}} />
            </Link>
          </View>
        </Container>
      </ScrollView>
      <MarketingFooter />
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
  },
  container: {
    maxWidth: 560,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxxl,
    alignItems: 'flex-start',
  },
  kicker: {
    fontFamily: marketingFonts.body,
    fontSize: fontSize.xs,
    fontWeight: '800',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  title: {
    fontFamily: marketingFonts.display,
    fontSize: 34,
    fontWeight: '600',
    letterSpacing: -0.4,
    color: colors.text,
    marginBottom: spacing.md,
  },
  text: {
    fontFamily: marketingFonts.body,
    fontSize: fontSize.md,
    color: colors.textMuted,
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  actions: {
    flexDirection: 'row',
  },
});
