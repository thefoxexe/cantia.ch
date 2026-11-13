import { createElement, useCallback, useEffect, useRef, useState } from 'react';
import { Image, Platform, StyleSheet, Text, View } from 'react-native';
import { sans } from '../../lib/siteTheme';
import { FluidLaptop } from './Laptop';

type Locale = 'fr' | 'de' | 'it';

// Recordings of the real app with sample data (clicks through the sidebar,
// scrolling), captured frame by frame and encoded to public/videos/hero-*.mp4,
// first frame as poster (.jpg).
const SUFFIX: Record<Locale, string> = { fr: '', de: '-de', it: '-it' };
const HAS_LOCALE_VIDEO: Record<Locale, boolean> = { fr: true, de: true, it: true };

function src(base: string, kind: 'desktop' | 'phone', locale: Locale, ext: 'mp4' | 'jpg') {
  const suf = HAS_LOCALE_VIDEO[locale] ? SUFFIX[locale] : '';
  return `${base}-${kind}${suf}.${ext}`;
}

// The arrival loader (components/site/Splash) waits for this class.
function markMediaReady() {
  if (Platform.OS === 'web' && typeof document !== 'undefined') document.documentElement.classList.add('media-ready');
}

// A muted looping <video> on web; the poster image elsewhere. Visitors who
// ask for reduced motion get the still poster.
function Clip({ base, kind, locale, label, onReady }: { base: string; kind: 'desktop' | 'phone'; locale: Locale; label: string; onReady: () => void }) {
  const width = '100%';
  const height = '100%';
  const ref = useRef<HTMLVideoElement | null>(null);
  const [still, setStill] = useState(false);
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setStill(true);
      return;
    }
    const v = ref.current;
    if (!v) return;
    if (v.readyState >= 3) onReady();
    else v.addEventListener('canplay', onReady, { once: true });
    v.play?.().catch(() => undefined);
  }, [onReady]);
  if (Platform.OS !== 'web' || still) {
    return <Image source={{ uri: src(base, kind, locale, 'jpg') }} style={{ width, height }} resizeMode="cover" accessibilityLabel={label} onLoad={onReady} onError={onReady} />;
  }
  return createElement('video', {
    ref,
    src: src(base, kind, locale, 'mp4'),
    poster: src(base, kind, locale, 'jpg'),
    autoPlay: true,
    muted: true,
    loop: true,
    playsInline: true,
    preload: 'auto',
    'aria-label': label,
    style: { width, height, display: 'block', objectFit: 'cover', backgroundColor: '#f7f1e6' },
  });
}

// The hero stage: a laptop showing the desktop app and, in front of it, a
// phone showing the phone app. On a phone screen only the phone is shown.
// Sized in CSS (shares of the column, aspect ratios), so the pre-rendered
// page already shows both devices at their final size.
export function HeroDevices({ locale, phoneOnly, labels, media = '/videos/hero' }: { locale: Locale; phoneOnly?: boolean; labels: { desktop: string; phone: string; note?: string }; media?: string }) {
  // Every clip on screen reports once it can play; then the loader may go.
  const pending = useRef(0);
  pending.current = phoneOnly ? 1 : 2;
  const ready = useRef(0);
  const onReady = useCallback(() => {
    ready.current += 1;
    if (ready.current >= pending.current) markMediaReady();
  }, []);
  // The phone: a dark frame (3.5 % bezel) around a 540×1168 screen.
  const phone = (
    <View style={[styles.phone, { width: '100%', padding: '3.5%', borderRadius: phoneOnly ? 34 : 24 }]}>
      <View style={{ width: '100%', aspectRatio: 540 / 1168, overflow: 'hidden', borderRadius: phoneOnly ? 26 : 18, backgroundColor: '#f7f1e6' }}>
        <Clip base={media} onReady={onReady} kind="phone" locale={locale} label={labels.phone} />
      </View>
    </View>
  );
  return (
    <View style={{ width: '100%' }} {...({ dataSet: { heroMedia: '1' } } as object)}>
      {phoneOnly ? (
        <View style={{ width: '62%', maxWidth: 250, alignSelf: 'center' }}>{phone}</View>
      ) : (
        // The phone stands in front of the laptop's bottom-right corner and
        // hangs below it by a third of its height (paddingBottom: 15.6 % of
        // the column = 0.32 × the phone's height).
        <View style={{ width: '100%', paddingBottom: '15.6%' }}>
          <FluidLaptop width="90%" maxWidth={760} align="flex-start">
            <Clip base={media} onReady={onReady} kind="desktop" locale={locale} label={labels.desktop} />
          </FluidLaptop>
          <View style={{ position: 'absolute', right: 0, bottom: 0, width: '24.3%', minWidth: 120, maxWidth: 205 }}>{phone}</View>
        </View>
      )}
      {labels.note ? <Text style={[sans, styles.note]}>{labels.note.toUpperCase()}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  phone: { backgroundColor: '#1f241c', borderWidth: 1, borderColor: '#3a4136', boxShadow: '0 26px 50px rgba(37,41,33,0.28)' } as object,
  note: { fontSize: 8, color: '#8f927f', letterSpacing: 0.6, textAlign: 'center', marginTop: 16 },
});
