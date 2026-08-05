import { useCallback, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../../lib/auth-context';
import { supabase } from '../../../lib/supabase';
import { formatBytes } from '../../../lib/api/storage';
import { Button, Card, Container, Screen } from '../../../components/ui';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';

type IconName = keyof typeof Feather.glyphMap;

interface MenuItem {
  key: string;
  icon: IconName;
  title: string;
  subtitle: string;
  route: string;
}

export default function CompteMenuScreen() {
  const { organization, refreshOrganization, signOut } = useAuth();
  const router = useRouter();
  const [memberCount, setMemberCount] = useState<number | null>(null);
  const [planName, setPlanName] = useState<string | null>(null);
  const [quotaBytes, setQuotaBytes] = useState(0);
  const [usedBytes, setUsedBytes] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!organization) return;
    const [{ count }, { data: plan }, { data: used }] = await Promise.all([
      supabase.from('organization_members').select('id', { count: 'exact', head: true }).eq('organization_id', organization.id),
      supabase.from('plans').select('name, storage_quota_mb').eq('id', organization.plan_id).maybeSingle(),
      supabase.rpc('get_storage_usage_bytes', { org_id: organization.id }),
    ]);
    setMemberCount(count ?? null);
    setPlanName(plan?.name ?? null);
    setQuotaBytes((plan?.storage_quota_mb ?? 0) * 1024 * 1024);
    setUsedBytes(used ?? 0);
  }, [organization]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function handleRefresh() {
    setRefreshing(true);
    await Promise.all([load(), refreshOrganization()]);
    setRefreshing(false);
  }

  const items: MenuItem[] = [
    {
      key: 'profil',
      icon: 'user',
      title: 'Mon profil',
      subtitle: 'Photo, nom affiché, langue',
      route: '/(app)/compte/profil',
    },
    {
      key: 'entreprise',
      icon: 'briefcase',
      title: 'Profil entreprise',
      subtitle: organization?.name ?? '—',
      route: '/(app)/compte/entreprise',
    },
    {
      key: 'devis',
      icon: 'file-text',
      title: 'Devis & factures',
      subtitle: 'TVA, conditions, validité',
      route: '/(app)/compte/devis',
    },
    {
      key: 'modules',
      icon: 'sliders',
      title: 'Outils & modules',
      subtitle: 'Activez ce dont vous avez besoin',
      route: '/(app)/compte/modules',
    },
    {
      key: 'facturation',
      icon: 'credit-card',
      title: 'Facturation',
      subtitle: planName ? `Plan ${planName}` : '—',
      route: '/(app)/compte/facturation',
    },
    {
      key: 'equipe',
      icon: 'users',
      title: 'Équipe',
      subtitle: memberCount != null ? `${memberCount} membre${memberCount > 1 ? 's' : ''}` : '—',
      route: '/(app)/compte/equipe',
    },
  ];

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl * 2 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />}
      >
        <Container>
          <Text style={styles.pageTitle}>Paramètres</Text>

          <StorageBar planName={planName} usedBytes={usedBytes} quotaBytes={quotaBytes} />

          <Card style={styles.menuCard}>
            {items.map((item, i) => (
              <Pressable
                key={item.key}
                onPress={() => router.push(item.route as any)}
                style={[styles.row, i < items.length - 1 && styles.rowBorder]}
              >
                <View style={styles.rowIcon}>
                  <Feather name={item.icon} size={17} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowTitle}>{item.title}</Text>
                  <Text style={styles.rowSubtitle}>{item.subtitle}</Text>
                </View>
                <Feather name="chevron-right" size={18} color={colors.textMuted} />
              </Pressable>
            ))}
          </Card>

          <Button title="Se déconnecter" icon="log-out" variant="secondary" onPress={signOut} style={{ marginTop: spacing.xl }} />
        </Container>
      </ScrollView>
    </Screen>
  );
}

function StorageBar({ planName, usedBytes, quotaBytes }: { planName: string | null; usedBytes: number; quotaBytes: number }) {
  const router = useRouter();
  const ratio = quotaBytes > 0 ? Math.min(usedBytes / quotaBytes, 1) : 0;
  const nearLimit = ratio >= 0.9;

  return (
    <Pressable onPress={() => router.push('/(app)/compte/stockage')}>
      <Card style={styles.storageCard}>
        <View style={styles.storageHeader}>
          <Text style={styles.storageTitle}>Stockage{planName ? ` · Plan ${planName}` : ''}</Text>
          <Feather name="chevron-right" size={16} color={colors.textMuted} />
        </View>
        <View style={styles.usageBarTrack}>
          <View style={[styles.usageBarFill, { width: `${ratio * 100}%` }, nearLimit && styles.usageBarFillDanger]} />
        </View>
        <Text style={[styles.storageText, nearLimit && styles.storageTextDanger]}>
          {formatBytes(usedBytes)} utilisés sur {quotaBytes > 0 ? formatBytes(quotaBytes) : '—'}
        </Text>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  storageCard: {
    marginBottom: spacing.lg,
  },
  storageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  storageTitle: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
  },
  usageBarTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  usageBarFill: {
    height: 8,
    backgroundColor: colors.primary,
  },
  usageBarFillDanger: {
    backgroundColor: colors.danger,
  },
  storageText: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  storageTextDanger: {
    color: colors.danger,
    fontWeight: '600',
  },
  pageTitle: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.lg,
  },
  menuCard: {
    padding: 0,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  rowSubtitle: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
});
