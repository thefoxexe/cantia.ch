import { useEffect, useState } from 'react';
import { Linking, Modal, Platform, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Link, usePathname } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Hover } from './Primitives';
import { localePrefix, useSiteLocale } from './SiteNav';
import { BF_ENDS_AT } from '../../lib/site/blackFriday';
import { IS_DEMO } from '../../lib/demo';
import { sans, serif } from '../../lib/siteTheme';

// Black Friday 2026 pop-up on the marketing site: opens a few seconds after
// the visitor lands, with a live countdown, and leads to cantia.ch/black-friday.
// Never on the offer page itself, once per visit (sessionStorage), and never
// after Monday 30 November at midnight (BF_ENDS_AT): it removes itself.

const night = '#0b0c09';
const night2 = '#16180f';
const line = '#2a2d22';
const flame = '#ff5b1f';
const paper = '#f4f3e9';
const fog = '#9da293';
const KEY = 'cantia_bf2026_popup_seen';
// On demo.cantia.ch the visitor first looks around a little.
const DELAY_MS = IS_DEMO ? 6000 : 3500;

const COPY = {
  fr: { badge: 'BLACK FRIDAY', title: 'Le premier Black Friday de Cantia.', upTo: 'JUSQU’À', life: 'à vie', text: 'Entreprise à CHF 59.– au lieu de 129.–. Le prix reste bloqué tant que votre abonnement est actif. Il n’y aura pas de meilleure offre.', ends: 'Fin lundi 30 novembre à minuit', units: ['jours', 'heures', 'min', 'sec'], cta: 'J’en profite', later: 'Plus tard', close: 'Fermer' },
  de: { badge: 'BLACK FRIDAY', title: 'Der erste Black Friday von Cantia.', upTo: 'BIS ZU', life: 'lebenslang', text: 'Entreprise für CHF 59.– statt 129.–. Der Preis bleibt, solange Ihr Abo aktiv ist. Ein besseres Angebot wird es nicht geben.', ends: 'Ende Montag, 30. November, Mitternacht', units: ['Tage', 'Std.', 'Min.', 'Sek.'], cta: 'Jetzt profitieren', later: 'Später', close: 'Schliessen' },
  it: { badge: 'BLACK FRIDAY', title: 'Il primo Black Friday di Cantia.', upTo: 'FINO A', life: 'a vita', text: 'Entreprise a CHF 59.– invece di 129.–. Il prezzo resta bloccato finché l’abbonamento è attivo. Non ci sarà un’offerta migliore.', ends: 'Fine lunedì 30 novembre a mezzanotte', units: ['giorni', 'ore', 'min', 'sec'], cta: 'Approfitto', later: 'Più tardi', close: 'Chiudi' },
} as const;

function seen(): boolean {
  try {
    return window.sessionStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
}
function markSeen() {
  try {
    window.sessionStorage.setItem(KEY, '1');
  } catch {
    /* private mode: it may show again on the next page, nothing more */
  }
}

export function BlackFridayPopup() {
  const pathname = usePathname();
  const locale = useSiteLocale();
  const phone = useWindowDimensions().width <= 760;
  const [open, setOpen] = useState(false);
  const [left, setLeft] = useState(0);
  const onOfferPage = pathname.includes('black-friday');

  // Decided in the browser only: the static HTML never contains it.
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined' || onOfferPage) return;
    if (Date.now() >= BF_ENDS_AT || seen()) return;
    const id = setTimeout(() => {
      if (Date.now() < BF_ENDS_AT) {
        setOpen(true);
        markSeen();
      }
    }, DELAY_MS);
    return () => clearTimeout(id);
  }, [onOfferPage]);

  useEffect(() => {
    if (!open) return;
    const tick = () => {
      const l = BF_ENDS_AT - Date.now();
      if (l <= 0) setOpen(false);
      setLeft(Math.max(0, l));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [open]);

  if (!open || onOfferPage) return null;
  const c = COPY[locale];
  const s = Math.floor(left / 1000);
  const parts = [Math.floor(s / 86400), Math.floor((s % 86400) / 3600), Math.floor((s % 3600) / 60), s % 60];
  // The demo is another site: the offer page opens on cantia.ch.
  const href = IS_DEMO ? `https://cantia.ch${localePrefix(locale)}/black-friday?ref=demo-popup` : `${localePrefix(locale)}/black-friday?ref=popup`;
  const close = () => setOpen(false);

  return (
    <Modal transparent visible animationType="fade" onRequestClose={close}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={close} accessibilityRole="button" accessibilityLabel={c.close} />
        <View style={[styles.card, phone && styles.cardPhone]} role="dialog" aria-modal aria-label={c.badge}>
          <View style={styles.glow} pointerEvents="none" />
          <View style={styles.top}>
            <View style={styles.badge}>
              <Feather name="zap" size={12} color="#fff" />
              <Text style={[sans, styles.badgeText]}>{c.badge}</Text>
            </View>
            <Pressable onPress={close} hitSlop={12} accessibilityRole="button" accessibilityLabel={c.close} style={styles.x}>
              <Feather name="x" size={18} color={fog} />
            </Pressable>
          </View>

          <Text style={[sans, styles.title, phone && { fontSize: 18, lineHeight: 23 }]}>{c.title}</Text>

          <View style={styles.pctRow}>
            <View>
              <Text style={[sans, styles.upTo]}>{c.upTo}</Text>
              <Text style={[sans, styles.pct, phone && { fontSize: 58, lineHeight: 60 }]}>-54%</Text>
            </View>
            <Text style={[serif, styles.life, phone && { fontSize: 26, marginBottom: 8 }]}>{c.life}.</Text>
          </View>

          <Text style={[sans, styles.text]}>{c.text}</Text>

          <Text style={[sans, styles.ends]}>{c.ends.toUpperCase()}</Text>
          <View style={styles.cd}>
            {parts.map((v, i) => (
              <View key={c.units[i]} style={styles.cdBox}>
                <Text style={[sans, styles.cdNum, phone && { fontSize: 21 }, { fontVariant: ['tabular-nums'] }]}>{String(v).padStart(2, '0')}</Text>
                <Text style={[sans, styles.cdUnit]}>{c.units[i].toUpperCase()}</Text>
              </View>
            ))}
          </View>

          {IS_DEMO ? (
            <Hover accessibilityRole="link" onPress={() => { close(); Linking.openURL(href).catch(() => {}); }} base={styles.cta} hover={{ backgroundColor: '#ff7440' }}>
              <Text style={[sans, styles.ctaText]}>{c.cta}</Text>
              <Feather name="arrow-right" size={18} color="#fff" />
            </Hover>
          ) : (
            <Link href={href as any} asChild>
              <Hover accessibilityRole="link" onPress={close} base={styles.cta} hover={{ backgroundColor: '#ff7440' }}>
                <Text style={[sans, styles.ctaText]}>{c.cta}</Text>
                <Feather name="arrow-right" size={18} color="#fff" />
              </Hover>
            </Link>
          )}
          <Pressable onPress={close} hitSlop={8} style={{ alignSelf: 'center', marginTop: 14 }}>
            <Text style={[sans, styles.later]}>{c.later}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center', padding: 28 },
  card: { width: '100%', maxWidth: 380, backgroundColor: night, borderRadius: 26, borderWidth: 1.5, borderColor: flame, padding: 24, overflow: 'hidden', shadowColor: flame, shadowOpacity: 0.3, shadowRadius: 40, shadowOffset: { width: 0, height: 0 } },
  cardPhone: { maxWidth: 330, padding: 18, borderRadius: 20 },
  glow: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, ...(Platform.OS === 'web' ? ({ backgroundImage: 'radial-gradient(circle at 90% 0%, rgba(255,91,31,0.26), rgba(255,91,31,0) 55%)' } as object) : {}) },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: flame, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '800', letterSpacing: 1.6 },
  x: { width: 34, height: 34, borderRadius: 17, borderWidth: 1, borderColor: line, alignItems: 'center', justifyContent: 'center' },
  title: { color: paper, fontSize: 21, lineHeight: 26, fontWeight: '600', letterSpacing: -0.8, marginTop: 20 },
  pctRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 14, marginTop: 14 },
  upTo: { color: fog, fontSize: 10, fontWeight: '800', letterSpacing: 2 },
  pct: { color: flame, fontSize: 74, lineHeight: 76, fontWeight: '800', letterSpacing: -3 },
  life: { color: paper, fontSize: 32, marginBottom: 10 },
  text: { color: fog, fontSize: 12, lineHeight: 19, marginTop: 6 },
  ends: { color: flame, fontSize: 10, fontWeight: '800', letterSpacing: 1.4, marginTop: 16, marginBottom: 8 },
  cd: { flexDirection: 'row', gap: 8 },
  cdBox: { flex: 1, backgroundColor: night2, borderWidth: 1, borderColor: line, borderRadius: 13, paddingVertical: 11, alignItems: 'center' },
  cdNum: { color: paper, fontSize: 24, fontWeight: '800', letterSpacing: -1 },
  cdUnit: { color: fog, fontSize: 8, fontWeight: '700', letterSpacing: 1.2, marginTop: 3 },
  cta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: flame, borderRadius: 12, paddingVertical: 13, marginTop: 18 },
  ctaText: { color: '#fff', fontSize: 15, fontWeight: '800', letterSpacing: 0.2 },
  later: { color: fog, fontSize: 12, fontWeight: '600', textDecorationLine: 'underline' },
});
