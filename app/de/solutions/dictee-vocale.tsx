import { forceLocale } from '../../../lib/translations';
import { SolutionPage } from '../../../components/SolutionPage';
import { ModuleMockup } from '../../../components/solutions/ModuleMockup';

forceLocale('de');

export default function DicteeVocaleSolutionPageDe() {
  return (
    <SolutionPage
      kicker="Sprachdiktat"
      title="Sprechen Sie, Cantia schreibt"
      subtitle="Offerten, Rapporte, Team-Nachrichten: Überall in der Anwendung ersetzt eine Diktier-Taste die Tastatureingabe. Praktisch mit Handschuhen, im Auto zwischen zwei Baustellen, oder einfach schneller als Tippen."
      visual={<ModuleMockup kind="dictee-vocale" />}
      features={[
        {
          icon: 'mic',
          title: 'Überall in der Anwendung',
          text: 'Rapportnotizen, Offertpositionen, Nachrichten im Baustellen-Feed: Die Diktier-Taste ist überall verfügbar, wo Sie schreiben.',
        },
        {
          icon: 'cpu',
          title: 'Transkription serverseitig',
          text: 'Die Spracherkennung läuft auf sicheren Servern, nicht auf Ihrem Telefon — ein zuverlässiges Ergebnis auch im Baustellenlärm.',
        },
        {
          icon: 'zap',
          title: 'Offertpositionen automatisch erstellt',
          text: 'Diktieren Sie eine Liste von Arbeiten, und die KI erstellt daraus bepreiste Offertpositionen aus Ihrem Katalog.',
        },
        {
          icon: 'file-text',
          title: 'Wird zu einem verfassten Rapport',
          text: 'Ihre Sprachnotizen werden direkt übernommen und vom KI-Textassistenten für Baustellenrapporte formatiert.',
        },
        {
          icon: 'users',
          title: 'Auch für das ganze Team',
          text: 'Jedes Mitglied kann seine Nachrichten im Baustellen-Feed diktieren — praktisch, um Unvorhergesehenes zu melden, ohne die Arbeit zu unterbrechen.',
        },
        {
          icon: 'tool',
          title: 'Fachvokabular des Baugewerbes erkannt',
          text: 'Einheiten, Materialien und Fachausdrücke werden zuverlässig erkannt, nicht nur allgemeines Vokabular.',
        },
      ]}
      faq={[
        {
          question: 'Funktioniert das Sprachdiktat gut mit dem Fachvokabular des Baugewerbes?',
          answer:
            'Ja, die Erkennung ist auf das technische Vokabular des Baugewerbes abgestimmt — Materialien, Einheiten, Berufe — nicht nur auf Umgangssprache.',
        },
        {
          question: 'Braucht man eine Internetverbindung zum Diktieren?',
          answer:
            'Ja, das Diktat benötigt eine Verbindung für die Transkription, aber die erstellten Offerten und Rapporte bleiben nach der Erstellung einsehbar.',
        },
        {
          question: 'Wo kann man das Sprachdiktat in Cantia nutzen?',
          answer: 'Bei Offerten, Baustellenrapporten und Team-Nachrichten im Feed — überall, wo Sie schreiben.',
        },
        {
          question: 'Ist das Sprachdiktat auf der Baustelle schneller als die Tastatur?',
          answer:
            'Für die meisten Handwerker auf der Baustelle ja — Sprechen geht schneller als Tippen auf einem Telefon mit schmutzigen Händen oder Handschuhen.',
        },
      ]}
      related={[
        { href: '/de/solutions/devis', label: 'Offerten online' },
        { href: '/de/solutions/rapports-chantier', label: 'Baustellenrapporte' },
      ]}
      closingTitle="Weniger Zeit beim Tippen, mehr Zeit auf der Baustelle"
      closingText="Das Sprachdiktat ist in allen Cantia-Plänen enthalten, ohne Ausnahme."
    />
  );
}
