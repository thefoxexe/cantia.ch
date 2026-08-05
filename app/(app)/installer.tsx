import { useMemo } from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Card, PageHeader, Screen } from '../../components/ui';
import { colors, fontSize, radius, spacing } from '../../lib/theme';

type IconName = keyof typeof Feather.glyphMap;

interface Guide {
  icon: IconName;
  title: string;
  steps: string[];
}

// Cantia isn't on the App Store / Play Store yet — this walks the user
// through adding the web app to their home screen instead, per-browser,
// since there's no PWA manifest/service worker set up for a native install
// prompt. Detection is best-effort (UA sniffing) with a sensible fallback.
function detectGuide(): Guide {
  if (Platform.OS !== 'web' || typeof navigator === 'undefined') {
    return GUIDES.other;
  }
  const ua = navigator.userAgent || '';
  const isIOS = /iPad|iPhone|iPod/.test(ua);
  const isAndroid = /Android/.test(ua);
  if (isIOS) return GUIDES.ios;
  if (isAndroid) return GUIDES.android;
  return GUIDES.desktop;
}

const GUIDES: Record<'ios' | 'android' | 'desktop' | 'other', Guide> = {
  ios: {
    icon: 'share',
    title: 'Sur iPhone / iPad (Safari)',
    steps: [
      "Ouvrez cantia.ch dans Safari",
      'Appuyez sur le bouton Partager (le carré avec la flèche vers le haut)',
      "Faites défiler et appuyez sur « Sur l'écran d'accueil »",
      'Confirmez avec « Ajouter »',
    ],
  },
  android: {
    icon: 'more-vertical',
    title: 'Sur Android (Chrome)',
    steps: [
      'Ouvrez cantia.ch dans Chrome',
      'Appuyez sur le menu ⋮ en haut à droite',
      "Appuyez sur « Ajouter à l'écran d'accueil »",
      'Confirmez avec « Ajouter »',
    ],
  },
  desktop: {
    icon: 'monitor',
    title: 'Sur ordinateur (Chrome / Edge)',
    steps: [
      'Ouvrez cantia.ch dans votre navigateur',
      "Cliquez sur l'icône d'installation dans la barre d'adresse (ou le menu ⋮)",
      '« Installer Cantia »',
      'L\'app s\'ouvre ensuite dans sa propre fenêtre, comme une app native',
    ],
  },
  other: {
    icon: 'globe',
    title: 'Depuis votre navigateur',
    steps: [
      'Ouvrez cantia.ch',
      "Cherchez l'option « Ajouter à l'écran d'accueil » ou « Installer » dans le menu du navigateur",
      'Confirmez',
    ],
  },
};

export default function InstallerScreen() {
  const guide = useMemo(() => detectGuide(), []);

  return (
    <Screen>
      <PageHeader title="Installer l'app" />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.lead}>
          Cantia n'est pas encore sur l'App Store ni le Play Store — en attendant, ajoutez-la à votre écran d'accueil
          pour l'ouvrir en un geste, comme une vraie application.
        </Text>

        <Card style={styles.guideCard}>
          <View style={styles.guideHeader}>
            <View style={styles.guideIcon}>
              <Feather name={guide.icon} size={18} color={colors.primary} />
            </View>
            <Text style={styles.guideTitle}>{guide.title}</Text>
          </View>
          {guide.steps.map((step, i) => (
            <View key={i} style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{i + 1}</Text>
              </View>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </Card>

        <Text style={styles.otherTitle}>Autre appareil ?</Text>
        {(['ios', 'android', 'desktop'] as const)
          .filter((key) => GUIDES[key].title !== guide.title)
          .map((key) => (
            <Card key={key} style={styles.otherCard}>
              <View style={styles.guideHeader}>
                <View style={styles.guideIconSmall}>
                  <Feather name={GUIDES[key].icon} size={15} color={colors.textMuted} />
                </View>
                <Text style={styles.otherCardTitle}>{GUIDES[key].title}</Text>
              </View>
              {GUIDES[key].steps.map((step, i) => (
                <Text key={i} style={styles.otherStep}>
                  {i + 1}. {step}
                </Text>
              ))}
            </Card>
          ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl * 2,
    maxWidth: 640,
    width: '100%',
    alignSelf: 'center',
  },
  lead: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    lineHeight: 20,
    marginBottom: spacing.xl,
  },
  guideCard: {
    marginBottom: spacing.xl,
  },
  guideHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  guideIcon: {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guideIconSmall: {
    width: 28,
    height: 28,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guideTitle: {
    fontSize: fontSize.md,
    fontWeight: '800',
    color: colors.text,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  stepNumber: {
    width: 22,
    height: 22,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  stepNumberText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#fff',
  },
  stepText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.text,
    lineHeight: 20,
  },
  otherTitle: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  otherCard: {
    marginBottom: spacing.sm,
    backgroundColor: colors.surfaceAlt,
  },
  otherCardTitle: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
  },
  otherStep: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 4,
    lineHeight: 17,
  },
});
