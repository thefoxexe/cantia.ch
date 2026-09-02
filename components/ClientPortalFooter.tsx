import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { colors, fontSize, spacing } from '../lib/theme';
import { portalFonts } from '../lib/clientPortalTheme';
import { useTranslation } from '../lib/translations';
import { SwissCross } from './SwissCross';

// Closes every state of the client portal (gate, document view, accepted,
// refused). This is the one place a soft acquisition pitch belongs: the
// person reading it is someone else's client, possibly a subcontractor or
// business themselves, who just watched a clean, secure document flow work
// — "propulsé par Cantia" with a link out is the whole sales channel the
// brief asked for, kept to one quiet line rather than a banner.
export function ClientPortalFooter() {
  const { t } = useTranslation();
  return (
    <View style={styles.wrap}>
      <View style={styles.divider} />
      <View style={styles.row}>
        <SwissCross size={11} />
        <Text style={styles.text}>{t('clientPortalFooter.generatedBy')}</Text>
      </View>
      <Link href="/" asChild>
        <Pressable>
          <Text style={styles.link}>{t('clientPortalFooter.discoverLink')}</Text>
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  divider: {
    height: 1,
    width: 48,
    backgroundColor: colors.border,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    maxWidth: 380,
  },
  text: {
    fontFamily: portalFonts.body,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 16,
  },
  link: {
    fontFamily: portalFonts.body,
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.primary,
  },
});
