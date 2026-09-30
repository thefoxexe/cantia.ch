import { Image, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { Platform } from 'react-native';

// Cantia brand identity (September 2026): the "A" mark in a terracotta
// square and the C-A-N-T-I-A wordmark (letters joined by dashes, terracotta
// swoosh under each A). One component for every place the brand appears.
//
// tone: which version for which background
// - 'color' on white / cream: black letters + terracotta (the default)
// - 'black' on terracotta
// - 'white' on dark or photo backgrounds

export type BrandTone = 'color' | 'black' | 'white';

export const BRAND_TERRACOTTA = '#A95C30';
export const BRAND_INK = '#000000';

const MARK = {
  color: require('../../assets/brand/mark.png'),
  black: require('../../assets/brand/mark-black.png'),
  white: require('../../assets/brand/mark-white.png'),
};
const WORDMARK = {
  color: require('../../assets/brand/wordmark.png'),
  black: require('../../assets/brand/wordmark-black.png'),
  white: require('../../assets/brand/wordmark-white.png'),
};
const LOGO = {
  color: require('../../assets/brand/logo.png'),
  black: require('../../assets/brand/logo-black.png'),
  white: require('../../assets/brand/logo-white.png'),
};

// Aspect ratios of the delivered artwork (width / height).
const WORDMARK_RATIO = 890 / 96;
const LOGO_RATIO = 1036 / 192;

// Wide geometric face closest to the wordmark, for product names that
// extend it (ACCOUNTING, PARTNERS). Loaded on web by each site's +html.tsx.
export const BRAND_DISPLAY_FONT = Platform.OS === 'web' ? 'Michroma, "Archivo", system-ui, sans-serif' : undefined;

export function BrandMark({ size = 32, tone = 'color', style }: { size?: number; tone?: BrandTone; style?: StyleProp<any> }) {
  return <Image source={MARK[tone]} style={[{ width: size, height: size }, style]} resizeMode="contain" accessibilityLabel="Cantia" />;
}

// The full logo: mark + wordmark.
export function BrandLogo({ height = 32, tone = 'color', style }: { height?: number; tone?: BrandTone; style?: StyleProp<any> }) {
  return <Image source={LOGO[tone]} style={[{ height, width: height * LOGO_RATIO }, style]} resizeMode="contain" accessibilityLabel="Cantia" />;
}

// The wordmark, optionally extended with a product name set in the same
// spirit: a dash like the ones between the letters, then the name in wide
// capitals ("C-A-N-T-I-A — ACCOUNTING").
export function Wordmark({
  height = 18,
  tone = 'color',
  product,
  style,
}: {
  height?: number;
  tone?: BrandTone;
  product?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const image = <Image source={WORDMARK[tone]} style={{ height, width: height * WORDMARK_RATIO }} resizeMode="contain" accessibilityLabel="Cantia" />;
  if (!product) return <View style={style}>{image}</View>;
  const ink = tone === 'white' ? '#FFFFFF' : BRAND_INK;
  const accent = tone === 'color' ? BRAND_TERRACOTTA : ink;
  // Letters of the wordmark are ~height tall; the product name sits a bit
  // lower (0.72 x) so the brand keeps the lead.
  const fontSize = Math.round(height * 0.62);
  return (
    <View style={[styles.row, style]} accessibilityLabel={`Cantia ${product}`}>
      {image}
      <View style={[styles.dash, { width: height * 0.55, height: Math.max(2, height * 0.1), backgroundColor: ink, marginHorizontal: height * 0.3 }]} />
      <Text style={[styles.product, { fontSize, lineHeight: height, color: accent, letterSpacing: fontSize * 0.14, fontFamily: BRAND_DISPLAY_FONT }]} numberOfLines={1}>
        {product.toUpperCase()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  dash: {},
  product: { fontWeight: '400', includeFontPadding: false } as any,
});
