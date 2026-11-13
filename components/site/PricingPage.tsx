import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Btn, Eyebrow, Headline, Hover, TextLink, Wrap } from './Primitives';
import { Breadcrumbs, Callout, Section, SectionHead, SitePage, useSiteLayout, usePrefix } from './Sections';
import { FaqItem } from './FamilyPage';
import { useSiteLocale } from './SiteNav';
import { PRICING_COPY, type PlanId } from '../../lib/site/pricing';
import { sans, site } from '../../lib/siteTheme';
import { authHref, planHref } from '../../lib/appHost';
import { supabase } from '../../lib/supabase';

type PlanFigures = { monthly: number; yearly: number | null; members: number; storageMb: number; aiUses: number | null };

// Same figures as the plans table on 10.11.2026. The page reads the live rows
// on load and only falls back to these when the request fails, so the prices
// shown never drift from what Stripe charges.
export const FALLBACK: Record<PlanId, PlanFigures> = {
  solo: { monthly: 39, yearly: 374.4, members: 3, storageMb: 5120, aiUses: 150 },
  equipe: { monthly: 79, yearly: 758.4, members: 10, storageMb: 15360, aiUses: 600 },
  pro: { monthly: 129, yearly: 1238.4, members: 25, storageMb: 40960, aiUses: 2000 },
};
const PLAN_IDS: PlanId[] = ['solo', 'equipe', 'pro'];

// 2000 → "2’000", 31.2 → "31.20"
function chf(n: number): string {
  const [int, dec] = (Number.isInteger(n) ? String(n) : n.toFixed(2)).split('.');
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, '’');
  return dec ? `${grouped}.${dec}` : grouped;
}

function usePlanFigures(): Record<PlanId, PlanFigures> {
  const [figures, setFigures] = useState(FALLBACK);
  useEffect(() => {
    let alive = true;
    supabase
      .from('plans')
      .select('id, price_chf_monthly, price_chf_yearly, max_members, storage_quota_mb, max_ai_uses_per_month')
      .in('id', PLAN_IDS)
      .then(({ data }) => {
        if (!alive || !data?.length) return;
        const next = { ...FALLBACK };
        for (const row of data as any[]) {
          next[row.id as PlanId] = {
            monthly: Number(row.price_chf_monthly),
            yearly: row.price_chf_yearly != null ? Number(row.price_chf_yearly) : null,
            members: Number(row.max_members),
            storageMb: Number(row.storage_quota_mb),
            aiUses: row.max_ai_uses_per_month != null ? Number(row.max_ai_uses_per_month) : null,
          };
        }
        setFigures(next);
      });
    return () => {
      alive = false;
    };
  }, []);
  return figures;
}

export function PricingPage() {
  const locale = useSiteLocale();
  const c = PRICING_COPY[locale];
  const p = usePrefix();
  const { phone, tablet, width } = useSiteLayout();
  const figures = usePlanFigures();
  const [yearly, setYearly] = useState(false);
  const h1Size = phone ? 43 : tablet ? 52 : 62;
  const stackCards = width <= 900;

  return (
    <SitePage title={c.seoTitle} description={c.seoDescription}>
      <View style={{ paddingTop: phone ? 32 : 58, paddingBottom: phone ? 35 : 52 }}>
        <Wrap>
          <Breadcrumbs items={[{ label: SITE_HOME[locale], href: p || '/' }, { label: c.crumb }]} />
          <Eyebrow>{c.eyebrow}</Eyebrow>
          <Headline level={1} size={h1Size} plain={c.h1Plain} accent={c.h1Accent} style={[styles.h1, { letterSpacing: phone ? -1.9 : -3, lineHeight: h1Size * 1.06 }]} />
          <Text style={[sans, styles.lead, phone && { fontSize: 13, lineHeight: 24 }]}>{c.lead}</Text>
          <View style={styles.switch} role="radiogroup">
            <SwitchButton label={c.monthly} active={!yearly} onPress={() => setYearly(false)} />
            <SwitchButton label={c.yearly} extra={c.yearlySave} active={yearly} onPress={() => setYearly(true)} />
          </View>
        </Wrap>
      </View>

      <View style={{ paddingBottom: phone ? 53 : 86 }}>
        <Wrap>
          <View style={[styles.prices, stackCards && { flexDirection: 'column' }]}>
            {PLAN_IDS.map((id) => {
              const f = figures[id];
              const plan = c.plans[id];
              const featured = id === 'equipe';
              const shown = yearly && f.yearly != null ? f.yearly / 12 : f.monthly;
              const lines = [c.membersStorage(f.members, Math.round(f.storageMb / 1024)), ...plan.lines, ...(f.aiUses != null ? [c.assistantUses(chf(f.aiUses))] : [])];
              return (
                <View key={id} style={[styles.card, featured && { borderColor: site.copper }, stackCards ? undefined : { flex: 1 }]}>
                  {featured ? (
                    <View style={styles.cardLabel}>
                      <Text style={[sans, styles.cardLabelText]}>{c.featuredLabel}</Text>
                    </View>
                  ) : null}
                  <Text role="heading" aria-level={2} style={[sans, styles.planName]}>
                    {plan.name}
                  </Text>
                  <Text style={[sans, styles.planText]}>{plan.text}</Text>
                  <View style={styles.priceRow}>
                    <Text style={[sans, styles.priceSmall]}>CHF</Text>
                    <Text style={[sans, styles.price, { fontVariant: ['tabular-nums'] }]}>{chf(Math.round(shown * 100) / 100)}</Text>
                    <Text style={[sans, styles.priceSmall, { color: site.muted }]}>{c.perMonth}</Text>
                  </View>
                  <Text style={[sans, styles.billed]}>{yearly && f.yearly != null ? c.billedYearly(chf(f.yearly)) : c.billedMonthly}</Text>
                  <Btn label={plan.cta} href={authHref('signup')} tone={featured ? 'copper' : 'light'} block />
                  <View style={styles.lines}>
                    {lines.map((l) => (
                      <View key={l} style={styles.lineRow}>
                        <Feather name="check" size={13} color={site.green} style={{ marginTop: 3 }} />
                        <Text style={[sans, styles.lineText]}>{l}</Text>
                      </View>
                    ))}
                  </View>
                  <View style={{ marginTop: 16 }}>
                    <TextLink label={c.planDetail} href={planHref(id)} size={11} color={site.muted} />
                  </View>
                </View>
              );
            })}
          </View>
          <Text style={[sans, styles.proof]}>{c.proof}</Text>
          <View style={{ marginTop: 26 }}>
            <Callout strong={c.calloutStrong} text="" link={<TextLink label={c.calloutLink} href={`${p}/sur-mesure`} />} />
          </View>
        </Wrap>
      </View>

      <Section white>
        <SectionHead eyebrow={c.compareEyebrow} plain={c.compareTitle} text={c.compareNote} />
        <ComparisonTable />
      </Section>

      <Section>
        <View style={styles.faq}>
          <Eyebrow>{c.faqEyebrow}</Eyebrow>
          <Headline plain={c.faqTitle} size={phone ? 32 : 42} style={{ marginTop: 15, marginBottom: 30 }} />
          {c.faq.map((q, i) => (
            <FaqItem key={q.q} q={q.q} a={q.a} last={i === c.faq.length - 1} />
          ))}
        </View>
      </Section>
    </SitePage>
  );
}

// The plan comparison, the same on /tarifs and on each plan's own page
// (components/PlanDetailPage), with that plan's column marked.
export function ComparisonTable({ current }: { current?: PlanId }) {
  const locale = useSiteLocale();
  const c = PRICING_COPY[locale];
  const figures = usePlanFigures();
  const cell = (planIdx: number, value: string | boolean) => {
    if (value === true) return <Text style={[sans, styles.tdText, { color: site.green }]}>{c.table.included}</Text>;
    if (value === false) return <Text style={[sans, styles.tdText, { color: '#b5b8ad' }]}>—</Text>;
    return <Text style={[sans, styles.tdText, current === PLAN_IDS[planIdx] && { fontWeight: '600' }]}>{value}</Text>;
  };
  const dynamicCells = (kind: 'members' | 'storage' | 'assistant') =>
    PLAN_IDS.map((id) => {
      const f = figures[id];
      if (kind === 'members') return String(f.members);
      if (kind === 'storage') return `${Math.round(f.storageMb / 1024)} ${locale === 'fr' ? 'Go' : 'GB'}`;
      return f.aiUses != null ? chf(f.aiUses) : '∞';
    });

  return (
    <ScrollView horizontal style={styles.tableWrap} contentContainerStyle={{ minWidth: '100%' }}>
          <View style={styles.table}>
            <View style={[styles.tr, styles.thead]}>
              <Text style={[sans, styles.th, styles.firstCol]}>{c.table.feature}</Text>
              {PLAN_IDS.map((id) => (
                <Text key={id} style={[sans, styles.th, styles.col, id === current && { color: site.copper }]}>
                  {c.plans[id].name}
                </Text>
              ))}
            </View>
            {c.table.groups.map((g) => (
              <View key={g.title}>
                <View style={[styles.tr, styles.group]}>
                  <Text style={[sans, styles.groupText]}>{g.title.toUpperCase()}</Text>
                </View>
                {g.rows.map((r) => {
                  const values = typeof r.cells === 'string' ? dynamicCells(r.cells) : r.cells;
                  return (
                    <View key={r.label} style={styles.tr}>
                      <Text style={[sans, styles.tdText, styles.firstCol, { textAlign: 'left' }]}>{r.label}</Text>
                      {values.map((v, i) => (
                        <View key={i} style={[styles.col, PLAN_IDS[i] === current && styles.colOn]}>
                          {cell(i, v)}
                        </View>
                      ))}
                    </View>
                  );
                })}
              </View>
            ))}
          </View>
        </ScrollView>
  );
}

const SITE_HOME = { fr: 'Accueil', de: 'Startseite', it: 'Home' } as const;

function SwitchButton({ label, extra, active, onPress }: { label: string; extra?: string; active: boolean; onPress: () => void }) {
  return (
    <Hover onPress={onPress} accessibilityRole="radio" aria-checked={active} base={[styles.switchBtn, active && styles.switchActive]}>
      <Text style={[sans, { fontSize: 11, color: site.ink }]}>
        {label}
        {extra ? <Text style={{ fontSize: 9, color: '#9c5733' }}>{'  '}{extra}</Text> : null}
      </Text>
    </Hover>
  );
}

const styles = StyleSheet.create({
  h1: { marginTop: 17, marginBottom: 21, fontWeight: '400', maxWidth: 850 },
  lead: { fontSize: 15, color: site.muted, lineHeight: 28, maxWidth: 610 },
  switch: { flexDirection: 'row', alignSelf: 'flex-start', backgroundColor: '#eaece2', padding: 4, borderWidth: 1, borderColor: '#dedfd2', borderRadius: 6, marginTop: 20 },
  switchBtn: { paddingVertical: 8, paddingHorizontal: 18, borderRadius: 3 },
  switchActive: { backgroundColor: site.white, boxShadow: '0 2px 4px rgba(41,49,40,0.05)' } as object,
  prices: { flexDirection: 'row', gap: 20 },
  card: { position: 'relative', backgroundColor: site.white, borderWidth: 1, borderColor: site.line, borderRadius: 10, padding: 29 },
  cardLabel: { position: 'absolute', top: -11, right: 22, paddingVertical: 4, paddingHorizontal: 8, backgroundColor: site.copper, borderRadius: 3 },
  cardLabelText: { color: '#ffffff', fontSize: 8, letterSpacing: 0.7, fontWeight: '600' },
  planName: { fontSize: 20, fontWeight: '500', letterSpacing: -0.4, color: site.ink, marginBottom: 8 },
  planText: { fontSize: 12, color: site.muted, minHeight: 36, maxWidth: 250, lineHeight: 18 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 25 },
  price: { fontSize: 46, lineHeight: 55, letterSpacing: -1.8, color: site.ink },
  priceSmall: { fontSize: 11, color: site.ink },
  billed: { fontSize: 9, color: '#6b6f65', minHeight: 20, marginTop: 8, marginBottom: 22 },
  lines: { marginTop: 24, paddingTop: 18, borderTopWidth: 1, borderTopColor: site.line, gap: 8 },
  lineRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  lineText: { fontSize: 11, color: site.ink, lineHeight: 19, flex: 1 },
  proof: { fontSize: 11, color: '#6f7566', marginTop: 18, lineHeight: 18, maxWidth: 760 },
  tableWrap: { borderWidth: 1, borderColor: site.line, borderRadius: 8 },
  table: { minWidth: 680, width: '100%', backgroundColor: site.white },
  tr: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: site.line },
  thead: { backgroundColor: site.white },
  th: { fontSize: 12, fontWeight: '600', color: site.ink, paddingVertical: 17, paddingHorizontal: 22, textAlign: 'center' },
  firstCol: { flex: 1.6, textAlign: 'left', paddingVertical: 17, paddingHorizontal: 22 },
  col: { flex: 1, alignItems: 'center', paddingVertical: 17, paddingHorizontal: 12 },
  colOn: { backgroundColor: '#f8f1e8' },
  group: { backgroundColor: '#f2f0ea', paddingVertical: 12, paddingHorizontal: 22 },
  groupText: { fontSize: 9, letterSpacing: 0.9, fontWeight: '600', color: '#818775' },
  tdText: { fontSize: 12, color: site.ink, textAlign: 'center' },
  faq: { maxWidth: 820, width: '100%', marginHorizontal: 'auto' },
});
