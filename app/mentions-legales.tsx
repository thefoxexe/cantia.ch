import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Container, Screen } from '../components/ui';
import { colors, fontSize, spacing } from '../lib/theme';
import { getAppLocale, useTranslation } from '../lib/translations';

export default function MentionsLegalesScreen() {
  const { t } = useTranslation();
  const homeHref = getAppLocale() === 'de' ? '/de' : '/';
  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Container style={styles.container}>
          <Link href={homeHref as any} asChild>
            <Pressable style={styles.back} hitSlop={8}>
              <Feather name="arrow-left" size={16} color={colors.text} />
              <Text style={styles.backText}>{t('mentionsLegales.back')}</Text>
            </Pressable>
          </Link>

          <Text style={styles.title}>{t('mentionsLegales.title')}</Text>
          <Text style={styles.updated}>{t('mentionsLegales.updated')}</Text>

          <LegalSection title={t('mentionsLegales.publisherTitle')}>
            <Text style={styles.p}>{t('mentionsLegales.publisherText')}</Text>
          </LegalSection>

          <LegalSection title={t('mentionsLegales.hostingTitle')}>
            <Text style={styles.p}>{t('mentionsLegales.hostingText')}</Text>
          </LegalSection>

          <LegalSection title={t('mentionsLegales.ipTitle')}>
            <Text style={styles.p}>{t('mentionsLegales.ipText')}</Text>
          </LegalSection>

          <LegalSection title={t('mentionsLegales.liabilityTitle')}>
            <Text style={styles.p}>{t('mentionsLegales.liabilityText')}</Text>
          </LegalSection>

          <LegalSection title={t('mentionsLegales.contactTitle')}>
            <Text style={styles.p}>{t('mentionsLegales.contactText')}</Text>
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
