import { useState, type ReactNode } from 'react';
import { Platform, Pressable, StyleSheet, Text, View, type DimensionValue, type ViewStyle } from 'react-native';
import { Link } from 'expo-router';
import Head from 'expo-router/head';
import { Feather } from '@expo/vector-icons';
import { AccNav, AccPage, NavButton, PAGE_MAX, useIsWide } from './AccountingChrome';
import { ClosingMock, EntryMock, FirmMock, OverviewMock, PortalMock, ReportsMock, VatMock } from './landing/Mockups';
import { useSiteCopy, type ChapterKey } from '../../lib/accounting/siteCopy';
import { monoType } from '../../lib/marketingTheme';
import { colors, fontSize, radius, spacing } from '../../lib/theme';

// accounting.cantia.ch home (FR at /, DE at /de, IT at /it): what the firm
// workspace does, chapter by chapter, each with a mockup of the real screen.
// Strings and example data: lib/accounting/siteCopy.ts.

const ORIGIN = 'https://accounting.cantia.ch';
const INK = '#16120E';
const INK_TEXT = '#EFE4D6';
const INK_MUTED = '#B9A994';
const INK_LINE = 'rgba(255,255,255,0.12)';
const COPPER = '#D9895A';
const WIDTH = PAGE_MAX - spacing.lg * 2;

const MOCKS: Record<ChapterKey, () => ReactNode> = {
  entry: () => <EntryMock />,
  reports: () => <ReportsMock />,
  vat: () => <VatMock />,
  closing: () => <ClosingMock />,
  portal: () => <PortalMock />,
  firm: () => <FirmMock />,
};

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

function scrollToFeatures() {
  if (Platform.OS === 'web' && typeof document !== 'undefined') {
    document.getElementById('fonctions')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

export function AccountingLanding() {
  const { s, locale } = useSiteCopy();
  const wide = useIsWide();
  const prefix = locale === 'fr' ? '' : `/${locale}`;
  const url = `${ORIGIN}${prefix || '/'}`;

  return (
    <AccPage nav={<AccNav landing cta />}>
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
        <script type="application/ld+json">{JSON.stringify(structuredData(locale, s.meta, s.faq.items, url))}</script>
      </Head>

      <Hero wide={wide} />
      <Formats wide={wide} />
      <Chapters wide={wide} />
      <Kinds wide={wide} />
      <Calendar wide={wide} />
      <Included wide={wide} />
      <Security wide={wide} />
      <Pricing wide={wide} />
      <Partner wide={wide} />
      <Faq wide={wide} />
      <Final wide={wide} />
    </AccPage>
  );
}

// ------------------------------------------------------------ building blocks

function Band({ children, tone = 'page', style }: { children: ReactNode; tone?: 'page' | 'surface' | 'ink'; style?: object }) {
  return (
    <View style={[styles.band, tone === 'surface' && styles.bandSurface, tone === 'ink' && styles.bandInk, style]}>
      <View style={styles.inner}>{children}</View>
    </View>
  );
}

function Heading({ eyebrow, title, text, inverse = false, center = false }: { eyebrow: string; title: string; text?: string; inverse?: boolean; center?: boolean }) {
  return (
    <View style={[styles.heading, center && { alignItems: 'center' }]}>
      <Text style={[styles.eyebrow, inverse && { color: COPPER }]}>{eyebrow}</Text>
      <Text style={[styles.h2, inverse && { color: '#FFFFFF' }, center && { textAlign: 'center' }]} role="heading" aria-level={2}>
        {title}
      </Text>
      {text ? <Text style={[styles.lead, inverse && { color: INK_TEXT }, center && { textAlign: 'center' }]}>{text}</Text> : null}
    </View>
  );
}

// ------------------------------------------------------------ hero

function Hero({ wide }: { wide: boolean }) {
  const { s } = useSiteCopy();
  return (
    <View style={styles.heroWrap}>
      <View style={styles.heroGrid} aria-hidden />
      <View style={[styles.inner, styles.heroInner, wide && styles.heroInnerWide]}>
        <View style={styles.heroText}>
          <View style={[styles.heroBadge, wide && { alignSelf: 'center' }]}>
            <View style={styles.heroBadgeDot} />
            <Text style={styles.heroBadgeText}>{s.hero.eyebrow}</Text>
          </View>
          <Text style={[styles.h1, wide && styles.h1Wide]} role="heading" aria-level={1}>
            {s.hero.title}
          </Text>
          <Text style={[styles.heroLead, wide && { textAlign: 'center', alignSelf: 'center' }]}>{s.hero.text}</Text>
          <View style={[styles.ctaRow, wide && { justifyContent: 'center' }]}>
            <NavButton href="/connexion?mode=signup" label={s.hero.cta} primary large />
            <Pressable onPress={scrollToFeatures} style={styles.ghostLarge} accessibilityRole="button">
              <Text style={styles.ghostLargeText}>{s.hero.secondary}</Text>
              <Feather name="arrow-down" size={16} color={colors.text} />
            </Pressable>
          </View>
          <View style={[styles.points, wide && { justifyContent: 'center' }]}>
            {s.hero.points.map((p) => (
              <View key={p} style={styles.point}>
                <Feather name="check" size={14} color={colors.success} />
                <Text style={styles.pointText}>{p}</Text>
              </View>
            ))}
          </View>
        </View>
        <OverviewMock wide={wide} />
      </View>
    </View>
  );
}

function Formats({ wide }: { wide: boolean }) {
  const { s } = useSiteCopy();
  return (
    <View style={styles.formatsWrap}>
      <View style={[styles.inner, styles.formats, wide && styles.formatsWide]}>
        <Text style={styles.formatsLabel}>{s.formats.label}</Text>
        <View style={styles.formatsList}>
          {s.formats.items.map((item) => (
            <Text key={item} style={styles.formatItem}>
              {item}
            </Text>
          ))}
        </View>
      </View>
    </View>
  );
}

// ------------------------------------------------------------ chapters

function Chapters({ wide }: { wide: boolean }) {
  const { s } = useSiteCopy();
  return (
    <View nativeID="fonctions">
      <Band>
        <Heading eyebrow={s.chaptersIntro.eyebrow} title={s.chaptersIntro.title} text={s.chaptersIntro.text} />
        <View style={styles.chapterIndex}>
          {s.chapters.map((c, i) => (
            <View key={c.key} style={[styles.indexItem, { flexBasis: wide ? '15%' : '46%' }]}>
              <Text style={styles.indexNum}>{String(i + 1).padStart(2, '0')}</Text>
              <Text style={styles.indexLabel}>{c.eyebrow}</Text>
            </View>
          ))}
        </View>
      </Band>
      {s.chapters.map((c, i) => {
        const flip = wide && i % 2 === 1;
        return (
          <Band key={c.key} tone={i % 2 === 0 ? 'surface' : 'page'} style={styles.chapterBand}>
            <View style={[styles.chapter, wide && styles.chapterWide, flip && { flexDirection: 'row-reverse' }]}>
              <View style={[styles.chapterText, wide && { flex: 0.9 }]}>
                <View style={styles.chapterEyebrowRow}>
                  <Text style={styles.chapterNum}>{String(i + 1).padStart(2, '0')}</Text>
                  <View style={styles.chapterRule} />
                  <Text style={styles.eyebrow}>{c.eyebrow}</Text>
                </View>
                <Text style={[styles.h3, wide && { fontSize: 30, lineHeight: 37 }]} role="heading" aria-level={3}>
                  {c.title}
                </Text>
                <Text style={styles.body}>{c.text}</Text>
                <View style={styles.bullets}>
                  {c.bullets.map((b) => (
                    <View key={b} style={styles.bullet}>
                      <View style={styles.bulletIcon}>
                        <Feather name="check" size={12} color={colors.primary} />
                      </View>
                      <Text style={styles.bulletText}>{b}</Text>
                    </View>
                  ))}
                </View>
              </View>
              <View style={[wide ? { flex: 1.1 } : { width: '100%' }]}>{MOCKS[c.key]()}</View>
            </View>
          </Band>
        );
      })}
    </View>
  );
}

// ------------------------------------------------------------ kinds of clients

function Kinds({ wide }: { wide: boolean }) {
  const { s } = useSiteCopy();
  const k = s.kinds;
  const card = (item: typeof k.cantia, dark: boolean, icon: keyof typeof Feather.glyphMap) => (
    <View style={[styles.kind, dark && styles.kindDark, wide && { flex: 1 }]}>
      <View style={styles.kindHead}>
        <View style={[styles.kindIcon, dark && { backgroundColor: 'rgba(217,137,90,0.16)' }]}>
          <Feather name={icon} size={18} color={dark ? COPPER : colors.primary} />
        </View>
        <Text style={[styles.kindLabel, dark && { color: COPPER }]}>{item.label}</Text>
      </View>
      <Text style={[styles.h3, dark && { color: '#FFFFFF' }]}>{item.title}</Text>
      <View style={{ gap: spacing.md }}>
        {item.items.map((line) => (
          <View key={line} style={styles.kindRow}>
            <Feather name="check" size={16} color={dark ? COPPER : colors.primary} style={{ marginTop: 3 }} />
            <Text style={[styles.body, { flex: 1 }, dark && { color: INK_TEXT }]}>{line}</Text>
          </View>
        ))}
      </View>
    </View>
  );
  return (
    <Band>
      <Heading eyebrow={k.eyebrow} title={k.title} />
      <View style={[{ gap: spacing.lg }, wide && { flexDirection: 'row' }]}>
        {card(k.cantia, false, 'link')}
        {card(k.external, true, 'book')}
      </View>
    </Band>
  );
}

// ------------------------------------------------------------ deadlines calendar

function Calendar({ wide }: { wide: boolean }) {
  const { s } = useSiteCopy();
  const c = s.calendar;
  return (
    <Band tone="surface">
      <View style={[{ gap: spacing.xl }, wide && { flexDirection: 'row', gap: 64, alignItems: 'flex-end' }]}>
        <View style={wide ? { flex: 1 } : undefined}>
          <Heading eyebrow={c.eyebrow} title={c.title} />
        </View>
        <Text style={[styles.body, wide && { flex: 1 }]}>{c.text}</Text>
      </View>
      {wide ? (
        <View style={styles.calendar} aria-hidden>
          <View style={styles.calMonths}>
            {c.months.map((m, i) => (
              <View key={m} style={[styles.calMonth, i > 0 && styles.calMonthDivider]}>
                <Text style={styles.calMonthText}>{m}</Text>
              </View>
            ))}
          </View>
          <View style={styles.calTrack}>
            {c.events.map(([month, label], i) => {
              // Late in the year the label runs leftwards so it stays inside the frame.
              const end = month >= 9;
              const place: ViewStyle = end ? { right: `${((11 - month) / 12) * 100 + 0.6}%` as DimensionValue, flexDirection: 'row-reverse' } : { left: `${(month / 12) * 100 + 0.6}%` as DimensionValue };
              return (
                <View key={label} style={[styles.calEvent, place, { top: (i % 3) * 46 + 12 }]}>
                  <View style={[styles.calDot, month === 11 && { backgroundColor: INK }]} />
                  <Text style={[styles.calLabel, end && { textAlign: 'right' }]} numberOfLines={2}>
                    {label}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      ) : null}
      <View style={wide ? styles.srOnly : styles.calList}>
        {c.events.map(([month, label]) => (
          <View key={label} style={styles.calListRow}>
            <Text style={styles.calListMonth}>{c.months[month]}</Text>
            <Text style={[styles.body, { flex: 1 }]}>{label}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.note}>{c.note}</Text>
    </Band>
  );
}

// ------------------------------------------------------------ everything included

function Included({ wide }: { wide: boolean }) {
  const { s } = useSiteCopy();
  const mid = useIsWide(640);
  return (
    <Band>
      <Heading eyebrow={s.included.eyebrow} title={s.included.title} />
      <View style={styles.includedGrid}>
        {s.included.groups.map((g) => (
          <View key={g.title} style={[styles.group, { flexBasis: wide ? '22%' : mid ? '46%' : '100%' }]}>
            <Text style={styles.groupTitle}>{g.title}</Text>
            {g.items.map((item) => (
              <View key={item} style={styles.groupRow}>
                <Feather name="check" size={13} color={colors.success} style={{ marginTop: 3 }} />
                <Text style={styles.groupText}>{item}</Text>
              </View>
            ))}
          </View>
        ))}
      </View>
    </Band>
  );
}

// ------------------------------------------------------------ security

function Security({ wide }: { wide: boolean }) {
  const { s } = useSiteCopy();
  const mid = useIsWide(640);
  return (
    <Band tone="ink">
      <Heading eyebrow={s.security.eyebrow} title={s.security.title} inverse />
      <View style={styles.secGrid}>
        {s.security.items.map((item) => (
          <View key={item.title} style={[styles.secItem, { flexBasis: wide ? '30%' : mid ? '46%' : '100%' }]}>
            <Feather name={item.icon as keyof typeof Feather.glyphMap} size={20} color={COPPER} />
            <Text style={styles.secTitle}>{item.title}</Text>
            <Text style={styles.secText}>{item.text}</Text>
          </View>
        ))}
      </View>
    </Band>
  );
}

// ------------------------------------------------------------ pricing and steps

function Pricing({ wide }: { wide: boolean }) {
  const { s } = useSiteCopy();
  const p = s.pricing;
  return (
    <Band>
      <View style={[{ gap: 48 }, wide && { flexDirection: 'row', alignItems: 'stretch' }]}>
        <View style={[styles.priceCard, wide && { flex: 1 }]}>
          <Text style={styles.eyebrow}>{p.eyebrow}</Text>
          <Text style={styles.h3}>{p.title}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>{p.price}</Text>
            <Text style={styles.per}>{p.per}</Text>
          </View>
          <Text style={styles.body}>{p.text}</Text>
          <View style={{ gap: spacing.sm }}>
            {p.items.map((item) => (
              <View key={item} style={styles.kindRow}>
                <Feather name="check" size={16} color={colors.success} style={{ marginTop: 3 }} />
                <Text style={[styles.body, { flex: 1, fontWeight: '600', color: colors.text }]}>{item}</Text>
              </View>
            ))}
          </View>
          <View style={{ marginTop: spacing.sm, alignSelf: 'flex-start' }}>
            <NavButton href="/connexion?mode=signup" label={p.cta} primary large />
          </View>
        </View>
        <View style={[{ gap: spacing.xl, justifyContent: 'center' }, wide && { flex: 1 }]}>
          <Text style={styles.h3} role="heading" aria-level={2}>
            {s.steps.title}
          </Text>
          {s.steps.items.map((step, i) => (
            <View key={step.title} style={styles.step}>
              <View style={styles.stepRail}>
                <View style={styles.stepDot}>
                  <Text style={styles.stepDotText}>{i + 1}</Text>
                </View>
                {i < s.steps.items.length - 1 ? <View style={styles.stepLine} /> : null}
              </View>
              <View style={{ flex: 1, gap: 4, paddingBottom: spacing.lg }}>
                <Text style={styles.cardTitle}>{step.title}</Text>
                <Text style={styles.body}>{step.text}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </Band>
  );
}

function Partner({ wide }: { wide: boolean }) {
  const { s, locale } = useSiteCopy();
  const prefix = locale === 'fr' ? '' : `/${locale}`;
  return (
    <Band style={{ paddingTop: 0 }}>
      <View style={[styles.partner, wide && styles.partnerWide]}>
        <View style={[{ gap: spacing.sm }, wide && { flex: 1 }]}>
          <Text style={styles.eyebrow}>{s.partner.eyebrow}</Text>
          <Text style={styles.cardTitle}>{s.partner.title}</Text>
          <Text style={styles.body}>{s.partner.text}</Text>
        </View>
        <Link href={`https://partners.cantia.ch${prefix}` as any} style={styles.partnerLink}>
          {s.partner.cta} →
        </Link>
      </View>
    </Band>
  );
}

// ------------------------------------------------------------ FAQ and final call

function Faq({ wide }: { wide: boolean }) {
  const { s } = useSiteCopy();
  const [open, setOpen] = useState<number | null>(0);
  return (
    <Band tone="surface">
      <View style={[{ gap: spacing.xl }, wide && { flexDirection: 'row', gap: 64 }]}>
        <Text style={[styles.h2, wide && { flex: 0.7 }]} role="heading" aria-level={2}>
          {s.faq.title}
        </Text>
        <View style={[styles.faq, wide && { flex: 1.5 }]}>
          {s.faq.items.map((item, i) => (
            <Pressable key={item.q} onPress={() => setOpen(open === i ? null : i)} style={styles.faqItem} accessibilityRole="button" aria-expanded={open === i}>
              <View style={styles.faqHead}>
                <Text style={styles.faqQ}>{item.q}</Text>
                <Feather name={open === i ? 'minus' : 'plus'} size={18} color={colors.textMuted} />
              </View>
              {/* Every answer stays in the page (search engines, find-in-page); closed ones are hidden. */}
              <Text style={[styles.body, open !== i && styles.srOnly]}>{item.a}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </Band>
  );
}

function Final({ wide }: { wide: boolean }) {
  const { s } = useSiteCopy();
  return (
    <Band tone="ink" style={{ paddingBottom: 96 }}>
      <View style={[styles.final, wide && { alignItems: 'center' }]}>
        <Text style={[styles.finalTitle, wide && { fontSize: 44, lineHeight: 52, textAlign: 'center' }]}>{s.final.title}</Text>
        <Text style={[styles.lead, { color: INK_TEXT }, wide && { textAlign: 'center' }]}>{s.final.text}</Text>
        <View style={[styles.ctaRow, wide && { justifyContent: 'center' }]}>
          <NavButton href="/connexion?mode=signup" label={s.final.cta} primary large />
          <Link href="/connexion" style={styles.inkGhost}>
            {s.final.secondary}
          </Link>
        </View>
      </View>
    </Band>
  );
}

// ------------------------------------------------------------ styles

const heading = {
  fontFamily: 'Archivo, system-ui, sans-serif',
  color: colors.text,
};

const styles = StyleSheet.create({
  band: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 88,
    backgroundColor: colors.bg,
  },
  bandSurface: {
    backgroundColor: '#FFFDF9',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  bandInk: { backgroundColor: INK },
  inner: { width: '100%', maxWidth: WIDTH, alignSelf: 'center', gap: 40 },
  heading: { gap: spacing.md, maxWidth: 760 },
  eyebrow: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1.6,
  },
  h1: {
    ...heading,
    fontWeight: '800',
    fontSize: 38,
    lineHeight: 44,
    letterSpacing: -1,
  },
  h1Wide: {
    fontSize: 66,
    lineHeight: 70,
    letterSpacing: -2.2,
    textAlign: 'center',
  },
  h2: {
    ...heading,
    fontWeight: '800',
    fontSize: 34,
    lineHeight: 40,
    letterSpacing: -0.9,
  },
  h3: {
    ...heading,
    fontWeight: '800',
    fontSize: 25,
    lineHeight: 31,
    letterSpacing: -0.5,
  },
  lead: { fontSize: 18, lineHeight: 28, color: '#4A3F35', maxWidth: 680 },
  body: { fontSize: fontSize.md, lineHeight: 25, color: '#4A3F35' },
  cardTitle: {
    fontSize: 18,
    lineHeight: 25,
    fontWeight: '800',
    color: colors.text,
  },
  note: { fontSize: fontSize.sm, color: colors.textMuted, lineHeight: 20 },
  srOnly: {
    position: 'absolute',
    width: 1,
    height: 1,
    overflow: 'hidden',
    opacity: 0,
  },

  heroWrap: {
    paddingHorizontal: spacing.lg,
    paddingTop: 56,
    paddingBottom: 72,
    backgroundColor: colors.bg,
    overflow: 'hidden',
  },
  heroGrid: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 640,
    opacity: 0.55,
    ...(Platform.OS === 'web'
      ? ({
          backgroundImage: 'linear-gradient(#E9DDCA 1px, transparent 1px), linear-gradient(90deg, #E9DDCA 1px, transparent 1px)',
          backgroundSize: '56px 56px',
          maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.9), rgba(0,0,0,0))',
          WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.9), rgba(0,0,0,0))',
        } as object)
      : {}),
  },
  heroInner: { gap: 48 },
  heroInnerWide: { paddingTop: 40, gap: 64 },
  heroText: {
    gap: 22,
    maxWidth: 900,
    alignSelf: 'center',
    alignItems: 'flex-start',
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  heroBadgeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  heroBadgeText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: 0.3,
  },
  heroLead: { fontSize: 19, lineHeight: 30, color: '#4A3F35', maxWidth: 720 },
  ctaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    alignSelf: 'stretch',
  },
  ghostLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  ghostLargeText: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  points: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 18,
    alignSelf: 'stretch',
  },
  point: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  pointText: { fontSize: fontSize.sm, fontWeight: '600', color: colors.text },

  formatsWrap: {
    paddingHorizontal: spacing.lg,
    backgroundColor: '#FFFDF9',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  formats: { paddingVertical: 22, gap: 14 },
  formatsWide: { flexDirection: 'row', alignItems: 'center', gap: 32 },
  formatsLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  formatsList: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 26,
    rowGap: 10,
  },
  formatItem: {
    ...monoType,
    fontSize: 12.5,
    color: colors.text,
    letterSpacing: 0.2,
  },

  chapterIndex: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  indexItem: {
    flexGrow: 1,
    borderTopWidth: 2,
    borderTopColor: colors.text,
    paddingTop: 10,
    gap: 4,
  },
  indexNum: { ...monoType, fontSize: 12, color: colors.primary },
  indexLabel: { fontSize: 14, fontWeight: '700', color: colors.text },
  chapterBand: { paddingVertical: 96 },
  chapter: { gap: 40 },
  chapterWide: { flexDirection: 'row', alignItems: 'center', gap: 72 },
  chapterText: { gap: 18 },
  chapterEyebrowRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  chapterNum: { ...monoType, fontSize: 13, color: colors.primary },
  chapterRule: { width: 28, height: 1, backgroundColor: colors.primary },
  bullets: { gap: 12, marginTop: 4 },
  bullet: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  bulletIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  bulletText: {
    flex: 1,
    fontSize: fontSize.md,
    lineHeight: 24,
    color: colors.text,
  },

  kind: {
    gap: spacing.lg,
    padding: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  kindDark: { backgroundColor: INK, borderColor: INK },
  kindHead: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  kindIcon: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kindLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.primary,
  },
  kindRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },

  calendar: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  calMonths: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: '#FBF7F0',
  },
  calMonth: { flex: 1, paddingVertical: 10, alignItems: 'center' },
  calMonthDivider: { borderLeftWidth: 1, borderLeftColor: colors.border },
  calMonthText: {
    ...monoType,
    fontSize: 11.5,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  calTrack: { height: 158 },
  calEvent: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    width: '19%',
  },
  calDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
    marginTop: 4,
  },
  calLabel: {
    flex: 1,
    fontSize: 12.5,
    lineHeight: 17,
    fontWeight: '700',
    color: colors.text,
  },
  calList: { borderTopWidth: 1, borderTopColor: colors.border },
  calListRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  calListMonth: {
    ...monoType,
    width: 44,
    fontSize: 12,
    color: colors.primary,
    marginTop: 4,
    textTransform: 'uppercase',
  },

  includedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 28,
    justifyContent: 'space-between',
  },
  group: {
    flexGrow: 1,
    gap: 10,
    borderTopWidth: 2,
    borderTopColor: colors.text,
    paddingTop: 16,
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
  },
  groupRow: { flexDirection: 'row', gap: 9, alignItems: 'flex-start' },
  groupText: { flex: 1, fontSize: 14, lineHeight: 21, color: '#4A3F35' },

  secGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 1,
    backgroundColor: INK_LINE,
    borderWidth: 1,
    borderColor: INK_LINE,
    borderRadius: 10,
    overflow: 'hidden',
  },
  secItem: { flexGrow: 1, backgroundColor: INK, padding: 28, gap: 10 },
  secTitle: { fontSize: 17, fontWeight: '800', color: '#FFFFFF' },
  secText: { fontSize: 14.5, lineHeight: 22, color: INK_MUTED },

  priceCard: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 36,
    gap: 18,
    shadowColor: '#2B211A',
    shadowOpacity: 0.06,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 12 },
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 10,
    flexWrap: 'wrap',
  },
  price: {
    ...heading,
    fontWeight: '800',
    fontSize: 56,
    lineHeight: 60,
    letterSpacing: -2,
  },
  per: { fontSize: fontSize.md, color: colors.textMuted, fontWeight: '600' },
  step: { flexDirection: 'row', gap: spacing.lg },
  stepRail: { alignItems: 'center', width: 34 },
  stepDot: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.5,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  stepDotText: { fontSize: 14, fontWeight: '800', color: colors.primary },
  stepLine: { flex: 1, width: 1, backgroundColor: colors.border, marginTop: 4 },

  partner: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 28,
    gap: spacing.lg,
  },
  partnerWide: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 36,
    gap: 48,
  },
  partnerLink: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.primary,
  },

  faq: { borderTopWidth: 1, borderTopColor: colors.border },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 18,
    gap: spacing.sm,
  },
  faqHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  faqQ: { flex: 1, fontSize: 17, fontWeight: '700', color: colors.text },

  final: { gap: 20 },
  finalTitle: {
    ...heading,
    fontWeight: '800',
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -1,
    color: '#FFFFFF',
  },
  inkGhost: {
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    fontSize: fontSize.md,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
