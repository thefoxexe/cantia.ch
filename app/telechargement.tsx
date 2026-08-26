import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, ScrollView, StyleSheet, Text, View, ViewStyle } from 'react-native';
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
  icon: InstallIcon;
  steps: string[];
}

const INSTALL_PLATFORMS: InstallPlatform[] = [
  {
    key: 'ios',
    label: 'iPhone & iPad',
    icon: 'share',
    steps: [
      'Ouvrez cantia.ch dans Safari',
      "Appuyez sur l'icône de partage, en bas de l'écran",
      'Faites défiler et appuyez sur "Sur l\'écran d\'accueil"',
    ],
  },
  {
    key: 'android',
    label: 'Android',
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
  const heroAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(heroAnim, { toValue: 1, duration: 620, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [heroAnim]);

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <MarketingNav />

        {/* Same grid + soft blob backdrop as the homepage hero, so this page
            reads as part of the same site rather than a bolted-on screen. */}
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
                <Text style={styles.kickerText}>Application Cantia</Text>
              </View>
              <Text style={styles.title}>Cantia, partout où vous travaillez</Text>
              <Text style={styles.subtitle}>
                Cantia fonctionne déjà comme une application complète — installable en un geste sur votre téléphone
                ou votre ordinateur, sans passer par un store. Les applications natives iOS et Android arrivent
                ensuite : mieux vaut une version 1.0 solide qu'une sortie précipitée.
              </Text>
              <View style={styles.heroCtaRow}>
                <Link href={authHref('signup')} asChild>
                  <Button title="Essayer gratuitement" onPress={() => {}} />
                </Link>
              </View>
            </Animated.View>
          </Container>
        </View>

        <Container style={styles.container}>
          <View style={styles.storeSection}>
            <Text style={styles.sectionTitle}>L'app officielle arrive</Text>
            <Text style={styles.sectionLead}>
              Vous préférez l'installer depuis un store ? La version Android est actuellement en développement pour
              Google Play, iOS suivra. En attendant leur sortie, la version web ci-dessous propose déjà l'intégralité
              des fonctionnalités — photos, dictée vocale, devis, factures, QR-facture.
            </Text>
            <View style={styles.storeGrid}>
              <StoreCard kind="apple" name="App Store" />
              <StoreCard kind="google" name="Google Play" />
            </View>
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
            <Text style={styles.installTitle}>Comment l'installer aujourd'hui</Text>
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

// Platform switcher + numbered steps only — no illustrated device mockup.
// A real product photo/mockup is planned for this page (design in progress
// separately); until then, plain steps read cleaner than an approximated
// browser-chrome illustration built out of Views.
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

function StoreCard({ kind, name }: { kind: 'apple' | 'google'; name: string }) {
  return (
    <View style={styles.storeCard}>
      <View style={styles.storeCardIcon}>
        <Ionicons name={kind === 'apple' ? 'logo-apple' : 'logo-google-playstore'} size={26} color="#fff" />
      </View>
      <Text style={styles.storeCardName}>{name}</Text>
      <View style={styles.storeCardSoon}>
        <View style={styles.storeCardSoonDot} />
        <Text style={styles.storeCardSoonText}>En développement</Text>
      </View>
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
    marginBottom: spacing.xl,
  },
  storeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.lg,
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  storeCardSoonDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
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
