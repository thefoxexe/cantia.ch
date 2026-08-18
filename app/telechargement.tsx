import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import { Button, Container, Screen } from '../components/ui';
import { MarketingFooter, MarketingNav } from '../components/MarketingChrome';
import { colors, fontSize, radius, spacing } from '../lib/theme';
import { marketingFonts } from '../lib/marketingTheme';
import { authHref } from '../lib/appHost';

type InstallIcon = 'share' | 'more-vertical' | 'download';

interface InstallPlatform {
  key: 'ios' | 'android' | 'desktop';
  label: string;
  device: 'phone' | 'desktop';
  chromePosition: 'top' | 'bottom';
  icon: InstallIcon;
  steps: string[];
}

const INSTALL_PLATFORMS: InstallPlatform[] = [
  {
    key: 'ios',
    label: 'iPhone (Safari)',
    device: 'phone',
    chromePosition: 'bottom',
    icon: 'share',
    steps: [
      'Ouvrez cantia.ch dans Safari',
      "Appuyez sur l'icône de partage, en bas de l'écran",
      'Faites défiler et appuyez sur "Sur l\'écran d\'accueil"',
    ],
  },
  {
    key: 'android',
    label: 'Android (Chrome)',
    device: 'phone',
    chromePosition: 'top',
    icon: 'more-vertical',
    steps: [
      'Ouvrez cantia.ch dans Chrome',
      'Appuyez sur les trois points, en haut à droite',
      'Appuyez sur "Ajouter à l\'écran d\'accueil" ou "Installer l\'application"',
    ],
  },
  {
    key: 'desktop',
    label: 'Ordinateur',
    device: 'desktop',
    chromePosition: 'top',
    icon: 'download',
    steps: [
      'Ouvrez cantia.ch dans Chrome ou Edge',
      "Cliquez sur l'icône d'installation dans la barre d'adresse",
      "Confirmez — Cantia s'ouvre dans sa propre fenêtre, sans barre d'adresse",
    ],
  },
];

const TRUST_ITEMS: { icon: 'lock' | 'flag' | 'shield'; title: string; text: string }[] = [
  {
    icon: 'lock',
    title: 'Données chiffrées',
    text: 'Toutes vos données transitent et sont stockées chiffrées, aussi bien en transit que sur nos serveurs.',
  },
  {
    icon: 'flag',
    title: 'Hébergées en Suisse',
    text: 'Vos chantiers, photos, devis et factures restent sur des serveurs situés en Suisse, soumis au droit suisse.',
  },
  {
    icon: 'shield',
    title: 'Accès sécurisé',
    text: 'Chaque membre de votre équipe a son propre accès ; vous décidez qui voit et modifie quoi.',
  },
];

export default function TelechargementScreen() {
  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <MarketingNav />

        <Container style={styles.container}>
          <View style={styles.versionBadge}>
            <Text style={styles.versionBadgeText}>Version 1.0</Text>
          </View>
          <Text style={styles.title}>Cantia sur mobile</Text>
          <Text style={styles.lead}>
            Aujourd'hui, Cantia fonctionne comme une application web — installable et utilisable depuis n'importe
            quel navigateur, sur ordinateur comme sur téléphone. Les applications natives iOS et Android arrivent
            bientôt : on préfère sortir une version 1.0 solide plutôt que de se précipiter sur les stores.
          </Text>

          <View style={styles.storeGrid}>
            <StoreCard kind="apple" name="App Store" />
            <StoreCard kind="google" name="Google Play" />
          </View>

          <View style={styles.webCard}>
            <View style={styles.webCardIcon}>
              <Feather name="globe" size={20} color={colors.primary} />
            </View>
            <View style={styles.webCardBody}>
              <Text style={styles.webCardTitle}>Utiliser Cantia dès maintenant</Text>
              <Text style={styles.webCardText}>
                L'app web fonctionne sur mobile exactement comme les futures apps natives — photos, dictée vocale,
                devis, QR-factures, tout y est déjà. Ouvrez cantia.ch depuis votre téléphone et ajoutez-la à votre
                écran d'accueil pour un accès en un geste.
              </Text>
              <Link href={authHref('signup')} asChild>
                <Button title="Essayer gratuitement" onPress={() => {}} style={styles.webCardCta} />
              </Link>
            </View>
          </View>

          <View style={styles.installSection}>
            <Text style={styles.installTitle}>Comment l'installer</Text>
            <Text style={styles.installLead}>
              Trois étapes, une seule fois — ensuite Cantia s'ouvre en plein écran depuis son icône, comme une vraie
              app.
            </Text>
            <InstallGuide />
          </View>

          <Text style={styles.note}>
            Envie d'être prévenu·e à la sortie des applications ? Écrivez-nous à info@cantia.ch.
          </Text>

          <View style={styles.trustSection}>
            <Text style={styles.trustTitle}>Vos données, en sécurité</Text>
            <Text style={styles.trustLead}>
              Que vous utilisiez le web aujourd'hui ou les apps natives demain, la sécurité de vos données ne change
              pas.
            </Text>
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
        </Container>

        <MarketingFooter />
      </ScrollView>
    </Screen>
  );
}

// Illustrated (not photographed) walkthrough of the browser "Add to Home
// Screen" flow, since Cantia isn't on the App Store / Play Store yet and
// that flow looks different enough per platform that a single generic
// blurb ("ajoutez-la à votre écran d'accueil") wasn't enough on its own.
// Built entirely from Views/icons rather than real screenshots — same
// illustrated-mockup approach as the hero devis card above.
function InstallGuide() {
  const [platform, setPlatform] = useState<InstallPlatform['key']>('ios');
  const active = INSTALL_PLATFORMS.find((p) => p.key === platform)!;

  return (
    <View style={styles.installGuide}>
      <View style={styles.installTabs}>
        {INSTALL_PLATFORMS.map((p) => (
          <Pressable
            key={p.key}
            onPress={() => setPlatform(p.key)}
            style={[styles.installTab, platform === p.key && styles.installTabActive]}
          >
            <Text style={[styles.installTabText, platform === p.key && styles.installTabTextActive]}>{p.label}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.installBody}>
        <BrowserMockup platform={active} />
        <View style={styles.installSteps}>
          {active.steps.map((step, i) => (
            <View key={step} style={styles.installStepRow}>
              <View style={styles.installStepNumber}>
                <Text style={styles.installStepNumberText}>{i + 1}</Text>
              </View>
              <Text style={styles.installStepText}>{step}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

function BrowserMockup({ platform }: { platform: InstallPlatform }) {
  const highlight = (
    <View style={styles.mockHighlightWrap}>
      <View style={styles.mockHighlightGlow} />
      <View style={styles.mockHighlightIcon}>
        <Feather name={platform.icon} size={platform.device === 'phone' ? 15 : 13} color="#fff" />
      </View>
    </View>
  );

  const chrome =
    platform.device === 'phone' ? (
      <View style={[styles.mockPhoneChrome, platform.chromePosition === 'top' && styles.mockPhoneChromeTop]}>
        <View style={styles.mockChromeDot} />
        <View style={styles.mockChromeDot} />
        <View style={{ flex: 1 }} />
        {highlight}
      </View>
    ) : null;

  if (platform.device === 'desktop') {
    return (
      <View style={styles.mockDesktopFrame}>
        <View style={styles.mockDesktopTopBar}>
          <View style={styles.mockTrafficLights}>
            <View style={[styles.mockTrafficDot, { backgroundColor: '#ED6A5E' }]} />
            <View style={[styles.mockTrafficDot, { backgroundColor: '#F4BF4F' }]} />
            <View style={[styles.mockTrafficDot, { backgroundColor: '#61C554' }]} />
          </View>
          <View style={styles.mockAddressBar}>
            <Feather name="lock" size={10} color={colors.textMuted} />
            <Text style={styles.mockAddressBarText}>cantia.ch</Text>
            {highlight}
          </View>
        </View>
        <View style={styles.mockDesktopContent}>
          <View style={styles.mockContentHero} />
          <View style={styles.mockContentLine} />
          <View style={[styles.mockContentLine, { width: '60%' }]} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.mockPhoneFrame}>
      {platform.chromePosition === 'top' ? chrome : null}
      <View style={styles.mockPhoneScreen}>
        <View style={styles.mockContentHeroSmall} />
        <View style={styles.mockContentLine} />
        <View style={[styles.mockContentLine, { width: '70%' }]} />
      </View>
      {platform.chromePosition === 'bottom' ? chrome : null}
    </View>
  );
}

function StoreCard({ kind, name }: { kind: 'apple' | 'google'; name: string }) {
  return (
    <View style={styles.storeCard}>
      <View style={styles.storeCardIcon}>
        <Ionicons name={kind === 'apple' ? 'logo-apple' : 'logo-google-playstore'} size={28} color="#fff" />
      </View>
      <Text style={styles.storeCardName}>{name}</Text>
      <View style={styles.storeCardSoon}>
        <Text style={styles.storeCardSoonText}>Bientôt disponible</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
  },
  container: {
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  versionBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    marginBottom: spacing.sm,
  },
  versionBadgeText: {
    fontFamily: marketingFonts.body,
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.primary,
  },
  title: {
    fontFamily: marketingFonts.display,
    fontSize: 38,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: -0.4,
  },
  lead: {
    fontFamily: marketingFonts.body,
    fontSize: fontSize.md,
    color: colors.textMuted,
    marginTop: spacing.sm,
    lineHeight: 22,
    maxWidth: 560,
  },
  storeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  storeCard: {
    flex: 1,
    minWidth: 200,
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  storeCardIcon: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.text,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storeCardName: {
    fontFamily: marketingFonts.body,
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  storeCardSoon: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  storeCardSoonText: {
    fontFamily: marketingFonts.body,
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.textMuted,
  },
  webCard: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  webCardIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  webCardBody: {
    flex: 1,
    gap: spacing.xs,
  },
  webCardTitle: {
    fontFamily: marketingFonts.body,
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  webCardText: {
    fontFamily: marketingFonts.body,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    lineHeight: 20,
  },
  webCardCta: {
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
  },
  installSection: {
    marginTop: spacing.xxl,
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
  installBody: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xl,
    alignItems: 'flex-start',
  },
  installSteps: {
    flex: 1,
    minWidth: 220,
    gap: spacing.md,
    paddingTop: spacing.xs,
  },
  installStepRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  installStepNumber: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 1,
  },
  installStepNumberText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
  },
  installStepText: {
    flex: 1,
    fontFamily: marketingFonts.body,
    fontSize: fontSize.sm,
    color: colors.text,
    lineHeight: 20,
  },
  // Phone mockup — a dark bezel frame around a browser chrome strip (top or
  // bottom, depending on platform) and a small abstracted "page" — built
  // from plain Views, not a real screenshot.
  mockPhoneFrame: {
    width: 172,
    borderRadius: 26,
    borderWidth: 8,
    borderColor: colors.text,
    backgroundColor: colors.text,
    overflow: 'hidden',
  },
  mockPhoneScreen: {
    height: 220,
    backgroundColor: colors.surfaceAlt,
    padding: spacing.sm,
  },
  mockPhoneChrome: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: 10,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  mockPhoneChromeTop: {
    borderTopWidth: 0,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  mockChromeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.textMuted,
    opacity: 0.35,
  },
  mockHighlightWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  mockHighlightGlow: {
    position: 'absolute',
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.primarySoft,
  },
  mockHighlightIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mockContentHeroSmall: {
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.primarySoft,
    marginBottom: 8,
  },
  mockContentHero: {
    height: 60,
    borderRadius: radius.sm,
    backgroundColor: colors.primarySoft,
    marginBottom: 8,
  },
  mockContentLine: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
    marginBottom: 6,
    width: '90%',
  },
  // Desktop mockup — a browser window frame (traffic lights + address bar)
  // above the same abstracted "page" content.
  mockDesktopFrame: {
    width: '100%',
    maxWidth: 360,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  mockDesktopTopBar: {
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    backgroundColor: colors.surfaceAlt,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  mockTrafficLights: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8,
  },
  mockTrafficDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  mockAddressBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  mockAddressBarText: {
    flex: 1,
    fontSize: 11,
    color: colors.textMuted,
  },
  mockDesktopContent: {
    padding: spacing.md,
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
