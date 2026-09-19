import { StyleSheet, View } from 'react-native';

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
