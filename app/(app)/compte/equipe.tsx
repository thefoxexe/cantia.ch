import { useCallback, useState } from 'react';
import { Platform, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../../lib/auth-context';
import { supabase } from '../../../lib/supabase';
import {
  createInvite,
  inviteUrl,
  listActiveInvites,
  listPendingRequestsForOrg,
  respondToJoinRequest,
  revokeInvite,
  type PendingJoinRequest,
} from '../../../lib/api/invites';
import { Button, Card, Container, PageHeader, Screen } from '../../../components/ui';
import { SettingsTabs } from '../../../components/SettingsTabs';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';
import { isOnline } from '../../../lib/presence';
import type { OrganizationInvite, OrgRole, OrganizationMember } from '../../../lib/types';

export default function EquipeScreen() {
  const { organization, role, user } = useAuth();
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [invites, setInvites] = useState<OrganizationInvite[]>([]);
  const [joinRequests, setJoinRequests] = useState<PendingJoinRequest[]>([]);
  const [maxMembers, setMaxMembers] = useState<number | null>(null);
  const [inviting, setInviting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);
  const isAdmin = role === 'owner' || role === 'admin';
  const atCapacity = maxMembers != null && members.length >= maxMembers;

  const load = useCallback(async () => {
    if (!organization) return;
    const [{ data: memberRows }, { data: planRow }, inviteRows, requestRows] = await Promise.all([
      supabase.from('organization_members').select('*').eq('organization_id', organization.id).order('created_at'),
      supabase.from('plans').select('max_members').eq('id', organization.plan_id).maybeSingle(),
      listActiveInvites(organization.id),
      isAdmin ? listPendingRequestsForOrg(organization.id) : Promise.resolve([]),
    ]);
    setMembers(memberRows ?? []);
    setMaxMembers(planRow?.max_members ?? null);
    setInvites(inviteRows);
    setJoinRequests(requestRows);
  }, [organization, isAdmin]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function toggleMemberRole(member: OrganizationMember) {
    if (!isAdmin || member.role === 'owner') return;
    const nextRole: OrgRole = member.role === 'admin' ? 'member' : 'admin';
    await supabase.from('organization_members').update({ role: nextRole }).eq('id', member.id);
    load();
  }

  async function removeMember(member: OrganizationMember) {
    if (!isAdmin || member.role === 'owner' || member.user_id === user?.id) return;
    await supabase.from('organization_members').delete().eq('id', member.id);
    load();
  }

  async function handleInvite() {
    if (!organization || !isAdmin || inviting || atCapacity) return;
    setInviting(true);
    await createInvite(organization.id, user?.id);
    setInviting(false);
    load();
  }

  async function handleRevoke(invite: OrganizationInvite) {
    await revokeInvite(invite.id);
    load();
  }

  async function handleRespond(request: PendingJoinRequest, approve: boolean) {
    setRequestError(null);
    setRespondingId(request.id);
    const { error } = await respondToJoinRequest(request.id, approve);
    setRespondingId(null);
    if (error) {
      setRequestError(error);
      return;
    }
    load();
  }

  async function handleShare(invite: OrganizationInvite) {
    const url = inviteUrl(invite.token);
    if (Platform.OS === 'web') {
      try {
        await navigator.clipboard.writeText(url);
        setCopiedId(invite.id);
        setTimeout(() => setCopiedId(null), 2000);
      } catch {
        // clipboard API unavailable — the link is still shown on screen to copy manually
      }
      return;
    }
    try {
      await Share.share({ message: url });
    } catch {
      // user dismissed the share sheet
    }
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl * 2 }}>
        <Container>
          <PageHeader title="Équipe" backTo="/(app)" />
          <SettingsTabs />

          {isAdmin && joinRequests.length > 0 ? (
            <View style={styles.inviteSection}>
              <Text style={styles.sectionTitle}>Demandes d'adhésion</Text>
              {requestError ? <Text style={styles.error}>{requestError}</Text> : null}
              {joinRequests.map((r) => (
                <Card key={r.id} style={styles.requestCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.memberName}>{r.requester_name || r.requester_email}</Text>
                    <Text style={styles.memberRole}>{r.requester_email}</Text>
                  </View>
                  <View style={styles.requestActions}>
                    <Pressable
                      style={[styles.requestButton, styles.requestButtonAccept]}
                      onPress={() => handleRespond(r, true)}
                      disabled={respondingId === r.id}
                    >
                      <Feather name="check" size={13} color={colors.success} />
                      <Text style={[styles.requestButtonText, { color: colors.success }]}>Accepter</Text>
                    </Pressable>
                    <Pressable
                      style={[styles.requestButton, styles.requestButtonReject]}
                      onPress={() => handleRespond(r, false)}
                      disabled={respondingId === r.id}
                    >
                      <Feather name="x" size={13} color={colors.danger} />
                      <Text style={[styles.requestButtonText, { color: colors.danger }]}>Refuser</Text>
                    </Pressable>
                  </View>
                </Card>
              ))}
            </View>
          ) : null}

          {isAdmin ? (
            <View style={styles.inviteSection}>
              <Button
                title="Inviter un membre"
                icon="user-plus"
                variant="secondary"
                onPress={handleInvite}
                loading={inviting}
                disabled={atCapacity}
              />
              {atCapacity ? (
                <Text style={styles.capacityHint}>
                  Votre plan est limité à {maxMembers} membre{maxMembers && maxMembers > 1 ? 's' : ''}. Passez à un
                  plan supérieur pour inviter plus de monde.
                </Text>
              ) : null}

              {invites.map((invite) => (
                <Card key={invite.id} style={styles.inviteCard}>
                  <Text style={styles.inviteLink} numberOfLines={1}>
                    {inviteUrl(invite.token)}
                  </Text>
                  <Text style={styles.inviteMeta}>
                    Expire le {new Date(invite.expires_at).toLocaleDateString('fr-CH')}
                  </Text>
                  <View style={styles.inviteActions}>
                    <Pressable style={styles.inviteActionButton} onPress={() => handleShare(invite)}>
                      <Feather name={Platform.OS === 'web' ? 'copy' : 'share'} size={13} color={colors.primary} />
                      <Text style={styles.inviteActionText}>
                        {copiedId === invite.id ? 'Copié !' : Platform.OS === 'web' ? 'Copier le lien' : 'Partager'}
                      </Text>
                    </Pressable>
                    <Pressable style={styles.inviteActionButton} onPress={() => handleRevoke(invite)}>
                      <Feather name="x" size={13} color={colors.danger} />
                      <Text style={[styles.inviteActionText, { color: colors.danger }]}>Révoquer</Text>
                    </Pressable>
                  </View>
                </Card>
              ))}
            </View>
          ) : null}

          {members.map((m) => (
            <Card key={m.id} style={styles.memberRow}>
              <View style={{ flex: 1 }}>
                <View style={styles.memberNameRow}>
                  <View style={[styles.presenceDot, isOnline(m.last_seen_at) && styles.presenceDotOnline]} />
                  <Text style={styles.memberName}>{m.full_name || 'Membre'}</Text>
                </View>
                <Text style={styles.memberRole}>
                  {m.role === 'owner' ? 'Propriétaire' : m.role === 'admin' ? 'Administrateur' : 'Membre'}
                  {isOnline(m.last_seen_at) ? ' · En ligne' : ''}
                </Text>
              </View>
              {isAdmin && m.role !== 'owner' ? (
                <View style={styles.memberActions}>
                  <Pressable style={styles.memberActionButton} onPress={() => toggleMemberRole(m)}>
                    <Text style={styles.memberActionText}>{m.role === 'admin' ? 'Rétrograder' : 'Promouvoir'}</Text>
                  </Pressable>
                  {m.user_id !== user?.id ? (
                    <Pressable hitSlop={8} onPress={() => removeMember(m)}>
                      <Feather name="user-x" size={16} color={colors.danger} />
                    </Pressable>
                  ) : null}
                </View>
              ) : null}
            </Card>
          ))}
        </Container>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  inviteSection: {
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  requestCard: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  requestActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  requestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  requestButtonAccept: {
    borderColor: colors.successSoft,
    backgroundColor: colors.successSoft,
  },
  requestButtonReject: {
    borderColor: colors.dangerSoft,
    backgroundColor: colors.dangerSoft,
  },
  requestButtonText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  error: {
    color: colors.danger,
    fontSize: fontSize.sm,
  },
  capacityHint: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  inviteCard: {
    gap: 2,
  },
  inviteLink: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
  },
  inviteMeta: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  inviteActions: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginTop: spacing.sm,
  },
  inviteActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  inviteActionText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.primary,
  },
  memberRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  memberNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  presenceDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  presenceDotOnline: {
    backgroundColor: colors.success,
  },
  memberName: {
    fontSize: fontSize.md,
    color: colors.text,
    fontWeight: '600',
  },
  memberRole: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  memberActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  memberActionButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  memberActionText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.text,
  },
});
