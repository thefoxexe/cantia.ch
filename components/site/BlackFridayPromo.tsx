import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Link } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Btn, Hover } from './Primitives';
import { localePrefix, useSiteLocale } from './SiteNav';
import { BF_ENDS_AT } from '../../lib/site/blackFriday';
import { sans, serif } from '../../lib/siteTheme';

// Black Friday 2026 on the rest of the site: a strip above the menu and a box
// on the home, pricing, trade and blog pages. Both lead to
// cantia.ch/black-friday (the only page whose sign-up carries the offer) and
// disappear by themselves after Monday 30 November at midnight.

const COPY = {
  fr: { strip: 'Black Friday : jusqu’à -54 % à vie sur tous les plans. Fin lundi à minuit.', stripCta: 'J’en profite', eyebrow: 'Black Friday · jusqu’à lundi minuit', title: 'Jusqu’à -54 %,', accent: 'à vie.', text: 'Le premier Black Friday de Cantia : Entreprise à CHF 59.– au lieu de 129.–, Équipe à 45.–, Essentiel à 25.–. Le prix reste bloqué tant que l’abonnement est actif.', cta: 'Voir l’offre' },
  de: { strip: 'Black Friday: bis zu -54 % lebenslang auf alle Pläne. Ende Montag um Mitternacht.', stripCta: 'Jetzt profitieren', eyebrow: 'Black Friday · bis Montag Mitternacht', title: 'Bis zu -54 %,', accent: 'lebenslang.', text: 'Der erste Black Friday von Cantia: Entreprise für CHF 59.– statt 129.–, Équipe für 45.–, Essentiel für 25.–. Der Preis bleibt, solange das Abo aktiv ist.', cta: 'Zum Angebot' },
  it: { strip: 'Black Friday: fino a -54 % a vita su tutti i piani. Fine lunedì a mezzanotte.', stripCta: 'Approfitto', eyebrow: 'Black Friday · fino a lunedì mezzanotte', title: 'Fino a -54 %,', accent: 'a vita.', text: 'Il primo Black Friday di Cantia: Entreprise a CHF 59.– invece di 129.–, Équipe a 45.–, Essentiel a 25.–. Il prezzo resta bloccato finché l’abbonamento è attivo.', cta: 'Vedere l’offerta' },
} as const;

// True until the end; checked again in the browser (the static pages are
// built before the end and must not keep showing it afterwards).
export function useBlackFridayLive(): boolean {
  const [live, setLive] = useState(true);
  useEffect(() => {
    const check = () => setLive(Date.now() < BF_ENDS_AT);
    check();
    const id = setInterval(check, 60_000);
    return () => clearInterval(id);
  }, []);
  return live;
}

export function blackFridayHref(locale: 'fr' | 'de' | 'it', ref: string): string {
  return `${localePrefix(locale)}/black-friday?ref=${encodeURIComponent(ref)}`;
}

export function BlackFridayStrip() {
  const locale = useSiteLocale();
  const live = useBlackFridayLive();
  const phone = useWindowDimensions().width <= 760;
  if (!live) return null;
  const c = COPY[locale];
  return (
    <Link href={blackFridayHref(locale, 'strip') as any} asChild>
      <Hover accessibilityRole="link" base={styles.strip} hover={{ backgroundColor: '#e54a12' }}>
        <Feather name="zap" size={13} color="#fff" />
        <Text style={[sans, styles.stripText, phone && { fontSize: 11 }]} numberOfLines={phone ? 2 : 1}>
          {c.strip} <Text style={styles.stripCta}>{c.stripCta} →</Text>
        </Text>
      </Hover>
    </Link>
  );
}

export function BlackFridayBox({ source }: { source: string }) {
  const locale = useSiteLocale();
  const live = useBlackFridayLive();
  const phone = useWindowDimensions().width <= 760;
  if (!live) return null;
  const c = COPY[locale];
  return (
    <View style={[styles.box, phone && { padding: 24, flexDirection: 'column', alignItems: 'flex-start' }]}>
      <View style={{ flex: phone ? undefined : 1, gap: 10 }}>
        <Text style={[sans, styles.eyebrow]}>{c.eyebrow.toUpperCase()}</Text>
        <Text style={[sans, styles.title, phone && { fontSize: 30, lineHeight: 34 }]}>
          {c.title} <Text style={[serif, { color: '#ff5b1f' }]}>{c.accent}</Text>
        </Text>
        <Text style={[sans, styles.text]}>{c.text}</Text>
      </View>
      <View style={{ marginTop: phone ? 18 : 0 }}>
        <Btn label={c.cta} href={blackFridayHref(locale, source)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  strip: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#ff5b1f', paddingVertical: 8, paddingHorizontal: 16 },
  stripText: { color: '#fff', fontSize: 12, fontWeight: '700', textAlign: 'center', flexShrink: 1 },
  stripCta: { textDecorationLine: 'underline' },
  box: { flexDirection: 'row', alignItems: 'center', gap: 32, backgroundColor: '#121410', borderRadius: 22, padding: 36, borderWidth: 2, borderColor: '#ff5b1f' },
  eyebrow: { color: '#ff5b1f', fontSize: 10, fontWeight: '800', letterSpacing: 1.6 },
  title: { color: '#f4f3e9', fontSize: 40, lineHeight: 44, fontWeight: '500', letterSpacing: -1.5 },
  text: { color: '#a9ae9f', fontSize: 13, lineHeight: 22, maxWidth: 640 },
});
