import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, radius } from '../lib/theme';
import { buildFeedMapHtml, type FeedMapPoint } from '../lib/feedMapHtml';

export type { FeedMapPoint };

interface FeedMapProps {
  points: FeedMapPoint[];
  height?: number;
}

// react-native-webview has no web implementation, so the web build uses a
// plain iframe with the same Leaflet page (same pattern as SwissMap.web.tsx).
export function FeedMap({ points, height = 440 }: FeedMapProps) {
  const html = useMemo(() => buildFeedMapHtml(points), [points]);

  return (
    <View style={[styles.container, { height }]}>
      <iframe srcDoc={html} style={{ border: 0, width: '100%', height: '100%' }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: 16,
  },
});
