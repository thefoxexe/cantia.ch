import { useEffect, useRef, useState } from 'react';
import { Image, Platform, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions, type ImageSourcePropType } from 'react-native';
import { Link } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { MarketingFooter, MarketingNav } from '../MarketingChrome';
import { MarketingHead } from '../MarketingHead';
import { Btn, Eyebrow, Headline, Micro, Wrap } from './Primitives';
import { localePrefix, useSiteLocale } from './SiteNav';
import { SITE_COPY } from '../../lib/site/copy';
import { sans, site } from '../../lib/siteTheme';
import { authHref, useSyncMarketingLocaleFromPath } from '../../lib/appHost';
import { useSiteFontScope } from './Primitives';
import { SiteImage } from './SiteImage';

// Sections shared by the public pages of cantia.ch: the page frame, the
// section heading, the closing call to action, the dictation demo and the
// frame for a real exported document.

export const paperShadow = Platform.OS === 'web' ? ({ boxShadow: '0 22px 48px rgba(86,58,34,0.14), 0 2px 6px rgba(86,58,34,0.07)' } as object) : {};

export function useSiteLayout() {
  const { width } = useWindowDimensions();
  const phone = width <= 760;
  const tablet = !phone && width <= 1100;
  const narrow = !phone && width <= 900;
  return { width, phone, tablet, narrow, h2Size: phone ? 32 : width <= 900 ? 36 : 42 };
}

export function SitePage({ title, description, children, scrollRef, cta = true }: { title: string; description?: string; children: React.ReactNode; scrollRef?: React.RefObject<ScrollView | null>; cta?: boolean }) {
  useSiteFontScope();
  useSyncMarketingLocaleFromPath();
  return (
    <View style={styles.page}>
      <MarketingHead title={title} description={description} />
      <MarketingNav />
      <ScrollView ref={scrollRef} style={{ flex: 1 }}>
        {children}
        {cta ? <SiteCta /> : null}
        <MarketingFooter />
      </ScrollView>
    </View>
  );
}

export function Section({ white, children, style, onLayout }: { white?: boolean; children: React.ReactNode; style?: object; onLayout?: (y: number) => void }) {
  const { phone } = useSiteLayout();
  return (
    <View
      style={[{ paddingVertical: phone ? 53 : 86, backgroundColor: white ? site.white : site.bg }, style]}
      onLayout={onLayout ? (e) => onLayout(e.nativeEvent.layout.y) : undefined}
    >
      <Wrap>{children}</Wrap>
    </View>
  );
}

export function SectionHead({ eyebrow, plain, accent, text }: { eyebrow: string; plain: string; accent?: string; text?: string }) {
  const { phone, h2Size } = useSiteLayout();
  return (
    <View style={[styles.sectionHead, phone && { flexDirection: 'column', alignItems: 'flex-start', gap: 17, marginBottom: 27 }]}>
      <View style={{ flexShrink: 1 }}>
        <Eyebrow>{eyebrow}</Eyebrow>
        <Headline plain={plain} accent={accent} size={h2Size} style={{ marginTop: 15 }} />
      </View>
      {text ? <Text style={[sans, styles.sectionText, phone && { fontSize: 12, maxWidth: '100%' }]}>{text}</Text> : null}
    </View>
  );
}

export function SiteCta() {
  const locale = useSiteLocale();
  const h = SITE_COPY[locale].home;
  const { phone } = useSiteLayout();
  return (
    <View style={[styles.cta, { paddingVertical: phone ? 38 : 54 }]}>
      <Wrap style={phone ? undefined : styles.ctaRow}>
        <View style={phone ? undefined : { flex: 1 }}>
          <Headline plain={h.ctaTitlePlain} accent={h.ctaTitleAccent} size={phone ? 32 : 36} color="#f4f3e9" accentColor="#d9aa85" />
          <Text style={[sans, { fontSize: 12, color: '#b2b9a7', marginTop: 15 }]}>{h.ctaText}</Text>
        </View>
        <View style={phone ? { marginTop: 20 } : undefined}>
          <View>
            <Btn label={h.ctaButton} href={authHref('signup')} tone="sand" />
          </View>
        </View>
      </Wrap>
    </View>
  );
}

// "Accueil / Le logiciel / Signer": the trail above a page title.
export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <View style={styles.crumbs} accessibilityLabel="Breadcrumb">
      {items.map((it, i) => (
        <View key={it.label} style={styles.crumbItem}>
          {i > 0 ? <Text style={[sans, styles.crumbText]}>/</Text> : null}
          {it.href ? (
            <Link href={it.href as any}>
              <Text style={[sans, styles.crumbText]}>{it.label}</Text>
            </Link>
          ) : (
            <Text style={[sans, styles.crumbText, { color: site.ink }]}>{it.label}</Text>
          )}
        </View>
      ))}
    </View>
  );
}

// A real PDF page, shown whole on a warm ground, sized to the room it has
// (in CSS: as wide as the stage allows, never taller than maxHeight).
export function DocVisual({ source, ratio, alt, caption, maxHeight = 420 }: { source: ImageSourcePropType; ratio: number; alt: string; caption?: string; maxHeight?: number }) {
  const { phone } = useSiteLayout();
  const pad = phone ? 22 : 34;
  return (
    <View style={[styles.docStage, { padding: pad }]}>
      <View style={[styles.paper, paperShadow, { width: '100%', maxWidth: maxHeight / ratio, aspectRatio: 1 / ratio }]}>
        <SiteImage source={source} style={{ width: '100%', height: '100%' }} resizeMode="cover" alt={alt} />
      </View>
      {caption ? <Text style={[sans, styles.docCaption]}>{caption.toUpperCase()}</Text> : null}
    </View>
  );
}

// A real phone screen of the app, in a plain device outline. The screen is
// cropped by the frame height when `maxHeight` is shorter than the capture.
export function PhoneShot({ source, ratio, width, maxHeight, alt }: { source: ImageSourcePropType; ratio: number; width: number; maxHeight?: number; alt: string }) {
  const bezel = Math.round(width * 0.035);
  const inner = width - bezel * 2;
  const full = inner * ratio;
  const h = maxHeight ? Math.min(full, maxHeight - bezel * 2) : full;
  return (
    <View style={[styles.phone, paperShadow, { width, padding: bezel, borderRadius: width * 0.14 }]}>
      <View style={{ width: inner, height: h, overflow: 'hidden', borderRadius: width * 0.105, backgroundColor: '#f7f1e6' }}>
        <SiteImage source={source} style={{ width: inner, height: full }} resizeMode="cover" alt={alt} />
      </View>
    </View>
  );
}

// A real desktop screen of the app, framed like a window.
export function ScreenShot({ source, ratio, alt }: { source: ImageSourcePropType; ratio: number; alt: string }) {
  return (
    <View style={[styles.screen, paperShadow]}>
      <View style={styles.screenBar}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={styles.screenDot} />
        ))}
        <Text style={[sans, styles.screenUrl]}>app.cantia.ch</Text>
      </View>
      <View style={{ width: '100%', aspectRatio: 1 / ratio }}>
        <SiteImage source={source} style={{ width: '100%', height: '100%' }} resizeMode="cover" alt={alt} />
      </View>
    </View>
  );
}

export function Callout({ strong, text, link }: { strong: string; text: string; link?: React.ReactNode }) {
  return (
    <View style={styles.callout}>
      <Text style={[sans, styles.calloutText]}>
        <Text style={{ color: site.ink, fontWeight: '600' }}>{strong}</Text> {text}
      </Text>
      {link ? <View style={{ marginTop: 14 }}>{link}</View> : null}
    </View>
  );
}

export function usePrefix() {
  return localePrefix(useSiteLocale());
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: site.bg },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', gap: 60, marginBottom: 35 },
  sectionText: { fontSize: 13, maxWidth: 320, color: site.muted, lineHeight: 23 },
  cta: { backgroundColor: site.dark },
  ctaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 40 },
  crumbs: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 10, marginBottom: 27 },
  crumbItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  crumbText: { fontSize: 10, color: '#6b6f65' },
  docStage: { backgroundColor: '#e7e4d8', borderRadius: 10, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  docCaption: { fontSize: 8, color: '#8f927f', letterSpacing: 0.4, marginTop: 18, textAlign: 'center' },
  paper: { backgroundColor: '#ffffff', borderRadius: 3, overflow: 'hidden' },
  phone: { backgroundColor: '#1f231d' },
  screen: { backgroundColor: '#ffffff', borderRadius: 10, overflow: 'hidden', borderWidth: 1, borderColor: site.stageBorder },
  screenBar: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, height: 30, backgroundColor: '#efe9df', borderBottomWidth: 1, borderBottomColor: '#e2d8ca' },
  screenDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: '#d9cbb8' },
  screenUrl: { fontSize: 10, color: '#9a8c7a', marginLeft: 10 },
  voiceBox: { backgroundColor: '#ebe9e0', borderWidth: 1, borderColor: '#deded2', borderRadius: 12 },
  voiceTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  voiceTag: { fontSize: 9, letterSpacing: 1, color: '#8a8f7c' },
  quote: { lineHeight: 33, letterSpacing: -0.6, color: site.ink, marginVertical: 29, maxWidth: 390 },
  voicePlay: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  playButton: { width: 43, height: 43, borderRadius: 22, backgroundColor: site.ink, alignItems: 'center', justifyContent: 'center' },
  wave: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 4, height: 35, overflow: 'hidden' },
  bar: { width: 3, borderRadius: 5, backgroundColor: '#a1a88f' },
  voiceResult: { marginTop: 23, borderTopWidth: 1, borderTopColor: '#d6d8c9', paddingTop: 20 },
  demoCaption: { fontSize: 9, color: '#969b87', marginTop: 18 },
  callout: { paddingVertical: 25, paddingHorizontal: 30, backgroundColor: '#ebe7db', borderWidth: 1, borderColor: '#ded9cb', borderRadius: 7 },
  calloutText: { fontSize: 12, color: '#747b67', lineHeight: 23 },
});
