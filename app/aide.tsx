import { useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { Eyebrow, Headline, Hover, Wrap } from '../components/site/Primitives';
import { Breadcrumbs, Section, SitePage, useSiteLayout } from '../components/site/Sections';
import { SITE_PAGES } from '../lib/site/pages';
import { HELP_ARTICLES, HELP_ARTICLES_DE, HELP_ARTICLES_IT } from '../lib/helpArticlesFull';
import { getAppLocale, useTranslation } from '../lib/translations';
import { marketingPageTitle } from '../lib/marketingSeoTitles';
import { sans, site } from '../lib/siteTheme';

const EYEBROW = { fr: 'Aide & ressources', de: 'Hilfe & Ressourcen', it: 'Aiuto & risorse' } as const;
const ARTICLES = { fr: 'articles', de: 'Artikel', it: 'articoli' } as const;

function normalize(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(/\p{Mn}/gu, '');
}

// cantia.ch/aide: search, shortcuts (videos, downloads, contact), then every
// help article grouped by topic. Articles: lib/helpArticles.ts.
export default function PublicAideScreen() {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const locale = (getAppLocale() as 'fr' | 'de' | 'it') ?? 'fr';
  const { phone, tablet, width } = useSiteLayout();
  const pre = locale === 'fr' ? '' : `/${locale}`;
  const aide = `${pre}/aide`;
  const articles = locale === 'de' ? HELP_ARTICLES_DE : locale === 'it' && HELP_ARTICLES_IT.length ? HELP_ARTICLES_IT : HELP_ARTICLES;

  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    if (!q) return articles;
    return articles.filter((a) => normalize([a.title, a.category, ...a.keywords, ...a.body].join(' ')).includes(q));
  }, [query, articles]);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof HELP_ARTICLES>();
    for (const a of filtered) map.set(a.category, [...(map.get(a.category) ?? []), a]);
    return Array.from(map.entries());
  }, [filtered]);

  const shortcuts = [
    { icon: 'film' as const, title: t('aidePage.videosCardTitle'), text: t('aidePage.videosCardText'), href: `${aide}/videos` },
    { icon: 'download' as const, title: t('aidePage.resourcesCardTitle'), text: t('aidePage.resourcesCardText'), href: `${aide}/ressources` },
    { icon: 'mail' as const, title: t('aidePage.contactTitle'), text: t('aidePage.contactText'), href: `${pre}/contact` },
  ];
  const h1 = phone ? 42 : tablet ? 50 : 60;
  const twoCols = width > 900;

  return (
    <SitePage title={marketingPageTitle('aide', locale)} description={t('aidePage.lead')}>
      {/* Hero with search */}
      <View style={{ paddingTop: phone ? 32 : 58, paddingBottom: phone ? 40 : 64 }}>
        <Wrap>
          <Breadcrumbs items={[{ label: SITE_PAGES[locale].labels.home, href: pre || '/' }, { label: t('aidePage.title') }]} />
          <Eyebrow style={{ marginTop: phone ? 24 : 32 }}>{EYEBROW[locale]}</Eyebrow>
          <Headline level={1} plain={t('aidePage.title')} size={h1} style={{ marginTop: 16, marginBottom: 18 }} />
          <Text style={[sans, styles.lead, phone && { fontSize: 13 }]}>{t('aidePage.lead')}</Text>
          <View style={[styles.search, phone && { height: 50 }]}>
            <Feather name="search" size={17} color={site.muted} />
            <TextInput value={query} onChangeText={setQuery} placeholder={t('aidePage.searchPlaceholder')} placeholderTextColor="#a1a697" style={[sans, styles.searchInput]} accessibilityLabel={t('aidePage.searchPlaceholder')} />
            {query ? (
              <Hover onPress={() => setQuery('')} accessibilityRole="button" hover={{ opacity: 0.6 }}>
                <Feather name="x" size={16} color={site.muted} />
              </Hover>
            ) : null}
          </View>
          <View style={[styles.shortcuts, phone && { flexDirection: 'column' }]}>
            {shortcuts.map((s) => (
              <Link key={s.href} href={s.href as any} asChild>
                <Hover accessibilityRole="link" base={[styles.shortcut, !phone && { flex: 1 }]} hover={{ borderColor: site.copper }}>
                  <View style={styles.shortIcon}>
                    <Feather name={s.icon} size={17} color={site.copper} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[sans, styles.shortTitle]}>{s.title}</Text>
                    <Text style={[sans, styles.shortText]}>{s.text}</Text>
                  </View>
                  <Feather name="arrow-right" size={16} color={site.ink} />
                </Hover>
              </Link>
            ))}
          </View>
        </Wrap>
      </View>

      {/* Articles by topic */}
      <Section white>
        {grouped.length === 0 ? (
          <Text style={[sans, styles.empty]}>{t('aidePage.emptyText')}</Text>
        ) : (
          <View style={[styles.grid, !twoCols && { flexDirection: 'column' }]}>
            {grouped.map(([category, list]) => (
              <View key={category} style={[styles.topic, twoCols && { width: '48%' }]}>
                <View style={styles.topicHead}>
                  <Text style={[sans, styles.topicName]}>{category.toUpperCase()}</Text>
                  <Text style={[sans, styles.topicCount]}>
                    {list.length} {ARTICLES[locale]}
                  </Text>
                </View>
                {list.map((a) => (
                  <Link key={a.id} href={`${aide}/${a.id}` as any} asChild>
                    <Hover accessibilityRole="link" base={styles.row} hover={{ backgroundColor: '#f3efe6' }}>
                      {(hovered) => (
                        <>
                          <Text style={[sans, styles.rowText, hovered && { color: site.copper }]}>{a.title}</Text>
                          <Feather name="arrow-right" size={15} color={hovered ? site.copper : '#a1a697'} />
                        </>
                      )}
                    </Hover>
                  </Link>
                ))}
              </View>
            ))}
          </View>
        )}
      </Section>
    </SitePage>
  );
}

const styles = StyleSheet.create({
  lead: { fontSize: 15, color: site.muted, lineHeight: 26, maxWidth: 560 },
  search: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 30, maxWidth: 640, height: 56, paddingHorizontal: 18, borderWidth: 1, borderColor: '#d7dacf', borderRadius: 8, backgroundColor: site.white },
  searchInput: { flex: 1, fontSize: 15, color: site.ink, outlineStyle: 'none' } as object,
  shortcuts: { flexDirection: 'row', gap: 14, marginTop: 34 },
  shortcut: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 18, borderWidth: 1, borderColor: site.line, borderRadius: 8, backgroundColor: site.white },
  shortIcon: { width: 38, height: 38, borderRadius: 6, backgroundColor: '#f3e6da', alignItems: 'center', justifyContent: 'center' },
  shortTitle: { fontSize: 14, color: site.ink, fontWeight: '500' },
  shortText: { fontSize: 11, color: site.muted, marginTop: 3, lineHeight: 17 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 44 },
  topic: { borderTopWidth: 1, borderTopColor: site.ink },
  topicHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14 },
  topicName: { fontSize: 10, letterSpacing: 1.4, color: site.copper, fontWeight: '600' },
  topicCount: { fontSize: 10, color: site.muted },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16, paddingVertical: 14, paddingHorizontal: 4, borderTopWidth: 1, borderTopColor: site.line },
  rowText: { flex: 1, fontSize: 14, color: site.ink, lineHeight: 20 },
  empty: { fontSize: 14, color: site.muted },
});
