import { useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Btn, Eyebrow, Headline, Wrap } from './Primitives';
import { Section, SitePage, useSiteLayout, usePrefix } from './Sections';
import { FaqItem } from './FamilyPage';
import { useSiteLocale } from './SiteNav';
import { usePlanFigures } from './PricingPage';
import { BF_CODE, BF_ENDS_AT, BF_PRICES, BLACK_FRIDAY_COPY } from '../../lib/site/blackFriday';
import { PRICING_COPY, type PlanId } from '../../lib/site/pricing';
import { sans, serif, site } from '../../lib/siteTheme';
import { authHref } from '../../lib/appHost';

// cantia.ch/black-friday (and /de, /it): lib/site/blackFriday.ts. The sign-up
// links carry the offer code; stripe-checkout only honours it until the end.

const night = '#121410';
const nightLine = '#2c3027';
const flame = '#ff5b1f';
const paper = '#f4f3e9';
const fog = '#a9ae9f';
const PLAN_IDS: PlanId[] = ['solo', 'equipe', 'pro'];

function chf(n: number): string {
  const [int, dec] = (Number.isInteger(n) ? String(n) : n.toFixed(2)).split('.');
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, '’');
  return dec ? `${grouped}.${dec}` : grouped;
}

// Time left, computed in the browser only (the static export has no clock).
function useCountdown(): { left: number | null } {
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setLeft(Math.max(0, BF_ENDS_AT - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return { left };
}

function Countdown({ left, units, compact }: { left: number | null; units: [string, string, string, string]; compact?: boolean }) {
  const s = Math.floor((left ?? 0) / 1000);
  const parts = [Math.floor(s / 86400), Math.floor((s % 86400) / 3600), Math.floor((s % 3600) / 60), s % 60];
  return (
    <View style={styles.cdRow} aria-live="off">
      {parts.map((v, i) => (
        <View key={units[i]} style={[styles.cdBox, compact && styles.cdBoxCompact]}>
          <Text style={[sans, styles.cdNum, compact && { fontSize: 24 }, { fontVariant: ['tabular-nums'] }]}>{left == null ? '--' : String(v).padStart(2, '0')}</Text>
          <Text style={[sans, styles.cdUnit]}>{units[i].toUpperCase()}</Text>
        </View>
      ))}
    </View>
  );
}

export function BlackFridayPage() {
  const locale = useSiteLocale();
  const c = BLACK_FRIDAY_COPY[locale];
  const pc = PRICING_COPY[locale];
  const p = usePrefix();
  const { phone, tablet, width, h2Size } = useSiteLayout();
  const { left } = useCountdown();
  const figures = usePlanFigures();
  const [yearly, setYearly] = useState(false);
  const ended = left === 0;
  const stack = width <= 900;
  const h1Size = phone ? 40 : tablet ? 56 : 72;

  const toPrices = () => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') document.getElementById('prix-black-friday')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const signup = (plan: PlanId) => authHref('signup', { plan, billing: yearly ? 'year' : 'month', offer: BF_CODE, ref: 'black-friday' });

  if (ended) {
    return (
      <SitePage title={c.seoTitle} description={c.seoDescription}>
        <View style={[styles.hero, { paddingVertical: phone ? 70 : 120 }]}>
          <Wrap>
            <Eyebrow color={flame}>{c.endedEyebrow}</Eyebrow>
            <Headline level={1} plain={c.endedTitle} size={phone ? 36 : 54} color={paper} style={{ marginTop: 18 }} />
            <Text style={[sans, styles.heroLead]}>{c.endedText}</Text>
            <View style={{ marginTop: 28, alignSelf: 'flex-start' }}>
              <Btn label={c.endedCta} href={`${p}/tarifs`} />
            </View>
          </Wrap>
        </View>
      </SitePage>
    );
  }

  return (
    <SitePage title={c.seoTitle} description={c.seoDescription} cta={false}>
      {/* Ribbon */}
      <View style={styles.ribbon}>
        <Text style={[sans, styles.ribbonText, phone && { fontSize: 10 }]}>{c.ribbon.toUpperCase()}</Text>
      </View>

      {/* Hero */}
      <View style={[styles.hero, { paddingTop: phone ? 44 : 84, paddingBottom: phone ? 52 : 96 }]}>
        <Wrap>
          <View style={[stack ? { gap: 40 } : { flexDirection: 'row', gap: 70, alignItems: 'center' }]}>
            <View style={stack ? undefined : { flex: 1.3 }}>
              <Eyebrow color={flame}>{c.eyebrow}</Eyebrow>
              <Text role="heading" aria-level={1} style={[sans, styles.h1, { fontSize: h1Size, lineHeight: h1Size * 1.04, letterSpacing: phone ? -1.6 : -3 }]}>
                {c.h1Plain} <Text style={[serif, { color: flame }]}>{c.h1Accent}</Text>
              </Text>
              <Text style={[sans, styles.heroLead, phone && { fontSize: 14, lineHeight: 24 }]}>{c.lead}</Text>
              <View style={{ marginTop: 30, alignSelf: 'flex-start' }}>
                <Btn label={c.cta} href="#prix-black-friday" onPress={toPrices} large={!phone} />
              </View>
              <View style={styles.reassure}>
                {c.reassurance.map((r) => (
                  <View key={r} style={styles.reassureItem}>
                    <Feather name="check" size={13} color={flame} />
                    <Text style={[sans, styles.reassureText]}>{r}</Text>
                  </View>
                ))}
              </View>
            </View>
            <View style={[styles.heroCard, stack ? undefined : { flex: 0.9 }]}>
              <View style={styles.bigPct}>
                <Text style={[sans, styles.bigPctUp]}>{locale === 'de' ? 'BIS ZU' : locale === 'it' ? 'FINO A' : 'JUSQU’À'}</Text>
                <Text style={[sans, styles.bigPctNum, phone && { fontSize: 92, lineHeight: 96 }]}>-54%</Text>
                <Text style={[serif, styles.bigPctLife]}>{c.lifetime}</Text>
              </View>
              <View style={styles.heroCardSep} />
              <Text style={[sans, styles.cdLabel]}>{c.endsLabel}</Text>
              <Countdown left={left} units={c.units} compact={phone} />
            </View>
          </View>
        </Wrap>
      </View>

      {/* Prices */}
      <View nativeID="prix-black-friday" style={[styles.pricesBand, { paddingVertical: phone ? 56 : 96 }]}>
        <Wrap>
          <Eyebrow>{c.pricesEyebrow}</Eyebrow>
          <Headline plain={c.pricesPlain} accent={c.pricesAccent} size={h2Size} style={{ marginTop: 15 }} />
          <View style={styles.switch} role="radiogroup">
            <SwitchBtn label={c.monthly} active={!yearly} onPress={() => setYearly(false)} />
            <SwitchBtn label={c.yearly} extra={c.yearlyExtra} active={yearly} onPress={() => setYearly(true)} />
          </View>
          <View style={[styles.cards, stack && { flexDirection: 'column' }]}>
            {(stack ? [...PLAN_IDS].reverse() : PLAN_IDS).map((id) => {
              const plan = pc.plans[id];
              const normal = figures[id];
              const offer = BF_PRICES[id];
              const best = id === 'pro';
              const was = yearly && normal.yearly != null ? normal.yearly / 12 : normal.monthly;
              const now = yearly ? offer.yearly / 12 : offer.monthly;
              const pct = Math.round((1 - offer.monthly / normal.monthly) * 100);
              const savedYear = yearly ? (normal.yearly ?? normal.monthly * 12) - offer.yearly : (normal.monthly - offer.monthly) * 12;
              return (
                <View key={id} style={[styles.card, best && styles.cardBest, stack ? undefined : { flex: 1 }]}>
                  {best ? (
                    <View style={styles.bestTag}>
                      <Feather name="zap" size={11} color="#fff" />
                      <Text style={[sans, styles.bestTagText]}>{c.bestDeal.toUpperCase()}</Text>
                    </View>
                  ) : null}
                  <View style={styles.cardTop}>
                    <Text role="heading" aria-level={3} style={[sans, styles.planName, best && { color: paper }]}>
                      {plan.name}
                    </Text>
                    <View style={styles.pct}>
                      <Text style={[sans, styles.pctText]}>-{pct}%</Text>
                    </View>
                  </View>
                  <Text style={[sans, styles.planText, best && { color: fog }]}>{plan.text}</Text>
                  <Text style={[sans, styles.was, best && { color: fog }]}>
                    {c.instead('')}
                    <Text style={styles.wasAmount}>CHF {chf(Math.round(was * 100) / 100)}</Text>
                  </Text>
                  <View style={styles.priceRow}>
                    <Text style={[sans, styles.priceSmall, best && { color: paper }]}>CHF</Text>
                    <Text style={[sans, styles.price, best && { color: paper }, { fontVariant: ['tabular-nums'] }]}>{chf(Math.round(now * 100) / 100)}</Text>
                    <Text style={[sans, styles.priceSmall, { color: best ? fog : site.muted }]}>{c.perMonth}</Text>
                  </View>
                  <Text style={[sans, styles.billed, best && { color: fog }]}>{yearly ? c.billedYearly(chf(offer.yearly)) : c.billedMonthly}</Text>
                  <View style={[styles.lifePill, best && { backgroundColor: '#2a2d25' }]}>
                    <Feather name="lock" size={12} color={flame} />
                    <Text style={[sans, styles.lifeText, best && { color: paper }]}>{c.lifetime}</Text>
                  </View>
                  <Text style={[sans, styles.saved, best && { color: flame }]}>{c.savePerYear(chf(Math.round(savedYear * 100) / 100))}</Text>
                  <View style={{ marginTop: 18 }}>
                    <Btn label={c.planCta(plan.name)} href={signup(id)} tone={best ? 'copper' : 'ink'} block />
                  </View>
                  <View style={styles.lines}>
                    {[pc.membersStorage(normal.members, Math.round(normal.storageMb / 1024)), ...plan.lines].map((l) => (
                      <View key={l} style={styles.lineRow}>
                        <Feather name="check" size={13} color={best ? flame : site.green} style={{ marginTop: 3 }} />
                        <Text style={[sans, styles.lineText, best && { color: '#d9dccf' }]}>{l}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              );
            })}
          </View>
        </Wrap>
      </View>

      {/* Why for life */}
      <Section white>
        <Eyebrow>{c.whyEyebrow}</Eyebrow>
        <Headline plain={c.whyPlain} accent={c.whyAccent} size={h2Size} style={{ marginTop: 15, marginBottom: 34 }} />
        <View style={[styles.grid3, stack && { flexDirection: 'column' }]}>
          {c.why.map((w, i) => (
            <View key={w.title} style={[styles.whyCard, stack ? undefined : { flex: 1 }]}>
              <Text style={[sans, styles.whyNum]}>{String(i + 1).padStart(2, '0')}</Text>
              <Text style={[sans, styles.whyTitle]}>{w.title}</Text>
              <Text style={[sans, styles.whyText]}>{w.text}</Text>
            </View>
          ))}
        </View>
      </Section>

      {/* Included */}
      <Section>
        <Eyebrow>{c.includedEyebrow}</Eyebrow>
        <Headline plain={c.includedTitle} size={h2Size} style={{ marginTop: 15, marginBottom: 30 }} />
        <View style={styles.incl}>
          {c.included.map((it) => (
            <View key={it} style={[styles.inclItem, { width: phone ? '100%' : stack ? '48%' : '23.5%' }]}>
              <Feather name="check-circle" size={16} color={site.copper} />
              <Text style={[sans, styles.inclText]}>{it}</Text>
            </View>
          ))}
        </View>
      </Section>

      {/* Steps */}
      <Section white>
        <Eyebrow>{c.stepsEyebrow}</Eyebrow>
        <Headline plain={c.stepsTitle} size={h2Size} style={{ marginTop: 15, marginBottom: 30 }} />
        <View style={[styles.grid3, stack && { flexDirection: 'column' }]}>
          {c.steps.map((s, i) => (
            <View key={s.title} style={[styles.step, stack ? undefined : { flex: 1 }]}>
              <View style={styles.stepNum}>
                <Text style={[sans, styles.stepNumText]}>{i + 1}</Text>
              </View>
              <Text style={[sans, styles.whyTitle]}>{s.title}</Text>
              <Text style={[sans, styles.whyText]}>{s.text}</Text>
            </View>
          ))}
        </View>
      </Section>

      {/* FAQ */}
      <Section>
        <View style={{ maxWidth: 860 }}>
          <Eyebrow>{c.faqEyebrow}</Eyebrow>
          <Headline plain={c.faqTitle} size={phone ? 32 : 42} style={{ marginTop: 15, marginBottom: 30 }} />
          {c.faq.map((q, i) => (
            <FaqItem key={q.q} q={q.q} a={q.a} last={i === c.faq.length - 1} />
          ))}
        </View>
      </Section>

      {/* Final */}
      <View style={[styles.hero, { paddingVertical: phone ? 56 : 90 }]}>
        <Wrap>
          <View style={[stack ? { gap: 30 } : { flexDirection: 'row', alignItems: 'center', gap: 60 }]}>
            <View style={stack ? undefined : { flex: 1 }}>
              <Headline plain={c.finalTitle} size={phone ? 32 : 46} color={paper} />
              <Text style={[sans, styles.heroLead, { fontSize: 14 }]}>{c.finalText}</Text>
              <View style={{ marginTop: 26, alignSelf: 'flex-start' }}>
                <Btn label={c.cta} href="#prix-black-friday" onPress={toPrices} large={!phone} />
              </View>
            </View>
            <View style={stack ? undefined : { flex: 0.8 }}>
              <Countdown left={left} units={c.units} compact={phone} />
            </View>
          </View>
        </Wrap>
      </View>
    </SitePage>
  );
}

function SwitchBtn({ label, extra, active, onPress }: { label: string; extra?: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable role="radio" aria-checked={active} onPress={onPress} style={[styles.switchBtn, active && styles.switchBtnOn]}>
      <Text style={[sans, styles.switchText, active && { color: '#fff' }]}>{label}</Text>
      {extra ? <Text style={[sans, styles.switchExtra, active && { color: '#ffd2bf' }]}>{extra}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  ribbon: { backgroundColor: flame, paddingVertical: 9, paddingHorizontal: 16, alignItems: 'center' },
  ribbonText: { color: '#fff', fontSize: 11, fontWeight: '800', letterSpacing: 1.4, textAlign: 'center' },
  hero: { backgroundColor: night },
  h1: { color: paper, fontWeight: '500', marginTop: 18 },
  heroLead: { color: fog, fontSize: 16, lineHeight: 28, marginTop: 22, maxWidth: 640 },
  reassure: { flexDirection: 'row', flexWrap: 'wrap', gap: 18, marginTop: 22 },
  reassureItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  reassureText: { color: '#d9dccf', fontSize: 12, fontWeight: '600' },
  heroCard: { borderWidth: 1, borderColor: nightLine, borderRadius: 22, padding: 28, backgroundColor: '#181b15' },
  bigPct: { alignItems: 'flex-start' },
  bigPctUp: { color: fog, fontSize: 12, fontWeight: '800', letterSpacing: 2 },
  bigPctNum: { color: flame, fontSize: 132, lineHeight: 134, fontWeight: '800', letterSpacing: -6 },
  bigPctLife: { color: paper, fontSize: 28, marginTop: 2 },
  heroCardSep: { height: 1, backgroundColor: nightLine, marginVertical: 22 },
  cdLabel: { color: fog, fontSize: 12, fontWeight: '600', marginBottom: 12 },
  cdRow: { flexDirection: 'row', gap: 10 },
  cdBox: { flex: 1, backgroundColor: '#22261f', borderRadius: 14, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: nightLine },
  cdBoxCompact: { paddingVertical: 10, borderRadius: 11 },
  cdNum: { color: paper, fontSize: 34, fontWeight: '800', letterSpacing: -1 },
  cdUnit: { color: fog, fontSize: 9, fontWeight: '700', letterSpacing: 1.2, marginTop: 4 },
  pricesBand: { backgroundColor: site.bg },
  switch: { flexDirection: 'row', alignSelf: 'flex-start', backgroundColor: '#fff', borderWidth: 1, borderColor: site.line, borderRadius: 999, padding: 4, marginTop: 26, marginBottom: 30 },
  switchBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 9, paddingHorizontal: 18, borderRadius: 999 },
  switchBtnOn: { backgroundColor: site.ink },
  switchText: { fontSize: 12, fontWeight: '700', color: site.ink },
  switchExtra: { fontSize: 11, fontWeight: '700', color: site.copper },
  cards: { flexDirection: 'row', gap: 18, alignItems: 'stretch' },
  card: { backgroundColor: '#fff', borderWidth: 1, borderColor: site.line, borderRadius: 22, padding: 26 },
  cardBest: { backgroundColor: night, borderColor: flame, borderWidth: 2, shadowColor: flame, shadowOpacity: 0.25, shadowRadius: 30, shadowOffset: { width: 0, height: 12 } },
  bestTag: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', backgroundColor: flame, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 14 },
  bestTagText: { color: '#fff', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  planName: { fontSize: 22, fontWeight: '700', color: site.ink },
  pct: { backgroundColor: flame, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4, transform: [{ rotate: '-3deg' }] },
  pctText: { color: '#fff', fontSize: 18, fontWeight: '800' },
  planText: { fontSize: 12, color: site.muted, marginTop: 6, lineHeight: 19 },
  was: { fontSize: 13, color: site.muted, marginTop: 18 },
  wasAmount: { textDecorationLine: 'line-through', textDecorationColor: flame },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 2 },
  priceSmall: { fontSize: 13, fontWeight: '700', color: site.ink },
  price: { fontSize: 60, fontWeight: '800', color: site.ink, letterSpacing: -2.5 },
  billed: { fontSize: 11, color: site.muted, marginTop: 2 },
  lifePill: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', backgroundColor: '#fbeee6', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5, marginTop: 14 },
  lifeText: { fontSize: 11, fontWeight: '700', color: site.rust },
  saved: { fontSize: 12, fontWeight: '700', color: site.copper, marginTop: 10 },
  lines: { gap: 8, marginTop: 20 },
  lineRow: { flexDirection: 'row', gap: 8 },
  lineText: { flex: 1, fontSize: 12, color: site.ink, lineHeight: 19 },
  grid3: { flexDirection: 'row', gap: 18 },
  whyCard: { borderTopWidth: 2, borderTopColor: site.copper, paddingTop: 18, gap: 8 },
  whyNum: { fontSize: 12, fontWeight: '800', color: site.copper, letterSpacing: 1 },
  whyTitle: { fontSize: 18, fontWeight: '700', color: site.ink },
  whyText: { fontSize: 13, color: site.muted, lineHeight: 22 },
  incl: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  inclItem: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fff', borderWidth: 1, borderColor: site.line, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 14 },
  inclText: { flex: 1, fontSize: 13, fontWeight: '600', color: site.ink, lineHeight: 19 },
  step: { gap: 10 },
  stepNum: { width: 34, height: 34, borderRadius: 17, backgroundColor: night, alignItems: 'center', justifyContent: 'center' },
  stepNumText: { color: flame, fontWeight: '800', fontSize: 14 },
});
