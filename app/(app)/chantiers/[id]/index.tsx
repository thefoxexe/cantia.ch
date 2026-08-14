import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../../../lib/auth-context';
import { useProject } from '../../../../lib/useProject';
import { isModuleEnabled } from '../../../../lib/modules';
import { LoadingScreen, PageHeader, Screen } from '../../../../components/ui';
import { colors, fontSize, radius, spacing } from '../../../../lib/theme';

type IconName = keyof typeof Feather.glyphMap;

interface HubItem {
  key: string;
  label: string;
  icon: IconName;
  route: string;
  visible: boolean;
}

export default function ChantierDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { canViewFinances, permissions } = useAuth();
  const { project, loading } = useProject(id);

  if (!project) {
    return (
      <Screen>
        <LoadingScreen />
      </Screen>
    );
  }

  const enabled = project.enabled_modules;
  const items: HubItem[] = [
    { key: 'feed', label: "Fil d'actualité", icon: 'message-circle', route: `/(app)/chantiers/${id}/feed`, visible: true },
    { key: 'reports', label: 'Rapports', icon: 'file-text', route: `/(app)/chantiers/${id}/reports`, visible: true },
    {
      key: 'documents',
      label: 'Documents',
      icon: 'folder',
      route: `/(app)/chantiers/${id}/documents`,
      visible: isModuleEnabled(enabled, 'documents') && permissions.documents,
    },
    {
      key: 'photos',
      label: 'Photos',
      icon: 'image',
      route: `/(app)/chantiers/${id}/photos`,
      visible: isModuleEnabled(enabled, 'photos'),
    },
    {
      key: 'map',
      label: 'Carte',
      icon: 'map',
      route: `/(app)/chantiers/${id}/map`,
      visible: isModuleEnabled(enabled, 'photos'),
    },
    {
      key: 'survey',
      label: 'Levés',
      icon: 'crosshair',
      route: `/(app)/chantiers/${id}/survey`,
      visible: isModuleEnabled(enabled, 'survey') && permissions.survey,
    },
    {
      key: 'metre',
      label: 'Métré',
      icon: 'list',
      route: `/(app)/chantiers/${id}/metre`,
      visible: isModuleEnabled(enabled, 'metre') && permissions.metre,
    },
    {
      key: 'subcontractors',
      label: 'Sous-traitants',
      icon: 'users',
      route: `/(app)/chantiers/${id}/subcontractors`,
      visible: isModuleEnabled(enabled, 'subcontractors') && permissions.subcontractors,
    },
    {
      key: 'profitability',
      label: 'Rentabilité',
      icon: 'trending-up',
      route: `/(app)/chantiers/${id}/profitability`,
      visible: isModuleEnabled(enabled, 'profitability') && canViewFinances,
    },
  ];

  return (
    <Screen>
      <PageHeader
        title={project.name}
        backTo="/(app)/chantiers"
        style={styles.topBar}
        right={
          <Pressable onPress={() => router.push(`/(app)/chantiers/${id}/settings`)} hitSlop={8} style={styles.iconButton}>
            <Feather name="settings" size={20} color={colors.text} />
          </Pressable>
        }
      />

      <View style={styles.grid}>
        {items
          .filter((it) => it.visible)
          .map((it) => (
            <Pressable
              key={it.key}
              onPress={() => router.push(it.route as any)}
              style={({ hovered }: any) => [styles.card, hovered && styles.cardHovered]}
            >
              <View style={styles.cardIcon}>
                <Feather name={it.icon} size={22} color={colors.primary} />
              </View>
              <Text style={styles.cardLabel}>{it.label}</Text>
            </Pressable>
          ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: {
    maxWidth: 880,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
    marginBottom: 0,
  },
  iconButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    padding: spacing.lg,
    maxWidth: 880,
    width: '100%',
    alignSelf: 'center',
  },
  card: {
    flexGrow: 1,
    flexBasis: 150,
    maxWidth: 220,
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  cardHovered: {
    borderColor: colors.primary,
  },
  cardIcon: {
    width: 52,
    height: 52,
    borderRadius: radius.lg,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardLabel: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
});
