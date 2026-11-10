import { createElement, useEffect, useRef, useState } from 'react';
import { Image, Platform, StyleSheet, Text, View } from 'react-native';
import { sans, site } from '../../lib/siteTheme';

type Locale = 'fr' | 'de' | 'it';

// Recordings of the real app with sample data (clicks through the sidebar,
// scrolling), captured frame by frame and encoded to public/videos/hero-*.mp4,
// first frame as poster (.jpg).
const SUFFIX: Record<Locale, string> = { fr: '', de: '-de', it: '-it' };
const HAS_LOCALE_VIDEO: Record<Locale, boolean> = { fr: true, de: true, it: true };

function src(kind: 'desktop' | 'phone', locale: Locale, ext: 'mp4' | 'jpg') {
  const suf = HAS_LOCALE_VIDEO[locale] ? SUFFIX[locale] : '';
  return `/videos/hero-${kind}${suf}.${ext}`;
}

// A muted looping <video> on web; the poster image elsewhere. Visitors who
// ask for reduced motion get the still poster.
function Clip({ kind, locale, label, width, height }: { kind: 'desktop' | 'phone'; locale: Locale; label: string; width: number; height: number }) {
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
    if (v) v.play?.().catch(() => undefined);
  }, []);
  if (Platform.OS !== 'web' || still) {
    return <Image source={{ uri: src(kind, locale, 'jpg') }} style={{ width, height }} resizeMode="cover" accessibilityLabel={label} />;
  }
  return createElement('video', {
    ref,
    src: src(kind, locale, 'mp4'),
    poster: src(kind, locale, 'jpg'),
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
export function HeroDevices({ locale, phoneOnly, labels }: { locale: Locale; phoneOnly?: boolean; labels: { desktop: string; phone: string; note: string } }) {
  const [w, setW] = useState(0);
  const laptopW = phoneOnly ? 0 : Math.min(w * 0.9, 760);
  const screenW = laptopW * 0.9;
  const screenH = screenW * (900 / 1440);
  const phoneW = phoneOnly ? Math.min(w * 0.62, 250) : Math.max(120, Math.min(laptopW * 0.27, 205));
  const phoneInner = phoneW - phoneW * 0.07;
  const phoneH = phoneInner * (1168 / 540);
  const stageH = phoneOnly ? phoneH + phoneW * 0.07 + 10 : screenH + laptopW * 0.05 + 26 + phoneH * 0.32;
  return (
    <View onLayout={(e) => setW(e.nativeEvent.layout.width)} style={{ width: '100%' }}>
      {w ? (
        <View style={{ height: stageH, width: '100%' }}>
          {!phoneOnly ? (
            <View style={{ position: 'absolute', left: 0, top: 0, width: laptopW, alignItems: 'center' }}>
              <View style={[styles.lid, { width: laptopW, padding: laptopW * 0.05 * 0.5, paddingBottom: laptopW * 0.025, borderRadius: laptopW * 0.025 }]}>
                <View style={[styles.camera, { top: laptopW * 0.009 }]} />
                <View style={{ width: screenW, height: screenH, overflow: 'hidden', borderRadius: 3, backgroundColor: '#f7f1e6' }}>
                  <Clip kind="desktop" locale={locale} label={labels.desktop} width={screenW} height={screenH} />
                </View>
              </View>
              <View style={[styles.base, { width: laptopW * 1.08, height: Math.max(10, laptopW * 0.022), marginLeft: 0 }]}>
                <View style={[styles.notch, { width: laptopW * 0.16 }]} />
              </View>
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
              <Clip kind="phone" locale={locale} label={labels.phone} width={phoneInner} height={phoneH} />
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
  lid: { backgroundColor: '#1f241c', borderWidth: 1, borderColor: '#3a4136', boxShadow: '0 30px 60px rgba(37,41,33,0.22)' } as object,
  camera: { position: 'absolute', alignSelf: 'center', width: 5, height: 5, borderRadius: 3, backgroundColor: '#3d453a' },
  base: { backgroundColor: '#cfd0c6', borderBottomLeftRadius: 12, borderBottomRightRadius: 12, alignItems: 'center', boxShadow: '0 14px 24px rgba(37,41,33,0.18)' } as object,
  notch: { height: 5, backgroundColor: '#b8b9ae', borderBottomLeftRadius: 5, borderBottomRightRadius: 5 },
  phone: { backgroundColor: '#1f241c', borderWidth: 1, borderColor: '#3a4136', boxShadow: '0 26px 50px rgba(37,41,33,0.28)' } as object,
  note: { fontSize: 8, color: '#8f927f', letterSpacing: 0.6, textAlign: 'center', marginTop: 16 },
});
