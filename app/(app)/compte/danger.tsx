import { useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../lib/auth-context';
import { deleteMyAccount } from '../../../lib/api/account';
import { Button, Card, Container, Field, PageHeader, Screen } from '../../../components/ui';
import { useTranslation } from '../../../lib/translations';
import { colors, fontSize, spacing } from '../../../lib/theme';

// Personal-only: deleting your own account. Deleting the entreprise or
// transferring its ownership lives in compte/entreprise-danger.tsx instead
// — those change the entreprise, not anything about you personally, so
// they belong under Entreprise settings rather than mixed in here.
export default function DangerZoneScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { organization, role, signOut } = useAuth();
  const isOwner = role === 'owner';

  const [accountConfirm, setAccountConfirm] = useState('');
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [accountError, setAccountError] = useState<string | null>(null);

  async function handleDeleteAccount() {
    if (accountConfirm.trim().toUpperCase() !== t('dangerZone.deleteWord')) return;
    setDeletingAccount(true);
    setAccountError(null);
    const { error } = await deleteMyAccount();
    if (error) {
      setDeletingAccount(false);
      setAccountError(error);
      return;
    }
    await signOut();
    router.replace('/');
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl * 2 }}>
        <Container>
          <PageHeader title={t('dangerZone.title')} backTo="/(app)/compte" />
          <Text style={styles.intro}>{t('dangerZone.intro')}</Text>

          <Card style={styles.card}>
            <Text style={styles.cardTitle}>{t('dangerZone.deleteAccountTitle')}</Text>
            <Text style={styles.cardText}>
              {t('dangerZone.deleteAccountText')}
              {isOwner && organization ? t('dangerZone.deleteAccountOwnerSuffix') : t('dangerZone.deleteAccountMemberSuffix')}
            </Text>
            <Field
              label={t('dangerZone.typeWordToConfirm', { word: t('dangerZone.deleteWord') })}
              value={accountConfirm}
              onChangeText={setAccountConfirm}
              placeholder={t('dangerZone.deleteWord')}
              autoCapitalize="characters"
            />
            {accountError ? <Text style={styles.error}>{accountError}</Text> : null}
            <Button
              title={t('dangerZone.deleteAccountButton')}
              variant="danger"
              onPress={handleDeleteAccount}
              loading={deletingAccount}
              disabled={accountConfirm.trim().toUpperCase() !== t('dangerZone.deleteWord')}
            />
          </Card>
        </Container>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  card: {
    borderColor: colors.dangerSoft,
    borderWidth: 1,
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  cardTitle: {
    fontSize: fontSize.md,
    fontWeight: '800',
    color: colors.danger,
  },
  cardText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    lineHeight: 19,
  },
  error: {
    fontSize: fontSize.sm,
    color: colors.danger,
  },
});
