import { createElement, useCallback, useEffect, useRef, useState } from 'react';
import { Image, Platform, StyleSheet, Text, View } from 'react-native';
import { sans } from '../../lib/siteTheme';
import { LaptopFrame } from './Laptop';

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
function Clip({ base, kind, locale, label, width, height, onReady }: { base: string; kind: 'desktop' | 'phone'; locale: Locale; label: string; width: number; height: number; onReady: () => void }) {
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
export function HeroDevices({ locale, phoneOnly, labels, media = '/videos/hero' }: { locale: Locale; phoneOnly?: boolean; labels: { desktop: string; phone: string; note: string }; media?: string }) {
  const [w, setW] = useState(0);
  // Every clip on screen reports once it can play; then the loader may go.
  const pending = useRef(0);
  pending.current = phoneOnly ? 1 : 2;
  const ready = useRef(0);
  const onReady = useCallback(() => {
    ready.current += 1;
    if (ready.current >= pending.current) markMediaReady();
  }, []);
  const laptopW = phoneOnly ? 0 : Math.min(w * 0.9, 760);
  const screenW = laptopW * 0.94;
  const screenH = screenW * (900 / 1440);
  const phoneW = phoneOnly ? Math.min(w * 0.62, 250) : Math.max(120, Math.min(laptopW * 0.27, 205));
  const phoneInner = phoneW - phoneW * 0.07;
  const phoneH = phoneInner * (1168 / 540);
  const stageH = phoneOnly ? phoneH + phoneW * 0.07 + 10 : screenH + (laptopW - screenW) + 26 + phoneH * 0.32;
  return (
    <View onLayout={(e) => setW(e.nativeEvent.layout.width)} style={{ width: '100%' }} {...({ dataSet: { heroMedia: '1' } } as object)}>
      {w ? (
        <View style={{ height: stageH, width: '100%' }}>
          {!phoneOnly ? (
            <View style={{ position: 'absolute', left: 0, top: 0 }}>
              <LaptopFrame width={laptopW}>
                <Clip base={media} onReady={onReady} kind="desktop" locale={locale} label={labels.desktop} width={screenW} height={screenH} />
              </LaptopFrame>
            </View>
          ) : null}
          <View
            style={[
              styles.phone,
              {
                width: phoneW,
                padding: phoneW * 0.035,
                borderRadius: phoneW * 0.15,
                position: phoneOnly ? 'relative' : 'absolute',
                alignSelf: phoneOnly ? 'center' : undefined,
                right: phoneOnly ? undefined : 0,
                bottom: phoneOnly ? undefined : 0,
              },
            ]}
          >
            <View style={{ width: phoneInner, height: phoneH, overflow: 'hidden', borderRadius: phoneW * 0.115, backgroundColor: '#f7f1e6' }}>
              <Clip base={media} onReady={onReady} kind="phone" locale={locale} label={labels.phone} width={phoneInner} height={phoneH} />
            </View>
          </View>
        </View>
      ) : (
        <View style={{ height: phoneOnly ? 520 : 480 }} />
      )}
      <Text style={[sans, styles.note]}>{labels.note.toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  phone: { backgroundColor: '#1f241c', borderWidth: 1, borderColor: '#3a4136', boxShadow: '0 26px 50px rgba(37,41,33,0.28)' } as object,
  note: { fontSize: 8, color: '#8f927f', letterSpacing: 0.6, textAlign: 'center', marginTop: 16 },
});
