import { useEffect, useState } from 'react';
import { Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Head from 'expo-router/head';
import { Link } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { PAGE_MAX, PartnersNav, PartnersPage, useIsWide } from './PartnersChrome';
import { usePartnersCopy } from '../../lib/partners/locale';
import { CONTACT_EMAIL, LANDING_COPY, type LandingCopy } from '../../lib/partners/landingCopy';
import { getShowcase, partnerLogoUrl, type ShowcaseEntry } from '../../lib/partners/api';
import { QrCode } from './QrCode';
import { BrandMark } from '../brand/Logo';
import { colors, fontSize, radius, spacing } from '../../lib/theme';

// partners.cantia.ch landing (October 2026): a recommendation programme for
// fiduciaries, resellers, suppliers and consultants, said plainly. It is
// starting: no label, no "official partner", no empty logo wall. The hero
// shows how one recommendation is followed, with the real rules; approved
// partners' logos appear only once there are some. No public commission
// rate: terms are agreed with each partner.

const ORIGIN = 'https://partners.cantia.ch';
const INK = '#120E0B';
const SAND = '#E8DCCB';
const COPPER = '#D9895A';
const COPPER_DEEP = '#A95C30';
const PAPER = '#FBF6EE';

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
          <View style={[{ gap: spacing.lg }, wide && { flex: 1.15 }]}>
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
          <View style={wide ? { flex: 1 } : null}>
            <Trace t={c.trace} />
          </View>
        </View>
      </View>

      {/* Where we are, said plainly */}
      <View style={[styles.inner, styles.section, wide && styles.split]}>
        <View style={[{ gap: spacing.md }, wide && { flex: 1 }]}>
          <Text style={styles.eyebrow}>{c.honest.eyebrow}</Text>
          <Text style={styles.h2} role="heading" aria-level={2}>
            {c.honest.title}
          </Text>
        </View>
        <View style={[{ gap: spacing.xl }, wide && { flex: 1, paddingTop: 30 }]}>
          <Text style={styles.lead}>{c.honest.text}</Text>
          <View style={styles.facts}>
            {c.honest.facts.map((f) => (
              <View key={f.k} style={styles.fact}>
                <Text style={styles.factK}>{f.k}</Text>
                <Text style={styles.factV}>{f.v}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* What partners recommend */}
      <View style={[styles.inner, styles.section]}>
        <Text style={styles.eyebrow}>{c.products.eyebrow}</Text>
        <Text style={styles.h2} role="heading" aria-level={2}>
          {c.products.title}
        </Text>
        <View style={[{ gap: spacing.md, marginTop: spacing.lg }, wide && { flexDirection: 'row' }]}>
          {c.products.items.map((p, i) => (
            <View key={p.name} style={[styles.product, i === 1 && styles.productAlt, wide && { flex: 1 }]}>
              <View style={styles.productHead}>
                <BrandMark size={30} tone={i === 1 ? 'white' : 'color'} />
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={[styles.productName, i === 1 && { color: '#FBF6EE' }]}>{p.name}</Text>
                  <Text style={[styles.productWho, i === 1 && { color: COPPER }]}>{p.who}</Text>
                </View>
              </View>
              <Text style={[styles.productText, i === 1 && { color: '#CDBFAE' }]}>{p.text}</Text>
              <View style={{ gap: 10 }}>
                {p.points.map((pt) => (
                  <View key={pt} style={styles.point}>
                    <Feather name="check" size={15} color={i === 1 ? COPPER : colors.primary} />
                    <Text style={[styles.pointText, i === 1 && { color: '#FBF6EE' }]}>{pt}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>
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
      <View style={[styles.band, { marginTop: 112 }]}>
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

      {/* Partners who chose to appear here: only once there are some. */}
      {wall.length ? (
        <View style={[styles.inner, styles.section]} nativeID="partenaires">
          <Text style={styles.eyebrow}>{c.wall.eyebrow}</Text>
          <Text style={styles.h2} role="heading" aria-level={2}>
            {c.wall.title}
          </Text>
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
          </View>
        </View>
      ) : null}

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

// How one recommendation is followed, step by step, with the real rules of
// the programme (an example, labelled as such). The QR code is drawn by the
// same component as the partner's own one in their space.
function Trace({ t }: { t: LandingCopy['trace'] }) {
  return (
    <View style={styles.trace}>
      <View style={styles.traceHead}>
        <Text style={styles.traceLabel}>{t.label}</Text>
        <Text style={styles.traceChip}>{t.example}</Text>
      </View>
      <View style={styles.linkRow}>
        <View style={styles.qr}>
          <QrCode value="https://cantia.ch" size={76} color={INK} />
        </View>
        <View style={{ flex: 1, minWidth: 0, gap: 4 }}>
          <Text style={styles.linkLabel}>{t.linkLabel}</Text>
          <Text style={styles.linkUrl} numberOfLines={1}>
            cantia.ch/?ref=<Text style={{ color: COPPER_DEEP }}>{t.code}</Text>
          </Text>
        </View>
      </View>
      <View style={{ paddingTop: 6 }}>
        {t.steps.map((st, i) => {
          const last = i === t.steps.length - 1;
          return (
            <View key={st.title} style={styles.tStep}>
              <Text style={styles.tWhen}>{st.when}</Text>
              <View style={styles.tRail}>
                <View style={[styles.tDot, last && styles.tDotLast]} />
                {!last ? <View style={styles.tLine} /> : null}
              </View>
              <View style={[styles.tBody, last && { paddingBottom: 0 }]}>
                <Text style={styles.tTitle}>{st.title}</Text>
                <Text style={styles.tText}>{st.text}</Text>
              </View>
            </View>
          );
        })}
      </View>
      <Text style={styles.traceFoot}>{t.foot}</Text>
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
  heroInnerWide: { flexDirection: 'row', alignItems: 'center', paddingTop: 104, paddingBottom: 112, gap: 72 },
  heroEyebrow: { ...mono, fontSize: 11.5, letterSpacing: 2, textTransform: 'uppercase', color: COPPER },
  heroTitle: { ...heading, fontSize: 54, lineHeight: 59, letterSpacing: -1.6, color: '#FBF6EE' },
  heroTitleNarrow: { fontSize: 38, lineHeight: 43, letterSpacing: -0.9 },
  heroText: { fontSize: 18, lineHeight: 29, color: '#CDBFAE', maxWidth: 560 },
  heroNote: { ...mono, fontSize: 11, color: '#8E7D6B', letterSpacing: 0.4 },
  ctaRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.md, marginTop: spacing.sm },
  ctaPrimary: { backgroundColor: COPPER, paddingVertical: 15, paddingHorizontal: 24, borderRadius: radius.md },
  ctaPrimaryText: { fontSize: fontSize.md, fontWeight: '800', color: INK },
  ctaGhost: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 14, paddingHorizontal: 20, borderRadius: radius.md, borderWidth: 1, borderColor: 'rgba(232,220,203,0.35)' },
  ctaGhostText: { fontSize: fontSize.md, fontWeight: '700', color: SAND },

  trace: { backgroundColor: PAPER, borderRadius: 18, padding: 22, gap: 16, shadowColor: '#000', shadowOpacity: 0.35, shadowRadius: 40, shadowOffset: { width: 0, height: 24 } },
  traceHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  traceLabel: { ...mono, flex: 1, fontSize: 10.5, letterSpacing: 1.4, textTransform: 'uppercase', color: '#6B5A49' },
  traceChip: { ...mono, fontSize: 10, letterSpacing: 0.8, textTransform: 'uppercase', color: COPPER_DEEP, borderWidth: 1, borderColor: 'rgba(169,92,48,0.45)', borderRadius: 999, paddingVertical: 3, paddingHorizontal: 9 },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 12, borderRadius: 12, backgroundColor: '#F1E8DA' },
  qr: { padding: 4, backgroundColor: '#FFFFFF', borderRadius: 8 },
  linkLabel: { fontSize: 12.5, fontWeight: '700', color: '#6B5A49' },
  linkUrl: { ...mono, fontSize: 12.5, color: INK },
  tStep: { flexDirection: 'row', gap: 12 },
  tWhen: { ...mono, width: 50, fontSize: 11, lineHeight: 20, color: '#8E7D6B', textAlign: 'right' },
  tRail: { width: 12, alignItems: 'center' },
  tDot: { width: 11, height: 11, borderRadius: 6, borderWidth: 2, borderColor: INK, backgroundColor: PAPER, marginTop: 5 },
  tDotLast: { backgroundColor: COPPER, borderColor: COPPER },
  tLine: { flex: 1, width: 1.5, backgroundColor: '#D6C8B5', marginVertical: 3 },
  tBody: { flex: 1, minWidth: 0, gap: 2, paddingBottom: 16 },
  tTitle: { fontSize: 14.5, lineHeight: 20, fontWeight: '800', color: INK },
  tText: { fontSize: 13, lineHeight: 19, color: '#5E4E3F' },
  traceFoot: { fontSize: 12, lineHeight: 18, color: '#6B5A49', borderTopWidth: 1, borderTopColor: '#E4D8C6', paddingTop: 12 },

  facts: { borderTopWidth: 1, borderTopColor: colors.text },
  fact: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: spacing.md, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border, flexWrap: 'wrap' },
  factK: { ...mono, fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase', color: colors.textMuted },
  factV: { fontSize: fontSize.md, fontWeight: '700', color: colors.text, textAlign: 'right', flexShrink: 1 },

  product: { padding: 28, gap: 18, borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  productAlt: { backgroundColor: INK, borderColor: INK },
  productHead: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  productName: { ...heading, fontSize: 24, lineHeight: 28, color: colors.text },
  productWho: { ...mono, fontSize: 10.5, letterSpacing: 1.2, textTransform: 'uppercase', color: colors.primary, marginTop: 3 },
  productText: { fontSize: 16, lineHeight: 25, color: colors.textMuted },
  point: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  pointText: { flex: 1, fontSize: 15, lineHeight: 21, color: colors.text },

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
