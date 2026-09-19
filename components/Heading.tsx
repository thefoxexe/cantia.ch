import { Text } from 'react-native';
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
  return (
    <Text accessibilityRole="header" aria-level={level} style={style}>
      {children}
    </Text>
  );
}
