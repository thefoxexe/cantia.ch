import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../../lib/auth-context';
import { supabase } from '../../../lib/supabase';
import { Card, Container, Screen } from '../../../components/ui';
import { SettingsHeader } from '../../../components/SettingsHeader';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';
import type { OrgRole, OrganizationMember } from '../../../lib/types';

export default function EquipeScreen() {
  const { organization, role, user } = useAuth();
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const isAdmin = role === 'owner' || role === 'admin';

  const load = useCallback(async () => {
    if (!organization) return;
    const { data } = await supabase
      .from('organization_members')
      .select('*')
      .eq('organization_id', organization.id)
      .order('created_at');
    setMembers(data ?? []);
  }, [organization]);

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

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl * 2 }}>
        <Container>
          <SettingsHeader title="Équipe" />

          {members.map((m) => (
            <Card key={m.id} style={styles.memberRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.memberName}>{m.full_name || 'Membre'}</Text>
                <Text style={styles.memberRole}>
                  {m.role === 'owner' ? 'Propriétaire' : m.role === 'admin' ? 'Administrateur' : 'Membre'}
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
  memberRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
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
