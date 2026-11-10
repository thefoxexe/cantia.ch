import { type ReactNode } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { StatusLink } from '../StatusLink';
import { SwissCross } from '../SwissCross';
import { monoType } from '../../lib/marketingTheme';
import { colors, fontSize, spacing } from '../../lib/theme';
import { BrandLockup, BRAND_TERRACOTTA } from './Logo';
import { sans, site } from '../../lib/siteTheme';

const SITE_LOGO = require('../../assets/brand/logo.png');
import { SocialLinks } from './SocialLinks';

// Shared frame of the Cantia product sites (accounting.cantia.ch,
// partners.cantia.ch): the navbar with the product lockup
// ("C-A-N-T-I-A — ACCOUNTING") and the language switch, and the footer
// (which links the three products) signed with the
// black logo and a full-width wordmark. Solid, never sticky: a sticky
// blurred header inside a scroll view broke scrolling in Safari.

export type ProductKey = 'accounting' | 'partners';
type Loc = 'fr' | 'de' | 'it';
type FooterLink = { label: string; href: string };

export const PRODUCT_PAGE_MAX = 1120;
const INK = '#16120E';

const PRODUCT_NAME: Record<ProductKey, string> = { accounting: 'Accounting', partners: 'Partners' };

const T = {
  fr: { product: 'Produit', ecosystem: 'Écosystème', legal: 'Légal', swiss: 'Conçu et hébergé en Suisse', app: 'Cantia pour les entreprises' },
  de: { product: 'Produkt', ecosystem: 'Ökosystem', legal: 'Rechtliches', swiss: 'In der Schweiz entwickelt und gehostet', app: 'Cantia für Unternehmen' },
  it: { product: 'Prodotto', ecosystem: 'Ecosistema', legal: 'Note legali', swiss: 'Sviluppato e ospitato in Svizzera', app: 'Cantia per le imprese' },
} as const;

function prefixFor(locale: Loc) {
  return locale === 'fr' ? '' : `/${locale}`;
}

// ---------------------------------------------------------------- strip

export function LocaleTabs<L extends string>({ locales, value, onChange, inverse = false }: { locales: readonly L[]; value: L; onChange: (l: L) => void; inverse?: boolean }) {
  return (
    <View style={styles.locales}>
      {locales.map((l) => {
        const on = l === value;
        return (
          <Pressable key={l} onPress={() => onChange(l)} accessibilityRole="button" aria-pressed={on} style={styles.locale}>
            <Text style={[styles.localeText, inverse && styles.localeTextInverse, on && (inverse ? styles.localeTextOnInverse : styles.localeTextOn)]}>{l.toUpperCase()}</Text>
            {on ? <View style={[styles.localeBar, inverse && { backgroundColor: BRAND_TERRACOTTA }]} /> : null}
          </Pressable>
        );
      })}
    </View>
  );
}

// ---------------------------------------------------------------- nav

export function ProductNav({
  product,
  locale,
  wide,
  localeSwitch,
  login,
  primary,
  right,
}: {
  product: ProductKey;
  locale: Loc;
  wide: boolean;
  localeSwitch: ReactNode;
  login?: FooterLink;
  primary?: FooterLink;
  right?: ReactNode;
}) {
  // November 2026 identity: the cantia.ch header, with the product's name
  // beside the logo. The language sits in the nav.
  return (
    <View style={styles.navWrap}>
      <View style={[styles.nav, { minHeight: wide ? 86 : 75, paddingHorizontal: wide ? 54 : 22 }]}>
        <Link href={(locale === 'fr' ? '/' : `/${locale}`) as any} asChild>
          <Pressable accessibilityLabel={`Cantia ${PRODUCT_NAME[product]}`} style={styles.brand}>
            <Image source={SITE_LOGO} style={{ width: wide ? 148 : 118, height: (wide ? 148 : 118) * (192 / 1036) }} resizeMode="contain" />
            <Text style={[sans, styles.productTag, !wide && { fontSize: 8, paddingLeft: 8 }]}>{PRODUCT_NAME[product].toUpperCase()}</Text>
          </Pressable>
        </Link>
        <View style={[styles.navRight, { gap: wide ? 22 : 12 }]}>
          {localeSwitch}
          {login ? (
            <Link href={login.href as any} style={[sans, styles.navLink]}>
              {login.label}
            </Link>
          ) : null}
          {primary && wide ? (
            <Link href={primary.href as any} style={styles.cta}>
              <Text style={[sans, styles.ctaText]}>{primary.label}</Text>
              <Feather name="arrow-right" size={14} color="#FFFFFF" />
            </Link>
          ) : null}
          {right}
        </View>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------- footer

export type FooterItem = { label: string; href?: string; onPress?: () => void };
export type FooterColumn = { title: string; links: FooterItem[]; extra?: ReactNode };

// The footer of every Cantia site (cantia.ch, accounting, partners): brand
// block (logo, tagline, contact, Swiss chip, social links), link columns,
// the full-width wordmark, then copyright and legal links.
export function BrandFooter({
  lockup,
  tagline,
  contact,
  locale,
  wide,
  columns,
  bottomLinks,
}: {
  lockup: ReactNode;
  tagline: string;
  contact?: ReactNode;
  locale: Loc;
  wide: boolean;
  columns: FooterColumn[];
  bottomLinks?: ReactNode;
}) {
  const t = T[locale];
  const item = (l: FooterItem) =>
    l.onPress ? (
      <Pressable key={l.label} onPress={l.onPress} accessibilityRole="link">
        <Text style={styles.colLink}>{l.label}</Text>
      </Pressable>
    ) : (
      <Link key={l.href ?? l.label} href={(l.href ?? '/') as any} style={styles.colLink}>
        {l.label}
      </Link>
    );
  return (
    <View style={styles.footerWrap}>
      <View style={styles.footer}>
        <View style={[styles.footerTop, !wide && styles.footerTopStacked]}>
          <View style={styles.footerBrand}>
            {lockup}
            <Text style={styles.tagline}>{tagline}</Text>
            {contact}
            <View style={styles.swiss}>
              <SwissCross size={13} />
              <Text style={styles.swissText}>{t.swiss}</Text>
            </View>
            <SocialLinks />
          </View>
          <View style={[styles.cols, !wide && styles.colsNarrow]}>
            {columns.map((c) => (
              <View key={c.title} style={[styles.col, !wide && styles.colNarrow]}>
                <Text style={styles.colTitle}>{c.title}</Text>
                {c.links.map(item)}
                {c.extra}
              </View>
            ))}
          </View>
        </View>

        <Image source={require('../../assets/brand/wordmark.png')} style={styles.giant} resizeMode="contain" accessibilityLabel="Cantia" />

        <View style={styles.bottom}>
          <Text style={styles.small}>© {new Date().getFullYear()} Cantia · Suisse</Text>
          {bottomLinks ?? <Text style={styles.small}>cantia.ch</Text>}
        </View>
      </View>
    </View>
  );
}

export function ProductFooter({
  product,
  locale,
  wide,
  tagline,
  productLinks,
  privacy,
  terms,
  status,
}: {
  product: ProductKey;
  locale: Loc;
  wide: boolean;
  tagline: string;
  productLinks: FooterLink[];
  privacy: string;
  terms: string;
  status: string;
}) {
  const t = T[locale];
  const prefix = prefixFor(locale);
  const ecosystem: FooterLink[] = [
    { label: t.app, href: `https://cantia.ch${prefix || '/'}` },
    ...(product !== 'accounting' ? [{ label: 'Cantia Accounting', href: `https://accounting.cantia.ch${prefix}` }] : []),
    ...(product !== 'partners' ? [{ label: 'Cantia Partners', href: `https://partners.cantia.ch${prefix}` }] : []),
  ];
  const legal: FooterLink[] = [
    { label: privacy, href: `https://cantia.ch${prefix}/confidentialite` },
    { label: terms, href: `https://cantia.ch${prefix}/conditions-generales` },
  ];
  const columns = [
    { title: t.product, links: productLinks },
    { title: t.ecosystem, links: ecosystem },
    { title: t.legal, links: legal },
  ];
  return (
    <View style={styles.footerWrap}>
      <View style={[styles.footer, { paddingHorizontal: wide ? 54 : 22 }]}>
        <View style={[styles.footerTop, !wide && { flexDirection: 'column', gap: 30 }]}>
          <View style={[styles.footerBrand, wide && { flex: 1.4 }]}>
            <View style={styles.brand}>
              <Image source={SITE_LOGO} style={{ width: 138, height: 138 * (192 / 1036) }} resizeMode="contain" />
              <Text style={[sans, styles.productTag]}>{PRODUCT_NAME[product].toUpperCase()}</Text>
            </View>
            <Text style={[sans, styles.tagline]}>{tagline}</Text>
            <Text style={[sans, styles.tagline]}>
              {t.swiss}
              {'\n'}Français · Deutsch · Italiano
            </Text>
          </View>
          {columns.map((col) => (
            <View key={col.title} style={wide ? { flex: 1 } : undefined}>
              <Text style={[sans, styles.colTitle]}>{col.title.toUpperCase()}</Text>
              {col.links.map((l) => (
                <Link key={l.label} href={l.href as any} style={[sans, styles.colLink]}>
                  {l.label}
                </Link>
              ))}
            </View>
          ))}
        </View>
        <View style={[styles.footerBottom, !wide && { flexDirection: 'column', alignItems: 'flex-start', gap: 12 }]}>
          <Text style={[sans, styles.small]}>© {new Date().getFullYear()} Cantia</Text>
          <StatusLink label={status} textStyle={[sans, styles.small] as any} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  productTag: { fontSize: 9, letterSpacing: 1.4, color: site.copper, fontWeight: '600', borderLeftWidth: 1, borderLeftColor: site.line, paddingLeft: 10 },
  colTitle: { fontSize: 10, letterSpacing: 0.8, fontWeight: '600', color: '#818775', marginBottom: 12 },
  footerBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: site.line, paddingTop: 20, marginTop: 38 },
  small: { fontSize: 9, color: '#929687' },

  locales: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  locale: { paddingVertical: 8, paddingHorizontal: 7, alignItems: 'center' },
  localeText: { ...sans, fontSize: 10, letterSpacing: 0.8, fontWeight: '600', color: site.muted },
  localeTextInverse: { color: '#A59684' },
  localeTextOn: { color: site.ink },
  localeTextOnInverse: { color: '#FFFFFF' },
  localeBar: { position: 'absolute', bottom: 3, left: 7, right: 7, height: 1.5, borderRadius: 1, backgroundColor: site.copper },

  navWrap: { borderBottomWidth: 1, borderBottomColor: site.line, backgroundColor: site.bg },
  nav: { width: '100%', maxWidth: site.maxWidth, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16 },
  navRight: { flexDirection: 'row', alignItems: 'center', flexShrink: 0 },
  navLink: { fontSize: 11, fontWeight: '500', color: site.ink },
  cta: { flexDirection: 'row', alignItems: 'center', gap: 22, backgroundColor: site.copper, paddingVertical: 13, paddingHorizontal: 20, borderRadius: 5 },
  ctaText: { fontSize: 12, fontWeight: '600', color: '#FFFFFF' },

  footerWrap: { backgroundColor: site.bg, borderTopWidth: 1, borderTopColor: site.line },
  footer: { width: '100%', maxWidth: site.maxWidth, alignSelf: 'center', paddingTop: 47, paddingBottom: 22 },
  footerTop: { flexDirection: 'row', gap: 40 },
  footerTopStacked: { flexDirection: 'column', gap: spacing.xl },
  footerBrand: { maxWidth: 360 },
  tagline: { fontSize: 11, lineHeight: 21, color: '#929688', marginTop: 20, maxWidth: 240 },
  swiss: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start', borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bg, borderRadius: 999, paddingVertical: 6, paddingHorizontal: 12 },
  swissText: { fontSize: 12, fontWeight: '600', color: colors.text },
  cols: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 56, rowGap: spacing.xl },
  col: { gap: 12, minWidth: 130 },
  colsNarrow: { columnGap: spacing.xl },
  colNarrow: { minWidth: 0, flexBasis: '44%', flexGrow: 1 },
  colLink: { fontSize: 11, color: '#6b7360', paddingVertical: 5 },

  giant: { width: '100%', height: undefined, aspectRatio: 890 / 96, marginTop: 64, opacity: 0.95 },

  bottom: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border, marginTop: spacing.xl, paddingVertical: spacing.lg },
});
