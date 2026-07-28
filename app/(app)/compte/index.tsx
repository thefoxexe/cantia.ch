import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../../lib/auth-context';
import { supabase } from '../../../lib/supabase';
import { Button, Card, Container, Screen } from '../../../components/ui';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';

type IconName = keyof typeof Feather.glyphMap;

interface MenuItem {
  key: string;
  icon: IconName;
  title: string;
  subtitle: string;
  route: string;
}

export default function CompteMenuScreen() {
  const { organization, signOut } = useAuth();
  const router = useRouter();
  const [memberCount, setMemberCount] = useState<number | null>(null);
  const [planName, setPlanName] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!organization) return;
    const [{ count }, { data: plan }] = await Promise.all([
      supabase.from('organization_members').select('id', { count: 'exact', head: true }).eq('organization_id', organization.id),
      supabase.from('plans').select('name').eq('id', organization.plan_id).maybeSingle(),
    ]);
    setMemberCount(count ?? null);
    setPlanName(plan?.name ?? null);
  }, [organization]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const items: MenuItem[] = [
    {
      key: 'entreprise',
      icon: 'briefcase',
      title: 'Profil entreprise',
      subtitle: organization?.name ?? '—',
      route: '/(app)/compte/entreprise',
    },
    {
      key: 'devis',
      icon: 'file-text',
      title: 'Devis & modèle PDF',
      subtitle: 'TVA, conditions, mise en page',
      route: '/(app)/compte/devis',
    },
    {
      key: 'modules',
      icon: 'sliders',
      title: 'Outils & modules',
      subtitle: 'Activez ce dont vous avez besoin',
      route: '/(app)/compte/modules',
    },
    {
      key: 'facturation',
      icon: 'credit-card',
      title: 'Facturation',
      subtitle: planName ? `Plan ${planName}` : '—',
      route: '/(app)/compte/facturation',
    },
    {
      key: 'equipe',
      icon: 'users',
      title: 'Équipe',
      subtitle: memberCount != null ? `${memberCount} membre${memberCount > 1 ? 's' : ''}` : '—',
      route: '/(app)/compte/equipe',
    },
  ];

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl * 2 }}>
        <Container>
          <Text style={styles.pageTitle}>Paramètres</Text>
          <Card style={styles.menuCard}>
            {items.map((item, i) => (
              <Pressable
                key={item.key}
                onPress={() => router.push(item.route as any)}
                style={[styles.row, i < items.length - 1 && styles.rowBorder]}
              >
                <View style={styles.rowIcon}>
                  <Feather name={item.icon} size={17} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowTitle}>{item.title}</Text>
                  <Text style={styles.rowSubtitle}>{item.subtitle}</Text>
                </View>
                <Feather name="chevron-right" size={18} color={colors.textMuted} />
              </Pressable>
            ))}
          </Card>

          <Button title="Se déconnecter" icon="log-out" variant="secondary" onPress={signOut} style={{ marginTop: spacing.xl }} />
        </Container>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  pageTitle: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.lg,
  },
  menuCard: {
    padding: 0,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  rowSubtitle: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
});
