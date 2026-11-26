import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { Btn, Eyebrow, Headline, Hover, Wrap } from './Primitives';
import { SitePage, useSiteLayout, usePrefix } from './Sections';
import { useSiteLocale } from './SiteNav';
import { usePlanFigures } from './PricingPage';
import { HeroDevices } from './HeroDevices';
import { BF_CODE, BF_ENDS_AT, BF_PRICES, BLACK_FRIDAY_COPY } from '../../lib/site/blackFriday';
import { PRICING_COPY, type PlanId } from '../../lib/site/pricing';
import { sans, serif } from '../../lib/siteTheme';
import { authHref } from '../../lib/appHost';

// cantia.ch/black-friday (and /de, /it): lib/site/blackFriday.ts. The sign-up
// links carry the offer code; stripe-checkout only honours it until the end.

const night = '#0b0c09';
const night2 = '#111309';
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

  // Phone: the bar at the bottom only shows once the hero's own button and
  // the price cards are out of sight, so it never sits on top of them.
  const [showSticky, setShowSticky] = useState(false);
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof IntersectionObserver === 'undefined' || !phone) return;
    const targets = ['bf-hero-cta', 'bf-hero-card', 'prix-black-friday'].map((id) => document.getElementById(id)).filter(Boolean) as Element[];
    const seen = new Map<Element, boolean>();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => seen.set(e.target, e.isIntersecting));
      setShowSticky(![...seen.values()].some(Boolean));
    });
    targets.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [phone, ended]);

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
        <View style={styles.aurora} pointerEvents="none" />
        <View style={styles.gridLines} pointerEvents="none" />
        <Wrap>
          <View style={[stack ? { gap: 40 } : { flexDirection: 'row', gap: 70, alignItems: 'center' }]}>
            <View style={stack ? undefined : { flex: 1.3 }}>
              <Eyebrow color={flame}>{c.eyebrow}</Eyebrow>
              <Text role="heading" aria-level={1} style={[sans, styles.h1, { fontSize: h1Size, lineHeight: h1Size * 1.04, letterSpacing: phone ? -1.6 : -3 }]}>
                {c.h1Plain} <Text style={[serif, { color: flame }]}>{c.h1Accent}</Text>
              </Text>
              <Text style={[sans, styles.heroLead, phone && { fontSize: 14, lineHeight: 24 }]}>{c.lead}</Text>
              <View nativeID="bf-hero-cta" style={{ marginTop: 30, alignSelf: 'flex-start' }}>
                <FlameBtn label={c.cta} onPress={toPrices} large={!phone} />
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
            <View nativeID="bf-hero-card" style={[styles.heroCard, stack ? undefined : { flex: 0.9 }]}>
              <View style={styles.bigPct}>
                <Text style={[sans, styles.bigPctUp]}>{locale === 'de' ? 'BIS ZU' : locale === 'it' ? 'FINO A' : 'JUSQU’À'}</Text>
                <Text style={[sans, styles.bigPctNum, phone && { fontSize: 92, lineHeight: 96 }]}>-54%</Text>
                <Text style={[serif, styles.bigPctLife]}>{c.lifetime}</Text>
              </View>
              <View style={styles.deals}>
                {(['pro', 'equipe', 'solo'] as PlanId[]).map((id) => (
                  <View key={id} style={styles.deal}>
                    <Text style={[sans, styles.dealName]}>{pc.plans[id].name}</Text>
                    <Text style={[sans, styles.dealWas]}>{figures[id].monthly}.–</Text>
                    <Feather name="arrow-right" size={13} color={fog} />
                    <Text style={[sans, styles.dealNow]}>{BF_PRICES[id].monthly}.–</Text>
                  </View>
                ))}
              </View>
              <View style={styles.heroCardSep} />
              <Text style={[sans, styles.cdLabel]}>{c.endsLabel}</Text>
              <Countdown left={left} units={c.units} compact={phone} />
            </View>
          </View>
        </Wrap>
      </View>

      <Marquee text={c.marquee} />

      {/* Prices */}
      <View nativeID="prix-black-friday" style={[styles.pricesBand, { paddingVertical: phone ? 56 : 96 }]}>
        <View style={styles.bandGlow} pointerEvents="none" />
        <Wrap>
          <Eyebrow color={flame}>{c.pricesEyebrow}</Eyebrow>
          <Headline plain={c.pricesPlain} accent={c.pricesAccent} accentColor={flame} color={paper} size={h2Size} style={{ marginTop: 15 }} />
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
                    <Text style={[sans, styles.priceSmall, { color: fog }]}>{c.perMonth}</Text>
                  </View>
                  <Text style={[sans, styles.billed, best && { color: fog }]}>{yearly ? c.billedYearly(chf(offer.yearly)) : c.billedMonthly}</Text>
                  <View style={styles.lifePill}>
                    <Feather name="lock" size={12} color={flame} />
                    <Text style={[sans, styles.lifeText, best && { color: paper }]}>{c.lifetime}</Text>
                  </View>
                  <View style={{ marginTop: 18 }}>
                    <FlameBtn label={c.planCta(plan.name)} href={signup(id)} ghost={!best} block />
                  </View>
                  <View style={styles.lines}>
                    {[pc.membersStorage(normal.members, Math.round(normal.storageMb / 1024)), ...plan.lines].map((l) => (
                      <View key={l} style={styles.lineRow}>
                        <Feather name="check" size={13} color={flame} style={{ marginTop: 3 }} />
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

      {/* The product, live */}
      <Band>
        <View style={[stack ? { gap: 36 } : { flexDirection: 'row', alignItems: 'center', gap: 70 }]}>
          <View style={stack ? undefined : { flex: 0.9 }}>
            <Eyebrow color={flame}>{c.showEyebrow}</Eyebrow>
            <Headline plain={c.showPlain} accent={c.showAccent} accentColor={flame} color={paper} size={h2Size} style={{ marginTop: 15 }} />
            <Text style={[sans, styles.whyText, { marginTop: 16, fontSize: 14, lineHeight: 24 }]}>{c.showText}</Text>
            <View style={{ marginTop: 26, alignSelf: 'flex-start' }}>
              <FlameBtn label={c.cta} onPress={toPrices} />
            </View>
          </View>
          <View style={[styles.showStage, stack ? undefined : { flex: 1.2 }]}>
            <View style={styles.showGlow} pointerEvents="none" />
            <HeroDevices locale={locale} phoneOnly={phone} labels={{ desktop: c.showDesktop, phone: c.showPhone }} />
          </View>
        </View>
      </Band>

      {/* Why for life */}
      <Band alt>
        <Eyebrow color={flame}>{c.whyEyebrow}</Eyebrow>
        <Headline plain={c.whyPlain} accent={c.whyAccent} accentColor={flame} color={paper} size={h2Size} style={{ marginTop: 15, marginBottom: 34 }} />
        <View style={[styles.grid3, stack && { flexDirection: 'column' }]}>
          {c.why.map((w, i) => (
            <View key={w.title} style={[styles.whyCard, stack ? undefined : { flex: 1 }]}>
              <Text style={[sans, styles.whyNum]}>{String(i + 1).padStart(2, '0')}</Text>
              <Text style={[sans, styles.whyTitle]}>{w.title}</Text>
              <Text style={[sans, styles.whyText]}>{w.text}</Text>
            </View>
          ))}
        </View>
      </Band>

      {/* Included */}
      <Band>
        <Eyebrow color={flame}>{c.includedEyebrow}</Eyebrow>
        <Headline plain={c.includedTitle} color={paper} size={h2Size} style={{ marginTop: 15, marginBottom: 30 }} />
        <View style={styles.incl}>
          {c.included.map((it) => (
            <View key={it} style={[styles.inclItem, { width: phone ? '100%' : stack ? '48%' : '23.5%' }]}>
              <Feather name="check-circle" size={16} color={flame} />
              <Text style={[sans, styles.inclText]}>{it}</Text>
            </View>
          ))}
        </View>
      </Band>

      {/* Steps */}
      <Band alt>
        <Eyebrow color={flame}>{c.stepsEyebrow}</Eyebrow>
        <Headline plain={c.stepsTitle} color={paper} size={h2Size} style={{ marginTop: 15, marginBottom: 30 }} />
        <View style={[styles.grid3, stack && { flexDirection: 'column' }]}>
          {c.steps.map((s, i) => (
            <View key={s.title} style={[styles.step, stack ? undefined : { flex: 1 }]}>
              <View style={styles.stepNum}>
                <Text style={[sans, styles.stepNumText, { color: '#fff' }]}>{i + 1}</Text>
              </View>
              <Text style={[sans, styles.whyTitle]}>{s.title}</Text>
              <Text style={[sans, styles.whyText]}>{s.text}</Text>
            </View>
          ))}
        </View>
      </Band>

      {/* FAQ */}
      <Band>
        <View style={{ maxWidth: 860 }}>
          <Eyebrow color={flame}>{c.faqEyebrow}</Eyebrow>
          <Headline plain={c.faqTitle} color={paper} size={phone ? 32 : 42} style={{ marginTop: 15, marginBottom: 30 }} />
          {c.faq.map((q, i) => (
            <DarkFaq key={q.q} q={q.q} a={q.a} last={i === c.faq.length - 1} />
          ))}
        </View>
      </Band>

      {/* Final */}
      <View style={[styles.hero, { paddingVertical: phone ? 56 : 90 }]}>
        <Wrap>
          <View style={[stack ? { gap: 30 } : { flexDirection: 'row', alignItems: 'center', gap: 60 }]}>
            <View style={stack ? undefined : { flex: 1 }}>
              <Headline plain={c.finalTitle} size={phone ? 32 : 46} color={paper} />
              <Text style={[sans, styles.heroLead, { fontSize: 14 }]}>{c.finalText}</Text>
              <View style={{ marginTop: 26, alignSelf: 'flex-start' }}>
                <FlameBtn label={c.cta} onPress={toPrices} large={!phone} />
              </View>
            </View>
            <View style={stack ? undefined : { flex: 0.8 }}>
              <Countdown left={left} units={c.units} compact={phone} />
            </View>
          </View>
        </Wrap>
      </View>
      {phone && showSticky ? <StickyBar left={left} label={c.stickyCta} ends={c.stickyEnds} onPress={toPrices} /> : null}
    </SitePage>
  );
}

// A ribbon of text running across the page, endlessly.
function Marquee({ text }: { text: string }) {
  const x = useRef(new Animated.Value(0)).current;
  const [w, setW] = useState(0);
  useEffect(() => {
    if (!w) return;
    x.setValue(0);
    const loop = Animated.loop(Animated.timing(x, { toValue: -w, duration: w * 22, easing: Easing.linear, useNativeDriver: Platform.OS !== 'web' }));
    loop.start();
    return () => loop.stop();
  }, [w, x]);
  return (
    <View style={styles.marquee}>
      <Animated.View style={{ flexDirection: 'row', transform: [{ translateX: x }] }}>
        {[0, 1, 2].map((k) => (
          <Text key={k} onLayout={k === 0 ? (e) => setW(e.nativeEvent.layout.width) : undefined} style={[sans, styles.marqueeText]}>
            {text.repeat(2)}
          </Text>
        ))}
      </Animated.View>
    </View>
  );
}

// Phone only: the time left and the button stay at the bottom of the screen.
function StickyBar({ left, label, ends, onPress }: { left: number | null; label: string; ends: string; onPress: () => void }) {
  const s = Math.floor((left ?? 0) / 1000);
  const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  const time = left == null ? '--' : `${d > 0 ? `${d}j ` : ''}${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  const bar = (
    <View style={styles.sticky}>
      <View style={{ flex: 1 }}>
        <Text style={[sans, styles.stickyEnds]}>{ends.toUpperCase()}</Text>
        <Text style={[sans, styles.stickyTime, { fontVariant: ['tabular-nums'] }]}>{time}</Text>
      </View>
      <Pressable onPress={onPress} style={styles.stickyBtn} accessibilityRole="button">
        <Text style={[sans, styles.stickyBtnText]}>{label}</Text>
        <Feather name="arrow-right" size={15} color="#fff" />
      </Pressable>
    </View>
  );
  // In the page the bar would be fixed to the scrolling content, not to the
  // screen: it is put straight into <body>.
  if (Platform.OS === 'web' && typeof document !== 'undefined') {
    // react-dom ships without types here; only createPortal is needed.
    const { createPortal } = require('react-dom') as { createPortal: (node: React.ReactNode, container: Element) => React.ReactElement };
    return createPortal(bar, document.body);
  }
  return bar;
}

function Band({ alt, children }: { alt?: boolean; children: React.ReactNode }) {
  const { phone } = useSiteLayout();
  return (
    <View style={{ paddingVertical: phone ? 56 : 92, backgroundColor: alt ? night2 : night, borderTopWidth: 1, borderTopColor: nightLine }}>
      <Wrap>{children}</Wrap>
    </View>
  );
}

// The flame button of the page: a link (sign-up) or an action (scroll).
function FlameBtn({ label, href, onPress, large, block, ghost }: { label: string; href?: string; onPress?: () => void; large?: boolean; block?: boolean; ghost?: boolean }) {
  const button = (
    <Hover
      accessibilityRole={href ? 'link' : 'button'}
      onPress={onPress}
      base={[styles.fBtn, large && styles.fBtnLarge, block && { alignSelf: 'stretch' }, ghost && styles.fBtnGhost]}
      hover={ghost ? { backgroundColor: flame, borderColor: flame } : { backgroundColor: '#ff7440' }}
    >
      {() => (
        <>
          <Text style={[sans, styles.fBtnText, large && { fontSize: 16 }]}>{label}</Text>
          <Feather name="arrow-right" size={large ? 18 : 15} color="#fff" />
        </>
      )}
    </Hover>
  );
  if (!href) return button;
  return (
    <Link href={href as any} asChild>
      {button}
    </Link>
  );
}

function DarkFaq({ q, a, last }: { q: string; a: string; last?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <View style={[styles.faqItem, last && { borderBottomWidth: 1 }]}>
      <Pressable onPress={() => setOpen((o) => !o)} accessibilityRole="button" aria-expanded={open} style={styles.faqQ}>
        <Text style={[sans, styles.faqQText]}>{q}</Text>
        <Text style={[sans, styles.faqSign]}>{open ? '−' : '+'}</Text>
      </Pressable>
      {/* Kept in the page when closed so the answer stays readable by search engines. */}
      <Text style={[sans, styles.faqA, !open && { display: 'none' }]}>{a}</Text>
    </View>
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
  hero: { backgroundColor: night, overflow: 'hidden' },
  aurora: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, ...(Platform.OS === 'web' ? ({ backgroundImage: 'radial-gradient(60% 70% at 85% 30%, rgba(255,91,31,0.22), rgba(255,91,31,0) 70%), radial-gradient(40% 50% at 10% 100%, rgba(255,91,31,0.10), rgba(255,91,31,0) 70%)' } as object) : {}) },
  gridLines: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, opacity: 0.35, ...(Platform.OS === 'web' ? ({ backgroundImage: 'linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)', backgroundSize: '64px 64px', maskImage: 'radial-gradient(ellipse at 50% 40%, black 30%, transparent 75%)' } as object) : {}) },
  deals: { gap: 8, marginTop: 18 },
  deal: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: nightLine, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 14 },
  dealName: { flex: 1, color: paper, fontSize: 13, fontWeight: '700' },
  dealWas: { color: fog, fontSize: 13, textDecorationLine: 'line-through', textDecorationColor: flame },
  dealNow: { color: flame, fontSize: 18, fontWeight: '800', minWidth: 44, textAlign: 'right' },
  marquee: { backgroundColor: flame, paddingVertical: 13, overflow: 'hidden', flexDirection: 'row' },
  marqueeText: { color: '#0b0c09', fontSize: 15, lineHeight: 22, fontWeight: '900', letterSpacing: 2, flexShrink: 0, ...(Platform.OS === 'web' ? ({ whiteSpace: 'nowrap' } as object) : {}) },
  saveCard: { backgroundColor: night, borderWidth: 1, borderColor: nightLine, borderRadius: 22, padding: 26 },
  saveCardBest: { borderColor: flame, ...(Platform.OS === 'web' ? ({ backgroundImage: 'linear-gradient(160deg, rgba(255,91,31,0.16), rgba(255,91,31,0) 55%)' } as object) : {}) },
  saveName: { color: fog, fontSize: 12, fontWeight: '800', letterSpacing: 1.6, textTransform: 'uppercase' },
  saveBig: { color: paper, fontSize: 56, fontWeight: '800', letterSpacing: -2.4, marginTop: 10 },
  saveYears: { color: flame, fontSize: 13, fontWeight: '700', marginTop: 2 },
  barTrack: { height: 10, borderRadius: 5, backgroundColor: '#2a2d22', marginTop: 22, overflow: 'hidden' },
  barNormal: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: '#3a3e31' },
  barOffer: { position: 'absolute', top: 0, bottom: 0, left: 0, backgroundColor: flame, borderRadius: 5 },
  saveVs: { color: fog, fontSize: 12, marginTop: 10 },
  showStage: { position: 'relative', paddingVertical: 10 },
  showGlow: { position: 'absolute', top: -60, right: -60, bottom: -60, left: -60, ...(Platform.OS === 'web' ? ({ backgroundImage: 'radial-gradient(closest-side, rgba(255,91,31,0.28), rgba(255,91,31,0))' } as object) : {}) },
  sticky: { ...(Platform.OS === 'web' ? ({ position: 'fixed', boxShadow: '0 -12px 30px rgba(0,0,0,0.55)', paddingBottom: 'max(10px, env(safe-area-inset-bottom))' } as object) : {}), left: 0, right: 0, bottom: 0, zIndex: 50, flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#0b0c09', borderTopWidth: 2, borderTopColor: flame, paddingTop: 10, paddingLeft: 18, paddingRight: 12 },
  stickyEnds: { color: fog, fontSize: 9, fontWeight: '800', letterSpacing: 1.4 },
  stickyTime: { color: paper, fontSize: 18, fontWeight: '800', letterSpacing: -0.3 },
  stickyBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: flame, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 16 },
  stickyBtnText: { color: '#fff', fontSize: 13, fontWeight: '800' },
  h1: { color: paper, fontWeight: '500', marginTop: 18 },
  heroLead: { color: fog, fontSize: 16, lineHeight: 28, marginTop: 22, maxWidth: 640 },
  reassure: { flexDirection: 'row', flexWrap: 'wrap', gap: 18, marginTop: 22 },
  reassureItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  reassureText: { color: '#d9dccf', fontSize: 12, fontWeight: '600' },
  heroCard: { borderWidth: 1.5, borderColor: flame, borderRadius: 22, padding: 28, backgroundColor: '#14100b', shadowColor: flame, shadowOpacity: 0.3, shadowRadius: 50, shadowOffset: { width: 0, height: 0 } },
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
  pricesBand: { backgroundColor: night, overflow: 'hidden', borderTopWidth: 1, borderTopColor: nightLine },
  bandGlow: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, ...(Platform.OS === 'web' ? ({ backgroundImage: 'radial-gradient(circle at 85% 0%, rgba(255,91,31,0.16), rgba(255,91,31,0) 45%)' } as object) : {}) },
  switch: { flexDirection: 'row', alignSelf: 'flex-start', backgroundColor: night2, borderWidth: 1, borderColor: nightLine, borderRadius: 999, padding: 4, marginTop: 26, marginBottom: 30 },
  switchBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 9, paddingHorizontal: 18, borderRadius: 999 },
  switchBtnOn: { backgroundColor: flame },
  switchText: { fontSize: 12, fontWeight: '700', color: paper },
  switchExtra: { fontSize: 11, fontWeight: '700', color: flame },
  cards: { flexDirection: 'row', gap: 18, alignItems: 'stretch' },
  card: { backgroundColor: night2, borderWidth: 1, borderColor: nightLine, borderRadius: 22, padding: 26 },
  cardBest: { backgroundColor: '#1a0f09', borderColor: flame, borderWidth: 2, shadowColor: flame, shadowOpacity: 0.25, shadowRadius: 30, shadowOffset: { width: 0, height: 12 } },
  bestTag: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', backgroundColor: flame, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 14 },
  bestTagText: { color: '#fff', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  planName: { fontSize: 22, fontWeight: '700', color: paper },
  pct: { backgroundColor: flame, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4, transform: [{ rotate: '-3deg' }] },
  pctText: { color: '#fff', fontSize: 18, fontWeight: '800' },
  planText: { fontSize: 12, color: fog, marginTop: 6, lineHeight: 19 },
  was: { fontSize: 13, color: fog, marginTop: 18 },
  wasAmount: { textDecorationLine: 'line-through', textDecorationColor: flame },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 2 },
  priceSmall: { fontSize: 13, fontWeight: '700', color: paper },
  price: { fontSize: 60, fontWeight: '800', color: paper, letterSpacing: -2.5 },
  billed: { fontSize: 11, color: fog, marginTop: 2 },
  fBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: flame, borderWidth: 1.5, borderColor: flame, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 22, alignSelf: 'flex-start' },
  fBtnLarge: { paddingVertical: 18, paddingHorizontal: 30 },
  fBtnGhost: { backgroundColor: 'transparent', borderColor: '#4a4f40' },
  fBtnText: { color: '#fff', fontSize: 13, fontWeight: '800' },
  faqItem: { borderTopWidth: 1, borderColor: nightLine },
  faqQ: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16, paddingVertical: 20 },
  faqQText: { flex: 1, color: paper, fontSize: 15, fontWeight: '600', lineHeight: 22 },
  faqSign: { color: flame, fontSize: 22, fontWeight: '500' },
  faqA: { color: fog, fontSize: 13, lineHeight: 22, paddingBottom: 20, maxWidth: 760 },
  lifePill: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', backgroundColor: 'rgba(255,91,31,0.14)', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5, marginTop: 14 },
  lifeText: { fontSize: 11, fontWeight: '700', color: paper },
  saved: { fontSize: 12, fontWeight: '700', color: flame, marginTop: 10 },
  lines: { gap: 8, marginTop: 20 },
  lineRow: { flexDirection: 'row', gap: 8 },
  lineText: { flex: 1, fontSize: 12, color: '#d9dccf', lineHeight: 19 },
  grid3: { flexDirection: 'row', gap: 18 },
  whyCard: { borderTopWidth: 2, borderTopColor: flame, paddingTop: 18, gap: 8 },
  whyNum: { fontSize: 12, fontWeight: '800', color: flame, letterSpacing: 1 },
  whyTitle: { fontSize: 18, fontWeight: '700', color: paper },
  whyText: { fontSize: 13, color: fog, lineHeight: 22 },
  incl: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  inclItem: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: night, borderWidth: 1, borderColor: nightLine, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 14 },
  inclText: { flex: 1, fontSize: 13, fontWeight: '600', color: paper, lineHeight: 19 },
  step: { gap: 10 },
  stepNum: { width: 34, height: 34, borderRadius: 17, backgroundColor: flame, alignItems: 'center', justifyContent: 'center' },
  stepNumText: { color: flame, fontWeight: '800', fontSize: 14 },
});
