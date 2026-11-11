import { useEffect, useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { IS_DEMO, onDemoBlocked } from '../lib/demo';
import { getAppLocale } from '../lib/translations';
import { sans } from '../lib/siteTheme';

// Bottom pill of the read-only demo (demo.cantia.ch): says it is a
// sample company, links to the real sign-up, and flashes a short notice
// each time the demo refuses a change.
const COPY = {
  fr: { label: 'Démo · Atelier Martin SA, entreprise d’exemple', blocked: 'Démo en lecture seule : rien n’a été enregistré.', cta: 'Essayer Cantia' },
  de: { label: 'Demo · Atelier Martin SA, Beispielunternehmen', blocked: 'Demo nur zum Ansehen: Es wurde nichts gespeichert.', cta: 'Cantia testen' },
  it: { label: 'Demo · Atelier Martin SA, azienda di esempio', blocked: 'Demo in sola lettura: non è stato salvato nulla.', cta: 'Provare Cantia' },
} as const;

export function DemoBanner() {
  const [blocked, setBlocked] = useState(false);
  const { width } = useWindowDimensions();
  useEffect(() => {
    if (!IS_DEMO) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const off = onDemoBlocked(() => {
      setBlocked(true);
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => setBlocked(false), 4000);
    });
    return () => {
      off();
      if (timer) clearTimeout(timer);
    };
  }, []);
  if (!IS_DEMO) return null;
  const locale = getAppLocale();
  const c = COPY[locale === 'de' || locale === 'it' ? locale : 'fr'];
  const phone = width < 640;
  return (
    <View pointerEvents="box-none" style={[styles.wrap, phone && { left: 12, right: 70, bottom: 14, alignItems: 'flex-start' }]}>
      <View style={[styles.pill, blocked && styles.pillBlocked]}>
        <Feather name={blocked ? 'lock' : 'eye'} size={13} color={blocked ? '#fffefa' : '#a65d36'} />
        <Text style={[styles.text, blocked && { color: '#fffefa' }]} numberOfLines={2}>
          {blocked ? c.blocked : c.label}
        </Text>
        <Pressable
          accessibilityRole="link"
          onPress={() => Linking.openURL(`https://app.cantia.ch/signup?locale=${locale}`)}
          style={[styles.cta, blocked && { backgroundColor: '#fffefa' }]}
        >
          <Text style={[styles.ctaText, blocked && { color: '#a65d36' }]}>{c.cta}</Text>
        </Pressable>
      </View>
    </View>
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
  pillBlocked: { backgroundColor: '#a65d36', borderColor: '#a65d36' },
  text: { ...sans, flexShrink: 1, fontSize: 12, color: '#2b2a26', fontWeight: '500' },
  cta: { backgroundColor: '#a65d36', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7 },
  ctaText: { ...sans, color: '#fffefa', fontSize: 12, fontWeight: '600' },
});
