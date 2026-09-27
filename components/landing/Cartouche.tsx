import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../lib/theme';
import { marketingFonts, monoType } from '../../lib/marketingTheme';
import { ink } from './brand';

// The title block of an architect's drawing, used once, under the hero:
// the facts a visitor checks first, in the format the trade reads daily.
export function Cartouche({ cells, compact }: { cells: { label: string; value: string }[]; compact: boolean }) {
  return (
    <View style={[styles.box, compact && styles.boxCompact]}>
      {cells.map((cell, i) => (
        <View
          key={cell.label}
          style={[
            styles.cell,
            compact ? styles.cellCompact : null,
            !compact && i < cells.length - 1 && styles.cellDivider,
            compact && i % 2 === 0 && styles.cellDivider,
            compact && i < cells.length - 2 && styles.cellBottom,
          ]}
        >
          <Text style={styles.label}>{cell.label}</Text>
          <Text style={styles.value}>{cell.value}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { flexDirection: 'row', borderWidth: 1.5, borderColor: ink, backgroundColor: colors.bg },
  boxCompact: { flexWrap: 'wrap' },
  cell: { flex: 1, paddingVertical: 9, paddingHorizontal: 12, gap: 3 },
  cellCompact: { flexBasis: '50%', flexGrow: 0, flexShrink: 0, width: '50%' },
  cellDivider: { borderRightWidth: 1, borderRightColor: ink },
  cellBottom: { borderBottomWidth: 1, borderBottomColor: ink },
  label: { ...monoType, fontSize: 9, letterSpacing: 0.5, textTransform: 'uppercase', color: colors.textMuted },
  value: { fontFamily: marketingFonts.body, fontSize: 13.5, fontWeight: '600', color: ink, lineHeight: 18 },
});
