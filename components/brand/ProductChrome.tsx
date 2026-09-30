import { type ReactNode } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { StatusLink } from '../StatusLink';
import { SwissCross } from '../SwissCross';
import { monoType } from '../../lib/marketingTheme';
import { colors, fontSize, spacing } from '../../lib/theme';
import { BrandLockup, BRAND_TERRACOTTA } from './Logo';

// Shared frame of the Cantia product sites (accounting.cantia.ch,
// partners.cantia.ch): a black ecosystem strip that links the three
// products and holds the language switch, the navbar with the product
// lockup ("C-A-N-T-I-A — ACCOUNTING"), and the footer signed with the
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

function EcoBar({ product, locale, localeSwitch }: { product: ProductKey; locale: Loc; localeSwitch: ReactNode }) {
  const prefix = prefixFor(locale);
  const items: { key: 'cantia' | ProductKey; label: string; href: string }[] = [
    { key: 'cantia', label: 'Cantia', href: `https://cantia.ch${prefix || '/'}` },
    { key: 'accounting', label: 'Accounting', href: product === 'accounting' ? '/' : `https://accounting.cantia.ch${prefix}` },
    { key: 'partners', label: 'Partners', href: product === 'partners' ? '/' : `https://partners.cantia.ch${prefix}` },
  ];
  return (
    <View style={styles.eco}>
      <View style={styles.ecoInner}>
        <View style={styles.ecoLinks}>
          {items.map((it) => {
            const on = it.key === product;
            return (
              <Link key={it.key} href={it.href as any} style={styles.ecoLink}>
                <View style={styles.ecoItem}>
                  {on ? <View style={styles.ecoDot} /> : null}
                  <Text style={[styles.ecoText, on && styles.ecoTextOn]}>{it.label}</Text>
                </View>
              </Link>
            );
          })}
        </View>
        {localeSwitch}
      </View>
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
  return (
    <View>
      <EcoBar product={product} locale={locale} localeSwitch={localeSwitch} />
      <View style={styles.navWrap}>
        <View style={styles.nav}>
          <Link href="/" asChild>
            <Pressable accessibilityLabel={`Cantia ${PRODUCT_NAME[product]}`}>
              <BrandLockup height={wide ? 30 : 32} compact={!wide} product={PRODUCT_NAME[product]} />
            </Pressable>
          </Link>
          <View style={styles.navRight}>
            {login ? (
              <Link href={login.href as any} style={styles.navLink}>
                {login.label}
              </Link>
            ) : null}
            {primary && wide ? (
              <Link href={primary.href as any} style={styles.cta}>
                <Text style={styles.ctaText}>{primary.label}</Text>
                <Feather name="arrow-right" size={15} color="#FFFFFF" />
              </Link>
            ) : null}
            {right}
          </View>
        </View>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------- footer

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

  const column = (title: string, links: FooterLink[], extra?: ReactNode) => (
    <View style={styles.col}>
      <Text style={styles.colTitle}>{title}</Text>
      {links.map((l) => (
        <Link key={l.href} href={l.href as any} style={styles.colLink}>
          {l.label}
        </Link>
      ))}
      {extra}
    </View>
  );

  return (
    <View style={styles.footerWrap}>
      <View style={styles.footer}>
        <View style={[styles.footerTop, !wide && styles.footerTopStacked]}>
          <View style={styles.footerBrand}>
            <BrandLockup height={wide ? 34 : 30} tone="black" product={PRODUCT_NAME[product]} />
            <Text style={styles.tagline}>{tagline}</Text>
            <View style={styles.swiss}>
              <SwissCross size={13} />
              <Text style={styles.swissText}>{t.swiss}</Text>
            </View>
          </View>
          <View style={styles.cols}>
            {column(t.product, productLinks)}
            {column(t.ecosystem, ecosystem)}
            {column(t.legal, legal, <StatusLink label={status} textStyle={styles.colLink} />)}
          </View>
        </View>

        <Image
          source={require('../../assets/brand/wordmark.png')}
          style={styles.giant}
          resizeMode="contain"
          accessibilityLabel="Cantia"
        />

        <View style={styles.bottom}>
          <Text style={styles.small}>© {new Date().getFullYear()} Cantia · Suisse</Text>
          <Text style={styles.small}>cantia.ch</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  eco: { backgroundColor: INK, paddingHorizontal: spacing.lg },
  ecoInner: { width: '100%', maxWidth: PRODUCT_PAGE_MAX - spacing.lg * 2, alignSelf: 'center', minHeight: 38, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  ecoLinks: { flexDirection: 'row', alignItems: 'center', gap: 18, flexShrink: 1 },
  ecoLink: { paddingVertical: 10 },
  ecoItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  ecoDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: BRAND_TERRACOTTA },
  ecoText: { ...monoType, fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase', color: '#A59684' },
  ecoTextOn: { color: '#FFFFFF', fontWeight: '700' },

  locales: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  locale: { paddingVertical: 8, paddingHorizontal: 7, alignItems: 'center' },
  localeText: { ...monoType, fontSize: 11, letterSpacing: 1, fontWeight: '600', color: colors.textMuted },
  localeTextInverse: { color: '#A59684' },
  localeTextOn: { color: colors.text },
  localeTextOnInverse: { color: '#FFFFFF' },
  localeBar: { position: 'absolute', bottom: 3, left: 7, right: 7, height: 2, borderRadius: 1, backgroundColor: colors.text },

  navWrap: { borderBottomWidth: 1, borderBottomColor: colors.border, paddingHorizontal: spacing.lg, backgroundColor: colors.bg },
  nav: { width: '100%', maxWidth: PRODUCT_PAGE_MAX - spacing.lg * 2, alignSelf: 'center', minHeight: 72, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  navRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, flexShrink: 0 },
  navLink: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text },
  cta: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: BRAND_TERRACOTTA, paddingVertical: 11, paddingHorizontal: 18, borderRadius: 999 },
  ctaText: { fontSize: fontSize.sm, fontWeight: '700', color: '#FFFFFF' },

  footerWrap: { marginTop: 96, backgroundColor: colors.surfaceAlt, borderTopWidth: 1, borderTopColor: colors.border, paddingHorizontal: spacing.lg, overflow: 'hidden' },
  footer: { width: '100%', maxWidth: PRODUCT_PAGE_MAX - spacing.lg * 2, alignSelf: 'center', paddingTop: 64 },
  footerTop: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.xxl },
  footerTopStacked: { flexDirection: 'column', gap: spacing.xl },
  footerBrand: { gap: spacing.md, maxWidth: 380, flexShrink: 1 },
  tagline: { fontSize: fontSize.sm, lineHeight: 21, color: colors.textMuted },
  swiss: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start', borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bg, borderRadius: 999, paddingVertical: 6, paddingHorizontal: 12 },
  swissText: { fontSize: 12, fontWeight: '600', color: colors.text },
  cols: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 56, rowGap: spacing.xl },
  col: { gap: 12, minWidth: 130 },
  colTitle: { ...monoType, fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase', color: colors.textMuted, marginBottom: 2 },
  colLink: { fontSize: fontSize.sm, color: colors.text, fontWeight: '500' },

  giant: { width: '100%', height: undefined, aspectRatio: 890 / 96, marginTop: 64, opacity: 0.95 },

  bottom: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border, marginTop: spacing.xl, paddingVertical: spacing.lg },
  small: { ...monoType, fontSize: 11, letterSpacing: 0.8, color: colors.textMuted },
});
