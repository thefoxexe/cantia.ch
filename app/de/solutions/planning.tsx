import { forceLocale } from '../../../lib/translations';
import { SolutionPage } from '../../../components/SolutionPage';
import { ModuleMockup } from '../../../components/solutions/ModuleMockup';

forceLocale('de');

export default function PlanningSolutionPageDe() {
  return (
    <SolutionPage
      kicker="Planung"
      title="Wer ist wo, diese Woche, auf einen Blick"
      subtitle="Ein echter Team-Kalender: jedes Mitglied, jede Baustelle, jeder Tag. Schluss mit Plänen auf Papier oder in einer WhatsApp-Gruppe, durch die man scrollen muss, um die richtige Information zu finden."
      visual={<ModuleMockup kind="planning" />}
      features={[
        {
          icon: 'calendar',
          title: 'Rasteransicht Mitglieder × Tage',
          text: 'Das ganze Team und die ganze Woche auf einem Bildschirm, mit den Zuteilungen jedes Einzelnen auf einen Blick sichtbar.',
        },
        {
          icon: 'layers',
          title: 'Verknüpft mit Ihren Baustellen',
          text: 'Jede Zuteilung verweist auf eine reale Baustelle — von der Planung aus finden Sie direkt zugehörige Rapporte, Fotos und Offerten.',
        },
        {
          icon: 'users',
          title: 'Präsenz in Echtzeit',
          text: 'Das Dashboard zeigt, wer gerade aktiv in der Anwendung ist, zusätzlich zu den geplanten Einsätzen.',
        },
        {
          icon: 'smartphone',
          title: 'Für das ganze Team zugänglich',
          text: 'Jedes Mitglied ruft seine Planung vom Telefon ab, ohne auf eine Tafel im Büro angewiesen zu sein.',
        },
        {
          icon: 'trending-up',
          title: 'Fliesst in die Rentabilität ein',
          text: 'Die geplanten Tage dienen auch zur Berechnung der tatsächlichen Arbeitskosten jeder Baustelle — keine Doppelerfassung.',
        },
      ]}
      faq={[
        {
          question: 'Wie organisiert man die Planung eines Baustellenteams?',
          answer: 'Cantia zeigt einen geteilten Wochenkalender: Jedes Mitglied sieht, wer an welcher Baustelle ist, an jedem Tag.',
        },
        {
          question: 'Ersetzt die Planung eine Excel-Tabelle oder eine WhatsApp-Gruppe?',
          answer: 'Ja, das ganze Team sieht dieselben Informationen in Echtzeit, ohne Datei oder Nachricht durchscrollen zu müssen.',
        },
        {
          question: 'Kann man mehrere Baustellen parallel planen?',
          answer: 'Ja, jede Zuteilung ist mit einer bestimmten Baustelle verknüpft und bleibt über die ganze Woche pro Mitglied sichtbar.',
        },
        {
          question: 'Ist die Planung in allen Cantia-Plänen enthalten?',
          answer: 'Sie ist ab dem Plan Team verfügbar, aktivierbar in den Einstellungen Ihrer Organisation.',
        },
      ]}
      related={[
        { href: '/de/solutions/rapports-chantier', label: 'Baustellenrapporte' },
        { href: '/de/solutions/rentabilite', label: 'Rentabilität pro Baustelle' },
      ]}
      closingTitle="Eine Planung, die das ganze Team einsieht, nicht nur der Chef"
      closingText="Das Modul Planung lässt sich nach Bedarf aktivieren oder deaktivieren, in den Einstellungen Ihrer Organisation."
    />
  );
}
