import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Container, Screen } from '../components/ui';
import { MarketingHead } from '../components/MarketingHead';
import { colors, fontSize, spacing } from '../lib/theme';
import { getAppLocale, useTranslation } from '../lib/translations';
import { marketingPageTitle } from '../lib/marketingSeoTitles';

export default function ConditionsGeneralesScreen() {
  const { t } = useTranslation();
  const locale = getAppLocale();
  const homeHref = locale === 'de' ? '/de' : locale === 'it' ? '/it' : '/';
  return (
    <Screen>
      <MarketingHead title={marketingPageTitle('conditionsGenerales', locale)} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Container style={styles.container}>
          <Link href={homeHref as any} asChild>
            <Pressable style={styles.back} hitSlop={8}>
              <Feather name="arrow-left" size={16} color={colors.text} />
              <Text style={styles.backText}>{t('conditionsGenerales.back')}</Text>
            </Pressable>
          </Link>

          <Text style={styles.title}>{t('conditionsGenerales.title')}</Text>
          <Text style={styles.updated}>{t('conditionsGenerales.updated')}</Text>

          <LegalSection title={t('conditionsGenerales.objectTitle')}>
            <Text style={styles.p}>{t('conditionsGenerales.objectText')}</Text>
          </LegalSection>

          <LegalSection title={t('conditionsGenerales.essaiTitle')}>
            <Text style={styles.p}>{t('conditionsGenerales.essaiText')}</Text>
          </LegalSection>

          <LegalSection title={t('conditionsGenerales.abonnementTitle')}>
            <Text style={styles.p}>{t('conditionsGenerales.abonnementText')}</Text>
          </LegalSection>

          <LegalSection title={t('conditionsGenerales.resiliationTitle')}>
            <Text style={styles.p}>{t('conditionsGenerales.resiliationText')}</Text>
          </LegalSection>

          <LegalSection title={t('conditionsGenerales.contestationTitle')}>
            <Text style={styles.p}>{t('conditionsGenerales.contestationText')}</Text>
          </LegalSection>

          <LegalSection title={t('conditionsGenerales.disponibiliteTitle')}>
            <Text style={styles.p}>{t('conditionsGenerales.disponibiliteText')}</Text>
          </LegalSection>

          <LegalSection title={t('conditionsGenerales.droitTitle')}>
            <Text style={styles.p}>{t('conditionsGenerales.droitText')}</Text>
          </LegalSection>

          <LegalSection title={t('conditionsGenerales.modificationTitle')}>
            <Text style={styles.p}>{t('conditionsGenerales.modificationText')}</Text>
          </LegalSection>

          <LegalSection title={t('conditionsGenerales.contactTitle')}>
            <Text style={styles.p}>{t('conditionsGenerales.contactText')}</Text>
          </LegalSection>
        </Container>
      </ScrollView>
    </Screen>
  );
}

function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    paddingVertical: spacing.xxl,
  },
  container: {
    maxWidth: 720,
    paddingHorizontal: spacing.xl,
  },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xl,
    alignSelf: 'flex-start',
  },
  backText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.text,
  },
  updated: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  p: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    lineHeight: 21,
  },
});
