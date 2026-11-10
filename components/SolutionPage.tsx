import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Btn, Eyebrow, Headline, Hover, TextLink, Wrap } from './site/Primitives';
import { Breadcrumbs, DocVisual, Section, SectionHead, SitePage, useSiteLayout, usePrefix } from './site/Sections';
import { EXPORTS } from './site/exports';
import { FaqItem } from './site/FamilyPage';
import { useSiteLocale } from './site/SiteNav';
import { SITE_PAGES } from '../lib/site/pages';
import { sans, serif, site } from '../lib/siteTheme';
import { useMarketingDict } from '../lib/i18n';
import { authHref } from '../lib/appHost';
import type { DocumentId } from './landing/DocumentShowcase';

type IconName = keyof typeof Feather.glyphMap;

export interface SolutionFeature {
  icon: IconName;
  title: string;
  text: string;
}

export interface SolutionStep {
  title: string;
  text: string;
}

export interface SolutionFaqItem {
  question: string;
  answer: string;
}

export interface SolutionRelatedLink {
  href: string;
  label: string;
}

const T = {
  fr: { try: 'Essayer Cantia', pricing: 'Voir les tarifs', features: 'Ce que fait le module', featuresTitle: 'Tout ce qu’il faut, rien de plus.', steps: 'Dans votre quotidien', stepsTitle: 'Comment ça se passe.', faq: 'Les réponses utiles', faqTitle: 'Vos questions.', related: 'Voir aussi', relatedTitle: 'Les modules qui vont avec.', docTitle: 'Ce que montre le document.' },
  de: { try: 'Cantia testen', pricing: 'Preise ansehen', features: 'Was das Modul macht', featuresTitle: 'Alles Nötige, nichts zu viel.', steps: 'In Ihrem Alltag', stepsTitle: 'So läuft es ab.', faq: 'Die wichtigsten Antworten', faqTitle: 'Ihre Fragen.', related: 'Siehe auch', relatedTitle: 'Die passenden Module.', docTitle: 'Was das Dokument zeigt.' },
  it: { try: 'Provare Cantia', pricing: 'Vedere i prezzi', features: 'Cosa fa il modulo', featuresTitle: 'Tutto il necessario, niente di più.', steps: 'Nella vostra giornata', stepsTitle: 'Come funziona.', faq: 'Le risposte utili', faqTitle: 'Le vostre domande.', related: 'Vedi anche', relatedTitle: 'I moduli che vanno insieme.', docTitle: 'Cosa mostra il documento.' },
} as const;

// "Saurez-vous payer les salaires dans trois semaines ?" -> plain + accent:
// the last sentence (or the part after a dash) becomes the serif accent.
function splitTitle(title: string): [string, string | undefined] {
  const dash = title.lastIndexOf(' : ');
  if (dash > 0) return [title.slice(0, dash), title.slice(dash + 3)];
  const m = title.match(/^(.+?[.?!:])\s+(\S.+)$/);
  if (m) return [m[1], m[2]];
  return [title, undefined];
}

// The detail page of one module (cantia.ch/solutions/*): same layout as the
// family pages — hero with the real visual, the features, the real export
// points, the steps, the questions, related modules.
export function SolutionPage({
  kicker,
  title,
  subtitle,
  visual,
  visualBelow = false,
  features,
  afterFeatures,
  documentId,
  steps,
  faq,
  related,
  closingTitle,
  closingText,
}: {
  kicker: string;
  title: string;
  subtitle: string;
  visual?: ReactNode;
  // A wide screen of the app: shown full width under the title, not beside it.
  visualBelow?: boolean;
  features: SolutionFeature[];
  afterFeatures?: ReactNode;
  documentId?: DocumentId;
  steps?: SolutionStep[];
  faq?: SolutionFaqItem[];
  related?: SolutionRelatedLink[];
  closingTitle: string;
  closingText: string;
}) {
  const locale = useSiteLocale();
  const L = SITE_PAGES[locale].labels;
  const t = T[locale] ?? T.fr;
  const p = usePrefix();
  const { phone, tablet, width } = useSiteLayout();
  const docsDict = useMarketingDict().documents;
  const doc = documentId ? docsDict.docs.find((d) => d.id === documentId) : undefined;
  // The real export of this document, beside what it shows (when Cantia
  // has rendered it in every language).
  const X = EXPORTS[locale];
  const pdf = documentId === 'devis' ? X.devisFull : documentId === 'facture' ? X.facture : documentId === 'rapport' ? X.rapport : null;
  const [plain, accent] = splitTitle(title);
  const h1Size = phone ? 38 : tablet ? 44 : 52;
  const cols = phone ? 1 : width <= 900 ? 2 : 3;

  return (
    <SitePage title={`${title} | Cantia`} description={subtitle} cta={false}>
      {/* Hero */}
      <View style={{ paddingTop: phone ? 32 : 58, paddingBottom: phone ? 40 : 70 }}>
        <Wrap>
          <Breadcrumbs items={[{ label: L.home, href: p || '/' }, { label: L.software, href: `${p}/fonctionnalites` }, { label: kicker }]} />
          <View style={[styles.leadGrid, phone ? { flexDirection: 'column', alignItems: 'stretch', gap: 32 } : { gap: tablet ? 40 : 70 }]}>
            <View style={phone || visualBelow ? undefined : { flex: 1.1, minWidth: 0 }}>
              <Eyebrow>{kicker}</Eyebrow>
              <Headline level={1} size={h1Size} plain={plain} accent={accent} style={{ marginTop: 17, marginBottom: 21, letterSpacing: phone ? -1.6 : -2.4, lineHeight: h1Size * 1.08 }} />
              <Text style={[sans, styles.lead, phone && { fontSize: 13, lineHeight: 24 }]}>{subtitle}</Text>
              <View style={[styles.actions, { gap: phone ? 23 : 25 }]}>
                <View>
                  <Btn label={t.try} href={authHref('signup')} small={phone} />
                </View>
                <View>
                  <TextLink label={t.pricing} href={`${p}/tarifs`} size={phone ? 11 : 12} />
                </View>
              </View>
            </View>
            {visual && !visualBelow ? <View style={phone ? undefined : { flex: 1, minWidth: 0 }}>{visual}</View> : null}
          </View>
          {visual && visualBelow ? <View style={{ marginTop: phone ? 30 : 48 }}>{visual}</View> : null}
        </Wrap>
      </View>

      {/* Features */}
      <Section white>
        <SectionHead eyebrow={t.features} plain={t.featuresTitle} />
        <View style={[styles.grid, phone && { flexDirection: 'column', gap: 20 }]}>
          {features.map((f) => (
            <View key={f.title} style={[styles.card, !phone && { width: cols === 2 ? '47%' : '30.5%' }]}>
              <Feather name={f.icon} size={18} color={site.copper} />
              <Text style={[sans, styles.cardTitle, phone && { fontSize: 19 }]}>{f.title}</Text>
              <Text style={[sans, styles.cardText]}>{f.text}</Text>
            </View>
          ))}
        </View>
      </Section>

      {/* What the real export shows */}
      {doc ? (
        <Section>
          <SectionHead eyebrow={docsDict.eyebrow} plain={t.docTitle} text={docsDict.intro} />
          <View style={[styles.docRow, (phone || tablet) && { flexDirection: 'column', gap: 34 }]}>
            {pdf ? (
              <View style={phone || tablet ? undefined : { flex: 1, minWidth: 0 }}>
                <DocVisual source={pdf.source} ratio={pdf.ratio} alt={doc.points[0]?.title ?? kicker} maxHeight={phone ? 420 : 620} />
              </View>
            ) : null}
          <View style={[styles.points, (phone || pdf) && { flexDirection: 'column', gap: pdf ? 0 : 30 }, pdf && !phone && !tablet && { flex: 1 }]}>
            {doc.points.map((pt, i) => (
              <View key={pt.title} style={[styles.point, !phone && !pdf && { flex: 1 }]}>
                <Text style={[serif, styles.pointNum]}>{String(i + 1).padStart(2, '0')}</Text>
                <Text style={[sans, styles.pointTitle]}>{pt.title}</Text>
                <Text style={[sans, styles.cardText]}>{pt.text}</Text>
              </View>
            ))}
          </View>
          </View>
        </Section>
      ) : null}

      {afterFeatures}

      {/* Steps */}
      {steps?.length ? (
        <Section white={!!doc}>
          <SectionHead eyebrow={t.steps} plain={t.stepsTitle} />
          <View style={[styles.steps, phone && { flexDirection: 'column', gap: 10 }]}>
            {steps.map((s, i) => (
              <View key={s.title} style={[styles.step, phone ? styles.stepPhone : { flex: 1 }]}>
                <Text style={[serif, styles.stepNum, phone && { fontSize: 28, width: 40 }]}>{String(i + 1).padStart(2, '0')}</Text>
                <View style={phone ? { flex: 1 } : undefined}>
                  <Text style={[sans, styles.stepTitle, phone && { marginTop: 4 }]}>{s.title}</Text>
                  <Text style={[sans, styles.stepText]}>{s.text}</Text>
                </View>
              </View>
            ))}
          </View>
        </Section>
      ) : null}

      {/* FAQ: answers stay in the page for search engines (FaqItem). */}
      {faq?.length ? (
        <Section white={!doc}>
          <View style={styles.faq}>
            <Eyebrow>{t.faq}</Eyebrow>
            <Headline plain={t.faqTitle} size={phone ? 32 : 42} style={{ marginTop: 15, marginBottom: 30 }} />
            {faq.map((q, i) => (
              <FaqItem key={q.question} q={q.question} a={q.answer} last={i === faq.length - 1} />
            ))}
          </View>
        </Section>
      ) : null}

      {/* Related modules */}
      {related?.length ? (
        <Section white={!!doc}>
          <SectionHead eyebrow={t.related} plain={t.relatedTitle} />
          <View style={[styles.related, phone && { flexDirection: 'column', gap: 12 }]}>
            {related.map((r) => (
              <Link key={r.href} href={r.href as any} asChild>
                <Hover accessibilityRole="link" base={[styles.relatedCard, phone ? { padding: 22 } : { flex: 1 }]} hover={{ borderColor: site.copper }}>
                  <Text style={[sans, styles.relatedName]}>{r.label}</Text>
                  <Feather name="arrow-right" size={18} color={site.ink} />
                </Hover>
              </Link>
            ))}
          </View>
        </Section>
      ) : null}

      {/* Closing */}
      <View style={[styles.cta, { paddingVertical: phone ? 40 : 58 }]}>
        <Wrap style={phone ? undefined : styles.ctaRow}>
          <View style={phone ? undefined : { flex: 1, maxWidth: 720 }}>
            <Headline plain={closingTitle} size={phone ? 30 : 36} color="#f4f3e9" accentColor="#d9aa85" />
            <Text style={[sans, { fontSize: 12, color: '#b2b9a7', marginTop: 15, lineHeight: 21, maxWidth: 620 }]}>{closingText}</Text>
          </View>
          <View style={phone ? { marginTop: 22 } : undefined}>
            <Btn label={t.try} href={authHref('signup')} tone="sand" />
          </View>
        </Wrap>
      </View>
    </SitePage>
  );
}

const styles = StyleSheet.create({
  leadGrid: { flexDirection: 'row', alignItems: 'center' },
  lead: { fontSize: 15, color: site.muted, lineHeight: 28, maxWidth: 600 },
  actions: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginTop: 26 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 30, rowGap: 34, justifyContent: 'space-between' },
  card: { borderTopWidth: 1, borderTopColor: site.line, paddingTop: 25 },
  cardTitle: { fontSize: 18, lineHeight: 25, letterSpacing: -0.3, color: site.ink, marginTop: 20, marginBottom: 11 },
  cardText: { fontSize: 12, color: site.muted, lineHeight: 23, maxWidth: 500 },
  docRow: { flexDirection: 'row', gap: 60, alignItems: 'flex-start' },
  points: { flexDirection: 'row', gap: 30 },
  point: { borderTopWidth: 1, borderTopColor: site.line, paddingTop: 22, paddingBottom: 8 },
  pointNum: { fontSize: 30, color: site.copper, lineHeight: 36 },
  pointTitle: { fontSize: 16, fontWeight: '500', letterSpacing: -0.3, color: site.ink, marginTop: 10, marginBottom: 8 },
  steps: { flexDirection: 'row', gap: 35 },
  step: { borderTopWidth: 1, borderTopColor: site.line, paddingVertical: 22 },
  stepPhone: { flexDirection: 'row', gap: 12, paddingVertical: 18 },
  stepNum: { fontSize: 32, color: site.copper, lineHeight: 38 },
  stepTitle: { fontSize: 17, fontWeight: '500', letterSpacing: -0.4, color: site.ink, marginTop: 12, marginBottom: 8 },
  stepText: { fontSize: 12, color: site.muted, lineHeight: 22 },
  faq: { maxWidth: 820, width: '100%', marginHorizontal: 'auto' },
  related: { flexDirection: 'row', gap: 20, flexWrap: 'wrap' },
  relatedCard: { padding: 26, borderWidth: 1, borderColor: site.line, borderRadius: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: site.white, gap: 20, minWidth: 220 },
  relatedName: { fontSize: 16, color: site.ink, flex: 1 },
  cta: { backgroundColor: '#293128' },
  ctaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 40 },
});
