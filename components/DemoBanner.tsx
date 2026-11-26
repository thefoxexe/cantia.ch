import { useEffect, useRef, useState } from 'react';
import { Linking, Modal, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { usePathname } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { IS_DEMO, onDemoBlocked } from '../lib/demo';
import { getAppLocale } from '../lib/translations';
import { sans } from '../lib/siteTheme';
import { BF_ENDS_AT } from '../lib/site/blackFriday';
import { BlackFridayPopup } from './site/BlackFridayPopup';

// Calls to sign up for real in the read-only demo (demo.cantia.ch):
// - a pill at the bottom, always there, with an « Essayer Cantia » button;
// - a sign-up window when the visitor tries to save something (the demo
//   refuses every write, lib/demo/fetch.ts);
// - the same window once, after a few pages visited.
const COPY = {
  fr: {
    tab: 'Démo Cantia · Atelier Martin SA',
    label: 'Démo · Atelier Martin SA, entreprise d’exemple',
    cta: 'Essayer Cantia',
    blockedTitle: 'Enregistrez pour de vrai.',
    blockedText: 'La démo est en lecture seule. Créez votre compte et faites la même chose avec vos clients, vos devis et vos chantiers.',
    tourTitle: 'Ça vous parle ?',
    tourText: 'Créez votre compte et retrouvez tout cela avec votre entreprise. Vos données actuelles se reprennent depuis Excel ou CSV.',
    points: ['14 jours pour tester avec votre entreprise', 'Sans engagement, résiliable à tout moment', 'Données hébergées en Suisse'],
    signup: 'Créer mon compte',
    keep: 'Continuer la visite',
  },
  de: {
    tab: 'Cantia Demo · Atelier Martin SA',
    label: 'Demo · Atelier Martin SA, Beispielunternehmen',
    cta: 'Cantia testen',
    blockedTitle: 'Jetzt richtig speichern.',
    blockedText: 'Die Demo ist nur zum Ansehen. Erstellen Sie Ihr Konto und machen Sie dasselbe mit Ihren Kunden, Offerten und Baustellen.',
    tourTitle: 'Passt das zu Ihnen?',
    tourText: 'Erstellen Sie Ihr Konto und finden Sie all das mit Ihrem Unternehmen wieder. Bestehende Daten lassen sich aus Excel oder CSV übernehmen.',
    points: ['14 Tage mit Ihrem Unternehmen testen', 'Ohne Verpflichtung, jederzeit kündbar', 'Daten in der Schweiz gehostet'],
    signup: 'Konto erstellen',
    keep: 'Weiter ansehen',
  },
  it: {
    tab: 'Demo Cantia · Atelier Martin SA',
    label: 'Demo · Atelier Martin SA, azienda di esempio',
    cta: 'Provare Cantia',
    blockedTitle: 'Salvate per davvero.',
    blockedText: 'La demo è in sola lettura. Create il vostro account e fate lo stesso con i vostri clienti, preventivi e cantieri.',
    tourTitle: 'Vi convince?',
    tourText: 'Create il vostro account e ritrovate tutto questo con la vostra azienda. I dati attuali si riprendono da Excel o CSV.',
    points: ['14 giorni per provare con la vostra azienda', 'Senza impegno, disdicibile in ogni momento', 'Dati ospitati in Svizzera'],
    signup: 'Creare il mio account',
    keep: 'Continuare la visita',
  },
} as const;

// Black Friday 2026 in the demo, until Monday 30 November at midnight
// (lib/site/blackFriday.ts): the pill turns black and orange with the time
// left, the windows lead to cantia.ch/black-friday, and the offer pop-up of
// the site opens once. All of it goes away by itself at the end.
const BF = {
  fr: { pill: 'Black Friday : jusqu’à -54 % à vie', ends: 'Fin dans', cta: 'J’en profite', point: 'Black Friday : jusqu’à -54 % à vie, jusqu’à lundi minuit', signup: 'Profiter du Black Friday' },
  de: { pill: 'Black Friday: bis zu -54 % lebenslang', ends: 'Ende in', cta: 'Jetzt profitieren', point: 'Black Friday: bis zu -54 % lebenslang, bis Montag Mitternacht', signup: 'Black Friday nutzen' },
  it: { pill: 'Black Friday: fino a -54 % a vita', ends: 'Fine tra', cta: 'Approfitto', point: 'Black Friday: fino a -54 % a vita, fino a lunedì mezzanotte', signup: 'Approfittare del Black Friday' },
} as const;
const pad2 = (n: number) => String(Math.max(0, Math.floor(n))).padStart(2, '0');

function bfUrl(locale: string): string {
  const prefix = locale === 'de' ? '/de' : locale === 'it' ? '/it' : '';
  return `https://cantia.ch${prefix}/black-friday?ref=demo`;
}

// Pages seen before the sign-up window opens on its own (once per visit).
const PAGES_BEFORE_PROMPT = 5;

function signupUrl(locale: string): string {
  return `https://app.cantia.ch/signup?locale=${locale}`;
}

export function DemoBanner() {
  const [flash, setFlash] = useState(false);
  const [modal, setModal] = useState<null | 'blocked' | 'tour'>(null);
  const prompted = useRef(false);
  const pages = useRef(new Set<string>());
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  // Time left of the Black Friday, ticking every second while it runs.
  const [bfLeft, setBfLeft] = useState(() => BF_ENDS_AT - Date.now());
  useEffect(() => {
    if (!IS_DEMO) return;
    const id = setInterval(() => setBfLeft(BF_ENDS_AT - Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!IS_DEMO) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const off = onDemoBlocked(() => {
      setFlash(true);
      setModal('blocked');
      prompted.current = true;
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => setFlash(false), 4000);
    });
    return () => {
      off();
      if (timer) clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (!IS_DEMO || prompted.current) return;
    pages.current.add(pathname);
    if (pages.current.size >= PAGES_BEFORE_PROMPT) {
      prompted.current = true;
      setModal('tour');
    }
  }, [pathname]);

  // The tab title of the demo, in the language of the visit: the HTML of
  // the build carries the marketing home's title (of any language), which
  // no app screen replaces.
  const tabLocale = getAppLocale();
  useEffect(() => {
    if (!IS_DEMO || typeof document === 'undefined') return;
    const title = COPY[tabLocale === 'de' || tabLocale === 'it' ? tabLocale : 'fr'].tab;
    document.title = title;
    // A Head update from a screen would put the old title back: keep ours.
    const el = document.querySelector('title');
    if (!el) return;
    const obs = new MutationObserver(() => {
      if (document.title !== title) document.title = title;
    });
    obs.observe(el, { childList: true, characterData: true, subtree: true });
    return () => obs.disconnect();
  }, [tabLocale, pathname]);

  if (!IS_DEMO) return null;
  const locale = getAppLocale();
  const c = COPY[locale === 'de' || locale === 'it' ? locale : 'fr'];
  const phone = width < 640;
  const bfLive = bfLeft > 0;
  const bf = BF[locale === 'de' || locale === 'it' ? locale : 'fr'];
  const open = () => Linking.openURL(bfLive ? bfUrl(locale) : signupUrl(locale));
  const s = Math.floor(Math.max(0, bfLeft) / 1000);
  const days = Math.floor(s / 86400);
  const timeLeft = `${days > 0 ? `${days}j ` : ''}${pad2((s % 86400) / 3600)}:${pad2((s % 3600) / 60)}:${pad2(s % 60)}`;

  return (
    <>
      <View pointerEvents="box-none" style={[styles.wrap, phone && { left: 12, right: 70, bottom: 14, alignItems: 'flex-start' }]}>
        {bfLive && !flash ? (
          <View style={[styles.pill, styles.pillBf]}>
            <Feather name="zap" size={13} color="#ff5b1f" />
            <Text style={[styles.text, { color: '#f4f3e9' }]} numberOfLines={2}>
              {bf.pill}
              {phone ? '' : '  ·  '}
              {phone ? null : <Text style={{ color: '#ff5b1f', fontWeight: '700' }}>{bf.ends} {timeLeft}</Text>}
            </Text>
            <Pressable accessibilityRole="link" onPress={open} style={[styles.cta, { backgroundColor: '#ff5b1f' }]}>
              <Text style={[styles.ctaText, { fontWeight: '800' }]}>{bf.cta}</Text>
            </Pressable>
          </View>
        ) : (
          <View style={[styles.pill, flash && styles.pillFlash]}>
            <Feather name={flash ? 'lock' : 'eye'} size={13} color={flash ? '#fffefa' : '#a65d36'} />
            <Text style={[styles.text, flash && { color: '#fffefa' }]} numberOfLines={2}>
              {c.label}
            </Text>
            <Pressable accessibilityRole="link" onPress={open} style={[styles.cta, flash && { backgroundColor: '#fffefa' }]}>
              <Text style={[styles.ctaText, flash && { color: '#a65d36' }]}>{c.cta}</Text>
            </Pressable>
          </View>
        )}
      </View>

      <Modal visible={modal !== null} transparent animationType="fade" onRequestClose={() => setModal(null)}>
        <Pressable style={styles.backdrop} onPress={() => setModal(null)}>
          <Pressable style={[styles.card, phone && { padding: 24 }]} onPress={() => {}}>
            <View style={styles.badge}>
              <Feather name={modal === 'blocked' ? 'lock' : 'star'} size={16} color="#a65d36" />
            </View>
            <Text style={styles.title}>{modal === 'blocked' ? c.blockedTitle : c.tourTitle}</Text>
            <Text style={styles.body}>{modal === 'blocked' ? c.blockedText : c.tourText}</Text>
            <View style={{ gap: 8, marginTop: 4 }}>
              {(bfLive ? [bf.point, ...c.points] : c.points).map((pt, i) => (
                <View key={pt} style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
                  <Feather name={bfLive && i === 0 ? 'zap' : 'check'} size={14} color={bfLive && i === 0 ? '#ff5b1f' : '#a65d36'} style={{ marginTop: 2 }} />
                  <Text style={[styles.body, { flex: 1 }, bfLive && i === 0 && { color: '#2b2a26', fontWeight: '700' }]}>{pt}</Text>
                </View>
              ))}
            </View>
            <View style={[styles.actions, phone && { flexDirection: 'column', alignItems: 'stretch' }]}>
              <Pressable accessibilityRole="link" onPress={open} style={[styles.primary, bfLive && { backgroundColor: '#ff5b1f' }]}>
                <Text style={styles.primaryText}>{bfLive ? bf.signup : c.signup}</Text>
                <Feather name="arrow-right" size={15} color="#fffefa" />
              </Pressable>
              <Pressable accessibilityRole="button" onPress={() => setModal(null)} style={styles.secondary}>
                <Text style={styles.secondaryText}>{c.keep}</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
      {bfLive ? <BlackFridayPopup /> : null}
    </>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, bottom: 20, zIndex: 1000, alignItems: 'center' },
  pill: {
    maxWidth: 620,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingLeft: 14,
    paddingRight: 6,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#fffefa',
    borderWidth: 1,
    borderColor: '#e3ddd2',
    shadowColor: '#2b2a26',
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
  },
  pillBf: { backgroundColor: '#0b0c09', borderColor: '#ff5b1f', borderWidth: 1.5 },
  pillFlash: { backgroundColor: '#a65d36', borderColor: '#a65d36' },
  text: { ...sans, flexShrink: 1, fontSize: 12, color: '#2b2a26', fontWeight: '500' },
  cta: { backgroundColor: '#a65d36', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7 },
  ctaText: { ...sans, color: '#fffefa', fontSize: 12, fontWeight: '600' },
  backdrop: { flex: 1, backgroundColor: 'rgba(43,42,38,0.45)', alignItems: 'center', justifyContent: 'center', padding: 16 },
  card: { width: '100%', maxWidth: 460, backgroundColor: '#fffefa', borderRadius: 14, padding: 32, gap: 12 },
  badge: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#f3e7dd', alignItems: 'center', justifyContent: 'center' },
  title: { ...sans, fontSize: 24, color: '#2b2a26', letterSpacing: -0.6, fontWeight: '500' },
  body: { ...sans, fontSize: 13, color: '#6b675d', lineHeight: 21 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 14, flexWrap: 'wrap' },
  primary: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: '#a65d36', borderRadius: 8, paddingHorizontal: 18, paddingVertical: 12 },
  primaryText: { ...sans, color: '#fffefa', fontSize: 14, fontWeight: '600' },
  secondary: { paddingHorizontal: 12, paddingVertical: 12, alignItems: 'center' },
  secondaryText: { ...sans, color: '#6b675d', fontSize: 13, fontWeight: '500' },
});
