import { StyleSheet, View } from 'react-native';

// A bare inline trend line for a stat tile — no axis, no tooltip, no legend.
// Per the dataviz stat-tile spec: a hero number's job is the number itself,
// the sparkline is just "is it going up." Rounded data-ends, thin bars,
// one hue (the tile's own accent, never a second color).
export function StatSparkline({ values, color, height = 36 }: { values: number[]; color: string; height?: number }) {
  const max = Math.max(1, ...values);
  return (
    <View style={[styles.row, { height }]}>
      {values.map((v, i) => (
        <View key={i} style={styles.slot}>
          <View style={[styles.bar, { height: Math.max(3, (v / max) * height), backgroundColor: color }]} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
  },
  slot: {
    flex: 1,
    alignItems: 'stretch',
    justifyContent: 'flex-end',
  },
  bar: {
    borderRadius: 3,
  },
});
