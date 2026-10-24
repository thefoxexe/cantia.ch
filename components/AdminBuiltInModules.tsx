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
  if (key === 'metre') {
    if (plan.max_tenders_total) return { text: `${plan.max_tenders_total} à l’essai`, on: true };
    return { text: plan.max_tenders_per_month ? `${plan.max_tenders_per_month} / mois` : 'Illimité', on: true };
  }
  return { text: 'Oui', on: true };
}

const yes = (v: unknown) => ({ text: v ? 'Oui' : '—', on: !!v });
const quota = (v: number | null | undefined, unit = '') => ({ text: v == null ? 'Illimité' : `${v}${unit}`, on: v == null || v > 0 });
const storage = (mb: number) => ({ text: mb >= 1024 ? `${Math.round(mb / 1024)} Go` : `${mb} Mo`, on: true });

// Everything else a plan decides, beyond the modules: capacity, then the
// features that sit inside modules (sending, branding, sales tracking…).
const LIMITS: { label: string; sub?: string; value: (p: Plan) => { text: string; on: boolean } }[] = [
  { label: 'Prix', value: (p) => ({ text: p.price_chf_monthly != null ? `CHF ${Number(p.price_chf_monthly)}.– / mois` : 'Sur demande', on: true }) },
  { label: 'Personnes', value: (p) => quota(p.max_members) },
  { label: 'Rôles d’équipe', value: (p) => quota(p.max_org_roles) },
  { label: 'Stockage', value: (p) => storage(p.storage_quota_mb) },
  { label: 'Assistant vocal IA', value: (p) => quota(p.max_ai_uses_per_month, ' / mois') },
  { label: 'Devis & factures', value: (p) => quota(p.max_devis_factures_per_month, ' / mois') },
  { label: 'Modèles de devis', value: (p) => quota(p.max_trames) },
];
const FEATURES: { label: string; sub?: string; value: (p: Plan) => { text: string; on: boolean } }[] = [
  { label: 'Envoi par e-mail', sub: 'Devis, factures, travaux supplémentaires', value: (p) => yes(p.has_email_sending) },
  { label: 'Logo et couleur sur les documents', value: (p) => yes(p.has_customization) },
  { label: 'Langue des documents par client', value: (p) => yes(p.has_document_locale_override) },
  { label: 'Suivi commercial et relances de devis', sub: 'Page Commercial, ouvertures, relances automatiques', value: (p) => yes(p.has_sales_tracking) },
  { label: 'Intégration Bexio', value: (p) => yes(p.has_bexio_integration) },
  { label: 'Support prioritaire', value: (p) => yes(p.id === 'pro') },
];

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

  const section = (title: string) => (
    <View style={[styles.row, styles.sectionRow]}>
      <Text style={styles.section}>{title}</Text>
    </View>
  );
  const plainRows = (list: typeof LIMITS) =>
    list.map((r) => (
      <View key={r.label} style={styles.row}>
        <View style={styles.name}>
          <Text style={styles.label}>{r.label}</Text>
          {r.sub ? <Text style={styles.sub}>{r.sub}</Text> : null}
        </View>
        <Text style={styles.scope} />
        {PLANS.map((p) => {
          const c = plans[p.id] ? r.value(plans[p.id]) : { text: '…', on: false };
          return (
            <Text key={p.id} style={[styles.cell, { color: c.on ? colors.success : colors.textMuted, fontWeight: c.on ? '700' : '400' }]}>
              {c.text}
            </Text>
          );
        })}
      </View>
    ));

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Ce que contient chaque plan</Text>
      <Text style={styles.hint}>
        Lu en direct dans la table des plans. « Par chantier » : cochés d’office sur chaque nouveau chantier (Paramètres › Modules › Outils des
        nouveaux chantiers), chaque chantier peut les retirer. Soumission et planning de chantier : entreprises du bâtiment seulement.
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
          {section('Capacité')}
          {plainRows(LIMITS)}
          {section('Modules')}
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
          {section('Fonctions')}
          {plainRows(FEATURES)}
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
  sectionRow: { borderBottomWidth: 0, paddingTop: spacing.md, paddingBottom: 2 },
  section: { fontSize: 11, fontWeight: '800', color: colors.primary, textTransform: 'uppercase', letterSpacing: 0.6 },
  head: { fontSize: fontSize.xs, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.4 },
  name: { flex: 2, minWidth: 180 },
  label: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text },
  beta: { fontSize: 10, fontWeight: '800', color: colors.warning },
  sub: { fontSize: 11, color: colors.textMuted, marginTop: 1 },
  scope: { flex: 1, fontSize: fontSize.xs, color: colors.textMuted },
  cell: { flex: 1, fontSize: fontSize.sm, textAlign: 'center', fontVariant: ['tabular-nums'] },
});
