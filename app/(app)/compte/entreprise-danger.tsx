import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../../lib/auth-context';
import { deleteOrganization } from '../../../lib/api/account';
import {
  cancelOwnershipTransfer,
  confirmOwnershipTransfer,
  enrichOwnershipTransfer,
  getMyOwnershipTransfers,
  initiateOwnershipTransfer,
  listTransferableMembers,
  type OwnershipTransferDetails,
  type TransferableMember,
} from '../../../lib/api/ownership';
import { Button, Card, Container, Field, PageHeader, Screen } from '../../../components/ui';
import { useTranslation } from '../../../lib/translations';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';

// The entreprise's own danger zone — ownership transfer and org deletion —
// kept separate from compte/danger.tsx (which is purely about the signed-in
// person's own account): it's the entreprise that changes hands or gets
// deleted here, not anything personal, so it lives under Entreprise
// settings instead of being mixed in with "supprimer mon compte".
export default function EntrepriseDangerZoneScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { organization, role, user, signOut, refreshOrganization } = useAuth();
  const isOwner = role === 'owner';

  const [orgConfirm, setOrgConfirm] = useState('');
  const [deletingOrg, setDeletingOrg] = useState(false);
  const [orgError, setOrgError] = useState<string | null>(null);

  const [transferMembers, setTransferMembers] = useState<TransferableMember[]>([]);
  const [outgoingTransfer, setOutgoingTransfer] = useState<OwnershipTransferDetails | null>(null);
  const [incomingTransfer, setIncomingTransfer] = useState<OwnershipTransferDetails | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [transferSaving, setTransferSaving] = useState(false);
  const [transferError, setTransferError] = useState<string | null>(null);
  const [transferSentName, setTransferSentName] = useState<string | null>(null);

  const loadTransfers = useCallback(async () => {
    if (!user) return;
    const { outgoing, incoming } = await getMyOwnershipTransfers(user.id);
    const [outgoingDetails, incomingDetails] = await Promise.all([
      outgoing ? enrichOwnershipTransfer(outgoing) : Promise.resolve(null),
      incoming ? enrichOwnershipTransfer(incoming) : Promise.resolve(null),
    ]);
    setOutgoingTransfer(outgoingDetails);
    setIncomingTransfer(incomingDetails);
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadTransfers();
    }, [loadTransfers]),
  );

  useEffect(() => {
    if (isOwner && organization && user) {
      listTransferableMembers(organization.id, user.id).then(setTransferMembers);
    }
  }, [isOwner, organization, user]);

  async function handleInitiateTransfer() {
    if (!selectedMemberId) return;
    setTransferSaving(true);
    setTransferError(null);
    const { error } = await initiateOwnershipTransfer(selectedMemberId);
    setTransferSaving(false);
    if (error) {
      setTransferError(error);
      return;
    }
    setTransferSentName(transferMembers.find((m) => m.userId === selectedMemberId)?.fullName ?? null);
    setSelectedMemberId(null);
    await loadTransfers();
  }

  async function handleCancelTransfer(id: string) {
    setTransferSaving(true);
    setTransferError(null);
    const { error } = await cancelOwnershipTransfer(id);
    setTransferSaving(false);
    if (error) {
      setTransferError(error);
      return;
    }
    setTransferSentName(null);
    await loadTransfers();
  }

  async function handleAcceptIncoming() {
    if (!incomingTransfer) return;
    setTransferSaving(true);
    setTransferError(null);
    const { error } = await confirmOwnershipTransfer(incomingTransfer.token);
    setTransferSaving(false);
    if (error) {
      setTransferError(error);
      return;
    }
    await refreshOrganization();
    await loadTransfers();
  }

  async function handleDeclineIncoming() {
    if (!incomingTransfer) return;
    setTransferSaving(true);
    setTransferError(null);
    const { error } = await cancelOwnershipTransfer(incomingTransfer.id);
    setTransferSaving(false);
    if (error) {
      setTransferError(error);
      return;
    }
    await loadTransfers();
  }

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

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl * 2 }}>
        <Container>
          <PageHeader title={t('compteMenu.entrepriseDanger.label')} backTo="/(app)/compte/entreprise" />
          <Text style={styles.intro}>{t('dangerZone.intro')}</Text>

          {incomingTransfer ? (
            <Card style={styles.transferAcceptCard}>
              <Text style={styles.transferAcceptTitle}>
                {t('ownershipTransfer.pendingIncomingTitle', { org: incomingTransfer.organizationName })}
              </Text>
              <Text style={styles.cardText}>
                {t('ownershipTransfer.pendingIncomingText', { from: incomingTransfer.fromName, org: incomingTransfer.organizationName })}
              </Text>
              {transferError ? <Text style={styles.error}>{transferError}</Text> : null}
              <Button title={t('ownershipTransfer.acceptButton')} onPress={handleAcceptIncoming} loading={transferSaving} style={{ marginTop: spacing.sm }} />
              <Button
                title={t('ownershipTransfer.declineButton')}
                variant="secondary"
                onPress={handleDeclineIncoming}
                disabled={transferSaving}
                style={{ marginTop: spacing.xs }}
              />
            </Card>
          ) : null}

          {isOwner && organization ? (
            <Card style={styles.card}>
              <Text style={styles.cardTitle}>{t('ownershipTransfer.title')}</Text>
              <Text style={styles.cardText}>{t('ownershipTransfer.intro')}</Text>

              {outgoingTransfer ? (
                <>
                  <View style={styles.transferPendingBox}>
                    <Feather name="clock" size={14} color={colors.textMuted} />
                    <Text style={styles.transferPendingText}>
                      {t('ownershipTransfer.pendingOutgoingText', {
                        name: outgoingTransfer.toName,
                        date: new Date(outgoingTransfer.createdAt).toLocaleDateString(),
                      })}
                    </Text>
                  </View>
                  {transferError ? <Text style={styles.error}>{transferError}</Text> : null}
                  <Button
                    title={t('ownershipTransfer.cancelTransferButton')}
                    variant="secondary"
                    onPress={() => handleCancelTransfer(outgoingTransfer.id)}
                    loading={transferSaving}
                  />
                </>
              ) : transferSentName ? (
                <View style={styles.transferPendingBox}>
                  <Feather name="mail" size={14} color={colors.primary} />
                  <Text style={styles.transferPendingText}>{t('ownershipTransfer.transferSentText', { name: transferSentName })}</Text>
                </View>
              ) : transferMembers.length === 0 ? (
                <Text style={styles.cardText}>{t('ownershipTransfer.noEligibleMembers')}</Text>
              ) : (
                <>
                  <Text style={styles.fieldLabel}>{t('ownershipTransfer.pickMemberLabel')}</Text>
                  <View style={styles.chips}>
                    {transferMembers.map((m) => (
                      <Pressable
                        key={m.userId}
                        onPress={() => setSelectedMemberId(m.userId)}
                        style={[styles.chip, selectedMemberId === m.userId && styles.chipActive]}
                      >
                        <Text style={[styles.chipText, selectedMemberId === m.userId && styles.chipTextActive]}>{m.fullName}</Text>
                      </Pressable>
                    ))}
                  </View>
                  {selectedMemberId ? (
                    <>
                      <Text style={styles.transferPrompt}>
                        {t('ownershipTransfer.confirmPrompt', { name: transferMembers.find((m) => m.userId === selectedMemberId)?.fullName })}
                      </Text>
                      {transferError ? <Text style={styles.error}>{transferError}</Text> : null}
                      <Button title={t('ownershipTransfer.transferButton')} onPress={handleInitiateTransfer} loading={transferSaving} style={{ marginTop: spacing.sm }} />
                      <Button
                        title={t('ownershipTransfer.cancelPick')}
                        variant="secondary"
                        onPress={() => setSelectedMemberId(null)}
                        disabled={transferSaving}
                        style={{ marginTop: spacing.xs }}
                      />
                    </>
                  ) : null}
                </>
              )}
            </Card>
          ) : null}

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
  transferAcceptCard: {
    borderColor: colors.primary,
    borderWidth: 1,
    backgroundColor: colors.primarySoft,
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  transferAcceptTitle: {
    fontSize: fontSize.md,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  transferPendingBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  transferPendingText: {
    flex: 1,
    fontSize: fontSize.xs,
    color: colors.text,
    lineHeight: 17,
  },
  transferPrompt: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: spacing.sm,
    lineHeight: 17,
  },
  fieldLabel: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
    fontWeight: '500',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: fontSize.sm,
    color: colors.text,
  },
  chipTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
});
