import { useState } from 'react';
import { Platform, View } from 'react-native';
import { BigResult, Chips, Field, Group, Hint, Input, Lines, Note, ToolPage } from '../../components/tools/ToolPage';
import { LeadGate } from '../../components/tools/LeadGate';
import { hourlyRate } from '../../lib/tools/calcs';
import { chf, downloadToolPdf, num, pct } from '../../lib/tools/toolPdf';
import { spacing } from '../../lib/theme';

// Free tool: the hourly rate a construction company must charge to cover
// salaries, employer charges, overheads and a margin.

const SLUG = 'calcul-taux-horaire';

export const FAQ = [
  {
    q: 'Comment calculer le taux horaire d’un artisan en Suisse ?',
    a: 'Additionnez sur une année les salaires bruts (13e salaire compris), les charges patronales (environ 14 à 18 % : AVS, AC, LPP, LAA, allocations familiales) et les frais généraux (loyer, véhicules, assurances, outillage, administration). Divisez par les heures réellement facturables, puis ajoutez votre marge : vous obtenez le taux horaire de vente hors TVA.',
  },
  {
    q: 'Combien d’heures facturables compter par employé ?',
    a: 'Un plein temps à 42 heures représente environ 2’100 heures par an. Après vacances, jours fériés, maladie, formation, déplacements et temps non facturable (préparation, rangement, garanties), il reste en général 1’500 à 1’700 heures réellement facturées.',
  },
  {
    q: 'Quelle marge appliquer sur le taux horaire ?',
    a: 'Dans le bâtiment, une marge bénéficiaire de 5 à 15 % du prix de vente est courante. Elle doit couvrir les risques (dépassements, mauvais payeurs) et permettre d’investir. Le calculateur montre aussi le bénéfice annuel que représente votre marge.',
  },
  {
    q: 'Le taux horaire inclut-il la TVA ?',
    a: 'Non, le taux calculé est hors TVA. Si vous êtes assujetti, ajoutez 8,1 % sur la facture ; le calculateur affiche aussi le taux TTC.',
  },
];

export default function HourlyRatePage() {
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
      title: 'Taux horaire de l’entreprise',
      url: 'cantia.ch/outils/calcul-taux-horaire',
      inputs: [
        { label: 'Salaire mensuel brut moyen', value: `CHF ${chf(num(salary))} × ${salaries}` },
        { label: 'Employés productifs', value: String(Math.max(1, num(employees))) },
        { label: 'Charges patronales', value: pct(num(charges)) },
        { label: 'Heures facturables par employé et par an', value: chf(num(hours), 0) },
        { label: 'Frais généraux annuels', value: `CHF ${chf(num(overhead))}` },
        { label: 'Marge bénéficiaire', value: pct(num(margin)) },
      ],
      highlight: { label: 'Taux horaire de vente (HT)', value: `CHF ${chf(r.rate)}` },
      results: [
        { label: 'Masse salariale annuelle', value: `CHF ${chf(r.payroll)}` },
        { label: 'Charges patronales', value: `CHF ${chf(r.charges)}` },
        { label: 'Coût total annuel', value: `CHF ${chf(r.cost)}` },
        { label: 'Heures facturables', value: chf(r.hours, 0) },
        { label: 'Prix de revient par heure', value: `CHF ${chf(r.costPerHour)}`, strong: true },
        { label: 'Taux horaire TTC (8,1 %)', value: `CHF ${chf(r.rateTtc)}` },
        { label: 'Bénéfice annuel visé', value: `CHF ${chf(r.yearlyProfit)}` },
      ],
      cta: 'Devis, heures et rentabilité par chantier automatiques avec Cantia : cantia.ch · 14 jours d’essai',
      file: 'taux-horaire.pdf',
    });

  return (
    <ToolPage
      slug={SLUG}
      metaTitle="Calcul du taux horaire artisan en Suisse (gratuit) | Cantia"
      metaDescription="Calculez le prix de revient d’une heure et le taux horaire à facturer : salaires, 13e, charges sociales, frais généraux et marge. Outil gratuit pour les entreprises du bâtiment."
      kicker="Outil gratuit · Bâtiment"
      title="Calcul du taux horaire"
      lede="Le prix de revient d’une heure de travail et le taux à facturer pour couvrir les salaires, les charges, les frais généraux et votre marge. Pour ne plus vendre une heure à perte."
      form={
        <View style={{ gap: spacing.lg }}>
          <Group title="Équipe">
            <Field label="Salaire mensuel brut moyen par employé">
              <Input value={salary} onChange={setSalary} suffix="CHF" />
            </Field>
            <Chips value={salaries} onChange={setSalaries} options={[{ value: 12, label: '12 salaires' }, { value: 13, label: '13 salaires' }]} />
            <Field label="Employés productifs (sur les chantiers)">
              <Input value={employees} onChange={setEmployees} />
            </Field>
            <Field label="Charges patronales" hint="AVS/AI/APG, AC, LPP, LAA, allocations familiales : 14 à 18 % en général.">
              <Input value={charges} onChange={setCharges} suffix="%" />
            </Field>
            <Field label="Heures facturables par employé et par an" hint="Après vacances, fériés, maladie, déplacements et temps non facturable : 1’500 à 1’700 h.">
              <Input value={hours} onChange={setHours} suffix="h" />
            </Field>
          </Group>
          <Group title="Entreprise">
            <Field label="Frais généraux annuels" hint="Loyer, véhicules, assurances, outillage, téléphone, comptabilité, salaires du bureau…">
              <Input value={overhead} onChange={setOverhead} suffix="CHF / an" />
            </Field>
            <Field label="Marge bénéficiaire sur le prix de vente">
              <Input value={margin} onChange={setMargin} suffix="%" />
            </Field>
          </Group>
        </View>
      }
      result={
        <View style={{ gap: spacing.lg }}>
          <BigResult label="Taux horaire à facturer (HT)" value={`CHF ${chf(r.rate)}`} sub={`Prix de revient : CHF ${chf(r.costPerHour)} / h · TTC : CHF ${chf(r.rateTtc)}`} />
          <Lines
            title="Ce que coûte une heure"
            rows={[
              { label: 'Salaire et charges', value: `CHF ${chf(r.salaryPerHour)}`, meta: `CHF ${chf(r.payroll + r.charges, 0)} / an` },
              { label: 'Frais généraux', value: `CHF ${chf(r.overheadPerHour)}`, meta: `CHF ${chf(num(overhead), 0)} / an` },
              { label: 'Prix de revient', value: `CHF ${chf(r.costPerHour)}`, strong: true },
              { label: `Marge (${pct(num(margin), 1)})`, value: `CHF ${chf(r.rate - r.costPerHour)}` },
              { label: 'Taux de vente HT', value: `CHF ${chf(r.rate)}`, strong: true },
            ]}
          />
          <Note tone="ok">
            Avec {chf(r.hours, 0)} heures facturées par an, ce taux couvre CHF {chf(r.cost, 0)} de coûts et dégage environ CHF {chf(r.yearlyProfit, 0)} de bénéfice.
          </Note>
          {Platform.OS === 'web' ? (
            <View style={{ gap: spacing.xs }}>
              <LeadGate source={`outil:${SLUG}`} locale="fr" onUnlock={pdf} />
              <Hint>Le détail du calcul sur une page, à garder pour vos devis.</Hint>
            </View>
          ) : null}
        </View>
      }
      cta={{
        title: 'Cantia calcule la rentabilité de chaque chantier',
        points: [
          'Vos taux horaires repris automatiquement dans chaque devis',
          'Les heures saisies sur le chantier comparées au devis, en direct',
          'Rentabilité réelle par chantier : heures, matériel, sous-traitants',
          'Factures QR, rappels et salaires suisses dans le même outil',
        ],
      }}
      faq={FAQ}
    />
  );
}
