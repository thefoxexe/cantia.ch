import { useEffect, useMemo, useRef, useState } from 'react';
import { compactIban, formatIbanInput } from '../../lib/iban';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Field, Switch } from '../ui';
import { DateField } from '../DateField';
import { SwissAddressField } from '../SwissAddressField';
import { SalarySimulator } from './SalarySimulator';
import { createGhostEmployee, upsertPayrollProfile, type EmployeeRef } from '../../lib/api/payroll';
import { getWhtSteps } from '../../lib/api/payrollSwiss';
import { cantonForNpa } from '../../lib/payroll/npaCanton.ts';
import { computeSwissPayroll, whtCantonFor, type SwissOverrides, type SwissSituation } from '../../lib/payroll/swissEngine.ts';
import { DEFAULT_LAA, FAMILY_ALLOWANCES, isSubjectToWht, lppCreditPercent, socialRatesFor, whtCode, type MaritalStatus, type Permit, type WhtSteps } from '../../lib/payroll/swissReferences.ts';
import { localityForNpa } from '../../lib/swissPostalCodes';
import { fill, useWizardCopy } from '../../lib/payroll/wizardCopy';
import { colors, fontSize, radius, spacing } from '../../lib/theme';
import type { PayrollProfile } from '../../lib/types';

// « Ajouter un employé » (creates a payroll-only employee) and « Situation &
// charges » (any employee, app member or not): the employer answers a few
// questions, Cantia applies the Swiss rules (lib/payroll/swissEngine.ts),
// shows what applies and simulates the salary. Every rate stays adjustable
// under « avancé ».

type Country = SwissSituation['residenceCountry'];
type OverrideKey = 'aanpPercent' | 'aapPercent' | 'ijmEmployeePercent' | 'ijmEmployerPercent' | 'lppTotalPercent' | 'cafEmployerPercent' | 'whtRatePercent';

interface Draft {
  name: string;
  email: string;
  birthDate: string;
  street: string;
  postalCode: string;
  locality: string;
  salaryType: 'monthly' | 'hourly';
  amount: string;
  avs: string;
  iban: string;
  addressCountry: Country;
  swiss: boolean;
  nationality: string;
  permit: Permit;
  marital: MaritalStatus;
  spouseSwiss: boolean;
  spouseWorks: boolean;
  kids16: number;
  kidsTraining: number;
  livesWithKids: boolean;
  church: boolean;
  allowances: boolean;
  lppInsured: boolean;
  overrides: Partial<Record<OverrideKey, string>>;
  whtCode: string;
}

const PERMITS: Exclude<Permit, 'swiss'>[] = ['C', 'B', 'L', 'G', 'F', 'N', 'S', 'other'];
const COUNTRIES: Country[] = ['CH', 'FR', 'DE', 'IT', 'AT', 'other'];
const MARITALS: MaritalStatus[] = ['single', 'married', 'registered', 'divorced', 'separated', 'widowed'];
const HOURS_PER_MONTH = (42 * 52) / 12;

function draftFrom(profile: Partial<PayrollProfile> | null, name: string): Draft {
  const o = (profile?.payroll_overrides ?? {}) as Record<string, unknown>;
  const str = (k: OverrideKey) => (typeof o[k] === 'number' ? String(o[k]) : '');
  return {
    name,
    email: profile?.personal_email ?? '',
    birthDate: profile?.birth_date ?? '',
    street: profile?.street ?? '',
    postalCode: profile?.postal_code ?? '',
    locality: profile?.locality ?? '',
    salaryType: profile?.salary_type ?? 'monthly',
    amount: String((profile?.salary_type === 'hourly' ? profile?.hourly_rate_chf : profile?.monthly_salary_chf) ?? ''),
    avs: profile?.avs_number ?? '',
    iban: formatIbanInput(profile?.iban ?? ''),
    addressCountry: profile?.residence_country ?? 'CH',
    swiss: (profile?.permit ?? 'swiss') === 'swiss',
    nationality: profile?.nationality && profile.nationality !== 'CH' ? profile.nationality : '',
    permit: profile?.permit && profile.permit !== 'swiss' ? profile.permit : 'B',
    marital: profile?.marital_status ?? 'single',
    spouseSwiss: !!profile?.spouse_is_swiss_or_c,
    spouseWorks: !!profile?.spouse_works,
    kids16: profile?.children_under_16 ?? 0,
    kidsTraining: profile?.children_in_training ?? 0,
    livesWithKids: !!profile?.lives_with_children,
    church: !!profile?.church_tax,
    allowances: profile?.receives_family_allowances ?? true,
    lppInsured: profile?.lpp_insured ?? true,
    overrides: {
      aanpPercent: str('aanpPercent'),
      aapPercent: str('aapPercent'),
      ijmEmployeePercent: str('ijmEmployeePercent'),
      ijmEmployerPercent: str('ijmEmployerPercent'),
      lppTotalPercent: str('lppTotalPercent'),
      cafEmployerPercent: str('cafEmployerPercent'),
      whtRatePercent: str('whtRatePercent'),
    },
    whtCode: typeof o.whtCode === 'string' ? o.whtCode : '',
  };
}

const num = (v: string | undefined) => {
  const n = Number(String(v ?? '').replace(',', '.').trim());
  return v && String(v).trim() !== '' && Number.isFinite(n) ? n : null;
};

export function EmployeeWizard({
  visible,
  onClose,
  onSaved,
  organizationId,
  userId,
  companyPostalCode,
  employee,
  profile,
  name = '',
}: {
  visible: boolean;
  onClose: () => void;
  onSaved: (ref: EmployeeRef) => void;
  organizationId: string;
  userId: string | undefined;
  companyPostalCode: string | null | undefined;
  employee?: EmployeeRef; // absent: create a new payroll-only employee
  profile?: Partial<PayrollProfile> | null;
  name?: string;
}) {
  const c = useWizardCopy();
  const creating = !employee;
  const steps = creating ? [0, 1, 2, 3] : [1, 2, 3];
  const [index, setIndex] = useState(0);
  const [d, setD] = useState<Draft>(() => draftFrom(profile ?? null, name));
  const [advanced, setAdvanced] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [steps2, setSteps2] = useState<WhtSteps | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  // Each step starts at the top (on a phone, « Continuer » is at the bottom).
  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [index]);

  useEffect(() => {
    if (visible) {
      setD(draftFrom(profile ?? null, name));
      setIndex(0);
      setError(null);
    }
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((prev) => ({ ...prev, [k]: v }));
  const year = new Date().getFullYear();

  const situation: SwissSituation = useMemo(
    () => ({
      birthDate: /^\d{4}-\d{2}-\d{2}$/.test(d.birthDate) ? d.birthDate : null,
      permit: d.swiss ? 'swiss' : d.permit,
      maritalStatus: d.marital,
      spouseIsSwissOrC: d.spouseSwiss,
      spouseWorks: d.spouseWorks,
      livesWithChildren: d.livesWithKids,
      childrenUnder16: d.kids16,
      childrenInTraining: d.kidsTraining,
      church: d.church,
      residenceCountry: d.addressCountry,
      residenceCanton: d.addressCountry === 'CH' ? cantonForNpa(d.postalCode) : null,
      workCanton: cantonForNpa(companyPostalCode) ?? 'GE',
      lppInsured: d.lppInsured,
      receivesFamilyAllowances: d.allowances,
    }),
    [d, companyPostalCode],
  );
  const overrides: SwissOverrides = {
    aanpPercent: num(d.overrides.aanpPercent),
    aapPercent: num(d.overrides.aapPercent),
    ijmEmployeePercent: num(d.overrides.ijmEmployeePercent),
    ijmEmployerPercent: num(d.overrides.ijmEmployerPercent),
    lppTotalPercent: num(d.overrides.lppTotalPercent),
    cafEmployerPercent: num(d.overrides.cafEmployerPercent),
    whtRatePercent: num(d.overrides.whtRatePercent),
    whtCode: d.whtCode.trim() || null,
  };
  const whtInput = { ...situation, children: d.kids16 + d.kidsTraining };
  const subject = isSubjectToWht(whtInput, situation.workCanton).subject;
  const code = subject ? overrides.whtCode ?? whtCode(whtInput) : null;
  const whtCanton = subject ? whtCantonFor(situation) : null;

  useEffect(() => {
    let alive = true;
    getWhtSteps(year, whtCanton, code).then((s) => alive && setSteps2(s));
    return () => {
      alive = false;
    };
  }, [year, whtCanton, code]);

  const amount = num(d.amount) ?? 0;
  const monthlyGross = d.salaryType === 'hourly' ? amount * HOURS_PER_MONTH : amount;
  const payroll = computeSwissPayroll(situation, monthlyGross || 0, year, { overrides, whtSteps: steps2 });
  const rates = socialRatesFor(year);
  const caf = FAMILY_ALLOWANCES[situation.workCanton];

  async function save() {
    if (!d.name.trim() && creating) {
      setError(c.errorName);
      setIndex(0);
      return;
    }
    setSaving(true);
    setError(null);
    let ref = employee;
    if (!ref) {
      const { id, error: err } = await createGhostEmployee(organizationId, d.name.trim(), userId!);
      if (err || !id) {
        setSaving(false);
        setError(c.errorSave);
        return;
      }
      ref = { ghostEmployeeId: id };
    }
    const overridesJson: Record<string, number | string> = {};
    for (const [k, v] of Object.entries(overrides)) if (v != null) overridesJson[k] = v as number | string;
    const base = {
      personal_email: d.email.trim() || null,
      birth_date: situation.birthDate,
      street: d.street.trim() || null,
      postal_code: d.postalCode.trim() || null,
      locality: d.locality.trim() || null,
      salary_type: d.salaryType,
      ...(d.salaryType === 'hourly' ? { hourly_rate_chf: num(d.amount) } : { monthly_salary_chf: num(d.amount) }),
      avs_number: d.avs.trim() || null,
      iban: compactIban(d.iban) || null,
    };
    const swissFields = {
      swiss_auto: true,
      permit: situation.permit,
      nationality: d.swiss ? 'CH' : d.nationality.trim() || null,
      marital_status: d.marital,
      spouse_is_swiss_or_c: d.spouseSwiss,
      spouse_works: d.spouseWorks,
      lives_with_children: d.livesWithKids,
      children_under_16: d.kids16,
      children_in_training: d.kidsTraining,
      church_tax: d.church,
      residence_country: situation.residenceCountry,
      lpp_insured: d.lppInsured,
      receives_family_allowances: d.allowances,
      payroll_overrides: overridesJson,
    };
    const updates = creating ? { ...base, ...swissFields } : { ...swissFields };
    let { error: err } = await upsertPayrollProfile(organizationId, ref, updates as never, userId);
    if (err && /column|schema cache/i.test(err)) {
      // Situation columns not migrated yet: keep what can be saved.
      if (creating) ({ error: err } = await upsertPayrollProfile(organizationId, ref, base as never, userId));
      setSaving(false);
      if (!err) {
        setError(c.notReady);
        onSaved(ref);
      } else setError(c.errorSave);
      return;
    }
    setSaving(false);
    if (err) {
      setError(c.errorSave);
      return;
    }
    onSaved(ref);
  }

  const step = steps[index];
  const last = index === steps.length - 1;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <View style={styles.headerInner}>
            <View style={{ flex: 1 }}>
              <Text style={styles.kicker}>
                {creating ? c.addTitle : c.editTitle}
                {d.name && !creating ? ` · ${d.name}` : ''} · {fill(c.step, { n: index + 1, total: steps.length })}
              </Text>
              <Text style={styles.title}>{c.steps[step]}</Text>
            </View>
            <Pressable onPress={onClose} hitSlop={10} accessibilityLabel={c.close}>
              <Feather name="x" size={22} color={colors.text} />
            </Pressable>
          </View>
          <View style={styles.progress}>
            {steps.map((s, i) => (
              <View key={s} style={[styles.bar, i <= index && styles.barOn]} />
            ))}
          </View>
        </View>

        <ScrollView ref={scrollRef} contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          {step === 0 ? (
            <View style={styles.stack}>
              <Field label={c.fullName} value={d.name} onChangeText={(v) => set('name', v)} placeholder={c.fullNamePlaceholder} autoFocus />
              <View>
                <Field label={c.email} value={d.email} onChangeText={(v) => set('email', v)} keyboardType="email-address" autoCapitalize="none" placeholder="prenom.nom@exemple.ch" />
                <Text style={styles.hint}>{c.emailHint}</Text>
              </View>
              <View>
                <DateField label={c.birthDate} value={d.birthDate} onChange={(v) => set('birthDate', v ?? '')} />
                <Text style={styles.hint}>{c.birthHint}</Text>
              </View>
              <Question label={c.addressCountry}>
                <Choices options={COUNTRIES.map((k) => [k, c.countries[k]])} value={d.addressCountry} onChange={(v) => set('addressCountry', v as Country)} />
              </Question>
              {d.addressCountry === 'CH' || d.addressCountry === 'FR' ? (
                <SwissAddressField
                  label={c.address}
                  value={d.street}
                  onChangeText={(v) => set('street', v)}
                  country={d.addressCountry}
                  onSelectAddress={(a) => setD((prev) => ({ ...prev, street: a.street, postalCode: a.postalCode, locality: a.locality }))}
                />
              ) : (
                <Field label={c.address} value={d.street} onChangeText={(v) => set('street', v)} />
              )}
              <View style={styles.row2}>
                <View style={{ width: 120 }}>
                  <Field
                    label={d.addressCountry === 'CH' ? c.npa : c.postalCode}
                    value={d.postalCode}
                    onChangeText={(v) => {
                      set('postalCode', v);
                      const loc = d.addressCountry === 'CH' ? localityForNpa(v) : null;
                      if (loc && !d.locality) set('locality', loc);
                    }}
                    keyboardType="number-pad"
                    maxLength={d.addressCountry === 'CH' || d.addressCountry === 'AT' ? 4 : 5}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Field label={c.locality} value={d.locality} onChangeText={(v) => set('locality', v)} />
                </View>
              </View>
              <Text style={styles.label}>{c.salary}</Text>
              <Choices options={[['monthly', c.monthly], ['hourly', c.hourly]]} value={d.salaryType} onChange={(v) => set('salaryType', v as Draft['salaryType'])} />
              <Field label={d.salaryType === 'hourly' ? c.hourlyAmount : c.monthlyAmount} value={d.amount} onChangeText={(v) => set('amount', v)} keyboardType="decimal-pad" placeholder={d.salaryType === 'hourly' ? '35' : '5000'} />
              <View style={styles.row2}>
                <View style={{ flex: 1 }}>
                  <Field label={c.avs} value={d.avs} onChangeText={(v) => set('avs', v)} placeholder={c.avsPlaceholder} keyboardType="number-pad" />
                </View>
                <View style={{ flex: 1 }}>
                  <Field label={c.iban} value={d.iban} onChangeText={(v) => set('iban', formatIbanInput(v))} placeholder="CH93 0076 2011 6238 5295 7" autoCapitalize="characters" />
                </View>
              </View>
              <Text style={styles.hint}>{c.optionalNow}</Text>
            </View>
          ) : null}

          {step === 1 ? (
            <View style={styles.stack}>
              <Question label={c.nationality}>
                <Choices options={[['swiss', c.swiss], ['other', c.otherNationality]]} value={d.swiss ? 'swiss' : 'other'} onChange={(v) => set('swiss', v === 'swiss')} big />
              </Question>
              {!d.swiss ? (
                <>
                  <Field label={c.nationalityField} value={d.nationality} onChangeText={(v) => set('nationality', v)} placeholder={c.nationalityPlaceholder} />
                  <Question label={c.permit}>
                    <Choices options={PERMITS.map((p) => [p, c.permits[p]])} value={d.permit} onChange={(v) => set('permit', v as Permit)} />
                  </Question>
                </>
              ) : null}
              <Question label={c.marital}>
                <Choices options={MARITALS.map((m) => [m, c.maritals[m]])} value={d.marital} onChange={(v) => set('marital', v as MaritalStatus)} />
              </Question>
              {d.marital === 'married' || d.marital === 'registered' ? (
                <View style={styles.toggles}>
                  {!d.swiss ? <Toggle label={c.spouseSwiss} value={d.spouseSwiss} onChange={(v) => set('spouseSwiss', v)} /> : null}
                  <Toggle label={c.spouseWorks} value={d.spouseWorks} onChange={(v) => set('spouseWorks', v)} />
                </View>
              ) : null}
              <View style={styles.toggles}>
                <Stepper label={c.kidsUnder16} value={d.kids16} onChange={(v) => set('kids16', v)} />
                <Stepper label={c.kidsTraining} value={d.kidsTraining} onChange={(v) => set('kidsTraining', v)} />
              </View>
              {d.kids16 + d.kidsTraining > 0 ? (
                <View style={styles.toggles}>
                  {d.marital !== 'married' && d.marital !== 'registered' ? <Toggle label={c.livesWithKids} value={d.livesWithKids} onChange={(v) => set('livesWithKids', v)} /> : null}
                  <Toggle label={c.allowances} hint={c.allowancesHint} value={d.allowances} onChange={(v) => set('allowances', v)} />
                </View>
              ) : null}
              {subject ? (
                <View style={styles.toggles}>
                  <Toggle label={c.church} value={d.church} onChange={(v) => set('church', v)} />
                </View>
              ) : null}
            </View>
          ) : null}

          {step === 2 ? (
            <View style={styles.stack}>
              <View style={styles.banner}>
                <Feather name="zap" size={16} color={colors.primary} />
                <Text style={styles.bannerText}>{c.autoBanner}</Text>
              </View>
              <Panel icon="shield" title={c.lawTitle} foot={c.lawFoot}>
                <Rate label="AVS / AI / APG" value={`${rates.avsAiApgPercent} % + ${rates.avsAiApgPercent} %`} />
                <Rate label="AC (chômage)" value={`${rates.acPercent} % + ${rates.acPercent} %`} />
                <Rate
                  label={payroll.age != null && payroll.lpp.applies ? fill(c.lppAge, { pct: payroll.lpp.creditPercent, age: payroll.age }) : c.lppNone}
                  value={payroll.lpp.applies ? `${payroll.lpp.creditPercent / 2} % + ${payroll.lpp.creditPercent / 2} %` : '—'}
                />
              </Panel>
              <View style={styles.toggles}>
                <Toggle label={c.lppInsured} hint={fill(c.lppHint, { threshold: rates.lppEntryThresholdChf.toLocaleString('fr-CH') })} value={d.lppInsured} onChange={(v) => set('lppInsured', v)} />
              </View>
              <Panel icon="heart" title={c.laaTitle} foot={c.laaFoot}>
                <Rate label="AANP (employé)" value={`${overrides.aanpPercent ?? DEFAULT_LAA.aanpPercent} %`} />
                <Rate label="AAP (employeur)" value={`${overrides.aapPercent ?? DEFAULT_LAA.aapPercent} %`} />
              </Panel>
              <Panel icon="users" title={fill(c.cafTitle, { canton: situation.workCanton })} foot={c.cafFoot}>
                <Rate label="Employeur" value={`${Number((overrides.cafEmployerPercent ?? caf.cafEmployerPercent).toFixed(3))} %`} />
                {caf.cafEmployeePercent > 0 ? <Rate label="Employé" value={`${caf.cafEmployeePercent} %`} /> : null}
              </Panel>
              <Pressable onPress={() => setAdvanced((v) => !v)} style={styles.advancedHead}>
                <Feather name="sliders" size={16} color={colors.text} />
                <Text style={styles.advancedTitle}>{c.advanced}</Text>
                <Feather name={advanced ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textMuted} />
              </Pressable>
              {advanced ? (
                <View style={styles.advanced}>
                  <Text style={styles.hint}>{c.advancedHint}</Text>
                  <View style={styles.grid}>
                    {(
                      [
                        ['aanpPercent', c.aanp, DEFAULT_LAA.aanpPercent],
                        ['aapPercent', c.aap, DEFAULT_LAA.aapPercent],
                        ['ijmEmployeePercent', c.ijmEmp, 0],
                        ['ijmEmployerPercent', c.ijmEr, 0],
                        ['lppTotalPercent', c.lppTotal, payroll.age != null ? lppCreditPercent(payroll.age) : 7],
                        ['cafEmployerPercent', c.cafEr, Number(caf.cafEmployerPercent.toFixed(3))],
                      ] as [OverrideKey, string, number][]
                    ).map(([k, label, auto]) => (
                      <View key={k} style={styles.cell}>
                        <Field label={label} value={d.overrides[k] ?? ''} onChangeText={(v) => set('overrides', { ...d.overrides, [k]: v })} keyboardType="decimal-pad" placeholder={`${auto} (${c.auto})`} />
                      </View>
                    ))}
                    {subject ? (
                      <>
                        <View style={styles.cell}>
                          <Field label={c.whtCode} value={d.whtCode} onChangeText={(v) => set('whtCode', v.toUpperCase())} placeholder={`${whtCode(whtInput)} (${c.auto})`} autoCapitalize="characters" />
                        </View>
                        <View style={styles.cell}>
                          <Field label={c.whtRate} value={d.overrides.whtRatePercent ?? ''} onChangeText={(v) => set('overrides', { ...d.overrides, whtRatePercent: v })} keyboardType="decimal-pad" placeholder={c.auto} />
                        </View>
                      </>
                    ) : null}
                  </View>
                </View>
              ) : null}
            </View>
          ) : null}

          {step === 3 ? (
            <View style={styles.stack}>
              <Summary icon="file-text" title={c.whtTitle}>
                {payroll.wht.subject ? (
                  <>
                    <Text style={styles.pill}>{fill(c.whtYes, { code: payroll.wht.code ?? '', canton: payroll.wht.canton ?? '' })}</Text>
                    {payroll.wht.missingScale ? (
                      <Text style={[styles.summaryText, { color: colors.warning }]}>{fill(c.whtMissing, { code: payroll.wht.code ?? '', canton: payroll.wht.canton ?? '' })}</Text>
                    ) : (
                      <Text style={styles.summaryText}>{fill(c.whtRateLine, { rate: payroll.wht.ratePercent })}</Text>
                    )}
                    <Text style={styles.hint}>{payroll.wht.reason}</Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.pill}>{c.whtNot}</Text>
                    <Text style={styles.summaryText}>{payroll.wht.reason}</Text>
                  </>
                )}
              </Summary>
              <Summary icon="smile" title={c.famTitle}>
                <Text style={styles.summaryText}>
                  {d.kids16 + d.kidsTraining === 0 ? c.famNone : !d.allowances ? c.famOther : fill(c.famAmount, { amount: payroll.familyAllowance.toFixed(2) })}
                </Text>
              </Summary>
              <SalarySimulator payroll={payroll} />
            </View>
          ) : null}

          {error ? <Text style={styles.error}>{error}</Text> : null}
        </ScrollView>

        <View style={styles.footer}>
          <View style={styles.footerInner}>
            <Pressable onPress={() => (index === 0 ? onClose() : setIndex(index - 1))} style={styles.backBtn}>
              <Feather name="chevron-left" size={18} color={colors.text} />
              <Text style={styles.backText}>{index === 0 ? c.close : c.back}</Text>
            </Pressable>
            <Pressable
              onPress={() => (last ? save() : step === 0 && !d.name.trim() ? setError(c.errorName) : (setError(null), setIndex(index + 1)))}
              disabled={saving}
              style={[styles.nextBtn, saving && { opacity: 0.6 }]}
            >
              <Text style={styles.nextText}>{saving ? '…' : last ? (creating ? c.create : c.save) : c.next}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function Question({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: spacing.sm }}>
      <Text style={styles.question}>{label}</Text>
      {children}
    </View>
  );
}

function Choices({ options, value, onChange, big }: { options: [string, string][]; value: string; onChange: (v: string) => void; big?: boolean }) {
  return (
    <View style={styles.choices}>
      {options.map(([k, label]) => {
        const on = k === value;
        return (
          <Pressable key={k} onPress={() => onChange(k)} style={[styles.choice, big && styles.choiceBig, on && styles.choiceOn]} accessibilityRole="radio" accessibilityState={{ checked: on }}>
            <Text style={[styles.choiceText, big && { fontSize: fontSize.md }, on && styles.choiceTextOn]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function Toggle({ label, hint, value, onChange }: { label: string; hint?: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <View style={styles.toggle}>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={styles.toggleLabel}>{label}</Text>
        {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      </View>
      <Switch value={value} onChange={onChange} />
    </View>
  );
}

function Stepper({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <View style={styles.toggle}>
      <Text style={[styles.toggleLabel, { flex: 1 }]}>{label}</Text>
      <View style={styles.stepper}>
        <Pressable onPress={() => onChange(Math.max(0, value - 1))} style={styles.stepBtn} accessibilityLabel="−">
          <Feather name="minus" size={16} color={value > 0 ? colors.text : colors.border} />
        </Pressable>
        <Text style={styles.stepValue}>{value}</Text>
        <Pressable onPress={() => onChange(Math.min(15, value + 1))} style={styles.stepBtn} accessibilityLabel="+">
          <Feather name="plus" size={16} color={colors.text} />
        </Pressable>
      </View>
    </View>
  );
}

function Panel({ icon, title, foot, children }: { icon: React.ComponentProps<typeof Feather>['name']; title: string; foot?: string; children: React.ReactNode }) {
  return (
    <View style={styles.panel}>
      <View style={styles.panelHead}>
        <View style={styles.panelIcon}>
          <Feather name={icon} size={15} color={colors.primary} />
        </View>
        <Text style={styles.panelTitle}>{title}</Text>
      </View>
      <View style={{ gap: 6 }}>{children}</View>
      {foot ? <Text style={styles.hint}>{foot}</Text> : null}
    </View>
  );
}

function Rate({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.rate}>
      <Text style={styles.rateLabel}>{label}</Text>
      <Text style={styles.rateValue}>{value}</Text>
    </View>
  );
}

function Summary({ icon, title, children }: { icon: React.ComponentProps<typeof Feather>['name']; title: string; children: React.ReactNode }) {
  return (
    <View style={styles.panel}>
      <View style={styles.panelHead}>
        <View style={styles.panelIcon}>
          <Feather name={icon} size={15} color={colors.primary} />
        </View>
        <Text style={styles.panelTitle}>{title}</Text>
      </View>
      <View style={{ gap: 6 }}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: { borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.surface, paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.md },
  headerInner: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, width: '100%', maxWidth: 640, alignSelf: 'center' },
  kicker: { fontSize: 12.5, color: colors.textMuted },
  title: { fontSize: 24, fontWeight: '800', color: colors.text, marginTop: 2 },
  progress: { flexDirection: 'row', gap: 6, width: '100%', maxWidth: 640, alignSelf: 'center', marginTop: spacing.md },
  bar: { flex: 1, height: 5, borderRadius: 3, backgroundColor: colors.border },
  barOn: { backgroundColor: colors.primary },
  body: { padding: spacing.lg, paddingBottom: spacing.xxl * 2, width: '100%', maxWidth: 672, alignSelf: 'center' },
  stack: { gap: spacing.lg },
  row2: { flexDirection: 'row', gap: spacing.md },
  label: { fontSize: fontSize.sm, fontWeight: '600', color: colors.text, marginBottom: -spacing.sm },
  hint: { fontSize: 12.5, lineHeight: 18, color: colors.textMuted, marginTop: 4 },
  question: { fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  choices: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  choice: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  choiceBig: { flexGrow: 1, flexBasis: 0, minWidth: 140, alignItems: 'center', paddingVertical: 16 },
  choiceOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  choiceText: { fontSize: fontSize.sm, fontWeight: '600', color: colors.text },
  choiceTextOn: { color: '#FFFFFF' },
  toggles: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, backgroundColor: colors.surface, overflow: 'hidden' },
  toggle: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  toggleLabel: { fontSize: fontSize.sm, fontWeight: '600', color: colors.text },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  stepBtn: { width: 38, height: 38, borderRadius: 19, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  stepValue: { width: 26, textAlign: 'center', fontSize: fontSize.lg, fontWeight: '800', color: colors.text, fontVariant: ['tabular-nums'] },
  banner: { flexDirection: 'row', gap: spacing.sm, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.primarySoft, alignItems: 'flex-start' },
  bannerText: { flex: 1, fontSize: fontSize.sm, lineHeight: 20, color: colors.text },
  panel: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md, gap: spacing.sm, backgroundColor: colors.surface },
  panelHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  panelIcon: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primarySoft },
  panelTitle: { flex: 1, fontSize: fontSize.md, fontWeight: '800', color: colors.text },
  rate: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  rateLabel: { flex: 1, fontSize: fontSize.sm, color: colors.textMuted },
  rateValue: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text, fontVariant: ['tabular-nums'] },
  advancedHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, backgroundColor: colors.surface },
  advancedTitle: { flex: 1, fontSize: fontSize.sm, fontWeight: '700', color: colors.text },
  advanced: { gap: spacing.sm, marginTop: -spacing.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -spacing.xs },
  cell: { width: '50%', minWidth: 220, flexGrow: 1, paddingHorizontal: spacing.xs },
  pill: { alignSelf: 'flex-start', fontSize: 12.5, fontWeight: '700', color: colors.text, borderWidth: 1, borderColor: colors.border, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, overflow: 'hidden' },
  summaryText: { fontSize: fontSize.sm, lineHeight: 20, color: colors.text },
  error: { fontSize: fontSize.sm, color: colors.danger, marginTop: spacing.md },
  footer: { borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface, padding: spacing.md },
  footerInner: { flexDirection: 'row', gap: spacing.md, width: '100%', maxWidth: 640, alignSelf: 'center' },
  backBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingHorizontal: spacing.lg, paddingVertical: 14, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border },
  backText: { fontSize: fontSize.md, fontWeight: '600', color: colors.text },
  nextBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: radius.md, backgroundColor: colors.primary },
  nextText: { fontSize: fontSize.md, fontWeight: '700', color: '#FFFFFF' },
});
