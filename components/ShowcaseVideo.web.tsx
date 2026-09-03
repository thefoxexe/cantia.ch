// react-native-web ships no type declarations for unstable_createElement,
// see Heading.web.tsx for the same pattern/reasoning — this file is web-only
// (native builds pick ShowcaseVideo.tsx instead) since RN core has no <video>
// element and the project has no expo-av/expo-video dependency.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { unstable_createElement } = require('react-native-web') as {
  unstable_createElement: (tag: string, props: Record<string, unknown>) => ReactNode;
};
import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

export function ShowcaseVideo({
  sources,
  poster,
  style,
  accessibilityLabel,
}: {
  sources: { src: string; type: string }[];
  poster?: string;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}) {
  return unstable_createElement('video', {
    poster,
    style,
    autoPlay: true,
    muted: true,
    loop: true,
    playsInline: true,
    controls: true,
    'aria-label': accessibilityLabel,
    // Listed webm (VP9, royalty-free, universally decodable) before mp4
    // (H.264) so browsers whose Chromium build ships without proprietary
    // codec support — seen in some sandboxed/CI environments — still get a
    // playable source; real desktop/mobile browsers support both.
    children: sources.map((s) => unstable_createElement('source', { key: s.src, src: s.src, type: s.type })),
  });
}
