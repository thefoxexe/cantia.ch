import { useState } from 'react';
import { Platform, View } from 'react-native';
import { BigResult, Chips, Field, Group, Hint, Input, Lines, Note, ToolPage } from '../../components/tools/ToolPage';
import { LeadGate } from '../../components/tools/LeadGate';
import { marginFromCost, marginFromPrice } from '../../lib/tools/calcs';
import { chf, downloadToolPdf, num, pct } from '../../lib/tools/toolPdf';
import { fill, toolCopy, toolLocale, toolPrefix, toolsChrome } from '../../lib/tools/copy';
import { spacing } from '../../lib/theme';

// Free tool: selling price from cost and margin, margin vs markup, and the
// multiplying coefficient. Texts in lib/tools/copy.json (French, German,
// Italian).

const SLUG = 'calcul-marge';

export const FAQ = toolCopy(SLUG, 'fr').faq;

const TABLE = [5, 10, 15, 20, 25, 30, 40, 50];
const coef = (c: number) => String(c).replace('.', ',');

export default function MarginPage() {
  const locale = toolLocale();
  const L = toolCopy(SLUG, locale);
  const C = toolsChrome(locale);
  const [mode, setMode] = useState<'marge' | 'prix'>('marge');
  const [cost, setCost] = useState('100');
  const [margin, setMargin] = useState('20');
  const [price, setPrice] = useState('130');
  const r = mode === 'marge' ? marginFromCost(num(cost), num(margin)) : marginFromPrice(num(cost), num(price));

  const pdf = () =>
    downloadToolPdf({
      title: L.pdfTitle,
      url: `cantia.ch${toolPrefix(locale)}/outils/${SLUG}`,
      inputs: [
        { label: L.pdfCost, value: `CHF ${chf(r.cost)}` },
        mode === 'marge' ? { label: L.pdfMargin, value: pct(num(margin)) } : { label: L.pdfPrice, value: `CHF ${chf(r.price)}` },
      ],
      highlight: { label: L.priceHt, value: `CHF ${chf(r.price)}` },
      results: [
        { label: L.pdfProfit, value: `CHF ${chf(r.profit)}` },
        { label: L.marginLine, value: pct(r.marginPercent) },
        { label: L.markupLine, value: pct(r.markupPercent) },
        { label: L.coefLine, value: coef(r.coefficient) },
      ],
      notes: TABLE.map((m) => {
        const x = marginFromCost(100, m);
        return fill(L.pdfNote, { m, k: pct(x.markupPercent, 1), c: coef(x.coefficient) });
      }),
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
          <Chips value={mode} onChange={setMode} options={[{ value: 'marge', label: L.knowMargin }, { value: 'prix', label: L.knowPrice }]} />
          <Field label={L.cost}>
            <Input value={cost} onChange={setCost} suffix="CHF" />
          </Field>
          {mode === 'marge' ? (
            <Field label={L.marginWanted}>
              <Input value={margin} onChange={setMargin} suffix="%" />
            </Field>
          ) : (
            <Field label={L.priceHt}>
              <Input value={price} onChange={setPrice} suffix="CHF" />
            </Field>
          )}
        </Group>
      }
      result={
        <View style={{ gap: spacing.lg }}>
          <BigResult label={mode === 'marge' ? L.priceHt : L.yourMargin} value={mode === 'marge' ? `CHF ${chf(r.price)}` : pct(r.marginPercent)} sub={fill(L.sub, { profit: chf(r.profit), coef: coef(r.coefficient) })} />
          <Lines
            rows={[
              { label: L.marginLine, value: pct(r.marginPercent) },
              { label: L.markupLine, value: pct(r.markupPercent) },
              { label: L.coefLine, value: coef(r.coefficient) },
            ]}
          />
          <Lines
            title={L.table}
            rows={TABLE.map((m) => {
              const x = marginFromCost(100, m);
              return { label: fill(L.tableRow, { m }), value: fill(L.tableValue, { k: pct(x.markupPercent, 1), c: coef(x.coefficient) }) };
            })}
          />
          <Note tone="warn">{L.warn}</Note>
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
