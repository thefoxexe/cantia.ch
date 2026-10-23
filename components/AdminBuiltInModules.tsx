import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { supabase } from '../lib/supabase';
import { ORG_MODULES, PROJECT_MODULES, PROJECT_MODULE_PLAN_GATED, type ModuleKey } from '../lib/modules';
import type { Plan } from '../lib/types';
import { colors, fontSize, radius, spacing } from '../lib/theme';

// Super Admin › Modules: the modules every build ships with, and which plan
// gets each one — read live from the plans table, never retyped. Internal
// tool: French only.

const PLANS: { id: string; label: string }[] = [
  { id: 'solo', label: 'Essentiel' },
  { id: 'equipe', label: 'Équipe' },
  { id: 'pro', label: 'Entreprise' },
];

// Org-wide gates (same as app/(app)/compte/modules.tsx).
const ORG_PLAN_GATED: Partial<Record<ModuleKey, keyof Plan>> = {
  planning: 'has_planning',
  payroll: 'has_payroll',
  treasury: 'has_treasury',
};

const BUILDING_ONLY: ModuleKey[] = ['metre', 'gantt'];
const BETA: ModuleKey[] = ['metre'];

function cell(key: ModuleKey, plan: Plan | undefined, field: keyof Plan | undefined): { text: string; on: boolean } {
  if (!plan) return { text: '…', on: false };
  if (field && !plan[field]) return { text: '—', on: false };
  if (key === 'metre') return { text: plan.max_tenders_per_month ? `${plan.max_tenders_per_month} / mois` : 'Illimité', on: true };
  return { text: 'Oui', on: true };
}

export function AdminBuiltInModules() {
  const [plans, setPlans] = useState<Record<string, Plan>>({});

  useEffect(() => {
    supabase
      .from('plans')
      .select('*')
      .in('id', PLANS.map((p) => p.id))
      .then(({ data }) => setPlans(Object.fromEntries(((data ?? []) as Plan[]).map((p) => [p.id, p]))));
  }, []);

  const rows: { key: ModuleKey; label: string; scope: string; field: keyof Plan | undefined }[] = [
    ...ORG_MODULES.map((m) => ({ key: m.key, label: m.label, scope: 'Entreprise', field: ORG_PLAN_GATED[m.key] })),
    ...PROJECT_MODULES.map((m) => ({ key: m.key, label: m.label, scope: 'Par chantier', field: PROJECT_MODULE_PLAN_GATED[m.key] })),
  ];

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Modules intégrés, par plan</Text>
      <Text style={styles.hint}>
        Livrés avec l’app pour tout le monde. « Par chantier » : cochés d’office sur chaque nouveau chantier (Paramètres › Modules › Outils des nouveaux
        chantiers), chaque chantier peut les retirer. Soumission et planning de chantier : entreprises du bâtiment seulement.
      </Text>
      <ScrollView horizontal contentContainerStyle={{ minWidth: '100%' }}>
        <View style={{ flex: 1, minWidth: 560 }}>
          <View style={[styles.row, styles.headRow]}>
            <Text style={[styles.name, styles.head]}>Module</Text>
            <Text style={[styles.scope, styles.head]}>Portée</Text>
            {PLANS.map((p) => (
              <Text key={p.id} style={[styles.cell, styles.head]}>
                {p.label}
              </Text>
            ))}
          </View>
          {rows.map((r) => (
            <View key={r.key} style={styles.row}>
              <View style={styles.name}>
                <Text style={styles.label}>
                  {r.label.replace(/ \(bêta\)$/, '')}
                  {BETA.includes(r.key) ? <Text style={styles.beta}>  BÊTA</Text> : null}
                </Text>
                {BUILDING_ONLY.includes(r.key) ? <Text style={styles.sub}>Bâtiment seulement</Text> : null}
              </View>
              <Text style={styles.scope}>{r.scope}</Text>
              {PLANS.map((p) => {
                const c = cell(r.key, plans[p.id], r.field);
                return (
                  <Text key={p.id} style={[styles.cell, { color: c.on ? colors.success : colors.textMuted, fontWeight: c.on ? '700' : '400' }]}>
                    {c.text}
                  </Text>
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  title: { fontSize: fontSize.lg, fontWeight: '700', color: colors.text },
  hint: { fontSize: fontSize.xs, color: colors.textMuted, lineHeight: 17 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border },
  headRow: { borderBottomColor: colors.text },
  head: { fontSize: fontSize.xs, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.4 },
  name: { flex: 2, minWidth: 180 },
  label: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text },
  beta: { fontSize: 10, fontWeight: '800', color: colors.warning },
  sub: { fontSize: 11, color: colors.textMuted, marginTop: 1 },
  scope: { flex: 1, fontSize: fontSize.xs, color: colors.textMuted },
  cell: { flex: 1, fontSize: fontSize.sm, textAlign: 'center', fontVariant: ['tabular-nums'] },
});
