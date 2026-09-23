import { useCallback, useMemo, useRef, useState } from 'react';
import { Image, LayoutChangeEvent, Modal, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { getSignedUrls } from '../lib/api/storage';
import { FeedMap, type FeedMapPoint } from './FeedMap';
import { EmptyState, LoadingScreen } from './ui';
import { getAppLocale, useTranslation } from '../lib/translations';
import { colors, fontSize, radius, spacing } from '../lib/theme';

interface GalleryPhoto {
  id: string;
  storage_path: string;
  caption: string | null;
  latitude: number | null;
  longitude: number | null;
  taken_at: string;
}

// A single "Galerie" merging every photo ever attached to this chantier —
// both ones still sitting in the feed (feed_entries, type='photo') and ones
// already pulled into a generated report (report_photos, duplicated at
// generation time — see generateReportFromFeed). Querying only one of the
// two used to hide half the photos depending on whether they'd been turned
// into a report yet; storage_path is the one identity both rows share, so
// it's what de-duplicates them into one continuous, newest-first grid —
// exactly like a phone's own photo gallery, with an in-place map toggle
// instead of a separate "Carte" screen.
export function ProjectPhotos({ projectId }: { projectId: string }) {
  const { t } = useTranslation();
  const { width: winWidth } = useWindowDimensions();
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'grid' | 'map'>('grid');
  const [containerWidth, setContainerWidth] = useState(0);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const viewerScrollRef = useRef<ScrollView>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data: feedRows }, { data: reportRows }] = await Promise.all([
      supabase
        .from('feed_entries')
        .select('id, storage_path, caption, latitude, longitude, taken_at, created_at')
        .eq('project_id', projectId)
        .eq('type', 'photo'),
      supabase
        .from('report_photos')
        .select('id, storage_path, caption, latitude, longitude, taken_at, reports!inner(project_id)')
        .eq('reports.project_id', projectId),
    ]);

    // Every report photo also has an originating feed_entries row unless
    // that entry was explicitly deleted after its report was generated —
    // feed rows go in first (they're the live/editable copy), report rows
    // only fill in a storage_path not already covered.
    const merged = new Map<string, GalleryPhoto>();
    for (const r of feedRows ?? []) {
      if (!r.storage_path) continue;
      merged.set(r.storage_path, {
        id: r.id,
        storage_path: r.storage_path,
        caption: r.caption,
        latitude: r.latitude,
        longitude: r.longitude,
        taken_at: r.taken_at ?? r.created_at,
      });
    }
    for (const r of (reportRows ?? []) as { id: string; storage_path: string | null; caption: string | null; latitude: number | null; longitude: number | null; taken_at: string }[]) {
      if (!r.storage_path || merged.has(r.storage_path)) continue;
      merged.set(r.storage_path, {
        id: r.id,
        storage_path: r.storage_path,
        caption: r.caption,
        latitude: r.latitude,
        longitude: r.longitude,
        taken_at: r.taken_at,
      });
    }
    const list = Array.from(merged.values()).sort((a, b) => new Date(b.taken_at).getTime() - new Date(a.taken_at).getTime());
    setPhotos(list);
    setUrls(await getSignedUrls(list.map((p) => p.storage_path)));
    setLoading(false);
  }, [projectId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const mapPoints: FeedMapPoint[] = useMemo(
    () =>
      photos
        .filter((p) => p.latitude != null && p.longitude != null)
        .map((p) => ({
          id: p.id,
          lat: p.latitude as number,
          lon: p.longitude as number,
          thumbUrl: urls[p.storage_path] ?? null,
          caption: p.caption,
          takenAt: p.taken_at,
        })),
    [photos, urls],
  );

  function onGridLayout(e: LayoutChangeEvent) {
    setContainerWidth(e.nativeEvent.layout.width);
  }

  const gap = spacing.xs;
  const cols = containerWidth >= 900 ? 6 : containerWidth >= 640 ? 5 : containerWidth >= 420 ? 4 : 3;
  const cardSize = containerWidth > 0 ? (containerWidth - gap * (cols - 1)) / cols : undefined;

  if (loading && photos.length === 0) return <LoadingScreen />;

  return (
    <View>
      <View style={styles.toolbar}>
        <Text style={styles.count}>{t('projectPhotos.count', { count: photos.length })}</Text>
        <View style={styles.viewToggle}>
          <Pressable onPress={() => setView('grid')} style={[styles.viewToggleButton, view === 'grid' && styles.viewToggleButtonActive]} hitSlop={6}>
            <Feather name="grid" size={14} color={view === 'grid' ? colors.primary : colors.textMuted} />
          </Pressable>
          <Pressable
            onPress={() => mapPoints.length > 0 && setView('map')}
            disabled={mapPoints.length === 0}
            style={[styles.viewToggleButton, view === 'map' && styles.viewToggleButtonActive, mapPoints.length === 0 && styles.viewToggleButtonDisabled]}
            hitSlop={6}
          >
            <Feather name="map" size={14} color={view === 'map' ? colors.primary : colors.textMuted} />
          </Pressable>
        </View>
      </View>

      {photos.length === 0 && !loading ? (
        <EmptyState title={t('projectPhotos.emptyTitle')} subtitle={t('projectPhotos.emptySubtitle')} />
      ) : view === 'map' ? (
        <FeedMap points={mapPoints} height={460} />
      ) : (
        <View onLayout={onGridLayout} style={styles.grid}>
          {photos.map((photo, i) => (
            <Pressable
              key={photo.id}
              onPress={() => setViewerIndex(i)}
              style={[styles.photoCard, cardSize ? { width: cardSize, height: cardSize } : { flexGrow: 1, minWidth: 90, aspectRatio: 1 }]}
            >
              {urls[photo.storage_path] ? (
                <Image source={{ uri: urls[photo.storage_path] }} style={styles.photoImg} />
              ) : (
                <View style={[styles.photoImg, styles.photoPlaceholder]} />
              )}
              {photo.latitude != null ? (
                <View style={styles.geoBadge}>
                  <Feather name="map-pin" size={9} color="#fff" />
                </View>
              ) : null}
            </Pressable>
          ))}
        </View>
      )}

      {/* Full-screen viewer — swipe left/right between photos, same
          horizontal-paging technique as the feed's staged-photo review. */}
      <Modal
        visible={viewerIndex !== null}
        animationType="fade"
        transparent
        onRequestClose={() => setViewerIndex(null)}
        onShow={() => viewerScrollRef.current?.scrollTo({ x: (viewerIndex ?? 0) * winWidth, animated: false })}
      >
        <View style={styles.viewerOverlay}>
          <Pressable style={styles.viewerClose} onPress={() => setViewerIndex(null)} hitSlop={10}>
            <Feather name="x" size={24} color="#fff" />
          </Pressable>
          <ScrollView
            ref={viewerScrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => setViewerIndex(Math.round(e.nativeEvent.contentOffset.x / winWidth))}
          >
            {photos.map((photo) => (
              <View key={photo.id} style={[styles.viewerPage, { width: winWidth }]}>
                {urls[photo.storage_path] ? (
                  <Image source={{ uri: urls[photo.storage_path] }} style={styles.viewerImage} resizeMode="contain" />
                ) : null}
                <View style={styles.viewerFooter}>
                  {photo.caption ? <Text style={styles.viewerCaption}>{photo.caption}</Text> : null}
                  <Text style={styles.viewerDate}>
                    {new Date(photo.taken_at).toLocaleString(`${getAppLocale()}-CH`, {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  count: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textMuted,
  },
  viewToggle: {
    flexDirection: 'row',
    gap: 2,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: 2,
  },
  viewToggleButton: {
    width: 30,
    height: 30,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewToggleButtonActive: {
    backgroundColor: colors.surface,
  },
  viewToggleButtonDisabled: {
    opacity: 0.4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  photoCard: {
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceAlt,
    overflow: 'hidden',
  },
  photoImg: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  geoBadge: {
    position: 'absolute',
    right: 4,
    bottom: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(15,23,20,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(10,12,11,0.96)',
  },
  viewerClose: {
    position: 'absolute',
    top: spacing.xl,
    right: spacing.lg,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  viewerPage: {
    flex: 1,
    justifyContent: 'center',
  },
  viewerImage: {
    width: '100%',
    height: '78%',
  },
  viewerFooter: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    bottom: spacing.xxl,
    gap: 2,
  },
  viewerCaption: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: '#fff',
  },
  viewerDate: {
    fontSize: fontSize.xs,
    color: 'rgba(255,255,255,0.7)',
  },
});
