import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../../lib/auth-context';
import { supabase } from '../../../lib/supabase';
import {
  computeMonthlyGross,
  computeSalaryBreakdown,
  getAnnualSalarySummary,
  getPayrollProfile,
  listDeductionTypes,
  listProfileDeductions,
  listTimeEntries,
  upsertPayrollProfile,
  upsertProfileDeduction,
  type AnnualSalarySummary,
  type EmployeeRef,
} from '../../../lib/api/payroll';
import { generateLohnausweisPdf, generatePayslipPdf, generateSalaryCertificatePdf } from '../../../lib/api/pdf';
import { localityForNpa } from '../../../lib/swissPostalCodes';
import { SwissAddressField } from '../../../components/SwissAddressField';
import { DateField } from '../../../components/DateField';
import { downloadFile } from '../../../lib/downloadFile';
import { Button, Card, LoadingScreen, PageHeader, Screen, Switch } from '../../../components/ui';
import { getAppLocale, useTranslation } from '../../../lib/translations';
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
  const label = d.toLocaleDateString(`${getAppLocale()}-CH`, { month: 'long', year: 'numeric' });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export default function PayrollProfileScreen() {
  const { t } = useTranslation();
  const { userId: routeId, kind } = useLocalSearchParams<{ userId: string; kind?: string }>();
  const { organization, user, canManagePayroll } = useAuth();
  const router = useRouter();
  const isGhost = kind === 'ghost';
  const employeeId = String(routeId);
  const employeeRef: EmployeeRef = isGhost ? { ghostEmployeeId: employeeId } : { userId: employeeId };
  const [monthAnchor, setMonthAnchor] = useState(() => startOfMonth(new Date()));
  const [memberName, setMemberName] = useState(t('payrollProfile.memberFallback'));
  const [profile, setProfile] = useState<PayrollProfile | null>(null);
  const [deductionTypes, setDeductionTypes] = useState<PayrollDeductionType[]>([]);
  const [overrides, setOverrides] = useState<PayrollProfileDeduction[]>([]);
  const [totalHours, setTotalHours] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // The error banner only ever renders in one place (near the deductions
  // card, close to the top) but every export action on this long page —
  // payslip, annual certificate, Lohnausweis — can set it too. Without this,
  // hitting "Générer" from a button near the bottom of the page produces a
  // failure with no visible feedback until scrolling all the way back up.
  const scrollRef = useRef<ScrollView>(null);
  const showError = useCallback((message: string) => {
    setError(message);
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }, []);

  const [yearAnchor, setYearAnchor] = useState(() => new Date().getFullYear());
  const [annualSummary, setAnnualSummary] = useState<AnnualSalarySummary | null>(null);
  const [loadingAnnual, setLoadingAnnual] = useState(false);
  const [exportingAnnual, setExportingAnnual] = useState(false);
  const [exportingLohnausweis, setExportingLohnausweis] = useState(false);

  const [salaryType, setSalaryType] = useState<SalaryType>('hourly');
  const [hourlyRate, setHourlyRate] = useState('');
  const [monthlySalary, setMonthlySalary] = useState('');
  const [street, setStreet] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [locality, setLocality] = useState('');
  const [notes, setNotes] = useState('');
  const [avsNumber, setAvsNumber] = useState('');
  const [birthDate, setBirthDate] = useState<string | null>(null);

  function handlePostalCodeChange(value: string) {
    setPostalCode(value);
    const match = localityForNpa(value);
    if (match && !locality.trim()) setLocality(match);
  }

  // Draft overrides keyed by deduction type id — lets the admin type a rate
  // freely before it's saved, same debounce-free pattern as the salary
  // fields above (everything commits together on "Enregistrer").
  const [draftRates, setDraftRates] = useState<Record<string, string>>({});
  const [draftEnabled, setDraftEnabled] = useState<Record<string, boolean>>({});

  const rangeStart = useMemo(() => toIso(monthAnchor), [monthAnchor]);
  const rangeEnd = useMemo(() => toIso(endOfMonth(monthAnchor)), [monthAnchor]);

  const load = useCallback(async () => {
    if (!organization || !employeeId) return;
    setLoading(true);
    const [nameResult, profileRow, types, overrideRows, entryRows] = await Promise.all([
      isGhost
        ? supabase.from('payroll_ghost_employees').select('full_name').eq('id', employeeId).maybeSingle()
        : supabase.from('organization_members').select('full_name').eq('organization_id', organization.id).eq('user_id', employeeId).maybeSingle(),
      getPayrollProfile(organization.id, employeeRef),
      listDeductionTypes(organization.id),
      listProfileDeductions(organization.id, employeeRef),
      // Ghost employees have no app account, so no hours to fetch.
      isGhost ? Promise.resolve([]) : listTimeEntries(organization.id, employeeId, rangeStart, rangeEnd),
    ]);
    setMemberName(nameResult.data?.full_name || t('payrollProfile.memberFallback'));
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
      setAvsNumber(profileRow.avs_number ?? '');
      setBirthDate(profileRow.birth_date);
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
  }, [organization, employeeId, isGhost, rangeStart, rangeEnd]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  // Reflects the last *saved* profile/deductions, not the live drafts being
  // edited above — the annual card is a record of what's actually been in
  // effect this year, not a preview of an unsaved edit.
  useEffect(() => {
    if (!organization || !employeeId || !profile) {
      setAnnualSummary(null);
      return;
    }
    let cancelled = false;
    setLoadingAnnual(true);
    getAnnualSalarySummary(organization.id, employeeRef, yearAnchor, profile, deductionTypes, overrides).then((summary) => {
      if (!cancelled) {
        setAnnualSummary(summary);
        setLoadingAnnual(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [organization, employeeId, isGhost, yearAnchor, profile, deductionTypes, overrides]);

  async function exportSalaryCertificate() {
    setExportingAnnual(true);
    setError(null);
    const { url, error: genError } = await generateSalaryCertificatePdf(employeeRef, yearAnchor);
    setExportingAnnual(false);
    if (genError || !url) {
      showError(genError ?? t('payrollProfile.pdfGenerationFailed'));
      return;
    }
    const { error: dlError } = await downloadFile(url, `${t('payrollProfile.salaryCertificateFilename', { name: memberName, year: yearAnchor })}.pdf`);
    if (dlError) showError(dlError);
  }

  async function exportLohnausweis() {
    setExportingLohnausweis(true);
    setError(null);
    const { url, error: genError } = await generateLohnausweisPdf(employeeRef, yearAnchor);
    setExportingLohnausweis(false);
    if (genError || !url) {
      showError(genError ?? t('payrollProfile.pdfGenerationFailed'));
      return;
    }
    const { error: dlError } = await downloadFile(url, `${t('payrollProfile.lohnausweisFilename', { name: memberName, year: yearAnchor })}.pdf`);
    if (dlError) showError(dlError);
  }

  const num = (s: string) => Number(s.replace(',', '.')) || 0;
  const gross = computeMonthlyGross(salaryType, num(hourlyRate), num(monthlySalary), totalHours);

  // Effective overrides for the live preview reflect the drafts on screen,
  // not what's saved in the DB yet — so toggling a checkbox or typing a
  // rate updates the net total immediately, before hitting "Enregistrer".
  const previewOverrides: PayrollProfileDeduction[] = deductionTypes.map((t) => ({
    id: t.id,
    organization_id: organization?.id ?? '',
    user_id: isGhost ? null : employeeId,
    ghost_employee_id: isGhost ? employeeId : null,
    deduction_type_id: t.id,
    rate_percent: draftRates[t.id]?.trim() ? num(draftRates[t.id]) : null,
    fixed_amount_chf: null,
    enabled: draftEnabled[t.id] ?? true,
    updated_by: null,
    updated_at: '',
  }));
  const breakdown = computeSalaryBreakdown(gross, deductionTypes, previewOverrides);

  async function handleSave() {
    if (!organization || !employeeId || !user) return;
    setSaving(true);
    setError(null);
    const { error: err } = await upsertPayrollProfile(
      organization.id,
      employeeRef,
      {
        salary_type: salaryType,
        hourly_rate_chf: salaryType === 'hourly' ? num(hourlyRate) : null,
        monthly_salary_chf: salaryType === 'monthly' ? num(monthlySalary) : null,
        street: street.trim() || null,
        postal_code: postalCode.trim() || null,
        locality: locality.trim() || null,
        notes: notes.trim() || null,
        avs_number: avsNumber.trim() || null,
        birth_date: birthDate,
      },
      user.id,
    );
    if (err) {
      setSaving(false);
      showError(err);
      return;
    }
    for (const t of deductionTypes) {
      const raw = draftRates[t.id]?.trim();
      await upsertProfileDeduction(
        organization.id,
        employeeRef,
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
    const { url, error: genError } = await generatePayslipPdf(employeeRef, rangeStart);
    setExporting(false);
    if (genError || !url) {
      showError(genError ?? t('payrollProfile.pdfGenerationFailed'));
      return;
    }
    const { error: dlError } = await downloadFile(url, `${t('payrollProfile.payslipFilename', { name: memberName, month: monthLabel(monthAnchor) })}.pdf`);
    if (dlError) showError(dlError);
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
        <PageHeader title={t('payrollProfile.employeeSheetTitle')} backTo="/(app)/rh" />
        <Card style={styles.upsell}>
          <Feather name="lock" size={22} color={colors.textMuted} />
          <Text style={styles.upsellTitle}>{t('payrollProfile.accessDeniedTitle')}</Text>
          <Text style={styles.upsellText}>{t('payrollProfile.accessDeniedText')}</Text>
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
          <Text style={styles.pageSubtitle}>{t('payrollProfile.monthSuffix', { month: monthLabel(monthAnchor) })}</Text>
          <Pressable onPress={() => setMonthAnchor((m) => addMonths(m, 1))} hitSlop={8} style={styles.monthNavBtn}>
            <Feather name="chevron-right" size={18} color={colors.textMuted} />
          </Pressable>
        </View>

        <ScrollView ref={scrollRef} contentContainerStyle={{ paddingBottom: spacing.xxl * 2, gap: spacing.xl }}>
          {isGhost ? (
            <Card style={styles.ghostBanner}>
              <Feather name="user-x" size={16} color={colors.textMuted} />
              <Text style={styles.ghostBannerText}>{t('payrollProfile.ghostBanner')}</Text>
            </Card>
          ) : (
            <Card style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{totalHours} h</Text>
                <Text style={styles.statLabel}>{t('payrollProfile.hoursThisMonth')}</Text>
              </View>
            </Card>
          )}

          <Card>
            <Text style={styles.sectionTitle}>{t('payrollProfile.salaryTitle')}</Text>
            {isGhost ? null : (
            <View style={styles.chips}>
              <Pressable onPress={() => setSalaryType('hourly')} style={[styles.chip, salaryType === 'hourly' && styles.chipActive]}>
                <Text style={[styles.chipText, salaryType === 'hourly' && styles.chipTextActive]}>{t('payrollProfile.hourly')}</Text>
              </Pressable>
              <Pressable onPress={() => setSalaryType('monthly')} style={[styles.chip, salaryType === 'monthly' && styles.chipActive]}>
                <Text style={[styles.chipText, salaryType === 'monthly' && styles.chipTextActive]}>{t('payrollProfile.monthly')}</Text>
              </Pressable>
            </View>
            )}

            {salaryType === 'hourly' ? (
              <RateField label={t('payrollProfile.hourlyRateLabel')} value={hourlyRate} onChange={setHourlyRate} suffix="CHF/h" />
            ) : (
              <RateField label={t('payrollProfile.monthlySalaryLabel')} value={monthlySalary} onChange={setMonthlySalary} suffix="CHF" />
            )}

            <Text style={styles.fieldLabel}>{t('payrollProfile.notesLabel')}</Text>
            <TextInput style={styles.noteInput} value={notes} onChangeText={setNotes} placeholder={t('payrollProfile.notesPlaceholder')} placeholderTextColor={colors.textMuted} multiline />

            <Text style={[styles.fieldLabel, { marginTop: spacing.md }]}>{t('payrollProfile.addressLabel')}</Text>
            <SwissAddressField
              value={street}
              onChangeText={setStreet}
              onSelectAddress={(addr) => {
                setStreet(addr.street);
                setPostalCode(addr.postalCode);
                setLocality(addr.locality);
              }}
              placeholder={t('payrollProfile.streetPlaceholder')}
              inputStyle={styles.addressInput}
            />
            <View style={styles.addressRow}>
              <TextInput style={[styles.addressInput, styles.addressInputSmall]} value={postalCode} onChangeText={handlePostalCodeChange} placeholder={t('payrollProfile.npaPlaceholder')} placeholderTextColor={colors.textMuted} keyboardType="number-pad" />
              <TextInput style={[styles.addressInput, { flex: 1, minWidth: 0 }]} value={locality} onChangeText={setLocality} placeholder={t('payrollProfile.localityPlaceholder')} placeholderTextColor={colors.textMuted} />
            </View>

            <Text style={[styles.fieldLabel, { marginTop: spacing.md }]}>{t('payrollProfile.avsNumberLabel')}</Text>
            <TextInput style={styles.addressInput} value={avsNumber} onChangeText={setAvsNumber} placeholder="756.XXXX.XXXX.XX" placeholderTextColor={colors.textMuted} />
            <View style={{ marginTop: spacing.md }}>
              <DateField label={t('payrollProfile.birthDateLabel')} value={birthDate} onChange={setBirthDate} />
            </View>
          </Card>

          <Card>
            <Text style={styles.sectionTitle}>{t('payrollProfile.deductionsTitle')}</Text>
            <Text style={styles.hint}>{t('payrollProfile.deductionsHint')}</Text>
            {deductionTypes.length === 0 ? (
              <Text style={styles.hint}>{t('payrollProfile.noDeductionTypes')}</Text>
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

            {error ? (
              <View style={styles.errorBanner}>
                <Feather name="alert-triangle" size={15} color={colors.danger} />
                <Text style={styles.errorBannerText}>{error}</Text>
              </View>
            ) : null}
            {error && error.includes('case du certificat') ? (
              <Button
                title={t('payrollProfile.configureDeductionsButton')}
                icon="settings"
                variant="secondary"
                onPress={() => router.push('/(app)/compte/rh')}
                style={{ marginTop: spacing.sm }}
              />
            ) : null}
            <Button title={t('common.save')} icon="check" onPress={handleSave} loading={saving} style={{ marginTop: spacing.md }} />
          </Card>

          <Card>
            <Text style={styles.sectionTitle}>
              {salaryType === 'hourly'
                ? t('payrollProfile.grossEstimated', { month: monthLabel(monthAnchor) })
                : t('payrollProfile.grossFixed', { month: monthLabel(monthAnchor) })}
            </Text>
            {salaryType === 'hourly' ? (
              <Text style={styles.hint}>{t('payrollProfile.hoursTimesRate', { hours: totalHours, rate: num(hourlyRate).toFixed(2) })}</Text>
            ) : null}
            <View style={styles.breakdownRows}>
              <BreakdownRow label={t('payrollProfile.grossSalary')} value={breakdown.gross} bold />
              {breakdown.lines.map((l, i) => (
                <BreakdownRow key={i} label={`− ${l.label}`} value={-l.amount} />
              ))}
              <View style={styles.breakdownDivider} />
              <BreakdownRow label={t('payrollProfile.netSalary')} value={breakdown.net} bold accent />
            </View>
            <Button
              title={t('payrollProfile.exportPdf')}
              icon="download"
              variant="secondary"
              onPress={exportPayslip}
              loading={exporting}
              style={{ marginTop: spacing.md }}
            />
          </Card>

          <Card>
            <View style={styles.monthNav}>
              <Pressable onPress={() => setYearAnchor((y) => y - 1)} hitSlop={8} style={styles.monthNavBtn}>
                <Feather name="chevron-left" size={18} color={colors.textMuted} />
              </Pressable>
              <Text style={styles.sectionTitle}>{t('payrollProfile.annualTitle')} — {yearAnchor}</Text>
              <Pressable onPress={() => setYearAnchor((y) => y + 1)} hitSlop={8} style={styles.monthNavBtn}>
                <Feather name="chevron-right" size={18} color={colors.textMuted} />
              </Pressable>
            </View>
            <Text style={styles.hint}>{t('payrollProfile.annualHint')}</Text>

            {loadingAnnual || !annualSummary ? (
              <LoadingScreen />
            ) : (
              <>
                {salaryType === 'hourly' ? (
                  <Text style={[styles.hint, { marginTop: spacing.sm }]}>{t('payrollProfile.annualHours', { year: yearAnchor })}: {annualSummary.totalHours} h</Text>
                ) : null}
                <View style={styles.breakdownRows}>
                  <BreakdownRow label={t('payrollProfile.grossSalary')} value={annualSummary.gross} bold />
                  {annualSummary.lines.map((l, i) => (
                    <BreakdownRow key={i} label={`− ${l.label}`} value={-l.amount} />
                  ))}
                  <View style={styles.breakdownDivider} />
                  <BreakdownRow label={t('payrollProfile.netSalary')} value={annualSummary.net} bold accent />
                </View>
                <Button
                  title={t('payrollProfile.exportAnnualPdf')}
                  icon="download"
                  variant="secondary"
                  onPress={exportSalaryCertificate}
                  loading={exportingAnnual}
                  style={{ marginTop: spacing.md }}
                />

                <View style={styles.lohnausweisDivider} />
                <Text style={styles.sectionTitle}>{t('payrollProfile.lohnausweisTitle')}</Text>
                <Text style={styles.hint}>{t('payrollProfile.lohnausweisHint')}</Text>
                <Button
                  title={t('payrollProfile.lohnausweisExport')}
                  icon="file-text"
                  onPress={exportLohnausweis}
                  loading={exportingLohnausweis}
                  style={{ marginTop: spacing.md }}
                />
              </>
            )}
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
  ghostBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  ghostBannerText: {
    flex: 1,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    lineHeight: 16,
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
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.dangerSoft,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginTop: spacing.sm,
  },
  errorBannerText: {
    flex: 1,
    color: colors.danger,
    fontSize: fontSize.sm,
    lineHeight: 19,
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
  lohnausweisDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
});
