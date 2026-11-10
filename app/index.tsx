import { useEffect, useRef, useState } from 'react';
import { Image, Platform, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions, type ImageSourcePropType } from 'react-native';
import { Link, Redirect } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { MarketingFooter, MarketingNav } from '../components/MarketingChrome';
import { MarketingHead } from '../components/MarketingHead';
import { Btn, Eyebrow, Hover, Headline, TextLink, Wrap } from '../components/site/Primitives';
import { FAMILY_ICONS, localePrefix, useSiteLocale } from '../components/site/SiteNav';
import { PhoneShot, SectionHead, SiteCta, VoiceBox } from '../components/site/Sections';
import { EXPORTS } from '../components/site/exports';
import { SITE_PAGES } from '../lib/site/pages';
import { SITE_COPY } from '../lib/site/copy';
import { marketingPageTitle } from '../lib/marketingSeoTitles';
import { sans, site } from '../lib/siteTheme';
import { authHref, useSyncMarketingLocaleFromPath } from '../lib/appHost';
import { HeroDevices } from '../components/site/HeroDevices';

// Real PDFs produced by Cantia's own renderer (sample data: Atelier Martin SA
// for M. et Mme Dubois). Never replace them with mock-ups or screenshots that
// still carry the old logo.

const paperShadow = Platform.OS === 'web' ? ({ boxShadow: '0 22px 48px rgba(86,58,34,0.16), 0 2px 6px rgba(86,58,34,0.08)' } as object) : {};

export default function LandingScreen() {
  if (Platform.OS !== 'web') return <Redirect href="/(auth)/login" />;
  return <LandingContent />;
}

function LandingContent() {
  useSyncMarketingLocaleFromPath();
  const locale = useSiteLocale();
  const copy = SITE_COPY[locale];
  const h = copy.home;
  const p = localePrefix(locale);
  const { width, height: winH } = useWindowDimensions();
  const phone = width <= 760;
  const tablet = !phone && width <= 1100;

  // Old links to cantia.ch/#pricing (directories, ads) now land on the
  // pricing page: the home page no longer carries the price grid.
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    if (window.location.hash === '#pricing') window.location.replace(`${p}/tarifs`);
  }, [p]);

  const heroSize = phone ? (width <= 370 ? 49 : 56) : tablet ? Math.min(54, Math.max(39, width * 0.05)) : Math.min(88, Math.max(60, width * 0.063));
  const h2Size = phone ? 32 : width <= 900 ? 36 : 42;

  return (
    <View style={styles.page}>
      <MarketingHead title={marketingPageTitle('home', locale)} />
      <MarketingNav />
      <ScrollView style={{ flex: 1 }}>
        {/* Hero */}
        {/* The hero fills the first screen: content centred, trust line at the bottom. */}
        <View style={{ paddingTop: phone ? 40 : tablet ? 48 : 56, minHeight: winH > 0 ? Math.max(phone ? 0 : 640, winH - (phone ? 75 : 86)) : undefined }}>
          <Wrap style={{ flex: 1, justifyContent: 'space-between' }}>
            <View style={[styles.heroTop, { flex: 1, alignItems: 'center' }, phone ? { flexDirection: 'column', alignItems: 'stretch', gap: 28 } : { gap: tablet ? 25 : 80 }]}>
              <View style={phone ? undefined : { flex: tablet ? 0.9 : 0.95, minWidth: 0 }}>
                <Eyebrow>{h.eyebrow}</Eyebrow>
                <Headline level={1} size={heroSize} plain={h.titlePlain} accent={h.titleAccent} style={{ marginTop: phone ? 20 : 23, marginBottom: phone ? 22 : 28 }} />
                <Text style={[sans, styles.lead, { fontSize: phone || tablet ? (tablet ? 13 : 14) : 15 }]}>
                  <Text style={{ color: site.ink, fontWeight: '500' }}>{h.leadStrong}</Text> {h.lead}
                </Text>
                <View style={[styles.actions, { gap: phone ? 23 : width <= 900 ? 15 : 25, marginTop: phone ? 24 : 26 }]}>
                  <View>
                    <Btn label={h.tryCta} href={authHref('signup')} small={phone || width <= 900} />
                  </View>
                  <View>
                    <TextLink label={h.explore} href={`${p}/fonctionnalites`} size={phone || width <= 900 ? 11 : 12} />
                  </View>
                </View>
              </View>
              <View style={phone ? undefined : { flex: tablet ? 1.1 : 1.05, minWidth: 0 }}>
                <HeroStage tag={h.stageTag} note={h.stageNote} phone={phone} />
              </View>
            </View>

            <View style={[styles.trust, phone && styles.trustPhone]}>
              {h.trust.map((item, i) => (
                <View key={item} style={styles.trustItem}>
                  <Feather name={(['map-pin', 'grid', 'globe'] as const)[i]} size={phone ? 12 : 14} color={site.copper} />
                  <Text style={[sans, styles.trustText, phone && { fontSize: 11 }]}>{item}</Text>
                </View>
              ))}
            </View>
          </Wrap>
        </View>

        {/* Five families */}
        <View style={[styles.section, { backgroundColor: site.white, paddingVertical: phone ? 53 : 86 }]}>
          <Wrap>
            <SectionHead eyebrow={h.familiesEyebrow} plain={h.familiesTitlePlain} accent={h.familiesTitleAccent} text={h.familiesText} />
            <Families phone={phone} narrow={!phone && width <= 900} />
            <View style={[styles.sectionBottom, phone && { flexDirection: 'column', alignItems: 'flex-start', gap: 14 }]}>
              <Text style={[sans, styles.small]}>{h.familiesNote}</Text>
              <View>
                <TextLink label={h.allFeatures} href={`${p}/fonctionnalites`} />
              </View>
            </View>
          </Wrap>
        </View>

        {/* Real exports */}
        <View style={[styles.section, { paddingVertical: phone ? 53 : 86 }]}>
          <Wrap>
            <SectionHead eyebrow={h.exportsEyebrow} plain={h.exportsTitlePlain} accent={h.exportsTitleAccent} text={h.exportsText} />
            <View style={[styles.exportsRow, phone && { flexDirection: 'column' }]}>
              <ExportCard title={h.exportDevis} meta={h.exportDevisMeta} phone={phone} flex={1}>
                <SignatureDetail />
              </ExportCard>
              <ExportCard title={h.exportFacture} meta={h.exportFactureMeta} phone={phone} flex={1.25}>
                <PaperImage source={EXPORTS[locale].slip.source} ratio={EXPORTS[locale].slip.ratio} />
              </ExportCard>
            </View>
          </Wrap>
        </View>

        {/* Assistant */}
        <View style={[styles.section, { backgroundColor: site.white, paddingVertical: phone ? 53 : 86 }]}>
          <Wrap>
            <View style={[styles.split, phone ? { flexDirection: 'column', gap: 29, alignItems: 'stretch' } : { gap: tablet ? 45 : 75 }]}>
              <View style={phone ? undefined : { flex: 1 }}>
                <Eyebrow>{h.assistantEyebrow}</Eyebrow>
                <Headline plain={h.assistantTitlePlain} accent={h.assistantTitleAccent} size={h2Size} style={{ marginTop: 15 }} />
                <Text style={[sans, styles.copy, phone && { fontSize: 13, maxWidth: '100%' }]}>{h.assistantText}</Text>
                <View style={{ marginTop: 20 }}>
                  <TextLink label={h.assistantLink} href={`${p}/assistant`} />
                </View>
              </View>
              <View style={phone ? undefined : { flex: 1 }}>
                <VoiceBox />
              </View>
            </View>

            <View style={[styles.sectorStrip, phone && { flexDirection: 'column', gap: 22, marginTop: 40, paddingTop: 28 }]}>
              <View style={phone ? undefined : { flex: 1 }}>
                <Headline level={3} plain={h.sectorTitlePlain} accent={h.sectorTitleAccent} inline size={phone ? 23 : 22} style={{ lineHeight: (phone ? 23 : 22) * 1.4, maxWidth: phone ? 290 : undefined }} />
              </View>
              <View style={[styles.pills, phone ? undefined : { flex: 2 }]}>
                {h.sectors.map((s) => (
                  <Pill key={s} label={s} href={`${p}/metiers`} small={phone} />
                ))}
                <View style={{ marginLeft: 6 }}>
                  <TextLink label={h.sectorLink} href={`${p}/metiers`} size={phone ? 11 : 12} />
                </View>
              </View>
            </View>
          </Wrap>
        </View>

        <SiteCta />

        <MarketingFooter />
      </ScrollView>
    </View>
  );
}

// The hero stage: the real app recorded on a computer and on a phone
// (components/site/HeroDevices). A phone screen shows the phone only.
function HeroStage({ tag, note, phone }: { tag: string; note: string; phone: boolean }) {
  const locale = useSiteLocale();
  const L = SITE_PAGES[locale].labels;
  return <HeroDevices locale={locale} phoneOnly={phone} labels={{ desktop: L.appAlt, phone: L.appAlt, note: `${tag} · ${note}` }} />;
}

function Families({ phone, narrow }: { phone: boolean; narrow: boolean }) {
  const locale = useSiteLocale();
  const families = SITE_COPY[locale].families;
  const p = localePrefix(locale);
  return (
    <View style={[styles.families, !phone && { flexDirection: 'row', flexWrap: narrow ? 'wrap' : 'nowrap' }]}>
      {families.map((f, i) => {
        const lastInRow = narrow ? i === 2 || i === 4 : i === families.length - 1;
        const borderBottom = phone ? i < families.length - 1 : narrow ? i < 3 : false;
        return (
          <Link key={f.key} href={`${p}/${f.slug}` as any} asChild>
            <Hover
              accessibilityRole="link"
              hover={{ backgroundColor: '#ede5d8' }}
              base={[
                phone ? styles.familyPhone : styles.family,
                !phone && { width: narrow ? '33.333%' : '20%', borderRightWidth: lastInRow ? 0 : 1, paddingHorizontal: narrow || phone ? 15 : 20 },
                borderBottom && { borderBottomWidth: 1 },
              ]}
            >
              {phone ? (
                <>
                  <Feather name={FAMILY_ICONS[f.key]} size={18} color={site.copper} style={{ width: 35 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={[sans, styles.familyName]}>{f.name}</Text>
                    <Text style={[sans, styles.familyText, { marginTop: 4, marginBottom: 0 }]}>{f.text}</Text>
                  </View>
                  <Feather name="arrow-right" size={16} color={site.ink} />
                </>
              ) : (
                <>
                  <View style={styles.familyTop}>
                    <Feather name={FAMILY_ICONS[f.key]} size={18} color={site.copper} />
                    <Text style={[sans, styles.familyNum]}>{String(i + 1).padStart(2, '0')}</Text>
                  </View>
                  <Text style={[sans, styles.familyName, narrow && { fontSize: 16 }]}>{f.name}</Text>
                  <Text style={[sans, styles.familyText]}>{f.text}</Text>
                  <Feather name="arrow-right" size={16} color={site.ink} />
                </>
              )}
            </Hover>
          </Link>
        );
      })}
    </View>
  );
}

function ExportCard({ title, meta, phone, flex, children }: { title: string; meta: string; phone: boolean; flex: number; children: React.ReactNode }) {
  return (
    <View style={[styles.exportCard, phone ? undefined : { flex }]}>
      <View style={[styles.exportStage, phone && { padding: 16 }]}>{children}</View>
      <View style={styles.exportMeta}>
        <Text style={[sans, styles.exportTitle]}>{title}</Text>
        <Text style={[sans, styles.small]}>{meta}</Text>
      </View>
    </View>
  );
}

function PaperImage({ source, ratio }: { source: ImageSourcePropType; ratio: number }) {
  const [w, setW] = useState(0);
  return (
    <View style={[styles.paper, paperShadow, { width: '100%' }]} onLayout={(e) => setW(e.nativeEvent.layout.width)}>
      <Image source={source} style={{ width: '100%', height: w ? w * ratio : 200 }} resizeMode="cover" />
    </View>
  );
}

// Close-up of the signature block of the signed quote (lower right of the
// same export), framed like a detail shot.
function SignatureDetail() {
  const locale = useSiteLocale();
  const shot = EXPORTS[locale].signature;
  return (
    <View style={[styles.paper, paperShadow, { width: '100%', aspectRatio: 1 / shot.ratio, overflow: 'hidden' }]}>
      <Image source={shot.source} style={{ width: '100%', height: '100%' }} resizeMode="contain" accessibilityLabel={SITE_PAGES[locale].labels.docAlt.signer} />
    </View>
  );
}

function Pill({ label, href, small }: { label: string; href: string; small: boolean }) {
  return (
    <Link href={href as any} asChild>
      <Hover accessibilityRole="link" base={[styles.pill, small && { paddingVertical: 7, paddingHorizontal: 11 }]} hover={{ borderColor: site.copper }}>
        {(hovered) => <Text style={[sans, { fontSize: small ? 9 : 10, color: hovered ? site.copper : site.ink }]}>{label}</Text>}
      </Hover>
    </Link>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: site.bg },
  heroTop: { flexDirection: 'row', alignItems: 'flex-end' },
  lead: { lineHeight: 26, color: '#73776c', maxWidth: 400 },
  actions: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  stage: { backgroundColor: site.stage, borderWidth: 1, borderColor: site.stageBorder, overflow: 'hidden', position: 'relative' },
  stageTag: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  stageTagText: { fontSize: 9, color: '#8c705a', letterSpacing: 0.7, flexShrink: 1 },
  paper: { backgroundColor: '#ffffff', borderRadius: 3, overflow: 'hidden' },
  trust: { flexDirection: 'row', justifyContent: 'center', gap: 55, paddingVertical: 24 },
  trustPhone: { flexDirection: 'column', alignItems: 'flex-start', gap: 11, paddingVertical: 22 },
  trustItem: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  trustText: { fontSize: 10, color: '#7a7d72' },
  section: {},
  families: { borderWidth: 1, borderColor: site.line, borderRadius: 9, overflow: 'hidden' },
  family: { paddingVertical: 25, borderColor: site.line, alignItems: 'flex-start' },
  familyPhone: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 20, borderColor: site.line },
  familyTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', alignSelf: 'stretch', marginBottom: 26 },
  familyNum: { fontSize: 9, color: '#9b9d92' },
  familyName: { fontSize: 17, fontWeight: '600', letterSpacing: -0.5, color: site.ink, marginBottom: 9 },
  familyText: { fontSize: 11, lineHeight: 20, color: site.muted, marginBottom: 22 },
  sectionBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 30, marginTop: 23 },
  small: { fontSize: 11, color: site.muted, lineHeight: 17 },
  exportsRow: { flexDirection: 'row', gap: 24, alignItems: 'stretch' },
  exportCard: { borderWidth: 1, borderColor: site.line, borderRadius: 12, overflow: 'hidden', backgroundColor: site.white },
  exportStage: { flex: 1, backgroundColor: site.stage, padding: 30, justifyContent: 'center' },
  exportMeta: { paddingVertical: 18, paddingHorizontal: 22, gap: 4, borderTopWidth: 1, borderTopColor: site.line },
  exportTitle: { fontSize: 14, fontWeight: '600', color: site.ink, letterSpacing: -0.3 },
  split: { flexDirection: 'row', alignItems: 'center' },
  copy: { fontSize: 14, color: site.muted, lineHeight: 27, maxWidth: 390, marginTop: 20 },
  sectorStrip: { flexDirection: 'row', gap: 40, borderTopWidth: 1, borderTopColor: site.line, paddingTop: 34, marginTop: 65 },
  pills: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 9 },
  pill: { paddingVertical: 8, paddingHorizontal: 13, borderWidth: 1, borderColor: site.line, borderRadius: 30 },
});
