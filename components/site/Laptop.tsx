import { createElement, useEffect, useRef, useState, type ReactNode } from 'react';
import { Image, Platform, StyleSheet, Text, View, type ImageSourcePropType } from 'react-native';
import { sans } from '../../lib/siteTheme';
import { SiteImage } from './SiteImage';

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

// The same laptop, sized in CSS (percentages and aspect ratios of the column
// it sits in) instead of measured pixels: it already has its final size in the
// pre-rendered HTML, at any screen width, so nothing grows or moves once
// JavaScript runs. `width` is the share of the column it takes.
export function FluidLaptop({ width = '92.6%', maxWidth, align = 'center', children }: { width?: `${number}%`; maxWidth: number; align?: 'center' | 'flex-start'; children: ReactNode }) {
  return (
    <View style={{ width, maxWidth, alignSelf: align, alignItems: 'center' }}>
      {/* padding % is a share of this wrapper's width: the 3 % bezel of LaptopFrame */}
      <View style={[styles.lid, { width: '100%', padding: '3%', borderRadius: 12, alignItems: 'center' }]}>
        <View style={[styles.camera, { top: 4 }]} />
        <View style={{ width: '100%', aspectRatio: 1440 / 900, overflow: 'hidden', borderRadius: 3, backgroundColor: '#f7f1e6' }}>{children}</View>
      </View>
      <View style={[styles.base, { width: '108%', aspectRatio: 1.08 / 0.022, minHeight: 10 }]}>
        <View style={[styles.notch, { width: '14.8%' }]} />
      </View>
    </View>
  );
}

// A real screen of the app (or a recording of it) in the laptop, sized to
// the column it sits in. `priority` for the one at the top of a page (the
// largest picture of the first screen: loaded first, never lazily).
export function LaptopShot({ source, video, alt, caption, maxWidth = 760, priority }: { source?: ImageSourcePropType; video?: string; alt: string; caption?: string; maxWidth?: number; priority?: boolean }) {
  return (
    <View style={{ width: '100%', alignItems: 'center' }}>
      <FluidLaptop maxWidth={maxWidth}>
        {video ? <Recording base={video} label={alt} /> : <SiteImage source={source!} style={{ width: '100%', height: '100%' }} resizeMode="cover" alt={alt} priority={priority} />}
      </FluidLaptop>
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
