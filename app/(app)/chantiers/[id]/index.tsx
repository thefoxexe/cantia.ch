import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../../../lib/auth-context';
import { useProject } from '../../../../lib/useProject';
import { supabase } from '../../../../lib/supabase';
import { isModuleEnabled } from '../../../../lib/modules';
import { LoadingScreen, PageHeader, Screen } from '../../../../components/ui';
import { useTranslation } from '../../../../lib/translations';
import { colors, fontSize, radius, spacing } from '../../../../lib/theme';

type IconName = keyof typeof Feather.glyphMap;

interface HubItem {
  key: string;
  label: string;
  icon: IconName;
  route: string;
  visible: boolean;
  countTable?: string;
}

// Cheap head-count queries for the modules where it's a single table keyed
// by project_id — gives an at-a-glance sense of activity on the row
// instead of a bare icon (feed/map/profitability aren't simple counts, so
// they're left without one). The translation key suffix (after "count")
// must match a chantierHub.count<Suffix>_one/_other pair in fr.ts/de.ts.
const COUNTABLE: Record<string, { table: string; countKey: string }> = {
  reports: { table: 'reports', countKey: 'countReports' },
  documents: { table: 'files', countKey: 'countDocuments' },
  metre: { table: 'metre_items', countKey: 'countMetre' },
  subcontractors: { table: 'project_subcontractors', countKey: 'countSubcontractors' },
  extraWorks: { table: 'extra_works', countKey: 'countExtraWorks' },
};

export default function ChantierDetailScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { canViewFinances, permissions } = useAuth();
  const { project } = useProject(id);
  const [counts, setCounts] = useState<Record<string, number>>({});

  const loadCounts = useCallback(async () => {
    const entries = Object.entries(COUNTABLE);
    const results = await Promise.all(
      entries.map(([, def]) =>
        supabase.from(def.table).select('id', { count: 'exact', head: true }).eq('project_id', id),
      ),
    );
    const next: Record<string, number> = {};
    entries.forEach(([key], i) => {
      next[key] = results[i].count ?? 0;
    });
    setCounts(next);
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      loadCounts();
    }, [loadCounts]),
  );

  if (!project) {
    return (
      <Screen>
        <LoadingScreen />
      </Screen>
    );
  }

  const enabled = project.enabled_modules;
  const items: HubItem[] = [
    { key: 'feed', label: t('chantierHub.feed'), icon: 'message-circle', route: `/(app)/chantiers/${id}/feed`, visible: true },
    { key: 'reports', label: t('chantierHub.reports'), icon: 'file-text', route: `/(app)/chantiers/${id}/reports`, visible: true },
    {
      key: 'documents',
      label: t('chantierHub.documents'),
      icon: 'folder',
      route: `/(app)/chantiers/${id}/documents`,
      visible: isModuleEnabled(enabled, 'documents') && permissions.documents,
    },
    {
      key: 'photos',
      label: t('chantierHub.photos'),
      icon: 'image',
      route: `/(app)/chantiers/${id}/photos`,
      visible: isModuleEnabled(enabled, 'photos'),
    },
    {
      key: 'map',
      label: t('chantierHub.map'),
      icon: 'map',
      route: `/(app)/chantiers/${id}/map`,
      visible: isModuleEnabled(enabled, 'photos'),
    },
    {
      key: 'metre',
      label: t('chantierHub.metre'),
      icon: 'list',
      route: `/(app)/chantiers/${id}/metre`,
      visible: isModuleEnabled(enabled, 'metre') && permissions.metre,
    },
    {
      key: 'subcontractors',
      label: t('chantierHub.subcontractors'),
      icon: 'users',
      route: `/(app)/chantiers/${id}/subcontractors`,
      visible: isModuleEnabled(enabled, 'subcontractors') && permissions.subcontractors,
    },
    {
      key: 'profitability',
      label: t('chantierHub.profitability'),
      icon: 'trending-up',
      route: `/(app)/chantiers/${id}/profitability`,
      visible: isModuleEnabled(enabled, 'profitability') && canViewFinances,
    },
    {
      key: 'extraWorks',
      label: t('chantierHub.extraWorks'),
      icon: 'plus-circle',
      route: `/(app)/chantiers/${id}/travaux-supplementaires`,
      visible: canViewFinances,
    },
  ];

  function subtitleFor(key: string): string | null {
    const def = COUNTABLE[key];
    if (!def) return null;
    const n = counts[key];
    if (n === undefined) return null;
    return t(`chantierHub.${def.countKey}` as any, { count: n });
  }

  return (
    <Screen>
      <PageHeader
        title={project.name}
        backTo="/(app)/chantiers"
        style={styles.topBar}
        right={
          <Pressable onPress={() => router.push(`/(app)/chantiers/${id}/settings`)} hitSlop={8} style={styles.iconButton}>
            <Feather name="settings" size={20} color={colors.text} />
          </Pressable>
        }
      />

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.list}>
          {items
            .filter((it) => it.visible)
            .map((it) => (
              <Pressable
                key={it.key}
                onPress={() => router.push(it.route as any)}
                style={({ hovered }: any) => [styles.row, hovered && styles.rowHovered]}
              >
                <View style={styles.rowIcon}>
                  <Feather name={it.icon} size={18} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowLabel}>{it.label}</Text>
                  {subtitleFor(it.key) ? <Text style={styles.rowSubtitle}>{subtitleFor(it.key)}</Text> : null}
                </View>
                <Feather name="chevron-right" size={18} color={colors.textMuted} />
              </Pressable>
            ))}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: {
    maxWidth: 880,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
    marginBottom: 0,
  },
  iconButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flexGrow: 1,
    paddingBottom: spacing.xxl,
  },
  list: {
    gap: spacing.sm,
    padding: spacing.lg,
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  rowHovered: {
    borderColor: colors.primary,
  },
  rowIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
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
