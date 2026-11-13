import { useState } from 'react';
import { Linking, Platform, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Btn, Eyebrow, Headline, Hover, TextLink, Wrap } from './Primitives';
import { Breadcrumbs, Callout, PhoneShot, ScreenShot, Section, SectionHead, SitePage, paperShadow, useSiteLayout, usePrefix } from './Sections';
import { FaqItem } from './FamilyPage';
import { useSiteLocale } from './SiteNav';
import { EXPORTS } from './exports';
import { INNER_COPY } from '../../lib/site/inner';
import { COMPARE_COPY, COMPARE_GUIDE_SLUG } from '../../lib/site/compare';
import { blogHref, isListed } from '../../lib/blog/triage';
import { SITE_PAGES } from '../../lib/site/pages';
import { SITE_COPY } from '../../lib/site/copy';
import { SECTOR_KEYS, SECTOR_SLUGS, SECTORS_COPY } from '../../lib/site/sectors';
import { sans, serif, site } from '../../lib/siteTheme';
import { authHref } from '../../lib/appHost';
import { useTranslation } from '../../lib/translations';
import { SurMesureContactForm } from '../SurMesureContactForm';
import { ContactForm } from '../ContactForm';
import { HeroDevices } from './HeroDevices';

type IconName = React.ComponentProps<typeof Feather>['name'];
const HOME = { fr: 'Accueil', de: 'Startseite', it: 'Home' } as const;


function PageHero({ crumb, eyebrow, plain, accent, lead, children, visual }: { crumb: string; eyebrow: string; plain: string; accent: string; lead: string; children?: React.ReactNode; visual?: React.ReactNode }) {
  const locale = useSiteLocale();
  const p = usePrefix();
  const { phone, tablet } = useSiteLayout();
  const h1Size = visual ? (phone ? 43 : tablet ? 46 : 56) : phone ? 43 : tablet ? 52 : 62;
  const text = (
    <View style={visual && !phone ? { flex: 1.25, minWidth: 0 } : undefined}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <Headline level={1} size={h1Size} plain={plain} accent={accent} style={[styles.h1, { letterSpacing: phone ? -1.9 : -3, lineHeight: h1Size * 1.07 }]} />
      <Text style={[sans, styles.lead, phone && { fontSize: 13, lineHeight: 24 }]}>{lead}</Text>
      {children}
    </View>
  );
  return (
    <View style={{ paddingTop: phone ? 32 : 58, paddingBottom: phone ? 35 : 52 }}>
      <Wrap>
        <Breadcrumbs items={[{ label: HOME[locale], href: p || '/' }, { label: crumb }]} />
        {visual ? (
          <View style={[styles.leadGrid, phone ? { flexDirection: 'column', alignItems: 'stretch', gap: 30 } : { gap: tablet ? 40 : 70 }]}>
            {text}
            <View style={phone ? undefined : { flex: 0.8, minWidth: 0 }}>{visual}</View>
          </View>
        ) : (
          text
        )}
      </Wrap>
    </View>
  );
}

function Actions({ children }: { children: React.ReactNode }) {
  const { phone } = useSiteLayout();
  return <View style={[styles.actions, { gap: phone ? 23 : 25 }]}>{children}</View>;
}

function Tags({ items }: { items: string[] }) {
  return (
    <View style={styles.tagRow}>
      {items.map((t) => (
        <Text key={t} style={[sans, styles.tag]}>
          {t}
        </Text>
      ))}
    </View>
  );
}

function Grid({ children, cols = 3 }: { children: React.ReactNode; cols?: number }) {
  const { phone, narrow } = useSiteLayout();
  const basis = phone ? '100%' : narrow && cols > 2 ? '46%' : cols === 2 ? '47%' : '30%';
  return (
    <View style={[styles.grid, phone && { gap: 20 }]}>
      {(Array.isArray(children) ? children : [children]).map((c, i) => (
        <View key={i} style={{ flexBasis: basis as any, flexGrow: 1 }}>
          {c}
        </View>
      ))}
    </View>
  );
}

function Card({ icon, label, title, text, link }: { icon?: IconName; label?: string; title: string; text: string; link?: React.ReactNode }) {
  const { phone } = useSiteLayout();
  return (
    <View style={styles.card}>
      {icon ? <Feather name={icon} size={18} color={site.copper} /> : null}
      {label ? <Text style={[sans, styles.cardLabel]}>{label.toUpperCase()}</Text> : null}
      <Text style={[sans, styles.cardTitle, phone && { fontSize: 21 }]}>{title}</Text>
      <Text style={[sans, styles.cardText]}>{text}</Text>
      {link ? <View style={{ marginTop: 16 }}>{link}</View> : null}
    </View>
  );
}

function Steps({ items }: { items: { title: string; text: string }[] }) {
  const { phone } = useSiteLayout();
  return (
    <View style={[styles.steps, phone && { flexDirection: 'column', gap: 10 }]}>
      {items.map((s, i) => (
        <View key={s.title} style={[styles.step, phone ? { flexDirection: 'row', gap: 12, paddingVertical: 18 } : { flex: 1 }]}>
          <Text style={[serif, styles.stepNum, phone && { fontSize: 28, width: 40 }]}>{String(i + 1).padStart(2, '0')}</Text>
          <View style={phone ? { flex: 1 } : undefined}>
            <Text style={[sans, styles.stepTitle, phone && { marginTop: 4 }]}>{s.title}</Text>
            <Text style={[sans, styles.stepText]}>{s.text}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

function Faq({ eyebrow, title, items }: { eyebrow: string; title: string; items: { q: string; a: string }[] }) {
  const { phone } = useSiteLayout();
  return (
    <View style={styles.faq}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <Headline plain={title} size={phone ? 32 : 42} style={{ marginTop: 15, marginBottom: 30 }} />
      {items.map((q, i) => (
        <FaqItem key={q.q} q={q.q} a={q.a} last={i === items.length - 1} />
      ))}
    </View>
  );
}

// "accounting.cantia.ch" and other absolute links open in place; internal
// slugs get the locale prefix.
function useHref() {
  const p = usePrefix();
  return (slug: string) => (slug.startsWith('http') ? slug : `${p}/${slug}`);
}

// ─── Sur mesure ─────────────────────────────────────────────────────────────

export function SurMesurePage() {
  const locale = useSiteLocale();
  const c = INNER_COPY[locale].surMesure;
  const L = SITE_PAGES[locale].labels;
  const p = usePrefix();
  const { phone, h2Size } = useSiteLayout();
  const [formY, setFormY] = useState(0);

  return (
    <SitePage title={c.seoTitle} description={c.seoDescription}>
      <PageHero
        crumb={c.crumb}
        eyebrow={c.eyebrow}
        plain={c.h1Plain}
        accent={c.h1Accent}
        lead={c.lead}
        visual={
          <View style={[styles.visual, { padding: phone ? 22 : 30 }]}>
            <View style={[styles.paperCard, paperShadow]}>
              <Text style={[sans, styles.paperTop]}>{c.paper.tag}</Text>
              <Text style={[sans, styles.paperTitle]}>{c.paper.title}</Text>
              <Text style={[sans, styles.paperSub]}>{c.paper.sub}</Text>
              {c.paper.lines.map((l) => (
                <View key={l} style={styles.paperLine}>
                  <Feather name="check" size={12} color={site.copper} />
                  <Text style={[sans, { fontSize: 11, color: site.ink }]}>{l}</Text>
                </View>
              ))}
              <Text style={[sans, styles.paperCaption]}>{c.paper.caption}</Text>
            </View>
          </View>
        }
      >
        <Actions>
          <View>
            <Btn label={c.cta} href={`${p}/contact`} small={phone} />
          </View>
          <View>
            <TextLink label={c.existing} href={`${p}/fonctionnalites`} size={phone ? 11 : 12} />
          </View>
        </Actions>
      </PageHero>

      <Section white>
        <SectionHead eyebrow={c.cardsEyebrow} plain={c.cardsPlain} accent={c.cardsAccent} text={c.cardsNote} />
        <Grid>
          {c.cards.map((k, i) => (
            <Card key={k.title} icon={(['box', 'git-branch', 'link'] as IconName[])[i]} title={k.title} text={k.text} />
          ))}
        </Grid>
      </Section>

      <Section>
        <SectionHead eyebrow={L.stepsEyebrow} plain={L.stepsTitle} />
        <Steps items={c.steps} />
      </Section>

      <Section white onLayout={setFormY}>
        <View style={[styles.split, phone ? { flexDirection: 'column', gap: 29, alignItems: 'stretch' } : { gap: 60, alignItems: 'flex-start' }]}>
          <View style={phone ? undefined : { flex: 0.8 }}>
            <Eyebrow>{c.formEyebrow}</Eyebrow>
            <Headline plain={c.formPlain} accent={c.formAccent} size={h2Size} style={{ marginTop: 15, marginBottom: 22 }} />
            <Text style={[sans, styles.copy]}>{c.formText}</Text>
          </View>
          <View style={phone ? undefined : { flex: 1.2 }}>
            <SurMesureContactForm />
          </View>
        </View>
      </Section>

      <Section>
        <Faq eyebrow={L.faqEyebrow} title={L.faqTitle} items={c.faq} />
      </Section>
    </SitePage>
  );
}

// ─── À propos ───────────────────────────────────────────────────────────────

// A chronological frieze: a line with one mark per step, across on a
// computer, down on a phone. The highlighted step gets a filled mark.
function Timeline({ items, highlight, phone }: { items: { when: string; title: string; text: string }[]; highlight: number; phone: boolean }) {
  if (phone) {
    return (
      <View style={{ marginTop: 8 }}>
        {items.map((it, i) => (
          <View key={it.when} style={{ flexDirection: 'row', gap: 16 }}>
            <View style={{ width: 14, alignItems: 'center' }}>
              <View style={[styles.tlDot, i === highlight && styles.tlDotOn, { marginTop: 3 }]} />
              {i < items.length - 1 ? <View style={styles.tlLineV} /> : null}
            </View>
            <View style={{ flex: 1, gap: 6, paddingBottom: 26 }}>
              <Text style={[sans, styles.tlWhen]}>{it.when.toUpperCase()}</Text>
              <Text style={[sans, styles.tlTitle]}>{it.title}</Text>
              <Text style={[sans, styles.cardText]}>{it.text}</Text>
            </View>
          </View>
        ))}
      </View>
    );
  }
  return (
    <View style={{ marginTop: 12 }}>
      <View style={styles.tlLineH} />
      <View style={{ flexDirection: 'row', gap: 24 }}>
        {items.map((it, i) => (
          <View key={it.when} style={{ flex: 1, gap: 8 }}>
            <View style={[styles.tlDot, i === highlight && styles.tlDotOn, { marginBottom: 14 }]} />
            <Text style={[sans, styles.tlWhen]}>{it.when.toUpperCase()}</Text>
            <Text style={[sans, styles.tlTitle]}>{it.title}</Text>
            <Text style={[sans, styles.cardText]}>{it.text}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export function AboutPage() {
  const locale = useSiteLocale();
  const c = INNER_COPY[locale].about;
  const families = SITE_COPY[locale].families;
  const href = useHref();
  const { phone } = useSiteLayout();
  return (
    <SitePage title={c.seoTitle} description={c.seoDescription}>
      <PageHero crumb={c.crumb} eyebrow={c.eyebrow} plain={c.h1Plain} accent={c.h1Accent} lead={c.lead} />
      <Section white>
        <SectionHead eyebrow={c.forEyebrow} plain={c.forTitle} text={c.forText} />
        <Grid cols={2}>
          {SECTOR_KEYS.map((k) => (
            <Card key={k} title={SECTORS_COPY[locale][k].label} text={c.sectors[k]} link={<TextLink label={c.sectorLink} href={href(`metiers/${SECTOR_SLUGS[k]}`)} />} />
          ))}
        </Grid>
      </Section>
      <Section>
        <SectionHead eyebrow={c.howEyebrow} plain={c.howTitle} />
        <View style={[styles.aboutSteps, phone && { flexDirection: 'column', gap: 22 }]}>
          {families.map((f, i) => (
            <Link key={f.key} href={href(f.slug) as any} asChild>
              <Hover accessibilityRole="link" base={[styles.aboutStep, !phone && { flex: 1 }]} hover={{ borderTopColor: site.copper }}>
                <Text style={[serif, styles.aboutStepNum]}>{String(i + 1).padStart(2, '0')}</Text>
                <Text style={[sans, styles.cardTitle, { fontSize: 18, marginTop: 0, marginBottom: 0 }]}>{f.name}</Text>
                <Text style={[sans, styles.cardText]}>{c.how[i]}</Text>
              </Hover>
            </Link>
          ))}
        </View>
      </Section>
      <Section white>
        <SectionHead eyebrow={c.storyEyebrow} plain={c.storyTitle} text={c.storyText} />
        <Timeline items={c.story} highlight={2} phone={phone} />
      </Section>
      <Section>
        <SectionHead eyebrow={c.ecoEyebrow} plain={c.ecoTitle} text={c.ecoText} />
        <Grid cols={2}>
          {c.eco.map((e, i) => (
            <Card key={e.label} icon={(['book', 'users'] as IconName[])[i]} label={e.label} title={e.title} text={e.text} link={<TextLink label={e.link} href={e.href} />} />
          ))}
        </Grid>
      </Section>
    </SitePage>
  );
}

// ─── Comparatifs ────────────────────────────────────────────────────────────

// An article of the blog in this language, or null when it is not published
// there (untranslated articles redirect, see lib/blog/triage.json). Only the
// triage data is read, so the articles stay out of this page's bundle.
function articleHref(base: string, locale: 'fr' | 'de' | 'it'): string | null {
  return isListed(base, locale) ? blogHref(base, locale) : null;
}

export function ComparePage() {
  const locale = useSiteLocale();
  const c = COMPARE_COPY[locale];
  const href = useHref();
  const { phone } = useSiteLayout();
  const rows = c.rows.map((r) => ({ ...r, href: articleHref(r.slug, locale) }));
  const guide = articleHref(COMPARE_GUIDE_SLUG, locale);
  return (
    <SitePage title={c.seoTitle} description={c.seoDescription}>
      <PageHero crumb={c.crumb} eyebrow={c.eyebrow} plain={c.h1Plain} accent={c.h1Accent} lead={c.lead} />
      <Section white>
        <SectionHead eyebrow={c.tableEyebrow} plain={c.tablePlain} text={c.tableText} />
        <View style={styles.cmpTable}>
          {!phone ? (
            <View style={[styles.cmpRow, { paddingVertical: 14 }]}>
              <Text style={[sans, styles.cmpTh, { width: 130 }]}>{c.head[0].toUpperCase()}</Text>
              <Text style={[sans, styles.cmpTh, { flex: 1 }]}>{c.head[1].toUpperCase()}</Text>
              <Text style={[sans, styles.cmpTh, { flex: 1 }]}>{c.head[2].toUpperCase()}</Text>
              <View style={{ width: 170 }} />
            </View>
          ) : null}
          {rows.map((r) => (
            <View key={r.tool} style={[styles.cmpRow, phone && { flexDirection: 'column', alignItems: 'flex-start', gap: 8 }]}>
              <Text style={[sans, styles.cmpTool, !phone && { width: 130 }]}>{r.tool}</Text>
              <Text style={[sans, styles.cardText, !phone && { flex: 1 }]}>{r.forWhom}</Text>
              <Text style={[sans, styles.cardText, { color: site.ink }, !phone && { flex: 1 }]}>{r.withCantia}</Text>
              <View style={!phone ? { width: 170 } : undefined}>
                {r.href ? <TextLink label={c.read} href={r.href} /> : <TextLink label={c.noArticle} href={blogHref(r.slug, 'fr')} size={11} />}
              </View>
            </View>
          ))}
        </View>
      </Section>
      <Section>
        <SectionHead eyebrow={c.cardsEyebrow} plain={c.cardsPlain} text={c.cardsText} />
        <Grid>
          {[
            ...rows.filter((r) => r.href).map((r) => (
              <Card key={r.slug} label={r.tool} title={c.vs.replace('{tool}', r.tool)} text={r.forWhom} link={<TextLink label={c.read} href={r.href!} />} />
            )),
            ...(guide ? [<Card key="guide" label={c.guideLabel} title={c.guideTitle} text={c.guideText} link={<TextLink label={c.guideRead} href={guide} />} />] : []),
          ]}
        </Grid>
        <View style={{ marginTop: 40 }}>
          <Callout strong={c.importStrong} text={c.importText} link={<TextLink label={c.importLink} href={href('integrations')} />} />
        </View>
      </Section>
      <Section white>
        <Faq eyebrow={c.faqEyebrow} title={c.faqTitle} items={c.faq} />
      </Section>
    </SitePage>
  );
}

// ─── Ordinateur & téléphone ─────────────────────────────────────────────────

export function AppPage() {
  const locale = useSiteLocale();
  const c = INNER_COPY[locale].app;
  const L = SITE_PAGES[locale].labels;
  const { t } = useTranslation();
  const p = usePrefix();
  const { phone } = useSiteLayout();
  const platforms: { icon: IconName; label: string; steps: string[] }[] = [
    { icon: 'smartphone', label: t('telechargementPage.platformIosLabel'), steps: [t('telechargementPage.platformIosStep1'), t('telechargementPage.platformIosStep2'), t('telechargementPage.platformIosStep3')] },
    { icon: 'smartphone', label: t('telechargementPage.platformAndroidLabel'), steps: [t('telechargementPage.platformAndroidStep1'), t('telechargementPage.platformAndroidStep2'), t('telechargementPage.platformAndroidStep3')] },
    { icon: 'monitor', label: t('telechargementPage.platformDesktopLabel'), steps: [t('telechargementPage.platformDesktopStep1'), t('telechargementPage.platformDesktopStep2'), t('telechargementPage.platformDesktopStep3')] },
  ];
  const spaces = [
    { label: 'Cantia', tag: t('telechargementPage.appsMainTag'), text: t('telechargementPage.appsMainText') },
    { label: 'Cantia Accounting', tag: t('telechargementPage.appsAccountingTag'), text: t('telechargementPage.appsAccountingText'), href: `https://accounting.cantia.ch${p}`, cta: t('telechargementPage.appsAccountingCta') },
    { label: 'Cantia Partners', tag: t('telechargementPage.appsPartnersTag'), text: t('telechargementPage.appsPartnersText'), href: `https://partners.cantia.ch${p}`, cta: t('telechargementPage.appsPartnersCta') },
  ];

  return (
    <SitePage title={c.seoTitle} description={c.seoDescription}>
      <PageHero
        crumb={c.crumb}
        eyebrow={c.eyebrow}
        plain={c.h1Plain}
        accent={c.h1Accent}
        lead={c.lead}
        visual={<DevicesStage />}
      >
        <Actions>
          <View>
            <Btn label={c.open} href={authHref('login')} small={phone} />
          </View>
          <View>
            <TextLink label={c.choose} href={`${p}/tarifs`} size={phone ? 11 : 12} />
          </View>
        </Actions>
        <Tags items={c.tags} />
      </PageHero>

      <Section white>
        <SectionHead eyebrow={c.stepsEyebrow} plain={c.stepsPlain} accent={c.stepsAccent} text={c.stepsNote} />
        <Steps items={c.steps} />
      </Section>

      <Section>
        <SectionHead eyebrow={t('telechargementPage.installTitle')} plain={c.devicesPlain} accent={c.devicesAccent} text={t('telechargementPage.installLead')} />
        <Grid>
          {platforms.map((pl) => (
            <View key={pl.label} style={styles.card}>
              <Feather name={pl.icon} size={18} color={site.copper} />
              <Text style={[sans, styles.cardTitle]}>{pl.label}</Text>
              <View style={{ gap: 9 }}>
                {pl.steps.map((s, i) => (
                  <View key={s} style={{ flexDirection: 'row', gap: 10 }}>
                    <Text style={[serif, { fontSize: 15, color: site.copper, width: 16 }]}>{i + 1}</Text>
                    <Text style={[sans, styles.cardText, { flex: 1 }]}>{s}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </Grid>
        <View style={{ marginTop: 36 }}>
          <Callout strong={t('telechargementPage.storeSectionTitle')} text={t('telechargementPage.storeSectionText')} />
        </View>
      </Section>

      <Section white>
        <SectionHead eyebrow={t('telechargementPage.appsTitle')} plain={c.spacesPlain} accent={c.spacesAccent} text={t('telechargementPage.appsLead')} />
        <Grid>
          {spaces.map((s) => (
            <Card key={s.label} label={s.tag} title={s.label} text={s.text} link={s.href ? <TextLink label={s.cta!} href={s.href} /> : undefined} />
          ))}
        </Grid>
      </Section>
    </SitePage>
  );
}

// The real dashboard on a computer with the treasury on a phone in front:
// both rendered from the app itself with sample data.
// The real app recorded on a computer and a phone (components/site/HeroDevices).
function DevicesStage() {
  const locale = useSiteLocale();
  const L = SITE_PAGES[locale].labels;
  const { phone } = useSiteLayout();
  return <HeroDevices locale={locale} phoneOnly={phone} labels={{ desktop: L.appAlt, phone: L.treasuryAlt }} />;
}

// ─── Découvrir ──────────────────────────────────────────────────────────────

export function ResourcesPage() {
  const locale = useSiteLocale();
  const c = INNER_COPY[locale].resources;
  const href = useHref();
  const icons: IconName[] = ['help-circle', 'smartphone', 'grid', 'book-open', 'percent', 'mail'];
  return (
    <SitePage title={c.seoTitle} description={c.seoDescription}>
      <PageHero crumb={c.crumb} eyebrow={c.eyebrow} plain={c.h1Plain} accent={c.h1Accent} lead={c.lead} />
      <Section white>
        <Grid>
          {c.items.map((it, i) => (
            <Card key={it.title} icon={icons[i]} title={it.title} text={it.text} link={<TextLink label={it.link} href={href(it.href)} />} />
          ))}
        </Grid>
      </Section>
    </SitePage>
  );
}

// ─── Contact ────────────────────────────────────────────────────────────────

export function ContactPage() {
  const locale = useSiteLocale();
  const c = INNER_COPY[locale].contact;
  const href = useHref();
  const { phone, h2Size } = useSiteLayout();
  return (
    <SitePage title={c.seoTitle} description={c.seoDescription}>
      <PageHero crumb={c.crumb} eyebrow={c.eyebrow} plain={c.h1Plain} accent={c.h1Accent} lead={c.lead} />
      <Section white>
        <Grid cols={2}>
          {c.cards.map((k, i) => (
            <View key={k.title} style={[styles.contactCard, phone && { padding: 25 }]}>
              <Feather name={i === 0 ? 'mail' : 'phone'} size={18} color={site.copper} />
              <Headline level={2} plain={k.title} size={phone ? 26 : 30} style={{ marginTop: 16, marginBottom: 12 }} />
              <Text style={[sans, styles.cardText]}>{k.text}</Text>
              {/* Shown as plain text too: mailto/tel links do nothing on some devices. */}
              <Hover onPress={() => Linking.openURL(k.href)} accessibilityRole="link" base={{ marginTop: 18, alignSelf: 'flex-start' }} hover={{ opacity: 0.75 }}>
                <Text style={[sans, { fontSize: 15, fontWeight: '600', color: site.ink }, Platform.OS === 'web' ? ({ userSelect: 'text' } as object) : null]}>{k.value}</Text>
              </Hover>
            </View>
          ))}
        </Grid>
      </Section>
      <Section>
        <View style={[styles.split, phone ? { flexDirection: 'column', gap: 29, alignItems: 'stretch' } : { gap: 60, alignItems: 'flex-start' }]}>
          <View style={phone ? undefined : { flex: 0.8 }}>
            <Eyebrow>{c.formEyebrow}</Eyebrow>
            <Headline plain={c.formTitle} size={h2Size} style={{ marginTop: 15 }} />
          </View>
          <View style={phone ? undefined : { flex: 1.2 }}>
            <ContactForm />
          </View>
        </View>
        <View style={{ marginTop: 40 }}>
          <Callout strong={c.calloutStrong} text={c.callout} link={<TextLink label={c.calloutLink} href={href('aide')} />} />
        </View>
      </Section>
    </SitePage>
  );
}

const styles = StyleSheet.create({
  aboutSteps: { flexDirection: 'row', gap: 20 },
  aboutStep: { gap: 10, paddingTop: 20, borderTopWidth: 1, borderTopColor: site.line },
  aboutStepNum: { fontSize: 22, color: site.copper },
  tlLineH: { position: 'absolute', top: 6, left: 0, right: 0, height: 1, backgroundColor: site.line },
  tlLineV: { width: 1, flex: 1, backgroundColor: site.line, marginTop: 6 },
  tlDot: { width: 13, height: 13, borderRadius: 7, borderWidth: 2, borderColor: site.copper, backgroundColor: site.white },
  tlDotOn: { backgroundColor: site.copper },
  tlWhen: { fontSize: 10, letterSpacing: 1.3, color: site.copper, fontWeight: '600' },
  tlTitle: { fontSize: 17, color: site.ink, letterSpacing: -0.3 },
  cmpTable: { borderTopWidth: 1, borderTopColor: site.line },
  cmpRow: { flexDirection: 'row', alignItems: 'center', gap: 24, paddingVertical: 22, borderBottomWidth: 1, borderBottomColor: site.line },
  cmpTh: { fontSize: 9, letterSpacing: 1.4, color: site.muted, fontWeight: '600' },
  cmpTool: { fontSize: 18, color: site.ink, fontWeight: '500', letterSpacing: -0.4 },
  leadGrid: { flexDirection: 'row', alignItems: 'center' },
  h1: { marginTop: 17, marginBottom: 21, fontWeight: '400', maxWidth: 850 },
  lead: { fontSize: 15, color: site.muted, lineHeight: 28, maxWidth: 610 },
  actions: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginTop: 26 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 24 },
  tag: { fontSize: 9, color: '#6b6f65', borderWidth: 1, borderColor: site.line, borderRadius: 3, paddingVertical: 5, paddingHorizontal: 9 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 30 },
  card: { borderTopWidth: 1, borderTopColor: site.line, paddingTop: 25, gap: 0 },
  cardLabel: { fontSize: 9, letterSpacing: 1, color: site.copper, fontWeight: '600', marginTop: 16 },
  cardTitle: { fontSize: 19, lineHeight: 26, letterSpacing: -0.3, color: site.ink, marginTop: 14, marginBottom: 11 },
  cardText: { fontSize: 12, color: site.muted, lineHeight: 22 },
  steps: { flexDirection: 'row', gap: 35 },
  step: { borderTopWidth: 1, borderTopColor: site.line, paddingVertical: 22 },
  stepNum: { fontSize: 32, color: site.copper, lineHeight: 38 },
  stepTitle: { fontSize: 17, fontWeight: '500', letterSpacing: -0.4, color: site.ink, marginTop: 12, marginBottom: 8 },
  stepText: { fontSize: 12, color: site.muted, lineHeight: 22 },
  faq: { maxWidth: 820, width: '100%', marginHorizontal: 'auto' },
  copy: { fontSize: 14, color: site.muted, lineHeight: 27, maxWidth: 420 },
  proof: { fontSize: 9, color: '#6b6f65', marginTop: 18 },
  split: { flexDirection: 'row', alignItems: 'center' },
  sectorLayout: { flexDirection: 'row' },
  sectorChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  chip: { paddingVertical: 8, paddingHorizontal: 13, borderWidth: 1, borderColor: site.line, borderRadius: 25 },
  sectorBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 17, paddingHorizontal: 10, borderTopWidth: 1, borderColor: site.line },
  sectorContent: { backgroundColor: site.white, borderWidth: 1, borderColor: site.line, borderRadius: 10 },
  vocab: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 20 },
  word: { fontSize: 22, color: site.ink, borderWidth: 1, borderColor: site.line, borderRadius: 5, paddingVertical: 8, paddingHorizontal: 17 },
  wordOn: { backgroundColor: site.ink, color: site.white, borderColor: site.ink },
  tradeIndex: { borderTopWidth: 1, borderTopColor: site.line },
  tradeRow: { flexDirection: 'row', gap: 14, alignItems: 'flex-start', paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: site.line },
  tradeName: { fontSize: 15, color: site.ink, fontWeight: '500' },
  tradeText: { fontSize: 11, color: site.muted, lineHeight: 18 },
  visual: { backgroundColor: '#e7e4d8', borderRadius: 10, minHeight: 330, alignItems: 'center', justifyContent: 'center' },
  paperCard: { backgroundColor: '#ffffff', width: '100%', padding: 24, borderWidth: 1, borderColor: '#deded3', borderRadius: 5 },
  paperTop: { fontSize: 8, color: site.copper, fontWeight: '600', letterSpacing: 1 },
  paperTitle: { fontSize: 23, letterSpacing: -0.7, color: site.ink, marginTop: 26, marginBottom: 4 },
  paperSub: { fontSize: 9, color: '#9da18e', marginBottom: 12 },
  paperLine: { flexDirection: 'row', gap: 10, alignItems: 'center', borderTopWidth: 1, borderTopColor: '#eceee5', paddingVertical: 11 },
  paperCaption: { fontSize: 7, color: '#a0a28f', borderTopWidth: 1, borderTopColor: '#e8ebde', paddingTop: 15, letterSpacing: 0.3 },
  contactCard: { padding: 34, backgroundColor: site.white, borderWidth: 1, borderColor: site.line, borderRadius: 10 },
});
