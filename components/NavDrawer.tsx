import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fontSize, radius, spacing } from '../lib/theme';

export type IconName = keyof typeof Feather.glyphMap;

export interface NavLink {
  href: string;
  label: string;
  icon: IconName;
}

export interface NavSection {
  title?: string;
  links: NavLink[];
}

export function NavDrawer({
  visible,
  onClose,
  sections,
  activeHref,
}: {
  visible: boolean;
  onClose: () => void;
  sections: NavSection[];
  activeHref: string | null;
}) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.panel, { paddingTop: insets.top + spacing.lg }]}>
          <View style={styles.brand}>
            <Image source={require('../assets/logo-mark.png')} style={styles.logo} resizeMode="contain" />
            <Text style={styles.brandText}>Cantia</Text>
          </View>
          <ScrollView contentContainerStyle={styles.nav} showsVerticalScrollIndicator={false}>
            {sections.map((section, i) => (
              <View key={section.title ?? `s${i}`} style={styles.section}>
                {section.title ? <Text style={styles.sectionTitle}>{section.title}</Text> : null}
                {section.links.map((link) => {
                  const active = link.href === activeHref;
                  return (
                    <Pressable
                      key={link.href}
                      onPress={() => {
                        onClose();
                        router.push(link.href as any);
                      }}
                      style={[styles.item, active && styles.itemActive]}
                    >
                      <Feather name={link.icon} size={18} color={active ? colors.primary : colors.textMuted} />
                      <Text style={[styles.itemText, active && styles.itemTextActive]}>{link.label}</Text>
                    </Pressable>
                  );
                })}
              </View>
            ))}
          </ScrollView>
        </View>
        <Pressable style={styles.dismiss} onPress={onClose} />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    flexDirection: 'row',
  },
  panel: {
    width: 280,
    height: '100%',
    backgroundColor: colors.surface,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    paddingHorizontal: spacing.md,
  },
  dismiss: {
    flex: 1,
    backgroundColor: 'rgba(35, 26, 18, 0.35)',
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.xl,
  },
  logo: {
    width: 28,
    height: 28,
  },
  brandText: {
    fontSize: fontSize.lg,
    fontWeight: '800',
    color: colors.text,
  },
  nav: {
    paddingBottom: spacing.xxl,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 0.6,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.xs,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
  },
  itemActive: {
    backgroundColor: colors.primarySoft,
  },
  itemText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.textMuted,
  },
  itemTextActive: {
    color: colors.primary,
  },
});
