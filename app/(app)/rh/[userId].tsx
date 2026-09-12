import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../../lib/auth-context';
import { supabase } from '../../../lib/supabase';
import {
  computeHoursBalance,
  computeVacationBalance,
  getAnnualSalarySummary,
  getPayrollProfile,
  listAbsences,
  listDeductionTypes,
  listProfileDeductions,
  suggestVacationDaysPerYear,
  upsertPayrollProfile,
  upsertProfileDeduction,
  type AnnualSalarySummary,
  type EmployeeRef,
  type HoursBalance,
  type VacationBalance,
} from '../../../lib/api/payroll';
import { generateLohnausweisPdf, generateSalaryCertificatePdf } from '../../../lib/api/pdf';
import { localityForNpa } from '../../../lib/swissPostalCodes';
import { SwissAddressField } from '../../../components/SwissAddressField';
import { DateField } from '../../../components/DateField';
import { downloadFile } from '../../../lib/downloadFile';
import { Button, Card, LoadingScreen, PageHeader, Screen, Switch } from '../../../components/ui';
import { useTranslation } from '../../../lib/translations';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';
import type { PayrollDeductionType, PayrollProfile, PayrollProfileDeduction, SalaryType } from '../../../lib/types';

export default function PayrollProfileScreen() {
  const { t } = useTranslation();
  const { userId: routeId, kind } = useLocalSearchParams<{ userId: string; kind?: string }>();
  const { organization, user, canManagePayroll } = useAuth();
  const router = useRouter();
  const isGhost = kind === 'ghost';
  const employeeId = String(routeId);
  const employeeRef: EmployeeRef = isGhost ? { ghostEmployeeId: employeeId } : { userId: employeeId };
  const [memberName, setMemberName] = useState(t('payrollProfile.memberFallback'));
  const [profile, setProfile] = useState<PayrollProfile | null>(null);
  const [deductionTypes, setDeductionTypes] = useState<PayrollDeductionType[]>([]);
  const [overrides, setOverrides] = useState<PayrollProfileDeduction[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
  const [hireDate, setHireDate] = useState<string | null>(null);
  const [vacationDaysPerYear, setVacationDaysPerYear] = useState('');
  const [weeklyContractHours, setWeeklyContractHours] = useState('');
  const [overtimeHourlyRate, setOvertimeHourlyRate] = useState('');
  const [vacationBalance, setVacationBalance] = useState<VacationBalance | null>(null);
  const [hoursBalance, setHoursBalance] = useState<HoursBalance | null>(null);

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

  const load = useCallback(async () => {
    if (!organization || !employeeId) return;
    setLoading(true);
    const [nameResult, profileRow, types, overrideRows] = await Promise.all([
      isGhost
        ? supabase.from('payroll_ghost_employees').select('full_name').eq('id', employeeId).maybeSingle()
        : supabase.from('organization_members').select('full_name').eq('organization_id', organization.id).eq('user_id', employeeId).maybeSingle(),
      getPayrollProfile(organization.id, employeeRef),
      listDeductionTypes(organization.id),
      listProfileDeductions(organization.id, employeeRef),
    ]);
    setMemberName(nameResult.data?.full_name || t('payrollProfile.memberFallback'));
    setProfile(profileRow);
    setDeductionTypes(types.filter((t) => t.active));
    setOverrides(overrideRows);

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
      setHireDate(profileRow.hire_date);
      setVacationDaysPerYear(profileRow.vacation_days_per_year != null ? String(profileRow.vacation_days_per_year) : '');
      setWeeklyContractHours(profileRow.weekly_contract_hours != null ? String(profileRow.weekly_contract_hours) : '');
      setOvertimeHourlyRate(profileRow.overtime_hourly_rate_chf != null ? String(profileRow.overtime_hourly_rate_chf) : '');
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
  }, [organization, employeeId, isGhost]);

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

  // §7.5 "Soldes horaires" — vacation balance always computable once
  // vacation_days_per_year is set; hours balance only for a real user with
  // weekly_contract_hours set (see computeHoursBalance's own comment).
  useEffect(() => {
    if (!organization || !employeeId || !profile) {
      setVacationBalance(null);
      setHoursBalance(null);
      return;
    }
    let cancelled = false;
    listAbsences(organization.id, employeeRef).then((absences) => {
      if (cancelled) return;
      setVacationBalance(computeVacationBalance(profile.vacation_days_per_year, profile.hire_date, yearAnchor, absences));
    });
    computeHoursBalance(organization.id, employeeRef, profile.weekly_contract_hours, `${yearAnchor}-01-01`, `${yearAnchor}-12-31`).then((balance) => {
      if (!cancelled) setHoursBalance(balance);
    });
    return () => {
      cancelled = true;
    };
  }, [organization, employeeId, isGhost, yearAnchor, profile]);

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
        hire_date: hireDate,
        vacation_days_per_year: vacationDaysPerYear.trim() ? num(vacationDaysPerYear) : null,
        weekly_contract_hours: weeklyContractHours.trim() ? num(weeklyContractHours) : null,
        overtime_hourly_rate_chf: overtimeHourlyRate.trim() ? num(overtimeHourlyRate) : null,
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
        <PageHeader title={t('payrollProfile.employeeSheetTitle')} backTo="/(app)/rh/salaires/employes" />
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
          backTo="/(app)/rh/salaires/employes"
          right={
            <Pressable onPress={() => router.push('/(app)/rh/fiches-salaire' as any)} hitSlop={8} style={styles.slipsLink}>
              <Feather name="file-text" size={15} color={colors.primary} />
              <Text style={styles.slipsLinkText}>{t('payrollProfile.generateSlipLink')}</Text>
            </Pressable>
          }
        />

        <ScrollView ref={scrollRef} contentContainerStyle={{ paddingBottom: spacing.xxl * 2, gap: spacing.xl }}>
          {isGhost ? (
            <Card style={styles.ghostBanner}>
              <Feather name="user-x" size={16} color={colors.textMuted} />
              <Text style={styles.ghostBannerText}>{t('payrollProfile.ghostBanner')}</Text>
            </Card>
          ) : null}

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
            {!isGhost ? (
              <View style={{ marginTop: spacing.md }}>
                <DateField label={t('payrollProfile.hireDateLabel')} value={hireDate} onChange={setHireDate} />
              </View>
            ) : null}

            <Text style={[styles.fieldLabel, { marginTop: spacing.md }]}>{t('payrollProfile.vacationDaysLabel')}</Text>
            <Text style={styles.hint}>
              {t('payrollProfile.vacationDaysHint', { suggested: suggestVacationDaysPerYear(birthDate, yearAnchor) })}
            </Text>
            <TextInput
              style={styles.addressInput}
              value={vacationDaysPerYear}
              onChangeText={setVacationDaysPerYear}
              keyboardType="decimal-pad"
              placeholder={String(suggestVacationDaysPerYear(birthDate, yearAnchor))}
              placeholderTextColor={colors.textMuted}
            />

            {!isGhost ? (
              <>
                <Text style={[styles.fieldLabel, { marginTop: spacing.sm }]}>{t('payrollProfile.weeklyHoursLabel')}</Text>
                <Text style={styles.hint}>{t('payrollProfile.weeklyHoursHint')}</Text>
                <TextInput
                  style={styles.addressInput}
                  value={weeklyContractHours}
                  onChangeText={setWeeklyContractHours}
                  keyboardType="decimal-pad"
                  placeholder="42"
                  placeholderTextColor={colors.textMuted}
                />

                <Text style={[styles.fieldLabel, { marginTop: spacing.sm }]}>{t('payrollProfile.overtimeRateLabel')}</Text>
                <Text style={styles.hint}>{t('payrollProfile.overtimeRateHint')}</Text>
                <TextInput
                  style={styles.addressInput}
                  value={overtimeHourlyRate}
                  onChangeText={setOvertimeHourlyRate}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  placeholderTextColor={colors.textMuted}
                />
              </>
            ) : null}
          </Card>

          <Card>
            <Text style={styles.sectionTitle}>{t('payrollProfile.balancesTitle', { year: yearAnchor })}</Text>
            {vacationBalance ? (
              <View style={styles.breakdownRows}>
                <BreakdownRow label={t('payrollProfile.vacationEntitlement')} value={vacationBalance.entitlementDays} unit="j" />
                <BreakdownRow label={t('payrollProfile.vacationTaken')} value={-vacationBalance.takenDays} unit="j" />
                <View style={styles.breakdownDivider} />
                <BreakdownRow label={t('payrollProfile.vacationRemaining')} value={vacationBalance.remainingDays} unit="j" bold accent />
              </View>
            ) : (
              <Text style={styles.hint}>{t('payrollProfile.vacationBalanceNeedsDays')}</Text>
            )}
            {hoursBalance ? (
              <View style={[styles.breakdownRows, { marginTop: spacing.md }]}>
                <View style={styles.breakdownDivider} />
                <BreakdownRow label={t('payrollProfile.hoursExpected')} value={hoursBalance.expectedHours} unit="h" />
                <BreakdownRow label={t('payrollProfile.hoursLogged')} value={hoursBalance.loggedHours} unit="h" />
                <BreakdownRow label={t('payrollProfile.hoursBalance')} value={hoursBalance.balanceHours} unit="h" bold accent />
              </View>
            ) : !isGhost ? (
              <Text style={styles.hint}>{t('payrollProfile.hoursBalanceNeedsContract')}</Text>
            ) : null}
            <Pressable onPress={() => router.push('/(app)/rh/absences')} hitSlop={8} style={{ marginTop: spacing.sm }}>
              <Text style={styles.linkText}>{t('payrollProfile.manageAbsencesLink')}</Text>
            </Pressable>
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

function BreakdownRow({ label, value, bold, accent, unit }: { label: string; value: number; bold?: boolean; accent?: boolean; unit?: 'CHF' | 'j' | 'h' }) {
  const formatted = unit && unit !== 'CHF' ? `${value.toFixed(2)} ${unit}` : `CHF ${value.toFixed(2)}`;
  return (
    <View style={styles.breakdownRow}>
      <Text style={[styles.breakdownLabel, bold && styles.breakdownLabelBold]}>{label}</Text>
      <Text style={[styles.breakdownValue, bold && styles.breakdownLabelBold, accent && styles.breakdownValueAccent]}>{formatted}</Text>
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
  slipsLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  slipsLinkText: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.primary,
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
  linkText: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: '600',
  },
  lohnausweisDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
});
