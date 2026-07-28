import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { colors, fontSize, spacing } from '../lib/theme';

export function SettingsHeader({ title }: { title: string }) {
  const router = useRouter();
  return (
    <View style={styles.row}>
      <Pressable onPress={() => router.back()} hitSlop={8} style={styles.back}>
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
