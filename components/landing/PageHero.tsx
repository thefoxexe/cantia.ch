import type { ReactNode } from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Link } from 'expo-router';
import { breakpoints, colors, spacing } from '../../lib/theme';
import { displayType, marketingFonts, monoType } from '../../lib/marketingTheme';
import { Heading } from '../Heading';
import { SwissCross } from '../SwissCross';
import { CtaButton } from './CtaButton';
import { Cartouche } from './Cartouche';
import { bodyInk, ink } from './brand';

// Shared opening for every secondary marketing page (tarifs, téléchargement,
// métiers, contact…): the same kicker / condensed H1 / lede / CTA / facts
// stack as the homepage hero, without the mountain, with an optional visual
// on the right and an optional title block underneath.
export function PageHero({
  kicker,
  title,
  lede,
  cta,
  secondary,
  facts,
  cartouche,
  aside,
  children,
}: {
  kicker: string;
  title: string;
  lede?: string;
  cta?: { title: string; href: string };
  secondary?: { title: string; href?: string; onPress?: () => void };
  facts?: string[];
  cartouche?: { label: string; value: string }[];
  aside?: ReactNode;
  children?: ReactNode;
}) {
  const { width } = useWindowDimensions();
  const isMobile = width < breakpoints.tablet;
  const isTablet = width < breakpoints.desktop;
  const size = isMobile ? Math.min(56, Math.max(40, width * 0.11)) : Math.min(88, Math.max(52, width * 0.058));
  const secondaryText = secondary ? <Text style={styles.secondary} onPress={secondary.onPress}>{secondary.title}</Text> : null;
  return (
    <View style={styles.wrap}>
      <View style={[styles.row, isTablet && styles.rowCompact]}>
        <View style={[styles.main, !isTablet && aside ? { flex: 1.15 } : null]}>
          <View style={styles.kicker}>
            <SwissCross size={13} />
            <Text style={styles.kickerText}>{kicker}</Text>
          </View>
          <Heading level={1} style={[styles.title, { fontSize: size, lineHeight: Math.round(size * 0.94) }] as any}>
            {title}
          </Heading>
          {lede ? <Text style={styles.lede}>{lede}</Text> : null}
          {cta || secondary ? (
            <View style={styles.ctas}>
              {cta ? (
                <Link href={cta.href as any} asChild>
                  <CtaButton title={cta.title} />
                </Link>
              ) : null}
              {secondary?.href ? <Link href={secondary.href as any}>{secondaryText}</Link> : secondaryText}
            </View>
          ) : null}
          {facts?.length ? <Text style={styles.facts}>{facts.join(isMobile ? '\n' : '   ·   ')}</Text> : null}
          {children}
        </View>
        {aside ? <View style={[styles.aside, !isTablet && { flex: 1 }]}>{aside}</View> : null}
      </View>
      {cartouche?.length ? (
        <View style={[styles.cartouche, isTablet && { alignSelf: 'stretch', maxWidth: undefined }]}>
          <Cartouche cells={cartouche} compact={isMobile} />
        </View>
      ) : null}
    </View>
  );
}

// Shared page gutter for sections under a PageHero.
export const pageWrap = { width: '100%', maxWidth: 1240, alignSelf: 'center', paddingHorizontal: spacing.xl } as const;

const styles = StyleSheet.create({
  wrap: { ...pageWrap, paddingTop: spacing.xxxl, paddingBottom: spacing.xl },
  row: { flexDirection: 'row', gap: 64, alignItems: 'center' },
  rowCompact: { flexDirection: 'column', alignItems: 'stretch', gap: spacing.xxl },
  main: { flex: 1, maxWidth: 760 },
  aside: { alignItems: 'center' },
  kicker: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: spacing.xl },
  kickerText: { ...monoType, fontSize: 11.5, letterSpacing: 0.3, color: '#674932', textTransform: 'uppercase' },
  title: { ...displayType, fontWeight: '800', letterSpacing: -0.4, color: ink, marginTop: 0, marginBottom: 0 },
  lede: { fontFamily: marketingFonts.body, fontSize: 19, lineHeight: 29, color: bodyInk, marginTop: spacing.xl, maxWidth: 580 },
  ctas: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.xl, marginTop: spacing.xl },
  secondary: { fontFamily: marketingFonts.body, fontSize: 15, fontWeight: '600', color: ink, borderBottomWidth: 1.5, borderBottomColor: ink, paddingBottom: 2 },
  facts: { ...monoType, fontSize: 11, letterSpacing: 0.2, lineHeight: 18, color: '#5D4F42', textTransform: 'uppercase', marginTop: spacing.lg },
  cartouche: { alignSelf: 'flex-end', width: '100%', maxWidth: 820, marginTop: spacing.xxl },
});

export const pageColors = { ink, bodyInk, primary: colors.primary };
