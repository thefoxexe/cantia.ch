import { StyleSheet, View } from 'react-native';

// A drawn Swiss flag (not an emoji — cross-platform emoji flag rendering is
// unreliable, e.g. Windows Chrome falls back to "CH" letters) at the
// federal 32-unit grid proportions (6-unit margin, 20-unit cross span,
// 6-unit arm thickness) — square corners, not a rounded badge, so it
// actually reads as a flag rather than an app icon at a glance.
export function SwissCross({ size = 14 }: { size?: number }) {
  const bar = size * (6 / 32);
  const span = size * (20 / 32);
  return (
    <View style={[styles.square, { width: size, height: size }]}>
      <View style={[styles.bar, { width: bar, height: span }]} />
      <View style={[styles.bar, { height: bar, width: span }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  square: {
    backgroundColor: '#D8232A',
    borderRadius: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bar: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
  },
});
