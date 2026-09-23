import { useCallback, useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../../../lib/auth-context';
import { useProject } from '../../../../lib/useProject';
import { supabase } from '../../../../lib/supabase';
import { getSignedUrl } from '../../../../lib/api/storage';
import { isModuleEnabled } from '../../../../lib/modules';
import { LoadingScreen, StatusBadge, AppScreen } from '../../../../components/ui';
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
  // Notes and Rapports are the two things used every day on every chantier
  // — rendered as a full-width row so they read as the primary actions,
  // everything else (situations, travaux supp., etc.) sits in the regular
  // grid below at equal, secondary weight.
  featured?: boolean;
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
  situations: { table: 'chantier_situations', countKey: 'countSituations' },
};

export default function ChantierDetailScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { canViewFinances, canManageDevis, permissions } = useAuth();
  const { project } = useProject(id);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [coverUrl, setCoverUrl] = useState<string | null>(null);

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

  useEffect(() => {
    if (!project?.cover_photo_url) {
      setCoverUrl(null);
      return;
    }
    let cancelled = false;
    getSignedUrl(project.cover_photo_url).then((url) => {
      if (!cancelled) setCoverUrl(url);
    });
    return () => {
      cancelled = true;
    };
  }, [project?.cover_photo_url]);

  if (!project) {
    return (
      <AppScreen>
        <LoadingScreen />
      </AppScreen>
    );
  }

  const enabled = project.enabled_modules;
  const items: HubItem[] = [
    { key: 'feed', label: t('chantierHub.feed'), icon: 'edit-3', route: `/(app)/chantiers/${id}/feed`, visible: true, featured: true },
    { key: 'reports', label: t('chantierHub.reports'), icon: 'file-text', route: `/(app)/chantiers/${id}/reports`, visible: true, featured: true },
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
      visible: canManageDevis,
    },
    {
      key: 'situations',
      label: t('chantierHub.situations'),
      icon: 'bar-chart-2',
      route: `/(app)/chantiers/${id}/situations`,
      visible: canManageDevis,
    },
  ];

  // Situations and travaux supplémentaires are the two items people don't
  // recognize on sight — a one-line description of what they actually do
  // is more useful here than a bare count, which stays meaningless at 0.
  const STATIC_HINT: Partial<Record<string, string>> = {
    extraWorks: t('chantierHub.extraWorksHint'),
    situations: t('chantierHub.situationsHint'),
  };

  function subtitleFor(key: string): string | null {
    if (STATIC_HINT[key]) return STATIC_HINT[key]!;
    const def = COUNTABLE[key];
    if (!def) return null;
    const n = counts[key];
    if (n === undefined) return null;
    return t(`chantierHub.${def.countKey}` as any, { count: n });
  }

  const visibleItems = items.filter((it) => it.visible);

  return (
    <AppScreen>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={coverUrl ? styles.hero : styles.heroCompact}>
          {coverUrl ? (
            <>
              <Image source={{ uri: coverUrl }} style={styles.heroImage} />
              <View style={styles.heroScrim} pointerEvents="none" />
            </>
          ) : null}

          <View style={styles.heroTopBar}>
            <Pressable onPress={() => router.replace('/(app)/chantiers')} hitSlop={8} style={styles.heroIconButton}>
              <Feather name="arrow-left" size={20} color="#fff" />
            </Pressable>
            <Pressable onPress={() => router.push(`/(app)/chantiers/${id}/settings`)} hitSlop={8} style={styles.heroIconButton}>
              <Feather name="settings" size={19} color="#fff" />
            </Pressable>
          </View>

          <View style={coverUrl ? styles.heroBottom : styles.heroBottomCompact}>
            <View style={styles.heroBadgeRow}>
              <StatusBadge status={project.status} />
            </View>
            <Text style={styles.heroTitle} numberOfLines={2}>
              {project.name}
            </Text>
            {project.client_name || project.address ? (
              <View style={{ gap: 2 }}>
                {project.client_name ? (
                  <View style={styles.heroMetaRow}>
                    <Feather name="user" size={12} color="rgba(255,255,255,0.85)" />
                    <Text style={styles.heroMetaText} numberOfLines={1}>
                      {project.client_name}
                    </Text>
                  </View>
                ) : null}
                {project.address ? (
                  <View style={styles.heroMetaRow}>
                    <Feather name="map-pin" size={12} color="rgba(255,255,255,0.85)" />
                    <Text style={styles.heroMetaText} numberOfLines={1}>
                      {project.address}
                    </Text>
                  </View>
                ) : null}
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.grid}>
          {visibleItems.map((it) => (
            <Pressable
              key={it.key}
              onPress={() => router.push(it.route as any)}
              style={({ hovered, pressed }: any) => [
                it.featured ? styles.tileFeatured : styles.tile,
                hovered && styles.tileHovered,
                pressed && styles.tilePressed,
              ]}
            >
              <View style={[styles.tileIcon, it.featured && styles.tileIconFeatured]}>
                <Feather name={it.icon} size={it.featured ? 21 : 19} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.tileLabel, it.featured && styles.tileLabelFeatured]} numberOfLines={2}>
                  {it.label}
                </Text>
                {subtitleFor(it.key) ? (
                  <Text style={styles.tileSubtitle} numberOfLines={it.featured ? 1 : 2}>
                    {subtitleFor(it.key)}
                  </Text>
                ) : null}
              </View>
              {it.featured ? <Feather name="chevron-right" size={18} color={colors.textMuted} /> : null}
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    paddingBottom: spacing.xxl,
  },
  hero: {
    width: '100%',
    aspectRatio: 16 / 9,
    maxHeight: 320,
    minHeight: 200,
    backgroundColor: colors.surfaceAlt,
    justifyContent: 'flex-end',
  },
  // No cover photo set for this chantier: a compact, dark banner instead of
  // a big empty placeholder — the photo only ever shows once one is
  // actually uploaded from the chantier's settings.
  heroCompact: {
    width: '100%',
    backgroundColor: colors.text,
    justifyContent: 'flex-end',
  },
  heroImage: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
  },
  heroScrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15,23,20,0.15)',
  },
  heroTopBar: {
    position: 'absolute',
    top: spacing.lg,
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  heroIconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15,23,20,0.45)',
  },
  heroBottom: {
    padding: spacing.lg,
    paddingTop: spacing.xxl * 1.6,
    gap: spacing.xs,
    backgroundColor: 'rgba(15,23,20,0.55)',
  },
  heroBottomCompact: {
    // The back/settings buttons above are absolutely positioned (top:
    // spacing.lg, 38px tall) and don't take up flow space here, so this
    // padding is the only thing keeping this content from sitting right
    // underneath — and overlapping — them.
    padding: spacing.lg,
    paddingTop: spacing.lg + 38 + spacing.lg,
    gap: spacing.xs,
  },
  heroBadgeRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  heroTitle: {
    fontSize: fontSize.xl + 2,
    fontWeight: '800',
    color: '#fff',
  },
  heroMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroMetaText: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    padding: spacing.lg,
    maxWidth: 880,
    width: '100%',
    alignSelf: 'center',
  },
  tile: {
    flexGrow: 1,
    flexBasis: 150,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  tileFeatured: {
    flexBasis: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  tileHovered: {
    borderColor: colors.primary,
  },
  tilePressed: {
    opacity: 0.85,
  },
  tileIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  tileIconFeatured: {
    width: 46,
    height: 46,
    marginBottom: 0,
  },
  tileLabel: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
  },
  tileLabelFeatured: {
    fontSize: fontSize.md,
  },
  tileSubtitle: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
});
