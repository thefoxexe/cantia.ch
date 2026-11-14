import { forwardRef, useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View, useWindowDimensions, type PressableProps, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import { Link } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { gutter, sans, serif, site } from '../../lib/siteTheme';
import { releaseHydrationViewport } from '../../lib/hydrationViewport';

// Building blocks of the public sites (cantia.ch, accounting, partners):
// the 1320 px column, the small copper surtitle, headlines with their
// italic serif half, and the two kinds of call to action.

// A Pressable that tracks hover itself. Expo Router's <Link asChild> merges
// the child's style into an array, which drops Pressable's style functions
// ({ hovered }) => ..., so hover styles go through `base` / `hover` instead.
type HoverProps = Omit<PressableProps, 'style' | 'children'> & {
  base?: StyleProp<ViewStyle>;
  hover?: StyleProp<ViewStyle>;
  children?: React.ReactNode | ((hovered: boolean) => React.ReactNode);
};
export const Hover = forwardRef<View, HoverProps>(function Hover({ base, hover, children, onHoverIn, onHoverOut, ...rest }, ref) {
  const [hovered, setHovered] = useState(false);
  return (
    <Pressable
      ref={ref}
      {...rest}
      onHoverIn={(e) => {
        setHovered(true);
        onHoverIn?.(e);
      }}
      onHoverOut={(e) => {
        setHovered(false);
        onHoverOut?.(e);
      }}
      style={[base, hovered && hover]}
    >
      {typeof children === 'function' ? children(hovered) : children}
    </Pressable>
  );
});

export function Wrap({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  const { width } = useWindowDimensions();
  return <View style={[{ width: '100%', maxWidth: site.maxWidth, marginHorizontal: 'auto', paddingHorizontal: gutter(width) }, style]}>{children}</View>;
}

export function Eyebrow({ children, color = site.copper, style }: { children: string; color?: string; style?: StyleProp<TextStyle> }) {
  const { width } = useWindowDimensions();
  const phone = width <= 760;
  return (
    <Text style={[sans, styles.eyebrow, { color, fontSize: phone ? 8 : 10, letterSpacing: phone ? 1.2 : 1.65 }, style]}>{children.toUpperCase()}</Text>
  );
}

// A headline in two parts: the plain sans line and the copper serif accent
// on its own line ("La suite logique / de vos projets.").
// French typography: no line may start with « ? ! : ; ».
const nbsp = (s: string) => s.replace(/ ([?!:;»])/g, '\u00a0$1').replace(/« /g, '«\u00a0');

export function Headline({
  plain: rawPlain,
  accent: rawAccent,
  level = 2,
  size,
  accentColor = site.copper,
  color = site.ink,
  style,
  inline = false,
}: {
  plain: string;
  accent?: string;
  level?: 1 | 2 | 3;
  size: number;
  accentColor?: string;
  color?: string;
  style?: StyleProp<TextStyle>;
  inline?: boolean;
}) {
  const plain = nbsp(rawPlain);
  const accent = rawAccent === undefined ? undefined : nbsp(rawAccent);
  const tracking = level === 1 ? -size * 0.055 : -size * 0.045;
  return (
    <Text role="heading" aria-level={level} style={[sans, { color, fontSize: size, lineHeight: size * (level === 1 ? 1.02 : 1.13), letterSpacing: tracking, fontWeight: level === 1 ? '500' : '400' }, style]}>
      {plain}
      {accent ? (
        <>
          {inline ? ' ' : '\n'}
          <Text style={[serif, { color: accentColor, letterSpacing: level === 1 ? -size * 0.027 : -size * 0.02, lineHeight: size * 1.12 }]}>{accent}</Text>
        </>
      ) : null}
    </Text>
  );
}

type BtnTone = 'copper' | 'ink' | 'sand' | 'light';
const TONES: Record<BtnTone, { bg: string; fg: string; hover: string; border?: string; hoverFg?: string }> = {
  copper: { bg: site.copper, fg: '#ffffff', hover: site.rust },
  ink: { bg: site.ink, fg: '#ffffff', hover: '#3a3f35' },
  sand: { bg: '#e3d1ba', fg: '#4c4b3c', hover: '#d9c3a8' },
  light: { bg: '#ffffff', fg: site.ink, hover: '#ffffff', border: site.line, hoverFg: site.copper },
};

// `external`: a file or another site (PDF download…), opened in a new tab
// instead of being routed inside the app.
export function Btn({ label, href, tone = 'copper', large = false, small = false, block = false, external = false, onPress }: { label: string; href: string; tone?: BtnTone; large?: boolean; small?: boolean; block?: boolean; external?: boolean; onPress?: () => void }) {
  const t = TONES[tone];
  const button = (
    <Hover
      accessibilityRole="link"
      onPress={onPress ?? (external ? () => { if (Platform.OS === 'web' && typeof window !== 'undefined') window.open(href, '_blank', 'noopener'); } : undefined)}
      base={[styles.btn, large && styles.btnLarge, small && styles.btnSmall, block && { alignSelf: 'stretch' }, { backgroundColor: t.bg, borderColor: t.border ?? t.bg }]}
      hover={{ backgroundColor: t.hover, borderColor: t.hoverFg ?? t.hover }}
    >
      {(hovered) => (
        <>
          <Text style={[sans, styles.btnText, large && styles.btnTextLarge, small && { fontSize: 11 }, { color: hovered && t.hoverFg ? t.hoverFg : t.fg }]}>{label}</Text>
          <Feather name={external ? 'download' : 'arrow-right'} size={large ? 16 : 14} color={hovered && t.hoverFg ? t.hoverFg : t.fg} />
        </>
      )}
    </Hover>
  );
  // onPress: an action on the page itself (e.g. scroll to a form), no link.
  if (external || onPress) return button;
  return (
    <Link href={href as any} asChild>
      {button}
    </Link>
  );
}

export function TextLink({ label, href, color = site.ink, size = 12 }: { label: string; href: string; color?: string; size?: number }) {
  return (
    <Link href={href as any} asChild>
      <Hover accessibilityRole="link" base={styles.textLink} hover={{ opacity: 0.75 }}>
        <Text style={[sans, { color, fontSize: size, fontWeight: '600' }]}>{label}</Text>
        <Feather name="arrow-right" size={size + 2} color={color} />
      </Hover>
    </Link>
  );
}

export function Micro({ children, color = site.muted, style }: { children: string; color?: string; style?: StyleProp<TextStyle> }) {
  return <Text style={[sans, { fontSize: 10, color, marginTop: 12, lineHeight: 15 }, style]}>{children}</Text>;
}

const styles = StyleSheet.create({
  eyebrow: { fontWeight: '600' },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    paddingVertical: 14,
    paddingHorizontal: 21,
    borderRadius: 5,
    borderWidth: 1,
    alignSelf: 'flex-start',
    flexShrink: 0,
  },
  btnSmall: { paddingVertical: 11, paddingHorizontal: 14, gap: 12 },
  btnLarge: { paddingVertical: 17, paddingHorizontal: 26, gap: 28 },
  btnText: { fontSize: 12, fontWeight: '600' },
  btnTextLarge: { fontSize: 14 },
  textLink: { flexDirection: 'row', alignItems: 'center', gap: 14, alignSelf: 'flex-start' },
});

// Marks the document as a site page while mounted (see SITE_SCOPE_CSS in
// lib/site/fontFaces.ts): default text takes the site typeface. Every site
// page calls it, so it also ends the hydration viewport
// (lib/hydrationViewport): the page has mounted, the real width applies now
// instead of after the 1.5 s fallback.
export function useSiteFontScope() {
  useEffect(() => {
    releaseHydrationViewport();
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    const html = document.documentElement;
    html.setAttribute('data-site', '');
    return () => html.removeAttribute('data-site');
  }, []);
}
