import { useEffect, useState } from 'react';
import { Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Head from 'expo-router/head';
import { Link } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { PAGE_MAX, PartnersNav, PartnersPage, useIsWide } from './PartnersChrome';
import { usePartnersCopy } from '../../lib/partners/locale';
import { CONTACT_EMAIL, LANDING_COPY, type LandingCopy } from '../../lib/partners/landingCopy';
import { getShowcase, partnerLogoUrl, type ShowcaseEntry } from '../../lib/partners/api';
import { BrandMark } from '../brand/Logo';
import { colors, fontSize, radius, spacing } from '../../lib/theme';

// partners.cantia.ch landing (October 2026): a long-term business
// partnership, in the colours of the app. The hero shows the written
// framework of a partnership (as consigned in the partner space); the page
// then presents three ways of working together, Cantia's commitments, where
// the programme stands and, plainly, the terms. No affiliation vocabulary.
// Approved partners' logos appear only once there are some.

const ORIGIN = 'https://partners.cantia.ch';
const LINE = '#EDE3D3';
const SOFT = '#FBF7F0';

const heading = { fontFamily: 'Archivo, system-ui, sans-serif', fontWeight: '800' as const };
const mono = { fontFamily: '"Martian Mono", ui-monospace, Menlo, monospace' };

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
          <View style={[{ gap: spacing.lg }, wide && { flex: 1 }]}>
            <Text style={styles.eyebrow}>{c.hero.eyebrow}</Text>
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
                <Feather name="arrow-up-right" size={16} color={colors.text} />
              </Pressable>
            </View>
            <Text style={styles.heroNote}>{c.hero.note}</Text>
          </View>
          <View style={wide ? { flex: 1.08 } : null}>
            <CharterMock t={c.charter} />
          </View>
        </View>
      </View>

      {/* Three ways of working together */}
      <View style={[styles.inner, styles.section]}>
        <Text style={styles.eyebrow}>{c.kinds.eyebrow}</Text>
        <Text style={[styles.h2, { maxWidth: 760 }]} role="heading" aria-level={2}>
          {c.kinds.title}
        </Text>
        <Text style={[styles.lead, { maxWidth: 640 }]}>{c.kinds.text}</Text>
        <View style={[{ gap: spacing.md, marginTop: spacing.xl }, wide && { flexDirection: 'row' }]}>
          {c.kinds.items.map((k, i) => (
            <View key={k.name} style={[styles.kind, wide && { flex: 1 }]}>
              <View style={styles.kindHead}>
                <Text style={styles.kindNum}>{String(i + 1).padStart(2, '0')}</Text>
                <Text style={styles.kindName}>{k.name}</Text>
              </View>
              <Text style={styles.kindWho}>{k.who}</Text>
              <View style={styles.kindBlock}>
                <Text style={styles.kindLabel}>{c.kinds.you}</Text>
                <Text style={styles.kindText}>{k.you}</Text>
              </View>
              <View style={[styles.kindBlock, styles.kindBlockUs]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <BrandMark size={14} />
                  <Text style={styles.kindLabel}>{c.kinds.us}</Text>
                </View>
                <Text style={styles.kindText}>{k.us}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* What the partnership brings */}
      <View style={[styles.inner, styles.section]}>
        <Text style={styles.eyebrow}>{c.commitments.eyebrow}</Text>
        <Text style={[styles.h2, { maxWidth: 720 }]} role="heading" aria-level={2}>
          {c.commitments.title}
        </Text>
        <View style={[styles.grid, { marginTop: spacing.xl }]}>
          {c.commitments.items.map((p, i) => (
            <View key={p.title} style={[styles.pillar, wide ? { width: '23.5%' as any } : { width: '100%' }]}>
              <View style={styles.pillarIcon}>
                <Feather name={PILLAR_ICONS[i]} size={18} color={colors.primary} />
              </View>
              <Text style={styles.pillarTitle}>{p.title}</Text>
              <Text style={styles.body}>{p.text}</Text>
            </View>
          ))}
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
                <BrandMark size={30} />
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.productName}>{p.name}</Text>
                  <Text style={styles.productWho}>{p.who}</Text>
                </View>
              </View>
              <Text style={styles.productText}>{p.text}</Text>
              <View style={{ gap: 10 }}>
                {p.points.map((pt) => (
                  <View key={pt} style={styles.point}>
                    <Feather name="check" size={15} color={colors.primary} />
                    <Text style={styles.pointText}>{pt}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
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

      {/* Terms, said plainly */}
      <View style={[styles.inner, styles.section]}>
        <View style={[styles.money, wide && styles.moneyWide]}>
          <View style={[{ gap: spacing.sm }, wide && { flex: 1.2 }]}>
            <Text style={styles.eyebrow}>{c.terms.eyebrow}</Text>
            <Text style={styles.h3}>{c.terms.title}</Text>
            <Text style={styles.body}>{c.terms.text}</Text>
          </View>
          <View style={[{ gap: 12 }, wide && { flex: 1 }]}>
            {c.terms.facts.map((f) => (
              <View key={f} style={styles.point}>
                <Feather name="check-circle" size={16} color={colors.success} />
                <Text style={styles.pointText}>{f}</Text>
              </View>
            ))}
          </View>
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
            <Text style={[styles.body, { maxWidth: 520 }]}>{c.final.text}</Text>
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
              <Feather name="arrow-up-right" size={16} color={colors.text} />
            </Pressable>
          </View>
        </View>
      </View>
    </PartnersPage>
  );
}

const PILLAR_ICONS: (keyof typeof Feather.glyphMap)[] = ['message-circle', 'monitor', 'trending-up', 'shield'];

// The written framework of a partnership, as consigned in the partner
// space (example). Decorative: the same facts are written out on the page.
function CharterMock({ t }: { t: LandingCopy['charter'] }) {
  return (
    <View style={styles.charter} aria-hidden>
      <View style={styles.charterHead}>
        <View style={styles.marks}>
          <View style={styles.markCantia}>
            <BrandMark size={22} />
          </View>
          <Text style={styles.times}>×</Text>
          <View style={styles.markPartner}>
            <Text style={styles.markPartnerText}>R</Text>
          </View>
        </View>
        <Text style={styles.example}>{t.example}</Text>
      </View>
      <View style={{ gap: 2 }}>
        <Text style={styles.charterTitle}>{t.title}</Text>
        <Text style={styles.charterParty}>
          {t.partner} <Text style={{ color: colors.textMuted, fontWeight: '500' }}>· {t.partnerMeta}</Text>
        </Text>
      </View>
      <View>
        {t.rows.map((r) => (
          <View key={r.k} style={styles.charterRow}>
            <Text style={styles.charterK}>{r.k}</Text>
            <View style={{ flex: 1, minWidth: 0, gap: 5 }}>
              {r.v.map((v) => (
                <View key={v} style={styles.charterV}>
                  {r.v.length > 1 ? <Feather name="check" size={13} color={colors.primary} style={{ marginTop: 2 }} /> : null}
                  <Text style={styles.charterVText}>{v}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>
      <View style={styles.charterFoot}>
        <View style={styles.statusDot} />
        <Text style={styles.charterStatus}>{t.status}</Text>
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

  hero: { backgroundColor: colors.bg, borderBottomWidth: 1, borderBottomColor: colors.border },
  heroInner: { paddingTop: 56, paddingBottom: 64, gap: 48 },
  heroInnerWide: { flexDirection: 'row', alignItems: 'center', paddingTop: 88, paddingBottom: 96, gap: 64 },
  eyebrow: { ...mono, fontSize: 11.5, letterSpacing: 1.8, textTransform: 'uppercase', color: colors.primary },
  heroTitle: { ...heading, fontSize: 54, lineHeight: 59, letterSpacing: -1.6, color: colors.text },
  heroTitleNarrow: { fontSize: 37, lineHeight: 42, letterSpacing: -0.9 },
  heroText: { fontSize: 18, lineHeight: 29, color: '#4E4034', maxWidth: 560 },
  heroNote: { ...mono, fontSize: 11, color: colors.textMuted, letterSpacing: 0.4 },
  ctaRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.md, marginTop: spacing.sm },
  ctaPrimary: { backgroundColor: colors.primary, paddingVertical: 15, paddingHorizontal: 24, borderRadius: radius.md },
  ctaPrimaryText: { fontSize: fontSize.md, fontWeight: '800', color: '#FFFFFF' },
  ctaGhost: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 14, paddingHorizontal: 20, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  ctaGhostText: { fontSize: fontSize.md, fontWeight: '700', color: colors.text },

  charter: { backgroundColor: colors.surface, borderWidth: 1, borderColor: '#E3D6C1', borderRadius: 14, padding: 24, gap: 18, shadowColor: '#2B211A', shadowOpacity: 0.1, shadowRadius: 40, shadowOffset: { width: 0, height: 20 } },
  charterHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  marks: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  markCantia: { width: 40, height: 40, borderRadius: 10, borderWidth: 1, borderColor: LINE, backgroundColor: SOFT, alignItems: 'center', justifyContent: 'center' },
  times: { fontSize: 16, color: colors.textMuted },
  markPartner: { width: 40, height: 40, borderRadius: 10, backgroundColor: colors.text, alignItems: 'center', justifyContent: 'center' },
  markPartnerText: { color: '#FFFFFF', fontWeight: '800', fontSize: 16 },
  example: { fontSize: 10, fontWeight: '700', color: colors.textMuted, letterSpacing: 0.4, textTransform: 'uppercase', borderWidth: 1, borderColor: LINE, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2, backgroundColor: SOFT },
  charterTitle: { ...mono, fontSize: 11, letterSpacing: 1.6, textTransform: 'uppercase', color: colors.primary },
  charterParty: { fontSize: 20, fontWeight: '800', color: colors.text, letterSpacing: -0.3 },
  charterRow: { flexDirection: 'row', gap: 16, paddingVertical: 12, borderTopWidth: 1, borderTopColor: LINE },
  charterK: { width: 128, fontSize: 12, fontWeight: '700', color: colors.textMuted, lineHeight: 18 },
  charterV: { flexDirection: 'row', alignItems: 'flex-start', gap: 7 },
  charterVText: { flex: 1, fontSize: 13.5, lineHeight: 19, color: colors.text },
  charterFoot: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: LINE },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.success },
  charterStatus: { fontSize: 12.5, fontWeight: '700', color: colors.success },

  kind: { padding: 24, gap: 14, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  kindHead: { flexDirection: 'row', alignItems: 'baseline', gap: 10 },
  kindNum: { ...mono, fontSize: 12, color: colors.primary },
  kindName: { ...heading, fontSize: 24, color: colors.text },
  kindWho: { ...mono, fontSize: 10.5, letterSpacing: 1.1, textTransform: 'uppercase', color: colors.textMuted, marginTop: -6 },
  kindBlock: { gap: 6, paddingTop: 12, borderTopWidth: 1, borderTopColor: LINE },
  kindBlockUs: { backgroundColor: SOFT, borderTopWidth: 0, borderRadius: 10, padding: 12 },
  kindLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 0.4, textTransform: 'uppercase', color: colors.textMuted },
  kindText: { fontSize: 14.5, lineHeight: 21, color: colors.text },

  h2: { ...heading, fontSize: 38, lineHeight: 44, letterSpacing: -0.9, color: colors.text },
  h3: { ...heading, fontSize: 26, lineHeight: 32, letterSpacing: -0.4, color: colors.text },
  lead: { fontSize: 18, lineHeight: 30, color: '#4E4034' },
  body: { fontSize: fontSize.md, lineHeight: 24, color: colors.textMuted },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: spacing.xl },


  pillar: { gap: spacing.sm, padding: 20, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  pillarIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  pillarTitle: { fontSize: fontSize.lg, fontWeight: '800', color: colors.text },

  facts: { borderTopWidth: 1, borderTopColor: colors.text },
  fact: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: spacing.md, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border, flexWrap: 'wrap' },
  factK: { ...mono, fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase', color: colors.textMuted },
  factV: { fontSize: fontSize.md, fontWeight: '700', color: colors.text, textAlign: 'right', flexShrink: 1 },

  product: { padding: 28, gap: 18, borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  productAlt: { backgroundColor: colors.surfaceAlt, borderColor: '#E3D2B8' },
  productHead: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  productName: { ...heading, fontSize: 24, lineHeight: 28, color: colors.text },
  productWho: { ...mono, fontSize: 10.5, letterSpacing: 1.2, textTransform: 'uppercase', color: colors.primary, marginTop: 3 },
  productText: { fontSize: 16, lineHeight: 25, color: colors.textMuted },
  point: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  pointText: { flex: 1, fontSize: 15, lineHeight: 21, color: colors.text },


  stepHead: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs },
  stepDot: { width: 36, height: 36, borderRadius: 18, borderWidth: 1.5, borderColor: colors.primary, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface },
  stepDotText: { ...mono, fontSize: 13, fontWeight: '700', color: colors.primary },
  stepLine: { flex: 1, height: 1, backgroundColor: colors.border, marginLeft: spacing.md },

  money: { padding: 28, gap: spacing.xl, borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  moneyWide: { flexDirection: 'row', alignItems: 'center', padding: 40, gap: 56 },

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

  final: { backgroundColor: colors.primarySoft, borderRadius: 16, padding: 32, gap: spacing.xl, borderWidth: 1, borderColor: '#EBC9AE' },
  finalWide: { flexDirection: 'row', alignItems: 'center', padding: 56, gap: 56 },
  finalTitle: { ...heading, fontSize: 34, lineHeight: 40, letterSpacing: -0.6, color: colors.text },
  finalMail: { ...mono, fontSize: 13, color: colors.primary, marginTop: spacing.xs },
});
