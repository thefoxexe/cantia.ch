import { useState } from 'react';
import { Platform, View } from 'react-native';
import { BigResult, Field, Group, Hint, Input, Lines, Note, ToolPage } from '../../components/tools/ToolPage';
import { LeadGate } from '../../components/tools/LeadGate';
import { lateInterest } from '../../lib/tools/calcs';
import { chf, downloadToolPdf, num, pct } from '../../lib/tools/toolPdf';
import { fill, toolCopy, toolLocale, toolPrefix, toolsChrome } from '../../lib/tools/copy';
import { spacing } from '../../lib/theme';

// Free tool: default interest on an unpaid invoice (art. 104 CO). Texts in
// lib/tools/copy.json (French, German, Italian).

const SLUG = 'interets-de-retard';

export const FAQ = toolCopy(SLUG, 'fr').faq;

function isoOf(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Accepts 31.01.2026, 31/01/2026 or 2026-01-31.
function parseDate(s: string): string | null {
  const t = s.trim();
  let m = t.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (m) return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`;
  m = t.match(/^(\d{1,2})[./](\d{1,2})[./](\d{2,4})$/);
  if (m) return `${m[3].length === 2 ? `20${m[3]}` : m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
  return null;
}

const swiss = (iso: string) => `${iso.slice(8, 10)}.${iso.slice(5, 7)}.${iso.slice(0, 4)}`;

export default function LateInterestPage() {
  const locale = toolLocale();
  const L = toolCopy(SLUG, locale);
  const C = toolsChrome(locale);
  const today = new Date();
  const due0 = new Date(today);
  due0.setDate(due0.getDate() - 60);
  const [amount, setAmount] = useState('10’000');
  const [due, setDue] = useState(swiss(isoOf(due0)));
  const [paid, setPaid] = useState(swiss(isoOf(today)));
  const [rate, setRate] = useState('5');
  const dueIso = parseDate(due);
  const paidIso = parseDate(paid);
  const valid = !!dueIso && !!paidIso;
  const r = valid ? lateInterest(num(amount), dueIso!, paidIso!, num(rate)) : { days: 0, interest: 0, total: num(amount), perDay: 0 };

  const pdf = () =>
    downloadToolPdf({
      title: L.pdfTitle,
      url: `cantia.ch${toolPrefix(locale)}/outils/${SLUG}`,
      inputs: [
        { label: L.invoice, value: `CHF ${chf(num(amount))}` },
        { label: L.pdfDue, value: dueIso ? swiss(dueIso) : '—' },
        { label: L.pdfPaid, value: paidIso ? swiss(paidIso) : '—' },
        { label: L.pdfRate, value: pct(num(rate)) },
      ],
      highlight: { label: L.result, value: `CHF ${chf(r.interest)}` },
      results: [
        { label: L.pdfDays, value: String(r.days) },
        { label: L.pdfPerDay, value: `CHF ${chf(r.perDay)}` },
        { label: L.pdfTotal, value: `CHF ${chf(r.total)}`, strong: true },
      ],
      notes: [L.pdfNote],
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
          <Field label={L.amount}>
            <Input value={amount} onChange={setAmount} suffix="CHF" />
          </Field>
          <Field label={L.due} hint={L.dateFormat}>
            <Input value={due} onChange={setDue} placeholder="31.01.2026" />
          </Field>
          <Field label={L.paid}>
            <Input value={paid} onChange={setPaid} placeholder="31.03.2026" />
          </Field>
          <Field label={L.rate} hint={L.rateHint}>
            <Input value={rate} onChange={setRate} suffix="%" />
          </Field>
        </Group>
      }
      result={
        <View style={{ gap: spacing.lg }}>
          <BigResult label={L.result} value={`CHF ${chf(r.interest)}`} sub={valid ? fill(L.sub, { days: r.days, perDay: chf(r.perDay) }) : L.badDates} />
          <Lines
            rows={[
              { label: L.invoice, value: `CHF ${chf(num(amount))}` },
              { label: L.interest, value: `CHF ${chf(r.interest)}` },
              { label: L.total, value: `CHF ${chf(r.total)}`, strong: true },
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
