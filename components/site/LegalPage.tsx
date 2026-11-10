import { StyleSheet, Text, View } from 'react-native';
import { Breadcrumbs, SitePage, useSiteLayout } from './Sections';
import { Eyebrow, Wrap } from './Primitives';
import { sans, site } from '../../lib/siteTheme';
import { getAppLocale, useTranslation } from '../../lib/translations';
import { marketingPageTitle } from '../../lib/marketingSeoTitles';

const EYEBROW = { fr: 'Informations légales', de: 'Rechtliches', it: 'Informazioni legali' } as const;
const HOME = { fr: 'Accueil', de: 'Startseite', it: 'Home' } as const;

// Legal notice, privacy policy and terms in the site's identity: one column
// of numbered sections, the texts come from the existing translation keys.
export function LegalPage({ ns, seoKey, sections }: { ns: string; seoKey: Parameters<typeof marketingPageTitle>[0]; sections: string[] }) {
  const { t } = useTranslation();
  const locale = getAppLocale() as 'fr' | 'de' | 'it';
  const { phone } = useSiteLayout();
  const home = locale === 'fr' ? '/' : `/${locale}`;
  return (
    <SitePage title={marketingPageTitle(seoKey, locale)} cta={false}>
      <View style={{ paddingTop: phone ? 34 : 52, paddingBottom: phone ? 60 : 96 }}>
        <Wrap>
          <View style={styles.col}>
            <Breadcrumbs items={[{ label: HOME[locale] ?? HOME.fr, href: home }, { label: t(`${ns}.title`) }]} />
            <Eyebrow style={{ marginTop: phone ? 26 : 34 }}>{EYEBROW[locale] ?? EYEBROW.fr}</Eyebrow>
            <Text role="heading" aria-level={1} style={[sans, styles.h1, phone && { fontSize: 34, lineHeight: 39 }]}>
              {t(`${ns}.title`)}
            </Text>
            <Text style={[sans, styles.updated]}>{t(`${ns}.updated`)}</Text>
            <View style={styles.list}>
              {sections.map((key, i) => (
                <View key={key} style={[styles.item, phone && { flexDirection: 'column', gap: 8 }]}>
                  <Text style={[sans, styles.num]}>{String(i + 1).padStart(2, '0')}</Text>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text role="heading" aria-level={2} style={[sans, styles.h2]}>
                      {t(`${ns}.${key}Title`)}
                    </Text>
                    <Text style={[sans, styles.p]}>{t(`${ns}.${key}Text`)}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </Wrap>
      </View>
    </SitePage>
  );
}

const styles = StyleSheet.create({
  col: { width: '100%', maxWidth: 780 },
  h1: { fontSize: 46, lineHeight: 52, letterSpacing: -1.6, color: site.ink, marginTop: 16 },
  updated: { fontSize: 11, color: site.muted, marginTop: 14 },
  list: { marginTop: 40, borderTopWidth: 1, borderTopColor: site.line },
  item: { flexDirection: 'row', gap: 28, paddingVertical: 26, borderBottomWidth: 1, borderBottomColor: site.line },
  num: { width: 28, fontSize: 11, color: site.copper, fontWeight: '600', letterSpacing: 1, paddingTop: 4 },
  h2: { fontSize: 18, lineHeight: 25, color: site.ink, fontWeight: '500', letterSpacing: -0.3 },
  p: { fontSize: 13, lineHeight: 23, color: site.muted, marginTop: 8 },
});
