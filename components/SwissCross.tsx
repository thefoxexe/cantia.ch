import { StyleSheet, View } from 'react-native';

// A drawn Swiss cross (not an emoji, for consistent rendering/App Store
// polish) — used as a small trust mark on the client portal, the only
// place in the app that needs to visually assert "this is Swiss-made."
export function SwissCross({ size = 14 }: { size?: number }) {
  const bar = Math.max(2, Math.round(size * 0.22));
  return (
    <View style={[styles.square, { width: size, height: size, borderRadius: size * 0.2 }]}>
      <View style={[styles.bar, { width: bar, height: size * 0.58 }]} />
      <View style={[styles.bar, styles.barHorizontal, { height: bar, width: size * 0.58 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  square: {
    backgroundColor: '#D8232A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bar: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: 1,
  },
  barHorizontal: {},
});
