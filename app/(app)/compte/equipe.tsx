import { useCallback, useMemo, useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
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
import {
  assignMemberRole,
  createOrgRole,
  deleteOrgRole,
  listOrgRoles,
  updateOrgRole,
  type RolePermissions,
} from '../../../lib/api/roles';
import { Button, Card, Container, Field, PageHeader, Screen, Switch } from '../../../components/ui';
import { SettingsTabs } from '../../../components/SettingsTabs';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';
import { confirm } from '../../../lib/confirm';
import { isOnline } from '../../../lib/presence';
import type { OrganizationInvite, OrganizationRole, OrgRole, OrganizationMember } from '../../../lib/types';

// Fixed pills for the two structural roles — always full access, never
// editable/deletable, so they need to read as visually distinct from the
// custom roles admins create below (which are meaningful only for 'member'
// rows). Custom roles pick from ROLE_COLORS instead.
const OWNER_PILL = { bg: '#F3E8D6', fg: '#9C6510' };
const ADMIN_PILL = { bg: colors.primarySoft, fg: colors.primary };
const NO_ROLE_PILL = { bg: colors.surfaceAlt, fg: colors.textMuted };

// A curated, muted palette in the same family as the app's own brand
// tokens (terracotta/clay/olive/slate) rather than saturated Discord-style
// primaries — enough hues to tell roles apart at a glance without any of
// them reading as louder than the product's own accent color.
const ROLE_COLORS = ['#BC5A31', '#2E6B4F', '#3F5D7D', '#9C6510', '#7C3B21', '#6B4E8E', '#5C7A5C', '#AB3327'];

type IconName = keyof typeof Feather.glyphMap;

// One checkbox per real, cleanly-isolated feature area — see
// 20260812160000_role_permission_catalog.sql for why "Photos" isn't in
// this list (same underlying data as the always-open Rapports tab).
// Finance is opt-in-only for a member with no role (default false); the
// other four default true so creating a role only needs to uncheck what
// should be restricted, not re-grant everything else.
const PERMISSION_CATALOG: { key: keyof RolePermissions; icon: IconName; label: string; description: string }[] = [
  { key: 'canViewFinances', icon: 'file-text', label: 'Finance', description: 'Devis, factures et rentabilité par chantier.' },
  { key: 'canViewSurvey', icon: 'crosshair', label: 'Levés', description: 'Points de chantier et cadastre suisse.' },
  { key: 'canViewMetre', icon: 'list', label: 'Métré', description: 'Tableau de quantités poste par poste.' },
  { key: 'canViewPlanning', icon: 'calendar', label: 'Planning', description: "Qui va sur quel chantier, et quand." },
  { key: 'canViewDocuments', icon: 'folder', label: 'Documents', description: 'Classeur de dossiers et fichiers par chantier.' },
];

interface RoleDraft {
  id: string | null;
  name: string;
  color: string;
  permissions: RolePermissions;
}

const EMPTY_DRAFT: RoleDraft = {
  id: null,
  name: '',
  color: ROLE_COLORS[0],
  permissions: { canViewFinances: false, canViewSurvey: true, canViewMetre: true, canViewPlanning: true, canViewDocuments: true },
};

export default function EquipeScreen() {
  const { organization, role, user } = useAuth();
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [roles, setRoles] = useState<OrganizationRole[]>([]);
  const [invites, setInvites] = useState<OrganizationInvite[]>([]);
  const [joinRequests, setJoinRequests] = useState<PendingJoinRequest[]>([]);
  const [maxMembers, setMaxMembers] = useState<number | null>(null);
  const [inviting, setInviting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [roleDraft, setRoleDraft] = useState<RoleDraft | null>(null);
  const [roleDraftError, setRoleDraftError] = useState<string | null>(null);
  const [savingRole, setSavingRole] = useState(false);
  const [assigningMember, setAssigningMember] = useState<OrganizationMember | null>(null);
  const isAdmin = role === 'owner' || role === 'admin';
  const atCapacity = maxMembers != null && members.length >= maxMembers;

  const load = useCallback(async () => {
    if (!organization) return;
    const [{ data: memberRows }, { data: planRow }, roleRows, inviteRows, requestRows] = await Promise.all([
      supabase.from('organization_members').select('*').eq('organization_id', organization.id).order('created_at'),
      supabase.from('plans').select('max_members').eq('id', organization.plan_id).maybeSingle(),
      listOrgRoles(organization.id),
      listActiveInvites(organization.id),
      isAdmin ? listPendingRequestsForOrg(organization.id) : Promise.resolve([]),
    ]);
    setMembers(memberRows ?? []);
    setRoles(roleRows);
    setMaxMembers(planRow?.max_members ?? null);
    setInvites(inviteRows);
    setJoinRequests(requestRows);
  }, [organization, isAdmin]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const rolesById = useMemo(() => new Map(roles.map((r) => [r.id, r])), [roles]);
  const memberCountByRole = useMemo(() => {
    const counts = new Map<string, number>();
    for (const m of members) {
      if (m.role_id) counts.set(m.role_id, (counts.get(m.role_id) ?? 0) + 1);
    }
    return counts;
  }, [members]);

  function pillFor(member: OrganizationMember): { bg: string; fg: string; label: string } {
    if (member.role === 'owner') return { ...OWNER_PILL, label: 'Propriétaire' };
    if (member.role === 'admin') return { ...ADMIN_PILL, label: 'Administrateur' };
    const custom = member.role_id ? rolesById.get(member.role_id) : null;
    if (custom) return { bg: `${custom.color}22`, fg: custom.color, label: custom.name };
    return { ...NO_ROLE_PILL, label: 'Membre' };
  }

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

  async function saveRoleDraft() {
    if (!organization || !roleDraft) return;
    const name = roleDraft.name.trim();
    if (!name) {
      setRoleDraftError('Donnez un nom à ce rôle.');
      return;
    }
    setSavingRole(true);
    setRoleDraftError(null);
    const { error } = roleDraft.id
      ? await updateOrgRole(roleDraft.id, name, roleDraft.color, roleDraft.permissions)
      : await createOrgRole(organization.id, name, roleDraft.color, roleDraft.permissions);
    setSavingRole(false);
    if (error) {
      setRoleDraftError(error.includes('duplicate') ? 'Un rôle porte déjà ce nom.' : error);
      return;
    }
    setRoleDraft(null);
    load();
  }

  async function handleDeleteRole() {
    if (!roleDraft?.id) return;
    const count = memberCountByRole.get(roleDraft.id) ?? 0;
    const ok = await confirm(
      'Supprimer ce rôle ?',
      count > 0
        ? `${count} membre${count > 1 ? 's' : ''} retrouve${count > 1 ? 'nt' : ''} le statut "Membre" sans accès particulier.`
        : 'Cette action est définitive.',
    );
    if (!ok) return;
    setSavingRole(true);
    await deleteOrgRole(roleDraft.id);
    setSavingRole(false);
    setRoleDraft(null);
    load();
  }

  async function handleAssignRole(roleId: string | null) {
    if (!assigningMember) return;
    await assignMemberRole(assigningMember.id, roleId);
    setAssigningMember(null);
    load();
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl * 2 }}>
        <Container>
          <PageHeader title="Équipe" backTo="/(app)" />
          <SettingsTabs />

          {isAdmin && joinRequests.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Demandes d'adhésion</Text>
              {requestError ? <Text style={styles.error}>{requestError}</Text> : null}
              {joinRequests.map((r) => (
                <Card key={r.id} style={styles.requestCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.memberName}>{r.requester_name || r.requester_email}</Text>
                    <Text style={styles.memberMeta}>{r.requester_email}</Text>
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
            <View style={styles.section}>
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

          {isAdmin ? (
            <View style={styles.section}>
              <View style={styles.rolesHeaderRow}>
                <Text style={styles.sectionTitle}>Rôles</Text>
                <Text style={styles.rolesHint}>Donnez à certains membres l'accès aux devis & factures.</Text>
              </View>
              <View style={styles.roleChipRow}>
                {roles.map((r) => (
                  <Pressable
                    key={r.id}
                    style={[styles.roleChip, { backgroundColor: `${r.color}22`, borderColor: `${r.color}55` }]}
                    onPress={() =>
                      setRoleDraft({
                        id: r.id,
                        name: r.name,
                        color: r.color,
                        permissions: {
                          canViewFinances: r.can_view_finances,
                          canViewSurvey: r.can_view_survey,
                          canViewMetre: r.can_view_metre,
                          canViewPlanning: r.can_view_planning,
                          canViewDocuments: r.can_view_documents,
                        },
                      })
                    }
                  >
                    <View style={[styles.roleChipDot, { backgroundColor: r.color }]} />
                    <Text style={[styles.roleChipText, { color: r.color }]}>{r.name}</Text>
                    <Text style={[styles.roleChipCount, { color: r.color }]}>
                      {memberCountByRole.get(r.id) ?? 0}
                    </Text>
                  </Pressable>
                ))}
                <Pressable style={styles.roleChipNew} onPress={() => setRoleDraft(EMPTY_DRAFT)}>
                  <Feather name="plus" size={13} color={colors.textMuted} />
                  <Text style={styles.roleChipNewText}>Nouveau rôle</Text>
                </Pressable>
              </View>
            </View>
          ) : null}

          <View style={styles.section}>
            {members.map((m) => {
              const pill = pillFor(m);
              const assignable = isAdmin && m.role === 'member';
              return (
                <Card key={m.id} style={styles.memberRow}>
                  <View style={styles.memberIdentity}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>{(m.full_name || '?').trim().slice(0, 1).toUpperCase()}</Text>
                      <View style={[styles.presenceDot, isOnline(m.last_seen_at) && styles.presenceDotOnline]} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.memberName}>{m.full_name || 'Membre'}</Text>
                      <Text style={styles.memberMeta}>{isOnline(m.last_seen_at) ? 'En ligne' : 'Hors ligne'}</Text>
                    </View>
                  </View>

                  <View style={styles.memberRight}>
                    <Pressable
                      style={[styles.rolePill, { backgroundColor: pill.bg }, assignable && styles.rolePillTappable]}
                      onPress={() => (assignable ? setAssigningMember(m) : undefined)}
                    >
                      <Text style={[styles.rolePillText, { color: pill.fg }]}>{pill.label}</Text>
                      {assignable ? <Feather name="chevron-down" size={12} color={pill.fg} /> : null}
                    </Pressable>

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
                  </View>
                </Card>
              );
            })}
          </View>
        </Container>
      </ScrollView>

      {/* Assign a custom role (or none) to one standard member. */}
      <Modal visible={!!assigningMember} animationType="slide" transparent onRequestClose={() => setAssigningMember(null)}>
        <View style={styles.sheetOverlay}>
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Rôle de {assigningMember?.full_name || 'ce membre'}</Text>
              <Pressable onPress={() => setAssigningMember(null)} hitSlop={10}>
                <Feather name="x" size={22} color={colors.text} />
              </Pressable>
            </View>
            <Pressable style={styles.roleOption} onPress={() => handleAssignRole(null)}>
              <View style={[styles.roleChipDot, { backgroundColor: colors.textMuted }]} />
              <Text style={styles.roleOptionText}>Aucun rôle (Membre)</Text>
              {!assigningMember?.role_id ? <Feather name="check" size={16} color={colors.primary} /> : null}
            </Pressable>
            {roles.map((r) => (
              <Pressable key={r.id} style={styles.roleOption} onPress={() => handleAssignRole(r.id)}>
                <View style={[styles.roleChipDot, { backgroundColor: r.color }]} />
                <Text style={styles.roleOptionText}>{r.name}</Text>
                {assigningMember?.role_id === r.id ? <Feather name="check" size={16} color={colors.primary} /> : null}
              </Pressable>
            ))}
            {roles.length === 0 ? (
              <Text style={styles.rolesHint}>Créez un rôle depuis la section "Rôles" pour pouvoir l'assigner ici.</Text>
            ) : null}
          </View>
        </View>
      </Modal>

      {/* Create/edit a role — name, color, and its permission(s). */}
      <Modal visible={!!roleDraft} animationType="slide" transparent onRequestClose={() => setRoleDraft(null)}>
        <View style={styles.sheetOverlay}>
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{roleDraft?.id ? 'Modifier le rôle' : 'Nouveau rôle'}</Text>
              <Pressable onPress={() => setRoleDraft(null)} hitSlop={10}>
                <Feather name="x" size={22} color={colors.text} />
              </Pressable>
            </View>

            <Field
              label="Nom"
              value={roleDraft?.name ?? ''}
              onChangeText={(v) => setRoleDraft((d) => (d ? { ...d, name: v } : d))}
              placeholder="Secrétaire, Finance…"
            />

            <Text style={styles.fieldLabel}>Couleur</Text>
            <View style={styles.colorRow}>
              {ROLE_COLORS.map((c) => (
                <Pressable
                  key={c}
                  style={[styles.colorSwatch, { backgroundColor: c }, roleDraft?.color === c && styles.colorSwatchActive]}
                  onPress={() => setRoleDraft((d) => (d ? { ...d, color: c } : d))}
                >
                  {roleDraft?.color === c ? <Feather name="check" size={14} color="#fff" /> : null}
                </Pressable>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Accès</Text>
            <View style={{ gap: spacing.sm }}>
              {PERMISSION_CATALOG.map((p) => (
                <View key={p.key} style={styles.permissionRow}>
                  <Feather name={p.icon} size={15} color={colors.textMuted} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.permissionTitle}>{p.label}</Text>
                    <Text style={styles.permissionSubtitle}>{p.description}</Text>
                  </View>
                  <Switch
                    value={roleDraft?.permissions[p.key] ?? false}
                    onChange={(v) =>
                      setRoleDraft((d) => (d ? { ...d, permissions: { ...d.permissions, [p.key]: v } } : d))
                    }
                  />
                </View>
              ))}
            </View>

            {roleDraftError ? <Text style={styles.error}>{roleDraftError}</Text> : null}

            <View style={styles.sheetActions}>
              {roleDraft?.id ? (
                <Button title="Supprimer" variant="danger" onPress={handleDeleteRole} disabled={savingRole} style={{ flex: 1 }} />
              ) : null}
              <Button title="Enregistrer" onPress={saveRoleDraft} loading={savingRole} style={{ flex: 1 }} />
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: {
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
  rolesHeaderRow: {
    gap: 2,
  },
  rolesHint: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  roleChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  roleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  roleChipDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  roleChipText: {
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  roleChipCount: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    opacity: 0.65,
  },
  roleChipNew: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  roleChipNewText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textMuted,
  },
  memberRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  memberIdentity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexShrink: 1,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: fontSize.sm,
    fontWeight: '800',
    color: colors.primary,
  },
  presenceDot: {
    position: 'absolute',
    right: -1,
    bottom: -1,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.border,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  presenceDotOnline: {
    backgroundColor: colors.success,
  },
  memberName: {
    fontSize: fontSize.md,
    color: colors.text,
    fontWeight: '600',
  },
  memberMeta: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  memberRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  rolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  rolePillTappable: {
    // Purely a hit-target/affordance cue — the chevron icon already signals
    // it's interactive, this just keeps tappable pills a hair taller.
    paddingVertical: 7,
  },
  rolePillText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
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
  sheetOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.sm,
    maxWidth: 560,
    width: '100%',
    alignSelf: 'center',
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sheetTitle: {
    fontSize: fontSize.lg,
    fontWeight: '800',
    color: colors.text,
  },
  sheetActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  roleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  roleOptionText: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
  },
  fieldLabel: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.sm,
  },
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  colorSwatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorSwatchActive: {
    borderWidth: 2,
    borderColor: colors.text,
  },
  permissionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  permissionTitle: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
  },
  permissionSubtitle: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
});
