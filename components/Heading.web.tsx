// react-native-web ships no type declarations, and this file is web-only
// (native builds pick Heading.tsx instead), so the import is typed loosely
// rather than pulling in a whole ambient-module declaration for one function.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { unstable_createElement } = require('react-native-web') as {
  unstable_createElement: (tag: string, props: { style?: unknown; children?: ReactNode }) => ReactNode;
};
import type { ReactNode } from 'react';
import type { StyleProp, TextStyle } from 'react-native';

// Web build only (Metro/webpack prefers this file over Heading.tsx here) —
// renders a real <h1>-<h4> DOM element instead of react-native-web's usual
// generic <div> for Text, so the page actually has a semantic heading
// hierarchy for crawlers and screen readers, not just a styled-to-look-like
// -a-heading paragraph. unstable_createElement is react-native-web's own
// sanctioned escape hatch for exactly this (arbitrary host element + RN
// style objects); it isn't in the RN core API so this file can't be shared
// with native builds.
export function Heading({
  level = 2,
  style,
  children,
}: {
  level?: 1 | 2 | 3 | 4;
  style?: StyleProp<TextStyle>;
  children: ReactNode;
}) {
  return unstable_createElement(`h${level}`, { style, children });
}
