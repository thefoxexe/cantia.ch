import { useCallback, useMemo, useState } from 'react';
import { Image, Linking, LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { getSignedUrls } from '../lib/api/storage';
import { EmptyState } from './ui';
import { colors, fontSize, radius, spacing } from '../lib/theme';

interface ProjectPhoto {
  id: string;
  storage_path: string;
  caption: string | null;
  latitude: number | null;
  longitude: number | null;
  taken_at: string;
  report_title: string;
}

type DateFilter = 'all' | '7d' | '30d';

const FILTERS: { key: DateFilter; label: string }[] = [
  { key: 'all', label: 'Toutes' },
  { key: '7d', label: '7 derniers jours' },
  { key: '30d', label: '30 derniers jours' },
];

function dayKey(iso: string): string {
  return iso.slice(0, 10);
}

function formatDayHeading(iso: string): string {
  const d = new Date(iso);
  const text = d.toLocaleDateString('fr-CH', { day: 'numeric', month: 'long', year: 'numeric' });
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function ProjectPhotos({ projectId }: { projectId: string }) {
  const [photos, setPhotos] = useState<ProjectPhoto[]>([]);
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<DateFilter>('all');
  const [containerWidth, setContainerWidth] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('report_photos')
      .select('id, storage_path, caption, latitude, longitude, taken_at, reports!inner(project_id, title)')
      .eq('reports.project_id', projectId)
      .order('taken_at', { ascending: false });

    const rows: ProjectPhoto[] = (data ?? []).map((p: any) => ({
      id: p.id,
      storage_path: p.storage_path,
      caption: p.caption,
      latitude: p.latitude,
      longitude: p.longitude,
      taken_at: p.taken_at,
      report_title: p.reports?.title ?? '',
    }));
    setPhotos(rows);

    const signed = await getSignedUrls(rows.map((r) => r.storage_path));
    setUrls(signed);
    setLoading(false);
  }, [projectId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const filtered = useMemo(() => {
    if (filter === 'all') return photos;
    const days = filter === '7d' ? 7 : 30;
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    return photos.filter((p) => new Date(p.taken_at).getTime() >= cutoff);
  }, [photos, filter]);

  const groups = useMemo(() => {
    const map = new Map<string, ProjectPhoto[]>();
    for (const p of filtered) {
      const key = dayKey(p.taken_at);
      const list = map.get(key);
      if (list) list.push(p);
      else map.set(key, [p]);
    }
    return Array.from(map.entries());
  }, [filtered]);

  const gap = spacing.md;
  const cols = containerWidth >= 900 ? 4 : containerWidth >= 640 ? 3 : containerWidth >= 340 ? 2 : 1;
  const cardWidth = containerWidth > 0 ? (containerWidth - gap * (cols - 1)) / cols : undefined;

  function onGridLayout(e: LayoutChangeEvent) {
    setContainerWidth(e.nativeEvent.layout.width);
  }

  function openMap(photo: ProjectPhoto) {
    if (photo.latitude == null || photo.longitude == null) return;
    Linking.openURL(`https://www.google.com/maps?q=${photo.latitude},${photo.longitude}`);
  }

  return (
    <View>
      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <Pressable
            key={f.key}
            onPress={() => setFilter(f.key)}
            style={[styles.filterChip, filter === f.key && styles.filterChipActive]}
          >
            <Text style={[styles.filterChipText, filter === f.key && styles.filterChipTextActive]}>{f.label}</Text>
          </Pressable>
        ))}
      </View>

      {filtered.length === 0 && !loading ? (
        <EmptyState title="Aucune photo" subtitle="Les photos ajoutées à vos rapports apparaîtront ici." />
      ) : (
        <View onLayout={onGridLayout}>
          {groups.map(([key, dayPhotos]) => (
            <View key={key} style={styles.group}>
              <Text style={styles.groupHeading}>{formatDayHeading(dayPhotos[0].taken_at)}</Text>
              <View style={styles.grid}>
                {dayPhotos.map((photo) => (
                  <View key={photo.id} style={[styles.photoCard, cardWidth ? { width: cardWidth } : { flexGrow: 1, minWidth: 140 }]}>
                    {urls[photo.storage_path] ? (
                      <Image source={{ uri: urls[photo.storage_path] }} style={styles.photoImg} />
                    ) : (
                      <View style={[styles.photoImg, styles.photoPlaceholder]} />
                    )}
                    <View style={styles.photoInfo}>
                      {photo.caption ? (
                        <Text style={styles.photoCaption} numberOfLines={1}>
                          {photo.caption}
                        </Text>
                      ) : null}
                      <Text style={styles.photoMeta} numberOfLines={1}>
                        {photo.report_title}
                      </Text>
                      <View style={styles.photoFooter}>
                        <Text style={styles.photoDate}>
                          {new Date(photo.taken_at).toLocaleTimeString('fr-CH', { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                        {photo.latitude != null ? (
                          <Pressable onPress={() => openMap(photo)} style={styles.mapLink} hitSlop={6}>
                            <Feather name="map-pin" size={12} color={colors.accent} />
                            <Text style={styles.mapLinkText}>Carte</Text>
                          </Pressable>
                        ) : null}
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  filterChipActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: fontSize.xs,
    color: colors.text,
  },
  filterChipTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  group: {
    marginBottom: spacing.xl,
  },
  groupHeading: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  photoCard: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  photoImg: {
    width: '100%',
    height: 120,
    backgroundColor: colors.surfaceAlt,
  },
  photoPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoInfo: {
    padding: spacing.sm,
  },
  photoCaption: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.text,
  },
  photoMeta: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  photoFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  photoDate: {
    fontSize: 11,
    color: colors.textMuted,
  },
  mapLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  mapLinkText: {
    fontSize: 11,
    color: colors.accent,
    fontWeight: '600',
  },
});
