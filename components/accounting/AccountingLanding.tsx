import { Platform, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Head from 'expo-router/head';
import { Feather } from '@expo/vector-icons';
import { AccNav, AccPage } from './AccountingChrome';
import { useSiteCopy } from '../../lib/accounting/siteCopy';
import { ACC_ZIP, type ZipLocale } from '../../lib/accounting/zipCopy';
import { RealFiles } from './landing/RealFiles';
import { Btn, Eyebrow, Headline, Hover, Micro } from '../site/Primitives';
import { FaqItem } from '../site/FamilyPage';
import { HeroDevices } from '../site/HeroDevices';
import { sans, serif, site } from '../../lib/siteTheme';

// accounting.cantia.ch home (FR at /, DE at /de, IT at /it), laid out as the
// November 2026 design hand-off (accounting.html): hero with the real firm
// workspace, six uses, with or without Cantia, formats, free space, FAQ, CTA.
// Texts: lib/accounting/zipCopy.ts; SEO meta and the long FAQ:
// lib/accounting/siteCopy.ts.

const ORIGIN = 'https://accounting.cantia.ch';
const MAX = 1212;

// Search engines: the product, its publisher and the FAQ, in the page's language.
function structuredData(locale: string, meta: { title: string; description: string }, faq: { q: string; a: string }[], url: string) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: 'Cantia Accounting',
        url,
        description: meta.description,
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        inLanguage: `${locale}-CH`,
        areaServed: { '@type': 'Country', name: 'Switzerland' },
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'CHF' },
        publisher: {
          '@type': 'Organization',
          name: 'Cantia',
          url: 'https://cantia.ch',
        },
      },
      {
        '@type': 'FAQPage',
        mainEntity: faq.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
    ],
  };
}

function scrollTo(id: string) {
  if (Platform.OS === 'web' && typeof document !== 'undefined') {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function useLayout() {
  const { width } = useWindowDimensions();
  const phone = width <= 760;
  return { width, phone, wide: width > 1000, gutter: width > 760 ? 54 : 22 };
}

function Band({ children, white, id, style }: { children: React.ReactNode; white?: boolean; id?: string; style?: object }) {
  const { phone, gutter } = useLayout();
  return (
    <View nativeID={id} style={[{ paddingVertical: phone ? 56 : 92, paddingHorizontal: gutter, backgroundColor: white ? site.white : site.bg }, style]}>
      <View style={styles.inner}>{children}</View>
    </View>
  );
}

export function AccountingLanding() {
  const { s, locale } = useSiteCopy();
  const layout = useLayout();
  const z = ACC_ZIP[(locale as ZipLocale) ?? 'fr'] ?? ACC_ZIP.fr;
  const prefix = locale === 'fr' ? '' : `/${locale}`;
  const url = `${ORIGIN}${prefix || '/'}`;
  // The hand-off's three questions first, then the longer list (search engines read them all).
  // (skipping the long list's versions of the same three questions).
  const dup = /utiliser cantia|cantia nutzen|usare cantia|afc|estv|compte cantia|cantia-konto|conto cantia/i;
  const faq = [...z.faq.items, ...s.faq.items.filter((f) => !dup.test(f.q))];

  return (
    <AccPage
      nav={
        <AccNav
          landing
          cta
          links={[
            { label: z.nav.features, onPress: () => scrollTo('fonctions') },
            { label: z.nav.clients, onPress: () => scrollTo('mandants') },
            { label: z.nav.questions, onPress: () => scrollTo('questions') },
          ]}
        />
      }
    >
      <Head>
        <title>{s.meta.title}</title>
        <meta name="description" content={s.meta.description} />
        <link rel="canonical" href={url} />
        <link rel="alternate" hrefLang="fr-CH" href={`${ORIGIN}/`} />
        <link rel="alternate" hrefLang="de-CH" href={`${ORIGIN}/de`} />
        <link rel="alternate" hrefLang="it-CH" href={`${ORIGIN}/it`} />
        <link rel="alternate" hrefLang="x-default" href={`${ORIGIN}/`} />
        <meta property="og:title" content={s.meta.title} />
        <meta property="og:description" content={s.meta.description} />
        <meta property="og:url" content={url} />
        <meta property="og:image" content={`${ORIGIN}/og-image.jpg`} />
        <meta property="og:locale" content={`${locale}_CH`} />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify(structuredData(locale, s.meta, faq, url))}</script>
      </Head>

      <Hero z={z} locale={locale as ZipLocale} />
      <Uses z={z} />
      <Clients z={z} />
      <RealFiles wide={layout.wide} />
      <Free z={z} />
      <Band id="questions">
        <View style={styles.faq}>
          <Eyebrow>{z.faq.eyebrow}</Eyebrow>
          <Headline plain={z.faq.title} size={layout.phone ? 32 : 42} style={{ marginTop: 15, marginBottom: 30 }} />
          {faq.map((f, i) => (
            <FaqItem key={f.q} q={f.q} a={f.a} last={i === faq.length - 1} />
          ))}
        </View>
      </Band>
      <Final z={z} />
    </AccPage>
  );
}

// ------------------------------------------------------------ sections

type Z = (typeof ACC_ZIP)['fr'];

function Hero({ z, locale }: { z: Z; locale: ZipLocale }) {
  const { phone, wide, width, gutter } = useLayout();
  const size = phone ? 44 : wide ? Math.min(62, Math.max(50, width * 0.045)) : 50;
  return (
    <View style={{ backgroundColor: site.bg }}>
      <View style={{ paddingHorizontal: gutter, paddingTop: phone ? 40 : 76, paddingBottom: phone ? 40 : 70 }}>
        <View style={[styles.inner, wide ? styles.heroRow : { gap: 34 }]}>
          <View style={wide ? { flex: 0.9, minWidth: 0 } : undefined}>
            <Eyebrow>{z.hero.eyebrow}</Eyebrow>
            <Headline level={1} plain={z.hero.plain} accent={z.hero.accent} size={size} style={{ marginTop: 22, marginBottom: 24 }} />
            <Text style={[sans, styles.lead, phone && { fontSize: 13, lineHeight: 24 }]}>{z.hero.text}</Text>
            <View style={styles.ctaRow}>
              <View>
                <Btn label={z.hero.cta} href="/connexion?mode=signup" small={phone} />
              </View>
              <Hover onPress={() => scrollTo('fonctions')} accessibilityRole="button" base={styles.more} hover={{ opacity: 0.7 }}>
                <Text style={[sans, styles.moreText]}>{z.hero.more}</Text>
                <Feather name="arrow-down" size={13} color={site.ink} />
              </Hover>
            </View>
            <Micro style={{ fontSize: 9 }}>{z.hero.micro}</Micro>
          </View>
          <View style={wide ? { flex: 1.1, minWidth: 0 } : undefined}>
            <HeroDevices locale={locale} phoneOnly={phone} media="/videos/acc" labels={{ desktop: z.hero.shotAlt, phone: z.hero.shotAlt }} />
          </View>
        </View>
      </View>
      <View style={[styles.trust, { paddingHorizontal: gutter }, phone && { flexDirection: 'column', alignItems: 'flex-start', gap: 10 }]}>
        {z.trust.map((t) => (
          <Text key={t} style={[sans, styles.trustText]}>
            {t}
          </Text>
        ))}
      </View>
    </View>
  );
}

function Uses({ z }: { z: Z }) {
  const { phone, wide, width } = useLayout();
  const cols = phone ? 1 : width <= 1000 ? 2 : 3;
  return (
    <Band white id="fonctions">
      <View style={[styles.headRow, !wide && { flexDirection: 'column', alignItems: 'flex-start', gap: 18 }]}>
        <View>
          <Eyebrow>{z.uses.eyebrow}</Eyebrow>
          <Headline plain={z.uses.plain} accent={z.uses.accent} size={phone ? 34 : 44} style={{ marginTop: 16 }} />
        </View>
        <Text style={[sans, styles.side]}>{z.uses.text}</Text>
      </View>
      <View style={[styles.grid, { marginTop: phone ? 34 : 50 }]}>
        {z.uses.items.map(([title, text], i) => (
          <View key={title} style={[styles.use, { width: cols === 1 ? '100%' : cols === 2 ? '47.5%' : '31%' }]}>
            <Text style={[sans, styles.useNum]}>{String(i + 1).padStart(2, '0')}</Text>
            <Text style={[sans, styles.useTitle]}>{title}</Text>
            <Text style={[sans, styles.useText]}>{text}</Text>
          </View>
        ))}
      </View>
    </Band>
  );
}

const FORMATS = ['Banana', 'Abacus', 'Winbiz', 'Excel / CSV', 'AFC'];

function Clients({ z }: { z: Z }) {
  const { phone, wide } = useLayout();
  return (
    <Band id="mandants">
      <View style={[styles.split, !wide && { flexDirection: 'column', gap: 34 }]}>
        <View style={wide ? { flex: 1 } : undefined}>
          <Eyebrow>{z.clients.eyebrow}</Eyebrow>
          <Headline plain={z.clients.plain} accent={z.clients.accent} size={phone ? 32 : 42} style={{ marginTop: 16, marginBottom: 22 }} />
          <Text style={[sans, styles.copy]}>{z.clients.text}</Text>
        </View>
        <View style={wide ? { flex: 1 } : undefined}>
          {z.clients.items.map((it) => (
            <View key={it.label} style={styles.kind}>
              <Text style={[sans, styles.kindLabel]}>{it.label.toUpperCase()}</Text>
              <Text style={[sans, styles.kindTitle]}>{it.title}</Text>
              <Text style={[sans, styles.kindText]}>{it.text}</Text>
            </View>
          ))}
        </View>
      </View>
      <View style={[styles.formats, phone && { flexWrap: 'wrap', rowGap: 14, columnGap: 26 }]}>
        <Text style={[sans, styles.formatsLabel, phone && { width: '100%' }]}>{z.clients.formatsLabel}</Text>
        {FORMATS.map((f) => (
          <Text key={f} style={[sans, styles.format]}>
            {f}
          </Text>
        ))}
      </View>
    </Band>
  );
}

function Free({ z }: { z: Z }) {
  const { phone, wide } = useLayout();
  return (
    <Band white>
      <View style={[styles.split, { alignItems: 'center' }, !wide && { flexDirection: 'column', alignItems: 'flex-start', gap: 30 }]}>
        <View style={wide ? { flex: 1.3 } : undefined}>
          <Eyebrow>{z.free.eyebrow}</Eyebrow>
          <Headline plain={z.free.plain} accent={z.free.accent} size={phone ? 34 : 44} style={{ marginTop: 16, marginBottom: 20 }} />
          <Text style={[sans, styles.copy]}>{z.free.text}</Text>
          <View style={{ marginTop: 26, alignSelf: 'flex-start' }}>
            <Btn label={z.free.cta} href="/connexion?mode=signup" small={phone} />
          </View>
        </View>
        <View style={[styles.zero, wide ? { flex: 0.7 } : { alignSelf: 'center' }]}>
          <Text style={[sans, styles.zeroCur]}>{z.free.currency}</Text>
          <Text style={[serif, styles.zeroNum, phone && { fontSize: 110, lineHeight: 120 }]}>0</Text>
          <Text style={[sans, styles.zeroNote]}>{z.free.note}</Text>
        </View>
      </View>
    </Band>
  );
}

function Final({ z }: { z: Z }) {
  const { phone, wide, gutter } = useLayout();
  return (
    <View style={{ backgroundColor: '#293128', paddingVertical: phone ? 44 : 64, paddingHorizontal: gutter }}>
      <View style={[styles.inner, wide ? { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 40 } : { gap: 24 }]}>
        <View>
          <Headline plain={z.final.plain} accent={z.final.accent} size={phone ? 32 : 40} color="#f4f3e9" accentColor="#d9aa85" />
          <Text style={[sans, { fontSize: 12, color: '#b2b9a7', marginTop: 16 }]}>{z.final.text}</Text>
        </View>
        <View style={{ alignSelf: wide ? 'center' : 'flex-start' }}>
          <Btn label={z.final.cta} href="/connexion?mode=signup" tone="sand" />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  inner: { width: '100%', maxWidth: MAX, alignSelf: 'center' },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: 64 },
  lead: { fontSize: 15, color: site.muted, lineHeight: 28, maxWidth: 470 },
  ctaRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 24, marginTop: 30 },
  more: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10 },
  moreText: { fontSize: 12, color: site.ink, fontWeight: '600' },
  trust: { flexDirection: 'row', justifyContent: 'center', gap: 64, paddingVertical: 26, borderTopWidth: 1, borderTopColor: site.line },
  trustText: { fontSize: 10, color: site.muted },
  headRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', gap: 60 },
  side: { fontSize: 13, color: site.muted, lineHeight: 23, maxWidth: 330 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 34 },
  use: { borderTopWidth: 1, borderTopColor: site.line, paddingTop: 20 },
  useNum: { fontSize: 10, color: site.muted },
  useTitle: { fontSize: 20, color: site.ink, letterSpacing: -0.4, marginTop: 22, marginBottom: 10 },
  useText: { fontSize: 12, color: site.muted, lineHeight: 21, maxWidth: 360 },
  split: { flexDirection: 'row', gap: 80, alignItems: 'flex-start' },
  copy: { fontSize: 14, color: site.muted, lineHeight: 26, maxWidth: 430 },
  kind: { borderTopWidth: 1, borderTopColor: site.line, paddingTop: 20, paddingBottom: 30 },
  kindLabel: { fontSize: 9, letterSpacing: 1.3, color: site.copper, fontWeight: '600' },
  kindTitle: { fontSize: 24, color: site.ink, letterSpacing: -0.6, marginTop: 14, marginBottom: 10 },
  kindText: { fontSize: 12, color: site.muted, lineHeight: 21 },
  formats: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 56, paddingTop: 26, borderTopWidth: 1, borderTopColor: site.line },
  formatsLabel: { fontSize: 11, color: site.muted },
  format: { fontSize: 15, color: site.ink, letterSpacing: -0.2 },
  zero: { alignItems: 'center' },
  zeroCur: { fontSize: 12, color: site.muted, letterSpacing: 1 },
  zeroNum: { fontSize: 150, lineHeight: 160, color: site.copper },
  zeroNote: { fontSize: 12, color: site.muted },
  faq: { maxWidth: 820, width: '100%', marginHorizontal: 'auto' },
});
