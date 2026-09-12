import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../../../lib/auth-context';
import { supabase } from '../../../../lib/supabase';
import { createGhostEmployee, listGhostEmployees } from '../../../../lib/api/payroll';
import { Button, Card, EmptyState, LoadingScreen, PageHeader, Screen } from '../../../../components/ui';
import { useTranslation } from '../../../../lib/translations';
import { colors, fontSize, radius, spacing } from '../../../../lib/theme';

interface MemberItem {
  id: string;
  label: string;
  kind: 'user' | 'ghost';
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function PayrollEmployeesScreen() {
  const { t } = useTranslation();
  const { organization, user, canManagePayroll } = useAuth();
  const router = useRouter();

  const [members, setMembers] = useState<MemberItem[]>([]);
  const [ghosts, setGhosts] = useState<MemberItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingGhost, setAddingGhost] = useState(false);
  const [ghostName, setGhostName] = useState('');
  const [savingGhost, setSavingGhost] = useState(false);

  const load = useCallback(async () => {
    if (!organization) return;
    setLoading(true);
    const [{ data: memberRows }, ghostRows] = await Promise.all([
      supabase.from('organization_members').select('user_id, full_name').eq('organization_id', organization.id),
      listGhostEmployees(organization.id),
    ]);
    setMembers((memberRows ?? []).map((m): MemberItem => ({ id: m.user_id, label: m.full_name || t('payrollHub.memberFallback'), kind: 'user' })));
    setGhosts(ghostRows.map((g): MemberItem => ({ id: g.id, label: g.full_name, kind: 'ghost' })));
    setLoading(false);
  }, [organization]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function handleCreateGhost() {
    if (!organization || !user || !ghostName.trim()) return;
    setSavingGhost(true);
    const { id, error } = await createGhostEmployee(organization.id, ghostName, user.id);
    setSavingGhost(false);
    if (error || !id) return;
    setGhostName('');
    setAddingGhost(false);
    await load();
    router.push({ pathname: '/(app)/rh/[userId]', params: { userId: id, kind: 'ghost' } });
  }

  if (!organization || loading) return <LoadingScreen />;

  if (!canManagePayroll) {
    return (
      <Screen>
        <ScrollView contentContainerStyle={{ padding: spacing.xl }}>
          <PageHeader title={t('payrollSalariesHub.employeesTitle')} backTo="/(app)/rh" />
          <Card><EmptyState title={t('payrollSalariesHub.employeesTitle')} subtitle={t('payrollHub.selfSubtitle')} /></Card>
        </ScrollView>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: spacing.xl, paddingBottom: spacing.xxl * 2 }}>
        <PageHeader title={t('payrollSalariesHub.employeesTitle')} backTo="/(app)/rh/salaires" />
        <Text style={styles.subtitle}>{t('payrollSalariesHub.employeesSubtitle')}</Text>

        {members.length === 0 && ghosts.length === 0 ? (
          <Card><EmptyState title={t('payrollSalariesHub.emptyTitle')} subtitle={t('payrollSalariesHub.emptySubtitle')} /></Card>
        ) : (
          <Card>
            <Text style={styles.sectionTitle}>{t('payrollHub.teamTitle')}</Text>
            <View style={{ gap: 2 }}>
              {members.map((m) => (
                <Pressable
                  key={m.id}
                  onPress={() => router.push({ pathname: '/(app)/rh/[userId]', params: { userId: m.id } })}
                  style={({ pressed }) => [styles.memberRow, pressed && styles.memberRowPressed]}
                >
                  <View style={styles.memberAvatar}>
                    <Text style={styles.memberAvatarText}>{initials(m.label)}</Text>
                  </View>
                  <Text style={styles.memberName} numberOfLines={1}>
                    {m.id === user?.id ? t('payrollHub.meSuffix', { name: m.label }) : m.label}
                  </Text>
                  <Feather name="chevron-right" size={16} color={colors.textMuted} />
                </Pressable>
              ))}
            </View>
          </Card>
        )}

        <Card style={{ marginTop: spacing.lg }}>
          <View style={styles.ghostHeader}>
            <Text style={styles.sectionTitle}>{t('payrollSalariesHub.ghostSectionTitle')}</Text>
            <Pressable onPress={() => setAddingGhost((v) => !v)} hitSlop={8}>
              <Feather name={addingGhost ? 'x' : 'user-plus'} size={17} color={colors.primary} />
            </Pressable>
          </View>
          {addingGhost ? (
            <View style={styles.addGhostRow}>
              <TextInput
                style={styles.addGhostInput}
                value={ghostName}
                onChangeText={setGhostName}
                placeholder={t('payrollHub.ghostNamePlaceholder')}
                placeholderTextColor={colors.textMuted}
                autoFocus
              />
              <Button title={t('payrollSalariesHub.addGhost')} onPress={handleCreateGhost} loading={savingGhost} disabled={!ghostName.trim()} />
            </View>
          ) : null}
          {ghosts.length === 0 ? (
            <Text style={styles.hint}>{t('payrollSalariesHub.emptySubtitle')}</Text>
          ) : (
            <View style={{ gap: 2 }}>
              {ghosts.map((g) => (
                <Pressable
                  key={g.id}
                  onPress={() => router.push({ pathname: '/(app)/rh/[userId]', params: { userId: g.id, kind: 'ghost' } })}
                  style={({ pressed }) => [styles.memberRow, pressed && styles.memberRowPressed]}
                >
                  <View style={styles.memberAvatar}>
                    <Feather name="user-x" size={12} color={colors.primary} />
                  </View>
                  <Text style={styles.memberName} numberOfLines={1}>{g.label}</Text>
                  <Feather name="chevron-right" size={16} color={colors.textMuted} />
                </Pressable>
              ))}
            </View>
          )}
        </Card>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  subtitle: { fontSize: fontSize.sm, color: colors.textMuted, lineHeight: 19, marginBottom: spacing.xl },
  sectionTitle: { fontSize: fontSize.md, fontWeight: '800', color: colors.text, marginBottom: spacing.sm },
  ghostHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
  hint: { fontSize: fontSize.xs, color: colors.textMuted, lineHeight: 17 },
  addGhostRow: { flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.md },
  addGhostInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    fontSize: fontSize.sm,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.md,
  },
  memberRowPressed: {
    backgroundColor: colors.surfaceAlt,
  },
  memberAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  memberAvatarText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
  },
  memberName: {
    flex: 1,
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
  },
});
