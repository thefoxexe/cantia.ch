import { useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Btn, Eyebrow, Headline, Hover, TextLink, Wrap } from './Primitives';
import { Breadcrumbs, Callout, Section, SectionHead, SitePage, VoiceBox, useSiteLayout, usePrefix } from './Sections';
import { FAMILY_ICONS, useSiteLocale } from './SiteNav';
import { SITE_PAGES, FAMILY_KEYS, type FamilyKey } from '../../lib/site/pages';
import { sans, site } from '../../lib/siteTheme';
import { authHref } from '../../lib/appHost';

export function AssistantPage() {
  const locale = useSiteLocale();
  const { labels: L, assistant: a } = SITE_PAGES[locale];
  const p = usePrefix();
  const { phone, tablet } = useSiteLayout();
  const h1Size = phone ? 43 : tablet ? 46 : 56;
  const icons = ['file-text', 'clipboard', 'credit-card'] as const;

  return (
    <SitePage title={a.seoTitle} description={a.seoDescription}>
      <View style={{ paddingTop: phone ? 32 : 58, paddingBottom: phone ? 35 : 52 }}>
        <Wrap>
          <Breadcrumbs items={[{ label: L.home, href: p || '/' }, { label: L.software, href: `${p}/fonctionnalites` }, { label: a.name }]} />
          <View style={[styles.leadGrid, phone ? { flexDirection: 'column', alignItems: 'stretch', gap: 30 } : { gap: tablet ? 40 : 70 }]}>
            <View style={phone ? undefined : { flex: 1.25, minWidth: 0 }}>
              <Eyebrow>{a.eyebrow}</Eyebrow>
              <Headline level={1} size={h1Size} plain={a.h1Plain} accent={a.h1Accent} style={[styles.h1, { letterSpacing: phone ? -1.9 : -3, lineHeight: h1Size * 1.07 }]} />
              <Text style={[sans, styles.lead, phone && { fontSize: 13, lineHeight: 24 }]}>{a.lead}</Text>
              <View style={[styles.actions, { gap: phone ? 23 : 25 }]}>
                <View>
                  <Btn label={L.tryCta} href={authHref('signup')} small={phone} />
                </View>
                <View>
                  <TextLink label={a.quotas} href={`${p}/tarifs`} size={phone ? 11 : 12} />
                </View>
              </View>
            </View>
            <View style={phone ? undefined : { flex: 0.8, minWidth: 0 }}>
              <VoiceBox />
            </View>
          </View>
        </Wrap>
      </View>

      <Section white>
        <SectionHead eyebrow={a.usesEyebrow} plain={a.usesPlain} accent={a.usesAccent} text={a.usesNote} />
        <View style={[styles.grid3, phone && { flexDirection: 'column', gap: 20 }]}>
          {a.uses.map((u, i) => (
            <View key={u.title} style={[styles.detailCard, phone ? undefined : { flex: 1 }]}>
              <Feather name={icons[i]} size={18} color={site.copper} />
              <Text style={[sans, styles.detailTitle, phone && { fontSize: 21, marginTop: 13 }]}>{u.title}</Text>
              <Text style={[sans, styles.detailText]}>{u.text}</Text>
              <View style={{ marginTop: 16 }}>
                <TextLink label={u.link} href={`${p}/${u.slug}`} />
              </View>
            </View>
          ))}
        </View>
      </Section>

      <Section>
        <Callout strong={a.calloutStrong} text={a.callout} />
      </Section>
    </SitePage>
  );
}

// Lower-case, accents removed: "Dépenses" matches "depenses".
function fold(s: string) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

export function FeaturesPage() {
  const locale = useSiteLocale();
  const { labels: L, families, features: c } = SITE_PAGES[locale];
  const p = usePrefix();
  const { phone, tablet } = useSiteLayout();
  const [filter, setFilter] = useState<FamilyKey | 'all'>('all');
  const [query, setQuery] = useState('');

  const visible = useMemo(() => {
    const q = fold(query.trim());
    return FAMILY_KEYS.filter((k) => filter === 'all' || filter === k)
      .map((k) => ({ key: k, tools: families[k].tools.filter((t) => !q || fold(`${t.title} ${t.text} ${families[k].name}`).includes(q)) }))
      .filter((s) => s.tools.length > 0);
  }, [filter, query, families]);

  const h1Size = phone ? 43 : tablet ? 52 : 62;

  return (
    <SitePage title={c.seoTitle} description={c.seoDescription}>
      <View style={{ paddingTop: phone ? 32 : 58, paddingBottom: phone ? 35 : 52 }}>
        <Wrap>
          <Breadcrumbs items={[{ label: L.home, href: p || '/' }, { label: L.software }]} />
          <Eyebrow>{c.eyebrow}</Eyebrow>
          <Headline level={1} size={h1Size} plain={c.h1Plain} accent={c.h1Accent} style={[styles.h1, { letterSpacing: phone ? -1.9 : -3, lineHeight: h1Size * 1.06 }]} />
          <Text style={[sans, styles.lead, phone && { fontSize: 13, lineHeight: 24 }]}>{c.lead}</Text>
        </Wrap>
      </View>

      <View style={{ paddingBottom: phone ? 53 : 86 }}>
        <Wrap>
          <View style={[styles.searchBar, phone && { flexDirection: 'column', alignItems: 'stretch', gap: 20, marginBottom: 25 }]}>
            <View style={styles.tabs} role="tablist">
              <Tab label={c.all} active={filter === 'all'} onPress={() => setFilter('all')} small={phone} />
              {FAMILY_KEYS.map((k) => (
                <Tab key={k} label={families[k].name} active={filter === k} onPress={() => setFilter(k)} small={phone} />
              ))}
            </View>
            <View style={[styles.searchInput, phone ? { width: '100%' } : null]}>
              <Feather name="search" size={16} color="#949985" />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder={c.search}
                placeholderTextColor="#9a9e90"
                accessibilityLabel={c.searchLabel}
                style={[sans, styles.searchField]}
                {...({ type: 'search' } as object)}
              />
            </View>
          </View>

          {visible.map(({ key, tools }) => {
            const f = families[key];
            return (
              <View key={key} style={[styles.moduleSection, phone && { paddingVertical: 28 }]}>
                <View style={[styles.moduleTitle, phone ? { flexDirection: 'column', gap: 20 } : { gap: tablet ? 40 : 70 }]}>
                  <View style={phone ? undefined : { flex: 0.7, paddingVertical: 12 }}>
                    <Feather name={FAMILY_ICONS[key]} size={26} color={site.copper} />
                    <Headline level={2} plain={f.name} size={phone ? 26 : 29} style={{ marginTop: phone ? 13 : 18, marginBottom: 10, letterSpacing: -1 }} />
                    <Text style={[sans, styles.moduleIntro, phone && { maxWidth: '100%' }]}>{f.intro}</Text>
                    <View style={{ marginTop: 14 }}>
                      <TextLink label={c.explore} href={`${p}/${key}`} />
                    </View>
                  </View>
                  <View style={[styles.moduleGrid, phone ? undefined : { flex: 1.4 }]}>
                    {tools.map((t) => (
                      <View key={t.title} style={[styles.moduleCard, phone && { paddingVertical: 20, paddingHorizontal: 15 }]}>
                        <Text style={[sans, styles.moduleCardTitle, phone && { fontSize: 12, lineHeight: 17 }]}>
                          {t.title}
                          {t.badge ? <Text style={styles.moduleBadge}>{'  '}{t.badge.toUpperCase()}</Text> : null}
                        </Text>
                        <Text style={[sans, styles.moduleCardText, phone && { fontSize: 10, lineHeight: 18 }]}>{t.text}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            );
          })}

          {visible.length === 0 ? (
            <View style={styles.empty}>
              <Text style={[sans, { fontSize: 14, color: site.ink, textAlign: 'center' }]}>{c.empty}</Text>
            </View>
          ) : null}

          <View style={{ marginTop: 36 }}>
            <Callout strong={c.calloutStrong} text={c.callout} link={<TextLink label={c.calloutLink} href={`${p}/assistant`} />} />
          </View>
        </Wrap>
      </View>
    </SitePage>
  );
}

function Tab({ label, active, onPress, small }: { label: string; active: boolean; onPress: () => void; small: boolean }) {
  return (
    <Hover
      onPress={onPress}
      accessibilityRole="tab"
      aria-selected={active}
      base={[styles.tab, small && { paddingVertical: 6, paddingHorizontal: 10 }, active && { backgroundColor: site.ink, borderColor: site.ink }]}
      hover={active ? undefined : { borderColor: site.copper }}
    >
      <Text style={[sans, { fontSize: small ? 9 : 10, color: active ? '#ffffff' : site.ink }]}>{label}</Text>
    </Hover>
  );
}

const styles = StyleSheet.create({
  leadGrid: { flexDirection: 'row', alignItems: 'center' },
  h1: { marginTop: 17, marginBottom: 21, fontWeight: '400', maxWidth: 850 },
  lead: { fontSize: 15, color: site.muted, lineHeight: 28, maxWidth: 610 },
  actions: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginTop: 26 },
  grid3: { flexDirection: 'row', gap: 30 },
  detailCard: { borderTopWidth: 1, borderTopColor: site.line, paddingTop: 25 },
  detailTitle: { fontSize: 18, lineHeight: 25, letterSpacing: -0.3, color: site.ink, marginTop: 20, marginBottom: 11 },
  detailText: { fontSize: 12, color: site.muted, lineHeight: 23 },
  searchBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 20, marginBottom: 32 },
  tabs: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, flexShrink: 1 },
  tab: { paddingVertical: 7, paddingHorizontal: 13, borderWidth: 1, borderColor: site.line, borderRadius: 25 },
  searchInput: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: site.line, paddingVertical: 9, paddingHorizontal: 14, backgroundColor: '#ffffff', borderRadius: 5, width: 330 },
  searchField: { flex: 1, fontSize: 12, color: site.ink, outlineStyle: 'none' } as object,
  moduleSection: { borderTopWidth: 1, borderTopColor: site.line, paddingVertical: 36 },
  moduleTitle: { flexDirection: 'row' },
  moduleIntro: { fontSize: 12, color: site.muted, lineHeight: 22, maxWidth: 260 },
  moduleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 1, backgroundColor: site.line, borderWidth: 1, borderColor: site.line, borderRadius: 7, overflow: 'hidden' },
  moduleCard: { backgroundColor: site.white, padding: 24, flexGrow: 1, flexBasis: '45%' },
  moduleCardTitle: { fontSize: 13, fontWeight: '600', color: site.ink, marginBottom: 8 },
  moduleBadge: { fontSize: 8, color: site.copper, fontWeight: '600', letterSpacing: 0.6 },
  moduleCardText: { fontSize: 11, color: site.muted, lineHeight: 21 },
  empty: { padding: 45, borderWidth: 1, borderColor: site.line, borderRadius: 8 },
});
