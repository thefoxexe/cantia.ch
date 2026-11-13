import { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Btn, Eyebrow, Headline, Hover, Wrap } from './site/Primitives';
import { Breadcrumbs, SitePage, useSiteLayout } from './site/Sections';
import { SITE_PAGES } from '../lib/site/pages';
import { sans, serif, site } from '../lib/siteTheme';
import { authHref } from '../lib/appHost';
import type { HelpArticle } from '../lib/helpArticlesFull';
import { FaqItem } from './site/FamilyPage';

const FAQ_TITLE = { fr: 'Questions fréquentes', de: 'Häufige Fragen', it: 'Domande frequenti' } as const;
import { getAppLocale, useTranslation } from '../lib/translations';
import { SiteImage } from './site/SiteImage';

// Real size of each capture of the app (public/help-shots/<name>[-de|-it].jpg,
// rendered from the app with sample data).
const RATIO: Record<string, number> = {
  'heures-mobile-saisie': 844 / 390,
  'heures-desktop-saisie': 807 / 1440,
  'heures-admin-facturation': 613 / 1440,
};
const DEFAULT_RATIO = 900 / 1280;
const WRITE = { fr: 'Nous écrire', de: 'Schreiben Sie uns', it: 'Scriveteci' } as const;

function shotUri(name: string, locale: string) {
  return `/help-shots/${name}${locale === 'fr' ? '' : `-${locale}`}.jpg`;
}

// A screen of the app in a window frame (or a phone outline for a phone capture).
function AppCapture({ name, alt }: { name: string; alt: string }) {
  const locale = getAppLocale();
  const ratio = RATIO[name] ?? DEFAULT_RATIO;
  const mobile = ratio > 1;
  const [w, setW] = useState(0);
  if (mobile) {
    const width = 280;
    return (
      <View style={{ alignItems: 'center' }}>
        <View style={[styles.phone, { width: width + 16, borderRadius: 40 }]}>
          <SiteImage source={{ uri: shotUri(name, locale) }} style={{ width, height: width * ratio, borderRadius: 30 }} resizeMode="cover" alt={alt} />
        </View>
      </View>
    );
  }
  return (
    <View style={styles.window}>
      <View style={styles.bar}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={styles.dot} />
        ))}
        <Text style={[sans, styles.url]}>app.cantia.ch</Text>
      </View>
      <View style={{ width: '100%', aspectRatio: 1 / ratio }}>
        <SiteImage source={{ uri: shotUri(name, locale) }} style={{ width: '100%', height: '100%' }} resizeMode="cover" alt={alt} />
      </View>
    </View>
  );
}

// One help article (/aide/<id>, /de/aide/<id>, /it/aide/<id>): its own
// indexable page with the real screen of the feature, the explanation, the
// steps, related articles and a way to reach us.
export function HelpArticlePage({ article, related }: { article: HelpArticle; related: HelpArticle[] }) {
  const { t } = useTranslation();
  const locale = (getAppLocale() as 'fr' | 'de' | 'it') ?? 'fr';
  const { phone, tablet: tabletOnly  } = useSiteLayout();
  // Stacked layouts collapse on phones too, not only on tablets.
  const tablet = phone || tabletOnly;
  const pre = locale === 'fr' ? '' : `/${locale}`;
  const aide = `${pre}/aide`;
  const L = SITE_PAGES[locale].labels;

  return (
    <SitePage title={`${article.title} | Cantia`} description={article.body[0]} cta={false}>
      <View style={{ paddingTop: phone ? 32 : 58, paddingBottom: phone ? 50 : 80 }}>
        <Wrap>
          <Breadcrumbs items={[{ label: L.home, href: pre || '/' }, { label: t('aidePage.title'), href: aide }, { label: article.category }]} />
          <View style={[styles.cols, tablet && { flexDirection: 'column', gap: 40 }]}>
            <View style={styles.main}>
              <Eyebrow style={{ marginTop: phone ? 24 : 32 }}>{article.category}</Eyebrow>
              <Headline level={1} plain={article.title} size={phone ? 34 : 46} style={{ marginTop: 16, marginBottom: 26 }} />

              {article.screenshot ? (
                <View style={{ marginBottom: 30 }}>
                  <AppCapture name={article.screenshot} alt={article.title} />
                </View>
              ) : null}

              <View style={{ gap: 16 }}>
                {article.body.map((p, i) => (
                  <Text key={i} style={[sans, styles.p]}>
                    {p}
                  </Text>
                ))}
              </View>

              {article.sections?.map((sec) => (
                <View key={sec.title} style={{ marginTop: 40, gap: 16 }}>
                  <Text role="heading" aria-level={2} style={[sans, styles.h2, phone && { fontSize: 20 }]}>
                    {sec.title}
                  </Text>
                  {sec.paragraphs.map((p, i) => (
                    <Text key={i} style={[sans, styles.p]}>
                      {p}
                    </Text>
                  ))}
                </View>
              ))}

              {article.steps?.length ? (
                <View style={{ marginTop: 40, gap: 40 }}>
                  {article.steps.map((step, i) => (
                    <View key={step.screenshot} style={styles.step}>
                      <View style={styles.stepHead}>
                        <Text style={[serif, styles.stepNum]}>{String(i + 1).padStart(2, '0')}</Text>
                        <Text style={[sans, styles.stepText]}>{step.caption}</Text>
                      </View>
                      <AppCapture name={step.screenshot} alt={`${article.title} · ${i + 1}`} />
                    </View>
                  ))}
                </View>
              ) : null}

              {article.faq?.length ? (
                <View style={{ marginTop: 48 }}>
                  <Text role="heading" aria-level={2} style={[sans, styles.h2, { marginBottom: 14 }, phone && { fontSize: 20 }]}>
                    {FAQ_TITLE[locale]}
                  </Text>
                  {article.faq.map((q, i, all) => (
                    <FaqItem key={q.q} q={q.q} a={q.a} last={i === all.length - 1} />
                  ))}
                </View>
              ) : null}
            </View>

            {/* Side: same topic, and a way to reach us */}
            <View style={[styles.side, !tablet && { width: 300, marginTop: phone ? 0 : 118 }]}>
              {related.length ? (
                <View>
                  <Text style={[sans, styles.sideLabel]}>{t('helpArticlePage.relatedEyebrow').toUpperCase()}</Text>
                  {related.map((r) => (
                    <Link key={r.id} href={`${aide}/${r.id}` as any} asChild>
                      <Hover accessibilityRole="link" base={styles.sideRow} hover={{ opacity: 0.75 }}>
                        <Text style={[sans, styles.sideText]}>{r.title}</Text>
                        <Feather name="arrow-right" size={14} color={site.copper} />
                      </Hover>
                    </Link>
                  ))}
                </View>
              ) : null}
              <View style={styles.contact}>
                <Feather name="life-buoy" size={18} color={site.copper} />
                <Text style={[sans, styles.contactTitle]}>{t('helpArticlePage.contactTitle')}</Text>
                <Text style={[sans, styles.contactText]}>{t('helpArticlePage.contactText')}</Text>
                <Link href={`${pre}/contact` as any}>
                  <Text style={[sans, styles.contactLink]}>{WRITE[locale]} →</Text>
                </Link>
              </View>
              <Link href={aide as any}>
                <Text style={[sans, styles.back]}>← {t('helpArticlePage.backToAide')}</Text>
              </Link>
            </View>
          </View>
        </Wrap>
      </View>

      <View style={[styles.cta, { paddingVertical: phone ? 40 : 56 }]}>
        <Wrap style={phone ? { gap: 20 } : { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 40 }}>
          <Headline plain={t('helpArticlePage.closingTitle')} size={phone ? 30 : 36} color="#f4f3e9" />
          <View style={{ alignSelf: phone ? 'flex-start' : 'center' }}>
            <Btn label={t('helpArticlePage.closingCta')} href={authHref('signup')} tone="sand" />
          </View>
        </Wrap>
      </View>
    </SitePage>
  );
}

const styles = StyleSheet.create({
  cols: { flexDirection: 'row', gap: 70, alignItems: 'flex-start' },
  main: { flex: 1, minWidth: 0, maxWidth: 820 },
  window: { backgroundColor: site.white, borderRadius: 8, overflow: 'hidden', borderWidth: 1, borderColor: site.line, boxShadow: '0 16px 36px rgba(37,41,33,0.10)' } as object,
  bar: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, height: 30, borderBottomWidth: 1, borderBottomColor: '#ebece3', backgroundColor: '#fbfbf7' },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#dcdcd0' },
  url: { flex: 1, textAlign: 'center', fontSize: 9, color: '#9a9e8c', marginRight: 40 },
  phone: { padding: 8, backgroundColor: '#1f241c', boxShadow: '0 16px 36px rgba(37,41,33,0.18)' } as object,
  caption: { fontSize: 8, letterSpacing: 0.6, color: '#8f927f', textAlign: 'center', marginTop: 12 },
  p: { fontSize: 15, lineHeight: 27, color: '#4b5045' },
  h2: { fontSize: 24, lineHeight: 31, fontWeight: '500', letterSpacing: -0.6, color: site.ink },
  step: { gap: 18 },
  stepHead: { flexDirection: 'row', gap: 16, alignItems: 'baseline' },
  stepNum: { fontSize: 30, color: site.copper, lineHeight: 34 },
  stepText: { flex: 1, fontSize: 15, lineHeight: 24, color: site.ink },
  side: { gap: 26 },
  sideLabel: { fontSize: 9, letterSpacing: 1.4, color: site.muted, fontWeight: '600', marginBottom: 6 },
  sideRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingVertical: 13, borderTopWidth: 1, borderTopColor: site.line },
  sideText: { flex: 1, fontSize: 13, color: site.ink, lineHeight: 19 },
  contact: { padding: 22, borderRadius: 8, backgroundColor: '#e7d8c5', gap: 8 },
  contactTitle: { fontSize: 16, color: site.ink, fontWeight: '500', marginTop: 4 },
  contactText: { fontSize: 12, color: '#6e6352', lineHeight: 19 },
  contactLink: { fontSize: 12, color: site.copper, fontWeight: '600', marginTop: 4 },
  back: { fontSize: 12, color: site.muted },
  cta: { backgroundColor: '#293128' },
});
