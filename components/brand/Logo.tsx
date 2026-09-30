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

// The product name that extends the wordmark: a dash like the ones between
// the letters, then the name in wide capitals ("C-A-N-T-I-A — ACCOUNTING").
// textHeight is the height of the wordmark it follows.
function ProductSuffix({ product, textHeight, tone, dash = true }: { product: string; textHeight: number; tone: BrandTone; dash?: boolean }) {
  const ink = tone === 'white' ? '#FFFFFF' : BRAND_INK;
  const accent = tone === 'color' ? BRAND_TERRACOTTA : ink;
  const fontSize = Math.max(10, Math.round(textHeight * 0.8));
  return (
    <>
      {dash ? (
        <View style={{ width: textHeight * 0.55, height: Math.max(2, Math.round(textHeight * 0.1)), backgroundColor: ink, marginHorizontal: textHeight * 0.32 }} />
      ) : null}
      <Text style={[styles.product, { fontSize, lineHeight: Math.round(textHeight), color: accent, letterSpacing: fontSize * 0.16, fontFamily: BRAND_DISPLAY_FONT }]} numberOfLines={1}>
        {product.toUpperCase()}
      </Text>
    </>
  );
}

// The wordmark alone (text only), optionally extended with a product name.
export function Wordmark({
  height = 18,
  tone = 'color',
  product,
  stacked = false,
  style,
}: {
  height?: number;
  tone?: BrandTone;
  product?: string;
  // Product name under the wordmark instead of after it: for narrow
  // columns (phones), where the one-line lockup would overflow.
  stacked?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const image = <Image source={WORDMARK[tone]} style={{ height, width: height * WORDMARK_RATIO }} resizeMode="contain" accessibilityLabel="Cantia" />;
  if (!product) return <View style={style}>{image}</View>;
  if (stacked) {
    return (
      <View style={[{ alignItems: 'flex-start', gap: Math.round(height * 0.45) }, style]} accessibilityLabel={`Cantia ${product}`}>
        {image}
        <View style={styles.row}>
          <ProductSuffix product={product} textHeight={height} tone={tone} dash={false} />
        </View>
      </View>
    );
  }
  return (
    <View style={[styles.row, style]} accessibilityLabel={`Cantia ${product}`}>
      {image}
      <ProductSuffix product={product} textHeight={height} tone={tone} />
    </View>
  );
}

// What navbars and footers use. Wide screens get the full logo (mark +
// wordmark); compact ones (phones) only the mark, so the bar never
// overflows. With a product, the name follows in both cases.
export function BrandLockup({
  height = 30,
  tone = 'color',
  product,
  compact = false,
  style,
}: {
  height?: number;
  tone?: BrandTone;
  product?: string;
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const label = product ? `Cantia ${product}` : 'Cantia';
  if (compact) {
    return (
      <View style={[styles.row, style]} accessibilityLabel={label}>
        <BrandMark size={height} tone={tone} />
        {product ? (
          <View style={{ marginLeft: height * 0.34 }}>
            <ProductSuffix product={product} textHeight={height * 0.5} tone={tone === 'color' ? 'black' : tone} dash={false} />
          </View>
        ) : null}
      </View>
    );
  }
  // In the delivered logo the wordmark is ~45 % of the full height.
  return (
    <View style={[styles.row, style]} accessibilityLabel={label}>
      <BrandLogo height={height} tone={tone} />
      {product ? <ProductSuffix product={product} textHeight={height * 0.45} tone={tone} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  product: { fontWeight: '400', includeFontPadding: false } as any,
});
