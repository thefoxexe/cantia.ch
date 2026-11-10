import { useEffect, useState } from 'react';
import { Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Head from 'expo-router/head';
import { Link } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { PartnersNav, PartnersPage, useIsWide } from './PartnersChrome';
import { usePartnersCopy } from '../../lib/partners/locale';
import { CONTACT_EMAIL, LANDING_COPY, type LandingCopy } from '../../lib/partners/landingCopy';
import { getShowcase, partnerLogoUrl, type ShowcaseEntry } from '../../lib/partners/api';
import { Btn, Eyebrow, Headline, Hover, Micro, Wrap } from '../site/Primitives';
import { paperShadow } from '../site/Sections';
import { FaqItem } from '../site/FamilyPage';
import { sans, serif, site } from '../../lib/siteTheme';

// partners.cantia.ch landing in the November 2026 identity: a long-term
// business partnership. The hero shows the written framework of a
// partnership (as consigned in the partner space); then three ways of
// working together, Cantia's commitments, where the programme stands, the
// terms (no universal commission rate: conditions are set with each
// partner), the steps and the partners' logos once there are some.

const ORIGIN = 'https://partners.cantia.ch';

function mail() {
  Linking.openURL(`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Cantia Partners')}`);
}

// "Un partenariat\nsur la durée." → plain first line, serif accent after.
function split(title: string): [string, string | undefined] {
  const [first, ...rest] = title.split('\n');
  return [first, rest.length ? rest.join(' ') : undefined];
}

function Section({ white, children, id }: { white?: boolean; children: React.ReactNode; id?: string }) {
  const wide = useIsWide(760);
  return (
    <View nativeID={id} style={{ paddingVertical: wide ? 86 : 53, backgroundColor: white ? site.white : site.bg }}>
      <Wrap>{children}</Wrap>
    </View>
  );
}

function Head2({ eyebrow, title, text }: { eyebrow: string; title: string; text?: string }) {
  const wide = useIsWide(760);
  const [plain, accent] = split(title);
  return (
    <View style={[styles.sectionHead, !wide && { flexDirection: 'column', alignItems: 'flex-start', gap: 17 }]}>
      <View style={{ flexShrink: 1 }}>
        <Eyebrow>{eyebrow}</Eyebrow>
        <Headline plain={plain} accent={accent} size={wide ? 42 : 32} style={{ marginTop: 15 }} />
      </View>
      {text ? <Text style={[sans, styles.sectionText, !wide && { maxWidth: '100%' }]}>{text}</Text> : null}
    </View>
  );
}

export function PartnersLanding() {
  const { locale } = usePartnersCopy();
  const c = LANDING_COPY[locale];
  const wide = useIsWide(900);
  const phone = !useIsWide(760);
  const prefix = locale === 'fr' ? '' : `/${locale}`;
  const [wall, setWall] = useState<ShowcaseEntry[]>([]);
  const [heroPlain, heroAccent] = split(c.hero.title);

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
      <View style={{ paddingTop: phone ? 40 : 64, paddingBottom: 10 }}>
        <Wrap>
          <View style={[styles.heroGrid, !wide && { flexDirection: 'column', gap: 30 }]}>
            <View style={wide ? { flex: 1, minWidth: 0 } : undefined}>
              <Eyebrow>{c.hero.eyebrow}</Eyebrow>
              <Headline level={1} plain={heroPlain} accent={heroAccent} size={phone ? 43 : wide ? 60 : 48} style={{ marginTop: 20, marginBottom: 22, fontWeight: '400', letterSpacing: phone ? -1.9 : -2.8 }} />
              <Text style={[sans, styles.lead, phone && { fontSize: 13, lineHeight: 24 }]}>{c.hero.text}</Text>
              <View style={styles.actions}>
                <View>
                  <Btn label={c.hero.cta} href="/connexion?mode=signup" small={phone} />
                </View>
                <Hover onPress={mail} accessibilityRole="link" base={styles.textLink} hover={{ opacity: 0.75 }}>
                  <Text style={[sans, styles.textLinkText]}>{c.hero.secondary}</Text>
                  <Feather name="arrow-up-right" size={14} color={site.ink} />
                </Hover>
              </View>
              <Micro>{c.hero.note}</Micro>
            </View>
            <View style={wide ? { flex: 1.05, minWidth: 0 } : undefined}>
              <CharterCard t={c.charter} />
            </View>
          </View>
          <View style={[styles.trust, phone && { flexDirection: 'column', alignItems: 'flex-start', gap: 10 }]}>
            {c.terms.facts.map((f) => (
              <View key={f} style={styles.trustItem}>
                <Feather name="check" size={13} color={site.copper} />
                <Text style={[sans, styles.trustText]}>{f}</Text>
              </View>
            ))}
          </View>
        </Wrap>
      </View>

      {/* Three ways of working together */}
      <Section white>
        <Head2 eyebrow={c.kinds.eyebrow} title={c.kinds.title} text={c.kinds.text} />
        <View style={[styles.grid, phone && { flexDirection: 'column', gap: 20 }]}>
          {c.kinds.items.map((k, i) => (
            <View key={k.name} style={[styles.card, !phone && { flex: 1 }]}>
              <Text style={[serif, styles.index]}>{String(i + 1).padStart(2, '0')}</Text>
              <Text style={[sans, styles.cardTitle]}>{k.name}</Text>
              <Text style={[sans, styles.who]}>{k.who.toUpperCase()}</Text>
              <Text style={[sans, styles.label]}>{c.kinds.you}</Text>
              <Text style={[sans, styles.cardText]}>{k.you}</Text>
              <Text style={[sans, styles.label]}>{c.kinds.us}</Text>
              <Text style={[sans, styles.cardText]}>{k.us}</Text>
            </View>
          ))}
        </View>
      </Section>

      {/* Commitments */}
      <Section>
        <View style={[styles.split, !wide && { flexDirection: 'column', gap: 29, alignItems: 'stretch' }]}>
          <View style={wide ? { flex: 0.8 } : undefined}>
            <Eyebrow>{c.commitments.eyebrow}</Eyebrow>
            <Headline plain={c.commitments.title} size={phone ? 32 : 42} style={{ marginTop: 15 }} />
          </View>
          <View style={[wide ? { flex: 1.2 } : undefined, { gap: 0 }]}>
            {c.commitments.items.map((it, i) => (
              <View key={it.title} style={[styles.promise, i === c.commitments.items.length - 1 && { borderBottomWidth: 1 }]}>
                <Text style={[serif, styles.promiseNum]}>{String(i + 1).padStart(2, '0')}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[sans, styles.promiseTitle]}>{it.title}</Text>
                  <Text style={[sans, styles.cardText]}>{it.text}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </Section>

      {/* Where the programme stands, and the terms */}
      <Section white>
        <Head2 eyebrow={c.honest.eyebrow} title={c.honest.title} text={c.honest.text} />
        <View style={[styles.grid, phone && { flexDirection: 'column', gap: 12 }]}>
          {c.honest.facts.map((f) => (
            <View key={f.k} style={[styles.fact, !phone && { flex: 1 }]}>
              <Text style={[sans, styles.factK]}>{f.k.toUpperCase()}</Text>
              <Text style={[sans, styles.factV]}>{f.v}</Text>
            </View>
          ))}
        </View>
        <View style={[styles.terms, phone && { padding: 25 }]}>
          <Eyebrow>{c.terms.eyebrow}</Eyebrow>
          <Text style={[sans, styles.termsTitle]}>{c.terms.title}</Text>
          <Text style={[sans, styles.cardText, { maxWidth: 680 }]}>{c.terms.text}</Text>
        </View>
      </Section>

      {/* Steps and products */}
      <Section>
        <Head2 eyebrow={c.process.eyebrow} title={c.process.title} />
        <View style={[styles.grid, phone && { flexDirection: 'column', gap: 10 }]}>
          {c.process.items.map((s, i) => (
            <View key={s.title} style={[styles.step, !phone && { flex: 1 }]}>
              <Text style={[serif, styles.stepNum]}>{String(i + 1).padStart(2, '0')}</Text>
              <Text style={[sans, styles.stepTitle]}>{s.title}</Text>
              <Text style={[sans, styles.cardText]}>{s.text}</Text>
            </View>
          ))}
        </View>
        <View style={{ marginTop: 60 }}>
          <Eyebrow>{c.products.eyebrow}</Eyebrow>
          <Headline plain={c.products.title} size={phone ? 26 : 30} style={{ marginTop: 15, marginBottom: 24 }} />
          <View style={[styles.grid, phone && { flexDirection: 'column', gap: 12 }]}>
            {c.products.items.map((p, i) => (
              <Link key={p.name} href={(i === 0 ? `https://cantia.ch${prefix || '/'}` : `https://accounting.cantia.ch${prefix}`) as any} asChild>
                <Hover accessibilityRole="link" base={[styles.product, !phone && { flex: 1 }]} hover={{ borderColor: site.copper }}>
                  <Text style={[sans, styles.who]}>{p.who.toUpperCase()}</Text>
                  <Text style={[sans, styles.cardTitle, { marginTop: 8 }]}>{p.name}</Text>
                  <Text style={[sans, styles.cardText]}>{p.text}</Text>
                  <View style={{ gap: 6, marginTop: 14 }}>
                    {p.points.map((pt) => (
                      <View key={pt} style={{ flexDirection: 'row', gap: 10 }}>
                        <Feather name="check" size={13} color={site.copper} style={{ marginTop: 3 }} />
                        <Text style={[sans, styles.cardText, { flex: 1 }]}>{pt}</Text>
                      </View>
                    ))}
                  </View>
                </Hover>
              </Link>
            ))}
          </View>
        </View>
      </Section>

      {wall.length ? (
        <Section white id="partenaires">
          <Head2 eyebrow={c.wall.eyebrow} title={c.wall.title} />
          <View style={styles.wall}>
            {wall.map((p) => (
              <Hover
                key={p.logo_path}
                onPress={() => p.website && Linking.openURL(p.website.startsWith('http') ? p.website : `https://${p.website}`)}
                base={[styles.tile, { width: wide ? '23.5%' : '47%' } as any]}
                hover={p.website ? { borderColor: site.copper } : undefined}
                accessibilityRole={p.website ? 'link' : undefined}
                accessibilityLabel={p.name}
              >
                <View style={styles.tileLogo}>
                  {Platform.OS === 'web' ? (
                    // eslint-disable-next-line jsx-a11y/alt-text
                    <img src={partnerLogoUrl(p.logo_path)} alt={p.name} loading="lazy" style={{ maxWidth: '78%', maxHeight: 64, objectFit: 'contain' }} />
                  ) : null}
                </View>
                <Text style={[sans, styles.tileName]} numberOfLines={1}>
                  {p.name}
                </Text>
              </Hover>
            ))}
          </View>
        </Section>
      ) : null}

      <Section>
        <View style={styles.faq}>
          <Eyebrow>{c.faq.eyebrow}</Eyebrow>
          <Headline plain={c.faq.title} size={phone ? 32 : 42} style={{ marginTop: 15, marginBottom: 30 }} />
          {c.faq.items.map((q, i) => (
            <FaqItem key={q.q} q={q.q} a={q.a} last={i === c.faq.items.length - 1} />
          ))}
        </View>
      </Section>

      <View style={[styles.cta, { paddingVertical: phone ? 38 : 54 }]}>
        <Wrap style={wide ? styles.ctaRow : undefined}>
          <View style={wide ? { flex: 1 } : undefined}>
            <Headline plain={c.final.title} size={phone ? 32 : 36} color="#f4f3e9" />
            <Text style={[sans, { fontSize: 12, color: '#b2b9a7', marginTop: 15, maxWidth: 520, lineHeight: 20 }]}>{c.final.text}</Text>
          </View>
          <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 22, flexWrap: 'wrap' }, !wide && { marginTop: 20 }]}>
            <View>
              <Btn label={c.final.cta} href="/connexion?mode=signup" tone="sand" />
            </View>
            <Hover onPress={mail} accessibilityRole="link" base={styles.textLink} hover={{ opacity: 0.75 }}>
              <Text style={[sans, styles.textLinkText, { color: '#f4f3e9' }]}>{c.final.write}</Text>
              <Feather name="arrow-up-right" size={14} color="#f4f3e9" />
            </Hover>
          </View>
        </Wrap>
      </View>
    </PartnersPage>
  );
}

// The written framework of a partnership, as it is consigned in the partner
// space (sample partner).
function CharterCard({ t }: { t: LandingCopy['charter'] }) {
  const phone = !useIsWide(760);
  return (
    <View style={[styles.scene, { padding: phone ? 18 : 30 }]}>
      <View style={[styles.charter, paperShadow, phone && { padding: 20 }]}>
        <View style={styles.charterHead}>
          <Text style={[sans, styles.charterTag]}>{t.title.toUpperCase()}</Text>
          <Text style={[sans, styles.pill]}>{t.example}</Text>
        </View>
        <Text style={[sans, styles.charterName]}>{t.partner}</Text>
        <Text style={[sans, styles.charterMeta]}>{t.partnerMeta}</Text>
        {t.rows.map((r) => (
          <View key={r.k} style={styles.charterRow}>
            <Text style={[sans, styles.charterK]}>{r.k}</Text>
            <View style={{ flex: 1.4, gap: 3 }}>
              {r.v.map((v) => (
                <Text key={v} style={[sans, styles.charterV]}>
                  {v}
                </Text>
              ))}
            </View>
          </View>
        ))}
        <Text style={[sans, styles.charterStatus]}>{t.status.toUpperCase()}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  heroGrid: { flexDirection: 'row', alignItems: 'center', gap: 60 },
  lead: { fontSize: 15, color: site.muted, lineHeight: 28, maxWidth: 560 },
  actions: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 25, marginTop: 26 },
  textLink: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  textLinkText: { fontSize: 12, fontWeight: '600', color: site.ink },
  trust: { flexDirection: 'row', justifyContent: 'center', gap: 45, paddingVertical: 28 },
  trustItem: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  trustText: { fontSize: 10, color: '#7a7d72' },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', gap: 60, marginBottom: 35 },
  sectionText: { fontSize: 13, maxWidth: 380, color: site.muted, lineHeight: 23 },
  grid: { flexDirection: 'row', gap: 24 },
  card: { borderTopWidth: 1, borderTopColor: site.line, paddingTop: 22 },
  index: { fontSize: 28, color: site.copper },
  cardTitle: { fontSize: 19, color: site.ink, letterSpacing: -0.3, marginTop: 12 },
  who: { fontSize: 9, letterSpacing: 1, color: '#8b9380', marginTop: 6 },
  label: { fontSize: 10, fontWeight: '600', color: site.ink, marginTop: 16, marginBottom: 4 },
  cardText: { fontSize: 12, color: site.muted, lineHeight: 21 },
  split: { flexDirection: 'row', alignItems: 'flex-start', gap: 75 },
  promise: { flexDirection: 'row', gap: 18, paddingVertical: 20, borderTopWidth: 1, borderColor: site.line },
  promiseNum: { fontSize: 22, color: site.copper, width: 34 },
  promiseTitle: { fontSize: 16, fontWeight: '500', color: site.ink, marginBottom: 6 },
  fact: { padding: 20, borderWidth: 1, borderColor: site.line, borderRadius: 8, backgroundColor: site.bg },
  factK: { fontSize: 9, letterSpacing: 1, color: '#8b9380' },
  factV: { fontSize: 14, color: site.ink, marginTop: 8 },
  terms: { marginTop: 30, padding: 34, borderRadius: 10, backgroundColor: '#ebe7db', borderWidth: 1, borderColor: '#ded9cb' },
  termsTitle: { fontSize: 22, color: site.ink, letterSpacing: -0.6, marginTop: 12, marginBottom: 12 },
  step: { borderTopWidth: 1, borderTopColor: site.line, paddingVertical: 22 },
  stepNum: { fontSize: 30, color: site.copper },
  stepTitle: { fontSize: 17, fontWeight: '500', color: site.ink, marginTop: 10, marginBottom: 8 },
  product: { padding: 26, borderWidth: 1, borderColor: site.line, borderRadius: 10, backgroundColor: site.white },
  wall: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  tile: { borderWidth: 1, borderColor: site.line, borderRadius: 8, backgroundColor: site.white, padding: 16, alignItems: 'center', gap: 10 },
  tileLogo: { height: 80, width: '100%', alignItems: 'center', justifyContent: 'center' },
  tileName: { fontSize: 11, color: site.muted },
  faq: { maxWidth: 820, width: '100%', marginHorizontal: 'auto' },
  cta: { backgroundColor: site.dark },
  ctaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 40 },
  scene: { backgroundColor: '#e7e4d8', borderRadius: 12 },
  charter: { backgroundColor: '#ffffff', borderRadius: 6, borderWidth: 1, borderColor: '#deded3', padding: 26 },
  charterHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  charterTag: { fontSize: 8, letterSpacing: 1, color: site.copper, fontWeight: '600' },
  pill: { fontSize: 8, color: '#7a8969', backgroundColor: '#edf2e6', paddingVertical: 4, paddingHorizontal: 7, borderRadius: 3 },
  charterName: { fontSize: 22, color: site.ink, letterSpacing: -0.6, marginTop: 22 },
  charterMeta: { fontSize: 10, color: '#9da18e', marginTop: 3, marginBottom: 10 },
  charterRow: { flexDirection: 'row', gap: 14, borderTopWidth: 1, borderTopColor: '#eceee5', paddingVertical: 10 },
  charterK: { flex: 1, fontSize: 10, color: site.muted },
  charterV: { fontSize: 10, color: site.ink },
  charterStatus: { fontSize: 7, letterSpacing: 0.4, color: '#a0a28f', borderTopWidth: 1, borderTopColor: '#e8ebde', paddingTop: 14, marginTop: 4 },
});
