import { forceLocale } from '../../../lib/translations';
import { SolutionPage } from '../../../components/SolutionPage';
import { ModuleMockup } from '../../../components/solutions/ModuleMockup';

forceLocale('de');

export default function TresorerieSolutionPageDe() {
  return (
    <SolutionPage
      kicker="Liquidität"
      title="Können Sie in drei Wochen die Löhne bezahlen?"
      subtitle="Noch nicht eingegangene Rechnungen, fällige Löhne, zu bezahlende Subunternehmer, automatisch abgebuchte Abonnements — Cantia bündelt alles, was sich auf Ihrem Konto bewegt, in einer einzigen 90-Tage-Prognose."
      visual={<ModuleMockup kind="tresorerie" />}
      features={[
        {
          icon: 'trending-up',
          title: 'Eine Prognose über 90 Tage',
          text: 'Geben Sie Ihren aktuellen Kontostand einmal ein, Cantia projiziert dessen Entwicklung Tag für Tag anhand von allem, was bereits in der Anwendung erfasst ist.',
        },
        {
          icon: 'file-text',
          title: 'Noch nicht eingegangene Kundenrechnungen',
          text: 'Jede versendete oder teilweise bezahlte Rechnung erscheint zu ihrer Fälligkeit, mit klarer Kennzeichnung, falls sie bereits überfällig ist.',
        },
        {
          icon: 'users',
          title: 'Geschätzte Lohnsumme',
          text: 'Berechnet aus Ihren HR-Profilen — Monatslöhne und diesen Monat bereits erfasste Stunden — und zum von Ihnen konfigurierten Zahltag platziert.',
        },
        {
          icon: 'briefcase',
          title: 'Unbezahlte Subunternehmer-Rechnungen',
          text: 'Was Sie Ihren Subunternehmern noch schulden, erscheint in derselben Timeline, zu deren Fälligkeit.',
        },
        {
          icon: 'repeat',
          title: 'Abonnements und wiederkehrende Kosten',
          text: 'Versicherungen, Software, Mieten … einmal erfassen, monatlich oder jährlich — Cantia projiziert sie automatisch, Monat für Monat.',
        },
        {
          icon: 'bell',
          title: 'Erinnerung vor jeder Abbuchung',
          text: 'Ein Banner zeigt Ihnen die wiederkehrenden Ausgaben der nächsten 7 Tage an — keine bösen Überraschungen mehr auf dem Kontoauszug.',
        },
        {
          icon: 'shield',
          title: 'Keine Bankverbindung erforderlich',
          text: 'Sie erfassen Ihren Kontostand manuell, wann immer Sie möchten — kein Zugriff auf Ihr Bankkonto notwendig.',
        },
      ]}
      steps={[
        { title: 'Erfassen Sie Ihren Kontostand', text: 'Eine Zahl, aktualisiert, wann Sie möchten — ohne Bankverbindung.' },
        { title: 'Fügen Sie Ihre wiederkehrenden Kosten hinzu', text: 'Abonnements, Versicherungen, Mieten — einmalig, mit Häufigkeit und nächster Fälligkeit.' },
        { title: 'Sehen Sie die Prognose ein', text: 'Rechnungen, Löhne, Subunternehmer und wiederkehrende Kosten fügen sich automatisch zu einer 90-Tage-Timeline zusammen.' },
      ]}
      faq={[
        {
          question: 'Verbindet sich Cantia mit meinem Bankkonto?',
          answer: 'Nein. Sie erfassen Ihren Kontostand manuell, wann Sie möchten — kein Bankzugriff wird verlangt oder benötigt.',
        },
        {
          question: 'Woher stammen die Beträge der Prognose?',
          answer:
            'Aus noch offenen Kundenrechnungen, einer Schätzung der Lohnsumme (HR-Profile + erfasste Stunden), unbezahlten Subunternehmer-Rechnungen und den von Ihnen erfassten wiederkehrenden Ausgaben — allem, was Cantia bereits über Ihre Tätigkeit weiss.',
        },
        {
          question: 'Wie funktionieren die Erinnerungen an wiederkehrende Ausgaben?',
          answer:
            'Ein Banner auf der Startseite und der Seite Liquidität zeigt Ihnen die aktiven wiederkehrenden Ausgaben an, die in den nächsten 7 Tagen fällig sind, bevor sie abgebucht werden.',
        },
        {
          question: 'Ist die Liquiditätsplanung in allen Cantia-Plänen enthalten?',
          answer: 'Sie ist ab dem Plan Team verfügbar, aktivierbar in den Einstellungen Ihrer Organisation.',
        },
      ]}
      related={[
        { href: '/de/solutions/facturation', label: 'Rechnungsstellung & QR-Rechnung' },
        { href: '/de/solutions/rh-salaires', label: 'HR & Löhne' },
        { href: '/de/solutions/rentabilite', label: 'Rentabilität pro Baustelle' },
      ]}
      closingTitle="Entdecken Sie einen Liquiditätsengpass nicht mehr im Nachhinein"
      closingText="Die Liquiditätsplanung ist ab dem Plan Team verfügbar — ohne Bankverbindung, ohne komplizierte Einrichtung."
    />
  );
}
