import { forceLocale } from '../../../lib/translations';
import { SolutionPage } from '../../../components/SolutionPage';
import { ModuleMockup } from '../../../components/solutions/ModuleMockup';

forceLocale('de');

export default function RentabiliteSolutionPageDe() {
  return (
    <SolutionPage
      kicker="Rentabilität"
      title="Endlich wissen, ob eine Baustelle Ihnen Geld eingebracht hat"
      subtitle="Viele Bauunternehmen offerieren, führen aus und verrechnen eine Baustelle, ohne je zu vergleichen, was offeriert wurde, mit dem, was sie wirklich gekostet hat. Cantia macht das für Sie, Baustelle für Baustelle."
      visual={<ModuleMockup kind="rentabilite" />}
      features={[
        {
          icon: 'trending-up',
          title: 'Offeriert vs. tatsächliche Kosten',
          text: 'Der Betrag der akzeptierten Offerte verglichen mit den tatsächlichen Kosten der Baustelle — Material und Arbeit — mit einer Marge in CHF und %.',
        },
        {
          icon: 'camera',
          title: 'Ein fotografierter Beleg, eine erfasste Ausgabe',
          text: 'Fotografieren Sie einen Kassenbon oder eine Lieferantenrechnung: Lieferant und Betrag werden automatisch gelesen, Sie müssen nur noch prüfen und speichern.',
        },
        {
          icon: 'calendar',
          title: 'Arbeitszeit ohne Doppelerfassung',
          text: 'Die Arbeitskosten werden aus den tatsächlich in Personal & Löhne erfassten Stunden berechnet (oder einer Schätzung aus der Planung, solange noch keine Stunden erfasst wurden) — keine separate Zeiterfassung nötig.',
        },
        {
          icon: 'alert-triangle',
          title: 'Sofortiger visueller Alarm',
          text: 'Ein grünes, oranges oder rotes Badge zeigt auf einen Blick, ob die Baustelle rentabel ist, eine knappe Marge hat oder Verlust macht.',
        },
        {
          icon: 'bar-chart-2',
          title: 'Baustelle für Baustelle',
          text: 'Vergleichen Sie die Marge mehrerer Baustellen, um schnell diejenigen zu erkennen, die Ihre Rentabilität nach unten ziehen.',
        },
      ]}
      faq={[
        {
          question: 'Wie erfährt man, ob eine Baustelle rentabel ist?',
          answer:
            'Cantia vergleicht die akzeptierte Offerte (Einnahme) mit den tatsächlichen Kosten — erfasstes Material und Arbeit aus den erfassten Stunden — und zeigt die Marge in CHF und % in Echtzeit.',
        },
        {
          question: 'Woher stammt die Berechnung der Arbeitskosten?',
          answer:
            'Aus den für diese Baustelle tatsächlich in Personal & Löhne erfassten Stunden, multipliziert mit dem Stundensatz Ihres Unternehmens. Solange noch keine Stunden erfasst wurden, zeigt Cantia eine Schätzung basierend auf der Teamplanung.',
        },
        {
          question: 'Kann man mehrere Baustellen miteinander vergleichen?',
          answer: 'Ja, jede Baustelle zeigt ihre eigene Marge, was es ermöglicht, verlustbringende Baustellen schnell zu erkennen.',
        },
        {
          question: 'Ist die Rentabilität pro Baustelle in allen Cantia-Plänen enthalten?',
          answer: 'Sie ist ab dem Plan Team verfügbar, aktivierbar in den Einstellungen Ihrer Organisation.',
        },
      ]}
      related={[
        { href: '/de/solutions/devis', label: 'Offerten online' },
        { href: '/de/solutions/facturation', label: 'Rechnungsstellung & QR-Rechnung' },
        { href: '/de/solutions/planning', label: 'Teamplanung' },
        { href: '/de/solutions/travaux-supplementaires', label: 'Zusatzarbeiten' },
      ]}
      closingTitle="Entdecken Sie Ihre Margen nicht mehr erst am Jahresende"
      closingText="Das Modul Rentabilität lässt sich nach Bedarf aktivieren oder deaktivieren, in den Einstellungen Ihrer Organisation."
    />
  );
}
