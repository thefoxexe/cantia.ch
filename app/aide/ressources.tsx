import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Container, Screen } from '../../components/ui';
import { Heading } from '../../components/Heading';
import { MarketingFooter, MarketingNav } from '../../components/MarketingChrome';
import { colors, fontSize, radius, spacing } from '../../lib/theme';
import { getAppLocale, useTranslation } from '../../lib/translations';
import { site } from '../../lib/siteTheme';

const DM = "'DM Sans', 'DM Sans Fallback', Arial, sans-serif";

// Downloadable resources library, reachable from the Centre d'aide — starts
// with the one B2B product dossier (FR + DE PDFs in public/), both always
// offered side by side regardless of the visitor's own locale since the
// point of a downloadable dossier is often to forward it to someone else
// (a business partner, a decision-maker) who may need the other language.
export default function AideRessourcesScreen() {
  const { t } = useTranslation();
  const aideHref = getAppLocale() === 'de' ? '/de/aide' : getAppLocale() === 'it' ? '/it/aide' : '/aide';

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <MarketingNav />

        <Container style={styles.container}>
          <Link href={aideHref as any} style={styles.backLink}>
            <Feather name="arrow-left" size={14} color={site.muted} />
            <Text style={styles.backLinkText}>{t('aideRessourcesPage.backLink')}</Text>
          </Link>
          <Heading level={1} style={styles.title}>{t('aideRessourcesPage.title')}</Heading>
          <Text style={styles.lead}>{t('aideRessourcesPage.lead')}</Text>

          <View style={styles.card}>
            <View style={styles.cardIcon}>
              <Feather name="file-text" size={20} color={site.copper} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{t('aideRessourcesPage.dossierTitle')}</Text>
              <Text style={styles.cardText}>{t('aideRessourcesPage.dossierText')}</Text>
              <View style={styles.downloadRow}>
                <Pressable style={styles.downloadButton} onPress={() => Linking.openURL('/cantia-dossier-b2b-fr.pdf')}>
                  <Feather name="download" size={14} color="#fff" />
                  <Text style={styles.downloadButtonText}>{t('aideRessourcesPage.downloadFr')}</Text>
                </Pressable>
                <Pressable
                  style={[styles.downloadButton, styles.downloadButtonSecondary]}
                  onPress={() => Linking.openURL('/cantia-dossier-b2b-de.pdf')}
                >
                  <Feather name="download" size={14} color={site.copper} />
                  <Text style={[styles.downloadButtonText, styles.downloadButtonTextSecondary]}>
                    {t('aideRessourcesPage.downloadDe')}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Container>

        <MarketingFooter />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: spacing.xxl,
  },
  container: {
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.lg,
  },
  backLinkText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: site.muted,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '600',
    color: site.ink,
  },
  lead: {
    fontSize: fontSize.md,
    color: site.muted,
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
    maxWidth: 560,
    lineHeight: 22,
  },
  card: {
    flexDirection: 'row',
    gap: spacing.md,
    borderWidth: 1,
    borderColor: site.line,
    backgroundColor: site.white,
    borderRadius: 3,
    padding: spacing.lg,
    maxWidth: 560,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 3,
    backgroundColor: '#f3e6da',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: site.ink,
  },
  cardText: {
    fontSize: fontSize.sm,
    color: site.muted,
    marginTop: 2,
    lineHeight: 19,
  },
  downloadRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: site.copper,
    borderRadius: 3,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  downloadButtonSecondary: {
    backgroundColor: '#f3e6da',
  },
  downloadButtonText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: '#fff',
  },
  downloadButtonTextSecondary: {
    color: site.copper,
  },
});
