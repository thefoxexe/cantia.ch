import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Button, AppScreen } from './ui';
import { useTranslation } from '../lib/translations';
import { colors, fontSize, radius, spacing } from '../lib/theme';

// Shown in place of a screen the member's role does not open
// (lib/routeAccess.ts), whatever way they reached it.
export function AccessDenied() {
  const { t } = useTranslation();
  const router = useRouter();
  return (
    <AppScreen>
      <View style={styles.wrap}>
        <View style={styles.icon}>
          <Feather name="lock" size={22} color={colors.textMuted} />
        </View>
        <Text style={styles.title}>{t('devisLayout.deniedTitle')}</Text>
        <Text style={styles.text}>{t('devisLayout.deniedRouteText')}</Text>
        <Button title={t('devisLayout.backHome')} onPress={() => router.replace('/(app)')} />
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl, gap: spacing.md },
  icon: { width: 48, height: 48, borderRadius: radius.pill, backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xs },
  title: { fontSize: fontSize.lg, fontWeight: '700', color: colors.text },
  text: { fontSize: fontSize.sm, color: colors.textMuted, textAlign: 'center', lineHeight: 20, marginBottom: spacing.sm, maxWidth: 420 },
});
