import { useState } from 'react';
import { Platform, View } from 'react-native';
import { BigResult, Chips, Field, Group, Hint, Input, Lines, Note, ToolPage } from '../../components/tools/ToolPage';
import { LeadGate } from '../../components/tools/LeadGate';
import { vat } from '../../lib/tools/calcs';
import { chf, downloadToolPdf, num } from '../../lib/tools/toolPdf';
import { spacing } from '../../lib/theme';

// Free tool: Swiss VAT, net ↔ gross, at the 2024+ rates.

const SLUG = 'calcul-tva';

export const FAQ = [
  {
    q: 'Quels sont les taux de TVA en Suisse en 2026 ?',
    a: 'Depuis le 1er janvier 2024 : 8,1 % (taux normal, la plupart des travaux et prestations du bâtiment), 2,6 % (taux réduit : denrées alimentaires, livres, médicaments) et 3,8 % (taux spécial pour l’hébergement).',
  },
  {
    q: 'Comment passer d’un prix TTC à un prix HT ?',
    a: 'Divisez le prix TTC par 1 + le taux. Au taux normal : HT = TTC ÷ 1,081. La TVA vaut alors TTC − HT. Par exemple, CHF 1’081 TTC = CHF 1’000 HT + CHF 81 de TVA.',
  },
  {
    q: 'Faut-il arrondir la TVA aux 5 centimes ?',
    a: 'Sur une facture, l’arrondi aux 5 centimes est l’usage en Suisse pour les montants payables en espèces, mais il n’est pas obligatoire. Dans le décompte TVA, seul le montant final peut être arrondi, en faveur du contribuable.',
  },
  {
    q: 'À partir de quel chiffre d’affaires faut-il s’assujettir à la TVA ?',
    a: 'L’assujettissement est obligatoire dès CHF 100’000 de chiffre d’affaires annuel provenant de prestations imposables en Suisse. En dessous, on peut s’assujettir volontairement pour récupérer la TVA sur les achats.',
  },
];

export default function VatPage() {
  const [amount, setAmount] = useState('1’000');
  const [from, setFrom] = useState<'ht' | 'ttc'>('ht');
  const [rate, setRate] = useState<number>(8.1);
  const [round5, setRound5] = useState<'oui' | 'non'>('non');
  const r = vat(num(amount), rate, from, round5 === 'oui');
  const rateLabel = `${String(rate).replace('.', ',')} %`;

  const pdf = () =>
    downloadToolPdf({
      title: 'Calcul de TVA',
      url: 'cantia.ch/outils/calcul-tva',
      inputs: [
        { label: from === 'ht' ? 'Montant hors TVA' : 'Montant TVA comprise', value: `CHF ${chf(num(amount))}` },
        { label: 'Taux', value: rateLabel },
        { label: 'Arrondi aux 5 centimes', value: round5 === 'oui' ? 'Oui' : 'Non' },
      ],
      highlight: { label: from === 'ht' ? 'Montant TTC' : 'Montant HT', value: `CHF ${chf(from === 'ht' ? r.ttc : r.ht)}` },
      results: [
        { label: 'Montant HT', value: `CHF ${chf(r.ht)}` },
        { label: `TVA ${rateLabel}`, value: `CHF ${chf(r.vat)}` },
        { label: 'Montant TTC', value: `CHF ${chf(r.ttc)}`, strong: true },
      ],
      cta: 'Devis et factures avec TVA et décompte AFC automatiques : cantia.ch · 14 jours d’essai',
      file: 'calcul-tva.pdf',
    });

  return (
    <ToolPage
      slug={SLUG}
      metaTitle="Calcul TVA Suisse 2026 : HT ↔ TTC à 8,1 %, 2,6 %, 3,8 % | Cantia"
      metaDescription="Calculateur de TVA suisse gratuit : passez du hors taxe au TTC et inversement aux taux 2026 (8,1 %, 2,6 %, 3,8 %), avec arrondi aux 5 centimes."
      kicker="Outil gratuit · TVA"
      title="Calcul de TVA suisse"
      lede="Hors taxe vers TTC ou TTC vers hors taxe, aux taux en vigueur en Suisse. Avec le montant de TVA à reporter sur vos devis et factures."
      form={
        <Group title="Montant">
          <Chips value={from} onChange={setFrom} options={[{ value: 'ht', label: 'J’ai le montant HT' }, { value: 'ttc', label: 'J’ai le montant TTC' }]} />
          <Field label={from === 'ht' ? 'Montant hors TVA' : 'Montant TVA comprise'}>
            <Input value={amount} onChange={setAmount} suffix="CHF" />
          </Field>
          <Field label="Taux de TVA">
            <Chips
              value={rate}
              onChange={setRate}
              options={[
                { value: 8.1, label: '8,1 % normal' },
                { value: 2.6, label: '2,6 % réduit' },
                { value: 3.8, label: '3,8 % hébergement' },
              ]}
            />
          </Field>
          <Field label="Arrondir la TVA aux 5 centimes">
            <Chips value={round5} onChange={setRound5} options={[{ value: 'non', label: 'Non' }, { value: 'oui', label: 'Oui' }]} />
          </Field>
        </Group>
      }
      result={
        <View style={{ gap: spacing.lg }}>
          <BigResult label={from === 'ht' ? 'Montant TTC' : 'Montant HT'} value={`CHF ${chf(from === 'ht' ? r.ttc : r.ht)}`} sub={`TVA ${rateLabel} : CHF ${chf(r.vat)}`} />
          <Lines
            rows={[
              { label: 'Montant HT', value: `CHF ${chf(r.ht)}` },
              { label: `TVA ${rateLabel}`, value: `CHF ${chf(r.vat)}` },
              { label: 'Montant TTC', value: `CHF ${chf(r.ttc)}`, strong: true },
            ]}
          />
          <Note>Formule : TTC = HT × {(1 + rate / 100).toFixed(3).replace('.', ',')} · HT = TTC ÷ {(1 + rate / 100).toFixed(3).replace('.', ',')}</Note>
          {Platform.OS === 'web' ? (
            <View style={{ gap: spacing.xs }}>
              <LeadGate source={`outil:${SLUG}`} locale="fr" onUnlock={pdf} />
              <Hint>Le calcul sur une page, à joindre à votre devis ou à votre comptabilité.</Hint>
            </View>
          ) : null}
        </View>
      }
      cta={{
        title: 'Avec Cantia, la TVA se calcule toute seule',
        points: [
          'Taux par document (8,1 %, 2,6 %, 3,8 % ou sans TVA) sur vos devis et factures',
          'Factures QR conformes, envoyées par e-mail',
          'Décompte TVA trimestriel rempli comme le formulaire de l’AFC',
          'Non assujetti ? Les documents sont émis sans TVA automatiquement',
        ],
      }}
      faq={FAQ}
    />
  );
}
