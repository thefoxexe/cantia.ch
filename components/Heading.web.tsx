// eslint-disable-next-line @typescript-eslint/no-var-requires
const { unstable_createElement } = require('react-native-web') as {
  unstable_createElement: (tag: string, props: { style?: unknown; children?: ReactNode }) => ReactNode;
};
import type { ReactNode } from 'react';
import type { StyleProp, TextStyle } from 'react-native';

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
