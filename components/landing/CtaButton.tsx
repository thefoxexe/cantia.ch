import { forwardRef } from 'react';
import { Pressable, StyleSheet, Text, View, type PressableProps } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { sans, site } from '../../lib/siteTheme';

// Button of the older marketing pages, drawn like the site's Btn (copper or
// sand). forwardRef so it can sit under <Link asChild>.
export const CtaButton = forwardRef<View, PressableProps & { title: string; tone?: 'primary' | 'light' }>(
  function CtaButton({ title, tone = 'primary', style, ...rest }, ref) {
    const light = tone === 'light';
    return (
      <Pressable
        ref={ref}
        {...rest}
        style={(state) => [
          styles.base,
          light ? styles.light : styles.primary,
          (state as any).hovered && { backgroundColor: light ? '#e9d9c4' : site.rust },
          state.pressed && { opacity: 0.85 },
          typeof style === 'function' ? style(state) : style,
        ]}
      >
        <Text style={[sans, styles.text, light && { color: site.ink }]}>{title}</Text>
        <Feather name="arrow-right" size={15} color={light ? site.ink : '#ffffff'} />
      </Pressable>
    );
  },
);

const styles = StyleSheet.create({
  base: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 26, paddingVertical: 14, paddingHorizontal: 20, borderRadius: 5 },
  primary: { backgroundColor: site.copper },
  light: { backgroundColor: '#e7d8c5' },
  text: { fontSize: 13, fontWeight: '600', color: '#ffffff' },
});
