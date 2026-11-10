import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../../lib/auth-context';
import { getMyPendingRequest, cancelJoinRequest, type MyJoinRequest } from '../../../lib/api/invites';
import { OnboardingShell } from '../../../components/site/OnboardingShell';
import { sans, site } from '../../../lib/siteTheme';
import { Button, LoadingScreen, Screen } from '../../../components/ui';
import { useTranslation } from '../../../lib/translations';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';
import { displayType } from '../../../lib/marketingTheme';

export default function OnboardingHubScreen() {
  const { t } = useTranslation();
  const { signOut } = useAuth();
  const router = useRouter();
  const [pending, setPending] = useState<MyJoinRequest | null | undefined>(undefined);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    getMyPendingRequest().then(setPending);
  }, []);

  async function handleCancel() {
    if (!pending) return;
    setCancelling(true);
    await cancelJoinRequest(pending.id);
    setCancelling(false);
    setPending(null);
  }

  if (pending === undefined) {
    return (
      <OnboardingShell step={1}>
        <LoadingScreen />
      </OnboardingShell>
    );
  }

  if (pending) {
    return (
      <OnboardingShell step={1} contentContainerStyle={styles.container}>
          <Feather name="clock" size={32} color={colors.primary} style={styles.centerIcon} />
          <Text style={styles.title}>{t('authOnboardingHub.requestSentTitle')}</Text>
          <Text style={styles.subtitle}>
            {t('authOnboardingHub.requestSentBody', { org: pending.organization_name })}
          </Text>
          <Button title={t('authOnboardingHub.cancelRequest')} variant="secondary" onPress={handleCancel} loading={cancelling} style={{ marginTop: spacing.xl }} />
          <Button title={t('authOnboardingHub.signOut')} variant="secondary" onPress={signOut} style={{ marginTop: spacing.md }} />
        </OnboardingShell>
    );
  }

  return (
    <OnboardingShell step={1} contentContainerStyle={styles.container}>
        <Text style={styles.title}>{t('authOnboardingHub.welcomeTitle')}</Text>
        <Text style={styles.subtitle}>{t('authOnboardingHub.welcomeSubtitle')}</Text>

        <Pressable style={styles.choiceCard} onPress={() => router.push('/(auth)/onboarding/create')}>
          <View style={styles.choiceIcon}>
            <Feather name="briefcase" size={22} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.choiceTitle}>{t('authOnboardingHub.createOrgTitle')}</Text>
            <Text style={styles.choiceText}>{t('authOnboardingHub.createOrgText')}</Text>
          </View>
          <Feather name="chevron-right" size={18} color={colors.textMuted} />
        </Pressable>

        <Pressable style={styles.choiceCard} onPress={() => router.push('/(auth)/onboarding/join')}>
          <View style={styles.choiceIcon}>
            <Feather name="users" size={22} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.choiceTitle}>{t('authOnboardingHub.joinOrgTitle')}</Text>
            <Text style={styles.choiceText}>{t('authOnboardingHub.joinOrgText')}</Text>
          </View>
          <Feather name="chevron-right" size={18} color={colors.textMuted} />
        </Pressable>

      </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: spacing.xl,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
    justifyContent: 'center',
  },
  centerIcon: {
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...sans,
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '400',
    letterSpacing: -1.2,
    color: site.ink,
    textAlign: 'center',
  },
  subtitle: {
    ...sans,
    fontSize: 14,
    color: site.muted,
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
    lineHeight: 23,
  },
  bold: {
    fontWeight: '700',
    color: colors.text,
  },
  choiceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  choiceIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  choiceTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  choiceText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: 2,
  },
});
