import { useState } from 'react';
import { StyleSheet, Text, View, type ImageSourcePropType } from 'react-native';
import { Link } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Btn, Eyebrow, Headline, Hover, TextLink, Wrap } from './Primitives';
import { Breadcrumbs, Callout, Section, SectionHead, SitePage, useSiteLayout, usePrefix } from './Sections';
import { FaqItem } from './FamilyPage';
import { LaptopShot } from './Laptop';
import { useSiteLocale } from './SiteNav';
import { SECTOR_SCREENS } from './sectorScreens';
import { BUILDING_TRADES, sectorHref, HUB_COPY, SECTOR_KEYS, SECTOR_SLUGS, SECTOR_UI, SECTORS_COPY, type SectorKey } from '../../lib/site/sectors';
import { sans, serif, site } from '../../lib/siteTheme';
import { authHref } from '../../lib/appHost';
import { getTradePage } from '../../lib/tradeLandingPages';

type IconName = keyof typeof Feather.glyphMap;
const SECTOR_ICONS: Record<SectorKey, IconName> = { batiment: 'home', services: 'droplet', etudes: 'compass', creatifs: 'aperture' };

export { sectorHref };

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// ─── /metiers ───────────────────────────────────────────────────────────────

// The hub: the real screen switching between the four words, then the four
// sectors. The trade pages are listed on their sector page, not here.
export function MetiersPage() {
  const locale = useSiteLocale();
  const h = HUB_COPY[locale];
  const ui = SECTOR_UI[locale];
  const all = SECTORS_COPY[locale];
  const p = usePrefix();
  const { phone, tablet, width } = useSiteLayout();
  const [active, setActive] = useState<SectorKey>('batiment');
  const h1Size = phone ? 43 : tablet ? 52 : 62;
  const cols = width > 1000 ? 4 : width > 640 ? 2 : 1;
  const s = all[active];

  return (
    <SitePage title={h.seoTitle} description={h.seoDescription} cta={false}>
      <View style={{ paddingTop: phone ? 32 : 58, paddingBottom: phone ? 35 : 52 }}>
        <Wrap>
          <Breadcrumbs items={[{ label: ui.crumbHome, href: p || '/' }, { label: ui.crumbTrades }]} />
          <Eyebrow>{h.eyebrow}</Eyebrow>
          <Headline level={1} size={h1Size} plain={h.h1Plain} accent={h.h1Accent} style={{ marginTop: 17, marginBottom: 21, letterSpacing: phone ? -1.9 : -3, lineHeight: h1Size * 1.07, maxWidth: 900 }} />
          <Text style={[sans, styles.lead, phone && { fontSize: 13, lineHeight: 24 }]}>{h.lead}</Text>
        </Wrap>
      </View>

      {/* The same screen, four words */}
      <Section white>
        <SectionHead eyebrow={h.switchEyebrow} plain={h.switchTitle} text={h.switchText} />
        <View style={styles.words} role="tablist">
          {SECTOR_KEYS.map((k) => {
            const on = k === active;
            return (
              <Hover key={k} onPress={() => setActive(k)} accessibilityRole="tab" aria-selected={on} base={[styles.word, on && styles.wordOn]} hover={on ? undefined : { borderColor: site.copper }}>
                <Text style={[serif, styles.wordText, on && { color: site.white }, phone && { fontSize: 19 }]}>{all[k].words}</Text>
              </Hover>
            );
          })}
        </View>
        <View style={[styles.switchRow, (phone || tablet) && { flexDirection: 'column', alignItems: 'stretch', gap: 28 }]}>
          <View style={phone || tablet ? undefined : { flex: 1.5, minWidth: 0 }}>
            <LaptopShot source={SECTOR_SCREENS[locale][active].list} alt={`${s.words} · Cantia`} maxWidth={820} />
          </View>
          <View style={phone || tablet ? undefined : { flex: 1, minWidth: 0 }}>
            <Eyebrow>{s.label}</Eyebrow>
            <Headline plain={s.h1Plain} accent={s.h1Accent} size={phone ? 28 : 34} style={{ marginTop: 14, marginBottom: 16 }} />
            <Text style={[sans, styles.copy]}>{s.wordText}</Text>
            <View style={{ marginTop: 22 }}>
              <TextLink label={`${ui.hubCta}${locale === 'fr' ? ' : ' : ': '}${s.label}`} href={sectorHref(p, active)} />
            </View>
          </View>
        </View>
      </Section>

      {/* The four sectors */}
      <Section>
        <SectionHead eyebrow={h.sectorsEyebrow} plain={h.sectorsTitle} />
        <View style={[styles.cards, cols === 1 && { flexDirection: 'column' }]}>
          {SECTOR_KEYS.map((k) => {
            const c = all[k];
            const examples = k === 'batiment' ? BUILDING_TRADES.slice(0, 6).map((slug) => cap(getTradePage(slug, locale)?.tradeName ?? slug)) : c.trades.slice(0, 5).map((t) => t.name);
            return (
              <Link key={k} href={sectorHref(p, k) as any} asChild>
                <Hover accessibilityRole="link" base={[styles.card, cols > 1 && { width: cols === 4 ? '23.5%' : '48.5%' }]} hover={{ borderColor: site.copper }}>
                  {(hovered) => (
                    <>
                      <View style={styles.cardIcon}>
                        <Feather name={SECTOR_ICONS[k]} size={18} color={site.copper} />
                      </View>
                      <Text style={[sans, styles.cardTitle, hovered && { color: site.copper }]}>{c.label}</Text>
                      <Text style={[serif, styles.cardWord]}>{c.words}</Text>
                      <Text style={[sans, styles.cardText]}>{examples.join(' · ')}</Text>
                      <View style={styles.cardMore}>
                        <Text style={[sans, styles.cardMoreText, hovered && { color: site.copper }]}>{ui.hubCta}</Text>
                        <Feather name="arrow-right" size={14} color={hovered ? site.copper : site.ink} />
                      </View>
                    </>
                  )}
                </Hover>
              </Link>
            );
          })}
        </View>
        <View style={{ marginTop: 34 }}>
          <Callout strong={ui.coreStrong} text={ui.core} link={<TextLink label={ui.pricing} href={`${p}/tarifs`} />} />
        </View>
      </Section>
      <Closing title={all.batiment.closingTitle} text={all.batiment.closingText} />
    </SitePage>
  );
}

// ─── /metiers/<sector> ──────────────────────────────────────────────────────

export function SectorPage({ sector }: { sector: SectorKey }) {
  const locale = useSiteLocale();
  const ui = SECTOR_UI[locale];
  const c = SECTORS_COPY[locale][sector];
  const p = usePrefix();
  const { phone, tablet, width, h2Size } = useSiteLayout();
  const h1 = phone ? 40 : tablet ? 48 : 58;
  const cols = phone ? 1 : width <= 900 ? 2 : 3;
  const cellW = cols === 1 ? '100%' : cols === 2 ? '47.5%' : '31%';
  const screens = SECTOR_SCREENS[locale][sector];
  const trades = sector === 'batiment' ? BUILDING_TRADES.map((slug) => ({ slug, name: cap(getTradePage(slug, locale)?.tradeName ?? slug), text: getTradePage(slug, locale)?.hero.eyebrow ?? '' })) : c.trades;

  return (
    <SitePage title={c.seoTitle} description={c.seoDescription} cta={false}>
      {/* Hero */}
      <View style={{ paddingTop: phone ? 32 : 58, paddingBottom: phone ? 40 : 70 }}>
        <Wrap>
          <Breadcrumbs items={[{ label: ui.crumbHome, href: p || '/' }, { label: ui.crumbTrades, href: `${p}/metiers` }, { label: c.label }]} />
          <View style={[styles.hero, phone ? { flexDirection: 'column', alignItems: 'stretch', gap: 32 } : { gap: tablet ? 40 : 64 }]}>
            <View style={phone ? undefined : { flex: 1, minWidth: 0 }}>
              <Eyebrow>{c.eyebrow}</Eyebrow>
              <Headline level={1} size={h1} plain={c.h1Plain} accent={c.h1Accent} style={{ marginTop: 17, marginBottom: 21, letterSpacing: phone ? -1.6 : -2.4, lineHeight: h1 * 1.07 }} />
              <Text style={[sans, styles.lead, phone && { fontSize: 13, lineHeight: 24 }]}>{c.lead}</Text>
              <View style={[styles.actions, { gap: phone ? 23 : 25 }]}>
                <View>
                  <Btn label={ui.tryCta} href={authHref('signup')} small={phone} />
                </View>
                <View>
                  <TextLink label={ui.pricing} href={`${p}/tarifs`} size={phone ? 11 : 12} />
                </View>
              </View>
              <Text style={[sans, styles.trust]}>{ui.trust}</Text>
            </View>
            <View style={phone ? undefined : { flex: 1.15, minWidth: 0 }}>
              <LaptopShot source={screens.detail} alt={`${c.label} · Cantia`} />
            </View>
          </View>
        </Wrap>
      </View>

      {/* Who it is for */}
      <Section white>
        <SectionHead eyebrow={c.forEyebrow} plain={c.forTitle} />
        {sector === 'batiment' ? (
          <View style={styles.chips}>
            {trades.map((t) => (
              <Link key={t.slug} href={`${p}/${t.slug}` as any} asChild>
                <Hover accessibilityRole="link" base={styles.chip} hover={{ borderColor: site.copper }}>
                  {(hovered) => (
                    <>
                      <Text style={[sans, styles.chipText, hovered && { color: site.copper }]}>{t.name}</Text>
                      <Feather name="arrow-up-right" size={12} color={hovered ? site.copper : site.muted} />
                    </>
                  )}
                </Hover>
              </Link>
            ))}
          </View>
        ) : (
          <View style={styles.grid}>
            {trades.map((t) => (
              <View key={t.name} style={[styles.tradeCell, { width: cellW }]}>
                <Text style={[sans, styles.tradeName]}>{t.name}</Text>
                <Text style={[sans, styles.body]}>{t.text}</Text>
                {t.slug ? (
                  <View style={{ marginTop: 10 }}>
                    <TextLink label={ui.tradePage} href={`${p}/${t.slug}`} size={11} />
                  </View>
                ) : null}
              </View>
            ))}
          </View>
        )}
      </Section>

      {/* What you live with, and the answer */}
      <Section>
        <SectionHead eyebrow={ui.painsEyebrow} plain={ui.painsTitle} />
        {c.pains.map((pain) => (
          <View key={pain.title} style={[styles.painRow, tablet && { flexDirection: 'column', gap: 10 }]}>
            <View style={!tablet ? { flex: 1 } : undefined}>
              <Text style={[sans, styles.painTitle]}>{pain.title}</Text>
              <Text style={[sans, styles.body, { marginTop: 8 }]}>{pain.text}</Text>
            </View>
            <View style={[styles.answer, !tablet && { flex: 1 }]}>
              <Text style={[sans, styles.answerLabel]}>{ui.answer.toUpperCase()}</Text>
              <Text style={[sans, styles.answerText]}>{pain.answer}</Text>
            </View>
          </View>
        ))}
      </Section>

      {/* What Cantia does */}
      <Section white>
        <SectionHead eyebrow={ui.usesEyebrow} plain={ui.usesTitle} />
        <View style={styles.grid}>
          {c.uses.map((u) => (
            <View key={u.title} style={[styles.useCell, { width: cellW }]}>
              <Feather name={u.icon} size={18} color={site.copper} />
              <Text style={[sans, styles.useTitle]}>{u.title}</Text>
              <Text style={[sans, styles.body]}>{u.text}</Text>
              {u.module ? (
                <View style={{ marginTop: 12 }}>
                  <TextLink label={ui.more} href={`${p}/${u.module}`} size={11} color={site.muted} />
                </View>
              ) : null}
            </View>
          ))}
        </View>
      </Section>

      {/* Their word, in the real app */}
      <Section>
        <View style={[styles.switchRow, (phone || tablet) && { flexDirection: 'column', alignItems: 'stretch', gap: 28 }]}>
          <View style={phone || tablet ? undefined : { flex: 1, minWidth: 0 }}>
            <Eyebrow>{ui.wordEyebrow}</Eyebrow>
            <Headline plain={c.wordTitle} size={phone ? 28 : h2Size} style={{ marginTop: 14, marginBottom: 16 }} />
            <Text style={[sans, styles.copy]}>{c.wordText}</Text>
          </View>
          <View style={phone || tablet ? undefined : { flex: 1.4, minWidth: 0 }}>
            <LaptopShot source={screens.list} alt={`${c.words} · Cantia`} />
          </View>
        </View>
      </Section>

      {/* From request to payment */}
      <Section white>
        <SectionHead eyebrow={ui.scenarioEyebrow} plain={c.scenarioTitle} />
        <View style={[styles.steps, (phone || width <= 900) && { flexDirection: 'column', gap: 0 }]}>
          {c.scenario.map((st, i) => (
            <View key={st.title} style={[styles.step, !(phone || width <= 900) && { flex: 1 }]}>
              <Text style={[serif, styles.stepNum]}>{String(i + 1).padStart(2, '0')}</Text>
              <Text style={[sans, styles.stepTitle]}>{st.title}</Text>
              <Text style={[sans, styles.body]}>{st.text}</Text>
            </View>
          ))}
        </View>
        <View style={{ marginTop: 40 }}>
          <Callout strong={ui.coreStrong} text={ui.core} />
        </View>
      </Section>

      {/* FAQ: answers stay in the page for search engines. */}
      <Section>
        <View style={styles.faq}>
          <Eyebrow>{ui.faqEyebrow}</Eyebrow>
          <Headline plain={ui.faqTitle} size={h2Size} style={{ marginTop: 15, marginBottom: 30 }} />
          {c.faq.map((f, i) => (
            <FaqItem key={f.q} q={f.q} a={f.a} last={i === c.faq.length - 1} />
          ))}
        </View>
      </Section>

      {/* The other sectors */}
      <Section white>
        <Eyebrow>{ui.otherEyebrow}</Eyebrow>
        <View style={[styles.others, phone && { flexDirection: 'column' }]}>
          {SECTOR_KEYS.filter((k) => k !== sector).map((k) => {
            const o = SECTORS_COPY[locale][k];
            return (
              <Link key={k} href={sectorHref(p, k) as any} asChild>
                <Hover accessibilityRole="link" base={[styles.other, !phone && { flex: 1 }]} hover={{ borderColor: site.copper }}>
                  <Feather name={SECTOR_ICONS[k]} size={16} color={site.copper} />
                  <View style={{ flex: 1 }}>
                    <Text style={[sans, styles.otherName]}>{o.label}</Text>
                    <Text style={[sans, styles.otherWord]}>{o.words}</Text>
                  </View>
                  <Feather name="arrow-right" size={16} color={site.ink} />
                </Hover>
              </Link>
            );
          })}
        </View>
      </Section>

      <Closing title={c.closingTitle} text={c.closingText} />
    </SitePage>
  );
}

function Closing({ title, text }: { title: string; text: string }) {
  const locale = useSiteLocale();
  const ui = SECTOR_UI[locale];
  const { phone } = useSiteLayout();
  return (
    <View style={[styles.cta, { paddingVertical: phone ? 44 : 64 }]}>
      <Wrap style={phone ? undefined : styles.ctaRow}>
        <View style={phone ? undefined : { flex: 1, maxWidth: 760 }}>
          <Headline plain={title} size={phone ? 30 : 38} color="#f4f3e9" />
          <Text style={[sans, { fontSize: 13, color: '#b2b9a7', marginTop: 15, lineHeight: 21 }]}>{text}</Text>
        </View>
        <View style={phone ? { marginTop: 24, alignSelf: 'flex-start' } : undefined}>
          <Btn label={ui.closingCta} href={authHref('signup')} tone="sand" />
        </View>
      </Wrap>
    </View>
  );
}

export type SectorShot = { list: ImageSourcePropType; detail: ImageSourcePropType };

const styles = StyleSheet.create({
  lead: { fontSize: 15, color: site.muted, lineHeight: 28, maxWidth: 620 },
  hero: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  actions: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginTop: 26 },
  trust: { fontSize: 10, color: '#8b9380', marginTop: 18 },
  copy: { fontSize: 14, color: site.muted, lineHeight: 26, maxWidth: 520 },
  words: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 34 },
  word: { borderWidth: 1, borderColor: site.line, borderRadius: 6, paddingVertical: 9, paddingHorizontal: 18, backgroundColor: site.white },
  wordOn: { backgroundColor: site.ink, borderColor: site.ink },
  wordText: { fontSize: 22, color: site.ink },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: 56 },
  cards: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 18 },
  card: { backgroundColor: site.white, borderWidth: 1, borderColor: site.line, borderRadius: 10, padding: 24 },
  cardIcon: { width: 38, height: 38, borderRadius: 6, backgroundColor: '#f3e6da', alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: 17, color: site.ink, fontWeight: '500', marginTop: 18, letterSpacing: -0.3 },
  cardWord: { fontSize: 18, color: site.copper, marginTop: 4 },
  cardText: { fontSize: 11, color: site.muted, lineHeight: 18, marginTop: 12, minHeight: 54 },
  cardMore: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 18 },
  cardMoreText: { fontSize: 12, color: site.ink, fontWeight: '500' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: site.line, borderRadius: 6, paddingVertical: 10, paddingHorizontal: 14, backgroundColor: site.white },
  chipText: { fontSize: 12, color: site.ink },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 32 },
  tradeCell: { borderTopWidth: 1, borderTopColor: site.line, paddingTop: 20 },
  tradeName: { fontSize: 16, color: site.ink, fontWeight: '500', letterSpacing: -0.2, marginBottom: 8 },
  body: { fontSize: 12, color: site.muted, lineHeight: 21 },
  painRow: { flexDirection: 'row', gap: 40, paddingVertical: 26, borderTopWidth: 1, borderTopColor: site.line },
  painTitle: { fontSize: 18, color: site.ink, fontWeight: '500', letterSpacing: -0.3, lineHeight: 25 },
  answer: { backgroundColor: site.white, borderLeftWidth: 2, borderLeftColor: site.copper, padding: 18, borderRadius: 4 },
  answerLabel: { fontSize: 9, letterSpacing: 1.3, color: site.copper, fontWeight: '600', marginBottom: 6 },
  answerText: { fontSize: 13, color: site.ink, lineHeight: 22 },
  useCell: { borderTopWidth: 1, borderTopColor: site.line, paddingTop: 22 },
  useTitle: { fontSize: 17, color: site.ink, letterSpacing: -0.3, marginTop: 16, marginBottom: 8 },
  steps: { flexDirection: 'row', gap: 28 },
  step: { borderTopWidth: 1, borderTopColor: site.ink, paddingTop: 18, paddingBottom: 22 },
  stepNum: { fontSize: 30, color: site.copper, lineHeight: 34 },
  stepTitle: { fontSize: 16, color: site.ink, fontWeight: '500', marginTop: 10, marginBottom: 8 },
  faq: { maxWidth: 820, width: '100%', marginHorizontal: 'auto' },
  others: { flexDirection: 'row', gap: 14, marginTop: 20 },
  other: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 18, borderWidth: 1, borderColor: site.line, borderRadius: 8, backgroundColor: site.white },
  otherName: { fontSize: 14, color: site.ink, fontWeight: '500' },
  otherWord: { fontSize: 11, color: site.muted, marginTop: 2 },
  cta: { backgroundColor: '#293128' },
  ctaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 40 },
});
