import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import type { IconName } from '../../../../components/NavDrawer';
import { useAuth } from '../../../../lib/auth-context';
import { Card, EmptyState, LoadingScreen, PageHeader, Screen } from '../../../../components/ui';
import { useTranslation } from '../../../../lib/translations';
import { colors, fontSize, radius, spacing } from '../../../../lib/theme';

interface HubLink {
  href: string;
  icon: IconName;
  titleKey: string;
  descKey: string;
}

const LINKS: HubLink[] = [
  { href: '/(app)/rh/salaires/employes', icon: 'users', titleKey: 'payrollSalariesHub.employees', descKey: 'payrollSalariesHub.employeesDesc' },
  { href: '/(app)/rh/fiches-salaire', icon: 'file-text', titleKey: 'payrollSalariesHub.slips', descKey: 'payrollSalariesHub.slipsDesc' },
  { href: '/(app)/rh/absences', icon: 'calendar', titleKey: 'payrollSalariesHub.absences', descKey: 'payrollSalariesHub.absencesDesc' },
  { href: '/(app)/rh/corrections', icon: 'rotate-ccw', titleKey: 'payrollSalariesHub.corrections', descKey: 'payrollSalariesHub.correctionsDesc' },
  { href: '/(app)/rh/declarations', icon: 'archive', titleKey: 'payrollSalariesHub.declarations', descKey: 'payrollSalariesHub.declarationsDesc' },
  { href: '/(app)/compte/rh', icon: 'settings', titleKey: 'payrollSalariesHub.settings', descKey: 'payrollSalariesHub.settingsDesc' },
];

export default function PayrollSalariesHubScreen() {
  const { t } = useTranslation();
  const { organization, canManagePayroll } = useAuth();
  const router = useRouter();

  if (!organization) return <LoadingScreen />;

  if (!canManagePayroll) {
    return (
      <Screen>
        <ScrollView contentContainerStyle={{ padding: spacing.xl }}>
          <PageHeader title={t('payrollSalariesHub.title')} backTo="/(app)/rh" />
          <Card><EmptyState title={t('payrollSalariesHub.title')} subtitle={t('payrollHub.selfSubtitle')} /></Card>
        </ScrollView>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: spacing.xl, paddingBottom: spacing.xxl * 2 }}>
        <PageHeader title={t('payrollSalariesHub.title')} backTo="/(app)/rh" />
        <Text style={styles.subtitle}>{t('payrollSalariesHub.subtitle')}</Text>

        <View style={styles.grid}>
          {LINKS.map((link) => (
            <Pressable key={link.href} onPress={() => router.push(link.href as any)} style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}>
              <View style={styles.cardIcon}>
                <Feather name={link.icon} size={20} color={colors.primary} />
              </View>
              <Text style={styles.cardTitle}>{t(link.titleKey as any)}</Text>
              <Text style={styles.cardDesc}>{t(link.descKey as any)}</Text>
              <View style={styles.cardArrow}>
                <Feather name="arrow-right" size={16} color={colors.textMuted} />
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  subtitle: { fontSize: fontSize.sm, color: colors.textMuted, lineHeight: 19, marginBottom: spacing.xl },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  card: {
    width: 260,
    flexGrow: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: 4,
  },
  cardPressed: { backgroundColor: colors.surfaceAlt },
  cardIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  cardTitle: { fontSize: fontSize.md, fontWeight: '800', color: colors.text },
  cardDesc: { fontSize: fontSize.xs, color: colors.textMuted, lineHeight: 17 },
  cardArrow: { position: 'absolute', top: spacing.lg, right: spacing.lg },
});
