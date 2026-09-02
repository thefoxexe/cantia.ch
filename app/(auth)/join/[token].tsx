import { useCallback, useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../../lib/auth-context';
import { supabase } from '../../../lib/supabase';
import { acceptInvite, getInvitePreview } from '../../../lib/api/invites';
import { setPendingInvite, clearPendingInvite } from '../../../lib/pendingInvite';
import { Button, LoadingScreen, Screen } from '../../../components/ui';
import { useTranslation } from '../../../lib/translations';
import { colors, fontSize, spacing } from '../../../lib/theme';

export default function JoinScreen() {
  const { t } = useTranslation();
  const { token } = useLocalSearchParams<{ token: string }>();
  const router = useRouter();
  const { session, organization, refreshOrganization } = useAuth();
  const [orgName, setOrgName] = useState<string | null>(null);
  const [valid, setValid] = useState<boolean | null>(null);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentMemberCount, setCurrentMemberCount] = useState<number | null>(null);
  const [confirmSwitch, setConfirmSwitch] = useState(false);

  useEffect(() => {
    if (token) setPendingInvite(token);
  }, [token]);

  useEffect(() => {
    if (!token) return;
    getInvitePreview(token).then(({ organizationName, valid: v }) => {
      setOrgName(organizationName);
      setValid(v);
    });
  }, [token]);

  useEffect(() => {
    if (organization) clearPendingInvite();
  }, [organization]);

  const loadCurrentMemberCount = useCallback(async () => {
    if (!organization) return;
    const { count } = await supabase
      .from('organization_members')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', organization.id);
    setCurrentMemberCount(count ?? null);
  }, [organization]);

  useFocusEffect(
    useCallback(() => {
      loadCurrentMemberCount();
    }, [loadCurrentMemberCount]),
  );

  async function handleAccept(confirmLeaveCurrent = false) {
    setJoining(true);
    setError(null);
    const { error: err } = await acceptInvite(token, confirmLeaveCurrent);
    setJoining(false);
    if (err) {
      setError(err);
      return;
    }
    await clearPendingInvite();
    await refreshOrganization();
  }

  async function handleCreateInstead() {
    await clearPendingInvite();
    router.replace('/(auth)/onboarding');
  }

  if (valid === null) {
    return (
      <Screen>
        <LoadingScreen />
      </Screen>
    );
  }

  if (!valid) {
    return (
      <Screen>
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.container}>
            <Image source={require('../../../assets/logo-mark.png')} style={styles.logo} resizeMode="contain" />
            <Text style={styles.title}>{t('authJoinToken.invalidTitle')}</Text>
            <Text style={styles.subtitle}>
              {t('authJoinToken.invalidText')}
            </Text>
            <Button title={t('authJoinToken.goToLogin')} onPress={() => router.replace('/(auth)/login')} style={{ marginTop: spacing.xl }} />
          </View>
        </ScrollView>
      </Screen>
    );
  }

  if (!session) {
    return (
      <Screen>
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.container}>
            <Image source={require('../../../assets/logo-mark.png')} style={styles.logo} resizeMode="contain" />
            <Text style={styles.title}>{t('authJoinToken.invitedTitle')}</Text>
            <Text style={styles.orgName}>{orgName}</Text>
            <Text style={styles.subtitle}>{t('authJoinToken.createAccountToJoin')}</Text>
            <Button title={t('authJoinToken.createAccountBtn')} onPress={() => router.push('/(auth)/signup')} style={{ marginTop: spacing.xl }} />
            <Button
              title={t('authJoinToken.alreadyHaveAccount')}
              variant="secondary"
              onPress={() => router.push('/(auth)/login')}
              style={{ marginTop: spacing.md }}
            />
          </View>
        </ScrollView>
      </Screen>
    );
  }

  if (organization) {
    if (currentMemberCount === null) {
      return (
        <Screen>
          <LoadingScreen />
        </Screen>
      );
    }

    if (currentMemberCount > 1) {
      return (
        <Screen>
          <ScrollView contentContainerStyle={styles.scroll}>
            <View style={styles.container}>
              <Text style={styles.title}>{t('authJoinToken.alreadyInOrgTitle')}</Text>
              <Text style={styles.subtitle}>
                {t('authJoinToken.alreadyInOrgManyText', { org: organization.name, count: currentMemberCount })}
              </Text>
              <Button title={t('authJoinToken.backToApp')} onPress={() => router.replace('/(app)')} style={{ marginTop: spacing.xl }} />
            </View>
          </ScrollView>
        </Screen>
      );
    }

    // Sole member of their current org: switching is allowed, but it
    // deletes that org and all its data, so require an explicit,
    // separate confirmation step before calling acceptInvite(token, true).
    if (!confirmSwitch) {
      return (
        <Screen>
          <ScrollView contentContainerStyle={styles.scroll}>
            <View style={styles.container}>
              <Text style={styles.title}>{t('authJoinToken.alreadyInOrgTitle')}</Text>
              <Text style={styles.subtitle}>
                {t('authJoinToken.switchConfirmText', { currentOrg: organization.name, newOrg: orgName })}
              </Text>
              <Button
                title={t('authJoinToken.joinInstead', { org: orgName })}
                variant="secondary"
                onPress={() => setConfirmSwitch(true)}
                style={{ marginTop: spacing.xl }}
              />
              <Button title={t('authJoinToken.backToApp')} onPress={() => router.replace('/(app)')} style={{ marginTop: spacing.md }} />
            </View>
          </ScrollView>
        </Screen>
      );
    }

    return (
      <Screen>
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.container}>
            <Feather name="alert-triangle" size={32} color={colors.danger} style={{ alignSelf: 'center', marginBottom: spacing.md }} />
            <Text style={[styles.title, { color: colors.danger }]}>{t('authJoinToken.irreversibleTitle')}</Text>
            <Text style={styles.subtitle}>
              {t('authJoinToken.irreversibleText', { newOrg: orgName, currentOrg: organization.name })}
            </Text>
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Button
              title={t('authJoinToken.deleteAndJoin', { org: organization.name, newOrg: orgName })}
              variant="danger"
              onPress={() => handleAccept(true)}
              loading={joining}
              style={{ marginTop: spacing.xl }}
            />
            <Button title={t('authJoinToken.cancel')} variant="secondary" onPress={() => setConfirmSwitch(false)} style={{ marginTop: spacing.md }} />
          </View>
        </ScrollView>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.container}>
          <Image source={require('../../../assets/logo-mark.png')} style={styles.logo} resizeMode="contain" />
          <Text style={styles.title}>{t('authJoinToken.joinTitle')}</Text>
          <Text style={styles.orgName}>{orgName}</Text>
          <Text style={styles.subtitle}>{t('authJoinToken.joinSubtitle')}</Text>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Button title={t('authJoinToken.joinBtn')} onPress={() => handleAccept(false)} loading={joining} style={{ marginTop: spacing.xl }} />
          <Button
            title={t('authJoinToken.createInsteadBtn')}
            variant="secondary"
            onPress={handleCreateInstead}
            style={{ marginTop: spacing.md }}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  container: {
    padding: spacing.xl,
    maxWidth: 440,
    width: '100%',
    alignSelf: 'center',
  },
  logo: {
    width: 44,
    height: 44,
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
  },
  orgName: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.primary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.md,
    lineHeight: 21,
  },
  error: {
    color: colors.danger,
    fontSize: fontSize.sm,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
});
