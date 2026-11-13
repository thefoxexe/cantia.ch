import type { ReactNode } from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Btn, Eyebrow, Headline, TextLink } from '../site/Primitives';
import { sans, site } from '../../lib/siteTheme';

// Page heading of the older marketing pages (aide, logiciel-chantier…), in
// the November 2026 identity: eyebrow, title, lead, buttons, facts, and an
// optional visual on the right. `cartouche` is no longer drawn (it belonged
// to the September 2026 "plan" identity) but stays accepted.
export function PageHero({
  kicker,
  title,
  lede,
  cta,
  secondary,
  facts,
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
  const phone = width <= 760;
  const stacked = width < 1000;
  const size = phone ? 40 : width <= 1100 ? 48 : 56;
  return (
    <View style={[styles.wrap, { paddingHorizontal: width > 760 ? 54 : 22, paddingTop: phone ? 36 : 64 }]}>
      <View style={[styles.row, stacked && styles.rowCompact]}>
        <View style={[styles.main, !stacked && aside ? { flex: 1.15 } : null]}>
          <Eyebrow>{kicker}</Eyebrow>
          <Headline level={1} plain={title} size={size} style={{ marginTop: 18, letterSpacing: phone ? -1.6 : -2.4, lineHeight: size * 1.06 }} />
          {lede ? <Text style={[sans, styles.lede, phone && { fontSize: 13, lineHeight: 24 }]}>{lede}</Text> : null}
          {cta || secondary ? (
            <View style={styles.ctas}>
              {cta ? (
                <View>
                  <Btn label={cta.title} href={cta.href} small={phone} />
                </View>
              ) : null}
              {secondary ? (
                secondary.href ? (
                  <View>
                    <TextLink label={secondary.title} href={secondary.href} size={phone ? 11 : 12} />
                  </View>
                ) : (
                  <Text style={[sans, styles.secondary]} onPress={secondary.onPress}>
                    {secondary.title}
                  </Text>
                )
              ) : null}
            </View>
          ) : null}
          {facts?.length ? <Text style={[sans, styles.facts]}>{facts.join(phone ? '\n' : '   ·   ')}</Text> : null}
          {children}
        </View>
        {aside ? <View style={[styles.aside, !stacked && { flex: 1 }]}>{aside}</View> : null}
      </View>
    </View>
  );
}

// Side gutter follows the header (22 px on phones, 54 px on desktop).
export const pageWrap = { width: '100%', maxWidth: 1320, alignSelf: 'center', paddingHorizontal: 'clamp(22px, 4.2vw, 54px)' as any } as const;

const styles = StyleSheet.create({
  wrap: { width: '100%', maxWidth: 1320, alignSelf: 'center', paddingBottom: 40 },
  row: { flexDirection: 'row', gap: 64, alignItems: 'center' },
  rowCompact: { flexDirection: 'column', alignItems: 'stretch', gap: 36 },
  main: { flex: 1, maxWidth: 780 },
  aside: { alignItems: 'center' },
  lede: { fontSize: 15, lineHeight: 28, color: site.muted, marginTop: 20, maxWidth: 600 },
  ctas: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 25, marginTop: 28 },
  secondary: { fontSize: 12, fontWeight: '600', color: site.ink },
  facts: { fontSize: 10, lineHeight: 18, color: '#6b6f65', marginTop: 18 },
});

export const pageColors = { ink: site.ink, bodyInk: site.muted, primary: site.copper };
