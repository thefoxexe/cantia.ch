import { forceLocale } from '../../../lib/translations';
import { SolutionPage } from '../../../components/SolutionPage';
import { ModuleMockup } from '../../../components/solutions/ModuleMockup';

forceLocale('de');

export default function RhSalairesSolutionPageDe() {
  return (
    <SolutionPage
      kicker="HR & Löhne"
      title="Stunden, Spesen und Löhne des ganzen Teams an einem Ort"
      subtitle="Jeder Mitarbeiter erfasst seine Stunden Baustelle für Baustelle sowie seine beruflichen Spesen. Die Sekretärin oder der Administrator verwaltet die Lohnabrechnung jedes Einzelnen — Satz, Abzüge und Nettolohn — ohne separate Tabelle."
      visual={<ModuleMockup kind="rh-salaires" />}
      features={[
        {
          icon: 'clock',
          title: 'Zeiterfassung pro Baustelle',
          text: 'Jedes Mitglied erfasst seine geleisteten Stunden, Baustelle für Baustelle und Tag für Tag, mit wenigen Tipps.',
        },
        {
          icon: 'truck',
          title: 'Berufliche Spesen',
          text: 'Kilometer oder andere Spesen, mit einer für das ganze Unternehmen einmalig festgelegten Kilometerentschädigung.',
        },
        {
          icon: 'download',
          title: 'Export täglich, wöchentlich oder monatlich',
          text: 'Jeder Mitarbeiter exportiert sein eigenes Stundenblatt im CSV-Format, in der von ihm gewählten Granularität.',
        },
        {
          icon: 'user',
          title: 'Lohnabrechnung pro Mitarbeiter',
          text: 'Die HR-Sekretärin oder der Administrator öffnet das Profil jedes Mitglieds: Stundensatz oder Fixlohn, Historie der Stunden und Spesen.',
        },
        {
          icon: 'percent',
          title: 'Brutto → netto mit Abzügen',
          text: 'AHV/ALV, BVG, UVG und Quellensteuer: Jeder Satz ist pro Mitarbeiter editierbar, und der Nettolohn wird automatisch berechnet.',
        },
        {
          icon: 'lock',
          title: 'Vertraulichkeit nach Berechtigung',
          text: 'Ein Mitarbeiter sieht nur seine eigenen Stunden und Spesen — die Lohnabrechnungen bleiben der HR-Sekretärin und den Administratoren vorbehalten.',
        },
      ]}
      faq={[
        {
          question: 'Wer kann die Löhne in Cantia sehen?',
          answer:
            'Nur die HR-Sekretärin und die Administratoren des Unternehmens, gemäss den unter Team vergebenen Berechtigungen. Ein normaler Mitarbeiter sieht nur seine eigenen Stunden und Spesen.',
        },
        {
          question: 'Berechnet Cantia automatisch die Schweizer Sozialabgaben?',
          answer:
            'Cantia berechnet den Nettolohn anhand von AHV/ALV/BVG/UVG-Sätzen und einem Quellensteuersatz, den Sie pro Mitarbeiter konfigurieren — die Standardsätze sind indikativ und je nach Ausgleichskasse, Pensionskasse und Kanton anzupassen.',
        },
        {
          question: 'Wie exportiert ein Mitarbeiter sein Stundenblatt?',
          answer:
            'Über das Modul HR & Löhne, durch Wahl der Granularität — täglich, wöchentlich oder monatlich — und anschliessendem Download einer CSV-Datei.',
        },
        {
          question: 'Ist das Modul HR & Löhne in allen Cantia-Plänen enthalten?',
          answer: 'Es ist ab dem Plan Team verfügbar, aktivierbar in den Einstellungen Ihrer Organisation.',
        },
      ]}
      related={[
        { href: '/de/solutions/planning', label: 'Teamplanung' },
        { href: '/de/solutions/rentabilite', label: 'Rentabilität pro Baustelle' },
        { href: '/de/solutions/facturation', label: 'Rechnungsstellung & QR-Rechnung' },
        { href: '/de/solutions/tresorerie', label: 'Liquiditätsplanung' },
      ]}
      closingTitle="Schluss mit verstreuten Stundenzetteln"
      closingText="Das Modul HR & Löhne wird ab dem Plan Team in den Einstellungen Ihrer Organisation aktiviert."
    />
  );
}
