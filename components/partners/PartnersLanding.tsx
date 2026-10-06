import { useEffect, useState } from 'react';
import { Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Head from 'expo-router/head';
import { Link } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import Svg, { Circle, Defs, Path, Text as SvgText, TextPath } from 'react-native-svg';
import { PAGE_MAX, PartnersNav, PartnersPage, useIsWide } from './PartnersChrome';
import { usePartnersCopy } from '../../lib/partners/locale';
import { CONTACT_EMAIL, LANDING_COPY } from '../../lib/partners/landingCopy';
import { getShowcase, partnerLogoUrl, type ShowcaseEntry } from '../../lib/partners/api';
import { BrandMark, BRAND_DISPLAY_FONT } from '../brand/Logo';
import { colors, fontSize, radius, spacing } from '../../lib/theme';

// partners.cantia.ch landing (October 2026): a business partner programme
// for resellers, fiduciaries, integrators and suppliers. No product
// screenshot and no public commission rate: terms are agreed with each
// partner. Approved partners' logos appear on the wall.

const ORIGIN = 'https://partners.cantia.ch';
const INK = '#120E0B';
const SAND = '#E8DCCB';
const COPPER = '#D9895A';

const heading = { fontFamily: 'Archivo, system-ui, sans-serif', fontWeight: '700' as const };
const mono = { fontFamily: '"Martian Mono", ui-monospace, monospace' };

function mail() {
  Linking.openURL(`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Cantia Partners')}`);
}

export function PartnersLanding() {
  const { locale } = usePartnersCopy();
  const c = LANDING_COPY[locale];
  const wide = useIsWide();
  const prefix = locale === 'fr' ? '' : `/${locale}`;
  const [wall, setWall] = useState<ShowcaseEntry[]>([]);

  useEffect(() => {
    getShowcase().then(setWall);
  }, []);

  // Fill the wall to a full row with "your logo here" tiles.
  const perRow = wide ? 4 : 2;
  const empty = perRow - (wall.length % perRow);

  return (
    <PartnersPage nav={<PartnersNav landing cta />}>
      <Head>
        <title>{c.meta.title}</title>
        <meta name="description" content={c.meta.description} />
        <link rel="canonical" href={`${ORIGIN}${prefix || '/'}`} />
        <link rel="alternate" hrefLang="fr-CH" href={`${ORIGIN}/`} />
        <link rel="alternate" hrefLang="de-CH" href={`${ORIGIN}/de`} />
        <link rel="alternate" hrefLang="it-CH" href={`${ORIGIN}/it`} />
        <link rel="alternate" hrefLang="x-default" href={`${ORIGIN}/`} />
        <meta property="og:title" content={c.meta.title} />
        <meta property="og:description" content={c.meta.description} />
        <meta property="og:url" content={`${ORIGIN}${prefix || '/'}`} />
        <meta property="og:image" content={`${ORIGIN}/og-image.jpg`} />
        <meta property="og:locale" content={`${locale}_CH`} />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@graph': [
              {
                '@type': 'WebPage',
                name: c.meta.title,
                description: c.meta.description,
                url: `${ORIGIN}${prefix || '/'}`,
                inLanguage: `${locale}-CH`,
                isPartOf: { '@type': 'WebSite', name: 'Cantia', url: 'https://cantia.ch' },
              },
              { '@type': 'FAQPage', mainEntity: c.faq.items.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
            ],
          })}
        </script>
      </Head>

      {/* Hero */}
      <View style={styles.hero}>
        <View style={[styles.inner, styles.heroInner, wide && styles.heroInnerWide]}>
          <View style={[{ gap: spacing.lg }, wide && { flex: 1.35 }]}>
            <Text style={styles.heroEyebrow}>{c.hero.eyebrow}</Text>
            <Text style={[styles.heroTitle, !wide && styles.heroTitleNarrow]} role="heading" aria-level={1}>
              {c.hero.title}
            </Text>
            <Text style={styles.heroText}>{c.hero.text}</Text>
            <View style={styles.ctaRow}>
              <Link href={'/connexion?mode=signup' as any} style={styles.ctaPrimary}>
                <Text style={styles.ctaPrimaryText}>{c.hero.cta}</Text>
              </Link>
              <Pressable onPress={mail} style={styles.ctaGhost} accessibilityRole="link">
                <Text style={styles.ctaGhostText}>{c.hero.secondary}</Text>
                <Feather name="arrow-up-right" size={16} color={SAND} />
              </Pressable>
            </View>
            <Text style={styles.heroNote}>{c.hero.note}</Text>
          </View>
          <View style={[styles.sealWrap, wide && { flex: 1 }]}>
            <Seal top={c.seal.top} bottom={c.seal.bottom} size={wide ? 340 : 260} />
            <Text style={styles.sealCaption}>{c.seal.caption}</Text>
          </View>
        </View>
        <View style={styles.heroStrip}>
          <View style={[styles.inner, styles.stripInner]}>
            {c.profiles.items.map((p, i) => (
              <Text key={p.title} style={styles.stripItem}>
                {i ? '·  ' : ''}
                {p.title}
              </Text>
            ))}
          </View>
        </View>
      </View>

      {/* Statement */}
      <View style={[styles.inner, styles.section, wide && styles.split]}>
        <View style={[{ gap: spacing.md }, wide && { flex: 1 }]}>
          <Text style={styles.eyebrow}>{c.statement.eyebrow}</Text>
          <Text style={styles.h2} role="heading" aria-level={2}>
            {c.statement.title}
          </Text>
        </View>
        <Text style={[styles.lead, wide && { flex: 1, paddingTop: 34 }]}>{c.statement.text}</Text>
      </View>

      {/* Pillars */}
      <View style={[styles.inner, styles.section]}>
        <Text style={styles.eyebrow}>{c.pillars.eyebrow}</Text>
        <Text style={[styles.h2, { maxWidth: 720 }]} role="heading" aria-level={2}>
          {c.pillars.title}
        </Text>
        <View style={[styles.grid, { marginTop: spacing.xl }]}>
          {c.pillars.items.map((p, i) => (
            <View key={p.title} style={[styles.pillar, wide ? { width: '23.5%' as any } : { width: '100%' }]}>
              <Text style={styles.pillarNum}>{String(i + 1).padStart(2, '0')}</Text>
              <Text style={styles.pillarTitle}>{p.title}</Text>
              <Text style={styles.body}>{p.text}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Profiles, dark band */}
      <View style={[styles.band, { marginTop: 96 }]}>
        <View style={[styles.inner, { gap: spacing.md }]}>
          <Text style={[styles.eyebrow, { color: COPPER }]}>{c.profiles.eyebrow}</Text>
          <Text style={[styles.h2, { color: '#FBF6EE', maxWidth: 760 }]} role="heading" aria-level={2}>
            {c.profiles.title}
          </Text>
          <Text style={[styles.body, { color: '#BFAF9C' }]}>{c.profiles.text}</Text>
          <View style={[styles.grid, { marginTop: spacing.lg }]}>
            {c.profiles.items.map((p) => (
              <View key={p.title} style={[styles.profile, wide ? { width: '48.8%' as any } : { width: '100%' }]}>
                <Text style={styles.profileTitle}>{p.title}</Text>
                <Text style={[styles.body, { color: '#CDBFAE' }]}>{p.text}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Process */}
      <View style={[styles.inner, styles.section]}>
        <Text style={styles.eyebrow}>{c.process.eyebrow}</Text>
        <Text style={styles.h2} role="heading" aria-level={2}>
          {c.process.title}
        </Text>
        <View style={[{ gap: spacing.xl, marginTop: spacing.xl }, wide && { flexDirection: 'row' }]}>
          {c.process.items.map((p, i) => (
            <View key={p.title} style={[{ gap: spacing.sm }, wide && { flex: 1 }]}>
              <View style={styles.stepHead}>
                <View style={styles.stepDot}>
                  <Text style={styles.stepDotText}>{i + 1}</Text>
                </View>
                {wide && i < c.process.items.length - 1 ? <View style={styles.stepLine} /> : null}
              </View>
              <Text style={styles.pillarTitle}>{p.title}</Text>
              <Text style={styles.body}>{p.text}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Partner wall */}
      <View style={[styles.inner, styles.section]} nativeID="partenaires">
        <View style={[{ gap: spacing.md }, wide && { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }]}>
          <View style={{ gap: spacing.sm, maxWidth: 640 }}>
            <Text style={styles.eyebrow}>{c.wall.eyebrow}</Text>
            <Text style={styles.h2} role="heading" aria-level={2}>
              {c.wall.title}
            </Text>
            <Text style={styles.body}>{c.wall.text}</Text>
          </View>
        </View>
        <View style={[styles.wall, { marginTop: spacing.xl }]}>
          {wall.map((p) => (
            <Pressable
              key={p.logo_path}
              onPress={() => p.website && Linking.openURL(p.website.startsWith('http') ? p.website : `https://${p.website}`)}
              style={({ hovered }: any) => [styles.tile, { width: wide ? '24.2%' : '48.5%' } as any, hovered && p.website ? styles.tileHover : null]}
              accessibilityRole={p.website ? 'link' : undefined}
              accessibilityLabel={p.name}
            >
              <View style={styles.tileLogo}>
                {Platform.OS === 'web' ? (
                  // eslint-disable-next-line jsx-a11y/alt-text
                  <img src={partnerLogoUrl(p.logo_path)} alt={p.name} loading="lazy" style={{ maxWidth: '78%', maxHeight: 64, objectFit: 'contain' }} />
                ) : (
                  <Text style={styles.tileName}>{p.name}</Text>
                )}
              </View>
              <Text style={styles.tileName} numberOfLines={1}>
                {p.name}
              </Text>
              {p.tagline ? (
                <Text style={styles.tileTag} numberOfLines={2}>
                  {p.tagline}
                </Text>
              ) : null}
            </Pressable>
          ))}
          {Array.from({ length: empty }).map((_, i) => (
            <Link key={`empty-${i}`} href={'/connexion?mode=signup' as any} style={[styles.tile, styles.tileEmpty, { width: wide ? '24.2%' : '48.5%' } as any]}>
              <View style={{ alignItems: 'center', gap: 6 }}>
                <Feather name="plus" size={20} color={colors.primary} />
                <Text style={styles.tileEmptyTitle}>{c.wall.yours}</Text>
                <Text style={styles.tileTag}>{c.wall.yoursText}</Text>
              </View>
            </Link>
          ))}
        </View>
      </View>

      {/* FAQ */}
      <View style={[styles.inner, styles.section, wide && styles.split]}>
        <View style={[{ gap: spacing.sm }, wide && { flex: 0.7 }]}>
          <Text style={styles.eyebrow}>{c.faq.eyebrow}</Text>
          <Text style={styles.h2} role="heading" aria-level={2}>
            {c.faq.title}
          </Text>
        </View>
        <View style={[styles.faq, wide && { flex: 1.3 }]}>
          {c.faq.items.map((item, i) => (
            <FaqItem key={item.q} q={item.q} a={item.a} defaultOpen={i === 0} />
          ))}
        </View>
      </View>

      {/* Final */}
      <View style={[styles.inner, styles.section, { marginBottom: 96 }]}>
        <View style={[styles.final, wide && styles.finalWide]}>
          <View style={[{ gap: spacing.sm }, wide && { flex: 1 }]}>
            <Text style={styles.finalTitle}>{c.final.title}</Text>
            <Text style={[styles.body, { color: '#CDBFAE', maxWidth: 520 }]}>{c.final.text}</Text>
            <Text style={styles.finalMail} selectable>
              {CONTACT_EMAIL}
            </Text>
          </View>
          <View style={{ gap: spacing.sm, alignItems: wide ? 'flex-end' : 'flex-start' }}>
            <Link href={'/connexion?mode=signup' as any} style={styles.ctaPrimary}>
              <Text style={styles.ctaPrimaryText}>{c.final.cta}</Text>
            </Link>
            <Pressable onPress={mail} style={styles.ctaGhost}>
              <Text style={styles.ctaGhostText}>{c.final.write}</Text>
              <Feather name="arrow-up-right" size={16} color={SAND} />
            </Pressable>
          </View>
        </View>
      </View>
    </PartnersPage>
  );
}

// The partner label: a seal with the Cantia mark.
function Seal({ top, bottom, size }: { top: string; bottom: string; size: number }) {
  const r = size / 2;
  const tr = r - 34;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }} aria-hidden>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ position: 'absolute' }}>
        <Defs>
          <Path id="sealTop" d={`M ${r - tr} ${r} A ${tr} ${tr} 0 0 1 ${r + tr} ${r}`} />
          <Path id="sealBottom" d={`M ${r - tr} ${r} A ${tr} ${tr} 0 0 0 ${r + tr} ${r}`} />
        </Defs>
        <Circle cx={r} cy={r} r={r - 2} fill="none" stroke="rgba(217,137,90,0.55)" strokeWidth={1} />
        <Circle cx={r} cy={r} r={r - 12} fill="none" stroke="rgba(232,220,203,0.18)" strokeWidth={1} />
        <Circle cx={r} cy={r} r={r - 58} fill="rgba(255,255,255,0.025)" stroke="rgba(217,137,90,0.35)" strokeWidth={1} />
        <SvgText fill={SAND} fontSize={size * 0.043} letterSpacing={size * 0.012} fontFamily="Michroma, Archivo, sans-serif">
          <TextPath href="#sealTop" startOffset="50%" textAnchor="middle">
            {top}
          </TextPath>
        </SvgText>
        <SvgText fill={COPPER} fontSize={size * 0.036} letterSpacing={size * 0.012} fontFamily="Michroma, Archivo, sans-serif" dy={size * 0.035}>
          <TextPath href="#sealBottom" startOffset="50%" textAnchor="middle">
            {bottom}
          </TextPath>
        </SvgText>
        <Circle cx={r - tr} cy={r} r={2.5} fill={COPPER} />
        <Circle cx={r + tr} cy={r} r={2.5} fill={COPPER} />
      </Svg>
      <View style={{ alignItems: 'center', gap: 10 }}>
        <BrandMark size={size * 0.24} tone="white" />
        <Text style={[styles.sealWord, { fontSize: size * 0.04 }]}>PARTNERS</Text>
      </View>
    </View>
  );
}

function FaqItem({ q, a, defaultOpen }: { q: string; a: string; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <View style={styles.faqItem}>
      <Pressable onPress={() => setOpen(!open)} style={styles.faqQRow} accessibilityRole="button" aria-expanded={open}>
        <Text style={styles.faqQ}>{q}</Text>
        <Feather name={open ? 'minus' : 'plus'} size={18} color={colors.text} />
      </Pressable>
      <Text style={[styles.faqA, !open && { display: 'none' }]}>{a}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  inner: { width: '100%', maxWidth: PAGE_MAX, alignSelf: 'center', paddingHorizontal: spacing.lg },
  section: { marginTop: 112, gap: spacing.md },
  split: { flexDirection: 'row', gap: 64 },

  hero: { backgroundColor: INK, overflow: 'hidden' },
  heroInner: { paddingTop: 72, paddingBottom: 64, gap: 48 },
  heroInnerWide: { flexDirection: 'row', alignItems: 'center', paddingTop: 112, paddingBottom: 104, gap: 64 },
  heroEyebrow: { ...mono, fontSize: 11.5, letterSpacing: 2, textTransform: 'uppercase', color: COPPER },
  heroTitle: { ...heading, fontSize: 60, lineHeight: 64, letterSpacing: -1.8, color: '#FBF6EE' },
  heroTitleNarrow: { fontSize: 38, lineHeight: 43, letterSpacing: -0.9 },
  heroText: { fontSize: 18, lineHeight: 29, color: '#CDBFAE', maxWidth: 560 },
  heroNote: { ...mono, fontSize: 11, color: '#8E7D6B', letterSpacing: 0.4 },
  ctaRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.md, marginTop: spacing.sm },
  ctaPrimary: { backgroundColor: COPPER, paddingVertical: 15, paddingHorizontal: 24, borderRadius: radius.md },
  ctaPrimaryText: { fontSize: fontSize.md, fontWeight: '800', color: INK },
  ctaGhost: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 14, paddingHorizontal: 20, borderRadius: radius.md, borderWidth: 1, borderColor: 'rgba(232,220,203,0.35)' },
  ctaGhostText: { fontSize: fontSize.md, fontWeight: '700', color: SAND },
  sealWrap: { alignItems: 'center', gap: spacing.lg },
  sealCaption: { ...mono, fontSize: 10.5, lineHeight: 16, color: '#8E7D6B', textAlign: 'center', maxWidth: 260 },
  sealWord: { fontFamily: BRAND_DISPLAY_FONT, color: SAND, letterSpacing: 4 },
  heroStrip: { borderTopWidth: 1, borderTopColor: 'rgba(232,220,203,0.12)' },
  stripInner: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, paddingVertical: 20 },
  stripItem: { ...mono, fontSize: 11.5, letterSpacing: 1.2, textTransform: 'uppercase', color: '#BFAF9C' },

  eyebrow: { ...mono, fontSize: 11, letterSpacing: 1.8, textTransform: 'uppercase', color: colors.primary },
  h2: { ...heading, fontSize: 38, lineHeight: 44, letterSpacing: -0.9, color: colors.text },
  lead: { fontSize: 18, lineHeight: 30, color: '#4E4034' },
  body: { fontSize: fontSize.md, lineHeight: 24, color: colors.textMuted },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: spacing.xl },
  pillar: { gap: spacing.sm, paddingTop: spacing.lg, borderTopWidth: 1, borderTopColor: colors.text },
  pillarNum: { ...mono, fontSize: 12, color: colors.primary },
  pillarTitle: { fontSize: fontSize.lg, fontWeight: '800', color: colors.text },

  band: { backgroundColor: INK, paddingVertical: 96 },
  profile: { gap: 8, padding: spacing.xl, borderWidth: 1, borderColor: 'rgba(232,220,203,0.14)', borderRadius: radius.lg, backgroundColor: 'rgba(255,255,255,0.02)' },
  profileTitle: { fontSize: fontSize.lg, fontWeight: '800', color: '#FBF6EE' },

  stepHead: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs },
  stepDot: { width: 36, height: 36, borderRadius: 18, borderWidth: 1.5, borderColor: colors.primary, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface },
  stepDotText: { ...mono, fontSize: 13, fontWeight: '700', color: colors.primary },
  stepLine: { flex: 1, height: 1, backgroundColor: colors.border, marginLeft: spacing.md },

  wall: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 12 },
  tile: { minHeight: 168, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.lg, gap: 6, justifyContent: 'center' },
  tileHover: { borderColor: colors.primary },
  tileLogo: { height: 72, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  tileName: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text, textAlign: 'center' },
  tileTag: { fontSize: fontSize.xs, lineHeight: 16, color: colors.textMuted, textAlign: 'center' },
  tileEmpty: { borderStyle: 'dashed', backgroundColor: 'transparent', alignItems: 'center', justifyContent: 'center', display: 'flex' as any },
  tileEmptyTitle: { fontSize: fontSize.sm, fontWeight: '800', color: colors.text },

  faq: { borderTopWidth: 1, borderTopColor: colors.text },
  faqItem: { borderBottomWidth: 1, borderBottomColor: colors.border },
  faqQRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md, paddingVertical: spacing.lg },
  faqQ: { flex: 1, fontSize: fontSize.lg, fontWeight: '700', color: colors.text },
  faqA: { fontSize: fontSize.md, lineHeight: 25, color: colors.textMuted, paddingBottom: spacing.lg, maxWidth: 720 },

  final: { backgroundColor: INK, borderRadius: 16, padding: 32, gap: spacing.xl },
  finalWide: { flexDirection: 'row', alignItems: 'center', padding: 56, gap: 56 },
  finalTitle: { ...heading, fontSize: 34, lineHeight: 40, letterSpacing: -0.6, color: '#FBF6EE' },
  finalMail: { ...mono, fontSize: 13, color: COPPER, marginTop: spacing.xs },
});
