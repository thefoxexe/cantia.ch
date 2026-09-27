import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Screen } from '../components/ui';
import { MarketingHead } from '../components/MarketingHead';
import { MarketingFooter, MarketingNav } from '../components/MarketingChrome';
import { ContactForm } from '../components/ContactForm';
import { PageHero, pageWrap } from '../components/landing/PageHero';
import { ink, rule } from '../components/landing/brand';
import { breakpoints, colors, spacing } from '../lib/theme';
import { marketingFonts, monoType } from '../lib/marketingTheme';
import { getAppLocale, useTranslation } from '../lib/translations';
import { useMarketingDict } from '../lib/i18n';
import { openLiveChat } from '../lib/liveChat';
import { marketingPageTitle } from '../lib/marketingSeoTitles';

export default function ContactScreen() {
  const { t } = useTranslation();
  const dict = useMarketingDict();
  const { width } = useWindowDimensions();
  const isTablet = width < breakpoints.desktop;
  const rows: { icon: keyof typeof Feather.glyphMap; label: string; value: string }[] = [
    { icon: 'mail', label: t('contactPage.emailLabel'), value: 'info@cantia.ch' },
    { icon: 'phone', label: t('contactPage.phoneLabel'), value: '+41 78 450 14 57' },
    { icon: 'clock', label: t('contactPage.responseTimeLabel'), value: t('contactPage.responseTimeValue') },
  ];

  return (
    <Screen style={{ padding: 0 }}>
      <MarketingHead title={marketingPageTitle('contact', getAppLocale())} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <MarketingNav />

        <PageHero kicker={dict.landingNav.contact} title={t('contactPage.title')} lede={t('contactPage.lead')} />

        <View style={[pageWrap, styles.layout, isTablet && styles.layoutCompact]}>
          <View style={[styles.details, !isTablet && { flex: 0.8 }]}>
            {rows.map((r) => (
              <View key={r.label} style={styles.detailRow}>
                <Feather name={r.icon} size={18} color={colors.primary} style={{ marginTop: 2 }} />
                <View style={{ flex: 1, gap: 4 }}>
                  <Text style={styles.detailLabel}>{r.label}</Text>
                  <Text selectable style={styles.detailValue}>{r.value}</Text>
                </View>
              </View>
            ))}
            <Pressable style={styles.chatButton} onPress={openLiveChat}>
              <Feather name="message-circle" size={16} color="#FBF6EE" />
              <Text style={styles.chatButtonText}>{t('contactPage.chatButton')}</Text>
            </Pressable>
          </View>
          <View style={!isTablet ? { flex: 1 } : undefined}>
            <ContactForm />
          </View>
        </View>

        <MarketingFooter />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  layout: { flexDirection: 'row', gap: 64, alignItems: 'flex-start', paddingTop: spacing.xl, paddingBottom: 96 },
  layoutCompact: { flexDirection: 'column', alignItems: 'stretch', gap: spacing.xxl },
  details: { borderTopWidth: 1.5, borderTopColor: ink },
  detailRow: { flexDirection: 'row', gap: spacing.lg, paddingVertical: spacing.lg, borderBottomWidth: 1, borderBottomColor: rule },
  detailLabel: { ...monoType, fontSize: 10.5, letterSpacing: 0.4, textTransform: 'uppercase', color: colors.textMuted },
  detailValue: { fontFamily: marketingFonts.body, fontSize: 20, fontWeight: '700', color: ink },
  chatButton: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: spacing.sm, backgroundColor: ink, borderRadius: 3, paddingVertical: 12, paddingHorizontal: 18, marginTop: spacing.xl },
  chatButtonText: { fontFamily: marketingFonts.body, fontSize: 15, fontWeight: '600', color: '#FBF6EE' },
});
