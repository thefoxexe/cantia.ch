import { StyleSheet, Text, View } from 'react-native';
import { colors, radius } from '../../lib/theme';

// Shared floating tooltip rendered by every chart's pointerConfig
// (react-native-gifted-charts) — click-and-drag across a chart to scrub
// through it; a pure hover-without-press isn't supported by the library on
// web (it's built on the same touch/press gesture system as native).
export function ChartTooltip({ value, dateLabel, color, formatValue }: { value: number; dateLabel?: string; color: string; formatValue?: (v: number) => string }) {
  return (
    <View style={styles.tooltip}>
      <Text style={[styles.value, { color }]}>{formatValue ? formatValue(value) : value.toLocaleString('fr-CH')}</Text>
      {dateLabel ? <Text style={styles.date}>{dateLabel}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  tooltip: {
    backgroundColor: colors.text,
    borderRadius: radius.md,
    paddingHorizontal: 10,
    paddingVertical: 6,
    minWidth: 80,
  },
  value: {
    fontSize: 13,
    fontWeight: '800',
  },
  date: {
    fontSize: 10,
    color: '#fff',
    opacity: 0.75,
    marginTop: 1,
  },
});
