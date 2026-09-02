import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'integration-bexio-cantia-synchronisation-automatique',
  question: 'Wie funktioniert die native Integration zwischen Cantia und Bexio?',
  title: 'Cantia x Bexio: die native Verbindung, die die Doppelerfassung eliminiert',
  description:
    'Cantia verbindet sich direkt mit Bexio über dessen offizielle API: Kunden werden importiert, Rechnungen mit einem Klick übermittelt, Zahlungsstatus automatisch aktuell gehalten.',
  excerpt:
    'Schluss damit, jede Rechnung nach der Erstellung in Cantia nochmals in Bexio zu erfassen. Die Verbindung erfolgt mit einem Klick unter Konto → Integrationen und bleibt danach von selbst aktuell.',
  category: 'Comparatifs & outils',
  keywords: ['bexio', 'bexio integration', 'buchhaltung synchronisation', 'bexio api', 'automatische rechnung'],
  publishedAt: '2026-08-25',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'Viele Bauunternehmen verwalten ihre Baustellen in Cantia und übergeben ihre Buchhaltung an Bexio, an eine Treuhandstelle, die damit arbeitet, oder an beides. Bisher bedeutete das eines: eine fertige Rechnung in Cantia öffnen und sie dann von Hand in Bexio nochmals eintippen, damit die Buchhaltung davon Kenntnis hat. Zwei Systeme, eine einzige Wahrheit, und jemand, der die Brücke zwischen beiden von Hand schlagen muss, Rechnung für Rechnung.',
    },
    {
      type: 'p',
      text: 'Das ist nicht mehr nötig. Cantia verbindet sich jetzt direkt mit Bexio über dessen offizielle API. Sobald die Verbindung hergestellt ist, laufen Kunden, Fakturierungseinstellungen und der Zahlungsstatus jeder Rechnung automatisch zwischen beiden Systemen: ohne Export, ohne Copy-Paste, ohne Risiko einer Abweichung zwischen dem, was Cantia sagt, und dem, was Bexio sagt.',
    },
    { type: 'h2', text: 'Was konkret synchronisiert wird' },
    {
      type: 'list',
      items: [
        'Ihre Bexio-Kunden werden bei der Verbindung in Cantia importiert und danach bei jeder Synchronisierung aktuell gehalten, wodurch die doppelte Kundenanlage entfällt',
        'Die Fakturierungseinstellungen (Währung, Bankverbindung, MWST-Modus, Zahlungsart) werden aus Bexio übernommen, nie doppelt erfasst oder geraten',
        'Eine Cantia-Rechnung wird mit einem Klick aus der Detailansicht an Bexio übermittelt. Sie kommt dort als Entwurf an, bereit zur Prüfung vor jedem Versand oder jeder Deklaration',
        'Der Zahlungsstatus geht den umgekehrten Weg: Sobald eine Rechnung in Bexio bezahlt ist, weiss Cantia dies innerhalb der folgenden Stunde, ohne manuelles Zutun',
      ],
    },
    {
      type: 'callout',
      title: 'Jede Rechnung existiert bei Bexio nur einmal',
      text: 'Eine bereits synchronisierte Rechnung erneut zu senden, erzeugt nie ein Duplikat: Cantia findet die entsprechende Bexio-Rechnung und aktualisiert sie. Sie können so oft resynchronisieren wie nötig, ohne je Ihre Buchhaltung zu verunreinigen.',
    },
    { type: 'h2', text: 'Verbinden: zwei Minuten, ein Administrator' },
    {
      type: 'p',
      text: 'Die Verbindung erfolgt unter Konto → Integrationen. Ein Administrator der Organisation klickt auf «Bexio verbinden», meldet sich wie gewohnt bei seinem Bexio-Konto an und erteilt die Zugriffsberechtigung. Es handelt sich um den offiziellen Authentifizierungsmechanismus von Bexio (OAuth), denselben, der auch bei den anderen Drittanbieter-Integrationen der Plattform verwendet wird. Cantia sieht Ihr Bexio-Passwort nie und speichert keine Zugangsdaten im Klartext: nur ein jederzeit widerrufbares Zugriffstoken, auf beiden Seiten.',
    },
    {
      type: 'p',
      text: 'Nach der Verbindung läuft stündlich eine automatische Synchronisierung, um die Zahlungsstatus aktuell zu halten, und ein Button «Jetzt synchronisieren» steht zusätzlich zur Verfügung, um in den Integrationseinstellungen eine sofortige Aktualisierung zu erzwingen.',
    },
    { type: 'h2', text: 'Was Cantia nicht anstelle von Bexio tut' },
    {
      type: 'p',
      text: 'Cantia finalisiert oder versendet nie eine Rechnung an den Kunden an Ihrer Stelle auf Bexio-Seite und löscht nie etwas bei Bexio: Jede Rechnung kommt als Entwurf an, damit die Buchhaltung die letzte Kontrolle behält. Cantia bleibt, was es immer war (das Werkzeug für die Baustelle, keine allgemeine Buchhaltungssoftware), und Bexio bleibt zuständig für die Buchführung, die MWST-Abrechnungen und alles, was den Rechnungsabschluss betrifft.',
    },
    {
      type: 'table',
      headers: ['', 'Vorher', 'Mit der Integration'],
      rows: [
        ['Einen Kunden anlegen', 'Einmal in Cantia, einmal in Bexio', 'Automatisch importiert, nur einmal'],
        ['Eine Rechnung an die Buchhaltung senden', 'Von Hand in Bexio nachgetragen', 'Mit einem Klick aus der Rechnung gesendet'],
        ['Wissen, ob eine Rechnung bezahlt ist', 'Manuell in Bexio zu prüfen', 'Automatisch aktualisiert, jede Stunde'],
        ['Risiko von Duplikaten oder Abweichungen', 'Real, bei jeder Nacherfassung', 'Eliminiert: jede Rechnung existiert nur einmal'],
      ],
    },
    {
      type: 'cta',
      title: 'Verfügbar ab dem Plan Entreprise',
      text: 'Die Bexio-Integration ist automatisch ab dem Plan Entreprise inbegriffen, ohne separat zu aktivierendes Modul. Verbinden Sie sie in zwei Minuten unter Konto → Integrationen.',
      buttonLabel: 'Kostenlos testen',
    },
  ],
  faq: [
    {
      question: 'Ist die Bexio-Integration zusätzlich zu meinem Abo kostenpflichtig?',
      answer:
        'Nein. Sie ist automatisch ab dem Plan Entreprise inbegriffen (und verfügbar im Plan Sur devis), ohne zusätzliche Kosten oder Modul.',
    },
    {
      question: 'Kann Cantia meinem Kunden über Bexio eine definitive Rechnung senden?',
      answer:
        'Nein. Jede Rechnung wird nur als Entwurf an Bexio übermittelt: Sie oder Ihre Treuhandstelle entscheiden immer selbst über die Finalisierung auf Bexio-Seite.',
    },
    {
      question: 'Was passiert, wenn ich die Integration trenne?',
      answer:
        'Die Bexio-Zugriffstoken werden sofort widerrufen, und es werden keine Daten mehr ausgetauscht. Bereits importierte Kunden und bereits gesendete Rechnungen bleiben auf beiden Seiten unverändert.',
    },
    {
      question: 'Muss ich meine bestehenden Kunden in Bexio nochmals erfassen, damit es funktioniert?',
      answer:
        'Nein. Ihre bestehenden Bexio-Kunden werden bei der Verbindung automatisch in Cantia importiert, in Richtung Bexio nach Cantia.',
    },
  ],
  relatedSlugs: ['bexio-vs-cantia-logiciel-batiment', 'suivre-rentabilite-chantier-sans-excel', 'qr-facture-obligatoire-2026'],
};
