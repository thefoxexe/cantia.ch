import { StyleSheet, Text, View } from 'react-native';
import { i18next } from '../lib/translations';
import Head from 'expo-router/head';
import { Btn, Eyebrow, Headline, Wrap } from '../components/site/Primitives';
import { SitePage, useSiteLayout } from '../components/site/Sections';
import { sans, site } from '../lib/siteTheme';

// Unknown address on cantia.ch: a real 404 in the site identity.
export default function NotFoundScreen() {
  const { phone } = useSiteLayout();
  return (
    <SitePage title={`${i18next.t('notFoundPage.title')} | Cantia`} cta={false}>
      <Head>
        <meta name="robots" content="noindex" />
      </Head>
      <View style={{ paddingVertical: phone ? 70 : 130 }}>
        <Wrap>
          <View style={styles.col}>
            <Eyebrow>{i18next.t('notFoundPage.kicker')}</Eyebrow>
            <Headline level={1} plain={i18next.t('notFoundPage.title')} size={phone ? 38 : 52} style={{ marginTop: 18, marginBottom: 18 }} />
            <Text style={[sans, styles.text]}>{i18next.t('notFoundPage.text')}</Text>
            <View style={{ marginTop: 28, alignSelf: 'flex-start' }}>
              <Btn label={i18next.t('uiMisc.backHome')} href="/" />
            </View>
          </View>
        </Wrap>
      </View>
    </SitePage>
  );
}

const styles = StyleSheet.create({
  col: { maxWidth: 640 },
  text: { fontSize: 14, color: site.muted, lineHeight: 25 },
});
