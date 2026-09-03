// Native build fallback (no expo-av/expo-video dependency in this project) —
// ShowcaseVideo.web.tsx renders a real <video> instead; this just shows the
// poster frame as a static image so the marketing screen still renders sanely
// if it's ever reached from a native build.
import { Image } from 'react-native';
import type { ImageStyle, StyleProp, ViewStyle } from 'react-native';

export function ShowcaseVideo({
  poster,
  style,
  accessibilityLabel,
}: {
  sources: { src: string; type: string }[];
  poster?: string;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}) {
  if (!poster) return null;
  return <Image source={{ uri: poster }} style={style as StyleProp<ImageStyle>} resizeMode="cover" accessibilityLabel={accessibilityLabel} />;
}
