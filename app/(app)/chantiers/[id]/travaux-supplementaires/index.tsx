import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useProject } from '../../../../../lib/useProject';
import { supabase } from '../../../../../lib/supabase';
import { Button, Card, EmptyState, LoadingScreen, PageHeader, Screen, StatusBadge } from '../../../../../components/ui';
import { colors, fontSize, spacing } from '../../../../../lib/theme';
import type { ExtraWork, ExtraWorkItem } from '../../../../../lib/types';

function chf(n: number): string {
  return `${n.toLocaleString('fr-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} CHF`;
}

export default function ExtraWorksListScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { project } = useProject(id);
  const [works, setWorks] = useState<ExtraWork[]>([]);
  const [totals, setTotals] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data: w } = await supabase
      .from('extra_works')
      .select('*')
      .eq('project_id', id)
      .order('created_at', { ascending: false });
    setWorks(w ?? []);
    if (w?.length) {
      const { data: items } = await supabase
        .from('extra_work_items')
        .select('extra_work_id, quantity, unit_price')
        .in('extra_work_id', w.map((x) => x.id));
      const byWork = new Map<string, number>();
      for (const it of (items as Pick<ExtraWorkItem, 'quantity' | 'unit_price'>[] & { extra_work_id: string }[]) ?? []) {
        byWork.set(it.extra_work_id, (byWork.get(it.extra_work_id) ?? 0) + Number(it.quantity) * Number(it.unit_price));
      }
      const next: Record<string, number> = {};
      for (const wk of w) {
        const subtotal = byWork.get(wk.id) ?? 0;
        next[wk.id] = subtotal * (1 + Number(wk.vat_rate) / 100);
      }
      setTotals(next);
    }
    setLoading(false);
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  if (!project) {
    return (
      <Screen>
        <LoadingScreen />
      </Screen>
    );
  }

  return (
    <Screen style={{ padding: spacing.xl }}>
      <View style={styles.container}>
        <PageHeader title="Travaux supplémentaires" backTo={`/(app)/chantiers/${id}`} />
        <Text style={styles.projectName}>{project.name}</Text>
        <Text style={styles.hint}>
          Un extra demandé en cours de chantier ("tant que vous y êtes...") ne se perd plus jamais — capturez-le, faites-le valider et signer par
          le client, il devient une facture automatiquement.
        </Text>

        <Button
          title="Nouveaux travaux supplémentaires"
          icon="plus"
          onPress={() => router.push(`/(app)/chantiers/${id}/travaux-supplementaires/new`)}
          style={{ marginBottom: spacing.lg }}
        />

        {loading ? (
          <LoadingScreen />
        ) : works.length === 0 ? (
          <EmptyState title="Aucun travaux supplémentaires" subtitle="Rien d'enregistré pour ce chantier pour le moment." />
        ) : (
          <ScrollView contentContainerStyle={{ paddingBottom: spacing.xxl, gap: spacing.md }} showsVerticalScrollIndicator={false}>
            {works.map((w) => (
              <Pressable key={w.id} onPress={() => router.push(`/(app)/chantiers/${id}/travaux-supplementaires/${w.id}` as any)}>
                <Card style={styles.card}>
                  <View style={styles.cardBody}>
                    <View style={styles.row}>
                      <Text style={styles.number}>{w.number ?? 'Brouillon'}</Text>
                      <StatusBadge status={w.status} />
                    </View>
                    <Text style={styles.title}>{w.title}</Text>
                    <Text style={styles.meta}>
                      {chf(totals[w.id] ?? 0)} · {new Date(w.created_at).toLocaleDateString('fr-CH')}
                    </Text>
                  </View>
                  <Feather name="chevron-right" size={18} color={colors.textMuted} />
                </Card>
              </Pressable>
            ))}
          </ScrollView>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
  },
  projectName: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  hint: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing.lg,
    lineHeight: 19,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  cardBody: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  number: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  title: {
    fontSize: fontSize.md,
    color: colors.text,
  },
  meta: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: 2,
  },
});
