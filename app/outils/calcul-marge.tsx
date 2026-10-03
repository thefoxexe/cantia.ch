import { useState } from 'react';
import { Platform, View } from 'react-native';
import { BigResult, Chips, Field, Group, Hint, Input, Lines, Note, ToolPage } from '../../components/tools/ToolPage';
import { LeadGate } from '../../components/tools/LeadGate';
import { marginFromCost, marginFromPrice } from '../../lib/tools/calcs';
import { chf, downloadToolPdf, num, pct } from '../../lib/tools/toolPdf';
import { spacing } from '../../lib/theme';

// Free tool: selling price from cost and margin, margin vs markup, and the
// multiplying coefficient.

const SLUG = 'calcul-marge';

export const FAQ = [
  {
    q: 'Quelle est la différence entre marge et majoration ?',
    a: 'La marge se calcule sur le prix de vente, la majoration (ou taux de marque) sur le coût. Un matériel acheté CHF 100 et revendu CHF 125 donne CHF 25 de bénéfice : 20 % de marge (25 ÷ 125) mais 25 % de majoration (25 ÷ 100). Confondre les deux fait perdre de l’argent sur chaque devis.',
  },
  {
    q: 'Comment calculer un prix de vente à partir d’une marge ?',
    a: 'Prix de vente = coût ÷ (1 − marge). Pour 20 % de marge sur un coût de CHF 100 : 100 ÷ 0,8 = CHF 125. Multiplier le coût par 1,20 ne donne que 16,7 % de marge.',
  },
  {
    q: 'Qu’est-ce que le coefficient multiplicateur ?',
    a: 'C’est le nombre par lequel multiplier le coût d’achat pour obtenir le prix de vente : prix ÷ coût. Un coefficient de 1,25 correspond à 25 % de majoration et 20 % de marge.',
  },
  {
    q: 'Quelle marge appliquer sur le matériel dans le bâtiment ?',
    a: 'Elle varie selon le métier et la concurrence : souvent 10 à 25 % sur le matériel fourni, davantage sur les petites fournitures. Elle doit couvrir la commande, le transport, le stockage, la garantie et le risque d’impayé.',
  },
];

const TABLE = [5, 10, 15, 20, 25, 30, 40, 50];

export default function MarginPage() {
  const [mode, setMode] = useState<'marge' | 'prix'>('marge');
  const [cost, setCost] = useState('100');
  const [margin, setMargin] = useState('20');
  const [price, setPrice] = useState('130');
  const r = mode === 'marge' ? marginFromCost(num(cost), num(margin)) : marginFromPrice(num(cost), num(price));

  const pdf = () =>
    downloadToolPdf({
      title: 'Calcul de marge',
      url: 'cantia.ch/outils/calcul-marge',
      inputs: [
        { label: 'Coût (prix d’achat ou de revient)', value: `CHF ${chf(r.cost)}` },
        mode === 'marge' ? { label: 'Marge souhaitée', value: pct(num(margin)) } : { label: 'Prix de vente', value: `CHF ${chf(r.price)}` },
      ],
      highlight: { label: 'Prix de vente HT', value: `CHF ${chf(r.price)}` },
      results: [
        { label: 'Bénéfice', value: `CHF ${chf(r.profit)}` },
        { label: 'Marge (sur le prix de vente)', value: pct(r.marginPercent) },
        { label: 'Majoration (sur le coût)', value: pct(r.markupPercent) },
        { label: 'Coefficient multiplicateur', value: String(r.coefficient).replace('.', ',') },
      ],
      notes: TABLE.map((m) => {
        const x = marginFromCost(100, m);
        return `Marge ${m} % = majoration ${pct(x.markupPercent, 1)} = coefficient ${String(x.coefficient).replace('.', ',')}`;
      }),
      cta: 'Marges appliquées automatiquement dans vos devis avec Cantia : cantia.ch · 14 jours d’essai',
      file: 'calcul-marge.pdf',
    });

  return (
    <ToolPage
      slug={SLUG}
      metaTitle="Calcul de marge et prix de vente (marge, majoration, coefficient) | Cantia"
      metaDescription="Calculez votre prix de vente à partir du coût et de la marge souhaitée, et comprenez la différence entre marge, majoration et coefficient. Outil gratuit."
      kicker="Outil gratuit · Prix"
      title="Calcul de marge"
      lede="Le prix de vente juste à partir de votre coût, sans confondre marge et majoration. Avec le coefficient à appliquer dans vos devis."
      form={
        <Group title="Calcul">
          <Chips value={mode} onChange={setMode} options={[{ value: 'marge', label: 'Je connais ma marge' }, { value: 'prix', label: 'Je connais mon prix de vente' }]} />
          <Field label="Coût (prix d’achat ou de revient, HT)">
            <Input value={cost} onChange={setCost} suffix="CHF" />
          </Field>
          {mode === 'marge' ? (
            <Field label="Marge souhaitée sur le prix de vente">
              <Input value={margin} onChange={setMargin} suffix="%" />
            </Field>
          ) : (
            <Field label="Prix de vente HT">
              <Input value={price} onChange={setPrice} suffix="CHF" />
            </Field>
          )}
        </Group>
      }
      result={
        <View style={{ gap: spacing.lg }}>
          <BigResult label={mode === 'marge' ? 'Prix de vente HT' : 'Votre marge'} value={mode === 'marge' ? `CHF ${chf(r.price)}` : pct(r.marginPercent)} sub={`Bénéfice : CHF ${chf(r.profit)} · coefficient ${String(r.coefficient).replace('.', ',')}`} />
          <Lines
            rows={[
              { label: 'Marge (sur le prix de vente)', value: pct(r.marginPercent) },
              { label: 'Majoration (sur le coût)', value: pct(r.markupPercent) },
              { label: 'Coefficient multiplicateur', value: String(r.coefficient).replace('.', ',') },
            ]}
          />
          <Lines
            title="Correspondances"
            rows={TABLE.map((m) => {
              const x = marginFromCost(100, m);
              return { label: `Marge ${m} %`, value: `majoration ${pct(x.markupPercent, 1)} · ×${String(x.coefficient).replace('.', ',')}` };
            })}
          />
          <Note tone="warn">Multiplier un coût par 1,20 ne donne pas 20 % de marge mais 16,7 %. Pour 20 % de marge, il faut multiplier par 1,25.</Note>
          {Platform.OS === 'web' ? (
            <View style={{ gap: spacing.xs }}>
              <LeadGate source={`outil:${SLUG}`} locale="fr" onUnlock={pdf} />
              <Hint>Le calcul et le tableau des correspondances sur une page.</Hint>
            </View>
          ) : null}
        </View>
      }
      cta={{
        title: 'Des devis justes, sans calculette',
        points: [
          'Catalogue de vos articles avec prix d’achat et marge',
          'Prix de vente calculés automatiquement dans chaque devis',
          'Rentabilité réelle de chaque chantier après coup',
          'Devis signés en ligne et transformés en facture en un clic',
        ],
      }}
      faq={FAQ}
    />
  );
}
