import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, ScrollView, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Link } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import { Button, Container, Screen } from '../components/ui';
import { MarketingFooter, MarketingNav } from '../components/MarketingChrome';
import { colors, fontSize, radius, spacing } from '../lib/theme';
import { marketingFonts } from '../lib/marketingTheme';
import { authHref } from '../lib/appHost';
import { useTranslation } from '../lib/translations';

type InstallIcon = 'share' | 'more-vertical' | 'download';

interface InstallPlatform {
  key: 'ios' | 'android' | 'desktop';
  label: string;
  icon: InstallIcon;
  steps: string[];
}

export default function TelechargementScreen() {
  const { t } = useTranslation();
  const INSTALL_PLATFORMS: InstallPlatform[] = [
    {
      key: 'ios',
      label: t('telechargementPage.platformIosLabel'),
      icon: 'share',
      steps: [t('telechargementPage.platformIosStep1'), t('telechargementPage.platformIosStep2'), t('telechargementPage.platformIosStep3')],
    },
    {
      key: 'android',
      label: t('telechargementPage.platformAndroidLabel'),
      icon: 'more-vertical',
      steps: [t('telechargementPage.platformAndroidStep1'), t('telechargementPage.platformAndroidStep2'), t('telechargementPage.platformAndroidStep3')],
    },
    {
      key: 'desktop',
      label: t('telechargementPage.platformDesktopLabel'),
      icon: 'download',
      steps: [t('telechargementPage.platformDesktopStep1'), t('telechargementPage.platformDesktopStep2'), t('telechargementPage.platformDesktopStep3')],
    },
  ];
  const TRUST_ITEMS: { icon: 'lock' | 'flag' | 'shield'; title: string; text: string }[] = [
    { icon: 'lock', title: t('telechargementPage.trustEncryptedTitle'), text: t('telechargementPage.trustEncryptedText') },
    { icon: 'flag', title: t('telechargementPage.trustSwissTitle'), text: t('telechargementPage.trustSwissText') },
    { icon: 'shield', title: t('telechargementPage.trustAccessTitle'), text: t('telechargementPage.trustAccessText') },
  ];
  const heroAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(heroAnim, { toValue: 1, duration: 620, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [heroAnim]);

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <MarketingNav />

        {/* Same grid + soft blob backdrop as the homepage hero, so this page
            reads as part of the same site rather than a bolted-on screen.
            One message only: Cantia already works as an installable app
            today, no store needed — everything else (native apps, security)
            is secondary detail further down, not competing for attention. */}
        <View style={styles.heroWrap}>
          <View pointerEvents="none" style={styles.heroGrid} />
          <View pointerEvents="none" style={styles.heroBlob} />
          <Container style={styles.heroContainer}>
            <Animated.View
              style={{
                opacity: heroAnim,
                transform: [{ translateY: heroAnim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }],
              }}
            >
              <View style={styles.kickerPill}>
                <Text style={styles.kickerText}>{t('telechargementPage.kicker')}</Text>
              </View>
              <Text style={styles.title}>{t('telechargementPage.title')}</Text>
              <Text style={styles.subtitle}>{t('telechargementPage.subtitle')}</Text>
              <View style={styles.heroCtaRow}>
                <Link href={authHref('signup')} asChild>
                  <Button title={t('telechargementPage.ctaTry')} onPress={() => {}} />
                </Link>
              </View>
            </Animated.View>
          </Container>
        </View>

        <Container style={styles.container}>
          <View style={styles.installSection}>
            <Text style={styles.installTitle}>{t('telechargementPage.installTitle')}</Text>
            <Text style={styles.installLead}>{t('telechargementPage.installLead')}</Text>
            <InstallGuide platforms={INSTALL_PLATFORMS} />
          </View>

          <View style={styles.storeSection}>
            <View style={styles.storeSectionIcon}>
              <Feather name="package" size={18} color={colors.primary} />
            </View>
            <View style={styles.storeSectionBody}>
              <Text style={styles.storeSectionTitle}>{t('telechargementPage.storeSectionTitle')}</Text>
              <Text style={styles.storeSectionText}>{t('telechargementPage.storeSectionText')}</Text>
              <View style={styles.storeChipRow}>
                <StoreChip kind="apple" name={t('telechargementPage.appStoreName')} soonText={t('telechargementPage.storeSoon')} />
                <StoreChip kind="google" name={t('telechargementPage.googlePlayName')} soonText={t('telechargementPage.storeSoon')} />
              </View>
            </View>
          </View>

          <View style={styles.trustSection}>
            <Text style={styles.trustTitle}>{t('telechargementPage.trustTitle')}</Text>
            <Text style={styles.trustLead}>{t('telechargementPage.trustLead')}</Text>
            <View style={styles.trustGrid}>
              {TRUST_ITEMS.map((item) => (
                <View key={item.title} style={styles.trustCard}>
                  <View style={styles.trustIcon}>
                    <Feather name={item.icon} size={18} color={colors.primary} />
                  </View>
                  <Text style={styles.trustCardTitle}>{item.title}</Text>
                  <Text style={styles.trustCardText}>{item.text}</Text>
                </View>
              ))}
            </View>
          </View>

          <Text style={styles.note}>{t('telechargementPage.note')}</Text>
        </Container>

        <MarketingFooter />
      </ScrollView>
    </Screen>
  );
}

// Platform switcher + numbered steps only — no illustrated device mockup.
// A real product photo/mockup is planned for this page (design in progress
// separately); until then, plain steps read cleaner than an approximated
// browser-chrome illustration built out of Views.
function InstallGuide({ platforms }: { platforms: InstallPlatform[] }) {
  const [platform, setPlatform] = useState<InstallPlatform['key']>('ios');
  const active = platforms.find((p) => p.key === platform)!;

  return (
    <View style={styles.installGuide}>
      <View style={styles.installTabs}>
        {platforms.map((p) => (
          <Pressable
            key={p.key}
            onPress={() => setPlatform(p.key)}
            style={[styles.installTab, platform === p.key && styles.installTabActive]}
          >
            <Feather name={p.icon} size={14} color={platform === p.key ? colors.primary : colors.textMuted} />
            <Text style={[styles.installTabText, platform === p.key && styles.installTabTextActive]}>{p.label}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.installStepsCard}>
        {active.steps.map((step, i) => (
          <View key={step} style={styles.installStepRow}>
            <View style={styles.installStepNumber}>
              <Text style={styles.installStepNumberText}>{i + 1}</Text>
            </View>
            <Text style={styles.installStepText}>{step}</Text>
            {i < active.steps.length - 1 ? <View style={styles.installStepConnector} /> : null}
          </View>
        ))}
      </View>
    </View>
  );
}

function StoreChip({ kind, name, soonText }: { kind: 'apple' | 'google'; name: string; soonText: string }) {
  return (
    <View style={styles.storeChip}>
      <Ionicons name={kind === 'apple' ? 'logo-apple' : 'logo-google-playstore'} size={16} color="#fff" />
      <Text style={styles.storeChipName}>{name}</Text>
      <View style={styles.storeChipSoonDot} />
      <Text style={styles.storeChipSoonText}>{soonText}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
  },
  heroWrap: {
    position: 'relative',
    overflow: 'hidden',
  },
  heroGrid: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage:
      `linear-gradient(${colors.border} 1px, transparent 1px), linear-gradient(90deg, ${colors.border} 1px, transparent 1px)`,
    backgroundSize: '44px 44px',
    opacity: 0.5,
    maskImage: 'linear-gradient(to bottom, black, transparent)',
    WebkitMaskImage: 'linear-gradient(to bottom, black, transparent)',
  } as unknown as ViewStyle,
  heroBlob: {
    position: 'absolute',
    top: -140,
    right: -120,
    width: 420,
    height: 420,
    borderRadius: 210,
    backgroundColor: colors.primarySoft,
    opacity: 0.35,
  },
  heroContainer: {
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
  },
  kickerPill: {
    alignSelf: 'flex-start',
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
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  title: {
    fontFamily: marketingFonts.display,
    fontSize: 46,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: -0.6,
    lineHeight: 50,
  } as unknown as ViewStyle,
  subtitle: {
    fontFamily: marketingFonts.body,
    fontSize: fontSize.md,
    color: colors.textMuted,
    marginTop: spacing.md,
    lineHeight: 24,
    maxWidth: 540,
  },
  heroCtaRow: {
    flexDirection: 'row',
    marginTop: spacing.xl,
  },
  container: {
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  sectionTitle: {
    fontFamily: marketingFonts.display,
    fontSize: 24,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: -0.3,
  },
  sectionLead: {
    fontFamily: marketingFonts.body,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: spacing.xs,
    lineHeight: 20,
    maxWidth: 560,
  },
  storeSection: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xxl,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  storeSectionIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  storeSectionBody: {
    flex: 1,
    gap: spacing.xs,
  },
  storeSectionTitle: {
    fontFamily: marketingFonts.body,
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  storeSectionText: {
    fontFamily: marketingFonts.body,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    lineHeight: 20,
  },
  storeChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  storeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    backgroundColor: '#111414',
  },
  storeChipName: {
    fontFamily: marketingFonts.body,
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: '#fff',
  },
  storeChipSoonDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.primary,
    marginLeft: 2,
  },
  storeChipSoonText: {
    fontFamily: marketingFonts.body,
    fontSize: 10,
    color: '#C7CCC9',
  },
  installSection: {
    marginTop: spacing.sm,
  },
  installTitle: {
    fontFamily: marketingFonts.display,
    fontSize: 26,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: -0.3,
  },
  installLead: {
    fontFamily: marketingFonts.body,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  installGuide: {
    gap: spacing.lg,
  },
  installTabs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  installTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  installTabActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  installTabText: {
    fontFamily: marketingFonts.body,
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textMuted,
  },
  installTabTextActive: {
    color: colors.primary,
  },
  installStepsCard: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  installStepRow: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
    position: 'relative',
  },
  installStepNumber: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    zIndex: 1,
  },
  installStepNumberText: {
    fontFamily: marketingFonts.body,
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
  },
  installStepText: {
    flex: 1,
    fontFamily: marketingFonts.body,
    fontSize: fontSize.sm,
    color: colors.text,
    lineHeight: 20,
    paddingVertical: spacing.xs,
    paddingBottom: spacing.md,
  },
  installStepConnector: {
    position: 'absolute',
    left: 12,
    top: 26,
    bottom: -2,
    width: 2,
    backgroundColor: colors.border,
  },
  note: {
    fontFamily: marketingFonts.body,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: spacing.xl,
    textAlign: 'center',
  },
  trustSection: {
    marginTop: spacing.xxxl,
    paddingTop: spacing.xxl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  trustTitle: {
    fontFamily: marketingFonts.display,
    fontSize: 28,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  trustLead: {
    fontFamily: marketingFonts.body,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xs,
    maxWidth: 480,
    alignSelf: 'center',
  },
  trustGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  trustCard: {
    flex: 1,
    minWidth: 180,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  trustIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  trustCardTitle: {
    fontFamily: marketingFonts.body,
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
  },
  trustCardText: {
    fontFamily: marketingFonts.body,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    lineHeight: 17,
  },
});
