import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../../lib/auth-context';
import { supabase } from '../../../lib/supabase';
import { formatBytes } from '../../../lib/api/storage';
import { Button, Card, Container, LoadingScreen, PageHeader, Screen } from '../../../components/ui';
import { SettingsTabs } from '../../../components/SettingsTabs';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';

type IconName = keyof typeof Feather.glyphMap;

const CATEGORY_META: Record<string, { label: string; icon: IconName }> = {
  photos: { label: 'Photos (fil & rapports)', icon: 'image' },
  rapports: { label: 'Rapports (PDF)', icon: 'clipboard' },
  devis_factures: { label: 'Devis & factures (PDF)', icon: 'file-text' },
  documents: { label: 'Documents de chantier', icon: 'folder' },
  exports: { label: 'Exports (levés)', icon: 'map-pin' },
  marque: { label: 'Marque & profils', icon: 'briefcase' },
  autre: { label: 'Autre', icon: 'more-horizontal' },
};

const CATEGORY_ORDER = ['photos', 'rapports', 'devis_factures', 'documents', 'exports', 'marque', 'autre'];

interface Breakdown {
  category: string;
  bytes: number;
}

export default function StockageScreen() {
  const { organization, role } = useAuth();
  const router = useRouter();
  const [planName, setPlanName] = useState<string | null>(null);
  const [quotaBytes, setQuotaBytes] = useState(0);
  const [usedBytes, setUsedBytes] = useState(0);
  const [breakdown, setBreakdown] = useState<Breakdown[]>([]);
  const [loading, setLoading] = useState(true);
  const isAdmin = role === 'owner' || role === 'admin';

  const load = useCallback(async () => {
    if (!organization) return;
    setLoading(true);
    const [{ data: plan }, { data: used }, { data: parts }] = await Promise.all([
      supabase.from('plans').select('name, storage_quota_mb').eq('id', organization.plan_id).maybeSingle(),
      supabase.rpc('get_storage_usage_bytes', { org_id: organization.id }),
      supabase.rpc('get_storage_usage_breakdown', { org_id: organization.id }),
    ]);
    setPlanName(plan?.name ?? null);
    setQuotaBytes((plan?.storage_quota_mb ?? 0) * 1024 * 1024);
    setUsedBytes(used ?? 0);
    setBreakdown(((parts ?? []) as Breakdown[]).filter((p) => p.bytes > 0).sort((a, b) => b.bytes - a.bytes));
    setLoading(false);
  }, [organization]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  if (loading && breakdown.length === 0) {
    return (
      <Screen>
        <LoadingScreen />
      </Screen>
    );
  }

  const ratio = quotaBytes > 0 ? Math.min(usedBytes / quotaBytes, 1) : 0;
  const nearLimit = ratio >= 0.9;
  const maxCategoryBytes = Math.max(...breakdown.map((b) => b.bytes), 1);

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl * 2 }}>
        <Container>
          <PageHeader title="Stockage" backTo="/(app)" />
          <SettingsTabs />

          <Card style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <Text style={styles.summaryTitle}>{planName ? `Plan ${planName}` : 'Utilisation'}</Text>
              <Text style={[styles.summaryPct, nearLimit && styles.textDanger]}>{Math.round(ratio * 100)}%</Text>
            </View>
            <View style={styles.usageBarTrack}>
              <View style={[styles.usageBarFill, { width: `${ratio * 100}%` }, nearLimit && styles.usageBarFillDanger]} />
            </View>
            <Text style={[styles.summaryText, nearLimit && styles.textDanger]}>
              {formatBytes(usedBytes)} utilisés sur {quotaBytes > 0 ? formatBytes(quotaBytes) : '—'}
            </Text>
          </Card>

          <Text style={styles.sectionTitle}>Répartition</Text>
          {breakdown.length === 0 ? (
            <Text style={styles.emptyText}>Rien n'a encore été stocké pour cette entreprise.</Text>
          ) : (
            <Card style={styles.breakdownCard}>
              {CATEGORY_ORDER.filter((key) => breakdown.some((b) => b.category === key)).map((key, i, arr) => {
                const entry = breakdown.find((b) => b.category === key)!;
                const meta = CATEGORY_META[key] ?? CATEGORY_META.autre;
                const barRatio = entry.bytes / maxCategoryBytes;
                return (
                  <View key={key} style={[styles.categoryRow, i < arr.length - 1 && styles.categoryRowBorder]}>
                    <View style={styles.categoryIcon}>
                      <Feather name={meta.icon} size={15} color={colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={styles.categoryHeaderRow}>
                        <Text style={styles.categoryLabel}>{meta.label}</Text>
                        <Text style={styles.categorySize}>{formatBytes(entry.bytes)}</Text>
                      </View>
                      <View style={styles.categoryBarTrack}>
                        <View style={[styles.categoryBarFill, { width: `${Math.max(barRatio * 100, 3)}%` }]} />
                      </View>
                    </View>
                  </View>
                );
              })}
            </Card>
          )}

          {isAdmin ? (
            <View style={styles.upgradeCard}>
              <Feather name="arrow-up-circle" size={18} color={colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={styles.upgradeTitle}>Besoin de plus d'espace ?</Text>
                <Text style={styles.upgradeText}>Les plans payants offrent davantage de stockage pour photos, devis et factures.</Text>
              </View>
            </View>
          ) : null}
          {isAdmin ? (
            <Button
              title="Voir les plans"
              icon="arrow-up-circle"
              onPress={() => router.push('/(app)/compte/facturation')}
              style={{ marginTop: spacing.md }}
            />
          ) : null}
        </Container>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  summaryCard: {
    marginTop: spacing.lg,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  summaryTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  summaryPct: {
    fontSize: fontSize.md,
    fontWeight: '800',
    color: colors.text,
  },
  usageBarTrack: {
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  usageBarFill: {
    height: 10,
    backgroundColor: colors.primary,
  },
  usageBarFillDanger: {
    backgroundColor: colors.danger,
  },
  summaryText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  textDanger: {
    color: colors.danger,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  breakdownCard: {
    padding: 0,
    overflow: 'hidden',
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  categoryRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  categoryIcon: {
    width: 30,
    height: 30,
    borderRadius: radius.sm,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  categoryLabel: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
  },
  categorySize: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  categoryBarTrack: {
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  categoryBarFill: {
    height: 5,
    backgroundColor: colors.accent,
    borderRadius: 3,
  },
  upgradeCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.xl,
  },
  upgradeTitle: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
  },
  upgradeText: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
    lineHeight: 16,
  },
});
