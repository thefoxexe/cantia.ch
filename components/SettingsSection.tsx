import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Card } from './ui';
import { DESTINATIONS, type Destination } from './PageSettings';
import { useTranslation } from '../lib/translations';
import { colors, fontSize, radius, spacing } from '../lib/theme';

// One block of a settings screen: an icon, a title, one line saying what it
// changes, and its fields in a card.
export function SettingsSection({
  icon,
  title,
  hint,
  children,
}: {
  icon: React.ComponentProps<typeof Feather>['name'];
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <View style={styles.icon}>
          <Feather name={icon} size={15} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{title}</Text>
          {hint ? <Text style={styles.hint}>{hint}</Text> : null}
        </View>
      </View>
      <Card style={styles.card}>{children}</Card>
    </View>
  );
}

// "Réglages liés" at the bottom of a settings screen: where the rest of
// what shapes the same documents lives.
export function RelatedSettings({ items }: { items: Destination[] }) {
  const { t } = useTranslation();
  const router = useRouter();
  return (
    <View style={styles.section}>
      <Text style={styles.relatedTitle}>{t('pageSettings.related')}</Text>
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        {items.map((key, i) => (
          <Pressable
            key={key}
            onPress={() => router.push(DESTINATIONS[key].href as any)}
            style={({ pressed }) => [styles.row, i > 0 && styles.rowBorder, pressed && { backgroundColor: colors.primarySoft }]}
          >
            <Feather name={DESTINATIONS[key].icon} size={15} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>{t(`pageSettings.items.${key}.label` as any)}</Text>
              <Text style={styles.hint}>{t(`pageSettings.items.${key}.hint` as any)}</Text>
            </View>
            <Feather name="chevron-right" size={15} color={colors.textMuted} />
          </Pressable>
        ))}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: spacing.xl },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, marginBottom: spacing.sm },
  icon: {
    width: 28,
    height: 28,
    borderRadius: radius.sm,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  title: { fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  hint: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2, lineHeight: 16 },
  card: { gap: spacing.sm },
  relatedTitle: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: spacing.sm,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.md },
  rowBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  rowLabel: { fontSize: fontSize.sm, fontWeight: '600', color: colors.text },
});
