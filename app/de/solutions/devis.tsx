import { forceLocale } from '../../../lib/translations';
import { SolutionPage } from '../../../components/SolutionPage';
import { ModuleMockup } from '../../../components/solutions/ModuleMockup';

forceLocale('de');

export default function DevisSolutionPageDe() {
  return (
    <SolutionPage
      kicker="Offerten"
      title="Detaillierte Offerten in wenigen Minuten, nicht erst am Abend"
      subtitle="Diktieren Sie Ihre Offertpositionen laut auf der Baustelle oder im Auto. Cantia wandelt sie in bepreiste Positionen um, übernimmt Ihre gewohnten Preise aus dem Katalog und erstellt ein versandbereites PDF."
      visual={<ModuleMockup kind="devis" />}
      features={[
        {
          icon: 'mic',
          title: 'Integriertes Sprachdiktat',
          text: 'Beschreiben Sie die anstehende Arbeit ganz normal, wie einem Kollegen. Transkription und Positionierung erfolgen automatisch.',
        },
        {
          icon: 'database',
          title: 'Ihr Katalog, Ihre Preise',
          text: 'Jede erkannte Beschreibung übernimmt den Preis und die Einheit, die Sie bereits verwenden — ein PVC-Rohr wird automatisch pro Laufmeter vorgeschlagen, ohne dass Sie es angeben müssen.',
        },
        {
          icon: 'layout',
          title: 'Wiederverwendbare Offertvorlagen',
          text: 'Speichern Sie Ihre Standardpositionen (Plattenverlegung, Isolation usw.) einmal als Vorlage und starten Sie jede neue Offerte mit allen Zeilen bereits vorhanden — es bleibt nur, die Mengen anzupassen.',
        },
        {
          icon: 'alert-triangle',
          title: 'Warnung bei Abweichung',
          text: 'Weicht ein eingegebener Preis vom bereits im Katalog hinterlegten ab, meldet Cantia dies vor dem Versand — nie eine stille Korrektur.',
        },
        {
          icon: 'edit-3',
          title: 'Integrierte Unterschrift',
          text: 'Jede Offerte trägt die Unterschrift ihres Verfassers sowie ein Feld für die des Kunden, bereit zur Annahme und Rücksendung.',
        },
        {
          icon: 'trending-up',
          title: 'Statusverfolgung',
          text: 'Entwurf, versandbereit, versendet, angenommen oder abgelehnt: Behalten Sie den Stand jeder Offerte im Blick, ohne Ihre E-Mails erneut zu öffnen.',
        },
        {
          icon: 'file-text',
          title: 'Offerte → Rechnung mit einem Klick',
          text: 'Eine angenommene Offerte wird direkt zur Rechnung, ohne die Positionen erneut zu erfassen.',
        },
      ]}
      steps={[
        { title: 'Offerte erstellen', text: 'Erfassen Sie den Kunden und diktieren oder tippen Sie dann Ihre Positionen.' },
        { title: 'Die KI strukturiert die Positionen', text: 'Mengen, Einheiten und Katalogpreise werden automatisch vorgeschlagen.' },
        { title: 'Prüfen und versenden', text: 'Passen Sie bei Bedarf an und erstellen Sie das PDF — schlichtes Layout, in Ihrer Markenfarbe.' },
      ]}
      faq={[
        {
          question: 'Wie erstelle ich als Handwerker schnell eine Offerte?',
          answer:
            'Diktieren Sie Ihre Positionen laut auf der Baustelle oder im Auto. Cantia wandelt sie mit Ihren gewohnten Preisen in bepreiste Positionen um, und das PDF ist fertig, noch bevor Sie den Kunden verlassen haben.',
        },
        {
          question: 'Entspricht die Offerte den Schweizer Gepflogenheiten (MWST, Layout)?',
          answer:
            'Ja: Jede Offerte übernimmt Ihren MWST-Satz und Ihre Firmendaten und kann mit Ihrer Markenfarbe und Ihrem Logo personalisiert werden.',
        },
        {
          question: 'Lässt sich eine angenommene Offerte automatisch in eine Rechnung umwandeln?',
          answer: 'Ja, eine angenommene Offerte wird mit einem Klick zur Rechnung — inklusive Schweizer QR-Rechnung — ohne die Positionen erneut zu erfassen.',
        },
        {
          question: 'Ist Cantia für Offerten kostenlos?',
          answer: 'Ja, ein monatliches Offertkontingent steht kostenlos zur Verfügung, ohne Kreditkarte und ohne Verpflichtung.',
        },
      ]}
      related={[
        { href: '/de/solutions/facturation', label: 'Rechnungsstellung & QR-Rechnung' },
        { href: '/de/solutions/dictee-vocale', label: 'Sprachdiktat' },
        { href: '/de/solutions/rentabilite', label: 'Rentabilität pro Baustelle' },
        { href: '/de/solutions/travaux-supplementaires', label: 'Zusatzarbeiten' },
      ]}
      closingTitle="Weniger Zeit für Offerten, nicht weniger Zeit auf der Baustelle"
      closingText="Cantia ist zum Start kostenlos, mit einem monatlichen Offertkontingent — ohne Verpflichtung."
    />
  );
}
