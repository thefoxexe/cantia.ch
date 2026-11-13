import { useState } from 'react';
import { Platform, View } from 'react-native';
import { BigResult, Chips, Field, Group, Hint, Input, Lines, Note, ToolPage } from '../../components/tools/ToolPage';
import { LeadGate } from '../../components/tools/LeadGate';
import { vat } from '../../lib/tools/calcs';
import { chf, downloadToolPdf, num } from '../../lib/tools/toolPdf';
import { fill, toolCopy, toolLocale, toolPrefix, toolsChrome } from '../../lib/tools/copy';
import { spacing } from '../../lib/theme';

// Free tool: Swiss VAT, net ↔ gross, at the 2024+ rates. Texts in
// lib/tools/copy.json (French, German, Italian).

const SLUG = 'calcul-tva';

export const FAQ = toolCopy(SLUG, 'fr').faq;

export default function VatPage() {
  const locale = toolLocale();
  const L = toolCopy(SLUG, locale);
  const C = toolsChrome(locale);
  const [amount, setAmount] = useState('1’000');
  const [from, setFrom] = useState<'ht' | 'ttc'>('ht');
  const [rate, setRate] = useState<number>(8.1);
  const [round5, setRound5] = useState<'oui' | 'non'>('non');
  const r = vat(num(amount), rate, from, round5 === 'oui');
  const rateLabel = `${String(rate).replace('.', ',')} %`;
  const factor = (1 + rate / 100).toFixed(3).replace('.', ',');

  const pdf = () =>
    downloadToolPdf({
      title: L.pdfTitle,
      url: `cantia.ch${toolPrefix(locale)}/outils/${SLUG}`,
      inputs: [
        { label: from === 'ht' ? L.amountHt : L.amountTtc, value: `CHF ${chf(num(amount))}` },
        { label: L.pdfRate, value: rateLabel },
        { label: L.pdfRound, value: round5 === 'oui' ? L.yes : L.no },
      ],
      highlight: { label: from === 'ht' ? L.ttc : L.ht, value: `CHF ${chf(from === 'ht' ? r.ttc : r.ht)}` },
      results: [
        { label: L.ht, value: `CHF ${chf(r.ht)}` },
        { label: `${L.vat} ${rateLabel}`, value: `CHF ${chf(r.vat)}` },
        { label: L.ttc, value: `CHF ${chf(r.ttc)}`, strong: true },
      ],
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
          <Chips value={from} onChange={setFrom} options={[{ value: 'ht', label: L.haveHt }, { value: 'ttc', label: L.haveTtc }]} />
          <Field label={from === 'ht' ? L.amountHt : L.amountTtc}>
            <Input value={amount} onChange={setAmount} suffix="CHF" />
          </Field>
          <Field label={L.rate}>
            <Chips
              value={rate}
              onChange={setRate}
              options={[
                { value: 8.1, label: `8,1 % ${L.rateNormal}` },
                { value: 2.6, label: `2,6 % ${L.rateReduced}` },
                { value: 3.8, label: `3,8 % ${L.rateLodging}` },
              ]}
            />
          </Field>
          <Field label={L.round}>
            <Chips value={round5} onChange={setRound5} options={[{ value: 'non', label: L.no }, { value: 'oui', label: L.yes }]} />
          </Field>
        </Group>
      }
      result={
        <View style={{ gap: spacing.lg }}>
          <BigResult label={from === 'ht' ? L.ttc : L.ht} value={`CHF ${chf(from === 'ht' ? r.ttc : r.ht)}`} sub={`${L.vat} ${rateLabel}${locale === 'fr' ? ' : ' : ': '}CHF ${chf(r.vat)}`} />
          <Lines
            rows={[
              { label: L.ht, value: `CHF ${chf(r.ht)}` },
              { label: `${L.vat} ${rateLabel}`, value: `CHF ${chf(r.vat)}` },
              { label: L.ttc, value: `CHF ${chf(r.ttc)}`, strong: true },
            ]}
          />
          <Note>{fill(L.formula, { f: factor })}</Note>
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
