import { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../lib/auth-context';
import { supabase } from '../lib/supabase';
import { listProjectExpenses, createProjectExpense, deleteProjectExpense } from '../lib/api/expenses';
import { Button, Card, EmptyState, Field } from './ui';
import { colors, fontSize, radius, spacing } from '../lib/theme';
import type { ProjectExpense } from '../lib/types';

const HOURS_PER_DAY = 8;

function chf(n: number): string {
  return `CHF ${n.toLocaleString('fr-CH', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

// Business days (Mon–Fri) in [start, end], inclusive — a simple stand-in
// for real worked hours since the app doesn't have separate time-clock
// entries: it reuses whatever's already in the Planning module instead of
// asking the team to log hours twice.
function businessDays(startIso: string, endIso: string): number {
  const start = new Date(startIso);
  const end = new Date(endIso);
  let count = 0;
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const day = d.getDay();
    if (day !== 0 && day !== 6) count++;
  }
  return count;
}

export function ProjectProfitability({ projectId, organizationId }: { projectId: string; organizationId: string }) {
  const { user, organization } = useAuth();
  const [expenses, setExpenses] = useState<ProjectExpense[]>([]);
  const [devisedTotal, setDevisedTotal] = useState(0);
  const [laborDays, setLaborDays] = useState(0);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [label, setLabel] = useState('');
  const [amount, setAmount] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [expensesList, { data: devisList }, { data: assignments }] = await Promise.all([
      listProjectExpenses(projectId),
      supabase.from('devis').select('id').eq('project_id', projectId).eq('status', 'accepted'),
      supabase.from('planning_assignments').select('starts_on, ends_on').eq('project_id', projectId),
    ]);
    setExpenses(expensesList);

    const devisIds = (devisList ?? []).map((d) => d.id);
    if (devisIds.length) {
      const { data: items } = await supabase.from('devis_items').select('devis_id, quantity, unit_price').in('devis_id', devisIds);
      setDevisedTotal((items ?? []).reduce((sum, it) => sum + Number(it.quantity) * Number(it.unit_price), 0));
    } else {
      setDevisedTotal(0);
    }

    setLaborDays((assignments ?? []).reduce((sum, a) => sum + businessDays(a.starts_on, a.ends_on), 0));
    setLoading(false);
  }, [projectId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const hourlyCost = organization?.hourly_cost ?? 0;
  const materialCost = useMemo(() => expenses.reduce((sum, e) => sum + Number(e.amount), 0), [expenses]);
  const laborCost = laborDays * HOURS_PER_DAY * hourlyCost;
  const totalCost = materialCost + laborCost;
  const margin = devisedTotal - totalCost;
  const marginPct = devisedTotal > 0 ? (margin / devisedTotal) * 100 : null;

  const tone =
    marginPct === null
      ? { fg: colors.textMuted, bg: colors.surfaceAlt, label: 'En attente d’un devis accepté' }
      : marginPct < 0
        ? { fg: colors.danger, bg: colors.dangerSoft, label: 'Perte' }
        : marginPct < 15
          ? { fg: colors.warning, bg: colors.warningSoft, label: 'Marge serrée' }
          : { fg: colors.success, bg: colors.successSoft, label: 'Rentable' };

  async function handleAddExpense() {
    if (!label.trim() || !amount.trim()) return;
    setSaving(true);
    const { error } = await createProjectExpense(organizationId, projectId, label.trim(), Number(amount) || 0, user?.id ?? null);
    setSaving(false);
    if (!error) {
      setLabel('');
      setAmount('');
      setAddOpen(false);
      load();
    }
  }

  async function handleDelete(id: string) {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    await deleteProjectExpense(id);
  }

  if (loading) return null;

  return (
    <View style={{ gap: spacing.lg }}>
      {hourlyCost === 0 ? (
        <Card style={styles.noticeCard}>
          <Feather name="info" size={16} color={colors.accent} />
          <Text style={styles.noticeText}>
            Réglez votre coût horaire moyen dans Compte → Facturation pour que la main d’œuvre soit comptée dans le calcul.
          </Text>
        </Card>
      ) : null}

      <Card style={[styles.summaryCard, { borderColor: tone.fg }]}>
        <View style={[styles.toneBadge, { backgroundColor: tone.bg }]}>
          <Text style={[styles.toneBadgeText, { color: tone.fg }]}>{tone.label}</Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Devisé (accepté)</Text>
          <Text style={styles.summaryValue}>{chf(devisedTotal)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Coût matériel</Text>
          <Text style={styles.summaryValueMuted}>− {chf(materialCost)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Main d’œuvre ({laborDays} j × {HOURS_PER_DAY}h × {chf(hourlyCost)}/h)</Text>
          <Text style={styles.summaryValueMuted}>− {chf(laborCost)}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryRow}>
          <Text style={styles.marginLabel}>Marge</Text>
          <Text style={[styles.marginValue, { color: tone.fg }]}>
            {chf(margin)}
            {marginPct !== null ? ` (${marginPct.toFixed(0)}%)` : ''}
          </Text>
        </View>
      </Card>

      <View>
        <View style={styles.expensesHeader}>
          <Text style={styles.sectionTitle}>Dépenses matériel</Text>
          <Pressable onPress={() => setAddOpen((v) => !v)} style={styles.addButton} hitSlop={8}>
            <Feather name={addOpen ? 'x' : 'plus'} size={16} color={colors.primary} />
            <Text style={styles.addButtonText}>{addOpen ? 'Annuler' : 'Ajouter une dépense'}</Text>
          </Pressable>
        </View>

        {addOpen ? (
          <Card style={styles.addCard}>
            <Field label="Description" value={label} onChangeText={setLabel} placeholder="Ex : Achat carrelage — Dépôt Sàrl" />
            <Field label="Montant (CHF)" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholder="0" />
            <Button title="Enregistrer" icon="check" onPress={handleAddExpense} loading={saving} style={{ marginTop: spacing.sm }} />
          </Card>
        ) : null}

        {expenses.length === 0 ? (
          <EmptyState title="Aucune dépense saisie" subtitle="Ajoutez vos achats de matériel au fur et à mesure du chantier." />
        ) : (
          <View style={{ gap: spacing.sm }}>
            {expenses.map((e) => (
              <Card key={e.id} style={styles.expenseRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.expenseLabel} numberOfLines={1}>{e.label}</Text>
                  <Text style={styles.expenseDate}>{new Date(e.created_at).toLocaleDateString('fr-CH')}</Text>
                </View>
                <Text style={styles.expenseAmount}>{chf(Number(e.amount))}</Text>
                <Pressable onPress={() => handleDelete(e.id)} hitSlop={8} style={styles.deleteButton}>
                  <Feather name="trash-2" size={15} color={colors.danger} />
                </Pressable>
              </Card>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  noticeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.accentSoft,
    borderColor: colors.accent,
  },
  noticeText: {
    flex: 1,
    fontSize: fontSize.xs,
    color: colors.text,
    lineHeight: 17,
  },
  summaryCard: {
    borderWidth: 1.5,
    gap: spacing.sm,
  },
  toneBadge: {
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    marginBottom: spacing.xs,
  },
  toneBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: '800',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
  },
  summaryLabel: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    flexShrink: 1,
  },
  summaryValue: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  summaryValueMuted: {
    fontSize: fontSize.sm,
    color: colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xs,
  },
  marginLabel: {
    fontSize: fontSize.md,
    fontWeight: '800',
    color: colors.text,
  },
  marginValue: {
    fontSize: fontSize.lg,
    fontWeight: '800',
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  expensesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addButtonText: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.primary,
  },
  addCard: {
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  expenseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  expenseLabel: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
  },
  expenseDate: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  expenseAmount: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
  },
  deleteButton: {
    padding: 4,
  },
});
