import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../../lib/auth-context';
import {
  cancelOwnershipTransfer,
  confirmOwnershipTransfer,
  enrichOwnershipTransfer,
  getOwnershipTransferByToken,
  type OwnershipTransferDetails,
} from '../../../lib/api/ownership';
import { Button, Card, LoadingScreen, Screen } from '../../../components/ui';
import { useTranslation } from '../../../lib/translations';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';

type Status = 'loading' | 'invalid' | 'wrongAccount' | 'prompt' | 'success';

// Landing screen for the confirmation link mailed by
// send-ownership-transfer-email (kind: 'confirm'). Lives inside the
// authenticated (app) group rather than (auth) — unlike a join-invite
// link, the target here is by definition already a member of this exact
// org, so they're already going to be signed in and inside (app) most of
// the time; if they're not, the root layout's normal "not signed in ->
// login" redirect applies, same as any other (app) route. The same
// accept/decline action is also reachable from Compte -> Zone dangereuse,
// so losing this specific link after a login redirect isn't a dead end.
export default function TransferOwnershipScreen() {
  const { t } = useTranslation();
  const { token } = useLocalSearchParams<{ token: string }>();
  const router = useRouter();
  const { user, refreshOrganization } = useAuth();
  const [status, setStatus] = useState<Status>('loading');
  const [transfer, setTransfer] = useState<OwnershipTransferDetails | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token || !user) return;
    setStatus('loading');
    const row = await getOwnershipTransferByToken(String(token));
    if (!row || row.status !== 'pending') {
      setStatus('invalid');
      return;
    }
    const details = await enrichOwnershipTransfer(row);
    setTransfer(details);
    setStatus(details.toUserId === user.id ? 'prompt' : 'wrongAccount');
  }, [token, user]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function handleAccept() {
    if (!transfer) return;
    setSaving(true);
    setError(null);
    const { error: err } = await confirmOwnershipTransfer(transfer.token);
    setSaving(false);
    if (err) {
      setError(err);
      return;
    }
    await refreshOrganization();
    setStatus('success');
  }

  async function handleDecline() {
    if (!transfer) return;
    setSaving(true);
    setError(null);
    const { error: err } = await cancelOwnershipTransfer(transfer.id);
    setSaving(false);
    if (err) {
      setError(err);
      return;
    }
    router.replace('/(app)/compte');
  }

  if (status === 'loading') {
    return (
      <Screen>
        <LoadingScreen />
      </Screen>
    );
  }

  if (status === 'invalid') {
    return (
      <Screen>
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.container}>
            <Feather name="alert-circle" size={32} color={colors.textMuted} style={styles.icon} />
            <Text style={styles.title}>{t('ownershipTransferConfirm.invalidTitle')}</Text>
            <Text style={styles.subtitle}>{t('ownershipTransferConfirm.invalidText')}</Text>
            <Button title={t('ownershipTransferConfirm.backToApp')} onPress={() => router.replace('/(app)')} style={{ marginTop: spacing.xl }} />
          </View>
        </ScrollView>
      </Screen>
    );
  }

  if (status === 'wrongAccount') {
    return (
      <Screen>
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.container}>
            <Feather name="alert-triangle" size={32} color={colors.danger} style={styles.icon} />
            <Text style={styles.title}>{t('ownershipTransferConfirm.wrongAccountTitle')}</Text>
            <Text style={styles.subtitle}>{t('ownershipTransferConfirm.wrongAccountText')}</Text>
            <Button title={t('ownershipTransferConfirm.backToApp')} onPress={() => router.replace('/(app)')} style={{ marginTop: spacing.xl }} />
          </View>
        </ScrollView>
      </Screen>
    );
  }

  if (status === 'success' && transfer) {
    return (
      <Screen>
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.container}>
            <View style={styles.successBadge}>
              <Feather name="check" size={26} color="#fff" />
            </View>
            <Text style={styles.title}>{t('ownershipTransferConfirm.successTitle')}</Text>
            <Text style={styles.subtitle}>{t('ownershipTransferConfirm.successText', { org: transfer.organizationName })}</Text>
            <Button title={t('ownershipTransferConfirm.backToApp')} onPress={() => router.replace('/(app)/compte/entreprise-danger')} style={{ marginTop: spacing.xl }} />
          </View>
        </ScrollView>
      </Screen>
    );
  }

  if (!transfer) return null;

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.container}>
          <Card>
            <Text style={styles.title}>{t('ownershipTransferConfirm.promptTitle', { org: transfer.organizationName })}</Text>
            <Text style={styles.subtitle}>{t('ownershipTransferConfirm.promptText', { from: transfer.fromName, org: transfer.organizationName })}</Text>
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Button title={t('ownershipTransferConfirm.acceptButton')} onPress={handleAccept} loading={saving} style={{ marginTop: spacing.xl }} />
            <Button
              title={t('ownershipTransferConfirm.declineButton')}
              variant="secondary"
              onPress={handleDecline}
              disabled={saving}
              style={{ marginTop: spacing.sm }}
            />
          </Card>
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
  icon: {
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  successBadge: {
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
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
