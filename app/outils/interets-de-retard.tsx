import { useState } from 'react';
import { Platform, View } from 'react-native';
import { BigResult, Field, Group, Hint, Input, Lines, Note, ToolPage } from '../../components/tools/ToolPage';
import { LeadGate } from '../../components/tools/LeadGate';
import { lateInterest } from '../../lib/tools/calcs';
import { chf, downloadToolPdf, num, pct } from '../../lib/tools/toolPdf';
import { spacing } from '../../lib/theme';

// Free tool: default interest on an unpaid invoice (art. 104 CO).

const SLUG = 'interets-de-retard';

export const FAQ = [
  {
    q: 'Quel est le taux d’intérêt de retard en Suisse ?',
    a: 'Le Code des obligations (art. 104 CO) fixe l’intérêt moratoire à 5 % par an, sauf si le contrat ou vos conditions générales prévoient un autre taux. Entre commerçants, un taux plus élevé peut être réclamé s’il correspond au taux d’escompte bancaire usuel.',
  },
  {
    q: 'À partir de quand courent les intérêts de retard ?',
    a: 'Si la facture indique une échéance précise (par exemple « payable à 30 jours »), le client est en demeure dès le lendemain de l’échéance, sans rappel (art. 102 al. 2 CO). Sans échéance fixe, il faut d’abord une interpellation, en pratique un rappel.',
  },
  {
    q: 'Peut-on facturer des frais de rappel ?',
    a: 'Seulement s’ils sont prévus dans le contrat ou les conditions générales acceptées par le client. Les intérêts moratoires, eux, sont dus de par la loi.',
  },
  {
    q: 'Comment calculer les intérêts de retard ?',
    a: 'Montant × taux × nombre de jours de retard ÷ 365. Pour une facture de CHF 10’000 payée 60 jours après l’échéance : 10’000 × 5 % × 60 ÷ 365 = CHF 82.20.',
  },
];

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
      title: 'Intérêts de retard',
      url: 'cantia.ch/outils/interets-de-retard',
      inputs: [
        { label: 'Montant de la facture', value: `CHF ${chf(num(amount))}` },
        { label: 'Échéance', value: dueIso ? swiss(dueIso) : '—' },
        { label: 'Date du paiement (ou du calcul)', value: paidIso ? swiss(paidIso) : '—' },
        { label: 'Taux annuel (art. 104 CO)', value: pct(num(rate)) },
      ],
      highlight: { label: 'Intérêts de retard', value: `CHF ${chf(r.interest)}` },
      results: [
        { label: 'Jours de retard', value: String(r.days) },
        { label: 'Intérêt par jour', value: `CHF ${chf(r.perDay)}` },
        { label: 'Montant dû avec intérêts', value: `CHF ${chf(r.total)}`, strong: true },
      ],
      notes: ['Calcul : montant × taux × jours ÷ 365. Les intérêts courent dès le lendemain de l’échéance indiquée sur la facture (art. 102 al. 2 CO).'],
      cta: 'Rappels de paiement automatiques et suivi des impayés avec Cantia : cantia.ch · 14 jours d’essai',
      file: 'interets-de-retard.pdf',
    });

  return (
    <ToolPage
      slug={SLUG}
      metaTitle="Calcul des intérêts de retard en Suisse (5 %, art. 104 CO) | Cantia"
      metaDescription="Calculez gratuitement les intérêts moratoires d’une facture impayée selon le Code des obligations : 5 % par an dès l’échéance. Avec le total à réclamer."
      kicker="Outil gratuit · Impayés"
      title="Intérêts de retard"
      lede="Combien réclamer sur une facture payée en retard : les intérêts moratoires du Code des obligations, jour par jour, et le total dû."
      form={
        <Group title="Facture">
          <Field label="Montant de la facture (TTC)">
            <Input value={amount} onChange={setAmount} suffix="CHF" />
          </Field>
          <Field label="Date d’échéance" hint="Format JJ.MM.AAAA">
            <Input value={due} onChange={setDue} placeholder="31.01.2026" />
          </Field>
          <Field label="Date du paiement (ou d’aujourd’hui)">
            <Input value={paid} onChange={setPaid} placeholder="31.03.2026" />
          </Field>
          <Field label="Taux annuel" hint="5 % selon l’art. 104 CO, sauf autre taux convenu.">
            <Input value={rate} onChange={setRate} suffix="%" />
          </Field>
        </Group>
      }
      result={
        <View style={{ gap: spacing.lg }}>
          <BigResult label="Intérêts de retard" value={`CHF ${chf(r.interest)}`} sub={valid ? `${r.days} jours de retard · CHF ${chf(r.perDay)} par jour` : 'Vérifiez les dates (JJ.MM.AAAA)'} />
          <Lines
            rows={[
              { label: 'Montant de la facture', value: `CHF ${chf(num(amount))}` },
              { label: 'Intérêts', value: `CHF ${chf(r.interest)}` },
              { label: 'Total à réclamer', value: `CHF ${chf(r.total)}`, strong: true },
            ]}
          />
          <Note>Facture avec échéance fixe : le client est en demeure dès le lendemain, sans rappel. Sans échéance, envoyez d’abord un rappel : les intérêts courent dès sa réception.</Note>
          {Platform.OS === 'web' ? (
            <View style={{ gap: spacing.xs }}>
              <LeadGate source={`outil:${SLUG}`} locale="fr" onUnlock={pdf} />
              <Hint>Le décompte des intérêts sur une page, à joindre à votre rappel.</Hint>
            </View>
          ) : null}
        </View>
      }
      cta={{
        title: 'Ne courez plus après vos factures',
        points: [
          'Rappels de paiement envoyés automatiquement à l’échéance',
          'Factures QR : le paiement est rapproché tout seul',
          'Tableau des impayés et trésorerie prévisionnelle',
          'Relances de devis non signés, elles aussi automatiques',
        ],
      }}
      faq={FAQ}
    />
  );
}
