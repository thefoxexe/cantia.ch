import { useRef, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { Screen } from '../components/ui';
import { PageHero, pageWrap } from '../components/landing/PageHero';
import { SectionHead } from '../components/landing/SectionHead';
import { bodyInk, ink, rule } from '../components/landing/brand';
import { MarketingHead } from '../components/MarketingHead';
import { MarketingFooter, MarketingNav } from '../components/MarketingChrome';
import { breakpoints, colors, spacing } from '../lib/theme';
import { Wordmark } from '../components/brand/Logo';
import { marketingFonts, monoType } from '../lib/marketingTheme';
import { authHref } from '../lib/appHost';
import { getAppLocale, useTranslation } from '../lib/translations';
import { marketingPageTitle } from '../lib/marketingSeoTitles';

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
  const { width } = useWindowDimensions();
  const isTablet = width < breakpoints.desktop;
  const isMobile = width < breakpoints.tablet;
  const locale = getAppLocale();
  const localePrefix = locale === 'de' ? '/de' : locale === 'it' ? '/it' : '';
  const scrollRef = useRef<ScrollView>(null);
  const installY = useRef(0);
  // The app installs; Accounting and Partners are plain web apps.
  const APPS: { product?: string; tag: string; badge: string; installable: boolean; text: string; cta: string; href?: string }[] = [
    { tag: t('telechargementPage.appsMainTag'), badge: t('telechargementPage.appsMainBadge'), installable: true, text: t('telechargementPage.appsMainText'), cta: t('telechargementPage.appsMainCta') },
    { product: 'Accounting', tag: t('telechargementPage.appsAccountingTag'), badge: t('telechargementPage.appsWebBadge'), installable: false, text: t('telechargementPage.appsAccountingText'), cta: t('telechargementPage.appsAccountingCta'), href: `https://accounting.cantia.ch${localePrefix}` },
    { product: 'Partners', tag: t('telechargementPage.appsPartnersTag'), badge: t('telechargementPage.appsWebBadge'), installable: false, text: t('telechargementPage.appsPartnersText'), cta: t('telechargementPage.appsPartnersCta'), href: `https://partners.cantia.ch${localePrefix}` },
  ];

  return (
    <Screen style={{ padding: 0 }}>
      <MarketingHead title={marketingPageTitle('telechargement', getAppLocale())} />
      <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false}>
        <MarketingNav />

        <PageHero
          kicker={t('telechargementPage.kicker')}
          title={t('telechargementPage.title')}
          lede={t('telechargementPage.subtitle')}
          cta={{ title: t('telechargementPage.ctaTry'), href: authHref('signup') }}
          aside={
            // The one message Google Ads reviewers and visitors both need:
            // nothing is downloaded, this is a browser shortcut.
            <View style={styles.clarity}>
              <Text style={styles.clarityLabel}>cantia.ch</Text>
              <Text style={styles.clarityTitle}>{t('telechargementPage.clarityTitle')}</Text>
              <Text style={styles.bodyText}>{t('telechargementPage.clarityText')}</Text>
            </View>
          }
        />

        <View style={[styles.wrap, styles.section]}>
          <SectionHead title={t('telechargementPage.appsTitle')} intro={t('telechargementPage.appsLead')} />
          <View style={[styles.apps, isTablet && styles.appsStacked]}>
            {APPS.map((app) => (
              <View key={app.tag} style={[styles.appCard, isTablet && styles.appCardStacked, app.installable && styles.appCardMain, isMobile && styles.appCardPhone]}>
                <Wordmark height={isMobile ? 14 : 15} stacked={isMobile} product={app.product} />
                <View style={styles.appMeta}>
                  <Text style={styles.appTag}>{app.tag}</Text>
                  <View style={[styles.appBadge, app.installable && styles.appBadgeMain]}>
                    <Feather name={app.installable ? 'download' : 'globe'} size={12} color={app.installable ? '#FBF6EE' : colors.primary} />
                    <Text style={[styles.appBadgeText, app.installable && { color: '#FBF6EE' }]}>{app.badge}</Text>
                  </View>
                </View>
                <Text style={[styles.bodyText, !isTablet && { flexGrow: 1 }]}>{app.text}</Text>
                <Pressable
                  onPress={() => (app.href ? Linking.openURL(app.href) : scrollRef.current?.scrollTo({ y: Math.max(0, installY.current - 80), animated: true }))}
                  accessibilityRole="link"
                >
                  <Text style={styles.appLink}>{app.cta} {app.href ? '↗' : '↓'}</Text>
                </Pressable>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.wrap, styles.section]} onLayout={(e) => (installY.current = e.nativeEvent.layout.y)}>
          <SectionHead title={t('telechargementPage.installTitle')} intro={t('telechargementPage.installLead')} />
          <InstallGuide platforms={INSTALL_PLATFORMS} />
        </View>

        <View style={[styles.wrap, styles.section]}>
          <View style={[styles.storeRow, isTablet && styles.storeRowCompact]}>
            <View style={{ flex: 1, gap: spacing.sm }}>
              <Text style={styles.columnTitle}>{t('telechargementPage.storeSectionTitle')}</Text>
              <Text style={styles.bodyText}>{t('telechargementPage.storeSectionText')}</Text>
            </View>
            <View style={styles.storeChipRow}>
              <StoreChip kind="apple" name={t('telechargementPage.appStoreName')} soonText={t('telechargementPage.storeSoon')} />
              <StoreChip kind="google" name={t('telechargementPage.googlePlayName')} soonText={t('telechargementPage.storeSoon')} />
            </View>
          </View>
        </View>

        <View style={[styles.wrap, styles.section]}>
          <SectionHead title={t('telechargementPage.trustTitle')} intro={t('telechargementPage.trustLead')} />
          <View style={[styles.columns, isTablet && styles.columnsCompact]}>
            {TRUST_ITEMS.map((item, i) => (
              <View key={item.title} style={[styles.column, !isTablet && i > 0 && styles.columnDivider, isTablet && styles.columnCompact]}>
                <Feather name={item.icon} size={20} color={colors.primary} />
                <Text style={styles.columnTitle}>{item.title}</Text>
                <Text style={styles.bodyText}>{item.text}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.note}>{t('telechargementPage.note')}</Text>
        </View>

        <MarketingFooter />
      </ScrollView>
    </Screen>
  );
}

function InstallGuide({ platforms }: { platforms: InstallPlatform[] }) {
  const [platform, setPlatform] = useState<InstallPlatform['key']>('ios');
  const active = platforms.find((p) => p.key === platform)!;

  return (
    <View>
      <View style={styles.tabs}>
        {platforms.map((p) => {
          const on = platform === p.key;
          return (
            <Pressable key={p.key} onPress={() => setPlatform(p.key)} style={[styles.tab, on && styles.tabActive]}>
              <Feather name={p.icon} size={15} color={on ? '#FBF6EE' : colors.primary} />
              <Text style={[styles.tabText, on && { color: '#FBF6EE' }]}>{p.label}</Text>
            </Pressable>
          );
        })}
      </View>
      <View style={styles.steps}>
        {active.steps.map((step, i) => (
          <View key={step} style={styles.stepRow}>
            <Text style={styles.stepNum}>{i + 1}</Text>
            <Text style={styles.stepText}>{step}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function StoreChip({ kind, name, soonText }: { kind: 'apple' | 'google'; name: string; soonText: string }) {
  return (
    <View style={styles.storeChip}>
      <Ionicons name={kind === 'apple' ? 'logo-apple' : 'logo-google-playstore'} size={16} color="#FBF6EE" />
      <Text style={styles.storeChipName}>{name}</Text>
      <Text style={styles.storeChipSoon}>{soonText}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: pageWrap,
  section: { paddingTop: 96 },
  bodyText: { fontFamily: marketingFonts.body, fontSize: 16, lineHeight: 25, color: bodyInk },
  columnTitle: { fontFamily: marketingFonts.body, fontSize: 20, fontWeight: '700', lineHeight: 26, color: ink },

  clarity: { borderWidth: 1.5, borderColor: ink, backgroundColor: '#FBF6EE', padding: spacing.xl, gap: spacing.sm, maxWidth: 460, borderRadius: 3 },
  clarityLabel: { ...monoType, fontSize: 10.5, letterSpacing: 0.4, textTransform: 'uppercase', color: colors.primary },
  clarityTitle: { fontFamily: marketingFonts.body, fontSize: 22, fontWeight: '700', lineHeight: 28, color: ink },

  apps: { flexDirection: 'row', gap: spacing.lg, marginTop: spacing.xl },
  appsStacked: { flexDirection: 'column' },
  // Stacked: each card as tall as its content (flex: 1 would share the
  // column's height and push the link out of the frame).
  appCardStacked: { flex: 0, flexGrow: 0, flexBasis: 'auto' },
  appCard: { flex: 1, gap: spacing.md, borderWidth: 1, borderColor: rule, borderRadius: 4, padding: spacing.xl, backgroundColor: '#FFFFFF' },
  appCardMain: { borderColor: colors.primary, borderTopWidth: 3 },
  appCardPhone: { padding: spacing.lg },
  appMeta: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.sm },
  appTag: { ...monoType, fontSize: 11, letterSpacing: 0.6, textTransform: 'uppercase', color: colors.primary },
  appBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: colors.primary, borderRadius: 999, paddingVertical: 3, paddingHorizontal: 10 },
  appBadgeMain: { backgroundColor: ink, borderColor: ink },
  appBadgeText: { fontFamily: marketingFonts.body, fontSize: 12, fontWeight: '600', color: colors.primary },
  appLink: { fontFamily: marketingFonts.body, fontSize: 15, fontWeight: '700', color: colors.primary },

  tabs: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.xl },
  tab: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10, paddingHorizontal: 14, borderWidth: 1, borderColor: rule, borderRadius: 3 },
  tabActive: { backgroundColor: ink, borderColor: ink },
  tabText: { fontFamily: marketingFonts.body, fontSize: 15, fontWeight: '600', color: ink },
  steps: { borderTopWidth: 1.5, borderTopColor: ink, maxWidth: 760 },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.lg, paddingVertical: spacing.lg, borderBottomWidth: 1, borderBottomColor: rule },
  stepNum: { ...monoType, width: 28, height: 28, lineHeight: 25, borderRadius: 14, borderWidth: 1.5, borderColor: colors.primary, color: colors.primary, fontSize: 12, textAlign: 'center' },
  stepText: { flex: 1, fontFamily: marketingFonts.body, fontSize: 18, lineHeight: 27, color: ink },

  storeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xxl, borderTopWidth: 1, borderBottomWidth: 1, borderColor: rule, paddingVertical: spacing.xl },
  storeRowCompact: { flexDirection: 'column', alignItems: 'flex-start' },
  storeChipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  storeChip: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: ink, borderRadius: 3, paddingVertical: 10, paddingHorizontal: 14 },
  storeChipName: { fontFamily: marketingFonts.body, fontSize: 14, fontWeight: '600', color: '#FBF6EE' },
  storeChipSoon: { ...monoType, fontSize: 10, color: '#E8AD89', textTransform: 'uppercase' },

  columns: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: rule },
  columnsCompact: { flexDirection: 'column', borderBottomWidth: 0 },
  column: { flex: 1, gap: spacing.sm, paddingRight: spacing.xl, paddingBottom: spacing.xl },
  columnDivider: { borderLeftWidth: 1, borderLeftColor: rule, paddingLeft: spacing.xl },
  columnCompact: { borderTopWidth: 1, borderTopColor: rule, paddingTop: spacing.lg, paddingRight: 0 },
  note: { ...monoType, fontSize: 10.5, lineHeight: 17, color: colors.textMuted, marginTop: spacing.xl, marginBottom: 96 },
});
