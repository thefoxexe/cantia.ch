import { createElement, useEffect, useRef, useState, type ReactNode } from 'react';
import { Image, Platform, StyleSheet, Text, View, type ImageSourcePropType } from 'react-native';
import { sans } from '../../lib/siteTheme';

// The laptop of the site: a dark lid with the same bezel on every side
// around a 1440×900 screen, and its base. Used by the home hero
// (HeroDevices) and by every page that shows a real screen of the app.
export const SCREEN_RATIO = 900 / 1440;

export function LaptopFrame({ width, children }: { width: number; children: ReactNode }) {
  const screenW = width * 0.94;
  const bezel = (width - screenW) / 2;
  return (
    <View style={{ width, alignItems: 'center' }}>
      <View style={[styles.lid, { width, padding: bezel, paddingBottom: bezel + 2, borderRadius: width * 0.025, alignItems: 'center' }]}>
        <View style={[styles.camera, { top: width * 0.009 }]} />
        <View style={{ width: screenW, height: screenW * SCREEN_RATIO, overflow: 'hidden', borderRadius: 3, backgroundColor: '#f7f1e6' }}>{children}</View>
      </View>
      <View style={[styles.base, { width: width * 1.08, height: Math.max(10, width * 0.022) }]}>
        <View style={[styles.notch, { width: width * 0.16 }]} />
      </View>
    </View>
  );
}

// A muted looping recording on web (poster elsewhere, and for visitors who
// ask for reduced motion), playing only while it is on screen.
function Recording({ base, label }: { base: string; label: string }) {
  const ref = useRef<HTMLVideoElement | null>(null);
  const [still, setStill] = useState(false);
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setStill(true);
      return;
    }
    const v = ref.current;
    if (!v || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? v.play?.().catch(() => undefined) : v.pause?.()), { threshold: 0.25 });
    io.observe(v);
    return () => io.disconnect();
  }, []);
  if (Platform.OS !== 'web' || still) return <Image source={{ uri: `${base}.jpg` }} style={StyleSheet.absoluteFill} resizeMode="cover" accessibilityLabel={label} />;
  return createElement('video', {
    ref,
    src: `${base}.mp4`,
    poster: `${base}.jpg`,
    muted: true,
    loop: true,
    playsInline: true,
    preload: 'metadata',
    'aria-label': label,
    style: { width: '100%', height: '100%', display: 'block', objectFit: 'cover' },
  });
}

// A real screen of the app (or a recording of it) in the laptop, sized to
// the column it sits in, with the small "real screen · sample data" note.
export function LaptopShot({ source, video, alt, caption, maxWidth = 760 }: { source?: ImageSourcePropType; video?: string; alt: string; caption?: string; maxWidth?: number }) {
  const [w, setW] = useState(0);
  const width = Math.min(w / 1.08, maxWidth);
  return (
    <View onLayout={(e) => setW(e.nativeEvent.layout.width)} style={{ width: '100%', alignItems: 'center' }}>
      {w ? (
        <LaptopFrame width={width}>
          {video ? <Recording base={video} label={alt} /> : <Image source={source!} style={{ width: '100%', height: '100%' }} resizeMode="cover" accessibilityLabel={alt} />}
        </LaptopFrame>
      ) : (
        <View style={{ height: 320 }} />
      )}
      {caption ? <Text style={[sans, styles.note]}>{caption.toUpperCase()}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  lid: { backgroundColor: '#1f241c', borderWidth: 1, borderColor: '#3a4136', boxShadow: '0 30px 60px rgba(37,41,33,0.22)' } as object,
  camera: { position: 'absolute', alignSelf: 'center', width: 5, height: 5, borderRadius: 3, backgroundColor: '#3d453a' },
  base: { backgroundColor: '#cfd0c6', borderBottomLeftRadius: 12, borderBottomRightRadius: 12, alignItems: 'center', boxShadow: '0 14px 24px rgba(37,41,33,0.18)' } as object,
  notch: { height: 5, backgroundColor: '#b8b9ae', borderBottomLeftRadius: 5, borderBottomRightRadius: 5 },
  note: { fontSize: 8, color: '#8f927f', letterSpacing: 0.6, textAlign: 'center', marginTop: 16 },
});
