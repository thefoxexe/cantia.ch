import { useEffect, useRef, useState } from 'react';
import { Image, Platform, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions, type ImageSourcePropType } from 'react-native';
import { Link, Redirect } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { MarketingFooter, MarketingNav } from '../components/MarketingChrome';
import { MarketingHead } from '../components/MarketingHead';
import { Btn, Eyebrow, Hover, Headline, TextLink, Wrap, useSiteFontScope } from '../components/site/Primitives';
import { FAMILY_ICONS, localePrefix, useSiteLocale } from '../components/site/SiteNav';
import { PhoneShot, SectionHead, SiteCta } from '../components/site/Sections';
import { ModuleMockup } from '../components/solutions/ModuleMockup';
import { EXPORTS } from '../components/site/exports';
import { SITE_PAGES } from '../lib/site/pages';
import { SITE_COPY } from '../lib/site/copy';
import { marketingPageTitle } from '../lib/marketingSeoTitles';
import { sans, site } from '../lib/siteTheme';
import { authHref, useSyncMarketingLocaleFromPath } from '../lib/appHost';
import { HeroDevices } from '../components/site/HeroDevices';
import { FaqItem } from '../components/site/FamilyPage';
import { SECTOR_KEYS, SECTORS_COPY, sectorHref, type SectorKey } from '../lib/site/sectors';
import HOME_FAQ_JSON from '../lib/site/homeFaq.json';
import { SiteImage } from '../components/site/SiteImage';

const HOME_FAQ = HOME_FAQ_JSON as Record<'fr' | 'de' | 'it', { eyebrow: string; title: string; items: { q: string; a: string }[] }>;

// Real PDFs produced by Cantia's own renderer (sample data: Atelier Martin SA
// for M. et Mme Dubois). Never replace them with mock-ups or screenshots that
// still carry the old logo.

const paperShadow = Platform.OS === 'web' ? ({ boxShadow: '0 22px 48px rgba(86,58,34,0.16), 0 2px 6px rgba(86,58,34,0.08)' } as object) : {};

export default function LandingScreen() {
  useSiteFontScope();
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
        <View
          style={{
            paddingTop: phone ? 40 : tablet ? 48 : 56,
            // The first screen minus the nav. In CSS on the web (svh: the
            // visible height on a phone), so the pre-rendered page already
            // has its real height and nothing moves when JavaScript runs.
            minHeight:
              Platform.OS === 'web'
                ? ((phone ? 'calc(100svh - 75px)' : 'max(640px, calc(100svh - 86px))') as unknown as number)
                : winH > 0
                  ? Math.max(phone ? 0 : 640, winH - (phone ? 75 : 86))
                  : undefined,
          }}
        >
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
                    <TextLink label={h.demo} href={`https://demo.cantia.ch/?locale=${locale}`} size={phone || width <= 900 ? 11 : 12} />
                  </View>
                  <View>
                    <TextLink label={h.explore} href={`${p}/fonctionnalites`} size={phone || width <= 900 ? 11 : 12} />
                  </View>
                </View>
              </View>
              <View style={phone ? undefined : { flex: tablet ? 1.1 : 1.05, minWidth: 0 }}>
                <HeroStage phone={phone} />
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
              <ExportCard title={h.exportDevis} meta={h.exportDevisMeta} phone={phone} pdf={EXPORTS[locale].devisFull.pdf}>
                <PaperImage source={EXPORTS[locale].devisFull.source} ratio={EXPORTS[locale].devisFull.ratio} alt={SITE_PAGES[locale].labels.docAlt.signer} />
              </ExportCard>
              <ExportCard title={h.exportFacture} meta={h.exportFactureMeta} phone={phone} pdf={EXPORTS[locale].facture.pdf}>
                <PaperImage source={EXPORTS[locale].facture.source} ratio={EXPORTS[locale].facture.ratio} alt={h.exportFacture} />
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
                <ModuleMockup kind="dictee-vocale" />
              </View>
            </View>

          </Wrap>
        </View>

        {/* For your trade: the four sectors, each to its own page */}
        <View style={[styles.section, { paddingVertical: phone ? 53 : 86 }]}>
          <Wrap>
            <SectionHead eyebrow={HOME_SECTORS[locale].eyebrow} plain={h.sectorTitlePlain.replace('\n', ' ')} accent={h.sectorTitleAccent} text={HOME_SECTORS[locale].text} />
            <View style={[styles.sectorGrid, phone && { flexDirection: 'column' }]}>
              {SECTOR_KEYS.map((key) => (
                <SectorCard key={key} sector={key} href={sectorHref(p, key)} phone={phone} />
              ))}
            </View>
            <View style={{ marginTop: 23 }}>
              <TextLink label={h.sectorLink} href={`${p}/metiers`} />
            </View>
          </Wrap>
        </View>

        {/* Questions asked before starting (FAQPage JSON-LD from scripts/seo-routes.mjs) */}
        <View style={[styles.section, { backgroundColor: site.white, paddingVertical: phone ? 53 : 86 }]}>
          <Wrap>
            <View style={styles.faq}>
              <Eyebrow>{HOME_FAQ[locale].eyebrow}</Eyebrow>
              <Headline plain={HOME_FAQ[locale].title} size={h2Size} style={{ marginTop: 15, marginBottom: 30 }} />
              {HOME_FAQ[locale].items.map((q, i, all) => (
                <FaqItem key={q.q} q={q.q} a={q.a} last={i === all.length - 1} />
              ))}
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
function HeroStage({ phone }: { phone: boolean }) {
  const locale = useSiteLocale();
  const L = SITE_PAGES[locale].labels;
  return <HeroDevices locale={locale} phoneOnly={phone} labels={{ desktop: L.appAlt, phone: L.appAlt }} />;
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

// One whole document (full A4 page, as the client receives it). The page
// opens the real PDF.
function ExportCard({ title, meta, phone, pdf, children }: { title: string; meta: string; phone: boolean; pdf: string; children: React.ReactNode }) {
  const open = () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') window.open(pdf, '_blank', 'noopener');
  };
  return (
    <Hover onPress={open} accessibilityRole="link" base={[styles.exportCard, phone ? undefined : { flex: 1 }]} hover={{ borderColor: site.copper }}>
      {(hovered) => (
        <>
          <View style={[styles.exportStage, phone && { padding: 16 }]}>{children}</View>
          <View style={[styles.exportMeta, { flexDirection: 'row', alignItems: 'center', gap: 14 }]}>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={[sans, styles.exportTitle]}>{title}</Text>
              <Text style={[sans, styles.small]}>{meta}</Text>
            </View>
            <Feather name="download" size={16} color={hovered ? site.copper : site.ink} />
          </View>
        </>
      )}
    </Hover>
  );
}

function PaperImage({ source, ratio, alt }: { source: ImageSourcePropType; ratio: number; alt: string }) {
  return (
    <View style={[styles.paper, paperShadow, { width: '100%', aspectRatio: 1 / ratio }]}>
      <SiteImage source={source} style={{ width: '100%', height: '100%' }} resizeMode="cover" alt={alt} />
    </View>
  );
}

const HOME_SECTORS = {
  fr: { eyebrow: 'Par secteur', text: 'Le même outil, avec les mots de votre métier : chantiers, interventions, mandats ou projets.', more: 'Voir la page' },
  de: { eyebrow: 'Nach Branche', text: 'Dasselbe Werkzeug, mit den Wörtern Ihrer Branche: Baustellen, Einsätze, Mandate oder Projekte.', more: 'Zur Seite' },
  it: { eyebrow: 'Per settore', text: 'Lo stesso strumento, con le parole del suo mestiere: cantieri, interventi, mandati o progetti.', more: 'Vedi la pagina' },
} as const;

function SectorCard({ sector, href, phone }: { sector: SectorKey; href: string; phone: boolean }) {
  const locale = useSiteLocale();
  const c = SECTORS_COPY[locale][sector];
  // Building trades live on their own pages (not in c.trades): a few names here.
  const trades = sector === 'batiment' ? BUILDING_NAMES[locale] : c.trades.slice(0, 4).map((t) => t.name).join(' · ');
  return (
    <Link href={href as any} asChild>
      <Hover accessibilityRole="link" base={[styles.sectorCard, !phone && { flex: 1 }]} hover={{ borderColor: site.copper }}>
        {(hovered) => (
          <>
            <Feather name={SECTOR_ICON[sector]} size={18} color={site.copper} />
            <Text style={[sans, styles.sectorName, hovered && { color: site.copper }]}>{c.label}</Text>
            <Text style={[sans, styles.sectorTrades]}>{trades}</Text>
            <View style={styles.sectorMore}>
              <Text style={[sans, styles.sectorMoreText]}>{HOME_SECTORS[locale].more}</Text>
              <Feather name="arrow-right" size={12} color={site.copper} />
            </View>
          </>
        )}
      </Hover>
    </Link>
  );
}

const BUILDING_NAMES = {
  fr: 'Maçons · Charpentiers · Électriciens · Plâtriers-peintres · Entreprises générales',
  de: 'Maurer · Zimmerleute · Elektriker · Gipser und Maler · Generalunternehmen',
  it: 'Muratori · Carpentieri · Elettricisti · Gessatori e pittori · Imprese generali',
} as const;

const SECTOR_ICON: Record<SectorKey, keyof typeof Feather.glyphMap> = { batiment: 'home', services: 'droplet', etudes: 'compass', creatifs: 'aperture' };


const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: site.bg },
  heroTop: { flexDirection: 'row', alignItems: 'flex-end' },
  lead: { lineHeight: 26, color: site.muted, maxWidth: 400 },
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
  sectorGrid: { flexDirection: 'row', gap: 16, alignItems: 'stretch' },
  sectorCard: { borderWidth: 1, borderColor: site.line, borderRadius: 10, backgroundColor: site.white, padding: 22, gap: 10 },
  sectorName: { fontSize: 16, fontWeight: '600', letterSpacing: -0.4, color: site.ink, marginTop: 6 },
  sectorTrades: { fontSize: 11, lineHeight: 19, color: site.muted, flexGrow: 1 },
  sectorMore: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  sectorMoreText: { fontSize: 11, color: site.copper, fontWeight: '500' },
  faq: { maxWidth: 760, alignSelf: 'center', width: '100%' },
  pills: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 9 },
  pill: { paddingVertical: 8, paddingHorizontal: 13, borderWidth: 1, borderColor: site.line, borderRadius: 30 },
});
