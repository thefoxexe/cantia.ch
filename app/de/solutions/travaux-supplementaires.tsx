import { forceLocale } from '../../../lib/translations';
import { SolutionPage } from '../../../components/SolutionPage';
import { ModuleMockup } from '../../../components/solutions/ModuleMockup';

forceLocale('de');

export default function TravauxSupplementairesSolutionPageDe() {
  return (
    <SolutionPage
      kicker="Zusatzarbeiten"
      title="Die Extras der Baustelle, endlich nachvollziehbar — und bezahlt"
      subtitle="«Wo Sie schon dabei sind…» Was mündlich auf der Baustelle entschieden wird, wird am Ende oft vergessen oder bestritten. Cantia macht aus jedem Extra ein datiertes, unterschriebenes und verrechnetes Dokument — ohne den Umweg über eine ganze Offerte."
      visual={<ModuleMockup kind="travaux-supplementaires" />}
      features={[
        {
          icon: 'plus-circle',
          title: 'Ein eigenes Dokument, keine verlorene Notiz',
          text: 'Jedes Extra wird zu nummerierten Zusatzarbeiten (ZA-2026-004), mit der Baustelle verknüpft — Schluss mit dem Post-it oder der SMS, die im Tagesgeschäft untergeht.',
        },
        {
          icon: 'link',
          title: 'An bestehende Offerte gekoppelt, oder nicht',
          text: 'Erstellen Sie Zusatzarbeiten aus einer laufenden Offerte, um den Faden zu behalten, oder eigenständig, wenn die Baustelle keine Ausgangsofferte in Cantia hat.',
        },
        {
          icon: 'edit-3',
          title: 'Kundenunterschrift aus der Ferne',
          text: 'Der Kunde erhält einen Link, sieht die bepreisten Details ein und unterschreibt online — die Zustimmung ist zeitgestempelt, Schluss mit «das habe ich nie genehmigt».',
        },
        {
          icon: 'file-text',
          title: 'Automatisch in Rechnung umgewandelt',
          text: 'Sobald der Kunde akzeptiert, wird eine eigene Rechnung mit denselben Positionen erstellt — nichts erneut erfassen, nichts zu verrechnen vergessen.',
        },
        {
          icon: 'database',
          title: 'Derselbe Katalog wie Ihre Offerten',
          text: 'Die Positionen der Zusatzarbeiten fliessen in den mit Ihren Offerten geteilten Preiskatalog ein — Ihre Preise bleiben konsistent, auch bei einem spontan entschiedenen Extra.',
        },
        {
          icon: 'trending-up',
          title: 'In die Rentabilität pro Baustelle integriert',
          text: 'Akzeptierte Zusatzarbeiten werden automatisch zum offerierten Betrag der Baustelle im Modul Rentabilität hinzugefügt — die tatsächliche Marge vernachlässigt die Extras nicht mehr.',
        },
        {
          icon: 'alert-triangle',
          title: 'Das unsichtbare Geldleck, endlich sichtbar',
          text: 'Bei einer Renovationsbaustelle summieren sich nicht verrechnete Extras am Ende oft auf mehrere tausend Franken — Cantia macht es unmöglich, sie zu vergessen.',
        },
      ]}
      steps={[
        { title: 'Erfassen Sie das Extra von der Baustelle aus', text: 'Erstellen Sie Zusatzarbeiten in wenigen Zeilen — wie eine Offerte, nur schneller.' },
        { title: 'Senden Sie es an den Kunden', text: 'Sicherer Link per E-Mail oder direkt kopiert — der Kunde sieht ein und unterschreibt online.' },
        { title: 'Die Rechnung geht von selbst raus', text: 'Nach der Annahme wird eine eigene Rechnung erstellt und der Betrag fliesst in die Rentabilität der Baustelle ein.' },
      ]}
      faq={[
        {
          question: 'Was sind Zusatzarbeiten in Cantia?',
          answer:
            'Ein eigenes Dokument für alles, was während der Bauzeit zusätzlich zur Ausgangsofferte gewünscht wird — eine zu versetzende Wand, eine zusätzliche Steckdose. Es wird wie eine Offerte erstellt, versendet und unterschrieben, und verwandelt sich nach Annahme automatisch in eine Rechnung.',
        },
        {
          question: 'Müssen Zusatzarbeiten an eine bestehende Offerte gekoppelt sein?',
          answer:
            'Nein, das ist optional. Sie können sie mit der Ausgangsofferte verknüpfen, um den Kontext zu behalten, oder eigenständig erstellen, wenn die Baustelle keine Ausgangsofferte in Cantia hat.',
        },
        {
          question: 'Wie bestätigt der Kunde Zusatzarbeiten?',
          answer:
            'Er erhält einen Link zu einem sicheren Portal, sieht die bepreisten Details ein und unterschreibt online — die Annahme ist zeitgestempelt und löst automatisch die entsprechende Rechnung aus.',
        },
        {
          question: 'Zählen Zusatzarbeiten zur Rentabilität pro Baustelle?',
          answer: 'Ja: Sobald Zusatzarbeiten akzeptiert werden, fliesst ihr Betrag automatisch in den offerierten Gesamtbetrag der Baustelle im Modul Rentabilität ein.',
        },
      ]}
      related={[
        { href: '/de/solutions/devis', label: 'Offerten' },
        { href: '/de/solutions/facturation', label: 'Rechnungsstellung & QR-Rechnung' },
        { href: '/de/solutions/rentabilite', label: 'Rentabilität pro Baustelle' },
      ]}
      closingTitle="Lassen Sie kein Extra mehr durch die Maschen schlüpfen"
      closingText="Zusatzarbeiten sind in allen Cantia-Plänen enthalten, mit derselben unbegrenzten Verfolgung wie Ihre Offerten und Rechnungen."
    />
  );
}
