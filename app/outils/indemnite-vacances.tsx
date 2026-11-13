import { useState } from 'react';
import { Platform, View } from 'react-native';
import { BigResult, Chips, Field, Group, Hint, Input, Lines, Note, ToolPage } from '../../components/tools/ToolPage';
import { LeadGate } from '../../components/tools/LeadGate';
import { vacationPay, vacationPercent } from '../../lib/tools/calcs';
import { chf, downloadToolPdf, num, pct } from '../../lib/tools/toolPdf';
import { fill, toolCopy, toolLocale, toolPrefix, toolsChrome } from '../../lib/tools/copy';
import { spacing } from '../../lib/theme';

// Free tool: holiday supplement for hourly paid staff. Texts in
// lib/tools/copy.json (French, German, Italian).

const SLUG = 'indemnite-vacances';

export const FAQ = toolCopy(SLUG, 'fr').faq;

export default function VacationPage() {
  const locale = toolLocale();
  const L = toolCopy(SLUG, locale);
  const C = toolsChrome(locale);
  const [hourly, setHourly] = useState('32');
  const [weeks, setWeeks] = useState<number>(5);
  const [hours, setHours] = useState('170');
  const r = vacationPay(num(hourly), weeks, num(hours));

  const pdf = () =>
    downloadToolPdf({
      title: L.pdfTitle,
      url: `cantia.ch${toolPrefix(locale)}/outils/${SLUG}`,
      inputs: [
        { label: L.base, value: `CHF ${chf(num(hourly))}` },
        { label: L.pdfWeeks, value: String(weeks) },
        { label: L.pdfHours, value: chf(num(hours), 0) },
      ],
      highlight: { label: L.result, value: pct(r.percent) },
      results: [
        { label: L.pdfSupplement, value: `CHF ${chf(r.supplement)}` },
        { label: L.withHoliday, value: `CHF ${chf(r.hourlyWithHoliday)}`, strong: true },
        { label: L.pdfMonth, value: `CHF ${chf(r.monthly)}` },
      ],
      notes: [4, 5, 6, 7].map((w) => fill(L.pdfNote, { w, p: pct(vacationPercent(w)) })),
      cta: L.pdfCta,
      file: `${SLUG}.pdf`,
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
        <Group title={L.group}>
          <Field label={L.hourly}>
            <Input value={hourly} onChange={setHourly} suffix={L.perHourSuffix} />
          </Field>
          <Field label={L.weeks}>
            <Chips value={weeks} onChange={setWeeks} options={[4, 5, 6, 7].map((w) => ({ value: w, label: fill(L.weeksLabel, { w }) }))} />
          </Field>
          <Field label={L.hours}>
            <Input value={hours} onChange={setHours} suffix="h" />
          </Field>
        </Group>
      }
      result={
        <View style={{ gap: spacing.lg }}>
          <BigResult label={L.result} value={pct(r.percent)} sub={fill(L.sub, { s: chf(r.supplement) })} />
          <Lines
            rows={[
              { label: L.base, value: `CHF ${chf(num(hourly))}` },
              { label: fill(L.supplementLine, { p: pct(r.percent) }), value: `CHF ${chf(r.supplement)}` },
              { label: L.withHoliday, value: `CHF ${chf(r.hourlyWithHoliday)}`, strong: true },
              { label: fill(L.monthLine, { h: chf(num(hours), 0) }), value: `CHF ${chf(r.monthly)}` },
            ]}
          />
          <Note>{L.note}</Note>
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
