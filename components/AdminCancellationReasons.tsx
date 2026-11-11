import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { listCancellationReasons, type CancellationReasonRow } from '../lib/api/cancellation';
import { colors, fontSize, radius, spacing } from '../lib/theme';

// Admin panel: why companies cancel (table subscription_cancellation_reasons).
// One company (its detail page) or the latest across all (Abonnements).
// Internal tool: French only.

const LABELS: Record<string, string> = {
  // picked in the app (lib/api/cancellation.ts)
  too_expensive: 'Trop cher',
  missing_feature: 'Il manque une fonction',
  too_complex: 'Trop compliqué',
  not_used: 'Pas assez utilisé',
  other_tool: 'Passe à un autre outil',
  business_stopped: 'Arrêt ou pause de l’activité',
  seasonal: 'Activité saisonnière',
  other: 'Autre',
  // Stripe's cancellation_details.feedback
  customer_service: 'Service client',
  low_quality: 'Qualité insuffisante',
  missing_features: 'Il manque une fonction',
  switched_service: 'Passe à un autre outil',
  unused: 'Pas assez utilisé',
};

export function AdminCancellationReasons({ organizationId, limit = 30, title = 'Motifs de résiliation' }: { organizationId?: string; limit?: number; title?: string }) {
  const router = useRouter();
  const [rows, setRows] = useState<CancellationReasonRow[] | null>(null);
  const [orgNames, setOrgNames] = useState<Record<string, string>>({});

  useEffect(() => {
    let alive = true;
    listCancellationReasons(organizationId, limit).then(async (r) => {
      if (!alive) return;
      setRows(r);
      if (!organizationId && r.length) {
        const ids = Array.from(new Set(r.map((x) => x.organization_id)));
        const { data } = await supabase.from('organizations').select('id, name').in('id', ids);
        if (alive) setOrgNames(Object.fromEntries((data ?? []).map((o: { id: string; name: string }) => [o.id, o.name])));
      }
    });
    return () => {
      alive = false;
    };
  }, [organizationId, limit]);

  const counts = (rows ?? []).reduce<Record<string, number>>((acc, r) => {
    const k = LABELS[r.reason ?? ''] ?? (r.reason ? r.reason : 'Sans motif');
    acc[k] = (acc[k] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      {rows === null ? (
        <Text style={styles.muted}>Chargement…</Text>
      ) : rows.length === 0 ? (
        <Text style={styles.muted}>Aucun motif enregistré pour l’instant.</Text>
      ) : (
        <>
          {!organizationId ? (
            <View style={styles.chips}>
              {Object.entries(counts)
                .sort((a, b) => b[1] - a[1])
                .map(([k, n]) => (
                  <View key={k} style={styles.chip}>
                    <Text style={styles.chipText}>
                      {k} · {n}
                    </Text>
                  </View>
                ))}
            </View>
          ) : null}
          <View style={styles.list}>
            {rows.map((r) => (
              <Pressable
                key={r.id}
                style={styles.row}
                disabled={!!organizationId}
                onPress={() => router.push(`/(admin)/organizations/${r.organization_id}` as any)}
              >
                <View style={styles.icon}>
                  <Feather name={r.source === 'stripe' ? 'credit-card' : 'message-square'} size={14} color={colors.danger} />
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={styles.reason}>
                    {r.reason ? LABELS[r.reason] ?? r.reason : 'Sans motif choisi'}
                    {!organizationId ? <Text style={styles.org}>{`  ·  ${orgNames[r.organization_id] ?? 'Entreprise'}`}</Text> : null}
                  </Text>
                  {r.comment ? <Text style={styles.comment}>« {r.comment} »</Text> : null}
                  <Text style={styles.meta}>{r.source === 'stripe' ? 'Indiqué dans Stripe' : 'Indiqué dans Cantia'}</Text>
                </View>
                <Text style={styles.meta}>{new Date(r.created_at).toLocaleDateString('fr-CH', { day: 'numeric', month: 'short', year: 'numeric' })}</Text>
              </Pressable>
            ))}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm, marginBottom: spacing.xl },
  title: { fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  muted: { fontSize: fontSize.sm, color: colors.textMuted },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  chip: { borderWidth: 1, borderColor: colors.border, borderRadius: 999, paddingVertical: 4, paddingHorizontal: 10, backgroundColor: colors.surface },
  chipText: { fontSize: fontSize.xs, color: colors.text, fontWeight: '600' },
  list: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, backgroundColor: colors.surface, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  icon: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.dangerSoft },
  reason: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text },
  org: { fontWeight: '400', color: colors.textMuted },
  comment: { fontSize: fontSize.sm, color: colors.text, lineHeight: 19 },
  meta: { fontSize: fontSize.xs, color: colors.textMuted },
});
