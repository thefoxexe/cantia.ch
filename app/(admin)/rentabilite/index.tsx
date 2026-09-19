import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Container, EmptyState, LoadingScreen, Switch } from '../../../components/ui';
import { AdminErrorBanner } from '../../../components/AdminErrorBanner';
import { AdminRefreshButton } from '../../../components/AdminRefreshButton';
import { DateField } from '../../../components/DateField';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';
import { useAdminData } from '../../../lib/adminDataContext';
import { deletePlatformExpense, listPlatformExpenses, upsertPlatformExpense } from '../../../lib/api/admin';
import type { AdminPlatformExpense, PlatformExpenseCategory } from '../../../lib/types';

function formatChf(amount: number): string {
  return new Intl.NumberFormat('fr-CH', { style: 'currency', currency: 'CHF', maximumFractionDigits: 2 }).format(amount);
}

function todayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const CATEGORY_ORDER: PlatformExpenseCategory[] = ['hebergement', 'outils', 'marketing', 'domaine_email', 'juridique_comptable', 'autre'];
const CATEGORY_LABEL: Record<PlatformExpenseCategory, string> = {
  hebergement: 'Hébergement',
  outils: 'Outils / abonnements',
  marketing: 'Marketing',
  domaine_email: 'Domaine & e-mail',
  juridique_comptable: 'Juridique / comptable',
  autre: 'Autre',
};
const CATEGORY_ICON: Record<PlatformExpenseCategory, keyof typeof Feather.glyphMap> = {
  hebergement: 'server',
  outils: 'tool',
  marketing: 'target',
  domaine_email: 'globe',
  juridique_comptable: 'file-text',
  autre: 'more-horizontal',
};

type Draft = {
  category: PlatformExpenseCategory;
  label: string;
  amount_chf: string;
  expense_date: string;
  recurring: boolean;
  notes: string;
};

function draftFrom(e: AdminPlatformExpense): Draft {
  return {
    category: e.category,
    label: e.label,
    amount_chf: String(e.amount_chf),
    expense_date: e.expense_date,
    recurring: e.recurring,
    notes: e.notes ?? '',
  };
}

const BLANK_DRAFT: Draft = {
  category: 'outils',
  label: '',
  amount_chf: '',
  expense_date: todayIso(),
  recurring: false,
  notes: '',
};

function StatTile({ label, value, icon, accent }: { label: string; value: string; icon: keyof typeof Feather.glyphMap; accent?: string }) {
  return (
    <View style={styles.statTile}>
      <View style={[styles.statIcon, accent ? { backgroundColor: `${accent}1c` } : null]}>
        <Feather name={icon} size={15} color={accent ?? colors.textMuted} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.statValue, accent ? { color: accent } : null]}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </View>
  );
}

export default function AdminRentabiliteScreen() {
  const { overview, loading: overviewLoading, refresh: refreshOverview } = useAdminData();
  const [expenses, setExpenses] = useState<AdminPlatformExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | 'new' | null>(null);
  const [draft, setDraft] = useState<Draft>(BLANK_DRAFT);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { rows, error: err } = await listPlatformExpenses();
    setExpenses(rows);
    setError(err);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const now = new Date();
  const monthStartIso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

  const expensesThisMonthChf = useMemo(
    () => expenses.filter((e) => e.expense_date >= monthStartIso).reduce((sum, e) => sum + e.amount_chf, 0),
    [expenses, monthStartIso],
  );
  const expensesTotalChf = useMemo(() => expenses.reduce((sum, e) => sum + e.amount_chf, 0), [expenses]);

  const byCategory = useMemo(() => {
    const map = new Map<PlatformExpenseCategory, number>();
    for (const e of expenses) map.set(e.category, (map.get(e.category) ?? 0) + e.amount_chf);
    return map;
  }, [expenses]);

  const cashThisMonth = overview?.ca_this_month_chf ?? 0;
  const cashTotal = overview?.ca_total_chf ?? 0;
  const netThisMonth = cashThisMonth - expensesThisMonthChf;
  const netTotal = cashTotal - expensesTotalChf;

  function openExisting(e: AdminPlatformExpense) {
    setExpandedId(e.id);
    setDraft(draftFrom(e));
  }

  function openNew() {
    setExpandedId('new');
    setDraft(BLANK_DRAFT);
  }

  async function save(id: string | 'new') {
    const amount = Number(draft.amount_chf.replace(',', '.'));
    if (!draft.label.trim() || !Number.isFinite(amount) || amount < 0) return;
    setSaving(true);
    const existing = id !== 'new' ? expenses.find((e) => e.id === id) : null;
    const { expense, error: err } = await upsertPlatformExpense({
      id: existing?.id ?? null,
      category: draft.category,
      label: draft.label.trim(),
      amount_chf: amount,
      expense_date: draft.expense_date || todayIso(),
      recurring: draft.recurring,
      notes: draft.notes.trim() || null,
    });
    if (!err && expense) {
      setExpenses((prev) => {
        const withoutOld = prev.filter((e) => e.id !== expense.id);
        return [...withoutOld, expense].sort((a, b) => (a.expense_date < b.expense_date ? 1 : -1));
      });
      setExpandedId(null);
    } else if (err) {
      setError(err);
    }
    setSaving(false);
  }

  async function remove(id: string) {
    setSaving(true);
    const { error: err } = await deletePlatformExpense(id);
    if (!err) {
      setExpenses((prev) => prev.filter((e) => e.id !== id));
      setExpandedId(null);
    } else {
      setError(err);
    }
    setSaving(false);
  }

  async function refreshAll() {
    await Promise.all([load(), refreshOverview()]);
  }

  return (
    <ScrollView style={{ flex: 1 }}>
      <Container style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Rentabilité</Text>
            <Text style={styles.hint}>Cash réellement encaissé (frais Stripe déjà déduits) moins les dépenses de la plateforme.</Text>
          </View>
          <AdminRefreshButton onPress={refreshAll} loading={loading || overviewLoading} />
        </View>

        {error ? <AdminErrorBanner message={error} /> : null}

        <View style={styles.statGrid}>
          <StatTile label="Cash net encaissé — ce mois" value={formatChf(cashThisMonth)} icon="dollar-sign" accent={colors.success} />
          <StatTile label="Dépenses — ce mois" value={formatChf(expensesThisMonthChf)} icon="trending-down" accent={colors.danger} />
          <StatTile
            label="Rentabilité nette — ce mois"
            value={formatChf(netThisMonth)}
            icon={netThisMonth >= 0 ? 'trending-up' : 'alert-triangle'}
            accent={netThisMonth >= 0 ? colors.success : colors.danger}
          />
        </View>
        <View style={styles.statGrid}>
          <StatTile label="Cash net encaissé — à vie" value={formatChf(cashTotal)} icon="dollar-sign" />
          <StatTile label="Dépenses — à vie" value={formatChf(expensesTotalChf)} icon="trending-down" />
          <StatTile
            label="Rentabilité nette — à vie"
            value={formatChf(netTotal)}
            icon={netTotal >= 0 ? 'trending-up' : 'alert-triangle'}
            accent={netTotal >= 0 ? colors.success : colors.danger}
          />
        </View>

        {expenses.length > 0 ? (
          <View style={styles.categoryRow}>
            {CATEGORY_ORDER.filter((c) => byCategory.get(c)).map((c) => (
              <View key={c} style={styles.categoryChip}>
                <Feather name={CATEGORY_ICON[c]} size={12} color={colors.textMuted} />
                <Text style={styles.categoryChipLabel}>{CATEGORY_LABEL[c]}</Text>
                <Text style={styles.categoryChipValue}>{formatChf(byCategory.get(c) ?? 0)}</Text>
              </View>
            ))}
          </View>
        ) : null}

        <Text style={styles.groupTitle}>Dépenses</Text>

        {loading ? (
          <LoadingScreen label="Chargement…" />
        ) : expenses.length === 0 ? (
          <EmptyState title="Aucune dépense enregistrée" subtitle="Ajoute la première ci-dessous." />
        ) : (
          <View style={styles.list}>
            {expenses.map((e) => {
              const open = expandedId === e.id;
              const activeDraft = open ? draft : draftFrom(e);
              return (
                <View key={e.id} style={styles.card}>
                  <Pressable style={styles.row} onPress={() => (open ? setExpandedId(null) : openExisting(e))}>
                    <View style={styles.rowIcon}>
                      <Feather name={CATEGORY_ICON[e.category]} size={14} color={colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.rowLabel}>{e.label}</Text>
                      <Text style={styles.rowMeta}>
                        {CATEGORY_LABEL[e.category]} · {new Date(`${e.expense_date}T00:00:00`).toLocaleDateString('fr-CH')}
                        {e.recurring ? ' · récurrent' : ''}
                      </Text>
                    </View>
                    <Text style={styles.rowAmount}>{formatChf(e.amount_chf)}</Text>
                    <Feather name={open ? 'chevron-up' : 'chevron-down'} size={16} color={colors.textMuted} />
                  </Pressable>

                  {open ? (
                    <ExpenseEditor
                      draft={activeDraft}
                      setDraft={setDraft}
                      saving={saving}
                      onSave={() => save(e.id)}
                      onDelete={() => remove(e.id)}
                      onCancel={() => setExpandedId(null)}
                    />
                  ) : null}
                </View>
              );
            })}
          </View>
        )}

        {expandedId === 'new' ? (
          <View style={[styles.card, styles.newCard]}>
            <Text style={styles.groupTitle}>Nouvelle dépense</Text>
            <ExpenseEditor draft={draft} setDraft={setDraft} saving={saving} onSave={() => save('new')} onCancel={() => setExpandedId(null)} />
          </View>
        ) : (
          <Pressable style={styles.addButton} onPress={openNew}>
            <Feather name="plus" size={16} color={colors.primary} />
            <Text style={styles.addButtonText}>Ajouter une dépense</Text>
          </Pressable>
        )}
      </Container>
    </ScrollView>
  );
}

function ExpenseEditor({
  draft,
  setDraft,
  saving,
  onSave,
  onDelete,
  onCancel,
}: {
  draft: Draft;
  setDraft: (d: Draft) => void;
  saving: boolean;
  onSave: () => void;
  onDelete?: () => void;
  onCancel: () => void;
}) {
  return (
    <View style={styles.editor}>
      <Text style={styles.fieldLabel}>Catégorie</Text>
      <View style={styles.categoryPicker}>
        {CATEGORY_ORDER.map((c) => {
          const active = draft.category === c;
          return (
            <Pressable
              key={c}
              onPress={() => setDraft({ ...draft, category: c })}
              style={[styles.categoryOption, active && styles.categoryOptionActive]}
            >
              <Feather name={CATEGORY_ICON[c]} size={12} color={active ? colors.primary : colors.textMuted} />
              <Text style={[styles.categoryOptionText, active && styles.categoryOptionTextActive]}>{CATEGORY_LABEL[c]}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.editorRow}>
        <View style={{ flex: 2 }}>
          <Text style={styles.fieldLabel}>Libellé</Text>
          <TextInput
            value={draft.label}
            onChangeText={(v) => setDraft({ ...draft, label: v })}
            style={styles.input}
            placeholder="Ex. Supabase — plan Pro"
            placeholderTextColor={colors.textMuted}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.fieldLabel}>Montant (CHF)</Text>
          <TextInput
            value={draft.amount_chf}
            onChangeText={(v) => setDraft({ ...draft, amount_chf: v })}
            style={styles.input}
            placeholder="0.00"
            placeholderTextColor={colors.textMuted}
            keyboardType="decimal-pad"
          />
        </View>
      </View>

      <View style={styles.editorRow}>
        <View style={{ flex: 1 }}>
          <DateField label="Date" value={draft.expense_date} onChange={(iso) => setDraft({ ...draft, expense_date: iso ?? todayIso() })} />
        </View>
        <View style={styles.recurringRow}>
          <Text style={styles.fieldLabel}>Récurrent</Text>
          <Switch value={draft.recurring} onChange={(v) => setDraft({ ...draft, recurring: v })} />
        </View>
      </View>

      <Text style={styles.fieldLabel}>Notes</Text>
      <TextInput
        value={draft.notes}
        onChangeText={(v) => setDraft({ ...draft, notes: v })}
        style={[styles.input, styles.textareaSmall]}
        multiline
        numberOfLines={2}
        placeholder="Optionnel"
        placeholderTextColor={colors.textMuted}
      />

      <View style={styles.editorActions}>
        {onDelete ? (
          <Pressable style={styles.deleteButton} onPress={onDelete} disabled={saving}>
            <Feather name="trash-2" size={14} color={colors.danger} />
            <Text style={styles.deleteButtonText}>Supprimer</Text>
          </Pressable>
        ) : (
          <View />
        )}
        <View style={styles.editorActionsRight}>
          <Pressable style={styles.cancelButton} onPress={onCancel} disabled={saving}>
            <Text style={styles.cancelButtonText}>Annuler</Text>
          </Pressable>
          <Pressable style={styles.saveButton} onPress={onSave} disabled={saving}>
            <Text style={styles.saveButtonText}>{saving ? 'Enregistrement…' : 'Enregistrer'}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.text,
  },
  hint: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 4,
    maxWidth: 560,
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  statTile: {
    flex: 1,
    minWidth: 180,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: fontSize.lg,
    fontWeight: '800',
    color: colors.text,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    backgroundColor: colors.surface,
  },
  categoryChipLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
  },
  categoryChipValue: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.text,
  },
  groupTitle: {
    fontSize: fontSize.xs,
    fontWeight: '800',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: spacing.sm,
  },
  list: {
    gap: spacing.sm,
  },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  newCard: {
    marginTop: spacing.lg,
    padding: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  rowIcon: {
    width: 30,
    height: 30,
    borderRadius: radius.sm,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
  },
  rowMeta: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  rowAmount: {
    fontSize: fontSize.sm,
    fontWeight: '800',
    color: colors.text,
  },
  editor: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  categoryPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    backgroundColor: colors.bg,
  },
  categoryOptionActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  categoryOptionText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
  },
  categoryOptionTextActive: {
    color: colors.primaryDark,
    fontWeight: '700',
  },
  editorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    alignItems: 'flex-end',
  },
  recurringRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    fontSize: fontSize.sm,
    color: colors.text,
    backgroundColor: colors.bg,
  },
  textareaSmall: {
    minHeight: 50,
    textAlignVertical: 'top',
  },
  editorActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  editorActionsRight: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  deleteButtonText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.danger,
  },
  cancelButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  cancelButtonText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.textMuted,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  saveButtonText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: '#fff',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    marginTop: spacing.xl,
  },
  addButtonText: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.primary,
  },
});
