import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import WebView from 'react-native-webview';
import { colors, radius } from '../lib/theme';
import { buildFeedMapHtml, type FeedMapPoint } from '../lib/feedMapHtml';

export type { FeedMapPoint };

interface FeedMapProps {
  points: FeedMapPoint[];
  height?: number;
}

export function FeedMap({ points, height = 440 }: FeedMapProps) {
  const html = useMemo(() => buildFeedMapHtml(points), [points]);

  return (
    <View style={[styles.container, { height }]}>
      <WebView source={{ html }} style={styles.webview} javaScriptEnabled domStorageEnabled originWhitelist={['*']} />
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
  webview: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
  },
});
