import { Image, Linking, StyleSheet, Text, View } from 'react-native';
import Head from 'expo-router/head';
import { Link } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { PartnersNav, PartnersPage, useIsWide } from './PartnersChrome';
import { usePartnersCopy } from '../../lib/partners/locale';
import { LANDING_COPY } from '../../lib/partners/landingCopy';
import { FEATURED_PARTNERS } from '../../lib/partners/featured';
import { Eyebrow, Headline, Hover, Wrap } from '../site/Primitives';
import { paperShadow } from '../site/Sections';
import { sans, site } from '../../lib/siteTheme';

// partners.cantia.ch/partenaires/<slug>: one page per partner who recommends
// Cantia, reached from the band at the bottom of the landing.
export function PartnerProfile({ slug }: { slug: string }) {
  const { locale } = usePartnersCopy();
  const c = LANDING_COPY[locale];
  const t = c.featured;
  const partner = FEATURED_PARTNERS.find((p) => p.slug === slug)!;
  const wide = useIsWide(900);
  const phone = !useIsWide(760);
  const prefix = locale === 'fr' ? '' : `/${locale}`;
  const url = `https://partners.cantia.ch${prefix}/partenaires/${slug}`;
  return (
    <PartnersPage nav={<PartnersNav cta />}>
      <Head>
        <title>{t.metaTitle}</title>
        <meta name="description" content={t.metaDescription} />
        <link rel="canonical" href={url} />
        <meta property="og:title" content={t.metaTitle} />
        <meta property="og:description" content={t.metaDescription} />
        <meta property="og:url" content={url} />
      </Head>
      <View style={{ paddingTop: phone ? 32 : 56, paddingBottom: phone ? 48 : 80 }}>
        <Wrap>
          <Link href={(prefix || '/') as any} asChild>
            <Hover accessibilityRole="link" base={styles.back} hover={{ opacity: 0.7 }}>
              <Feather name="arrow-left" size={14} color={site.muted} />
              <Text style={[sans, styles.backText]}>{t.back}</Text>
            </Hover>
          </Link>
          <View style={[styles.card, paperShadow, phone && { padding: 22 }, !wide && { flexDirection: 'column', gap: 26 }]}>
            <View style={[{ gap: 18 }, wide && { width: 300 }]}>
              <Hover onPress={() => Linking.openURL(partner.website)} accessibilityRole="link" accessibilityLabel={partner.name} hover={{ opacity: 0.85 }}>
                <Image source={partner.logoLight} style={{ width: phone ? 170 : 200, height: (phone ? 170 : 200) * partner.ratio }} resizeMode="contain" />
              </Hover>
              <Text style={[sans, styles.tag]}>{t.tag.toUpperCase()}</Text>
              <View style={{ gap: 7 }}>
                {t.points.map((pt) => (
                  <View key={pt} style={{ flexDirection: 'row', gap: 10 }}>
                    <Feather name="check" size={13} color={site.copper} style={{ marginTop: 3 }} />
                    <Text style={[sans, styles.text, { flex: 1 }]}>{pt}</Text>
                  </View>
                ))}
              </View>
            </View>
            <View style={wide ? { flex: 1, minWidth: 0 } : undefined}>
              <Eyebrow>{t.eyebrow}</Eyebrow>
              <Headline level={1} plain={t.title} size={phone ? 30 : 40} style={{ marginTop: 14, marginBottom: 16 }} />
              <Text style={[sans, styles.text, { fontSize: 13, lineHeight: 23 }]}>{t.text}</Text>
              <View style={styles.how}>
                <Text style={[sans, styles.label]}>{t.howTitle}</Text>
                <Text style={[sans, styles.text]}>{t.how}</Text>
              </View>
              <View style={styles.actions}>
                <Hover onPress={() => Linking.openURL(partner.website)} accessibilityRole="link" base={styles.link} hover={{ opacity: 0.75 }}>
                  <Text style={[sans, styles.linkText]}>{t.link}</Text>
                  <Feather name="arrow-up-right" size={14} color={site.ink} />
                </Hover>
                <Link href={'/connexion?mode=signup' as any} asChild>
                  <Hover accessibilityRole="link" base={[styles.link, { flexShrink: 1, maxWidth: '100%' }]} hover={{ opacity: 0.75 }}>
                    <Text style={[sans, styles.linkText, { color: site.copper, flexShrink: 1 }]}>{t.join}</Text>
                  </Hover>
                </Link>
              </View>
            </View>
          </View>
        </Wrap>
      </View>
    </PartnersPage>
  );
}

const styles = StyleSheet.create({
  back: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start', marginBottom: 24 },
  backText: { fontSize: 12, color: site.muted },
  card: { flexDirection: 'row', gap: 48, padding: 40, backgroundColor: site.white, borderRadius: 8, borderWidth: 1, borderColor: site.line },
  tag: { fontSize: 9, letterSpacing: 1.2, color: site.muted, fontWeight: '600' },
  text: { fontSize: 12, color: site.muted, lineHeight: 22 },
  how: { marginTop: 22, paddingTop: 18, borderTopWidth: 1, borderTopColor: site.line, gap: 6 },
  label: { fontSize: 10, fontWeight: '600', color: site.ink },
  actions: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 25, marginTop: 24 },
  link: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  linkText: { fontSize: 12, fontWeight: '600', color: site.ink },
});
