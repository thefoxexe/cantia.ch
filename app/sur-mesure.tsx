import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SolutionPage } from '../components/SolutionPage';
import { SurMesureContactForm } from '../components/SurMesureContactForm';
import { Container } from '../components/ui';
import { colors, fontSize, radius, spacing } from '../lib/theme';
import { marketingFonts } from '../lib/marketingTheme';
import { getAppLocale, useTranslation } from '../lib/translations';

// SEO/marketing page for the "on peut développer un module juste pour vous"
// pitch — previously a homepage section (customModules), moved here so the
// homepage stays focused and this gets its own indexable URL/meta. Same
// underlying idea as documented in the Super Admin plan: a private module
// or workflow can be switched on for one organization only, in the same
// Cantia environment everyone else uses — never a forked copy of the app.
function SurMesureVisual() {
  const { t } = useTranslation();
  const visualListItems = [t('surMesurePage.visualListItem1'), t('surMesurePage.visualListItem2'), t('surMesurePage.visualListItem3')];
  return (
    <View style={styles.visualFrame}>
      <View style={styles.visualTopBar}>
        <View style={styles.visualDots}>
          <View style={[styles.visualDot, { backgroundColor: '#E38B7A' }]} />
          <View style={[styles.visualDot, { backgroundColor: '#E8C57A' }]} />
          <View style={[styles.visualDot, { backgroundColor: '#8FB88A' }]} />
        </View>
        <View style={styles.visualAddressBar}>
          <Feather name="lock" size={9} color={colors.textMuted} />
          <Text style={styles.visualAddressText}>cantia.ch</Text>
        </View>
      </View>
      <View style={styles.visualScreen}>
        <View style={styles.visualModuleRow}>
          <View style={styles.visualModuleIcon}>
            <Feather name="sliders" size={18} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.visualModuleTitle}>{t('surMesurePage.visualModuleTitle')}</Text>
            <Text style={styles.visualModuleSubtitle}>{t('surMesurePage.visualModuleSubtitle')}</Text>
          </View>
          <View style={styles.visualToggleOn}>
            <View style={styles.visualToggleDot} />
          </View>
        </View>
        <View style={styles.visualListDivider} />
        {visualListItems.map((label) => (
          <View key={label} style={styles.visualListRow}>
            <Feather name="check-circle" size={13} color={colors.success} />
            <Text style={styles.visualListText}>{label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export default function SurMesurePage() {
  const { t } = useTranslation();
  const locale = getAppLocale();
  const integrationsHref = locale === 'de' ? '/de/integrations' : '/integrations';
  const solutionsPrefix = locale === 'de' ? '/de/solutions' : '/solutions';
  return (
    <SolutionPage
      kicker={t('surMesurePage.kicker')}
      title={t('surMesurePage.title')}
      subtitle={t('surMesurePage.subtitle')}
      visual={<SurMesureVisual />}
      afterFeatures={
        <Container style={styles.formSection}>
          <SurMesureContactForm />
        </Container>
      }
      features={[
        { icon: 'sliders', title: t('surMesurePage.feature1Title'), text: t('surMesurePage.feature1Text') },
        { icon: 'link', title: t('surMesurePage.feature2Title'), text: t('surMesurePage.feature2Text') },
        { icon: 'git-branch', title: t('surMesurePage.feature3Title'), text: t('surMesurePage.feature3Text') },
        { icon: 'eye-off', title: t('surMesurePage.feature4Title'), text: t('surMesurePage.feature4Text') },
        { icon: 'refresh-cw', title: t('surMesurePage.feature5Title'), text: t('surMesurePage.feature5Text') },
        { icon: 'message-circle', title: t('surMesurePage.feature6Title'), text: t('surMesurePage.feature6Text') },
      ]}
      steps={[
        { title: t('surMesurePage.step1Title'), text: t('surMesurePage.step1Text') },
        { title: t('surMesurePage.step2Title'), text: t('surMesurePage.step2Text') },
        { title: t('surMesurePage.step3Title'), text: t('surMesurePage.step3Text') },
      ]}
      faq={[
        { question: t('surMesurePage.faq1Question'), answer: t('surMesurePage.faq1Answer') },
        { question: t('surMesurePage.faq2Question'), answer: t('surMesurePage.faq2Answer') },
        { question: t('surMesurePage.faq3Question'), answer: t('surMesurePage.faq3Answer') },
        { question: t('surMesurePage.faq4Question'), answer: t('surMesurePage.faq4Answer') },
      ]}
      related={[
        { href: integrationsHref, label: t('surMesurePage.relatedIntegrationsLabel') },
        { href: `${solutionsPrefix}/facturation`, label: t('surMesurePage.relatedFacturationLabel') },
      ]}
      closingTitle={t('surMesurePage.closingTitle')}
      closingText={t('surMesurePage.closingText')}
    />
  );
}

const styles = StyleSheet.create({
  formSection: {
    paddingVertical: spacing.xl,
  },
  visualFrame: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
  },
  visualTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surfaceAlt,
  },
  visualDots: {
    flexDirection: 'row',
    gap: 5,
  },
  visualDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  visualAddressBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  visualAddressText: {
    fontFamily: marketingFonts.body,
    fontSize: 10,
    color: colors.textMuted,
  },
  visualScreen: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  visualModuleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  visualModuleIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  visualModuleTitle: {
    fontFamily: marketingFonts.body,
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  visualModuleSubtitle: {
    fontFamily: marketingFonts.body,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  visualToggleOn: {
    width: 34,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    paddingHorizontal: 2,
    alignItems: 'flex-end',
  },
  visualToggleDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  visualListDivider: {
    height: 1,
    backgroundColor: colors.border,
  },
  visualListRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  visualListText: {
    fontFamily: marketingFonts.body,
    fontSize: fontSize.sm,
    color: colors.text,
    fontWeight: '600',
  },
});
