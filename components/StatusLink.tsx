import { Linking, Platform, Pressable, StyleSheet, Text, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import { colors } from '../lib/theme';

export const STATUS_URL = 'https://status.cantia.ch';

// "Is Cantia working right now?" — a small link with a status dot, in every
// footer (marketing site, client portal, app sidebar), to the public status
// page.
export function StatusLink({ label, textStyle, style }: { label: string; textStyle?: StyleProp<TextStyle>; style?: StyleProp<ViewStyle> }) {
  const open = () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') window.open(STATUS_URL, '_blank', 'noopener');
    else Linking.openURL(STATUS_URL);
  };
  return (
    <Pressable onPress={open} accessibilityRole="link" style={[styles.row, style]}>
      <View style={styles.dot} />
      <Text style={textStyle}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.success },
});
