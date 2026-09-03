import { Text } from 'react-native';
import type { ReactNode } from 'react';
import type { StyleProp, TextStyle } from 'react-native';

// Native fallback (also the one Metro/webpack picks for any platform that
// isn't "web" — see Heading.web.tsx for the real <h1>-<h3> tag used there).
// React Native has no native heading concept, so the closest equivalent is
// an accessibility role a screen reader recognizes as a heading.
export function Heading({
  level = 2,
  style,
  children,
}: {
  level?: 1 | 2 | 3 | 4;
  style?: StyleProp<TextStyle>;
  children: ReactNode;
}) {
  return (
    <Text accessibilityRole="header" aria-level={level} style={style}>
      {children}
    </Text>
  );
}
