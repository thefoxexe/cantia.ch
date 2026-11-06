import { useRef, useState } from 'react';
import { Dimensions, Modal, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../lib/auth-context';
import { useTranslation } from '../lib/translations';
import { colors, fontSize, radius, spacing } from '../lib/theme';

type IconName = React.ComponentProps<typeof Feather>['name'];

// Every settings screen a page can point to, with what it holds.
export const DESTINATIONS = {
  look: { href: '/(app)/compte/apparence', icon: 'droplet' },
  documents: { href: '/(app)/compte/devis', icon: 'hash' },
  company: { href: '/(app)/compte/entreprise', icon: 'home' },
  emails: { href: '/(app)/emails/reglages?tab=modeles', icon: 'mail' },
  reminders: { href: '/(app)/emails/reglages?tab=relances', icon: 'zap' },
  payroll: { href: '/(app)/compte/rh', icon: 'dollar-sign' },
  team: { href: '/(app)/compte/equipe', icon: 'users' },
  modules: { href: '/(app)/compte/modules', icon: 'toggle-right' },
} satisfies Record<string, { href: string; icon: IconName }>;

export type Destination = keyof typeof DESTINATIONS;

// The settings that change what each page shows or produces.
const PAGES = {
  devis: ['look', 'documents', 'emails', 'reminders', 'company'],
  factures: ['look', 'documents', 'company', 'emails', 'reminders'],
  documentEditor: ['look', 'documents', 'company'],
  rh: ['payroll', 'team'],
  chantiers: ['modules', 'team'],
} satisfies Record<string, Destination[]>;

export type SettingsPage = keyof typeof PAGES;

// "Réglages" button on a page: opens the list of the settings behind that
// page (each with what it changes) and goes straight to the right screen.
// Shown to the company's owners and admins, who are the ones who can
// change them.
export function PageSettings({ page, style }: { page: SettingsPage; style?: StyleProp<ViewStyle> }) {
  const { t } = useTranslation();
  const router = useRouter();
  const { role } = useAuth();
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState<{ top: number; right: number } | null>(null);
  const triggerRef = useRef<View>(null);

  if (role !== 'owner' && role !== 'admin') return null;

  function open() {
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      const windowWidth = Dimensions.get('window').width;
      setPos({ top: y + height + 6, right: Math.max(spacing.md, windowWidth - (x + width)) });
      setVisible(true);
    });
  }

  return (
    <>
      <View ref={triggerRef} collapsable={false} style={style}>
        <Pressable onPress={open} hitSlop={8} style={styles.trigger} accessibilityRole="button" accessibilityLabel={t('pageSettings.button')}>
          <Feather name="settings" size={15} color={colors.textMuted} />
          <Text style={styles.triggerText}>{t('pageSettings.button')}</Text>
        </Pressable>
      </View>
      <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
        <Pressable style={StyleSheet.absoluteFill} onPress={() => setVisible(false)}>
          {pos ? (
            <View style={[styles.card, { top: pos.top, right: pos.right }]}>
              <Text style={styles.cardTitle}>{t(`pageSettings.title.${page}` as any)}</Text>
              {PAGES[page].map((key) => {
                const dest = DESTINATIONS[key as Destination];
                return (
                  <Pressable
                    key={key}
                    onPress={() => {
                      setVisible(false);
                      router.push(dest.href as any);
                    }}
                    style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
                  >
                    <View style={styles.rowIcon}>
                      <Feather name={dest.icon} size={14} color={colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.rowLabel}>{t(`pageSettings.items.${key}.label` as any)}</Text>
                      <Text style={styles.rowHint}>{t(`pageSettings.items.${key}.hint` as any)}</Text>
                    </View>
                    <Feather name="chevron-right" size={15} color={colors.textMuted} />
                  </Pressable>
                );
              })}
            </View>
          ) : null}
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  triggerText: { fontSize: fontSize.xs, fontWeight: '600', color: colors.textMuted },
  card: {
    position: 'absolute',
    width: 330,
    maxWidth: Dimensions.get('window').width - spacing.md * 2,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.xs,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  cardTitle: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  rowPressed: { backgroundColor: colors.primarySoft },
  rowIcon: {
    width: 28,
    height: 28,
    borderRadius: radius.sm,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: { fontSize: fontSize.sm, fontWeight: '600', color: colors.text },
  rowHint: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 1, lineHeight: 15 },
});
