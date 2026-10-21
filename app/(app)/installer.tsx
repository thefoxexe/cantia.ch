import { useMemo } from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Card, PageHeader, AppScreen } from '../../components/ui';
import { colors, fontSize, radius, spacing } from '../../lib/theme';
import { getAppLocale, type AppLocale } from '../../lib/translations';

type IconName = keyof typeof Feather.glyphMap;

// Cantia isn't on the App Store / Play Store yet — this walks the user
// through adding the web app to their home screen instead, per-browser,
// since there's no PWA manifest/service worker set up for a native install
// prompt. Detection is best-effort (UA sniffing) with a sensible fallback.
type GuideKey = 'ios' | 'android' | 'desktop' | 'other';

function detectGuide(): GuideKey {
  if (Platform.OS !== 'web' || typeof navigator === 'undefined') return 'other';
  const ua = navigator.userAgent || '';
  if (/iPad|iPhone|iPod/.test(ua)) return 'ios';
  if (/Android/.test(ua)) return 'android';
  return 'desktop';
}

const ICONS: Record<GuideKey, IconName> = { ios: 'share', android: 'more-vertical', desktop: 'monitor', other: 'globe' };

const COPY: Record<AppLocale, { header: string; lead: string; other: string; guides: Record<GuideKey, { title: string; steps: string[] }> }> = {
  fr: {
    header: "Installer l'app",
    lead: "Cantia n'est pas encore sur l'App Store ni le Play Store — en attendant, ajoutez-la à votre écran d'accueil pour l'ouvrir en un geste, comme une vraie application.",
    other: 'Autre appareil ?',
    guides: {
      ios: { title: 'Sur iPhone / iPad (Safari)', steps: ['Ouvrez cantia.ch dans Safari', 'Appuyez sur le bouton Partager (le carré avec la flèche vers le haut)', "Faites défiler et appuyez sur « Sur l'écran d'accueil »", 'Confirmez avec « Ajouter »'] },
      android: { title: 'Sur Android (Chrome)', steps: ['Ouvrez cantia.ch dans Chrome', 'Appuyez sur le menu ⋮ en haut à droite', "Appuyez sur « Ajouter à l'écran d'accueil »", 'Confirmez avec « Ajouter »'] },
      desktop: { title: 'Sur ordinateur (Chrome / Edge)', steps: ['Ouvrez cantia.ch dans votre navigateur', "Cliquez sur l'icône d'installation dans la barre d'adresse (ou le menu ⋮)", '« Installer Cantia »', "L'app s'ouvre ensuite dans sa propre fenêtre, comme une app native"] },
      other: { title: 'Depuis votre navigateur', steps: ['Ouvrez cantia.ch', "Cherchez l'option « Ajouter à l'écran d'accueil » ou « Installer » dans le menu du navigateur", 'Confirmez'] },
    },
  },
  de: {
    header: 'App installieren',
    lead: 'Cantia ist noch nicht im App Store oder Play Store – fügen Sie die App bis dahin zu Ihrem Startbildschirm hinzu, um sie wie eine echte App mit einem Tipp zu öffnen.',
    other: 'Anderes Gerät?',
    guides: {
      ios: { title: 'Auf iPhone / iPad (Safari)', steps: ['Öffnen Sie cantia.ch in Safari', 'Tippen Sie auf «Teilen» (das Quadrat mit dem Pfeil nach oben)', 'Scrollen Sie und tippen Sie auf «Zum Home-Bildschirm»', 'Bestätigen Sie mit «Hinzufügen»'] },
      android: { title: 'Auf Android (Chrome)', steps: ['Öffnen Sie cantia.ch in Chrome', 'Tippen Sie oben rechts auf das Menü ⋮', 'Tippen Sie auf «Zum Startbildschirm hinzufügen»', 'Bestätigen Sie mit «Hinzufügen»'] },
      desktop: { title: 'Am Computer (Chrome / Edge)', steps: ['Öffnen Sie cantia.ch in Ihrem Browser', 'Klicken Sie auf das Installationssymbol in der Adressleiste (oder im Menü ⋮)', '«Cantia installieren»', 'Die App öffnet sich danach in einem eigenen Fenster, wie eine native App'] },
      other: { title: 'Über Ihren Browser', steps: ['Öffnen Sie cantia.ch', 'Suchen Sie im Browsermenü die Option «Zum Startbildschirm hinzufügen» oder «Installieren»', 'Bestätigen'] },
    },
  },
  it: {
    header: "Installa l'app",
    lead: "Cantia non è ancora sull'App Store né sul Play Store: nel frattempo aggiungetela alla schermata Home per aprirla con un tocco, come una vera app.",
    other: 'Altro dispositivo?',
    guides: {
      ios: { title: 'Su iPhone / iPad (Safari)', steps: ['Aprite cantia.ch in Safari', 'Toccate il pulsante Condividi (il quadrato con la freccia verso l’alto)', 'Scorrete e toccate «Aggiungi alla schermata Home»', 'Confermate con «Aggiungi»'] },
      android: { title: 'Su Android (Chrome)', steps: ['Aprite cantia.ch in Chrome', 'Toccate il menu ⋮ in alto a destra', 'Toccate «Aggiungi a schermata Home»', 'Confermate con «Aggiungi»'] },
      desktop: { title: 'Sul computer (Chrome / Edge)', steps: ['Aprite cantia.ch nel browser', "Cliccate sull'icona di installazione nella barra degli indirizzi (o nel menu ⋮)", '«Installa Cantia»', "L'app si apre poi nella sua finestra, come un'app nativa"] },
      other: { title: 'Dal vostro browser', steps: ['Aprite cantia.ch', 'Cercate l’opzione «Aggiungi alla schermata Home» o «Installa» nel menu del browser', 'Confermate'] },
    },
  },
};

export default function InstallerScreen() {
  const current = useMemo(() => detectGuide(), []);
  const copy = COPY[getAppLocale()] ?? COPY.fr;
  const guide = { icon: ICONS[current], ...copy.guides[current] };

  return (
    <AppScreen>
      <PageHeader title={copy.header} />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.lead}>{copy.lead}</Text>

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

        <Text style={styles.otherTitle}>{copy.other}</Text>
        {(['ios', 'android', 'desktop'] as const)
          .filter((key) => key !== current)
          .map((key) => (
            <Card key={key} style={styles.otherCard}>
              <View style={styles.guideHeader}>
                <View style={styles.guideIconSmall}>
                  <Feather name={ICONS[key]} size={15} color={colors.textMuted} />
                </View>
                <Text style={styles.otherCardTitle}>{copy.guides[key].title}</Text>
              </View>
              {copy.guides[key].steps.map((step, i) => (
                <Text key={i} style={styles.otherStep}>
                  {i + 1}. {step}
                </Text>
              ))}
            </Card>
          ))}
      </ScrollView>
    </AppScreen>
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
