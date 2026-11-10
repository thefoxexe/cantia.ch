import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Btn, Eyebrow, Headline, TextLink, Wrap } from './site/Primitives';
import { Breadcrumbs, Section, SectionHead, SitePage, useSiteLayout } from './site/Sections';
import { FaqItem } from './site/FamilyPage';
import { SITE_PAGES } from '../lib/site/pages';
import { PRICING_COPY } from '../lib/site/pricing';
import { ComparisonTable, FALLBACK } from './site/PricingPage';
import { sans, site } from '../lib/siteTheme';
import { supabase } from '../lib/supabase';
import { authHref, planHref } from '../lib/appHost';
import { getAppLocale, useTranslation } from '../lib/translations';
import type { Plan } from '../lib/types';

type PlanId = 'solo' | 'equipe' | 'pro';
type IconName = keyof typeof Feather.glyphMap;

const PLAN_ORDER: PlanId[] = ['solo', 'equipe', 'pro'];
const NEXT_PLAN: Record<PlanId, PlanId | null> = { solo: 'equipe', equipe: 'pro', pro: null };


// The dedicated, highly-converting per-plan page opened from "En savoir
// plus" on both the marketing pricing cards (PricingSection) and the
// in-app choose-plan screen — one component driven entirely by i18n keys
// (lib/translations/*.ts, `planPage` namespace) plus a live `plans` row for
// the numbers (price/storage/members/AI quota), so the /de and /it route
// files only need `forceLocale(...)` + this component, never their own copy
// (unlike the /solutions/* pages, which hardcode prose per language).
export function PlanDetailPage({ planId }: { planId: PlanId }) {
  const { t } = useTranslation();
  const locale = (getAppLocale() as 'fr' | 'de' | 'it') ?? 'fr';
  const P = PRICING_COPY[locale] ?? PRICING_COPY.fr;
  const pre = locale === 'fr' ? '' : `/${locale}`;
  const [plans, setPlans] = useState<Record<string, Plan>>({});
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('month');
  const { phone, tablet, width, h2Size } = useSiteLayout();

  useEffect(() => {
    supabase
      .from('plans')
      .select('*')
      .in('id', PLAN_ORDER)
      .then(({ data }) => {
        const byId: Record<string, Plan> = {};
        (data ?? []).forEach((p) => { byId[p.id] = p; });
        setPlans(byId);
      });
  }, []);

  const plan = plans[planId];
  const keyFeatures = t(`planPage.plans.${planId}.keyFeatures`, { returnObjects: true }) as { icon: IconName; title: string; text: string }[];
  const notIncluded = t(`planPage.plans.${planId}.notIncluded`, { returnObjects: true }) as string[];
  const everyPlanItems = t('planPage.everyPlanItems', { returnObjects: true }) as string[];
  const heroText = t(`planPage.plans.${planId}.heroText`);
  const nextPlanId = NEXT_PLAN[planId];
  const nameOf = (id: PlanId) => P.plans[id]?.name ?? plans[id]?.name ?? id;
  const name = nameOf(planId);

  const isYearly = billingInterval === 'year';
  // Live figures from the plans table; the same fallback as /tarifs until they load.
  const fb = FALLBACK[planId];
  const monthly = plan?.price_chf_monthly ?? fb.monthly;
  const yearly = plan?.price_chf_yearly ?? fb.yearly;
  const displayMonthly = isYearly && yearly != null ? yearly / 12 : monthly;
  const h1 = phone ? 54 : tablet ? 64 : 84;
  const faq = [
    { q: t('planPage.faqChangePlanQ'), a: t('planPage.faqChangePlanA') },
    { q: t('planPage.faqCommitmentQ'), a: t('planPage.faqCommitmentA') },
    { q: t('planPage.faqVatQ'), a: t('planPage.faqVatA') },
  ];

  return (
    <SitePage title={`${name} | Cantia`} description={heroText} cta={false}>
      {/* Hero with the live price */}
      <View style={{ paddingTop: phone ? 32 : 58, paddingBottom: phone ? 40 : 70 }}>
        <Wrap>
          <Breadcrumbs items={[{ label: SITE_PAGES[locale].labels.home, href: pre || '/' }, { label: P.eyebrow, href: `${pre}/tarifs` }, { label: name }]} />
          <View style={[styles.lead, phone ? { flexDirection: 'column', alignItems: 'stretch', gap: 30 } : { gap: 60 }]}>
            <View style={phone ? undefined : { flex: 1.2, minWidth: 0 }}>
              <Eyebrow>{t('pricingSection.eyebrow')}</Eyebrow>
              <Headline level={1} plain={name} size={h1} style={{ marginTop: 16, marginBottom: 20 }} />
              <Text style={[sans, styles.leadText, phone && { fontSize: 13, lineHeight: 24 }]}>{heroText}</Text>
              <View style={styles.actions}>
                <View>
                  <Btn label={t('planPage.ctaTrial')} href={authHref('signup', { plan: planId, billing: billingInterval })} small={phone} />
                </View>
                <View>
                  <TextLink label={t('planPage.ctaAllPlans')} href={`${pre}/tarifs`} size={phone ? 11 : 12} />
                </View>
              </View>
            </View>
            <View style={[styles.priceCard, phone ? undefined : { flex: 0.8 }]}>
              <Text style={[sans, styles.priceLabel]}>{t('planPage.comparePrice').toUpperCase()}</Text>
              <View style={styles.priceRow}>
                <Text style={[sans, styles.currency]}>CHF</Text>
                <Text style={[sans, styles.price]}>{Number.isInteger(displayMonthly) ? displayMonthly : displayMonthly.toFixed(2)}</Text>
                <Text style={[sans, styles.period]}>{t('planPage.perMonth')}</Text>
              </View>
              <Pressable onPress={() => setBillingInterval((v) => (v === 'year' ? 'month' : 'year'))} style={styles.toggle} accessibilityRole="switch" accessibilityState={{ checked: isYearly }}>
                <View style={[styles.track, isYearly && { backgroundColor: site.copper }]}>
                  <View style={[styles.knob, isYearly && { transform: [{ translateX: 16 }] }]} />
                </View>
                <Text style={[sans, styles.toggleText]}>{isYearly ? t('authChoosePlan.billingYearly') : t('authChoosePlan.billingMonthly')}</Text>
              </Pressable>
            </View>
          </View>
        </Wrap>
      </View>

      {/* Key features */}
      <Section white>
        <SectionHead eyebrow={name} plain={t('planPage.keyFeaturesTitle')} />
        <View style={styles.grid}>
          {(keyFeatures ?? []).map((f) => (
            <View key={f.title} style={[styles.card, { width: phone ? '100%' : width <= 900 ? '47%' : '30.5%' }]}>
              <Feather name={f.icon} size={18} color={site.copper} />
              <Text style={[sans, styles.cardTitle]}>{f.title}</Text>
              <Text style={[sans, styles.body]}>{f.text}</Text>
            </View>
          ))}
        </View>
      </Section>

      {/* Included in every plan / not in this one */}
      <Section>
        <View style={[styles.split, phone && { flexDirection: 'column', gap: 36 }]}>
          <View style={{ flex: 1 }}>
            <Text style={[sans, styles.listHead]}>{t('planPage.everyPlanTitle')}</Text>
            {(everyPlanItems ?? []).map((item) => (
              <View key={item} style={styles.listRow}>
                <Feather name="check" size={15} color={site.copper} style={{ marginTop: 3 }} />
                <Text style={[sans, styles.listText]}>{item}</Text>
              </View>
            ))}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[sans, styles.listHead]}>{t('planPage.notIncludedTitle')}</Text>
            {notIncluded && notIncluded.length > 0 ? (
              <>
                {notIncluded.map((item) => (
                  <View key={item} style={styles.listRow}>
                    <Feather name="minus" size={15} color={site.muted} style={{ marginTop: 3 }} />
                    <Text style={[sans, styles.listText, { color: site.muted }]}>{item}</Text>
                  </View>
                ))}
                {nextPlanId ? (
                  <View style={{ marginTop: 18 }}>
                    <TextLink label={t('planPage.notIncludedUpgradeCta', { name: nameOf(nextPlanId) })} href={planHref(nextPlanId)} />
                  </View>
                ) : null}
              </>
            ) : (
              <View style={styles.listRow}>
                <Feather name="award" size={16} color={site.copper} style={{ marginTop: 3 }} />
                <View style={{ flex: 1, gap: 4 }}>
                  <Text style={[sans, styles.listText]}>{t('planPage.notIncludedNoneTitle')}</Text>
                  <Text style={[sans, styles.body]}>{t('planPage.notIncludedNoneText', { name })}</Text>
                </View>
              </View>
            )}
          </View>
        </View>
      </Section>

      {/* Comparison: the same table as /tarifs, this plan's column marked */}
      <Section white>
        <SectionHead eyebrow={P.eyebrow} plain={P.compareTitle} text={P.compareNote} />
        <ComparisonTable current={planId} />
      </Section>

      {/* FAQ */}
      <Section>
        <View style={styles.faq}>
          <Eyebrow>{SITE_PAGES[locale].labels.faqEyebrow}</Eyebrow>
          <Headline plain={t('planPage.faqEyebrow')} size={h2Size} style={{ marginTop: 15, marginBottom: 30 }} />
          {faq.map((f, i) => (
            <FaqItem key={f.q} q={f.q} a={f.a} last={i === faq.length - 1} />
          ))}
          <View style={styles.others}>
            <Text style={[sans, styles.othersLabel]}>{t('planPage.otherPlansTitle')}</Text>
            {PLAN_ORDER.filter((id) => id !== planId).map((id) => (
              <View key={id}>
                <TextLink label={nameOf(id)} href={planHref(id)} size={12} />
              </View>
            ))}
          </View>
        </View>
      </Section>

      <View style={[styles.cta, { paddingVertical: phone ? 40 : 58 }]}>
        <Wrap style={phone ? undefined : styles.ctaRow}>
          <View style={phone ? undefined : { flex: 1, maxWidth: 720 }}>
            <Headline plain={t('planPage.closingTitle', { name })} size={phone ? 30 : 36} color="#f4f3e9" />
            <Text style={[sans, { fontSize: 12, color: '#b2b9a7', marginTop: 15 }]}>{t('planPage.closingText')}</Text>
          </View>
          <View style={phone ? { marginTop: 22 } : undefined}>
            <Btn label={t('planPage.ctaTrial')} href={authHref('signup', { plan: planId, billing: billingInterval })} tone="sand" />
          </View>
        </Wrap>
      </View>
    </SitePage>
  );
}

const styles = StyleSheet.create({
  lead: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  leadText: { fontSize: 15, color: site.muted, lineHeight: 28, maxWidth: 600 },
  actions: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 25, marginTop: 26 },
  priceCard: { backgroundColor: site.white, borderWidth: 1, borderColor: site.line, borderRadius: 10, padding: 30 },
  priceLabel: { fontSize: 9, letterSpacing: 1.5, color: site.muted, fontWeight: '600' },
  priceRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginTop: 14 },
  currency: { fontSize: 14, color: site.muted, marginBottom: 10 },
  price: { fontSize: 64, lineHeight: 68, letterSpacing: -2.5, color: site.ink, fontVariant: ['tabular-nums'] },
  period: { fontSize: 12, color: site.muted, marginBottom: 12 },
  toggle: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 22, alignSelf: 'flex-start' },
  track: { width: 36, height: 20, borderRadius: 10, backgroundColor: '#d7dacf', padding: 2 },
  knob: { width: 16, height: 16, borderRadius: 8, backgroundColor: '#ffffff' },
  toggleText: { fontSize: 12, color: site.ink },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 34 },
  card: { borderTopWidth: 1, borderTopColor: site.line, paddingTop: 24 },
  cardTitle: { fontSize: 18, lineHeight: 25, letterSpacing: -0.3, color: site.ink, marginTop: 18, marginBottom: 10 },
  body: { fontSize: 12, color: site.muted, lineHeight: 22 },
  split: { flexDirection: 'row', gap: 70 },
  listHead: { fontSize: 18, color: site.ink, letterSpacing: -0.3, marginBottom: 16 },
  listRow: { flexDirection: 'row', gap: 12, paddingVertical: 10, borderTopWidth: 1, borderTopColor: site.line, alignItems: 'flex-start' },
  listText: { flex: 1, fontSize: 13, color: site.ink, lineHeight: 21 },
  table: { minWidth: 640, width: '100%', borderTopWidth: 1, borderTopColor: site.line },
  tRow: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: site.line, minHeight: 48 },
  tHead: { minHeight: 56 },
  tLabel: { flex: 1.6, paddingRight: 12 },
  tLabelText: { fontSize: 12, color: site.ink },
  tCol: { flex: 1, alignItems: 'center', justifyContent: 'center', alignSelf: 'stretch' },
  tColOn: { backgroundColor: '#f6ebe1' },
  tPlan: { fontSize: 14, color: site.ink, fontWeight: '500' },
  tCell: { fontSize: 12, color: site.ink, textAlign: 'center' },
  faq: { maxWidth: 820, width: '100%', marginHorizontal: 'auto' },
  others: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 22, marginTop: 30 },
  othersLabel: { fontSize: 12, color: site.muted },
  cta: { backgroundColor: '#293128' },
  ctaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 40 },
});
