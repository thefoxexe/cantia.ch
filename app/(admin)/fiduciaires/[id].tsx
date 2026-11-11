import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { AdminFirmDetail } from '../../../components/AdminFirmDetail';
import { colors, fontSize, spacing } from '../../../lib/theme';

// Super Admin › Fiduciaires › one firm (components/AdminFirmDetail).
export default function AdminFiduciaireDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.wrap}>
      <Pressable onPress={() => router.push('/(admin)/fiduciaires' as any)} style={styles.back} hitSlop={8}>
        <Feather name="arrow-left" size={16} color={colors.textMuted} />
        <Text style={styles.backText}>Fiduciaires</Text>
      </Pressable>
      {id ? <AdminFirmDetail id={String(id)} /> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%', maxWidth: 1180, alignSelf: 'center', padding: spacing.xl, paddingBottom: 80, gap: spacing.lg },
  back: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start' },
  backText: { fontSize: fontSize.sm, color: colors.textMuted, fontWeight: '600' },
});
