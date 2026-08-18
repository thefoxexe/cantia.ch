import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../../lib/auth-context';
import { supabase } from '../../../lib/supabase';
import {
  computeSalaryBreakdown,
  getPayrollProfile,
  listExpenses,
  listTimeEntries,
  upsertPayrollProfile,
  type PayrollExpenseWithProject,
  type PayrollTimeEntryWithProject,
} from '../../../lib/api/payroll';
import { Button, Card, EmptyState, LoadingScreen, PageHeader, Screen } from '../../../components/ui';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';
import type { PayrollProfile, SalaryType } from '../../../lib/types';

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function endOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}
function toIso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function monthLabel(d: Date): string {
  const label = d.toLocaleDateString('fr-CH', { month: 'long', year: 'numeric' });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

// Numeric text field with an editable-string draft so the user can clear
// the box and type freely, instead of the value snapping back to "0" on
// every keystroke while it's empty or mid-edit (e.g. typing "5.").
function RateField({ label, value, onChange, suffix }: { label: string; value: string; onChange: (v: string) => void; suffix?: string }) {
  return (
    <View style={styles.rateField}>
      <Text style={styles.rateLabel}>{label}</Text>
      <View style={styles.rateInputRow}>
        <TextInput
          style={styles.rateInput}
          value={value}
          onChangeText={onChange}
          keyboardType="decimal-pad"
          placeholder="0"
          placeholderTextColor={colors.textMuted}
        />
        {suffix ? <Text style={styles.rateSuffix}>{suffix}</Text> : null}
      </View>
    </View>
  );
}

export default function PayrollProfileScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const { organization, user, canManagePayroll } = useAuth();
  const router = useRouter();
  const [monthAnchor] = useState(() => startOfMonth(new Date()));
  const [memberName, setMemberName] = useState('Membre');
  const [profile, setProfile] = useState<PayrollProfile | null>(null);
  const [entries, setEntries] = useState<PayrollTimeEntryWithProject[]>([]);
  const [expenses, setExpenses] = useState<PayrollExpenseWithProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [salaryType, setSalaryType] = useState<SalaryType>('hourly');
  const [hourlyRate, setHourlyRate] = useState('');
  const [monthlySalary, setMonthlySalary] = useState('');
  const [avsRate, setAvsRate] = useState('5.3');
  const [acRate, setAcRate] = useState('1.1');
  const [lppAmount, setLppAmount] = useState('0');
  const [laaRate, setLaaRate] = useState('0.5');
  const [sourceTaxRate, setSourceTaxRate] = useState('0');
  const [notes, setNotes] = useState('');

  const rangeStart = useMemo(() => toIso(monthAnchor), [monthAnchor]);
  const rangeEnd = useMemo(() => toIso(endOfMonth(monthAnchor)), [monthAnchor]);

  const load = useCallback(async () => {
    if (!organization || !userId) return;
    setLoading(true);
    const [{ data: memberRow }, profileRow, entryRows, expenseRows] = await Promise.all([
      supabase
        .from('organization_members')
        .select('full_name')
        .eq('organization_id', organization.id)
        .eq('user_id', userId)
        .maybeSingle(),
      getPayrollProfile(organization.id, userId),
      listTimeEntries(organization.id, userId, rangeStart, rangeEnd),
      listExpenses(organization.id, userId, rangeStart, rangeEnd),
    ]);
    setMemberName(memberRow?.full_name || 'Membre');
    setProfile(profileRow);
    setEntries(entryRows);
    setExpenses(expenseRows);
    if (profileRow) {
      setSalaryType(profileRow.salary_type);
      setHourlyRate(profileRow.hourly_rate_chf != null ? String(profileRow.hourly_rate_chf) : '');
      setMonthlySalary(profileRow.monthly_salary_chf != null ? String(profileRow.monthly_salary_chf) : '');
      setAvsRate(String(profileRow.avs_rate_percent));
      setAcRate(String(profileRow.ac_rate_percent));
      setLppAmount(String(profileRow.lpp_amount_chf));
      setLaaRate(String(profileRow.laa_rate_percent));
      setSourceTaxRate(String(profileRow.source_tax_rate_percent));
      setNotes(profileRow.notes ?? '');
    }
    setLoading(false);
  }, [organization, userId, rangeStart, rangeEnd]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const totalHours = Math.round(entries.reduce((sum, e) => sum + Number(e.hours), 0) * 100) / 100;
  const totalExpenses = Math.round(expenses.reduce((sum, e) => sum + Number(e.amount_chf), 0) * 100) / 100;

  const num = (s: string) => Number(s.replace(',', '.')) || 0;
  const gross = salaryType === 'hourly' ? Math.round(num(hourlyRate) * totalHours * 100) / 100 : num(monthlySalary);
  const breakdown = computeSalaryBreakdown(gross, {
    ...(profile ?? ({} as PayrollProfile)),
    avs_rate_percent: num(avsRate),
    ac_rate_percent: num(acRate),
    lpp_amount_chf: num(lppAmount),
    laa_rate_percent: num(laaRate),
    source_tax_rate_percent: num(sourceTaxRate),
  });

  async function handleSave() {
    if (!organization || !userId || !user) return;
    setSaving(true);
    setError(null);
    const { error: err } = await upsertPayrollProfile(
      organization.id,
      userId,
      {
        salary_type: salaryType,
        hourly_rate_chf: salaryType === 'hourly' ? num(hourlyRate) : null,
        monthly_salary_chf: salaryType === 'monthly' ? num(monthlySalary) : null,
        avs_rate_percent: num(avsRate),
        ac_rate_percent: num(acRate),
        lpp_amount_chf: num(lppAmount),
        laa_rate_percent: num(laaRate),
        source_tax_rate_percent: num(sourceTaxRate),
        notes: notes.trim() || null,
      },
      user.id,
    );
    setSaving(false);
    if (err) {
      setError(err);
      return;
    }
    load();
  }

  if (loading && !profile && entries.length === 0) {
    return (
      <Screen>
        <LoadingScreen />
      </Screen>
    );
  }

  if (!canManagePayroll) {
    return (
      <Screen style={{ padding: spacing.xl }}>
        <PageHeader title="Fiche employé" backTo="/(app)/rh" />
        <Card style={styles.upsell}>
          <Feather name="lock" size={22} color={colors.textMuted} />
          <Text style={styles.upsellTitle}>Accès non autorisé</Text>
          <Text style={styles.upsellText}>Seuls la secrétaire RH et les administrateurs gèrent les fiches de salaire.</Text>
        </Card>
      </Screen>
    );
  }

  return (
    <Screen style={{ padding: spacing.xl }}>
      <View style={styles.container}>
        <PageHeader title={memberName} backTo="/(app)/rh" />
        <Text style={styles.pageSubtitle}>{monthLabel(monthAnchor)} — fiche de salaire et suivi des heures.</Text>

        <ScrollView contentContainerStyle={{ paddingBottom: spacing.xxl * 2, gap: spacing.xl }}>
          <Card style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{totalHours} h</Text>
              <Text style={styles.statLabel}>Heures ce mois</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>CHF {totalExpenses.toFixed(2)}</Text>
              <Text style={styles.statLabel}>Frais ce mois</Text>
            </View>
          </Card>

          <Card>
            <Text style={styles.sectionTitle}>Salaire</Text>

            <View style={styles.chips}>
              <Pressable onPress={() => setSalaryType('hourly')} style={[styles.chip, salaryType === 'hourly' && styles.chipActive]}>
                <Text style={[styles.chipText, salaryType === 'hourly' && styles.chipTextActive]}>À l'heure</Text>
              </Pressable>
              <Pressable onPress={() => setSalaryType('monthly')} style={[styles.chip, salaryType === 'monthly' && styles.chipActive]}>
                <Text style={[styles.chipText, salaryType === 'monthly' && styles.chipTextActive]}>Salaire fixe</Text>
              </Pressable>
            </View>

            {salaryType === 'hourly' ? (
              <RateField label="Taux horaire" value={hourlyRate} onChange={setHourlyRate} suffix="CHF/h" />
            ) : (
              <RateField label="Salaire mensuel brut" value={monthlySalary} onChange={setMonthlySalary} suffix="CHF" />
            )}

            <Text style={[styles.sectionTitle, { marginTop: spacing.lg }]}>Cotisations & taxes</Text>
            <Text style={styles.hint}>
              Taux par défaut à titre indicatif (AVS/AC 2026, part employé) — à ajuster selon votre caisse de
              compensation, votre caisse LPP et le canton pour l'impôt à la source.
            </Text>
            <View style={styles.rateGrid}>
              <RateField label="AVS/AI/APG" value={avsRate} onChange={setAvsRate} suffix="%" />
              <RateField label="AC" value={acRate} onChange={setAcRate} suffix="%" />
              <RateField label="LPP (2ᵉ pilier)" value={lppAmount} onChange={setLppAmount} suffix="CHF" />
              <RateField label="LAA (accidents)" value={laaRate} onChange={setLaaRate} suffix="%" />
              <RateField label="Impôt à la source" value={sourceTaxRate} onChange={setSourceTaxRate} suffix="%" />
            </View>

            <Text style={styles.fieldLabel}>Notes (optionnel)</Text>
            <TextInput
              style={styles.noteInput}
              value={notes}
              onChangeText={setNotes}
              placeholder="Ex : caisse de pension, particularités du contrat…"
              placeholderTextColor={colors.textMuted}
              multiline
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Button title="Enregistrer" icon="check" onPress={handleSave} loading={saving} style={{ marginTop: spacing.md }} />
          </Card>

          <Card>
            <Text style={styles.sectionTitle}>
              {salaryType === 'hourly' ? `Brut estimé — ${monthLabel(monthAnchor)}` : `Brut fixe — ${monthLabel(monthAnchor)}`}
            </Text>
            {salaryType === 'hourly' ? (
              <Text style={styles.hint}>{totalHours} h × CHF {num(hourlyRate).toFixed(2)}/h</Text>
            ) : null}
            <View style={styles.breakdownRows}>
              <BreakdownRow label="Salaire brut" value={breakdown.gross} bold />
              <BreakdownRow label="− AVS/AI/APG" value={-breakdown.avs} />
              <BreakdownRow label="− AC" value={-breakdown.ac} />
              <BreakdownRow label="− LPP" value={-breakdown.lpp} />
              <BreakdownRow label="− LAA" value={-breakdown.laa} />
              {breakdown.sourceTax > 0 ? <BreakdownRow label="− Impôt à la source" value={-breakdown.sourceTax} /> : null}
              <View style={styles.breakdownDivider} />
              <BreakdownRow label="Salaire net" value={breakdown.net} bold accent />
            </View>
          </Card>

          <Card>
            <Text style={styles.sectionTitle}>Détail des heures</Text>
            {entries.length === 0 ? (
              <EmptyState title="Aucune heure ce mois" />
            ) : (
              <View style={{ gap: spacing.sm, marginTop: spacing.sm }}>
                {entries.map((e) => (
                  <View key={e.id} style={styles.entryRow}>
                    <Text style={styles.entryDate}>{new Date(`${e.entry_date}T00:00:00`).toLocaleDateString('fr-CH')}</Text>
                    <Text style={styles.entryMeta}>{e.project_name ?? 'Sans chantier'}</Text>
                    <Text style={styles.entryHours}>{Number(e.hours)} h</Text>
                  </View>
                ))}
              </View>
            )}
          </Card>
        </ScrollView>
      </View>
    </Screen>
  );
}

function BreakdownRow({ label, value, bold, accent }: { label: string; value: number; bold?: boolean; accent?: boolean }) {
  return (
    <View style={styles.breakdownRow}>
      <Text style={[styles.breakdownLabel, bold && styles.breakdownLabelBold]}>{label}</Text>
      <Text style={[styles.breakdownValue, bold && styles.breakdownLabelBold, accent && styles.breakdownValueAccent]}>
        CHF {value.toFixed(2)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
  },
  upsell: {
    alignItems: 'flex-start',
    gap: spacing.xs,
    marginTop: spacing.lg,
  },
  upsellTitle: {
    fontSize: fontSize.lg,
    fontWeight: '800',
    color: colors.text,
    marginTop: spacing.sm,
  },
  upsellText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    lineHeight: 20,
  },
  pageSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.xl,
  },
  stat: {
    flex: 1,
  },
  statValue: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    color: colors.text,
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  hint: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    lineHeight: 17,
    marginBottom: spacing.md,
  },
  chips: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: fontSize.sm,
    color: colors.text,
  },
  chipTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  rateGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  rateField: {
    flexGrow: 1,
    flexBasis: 140,
    marginBottom: spacing.md,
  },
  rateLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  rateInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
  },
  rateInput: {
    flex: 1,
    paddingVertical: spacing.sm,
    fontSize: fontSize.md,
    color: colors.text,
  },
  rateSuffix: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    fontWeight: '600',
  },
  fieldLabel: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing.sm,
    fontWeight: '500',
  },
  noteInput: {
    minHeight: 60,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: fontSize.sm,
    color: colors.text,
    backgroundColor: colors.surface,
    textAlignVertical: 'top',
  },
  error: {
    color: colors.danger,
    fontSize: fontSize.sm,
    marginTop: spacing.sm,
  },
  breakdownRows: {
    marginTop: spacing.sm,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  breakdownLabel: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  breakdownLabelBold: {
    fontWeight: '800',
    color: colors.text,
  },
  breakdownValue: {
    fontSize: fontSize.sm,
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  breakdownValueAccent: {
    color: colors.primary,
  },
  breakdownDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  entryDate: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
    width: 90,
  },
  entryMeta: {
    flex: 1,
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  entryHours: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
  },
});
