import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../lib/auth-context';
import { deleteMyAccount, deleteOrganization } from '../../../lib/api/account';
import { Button, Card, Container, Field, PageHeader, Screen } from '../../../components/ui';
import { useTranslation } from '../../../lib/translations';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';

// Typing the exact org name / a fixed word is the confirmation step itself
// (same pattern as GitHub's repo-delete) — no extra confirm() dialog on top
// of it, since a second "are you sure?" after already typing it out would
// just be friction, not safety.
export default function DangerZoneScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { organization, role, signOut } = useAuth();
  const isOwner = role === 'owner';

  const [orgConfirm, setOrgConfirm] = useState('');
  const [deletingOrg, setDeletingOrg] = useState(false);
  const [orgError, setOrgError] = useState<string | null>(null);

  const [accountConfirm, setAccountConfirm] = useState('');
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [accountError, setAccountError] = useState<string | null>(null);

  async function handleDeleteOrg() {
    if (!organization || orgConfirm.trim() !== organization.name) return;
    setDeletingOrg(true);
    setOrgError(null);
    const { error } = await deleteOrganization(organization.id);
    if (error) {
      setDeletingOrg(false);
      setOrgError(error);
      return;
    }
    await signOut();
    router.replace('/');
  }

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

          {isOwner && organization ? (
            <Card style={styles.card}>
              <Text style={styles.cardTitle}>{t('dangerZone.deleteOrgTitle')}</Text>
              <Text style={styles.cardText}>{t('dangerZone.deleteOrgText', { name: organization.name })}</Text>
              <Field
                label={t('dangerZone.typeToConfirm', { name: organization.name })}
                value={orgConfirm}
                onChangeText={setOrgConfirm}
                placeholder={organization.name}
                autoCapitalize="none"
              />
              {orgError ? <Text style={styles.error}>{orgError}</Text> : null}
              <Button
                title={t('dangerZone.deleteOrgButton')}
                variant="danger"
                onPress={handleDeleteOrg}
                loading={deletingOrg}
                disabled={orgConfirm.trim() !== organization.name}
              />
            </Card>
          ) : null}

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
