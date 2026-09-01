import { StyleSheet, View } from 'react-native';

// The four-square Microsoft mark — no equivalent glyph exists in the icon
// fonts already bundled (Ionicons/Feather have "logo-google" but no
// Microsoft entry), so it's drawn directly rather than approximated with a
// generic "briefcase"-style icon.
export function MicrosoftLogo({ size = 16 }: { size?: number }) {
  const gap = Math.max(1, Math.round(size * 0.08));
  const cell = (size - gap) / 2;
  return (
    <View style={[styles.grid, { width: size, height: size, gap }]}>
      <View style={{ width: cell, height: cell, backgroundColor: '#F25022' }} />
      <View style={{ width: cell, height: cell, backgroundColor: '#7FBA00' }} />
      <View style={{ width: cell, height: cell, backgroundColor: '#00A4EF' }} />
      <View style={{ width: cell, height: cell, backgroundColor: '#FFB900' }} />
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
