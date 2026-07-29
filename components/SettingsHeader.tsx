import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { colors, fontSize, spacing } from '../lib/theme';

// Tab switches on web can replace history in a way that leaves nothing to
// pop back to, so router.back() isn't reliable here — pass backTo to always
// land on a known parent screen instead of guessing from history.
export function SettingsHeader({ title, backTo }: { title: string; backTo?: string }) {
  const router = useRouter();
  return (
    <View style={styles.row}>
      <Pressable onPress={() => (backTo ? router.replace(backTo as any) : router.back())} hitSlop={8} style={styles.back}>
        <Feather name="arrow-left" size={20} color={colors.text} />
      </Pressable>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  back: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    color: colors.text,
  },
});
