import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, spacing } from '../../lib/theme';

// A browser window around a product preview (accounting / partners
// landings): reads as the real tool rather than a floating card.
export function BrowserFrame({ url, children }: { url: string; children: ReactNode }) {
  return (
    <View style={styles.frame} aria-hidden>
      <View style={styles.bar}>
        <View style={styles.dots}>
          {['#E5B8A6', '#E6D3A3', '#BFD3BE'].map((c) => (
            <View key={c} style={[styles.dot, { backgroundColor: c }]} />
          ))}
        </View>
        <View style={styles.url}>
          <Feather name="lock" size={10} color={colors.textMuted} />
          <Text style={styles.urlText} numberOfLines={1}>
            {url}
          </Text>
        </View>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#2B211A',
    shadowOpacity: 0.1,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 20 },
  },
  bar: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.md, paddingVertical: 10, backgroundColor: colors.bg, borderBottomWidth: 1, borderBottomColor: colors.border },
  dots: { flexDirection: 'row', gap: 6 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  url: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.surface, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: colors.border },
  urlText: { fontSize: 11.5, color: colors.textMuted },
});
