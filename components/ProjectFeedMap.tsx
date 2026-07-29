import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { supabase } from '../lib/supabase';
import { getSignedUrls } from '../lib/api/storage';
import { FeedMap, type FeedMapPoint } from './FeedMap';
import { EmptyState, LoadingScreen } from './ui';
import { colors, fontSize, spacing } from '../lib/theme';

export function ProjectFeedMap({ projectId }: { projectId: string }) {
  const [points, setPoints] = useState<FeedMapPoint[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('feed_entries')
      .select('id, storage_path, caption, latitude, longitude, taken_at, created_at')
      .eq('project_id', projectId)
      .eq('type', 'photo')
      .not('latitude', 'is', null)
      .not('longitude', 'is', null);
    const rows = data ?? [];
    const paths = rows.filter((r) => r.storage_path).map((r) => r.storage_path as string);
    const urls = await getSignedUrls(paths);
    setPoints(
      rows.map((r) => ({
        id: r.id,
        lat: r.latitude as number,
        lon: r.longitude as number,
        thumbUrl: r.storage_path ? (urls[r.storage_path] ?? null) : null,
        caption: r.caption,
        takenAt: r.taken_at ?? r.created_at,
      })),
    );
    setLoading(false);
  }, [projectId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  if (loading && points.length === 0) return <LoadingScreen />;

  if (points.length === 0) {
    return (
      <EmptyState
        title="Aucune photo géolocalisée"
        subtitle="Les photos prises depuis le fil d'actualité avec la position activée apparaîtront ici."
      />
    );
  }

  return (
    <View>
      <Text style={styles.count}>
        {points.length} photo{points.length > 1 ? 's' : ''} géolocalisée{points.length > 1 ? 's' : ''}
      </Text>
      <FeedMap points={points} height={460} />
    </View>
  );
}

const styles = StyleSheet.create({
  count: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing.sm,
    fontWeight: '600',
  },
});
