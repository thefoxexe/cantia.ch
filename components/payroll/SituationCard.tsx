import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { EmployeeWizard } from './EmployeeWizard';
import { SalarySimulator } from './SalarySimulator';
import { computeForProfile, missingForPayslip, type MissingItem } from '../../lib/api/payrollSwiss';
import type { EmployeeRef } from '../../lib/api/payroll';
import type { SwissPayroll } from '../../lib/payroll/swissEngine.ts';
import { fill, useWizardCopy } from '../../lib/payroll/wizardCopy';
import { colors, fontSize, radius, spacing } from '../../lib/theme';
import type { PayrollProfile } from '../../lib/types';

// What's still missing before a first payslip. The employer fills
// everything in; used on the employee's page and in « Fiches de salaire ».
export function PayslipChecklist({ name, missing, onComplete }: { name: string; missing: MissingItem[]; onComplete?: () => void }) {
  const c = useWizardCopy();
  if (!missing.length) return null;
  return (
    <View style={styles.checklist}>
      <View style={styles.checkHead}>
        <Feather name="alert-circle" size={17} color={colors.warning} />
        <Text style={styles.checkTitle}>{c.checklistTitle}</Text>
      </View>
      <Text style={styles.checkText}>{fill(c.checklistText, { name })}</Text>
      <View style={{ gap: 4 }}>
        {missing.map((m) => (
          <View key={m.key} style={styles.checkItem}>
            <View style={styles.checkBox} />
            <Text style={styles.checkItemText}>{m.label}</Text>
            <Text style={styles.required}>{c.required}</Text>
          </View>
        ))}
      </View>
      {onComplete ? (
        <Pressable onPress={onComplete} style={styles.checkBtn}>
          <Text style={styles.checkBtnText}>{c.checklistCta}</Text>
          <Feather name="arrow-right" size={15} color="#FFFFFF" />
        </Pressable>
      ) : null}
    </View>
  );
}

// « Situation & charges » on the employee's page: the checklist, what the
// Swiss rules give for this person, the salary simulation, and the
// questionnaire to change it.
export function SituationCard({
  organizationId,
  userId,
  companyPostalCode,
  employee,
  name,
  profile,
  onUpdated,
}: {
  organizationId: string;
  userId: string | undefined;
  companyPostalCode: string | null | undefined;
  employee: EmployeeRef;
  name: string;
  profile: PayrollProfile | null;
  onUpdated: () => void;
}) {
  const c = useWizardCopy();
  const [open, setOpen] = useState(false);
  const [payroll, setPayroll] = useState<SwissPayroll | null>(null);
  const missing = missingForPayslip(profile);
  const configured = !!profile?.swiss_auto;
  const monthly = profile ? (profile.salary_type === 'hourly' ? Number(profile.hourly_rate_chf ?? 0) * ((42 * 52) / 12) : Number(profile.monthly_salary_chf ?? 0)) : 0;

  useEffect(() => {
    let alive = true;
    if (profile && configured && monthly > 0) computeForProfile(profile, companyPostalCode, monthly, new Date().getFullYear()).then((p) => alive && setPayroll(p));
    else setPayroll(null);
    return () => {
      alive = false;
    };
  }, [profile, configured, monthly, companyPostalCode]);

  return (
    <View style={{ gap: spacing.md }}>
      <PayslipChecklist name={name} missing={missing} onComplete={missing.some((m) => m.key === 'situation') ? () => setOpen(true) : undefined} />
      <View style={styles.card}>
        <View style={styles.head}>
          <View style={styles.icon}>
            <Feather name="shield" size={15} color={colors.primary} />
          </View>
          <Text style={styles.title}>{c.editTitle}</Text>
          <Pressable onPress={() => setOpen(true)} style={styles.editBtn}>
            <Feather name={configured ? 'edit-2' : 'play'} size={14} color={colors.primary} />
            <Text style={styles.editText}>{configured ? c.edit : c.checklistCta}</Text>
          </Pressable>
        </View>
        {configured && payroll ? (
          <View style={{ gap: spacing.sm }}>
            <View style={styles.facts}>
              <Fact label={c.whtTitle} value={payroll.wht.subject ? fill(c.whtYes, { code: payroll.wht.code ?? '', canton: payroll.wht.canton ?? '' }) : c.whtNot} />
              <Fact label="LPP" value={payroll.lpp.applies ? `${payroll.lpp.creditPercent} %` : '—'} />
              <Fact label={c.famTitle} value={payroll.familyAllowance > 0 ? `CHF ${payroll.familyAllowance.toFixed(2)}` : '—'} />
            </View>
            <SalarySimulator payroll={payroll} />
          </View>
        ) : (
          <Text style={styles.text}>{c.autoBanner}</Text>
        )}
      </View>
      <EmployeeWizard
        visible={open}
        onClose={() => setOpen(false)}
        onSaved={() => {
          setOpen(false);
          onUpdated();
        }}
        organizationId={organizationId}
        userId={userId}
        companyPostalCode={companyPostalCode}
        employee={employee}
        profile={profile}
        name={name}
      />
    </View>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.fact}>
      <Text style={styles.factLabel}>{label}</Text>
      <Text style={styles.factValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md, gap: spacing.md, backgroundColor: colors.surface },
  head: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  icon: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primarySoft },
  title: { flex: 1, fontSize: fontSize.md, fontWeight: '800', color: colors.text },
  editBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 7, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1, borderColor: colors.border },
  editText: { fontSize: fontSize.sm, fontWeight: '700', color: colors.primary },
  text: { fontSize: fontSize.sm, lineHeight: 20, color: colors.textMuted },
  facts: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  fact: { flexGrow: 1, minWidth: 140, borderRadius: radius.sm, padding: spacing.sm, backgroundColor: colors.bg, gap: 2 },
  factLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.4, textTransform: 'uppercase', color: colors.textMuted },
  factValue: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text },
  checklist: { borderWidth: 1, borderColor: colors.warning, borderRadius: radius.md, padding: spacing.md, gap: spacing.sm, backgroundColor: colors.warningSoft },
  checkHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  checkTitle: { flex: 1, fontSize: fontSize.md, fontWeight: '800', color: colors.text },
  checkText: { fontSize: fontSize.sm, lineHeight: 20, color: colors.text },
  checkItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  checkBox: { width: 14, height: 14, borderRadius: 3, borderWidth: 1.5, borderColor: colors.textMuted },
  checkItemText: { flex: 1, fontSize: fontSize.sm, color: colors.text },
  required: { fontSize: 11, fontWeight: '700', color: colors.warning },
  checkBtn: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.text, borderRadius: radius.sm, paddingVertical: 9, paddingHorizontal: 14, marginTop: spacing.xs },
  checkBtnText: { fontSize: fontSize.sm, fontWeight: '700', color: '#FFFFFF' },
});
