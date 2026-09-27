import { forwardRef } from 'react';
import { Pressable, StyleSheet, Text, View, type PressableProps } from 'react-native';
import { colors } from '../../lib/theme';
import { marketingFonts } from '../../lib/marketingTheme';

// Square-cornered brand button for the marketing pages. forwardRef so it can
// sit under <Link asChild> like the app's own <Button>.
export const CtaButton = forwardRef<View, PressableProps & { title: string; tone?: 'primary' | 'light' }>(
  function CtaButton({ title, tone = 'primary', style, ...rest }, ref) {
    return (
      <Pressable
        ref={ref}
        {...rest}
        style={(state) => [
          styles.base,
          tone === 'light' ? styles.light : styles.primary,
          state.pressed && { opacity: 0.85 },
          typeof style === 'function' ? style(state) : style,
        ]}
      >
        <Text style={[styles.text, tone === 'light' && { color: colors.text }]}>{title}  →</Text>
      </Pressable>
    );
  },
);

const styles = StyleSheet.create({
  base: { alignSelf: 'flex-start', paddingVertical: 14, paddingHorizontal: 20, borderRadius: 3 },
  primary: { backgroundColor: colors.primary },
  light: { backgroundColor: '#FBF6EE' },
  text: { fontFamily: marketingFonts.body, fontSize: 15, fontWeight: '600', color: '#FBF6EE', letterSpacing: 0.1 },
});
