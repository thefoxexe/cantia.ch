import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import type { PayLine, SwissPayroll } from '../../lib/payroll/swissEngine.ts';
import { fill, useWizardCopy } from '../../lib/payroll/wizardCopy';
import { colors, fontSize, radius, spacing } from '../../lib/theme';
import { monoType } from '../../lib/marketingTheme';

// Gross → deductions → net, then the employer's side, for one month (and
// the year). Fed by lib/payroll/swissEngine.ts; used in « Ajouter un
// employé » and on the employee's page.

function chf(n: number): string {
  const [int, dec] = Math.abs(n).toFixed(2).split('.');
  return `${n < 0 ? '−' : ''}${int.replace(/\B(?=(\d{3})+(?!\d))/g, '’')}.${dec}`;
}

function rate(l: PayLine): string {
  return l.ratePercent == null ? '' : `${Number(l.ratePercent.toFixed(3))} %`;
}

export function SalarySimulator({ payroll }: { payroll: SwissPayroll }) {
  const c = useWizardCopy();
  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <Feather name="sliders" size={16} color={colors.primary} />
        <Text style={styles.title}>{c.simTitle}</Text>
      </View>

      <View style={styles.block}>
        <Row label={c.simGross} value={chf(payroll.gross)} strong />
        <Row label={c.simYearly} value={chf(payroll.gross * 12)} muted />
      </View>

      <Text style={styles.section}>{c.simEmployee}</Text>
      <View style={styles.block}>
        {payroll.employee.map((l) => (
          <Row key={l.key} label={l.label} rate={rate(l)} value={`−${chf(l.amount)}`} negative />
        ))}
        <Row label={c.simTotalDed} value={`−${chf(payroll.totalDeductions)}`} strong negative />
        {payroll.familyAllowance > 0 ? <Row label={c.simAllowances} value={`+${chf(payroll.familyAllowance)}`} positive /> : null}
      </View>

      <View style={[styles.total, styles.netBox]}>
        <View style={{ flex: 1 }}>
          <Text style={styles.totalLabel}>{c.simNet}</Text>
          <Text style={styles.totalSub}>
            {c.simYearly} {chf(payroll.net * 12)}
          </Text>
        </View>
        <Text style={styles.totalValue}>CHF {chf(payroll.net)}</Text>
      </View>

      <Text style={styles.section}>{c.simEmployer}</Text>
      <View style={styles.block}>
        {payroll.employer.map((l) => (
          <Row key={l.key} label={l.label} rate={rate(l)} value={`+${chf(l.amount)}`} />
        ))}
        <Row label={c.simTotalEr} value={`+${chf(payroll.totalEmployer)}`} strong />
      </View>

      <View style={[styles.total, styles.costBox]}>
        <View style={{ flex: 1 }}>
          <Text style={styles.totalLabel}>{c.simCost}</Text>
          <Text style={styles.totalSub}>
            {c.simYearly} {chf(payroll.totalCost * 12)}
          </Text>
        </View>
        <Text style={styles.totalValue}>CHF {chf(payroll.totalCost)}</Text>
      </View>

      <Text style={styles.foot}>{fill(c.simFoot, { year: payroll.year })}</Text>
    </View>
  );
}

function Row({ label, rate, value, strong, muted, negative, positive }: { label: string; rate?: string; value: string; strong?: boolean; muted?: boolean; negative?: boolean; positive?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, strong && styles.strong, muted && styles.muted]} numberOfLines={2}>
        {label}
      </Text>
      {rate ? <Text style={styles.rowRate}>{rate}</Text> : null}
      <Text style={[styles.rowValue, strong && styles.strong, muted && styles.muted, negative && { color: colors.danger }, positive && { color: colors.success }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md, gap: spacing.sm, backgroundColor: colors.surface },
  head: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingBottom: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  title: { fontSize: fontSize.md, fontWeight: '800', color: colors.text },
  section: { fontSize: 11, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase', color: colors.textMuted, marginTop: spacing.sm },
  block: { gap: 6 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  rowLabel: { flex: 1, fontSize: fontSize.sm, color: colors.text },
  rowRate: { ...monoType, fontSize: 12, color: colors.textMuted, minWidth: 56, textAlign: 'right' },
  rowValue: { ...monoType, fontSize: 13.5, color: colors.text, minWidth: 92, textAlign: 'right', fontVariant: ['tabular-nums'] },
  strong: { fontWeight: '800' },
  muted: { color: colors.textMuted },
  total: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, borderRadius: radius.sm, padding: spacing.md, marginTop: spacing.xs },
  netBox: { backgroundColor: colors.primarySoft },
  costBox: { backgroundColor: colors.surfaceAlt },
  totalLabel: { fontSize: fontSize.sm, fontWeight: '800', color: colors.text },
  totalSub: { ...monoType, fontSize: 12, color: colors.textMuted, marginTop: 2 },
  totalValue: { ...monoType, fontSize: 19, fontWeight: '800', color: colors.text, fontVariant: ['tabular-nums'] },
  foot: { fontSize: 12, lineHeight: 17, color: colors.textMuted, marginTop: spacing.xs },
});
