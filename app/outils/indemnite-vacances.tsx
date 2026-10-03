import { useState } from 'react';
import { Platform, View } from 'react-native';
import { BigResult, Chips, Field, Group, Hint, Input, Lines, Note, ToolPage } from '../../components/tools/ToolPage';
import { LeadGate } from '../../components/tools/LeadGate';
import { vacationPay, vacationPercent } from '../../lib/tools/calcs';
import { chf, downloadToolPdf, num, pct } from '../../lib/tools/toolPdf';
import { spacing } from '../../lib/theme';

// Free tool: holiday supplement for hourly paid staff.

const SLUG = 'indemnite-vacances';

export const FAQ = [
  {
    q: 'Comment calculer l’indemnité de vacances d’un employé payé à l’heure ?',
    a: 'On ajoute au salaire horaire un pourcentage qui correspond aux semaines de vacances : semaines ÷ (52 − semaines). Pour 4 semaines : 8,33 % ; 5 semaines : 10,64 % ; 6 semaines : 13,04 %.',
  },
  {
    q: 'Combien de semaines de vacances au minimum en Suisse ?',
    a: 'Le Code des obligations prévoit au moins 4 semaines par an, et 5 semaines jusqu’à 20 ans révolus (art. 329a CO). Beaucoup de conventions collectives du bâtiment en prévoient davantage, par exemple 5 semaines dès 50 ans ou plus selon la CCT.',
  },
  {
    q: 'L’indemnité de vacances doit-elle apparaître sur la fiche de salaire ?',
    a: 'Oui. Le Tribunal fédéral admet le paiement des vacances avec le salaire uniquement pour un travail irrégulier, et à condition que le montant ou le pourcentage figure clairement sur chaque décompte de salaire.',
  },
  {
    q: 'Les jours fériés sont-ils compris ?',
    a: 'Non. Le pourcentage ne couvre que les vacances. Selon la CCT applicable, les jours fériés payés font l’objet d’une indemnité séparée (souvent environ 3 %).',
  },
];

export default function VacationPage() {
  const [hourly, setHourly] = useState('32');
  const [weeks, setWeeks] = useState<number>(5);
  const [hours, setHours] = useState('170');
  const r = vacationPay(num(hourly), weeks, num(hours));

  const pdf = () =>
    downloadToolPdf({
      title: 'Indemnité de vacances',
      url: 'cantia.ch/outils/indemnite-vacances',
      inputs: [
        { label: 'Salaire horaire de base', value: `CHF ${chf(num(hourly))}` },
        { label: 'Semaines de vacances par an', value: String(weeks) },
        { label: 'Heures par mois (exemple)', value: chf(num(hours), 0) },
      ],
      highlight: { label: 'Indemnité de vacances', value: pct(r.percent) },
      results: [
        { label: 'Supplément par heure', value: `CHF ${chf(r.supplement)}` },
        { label: 'Salaire horaire vacances comprises', value: `CHF ${chf(r.hourlyWithHoliday)}`, strong: true },
        { label: 'Indemnité sur un mois', value: `CHF ${chf(r.monthly)}` },
      ],
      notes: [4, 5, 6, 7].map((w) => `${w} semaines : ${pct(vacationPercent(w))}`),
      cta: 'Fiches de salaire suisses avec indemnités calculées automatiquement : cantia.ch · 14 jours d’essai',
      file: 'indemnite-vacances.pdf',
    });

  return (
    <ToolPage
      slug={SLUG}
      metaTitle="Indemnité de vacances salaire horaire : 8,33 %, 10,64 %, 13,04 % | Cantia"
      metaDescription="Calculez l’indemnité de vacances d’un employé payé à l’heure en Suisse selon le nombre de semaines de vacances, avec le salaire horaire vacances comprises."
      kicker="Outil gratuit · Salaires"
      title="Indemnité de vacances"
      lede="Pour les employés payés à l’heure : le supplément vacances à ajouter au salaire, selon le nombre de semaines, et le montant sur un mois."
      form={
        <Group title="Employé">
          <Field label="Salaire horaire de base (brut)">
            <Input value={hourly} onChange={setHourly} suffix="CHF / h" />
          </Field>
          <Field label="Semaines de vacances par an">
            <Chips
              value={weeks}
              onChange={setWeeks}
              options={[4, 5, 6, 7].map((w) => ({ value: w, label: `${w} semaines` }))}
            />
          </Field>
          <Field label="Heures travaillées sur un mois (exemple)">
            <Input value={hours} onChange={setHours} suffix="h" />
          </Field>
        </Group>
      }
      result={
        <View style={{ gap: spacing.lg }}>
          <BigResult label="Indemnité de vacances" value={pct(r.percent)} sub={`+ CHF ${chf(r.supplement)} par heure`} />
          <Lines
            rows={[
              { label: 'Salaire horaire de base', value: `CHF ${chf(num(hourly))}` },
              { label: `Indemnité ${pct(r.percent)}`, value: `CHF ${chf(r.supplement)}` },
              { label: 'Salaire horaire vacances comprises', value: `CHF ${chf(r.hourlyWithHoliday)}`, strong: true },
              { label: `Indemnité sur ${chf(num(hours), 0)} h`, value: `CHF ${chf(r.monthly)}` },
            ]}
          />
          <Note>L’indemnité doit figurer séparément sur chaque fiche de salaire (montant ou pourcentage). Les jours fériés se calculent à part selon votre CCT.</Note>
          {Platform.OS === 'web' ? (
            <View style={{ gap: spacing.xs }}>
              <LeadGate source={`outil:${SLUG}`} locale="fr" onUnlock={pdf} />
              <Hint>Le calcul et le tableau des pourcentages sur une page.</Hint>
            </View>
          ) : null}
        </View>
      }
      cta={{
        title: 'Les fiches de salaire, sans prise de tête',
        points: [
          'Heures saisies sur le chantier, salaire calculé à la fin du mois',
          'Indemnités vacances et jours fériés ajoutées automatiquement',
          'AVS, LPP selon l’âge, LAA, allocations et impôt à la source',
          'Fiches PDF envoyées à chaque employé',
        ],
      }}
      faq={FAQ}
    />
  );
}
