import { createElement, useState } from 'react';
import { Image, Platform, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Link } from 'expo-router';
import Head from 'expo-router/head';
import { Feather } from '@expo/vector-icons';
import { Screen } from '../components/ui';
import { CtaButton } from '../components/landing/CtaButton';
import { bodyInk, ink, rule } from '../components/landing/brand';
import { MarketingHead } from '../components/MarketingHead';
import { MarketingFooter } from '../components/MarketingChrome';
import { BrandLockup } from '../components/brand/Logo';
import { colors, breakpoints } from '../lib/theme';
import { displayType, landingFonts, monoType } from '../lib/landingTheme';
import { authHref } from '../lib/appHost';
import { trackLandingEvent } from '../lib/siteAnalytics';

// cantia.ch/presentation: the page behind the "présentation en 37 secondes"
// e-mail. Not in the menu, the sitemap or Google (noindex): people only land
// here from the e-mail. One job: watch the video, then start the trial (or
// call). Visits are logged with the page views (site_pageviews, path
// /presentation + UTM); video plays and button clicks in landing_events.

const PAGE = 'presentation';
const VIDEO_ID = 'TsRzpiIl3BY';
const COVER = '/presentation/cover.jpg';
const PHONE_DISPLAY = '078 450 14 57';
const PHONE_TEL = 'tel:+41784501457';
const EMAIL = 'info@cantia.ch';

// Only what Cantia really does today.
const FEATURES: { icon: keyof typeof Feather.glyphMap; title: string; text: string }[] = [
  { icon: 'file-text', title: 'Devis et factures en quelques minutes', text: 'Dictés ou tapés sur place, à votre logo. Le client signe en ligne, la facture QR suisse suit en un clic.' },
  { icon: 'eye', title: 'Vous savez où en est chaque devis', text: 'Ouvert, consulté, répondu : tout s’affiche. Les relances partent toutes seules, au rythme que vous choisissez.' },
  { icon: 'layers', title: 'Vos chantiers, projets ou mandats', text: 'Photos, rapports, documents, heures et rentabilité, au même endroit. Vous choisissez le mot, Cantia s’adapte.' },
  { icon: 'calendar', title: 'Le planning de l’équipe', text: 'Qui est où, quel jour. Chacun le voit sur son téléphone.' },
  { icon: 'clock', title: 'Heures, frais et salaires', text: 'Les employés saisissent leurs heures, les fiches de salaire suisses se calculent (AVS, LPP, 13e).' },
  { icon: 'book', title: 'Trésorerie et comptabilité', text: 'Encaissements, dépenses, TVA. Votre fiduciaire reçoit ce dont elle a besoin, sans que vous couriez après.' },
];

const PROOF = [
  { value: '14 jours', label: 'd’essai, aucun débit avant' },
  { value: 'Sans engagement', label: 'résiliable en ligne' },
  { value: '100 % suisse', label: 'QR-facture, TVA, données à Zurich' },
  { value: 'FR · DE · IT', label: 'une vraie personne au bout du fil' },
];

function SignupCta({ location, title = 'Essayer Cantia 14 jours', tone }: { location: string; title?: string; tone?: 'primary' | 'light' }) {
  return (
    <Link href={authHref('signup')} asChild onPress={() => trackLandingEvent(PAGE, 'cta_signup', location)}>
      <CtaButton title={title} tone={tone} />
    </Link>
  );
}

function CallLink({ location, light }: { location: string; light?: boolean }) {
  return (
    <Link href={PHONE_TEL as any} onPress={() => trackLandingEvent(PAGE, 'cta_call', location)}>
      <Text style={[styles.callText, light && { color: '#FBF6EE' }]}>
        ou appelez-nous au <Text style={styles.callStrong}>{PHONE_DISPLAY}</Text>
      </Text>
    </Link>
  );
}

// Cover first (instant, and the same picture as in the e-mail); YouTube
// loads only once played, so the page stays light and a play is counted.
function Video() {
  const [playing, setPlaying] = useState(false);
  if (playing && Platform.OS === 'web') {
    return (
      <View style={styles.video}>
        {createElement('iframe', {
          src: `https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1&rel=0&modestbranding=1&playsinline=1`,
          title: 'Cantia en 37 secondes',
          allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
          allowFullScreen: true,
          style: { position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 },
        })}
      </View>
    );
  }
  return (
    <Pressable
      onPress={() => {
        trackLandingEvent(PAGE, 'video_play');
        if (Platform.OS === 'web') setPlaying(true);
      }}
      style={styles.video}
      accessibilityRole="button"
      accessibilityLabel="Lire la présentation de Cantia (37 secondes)"
    >
      <Image source={{ uri: COVER }} style={StyleSheet.absoluteFill} resizeMode="cover" />
    </Pressable>
  );
}

export default function PresentationScreen() {
  const { width } = useWindowDimensions();
  const wide = width >= breakpoints.desktop;
  const pad = width < 600 ? 16 : 32;

  return (
    <Screen style={{ padding: 0 }}>
      <MarketingHead
        title="Cantia en 37 secondes — devis, factures, chantiers et équipe"
        description="La présentation de Cantia en 37 secondes : le logiciel suisse qui gère vos devis, factures, chantiers, planning et salaires."
      />
      <Head>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <ScrollView showsVerticalScrollIndicator={false} style={{ backgroundColor: colors.bg }}>
        {/* Slim header: no menu to wander off into. */}
        <View style={[styles.header, { paddingHorizontal: pad }]}>
          <Link href="/" accessibilityLabel="Cantia">
            <BrandLockup height={24} />
          </Link>
          {wide ? <SignupCta location="header" title="Essayer gratuitement" /> : null}
        </View>

        <View style={[styles.wrap, { paddingHorizontal: pad }]}>
          <View style={[styles.hero, wide && styles.heroWide]}>
            <View style={[styles.heroText, wide && { flex: 0.9 }]}>
              <Text style={styles.kicker}>PRÉSENTATION · 37 SECONDES</Text>
              <Text style={[styles.title, { fontSize: wide ? 54 : width < 400 ? 34 : 40, lineHeight: wide ? 58 : width < 400 ? 38 : 44 }]}>
                Gérez vos projets, pas votre <Text style={styles.strike}>administratif</Text>.
              </Text>
              <Text style={styles.lede}>
                Cantia réunit devis, factures, chantiers, planning et salaires dans une seule app, pensée pour les entreprises suisses du bâtiment et des services.
              </Text>
              {wide ? (
                <View style={styles.ctaBlock}>
                  <SignupCta location="hero" />
                  <CallLink location="hero" />
                </View>
              ) : null}
            </View>
            <View style={[styles.videoCol, wide && { flex: 1.1 }]}>
              <Video />
            </View>
            {!wide ? (
              <View style={styles.ctaBlock}>
                <SignupCta location="hero" />
                <CallLink location="hero" />
              </View>
            ) : null}
          </View>

          <View style={styles.proof}>
            {PROOF.map((p, i) => (
              <View key={p.value} style={[styles.proofItem, { width: wide ? '25%' : '50%' }, i > 0 && wide && styles.proofRule]}>
                <Text style={styles.proofValue}>{p.value}</Text>
                <Text style={styles.proofLabel}>{p.label}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.sectionKicker}>CE QUE CANTIA FAIT POUR VOUS</Text>
          <Text style={[styles.sectionTitle, { fontSize: wide ? 34 : 27 }]}>Moins de soirées au bureau, plus de temps sur le terrain.</Text>
          <View style={styles.grid}>
            {FEATURES.map((f) => (
              <View key={f.title} style={[styles.feature, { width: wide ? '33.333%' : width >= 640 ? '50%' : '100%' }]}>
                <Feather name={f.icon} size={20} color={colors.primary} />
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureText}>{f.text}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.closing}>
          <View style={[styles.closingInner, { paddingHorizontal: pad }]}>
            <Text style={[styles.closingTitle, { fontSize: wide ? 38 : 28 }]}>Essayez-le avec vos vrais chantiers.</Text>
            <Text style={styles.closingText}>
              Deux minutes pour créer votre compte. Aucun débit pendant 14 jours, résiliation en ligne à tout moment.
            </Text>
            <View style={styles.ctaBlock}>
              <SignupCta location="closing" tone="light" title="Commencer mon essai" />
              <CallLink location="closing" light />
            </View>
            <Link href={`mailto:${EMAIL}?subject=Pr%C3%A9sentation%20Cantia` as any} onPress={() => trackLandingEvent(PAGE, 'cta_email', 'closing')}>
              <Text style={styles.mailLink}>Une question ? {EMAIL}</Text>
            </Link>
          </View>
        </View>

        <MarketingFooter />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 18, width: '100%', maxWidth: 1200, alignSelf: 'center' },
  wrap: { width: '100%', maxWidth: 1200, alignSelf: 'center', paddingBottom: 64 },
  hero: { gap: 28, paddingTop: 16, paddingBottom: 40 },
  heroWide: { flexDirection: 'row', alignItems: 'center', gap: 56, paddingTop: 40, paddingBottom: 56 },
  heroText: { gap: 18 },
  kicker: { ...monoType, fontSize: 12, letterSpacing: 1.4, color: colors.primary },
  title: { ...displayType, color: ink, fontWeight: '800', letterSpacing: -1 } as any,
  strike: { textDecorationLine: 'line-through', textDecorationColor: '#C33F32', color: ink } as any,
  lede: { fontFamily: landingFonts.body, fontSize: 17, lineHeight: 26, color: bodyInk, maxWidth: 520 },
  ctaBlock: { gap: 12, alignItems: 'flex-start' },
  callText: { fontFamily: landingFonts.body, fontSize: 14.5, color: bodyInk },
  callStrong: { fontWeight: '700', textDecorationLine: 'underline' },
  videoCol: { width: '100%' },
  video: { width: '100%', aspectRatio: 16 / 9, borderRadius: 10, overflow: 'hidden', backgroundColor: '#E9DFD0', borderWidth: 1, borderColor: rule, cursor: 'pointer' } as any,
  proof: { flexDirection: 'row', flexWrap: 'wrap', borderTopWidth: 1, borderBottomWidth: 1, borderColor: rule, marginBottom: 64 },
  proofItem: { paddingVertical: 20, paddingHorizontal: 16, gap: 4 },
  proofRule: { borderLeftWidth: 1, borderLeftColor: rule },
  proofValue: { ...displayType, fontSize: 22, fontWeight: '800', color: ink } as any,
  proofLabel: { fontFamily: landingFonts.body, fontSize: 13.5, color: bodyInk },
  sectionKicker: { ...monoType, fontSize: 12, letterSpacing: 1.4, color: colors.primary, marginBottom: 10 },
  sectionTitle: { ...displayType, color: ink, fontWeight: '800', letterSpacing: -0.5, maxWidth: 720, marginBottom: 28 } as any,
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -12 },
  feature: { padding: 12, paddingBottom: 28, gap: 8 },
  featureTitle: { fontFamily: landingFonts.body, fontSize: 17, fontWeight: '700', color: ink },
  featureText: { fontFamily: landingFonts.body, fontSize: 15, lineHeight: 23, color: bodyInk },
  closing: { backgroundColor: '#16120E', paddingVertical: 64 },
  closingInner: { width: '100%', maxWidth: 1200, alignSelf: 'center', gap: 18 },
  closingTitle: { ...displayType, color: '#FBF6EE', fontWeight: '800', letterSpacing: -0.5 } as any,
  closingText: { fontFamily: landingFonts.body, fontSize: 16, lineHeight: 24, color: '#D9CDBD', maxWidth: 560 },
  mailLink: { fontFamily: landingFonts.body, fontSize: 14, color: '#D9CDBD', textDecorationLine: 'underline', marginTop: 4 },
});
