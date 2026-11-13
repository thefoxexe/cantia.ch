import { useState } from 'react';
import { Platform, View } from 'react-native';
import { BigResult, Chips, Field, Group, Hint, Input, Lines, Note, ToolPage } from '../../components/tools/ToolPage';
import { LeadGate } from '../../components/tools/LeadGate';
import { hourlyRate } from '../../lib/tools/calcs';
import { chf, downloadToolPdf, num, pct } from '../../lib/tools/toolPdf';
import { fill, toolCopy, toolLocale, toolPrefix, toolsChrome } from '../../lib/tools/copy';
import { spacing } from '../../lib/theme';

// Free tool: the hourly rate a construction company must charge to cover
// salaries, employer charges, overheads and a margin. Texts in
// lib/tools/copy.json (French, German, Italian).

const SLUG = 'calcul-taux-horaire';

export const FAQ = toolCopy(SLUG, 'fr').faq;

export default function HourlyRatePage() {
  const locale = toolLocale();
  const L = toolCopy(SLUG, locale);
  const C = toolsChrome(locale);
  const [salary, setSalary] = useState('5’600');
  const [salaries, setSalaries] = useState<12 | 13>(13);
  const [employees, setEmployees] = useState('4');
  const [charges, setCharges] = useState('16');
  const [hours, setHours] = useState('1’600');
  const [overhead, setOverhead] = useState('120’000');
  const [margin, setMargin] = useState('10');

  const r = hourlyRate({
    monthlySalary: num(salary),
    salariesPerYear: salaries,
    employees: Math.max(1, num(employees)),
    chargesPercent: num(charges),
    billableHours: Math.max(1, num(hours)),
    overhead: num(overhead),
    marginPercent: num(margin),
  });

  const pdf = () =>
    downloadToolPdf({
      title: L.pdfTitle,
      url: `cantia.ch${toolPrefix(locale)}/outils/${SLUG}`,
      inputs: [
        { label: L.pdfSalary, value: `CHF ${chf(num(salary))} × ${salaries}` },
        { label: L.pdfEmployees, value: String(Math.max(1, num(employees))) },
        { label: L.pdfCharges, value: pct(num(charges)) },
        { label: L.pdfHours, value: chf(num(hours), 0) },
        { label: L.pdfOverhead, value: `CHF ${chf(num(overhead))}` },
        { label: L.pdfMargin, value: pct(num(margin)) },
      ],
      highlight: { label: L.pdfHighlight, value: `CHF ${chf(r.rate)}` },
      results: [
        { label: L.pdfPayroll, value: `CHF ${chf(r.payroll)}` },
        { label: L.pdfCharges, value: `CHF ${chf(r.charges)}` },
        { label: L.pdfCost, value: `CHF ${chf(r.cost)}` },
        { label: L.pdfBillable, value: chf(r.hours, 0) },
        { label: L.pdfCostHour, value: `CHF ${chf(r.costPerHour)}`, strong: true },
        { label: L.pdfTtc, value: `CHF ${chf(r.rateTtc)}` },
        { label: L.pdfProfit, value: `CHF ${chf(r.yearlyProfit)}` },
      ],
      cta: L.pdfCta,
      file: locale === 'fr' ? 'taux-horaire.pdf' : `${SLUG}.pdf`,
      labels: { data: C.pdfData, result: C.pdfResult, disclaimer: C.pdfDisclaimer, dateLocale: C.dateLocale },
    });

  return (
    <ToolPage
      slug={SLUG}
      metaTitle={L.metaTitle}
      metaDescription={L.metaDescription}
      kicker={L.kicker}
      title={L.title}
      lede={L.lede}
      form={
        <View style={{ gap: spacing.lg }}>
          <Group title={L.team}>
            <Field label={L.salary}>
              <Input value={salary} onChange={setSalary} suffix="CHF" />
            </Field>
            <Chips value={salaries} onChange={setSalaries} options={[{ value: 12, label: L.salaries12 }, { value: 13, label: L.salaries13 }]} />
            <Field label={L.employees}>
              <Input value={employees} onChange={setEmployees} />
            </Field>
            <Field label={L.charges} hint={L.chargesHint}>
              <Input value={charges} onChange={setCharges} suffix="%" />
            </Field>
            <Field label={L.hours} hint={L.hoursHint}>
              <Input value={hours} onChange={setHours} suffix="h" />
            </Field>
          </Group>
          <Group title={L.company}>
            <Field label={L.overhead} hint={L.overheadHint}>
              <Input value={overhead} onChange={setOverhead} suffix={L.perYear} />
            </Field>
            <Field label={L.margin}>
              <Input value={margin} onChange={setMargin} suffix="%" />
            </Field>
          </Group>
        </View>
      }
      result={
        <View style={{ gap: spacing.lg }}>
          <BigResult label={L.result} value={`CHF ${chf(r.rate)}`} sub={fill(L.resultSub, { cost: chf(r.costPerHour), ttc: chf(r.rateTtc) })} />
          <Lines
            title={L.hourCost}
            rows={[
              { label: L.salaryCharges, value: `CHF ${chf(r.salaryPerHour)}`, meta: `CHF ${chf(r.payroll + r.charges, 0)} ${L.perYearShort}` },
              { label: L.overheadLine, value: `CHF ${chf(r.overheadPerHour)}`, meta: `CHF ${chf(num(overhead), 0)} ${L.perYearShort}` },
              { label: L.costPrice, value: `CHF ${chf(r.costPerHour)}`, strong: true },
              { label: fill(L.marginLine, { m: pct(num(margin), 1) }), value: `CHF ${chf(r.rate - r.costPerHour)}` },
              { label: L.rateHt, value: `CHF ${chf(r.rate)}`, strong: true },
            ]}
          />
          <Note tone="ok">{fill(L.note, { hours: chf(r.hours, 0), cost: chf(r.cost, 0), profit: chf(r.yearlyProfit, 0) })}</Note>
          {Platform.OS === 'web' ? (
            <View style={{ gap: spacing.xs }}>
              <LeadGate source={`outil:${SLUG}`} locale={locale} onUnlock={pdf} />
              <Hint>{L.pdfHint}</Hint>
            </View>
          ) : null}
        </View>
      }
      cta={{ title: L.ctaTitle, points: L.ctaPoints }}
      faq={L.faq}
    />
  );
}
