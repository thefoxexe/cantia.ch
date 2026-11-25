import { useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Field, Group, Hint, Input, Lines, Note, ToolPage } from '../../components/tools/ToolPage';
import { num } from '../../lib/tools/toolPdf';
import { toolCopy, toolLocale } from '../../lib/tools/copy';
import { buildQrBillPdf, downloadBytes, qrToolErrors, type QrToolInput } from '../../lib/tools/qrBillTool';
import { sans, site } from '../../lib/siteTheme';
import { spacing } from '../../lib/theme';

// Free tool: a Swiss QR-bill as a PDF, built in the browser with the same
// renderer as Cantia's invoices (lib/tools/qrbill, copied from the edge
// functions). Texts in lib/tools/copy.json (French, German, Italian).

const SLUG = 'qr-facture';

export const FAQ = toolCopy(SLUG, 'fr').faq;

export default function QrBillToolPage() {
  const locale = toolLocale();
  const L = toolCopy(SLUG, locale);
  const [form, setForm] = useState({
    iban: '',
    creditorName: '',
    creditorStreet: '',
    creditorPostalCode: '',
    creditorTown: '',
    amount: '',
    debtorName: '',
    debtorStreet: '',
    debtorPostalCode: '',
    debtorTown: '',
    message: '',
  });
  const [state, setState] = useState<'idle' | 'building' | 'done'>('idle');
  const [tried, setTried] = useState(false);
  const set = (k: keyof typeof form) => (v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setState('idle');
  };
  const input: QrToolInput = { ...form, amount: num(form.amount) };
  const errors = qrToolErrors(input);
  const errorText = (k: string) => (tried && errors.includes(k) ? (k === 'iban' ? L.errIban : k === 'creditor' ? L.errCreditor : L.errAmount) : null);

  async function generate() {
    setTried(true);
    if (errors.length) return;
    setState('building');
    try {
      const bytes = await buildQrBillPdf(input, locale, L.pdfTitle);
      downloadBytes(bytes, `${L.pdfTitle.toLowerCase()}-qr.pdf`);
      setState('done');
    } catch {
      setState('idle');
    }
  }

  const err = (k: string) => {
    const e = errorText(k);
    return e ? <Note tone="warn">{e}</Note> : null;
  };

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
          <Group title={L.groupCreditor}>
            <Field label={L.iban} hint={L.ibanHint}>
              <Input value={form.iban} onChange={set('iban')} placeholder="CH93 0076 2011 6238 5295 7" wide />
            </Field>
            {err('iban')}
            <Field label={L.name}>
              <Input value={form.creditorName} onChange={set('creditorName')} wide />
            </Field>
            <Field label={L.street}>
              <Input value={form.creditorStreet} onChange={set('creditorStreet')} wide />
            </Field>
            <View style={{ flexDirection: 'row', gap: spacing.md }}>
              <View style={{ width: 110 }}>
                <Field label={L.postalCode}>
                  <Input value={form.creditorPostalCode} onChange={set('creditorPostalCode')} />
                </Field>
              </View>
              <View style={{ flex: 1 }}>
                <Field label={L.town}>
                  <Input value={form.creditorTown} onChange={set('creditorTown')} wide />
                </Field>
              </View>
            </View>
            {err('creditor')}
          </Group>
          <Group title={L.groupPayment}>
            <Field label={L.amount}>
              <Input value={form.amount} onChange={set('amount')} suffix="CHF" />
            </Field>
            {err('amount')}
            <Field label={L.message}>
              <Input value={form.message} onChange={set('message')} wide />
            </Field>
          </Group>
          <Group title={L.groupDebtor}>
            <Field label={L.name}>
              <Input value={form.debtorName} onChange={set('debtorName')} wide />
            </Field>
            <Field label={L.street}>
              <Input value={form.debtorStreet} onChange={set('debtorStreet')} wide />
            </Field>
            <View style={{ flexDirection: 'row', gap: spacing.md }}>
              <View style={{ width: 110 }}>
                <Field label={L.postalCode}>
                  <Input value={form.debtorPostalCode} onChange={set('debtorPostalCode')} />
                </Field>
              </View>
              <View style={{ flex: 1 }}>
                <Field label={L.town}>
                  <Input value={form.debtorTown} onChange={set('debtorTown')} wide />
                </Field>
              </View>
            </View>
          </Group>
        </View>
      }
      result={
        <View style={{ gap: spacing.lg }}>
          <Lines title={L.resultTitle} rows={L.resultPoints.map((p: string) => ({ label: p, value: '✓' }))} />
          {Platform.OS === 'web' ? (
            <View style={{ gap: spacing.sm }}>
              <Pressable
                onPress={generate}
                disabled={state === 'building'}
                accessibilityRole="button"
                style={({ hovered }: any) => ({ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 15, paddingHorizontal: 20, borderRadius: 10, backgroundColor: hovered ? site.rust : site.copper, opacity: state === 'building' ? 0.7 : 1 })}
              >
                <Feather name="download" size={17} color="#fff" />
                <Text style={[sans, { color: '#fff', fontSize: 15, fontWeight: '700' }]}>{state === 'building' ? L.building : L.button}</Text>
              </Pressable>
              {state === 'done' ? <Note tone="ok">{L.done}</Note> : null}
              <Hint>{L.privacy}</Hint>
            </View>
          ) : null}
        </View>
      }
      cta={{ title: L.ctaTitle, points: L.ctaPoints }}
      faq={L.faq}
    />
  );
}
