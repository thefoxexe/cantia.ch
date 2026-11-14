import { useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, Text, TextInput, View, type GestureResponderEvent } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getAppLocale } from '../lib/translations';
import { colors, fontSize, radius, spacing } from '../lib/theme';

// Any colour with three bars slid with the finger (or the mouse): the hue
// along the rainbow, then how vivid and how light it is. The HEX code can
// still be typed or pasted. Used for the brand colour and the accent colour
// of the documents (Compte › Apparence, onboarding).

const HEX_RE = /^#[0-9A-Fa-f]{6}$/;

const COPY = {
  fr: { hue: 'Teinte', sat: 'Intensité', light: 'Clarté', hex: 'Code HEX' },
  de: { hue: 'Farbton', sat: 'Intensität', light: 'Helligkeit', hex: 'HEX-Code' },
  it: { hue: 'Tinta', sat: 'Intensità', light: 'Luminosità', hex: 'Codice HEX' },
};

export function hslToHex(h: number, s: number, l: number): string {
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const c = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(c * 255).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
}

export function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const n = parseInt(hex.slice(1), 16);
  const r = ((n >> 16) & 255) / 255;
  const g = ((n >> 8) & 255) / 255;
  const b = (n & 255) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  h *= 60;
  return { h, s, l };
}

function textOn(hex: string): string {
  const n = parseInt(hex.slice(1), 16);
  const lum = (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
  return lum > 0.62 ? '#111' : '#fff';
}

const clamp = (v: number) => Math.max(0, Math.min(1, v));

function Bar({ label, value, stops, onChange, disabled }: { label: string; value: number; stops: string[]; onChange: (v: number) => void; disabled?: boolean }) {
  const ref = useRef<View>(null);
  const box = useRef({ x: 0, w: 1 });

  function apply(pageX: number) {
    onChange(clamp((pageX - box.current.x) / Math.max(1, box.current.w)));
  }
  function grant(e: GestureResponderEvent) {
    const pageX = e.nativeEvent.pageX;
    ref.current?.measure((_x, _y, w, _h, px) => {
      box.current = { x: px, w };
      apply(pageX);
    });
  }

  return (
    <View style={{ gap: 6 }}>
      <Text style={styles.barLabel}>{label}</Text>
      <View
        ref={ref}
        style={[styles.barHit, Platform.OS === 'web' && ({ touchAction: 'none', userSelect: 'none', cursor: disabled ? 'default' : 'pointer' } as any)]}
        onStartShouldSetResponder={() => !disabled}
        onMoveShouldSetResponder={() => !disabled}
        onResponderTerminationRequest={() => false}
        onResponderGrant={grant}
        onResponderMove={(e) => apply(e.nativeEvent.pageX)}
        accessibilityRole="adjustable"
        accessibilityLabel={label}
        accessibilityValue={{ min: 0, max: 100, now: Math.round(value * 100) }}
      >
        <LinearGradient colors={stops as [string, string, ...string[]]} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={styles.track} />
        <View pointerEvents="none" style={[styles.thumb, { left: `${value * 100}%` }]} />
      </View>
    </View>
  );
}

export function HueColorPicker({ value, onChange, disabled }: { value: string; onChange: (hex: string) => void; disabled?: boolean }) {
  const l = getAppLocale();
  const c = COPY[l === 'de' || l === 'it' ? l : 'fr'];
  const valid = HEX_RE.test(value);
  const [hsl, setHsl] = useState(() => hexToHsl(valid ? value : '#1F3D3A'));
  const [hexText, setHexText] = useState(value);
  const [hexFocused, setHexFocused] = useState(false);

  // Follow a colour set from outside (logo, site, typed code) without
  // losing the hue of a grey picked here.
  useEffect(() => {
    if (!HEX_RE.test(value)) return;
    if (hslToHex(hsl.h, hsl.s, hsl.l) !== value.toUpperCase()) setHsl(hexToHsl(value));
    if (!hexFocused) setHexText(value.toUpperCase());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  function set(next: { h: number; s: number; l: number }) {
    setHsl(next);
    const hex = hslToHex(next.h, next.s, next.l);
    if (!hexFocused) setHexText(hex);
    onChange(hex);
  }

  const current = hslToHex(hsl.h, hsl.s, hsl.l);
  const hueStops = [0, 60, 120, 180, 240, 300, 360].map((h) => hslToHex(h % 360, Math.max(0.55, hsl.s), 0.5));
  const satStops = [hslToHex(hsl.h, 0, hsl.l), hslToHex(hsl.h, 1, hsl.l)];
  const lightStops = [hslToHex(hsl.h, hsl.s, 0.08), hslToHex(hsl.h, hsl.s, 0.5), hslToHex(hsl.h, hsl.s, 0.94)];

  return (
    <View style={styles.wrap}>
      <View style={styles.top}>
        <View style={[styles.swatch, { backgroundColor: valid ? value : current }]}>
          <Text style={[styles.swatchText, { color: textOn(valid ? value : current) }]}>Aa</Text>
        </View>
        <View style={{ flex: 1, minWidth: 140, gap: 4 }}>
          <Text style={styles.barLabel}>{c.hex}</Text>
          <TextInput
            value={hexText}
            editable={!disabled}
            onFocus={() => setHexFocused(true)}
            onChangeText={(v) => {
              setHexText(v);
              const n = `#${v.trim().replace(/^#*/, '')}`.toUpperCase();
              if (HEX_RE.test(n)) {
                setHsl(hexToHsl(n));
                onChange(n);
              }
            }}
            onBlur={() => {
              setHexFocused(false);
              setHexText(valid ? value.toUpperCase() : current);
            }}
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={7}
            style={styles.hexInput}
          />
        </View>
      </View>
      <Bar label={c.hue} value={hsl.h / 360} stops={hueStops} disabled={disabled} onChange={(v) => set({ ...hsl, h: v * 360, s: hsl.s < 0.08 ? 0.55 : hsl.s })} />
      <Bar label={c.sat} value={hsl.s} stops={satStops} disabled={disabled} onChange={(v) => set({ ...hsl, s: v })} />
      <Bar label={c.light} value={(hsl.l - 0.08) / 0.86} stops={lightStops} disabled={disabled} onChange={(v) => set({ ...hsl, l: 0.08 + v * 0.86 })} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.md },
  top: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.md },
  swatch: { width: 64, height: 64, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(0,0,0,0.08)' },
  swatchText: { fontSize: 20, fontWeight: '800' },
  barLabel: { fontSize: fontSize.xs, fontWeight: '600', color: colors.textMuted },
  barHit: { height: 30, justifyContent: 'center' },
  track: { height: 14, borderRadius: 7, borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(0,0,0,0.12)' },
  thumb: {
    position: 'absolute',
    top: 2,
    width: 26,
    height: 26,
    marginLeft: -13,
    borderRadius: 13,
    borderWidth: 3,
    borderColor: '#fff',
    backgroundColor: 'transparent',
    ...(Platform.OS === 'web' ? ({ boxShadow: '0 1px 4px rgba(0,0,0,0.35)' } as any) : { shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 3, shadowOffset: { width: 0, height: 1 }, elevation: 3 }),
  },
  hexInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 9,
    fontSize: fontSize.md,
    fontWeight: '700',
    letterSpacing: 1,
    color: colors.text,
    fontFamily: Platform.select({ web: 'ui-monospace, Menlo, monospace', default: undefined }),
  },
});
