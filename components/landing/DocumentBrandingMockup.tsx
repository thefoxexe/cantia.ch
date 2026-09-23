import { useState } from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, radius, spacing } from '../../lib/theme';
import { landingFonts } from '../../lib/landingTheme';

// Illustrated (not photographic) mockup of a Cantia facture — same
// "browser window" chrome as ModuleMockup (solutions pages), rebuilt here
// with landingFonts since this lives on the homepage only. Deliberately
// mirrors the real generated-PDF layout shipped in
// supabase/functions/_shared/pdf-document-renderers.ts (brand-colored doc
// label, tinted reference box with a left accent edge, colored table
// header, zebra rows, boxed total) so visitors see exactly what their own
// documents will look like. The 3 swatches are live — tapping one recolors
// the whole mockup, the cheapest possible way to sell "it's your color,
// not ours."
const SWATCHES = ['#BC5A31', '#2455A4', '#1F7A54'] as const;

export function DocumentBrandingMockup() {
  const [active, setActive] = useState<string>(SWATCHES[0]);

  return (
    <View style={styles.wrap}>
      <View style={styles.swatchRow}>
        <Text style={styles.swatchLabel}>Couleur</Text>
        {SWATCHES.map((hex) => (
          <Pressable
            key={hex}
            onPress={() => setActive(hex)}
            accessibilityRole="button"
            accessibilityLabel={`Utiliser la couleur ${hex}`}
            style={[styles.swatch, { backgroundColor: hex }, active === hex && styles.swatchActive]}
          />
        ))}
      </View>

      <View style={styles.frame}>
        <View style={styles.topBar}>
          <View style={styles.dots}>
            <View style={[styles.dot, { backgroundColor: '#E38B7A' }]} />
            <View style={[styles.dot, { backgroundColor: '#E8C57A' }]} />
            <View style={[styles.dot, { backgroundColor: '#8FB88A' }]} />
          </View>
          <View style={styles.addressBar}>
            <Feather name="lock" size={9} color={colors.textMuted} />
            <Text style={styles.addressText}>facture-2026-0231.pdf</Text>
          </View>
        </View>

        <View style={styles.screen}>
          <View style={styles.docHeaderRow}>
            <View style={styles.logoSquare}>
              <Feather name="image" size={13} color={colors.textMuted} />
            </View>
            <View style={{ flex: 1, gap: 4 }}>
              <View style={[styles.orgNameBar, { backgroundColor: active }]} />
              <View style={styles.orgLineBar} />
            </View>
          </View>

          <Text style={[styles.docLabel, { color: active }]}>FACTURE</Text>

          <View style={[styles.refBox, { backgroundColor: tint(active, 0.93), borderLeftColor: active }]}>
            <View style={styles.refLine} />
            <View style={[styles.refLine, { width: '55%' }]} />
          </View>

          <View style={[styles.tableHeader, { backgroundColor: active }]}>
            <View style={styles.tableHeaderBar} />
            <Text style={styles.tableHeaderText}>Total</Text>
          </View>
          {[0, 1].map((i) => (
            <View key={i} style={[styles.tableRow, i % 2 === 1 && { backgroundColor: tint(active, 0.95) }]}>
              <View style={styles.tableRowBar} />
              <Text style={styles.tableRowPrice}>{i === 0 ? "3'150.—" : "1'240.—"}</Text>
            </View>
          ))}

          <View style={[styles.totalBox, { backgroundColor: tint(active, 0.9), borderColor: active }]}>
            <Text style={[styles.totalLabel, { color: active }]}>TOTAL TTC</Text>
            <Text style={[styles.totalPrice, { color: active }]}>{"4'390.—"}</Text>
          </View>

          <View style={styles.qrRow}>
            <View style={styles.qrIcon}>
              <Feather name="grid" size={14} color={colors.text} />
            </View>
            <Text style={styles.qrText}>QR-facture suisse incluse</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

// Blends a hex color toward white by `amount` (0-1) — same softTint logic
// used server-side for the real PDF's tinted boxes/zebra rows, so the
// mockup's tints react identically to whichever swatch is active.
function tint(hex: string, amount: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const mix = (c: number) => Math.round(c + (255 - c) * amount);
  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.md, width: '100%', maxWidth: 380 },
  swatchRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  swatchLabel: {
    fontFamily: landingFonts.body,
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    marginRight: 2,
  },
  swatch: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  swatchActive: {
    borderColor: colors.text,
  },
  frame: {
    width: '100%',
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    shadowColor: '#231A12',
    shadowOpacity: 0.1,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 16 },
  } as unknown as ViewStyle,
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surfaceAlt,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dots: { flexDirection: 'row', gap: 4 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  addressBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  addressText: {
    fontFamily: landingFonts.body,
    fontSize: 9,
    color: colors.textMuted,
  },
  screen: {
    padding: spacing.lg,
    gap: spacing.sm,
    backgroundColor: colors.bg,
  },
  docHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  logoSquare: {
    width: 28,
    height: 28,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orgNameBar: { width: '55%', height: 8, borderRadius: 4 },
  orgLineBar: { width: '75%', height: 5, borderRadius: 3, backgroundColor: colors.border },
  docLabel: {
    fontFamily: landingFonts.body,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.4,
    marginTop: 2,
  },
  refBox: {
    borderLeftWidth: 3,
    borderRadius: 4,
    padding: spacing.sm,
    gap: 5,
  },
  refLine: { width: '80%', height: 5, borderRadius: 3, backgroundColor: 'rgba(35,26,18,0.28)' },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  tableHeaderBar: { width: '45%', height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.85)' },
  tableHeaderText: {
    fontFamily: landingFonts.body,
    fontSize: 9,
    fontWeight: '800',
    color: '#fff',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: 4,
  },
  tableRowBar: { width: '45%', height: 5, borderRadius: 3, backgroundColor: colors.border },
  tableRowPrice: {
    fontFamily: landingFonts.body,
    fontSize: 10,
    fontWeight: '700',
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  totalBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 7,
    marginTop: 2,
  },
  totalLabel: {
    fontFamily: landingFonts.body,
    fontSize: 11,
    fontWeight: '800',
  },
  totalPrice: {
    fontFamily: landingFonts.body,
    fontSize: 13,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  qrRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  qrIcon: {
    width: 22,
    height: 22,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrText: {
    fontFamily: landingFonts.body,
    fontSize: 10,
    fontWeight: '600',
    color: colors.textMuted,
  },
});
