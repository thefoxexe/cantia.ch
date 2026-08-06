import { StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, radius, spacing } from '../lib/theme';

// Native fallback — the public client portal is only ever opened in a real
// browser (see SignaturePad.web.tsx for the actual drawing pad), so on
// native this just points the client at the "upload a photo" option instead.
export function SignaturePad(_props: { onChange: (dataUrl: string | null) => void }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.text}>La signature à la souris/au doigt est disponible depuis un navigateur. Utilisez l'option "Importer une photo" ci-dessous.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    padding: spacing.md,
  },
  text: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
});
