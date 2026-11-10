import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Btn, Eyebrow, Headline, Wrap } from '../../components/site/Primitives';
import { Breadcrumbs, SitePage, useSiteLayout } from '../../components/site/Sections';
import { SITE_PAGES } from '../../lib/site/pages';
import { getAppLocale, useTranslation } from '../../lib/translations';
import { sans, site } from '../../lib/siteTheme';

// Downloadable resources of the help center: the B2B product dossier, French
// and German always side by side (it is often forwarded to a partner or a
// decision-maker who reads the other language).
export default function AideRessourcesScreen() {
  const { t } = useTranslation();
  const locale = (getAppLocale() as 'fr' | 'de' | 'it') ?? 'fr';
  const { phone } = useSiteLayout();
  const pre = locale === 'fr' ? '' : `/${locale}`;
  return (
    <SitePage title={`${t('aideRessourcesPage.title')} | Cantia`} description={t('aideRessourcesPage.lead')}>
      <View style={{ paddingTop: phone ? 32 : 58, paddingBottom: phone ? 56 : 96 }}>
        <Wrap>
          <Breadcrumbs items={[{ label: SITE_PAGES[locale].labels.home, href: pre || '/' }, { label: t('aideRessourcesPage.backLink'), href: `${pre}/aide` }, { label: t('aideRessourcesPage.title') }]} />
          <Eyebrow style={{ marginTop: phone ? 24 : 32 }}>{t('aideRessourcesPage.backLink')}</Eyebrow>
          <Headline level={1} plain={t('aideRessourcesPage.title')} size={phone ? 40 : 56} style={{ marginTop: 16, marginBottom: 18 }} />
          <Text style={[sans, styles.lead]}>{t('aideRessourcesPage.lead')}</Text>

          <View style={[styles.card, phone && { flexDirection: 'column', alignItems: 'flex-start' }]}>
            <View style={styles.icon}>
              <Feather name="file-text" size={22} color={site.copper} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[sans, styles.meta]}>PDF · 20 PAGES</Text>
              <Text style={[sans, styles.title]}>{t('aideRessourcesPage.dossierTitle')}</Text>
              <Text style={[sans, styles.text]}>{t('aideRessourcesPage.dossierText')}</Text>
              <View style={styles.buttons}>
                <View>
                  <Btn label={t('aideRessourcesPage.downloadFr')} href="/cantia-dossier-b2b-fr.pdf" small={phone} external />
                </View>
                <View>
                  <Btn label={t('aideRessourcesPage.downloadDe')} href="/cantia-dossier-b2b-de.pdf" tone="sand" small={phone} external />
                </View>
              </View>
            </View>
          </View>
        </Wrap>
      </View>
    </SitePage>
  );
}

const styles = StyleSheet.create({
  lead: { fontSize: 15, color: site.muted, lineHeight: 26, maxWidth: 620 },
  card: { flexDirection: 'row', gap: 24, marginTop: 44, padding: 30, borderWidth: 1, borderColor: site.line, borderRadius: 10, backgroundColor: site.white, maxWidth: 860 },
  icon: { width: 54, height: 54, borderRadius: 8, backgroundColor: '#f3e6da', alignItems: 'center', justifyContent: 'center' },
  meta: { fontSize: 9, letterSpacing: 1.4, color: site.muted, fontWeight: '600' },
  title: { fontSize: 22, color: site.ink, letterSpacing: -0.5, marginTop: 8 },
  text: { fontSize: 13, color: site.muted, lineHeight: 22, marginTop: 8, maxWidth: 560 },
  buttons: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 22 },
});
