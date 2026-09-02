import { forceLocale } from '../../../lib/translations';
import { SolutionPage } from '../../../components/SolutionPage';
import { ModuleMockup } from '../../../components/solutions/ModuleMockup';

forceLocale('de');

export default function FacturationSolutionPageDe() {
  return (
    <SolutionPage
      kicker="Rechnungsstellung"
      title="Rechnungen mit echtem Schweizer QR-Einzahlungsschein, ohne separate Software"
      subtitle="Jede Cantia-Rechnung enthält automatisch die normkonforme Schweizer QR-Rechnung — IBAN, strukturierte Referenz und Betrag bereits codiert, bereit zum Scannen mit jeder Banking-App."
      visual={<ModuleMockup kind="facturation" />}
      features={[
        {
          icon: 'file-text',
          title: 'QR-Rechnung automatisch erstellt',
          text: 'Geben Sie Ihren IBAN einmal in den Einstellungen ein: Jede Rechnung erhält danach ihren konformen QR-Einzahlungsschein, ohne weiteres Zutun.',
        },
        {
          icon: 'hash',
          title: 'Strukturierte Referenz',
          text: 'Jede Rechnung hat ihre eigene Referenz (QRR oder SCOR je nach IBAN), die von Schweizer Banken bei der Zahlung automatisch erkannt wird.',
        },
        {
          icon: 'search',
          title: 'Abgleich per Referenz',
          text: 'Suchen und gleichen Sie eine erhaltene Zahlung direkt über ihre Referenznummer ab, ohne raten zu müssen, zu welcher Rechnung sie gehört.',
        },
        {
          icon: 'pie-chart',
          title: 'Rechnungs-Dashboard',
          text: 'Status, Fälligkeiten und Übersicht über eingegangene und ausstehende Beträge, über alle Ihre Baustellen hinweg.',
        },
        {
          icon: 'clipboard',
          title: 'Offerte → Rechnung ohne erneute Eingabe',
          text: 'Eine akzeptierte Offerte wird mit einem Klick zur Rechnung, mit denselben Positionen und demselben Kunden.',
        },
        {
          icon: 'percent',
          title: 'Anzahlung in Rechnung stellen',
          text: 'Stellen Sie eine Anzahlungsrechnung über einen Prozentsatz der Offerte, bevor Sie beginnen — die Schlussrechnung zieht automatisch das bereits Erhaltene ab.',
        },
        {
          icon: 'layers',
          title: 'Teilzahlungen automatisch verfolgt',
          text: 'Erfassen Sie jede erhaltene Zahlung: Der verbleibende Saldo aktualisiert sich von selbst, die Rechnung wechselt zu «teilweise bezahlt» und dann zu «bezahlt», sobald der Betrag stimmt.',
        },
        {
          icon: 'shield',
          title: 'In der Schweiz gehostet',
          text: 'Ihre Rechnungen und Kundendaten bleiben verschlüsselt auf Servern in der Schweiz.',
        },
      ]}
      steps={[
        { title: 'Geben Sie Ihren IBAN ein', text: 'Nur einmal, unter Konto → Unternehmensprofil.' },
        { title: 'Wandeln Sie um oder erstellen Sie eine Rechnung', text: 'Aus einer akzeptierten Offerte oder direkt.' },
        { title: 'Versenden Sie das PDF', text: 'Die QR-Rechnung ist bereits integriert — Ihr Kunde scannt und bezahlt über seine Banking-App.' },
      ]}
      faq={[
        {
          question: 'Wie erstellt man eine Rechnung mit Schweizer QR-Rechnung?',
          answer:
            'Geben Sie Ihren IBAN einmal in den Einstellungen ein: Jede Rechnung erstellt danach automatisch den SIX-normkonformen QR-Einzahlungsschein, IBAN und strukturierte Referenz bereits codiert.',
        },
        {
          question: 'Kann man eine Anzahlung vor Bauende in Rechnung stellen?',
          answer:
            'Ja, Cantia erlaubt das Ausstellen einer Anzahlungsrechnung über einen Prozentsatz der Offerte und zieht diesen Betrag automatisch von der Schlussrechnung ab.',
        },
        {
          question: 'Wie erfährt man, ob eine Rechnung bezahlt wurde?',
          answer:
            'Suchen und gleichen Sie eine Zahlung direkt über ihre QR-Referenznummer ab — der Status wechselt zu «bezahlt», ohne das Bankkonto manuell prüfen zu müssen.',
        },
        {
          question: 'Was kostet die Rechnungsstellung mit QR-Code über Cantia?',
          answer: 'Die Rechnungsstellung mit Schweizer QR-Rechnung ist in allen Cantia-Plänen enthalten, ohne Ausnahme, bereits ab dem Plan Essentiel.',
        },
      ]}
      related={[
        { href: '/de/solutions/devis', label: 'Offerten online' },
        { href: '/de/solutions/rentabilite', label: 'Rentabilität pro Baustelle' },
        { href: '/de/solutions/tresorerie', label: 'Liquiditätsplanung' },
      ]}
      closingTitle="Schweizer Rechnungsstellung, ohne zwischen zwei Tools zu wechseln"
      closingText="Unbegrenzte Offerten und Rechnungen in allen Cantia-Plänen. 14 Tage testen, ohne Aktionscode."
    />
  );
}
