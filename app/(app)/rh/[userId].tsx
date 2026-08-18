import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../../lib/auth-context';
import { supabase } from '../../../lib/supabase';
import {
  computeSalaryBreakdown,
  getPayrollProfile,
  listDeductionTypes,
  listProfileDeductions,
  listTimeEntries,
  upsertPayrollProfile,
  upsertProfileDeduction,
} from '../../../lib/api/payroll';
import { generatePayslipPdf } from '../../../lib/api/pdf';
import { downloadFile } from '../../../lib/downloadFile';
import { Button, Card, LoadingScreen, PageHeader, Screen, Switch } from '../../../components/ui';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';
import type { PayrollDeductionType, PayrollProfile, PayrollProfileDeduction, SalaryType } from '../../../lib/types';

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function endOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}
function addMonths(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}
function toIso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function monthLabel(d: Date): string {
  const label = d.toLocaleDateString('fr-CH', { month: 'long', year: 'numeric' });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export default function PayrollProfileScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const { organization, user, canManagePayroll } = useAuth();
  const router = useRouter();
  const [monthAnchor, setMonthAnchor] = useState(() => startOfMonth(new Date()));
  const [memberName, setMemberName] = useState('Membre');
  const [profile, setProfile] = useState<PayrollProfile | null>(null);
  const [deductionTypes, setDeductionTypes] = useState<PayrollDeductionType[]>([]);
  const [overrides, setOverrides] = useState<PayrollProfileDeduction[]>([]);
  const [totalHours, setTotalHours] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [salaryType, setSalaryType] = useState<SalaryType>('hourly');
  const [hourlyRate, setHourlyRate] = useState('');
  const [monthlySalary, setMonthlySalary] = useState('');
  const [street, setStreet] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [locality, setLocality] = useState('');
  const [notes, setNotes] = useState('');

  // Draft overrides keyed by deduction type id — lets the admin type a rate
  // freely before it's saved, same debounce-free pattern as the salary
  // fields above (everything commits together on "Enregistrer").
  const [draftRates, setDraftRates] = useState<Record<string, string>>({});
  const [draftEnabled, setDraftEnabled] = useState<Record<string, boolean>>({});

  const rangeStart = useMemo(() => toIso(monthAnchor), [monthAnchor]);
  const rangeEnd = useMemo(() => toIso(endOfMonth(monthAnchor)), [monthAnchor]);

  const load = useCallback(async () => {
    if (!organization || !userId) return;
    setLoading(true);
    const [{ data: memberRow }, profileRow, types, overrideRows, entryRows] = await Promise.all([
      supabase.from('organization_members').select('full_name').eq('organization_id', organization.id).eq('user_id', userId).maybeSingle(),
      getPayrollProfile(organization.id, userId),
      listDeductionTypes(organization.id),
      listProfileDeductions(organization.id, userId),
      listTimeEntries(organization.id, userId, rangeStart, rangeEnd),
    ]);
    setMemberName(memberRow?.full_name || 'Membre');
    setProfile(profileRow);
    setDeductionTypes(types.filter((t) => t.active));
    setOverrides(overrideRows);
    setTotalHours(Math.round(entryRows.reduce((sum, e) => sum + Number(e.hours), 0) * 100) / 100);

    if (profileRow) {
      setSalaryType(profileRow.salary_type);
      setHourlyRate(profileRow.hourly_rate_chf != null ? String(profileRow.hourly_rate_chf) : '');
      setMonthlySalary(profileRow.monthly_salary_chf != null ? String(profileRow.monthly_salary_chf) : '');
      setStreet(profileRow.street ?? '');
      setPostalCode(profileRow.postal_code ?? '');
      setLocality(profileRow.locality ?? '');
      setNotes(profileRow.notes ?? '');
    }
    const rates: Record<string, string> = {};
    const enabled: Record<string, boolean> = {};
    for (const t of types) {
      const ov = overrideRows.find((o) => o.deduction_type_id === t.id);
      rates[t.id] = ov?.rate_percent != null ? String(ov.rate_percent) : ov?.fixed_amount_chf != null ? String(ov.fixed_amount_chf) : t.default_rate_percent != null ? String(t.default_rate_percent) : '';
      enabled[t.id] = ov?.enabled ?? true;
    }
    setDraftRates(rates);
    setDraftEnabled(enabled);
    setLoading(false);
  }, [organization, userId, rangeStart, rangeEnd]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const num = (s: string) => Number(s.replace(',', '.')) || 0;
  const gross = salaryType === 'hourly' ? Math.round(num(hourlyRate) * totalHours * 100) / 100 : num(monthlySalary);

  // Effective overrides for the live preview reflect the drafts on screen,
  // not what's saved in the DB yet — so toggling a checkbox or typing a
  // rate updates the net total immediately, before hitting "Enregistrer".
  const previewOverrides: PayrollProfileDeduction[] = deductionTypes.map((t) => ({
    id: t.id,
    organization_id: organization?.id ?? '',
    user_id: String(userId),
    deduction_type_id: t.id,
    rate_percent: draftRates[t.id]?.trim() ? num(draftRates[t.id]) : null,
    fixed_amount_chf: null,
    enabled: draftEnabled[t.id] ?? true,
    updated_by: null,
    updated_at: '',
  }));
  const breakdown = computeSalaryBreakdown(gross, deductionTypes, previewOverrides);

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
        street: street.trim() || null,
        postal_code: postalCode.trim() || null,
        locality: locality.trim() || null,
        notes: notes.trim() || null,
      },
      user.id,
    );
    if (err) {
      setSaving(false);
      setError(err);
      return;
    }
    for (const t of deductionTypes) {
      const raw = draftRates[t.id]?.trim();
      await upsertProfileDeduction(
        organization.id,
        userId,
        t.id,
        { ratePercent: raw ? num(draftRates[t.id]) : null, fixedAmountChf: null, enabled: draftEnabled[t.id] ?? true },
        user.id,
      );
    }
    setSaving(false);
    load();
  }

  async function exportPayslip() {
    setExporting(true);
    setError(null);
    const { url, error: genError } = await generatePayslipPdf(String(userId), rangeStart);
    setExporting(false);
    if (genError || !url) {
      setError(genError ?? 'Échec de la génération du PDF.');
      return;
    }
    const { error: dlError } = await downloadFile(url, `Salaire ${memberName} - ${monthLabel(monthAnchor)}.pdf`);
    if (dlError) setError(dlError);
  }

  if (loading) {
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
        <PageHeader
          title={memberName}
          backTo="/(app)/rh"
          right={
            <Pressable onPress={() => router.push('/(app)/rh')} hitSlop={8}>
              <Feather name="clock" size={18} color={colors.textMuted} />
            </Pressable>
          }
        />
        <View style={styles.monthNav}>
          <Pressable onPress={() => setMonthAnchor((m) => addMonths(m, -1))} hitSlop={8} style={styles.monthNavBtn}>
            <Feather name="chevron-left" size={18} color={colors.textMuted} />
          </Pressable>
          <Text style={styles.pageSubtitle}>{monthLabel(monthAnchor)} — fiche de salaire.</Text>
          <Pressable onPress={() => setMonthAnchor((m) => addMonths(m, 1))} hitSlop={8} style={styles.monthNavBtn}>
            <Feather name="chevron-right" size={18} color={colors.textMuted} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: spacing.xxl * 2, gap: spacing.xl }}>
          <Card style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{totalHours} h</Text>
              <Text style={styles.statLabel}>Heures ce mois</Text>
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

            <Text style={styles.fieldLabel}>Notes (optionnel)</Text>
            <TextInput style={styles.noteInput} value={notes} onChangeText={setNotes} placeholder="Ex : caisse de pension, particularités du contrat…" placeholderTextColor={colors.textMuted} multiline />

            <Text style={[styles.fieldLabel, { marginTop: spacing.md }]}>Adresse postale (pour la fiche de salaire imprimable)</Text>
            <TextInput style={styles.addressInput} value={street} onChangeText={setStreet} placeholder="Rue et numéro" placeholderTextColor={colors.textMuted} />
            <View style={styles.addressRow}>
              <TextInput style={[styles.addressInput, styles.addressInputSmall]} value={postalCode} onChangeText={setPostalCode} placeholder="NPA" placeholderTextColor={colors.textMuted} keyboardType="number-pad" />
              <TextInput style={[styles.addressInput, { flex: 1 }]} value={locality} onChangeText={setLocality} placeholder="Localité" placeholderTextColor={colors.textMuted} />
            </View>
          </Card>

          <Card>
            <Text style={styles.sectionTitle}>Cotisations & taxes</Text>
            <Text style={styles.hint}>
              Taux repris de Compte → RH & Salaires, éditables ici pour cet employé uniquement. Décochez une ligne
              qui ne s'applique pas à cette personne.
            </Text>
            {deductionTypes.length === 0 ? (
              <Text style={styles.hint}>
                Aucun type de cotisation configuré — ajoutez-en depuis Compte → RH & Salaires.
              </Text>
            ) : (
              <View style={{ gap: spacing.sm, marginTop: spacing.sm }}>
                {deductionTypes.map((t) => (
                  <View key={t.id} style={styles.deductionRow}>
                    <Switch value={draftEnabled[t.id] ?? true} onChange={(v) => setDraftEnabled((prev) => ({ ...prev, [t.id]: v }))} />
                    <Text style={[styles.deductionLabel, !(draftEnabled[t.id] ?? true) && styles.deductionLabelDisabled]} numberOfLines={1}>
                      {t.label}
                    </Text>
                    <TextInput
                      style={styles.deductionInput}
                      value={draftRates[t.id] ?? ''}
                      onChangeText={(v) => setDraftRates((prev) => ({ ...prev, [t.id]: v }))}
                      keyboardType="decimal-pad"
                      editable={draftEnabled[t.id] ?? true}
                      placeholder="0"
                      placeholderTextColor={colors.textMuted}
                    />
                    <Text style={styles.deductionSuffix}>%</Text>
                  </View>
                ))}
              </View>
            )}

            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Button title="Enregistrer" icon="check" onPress={handleSave} loading={saving} style={{ marginTop: spacing.md }} />
          </Card>

          <Card>
            <Text style={styles.sectionTitle}>
              {salaryType === 'hourly' ? `Brut estimé — ${monthLabel(monthAnchor)}` : `Brut fixe — ${monthLabel(monthAnchor)}`}
            </Text>
            {salaryType === 'hourly' ? <Text style={styles.hint}>{totalHours} h × CHF {num(hourlyRate).toFixed(2)}/h</Text> : null}
            <View style={styles.breakdownRows}>
              <BreakdownRow label="Salaire brut" value={breakdown.gross} bold />
              {breakdown.lines.map((l, i) => (
                <BreakdownRow key={i} label={`− ${l.label}`} value={-l.amount} />
              ))}
              <View style={styles.breakdownDivider} />
              <BreakdownRow label="Salaire net" value={breakdown.net} bold accent />
            </View>
            <Button
              title="Exporter en PDF"
              icon="download"
              variant="secondary"
              onPress={exportPayslip}
              loading={exporting}
              style={{ marginTop: spacing.md }}
            />
          </Card>
        </ScrollView>
      </View>
    </Screen>
  );
}

function RateField({ label, value, onChange, suffix }: { label: string; value: string; onChange: (v: string) => void; suffix?: string }) {
  return (
    <View style={styles.rateField}>
      <Text style={styles.rateLabel}>{label}</Text>
      <View style={styles.rateInputRow}>
        <TextInput style={styles.rateInput} value={value} onChangeText={onChange} keyboardType="decimal-pad" placeholder="0" placeholderTextColor={colors.textMuted} />
        {suffix ? <Text style={styles.rateSuffix}>{suffix}</Text> : null}
      </View>
    </View>
  );
}

function BreakdownRow({ label, value, bold, accent }: { label: string; value: number; bold?: boolean; accent?: boolean }) {
  return (
    <View style={styles.breakdownRow}>
      <Text style={[styles.breakdownLabel, bold && styles.breakdownLabelBold]}>{label}</Text>
      <Text style={[styles.breakdownValue, bold && styles.breakdownLabelBold, accent && styles.breakdownValueAccent]}>CHF {value.toFixed(2)}</Text>
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
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  monthNavBtn: {
    padding: spacing.xs,
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
  rateField: {
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
  addressInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSize.sm,
    color: colors.text,
    backgroundColor: colors.surface,
    marginBottom: spacing.sm,
  },
  addressRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  addressInputSmall: {
    width: 90,
  },
  deductionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  deductionLabel: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.text,
  },
  deductionLabelDisabled: {
    color: colors.textMuted,
    textDecorationLine: 'line-through',
  },
  deductionInput: {
    width: 64,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    fontSize: fontSize.sm,
    color: colors.text,
    textAlign: 'right',
  },
  deductionSuffix: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    width: 12,
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
});
