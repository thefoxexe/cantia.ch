import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'crm-artisan-batiment-pourquoi-utile',
  question: 'Braucht ein Handwerksbetrieb im Bauwesen wirklich ein CRM?',
  title: 'CRM für Handwerksbetriebe im Bauwesen: nützlich oder überflüssig?',
  description:
    'Das Wort CRM weckt Assoziationen zu Verkaufsteams und komplexen Dashboards. Dabei hat ein Handwerker, der 30, 50 oder 100 Kunden betreut, genau das gleiche Gedächtnisproblem wie ein Verkäufer.',
  excerpt:
    'Man braucht keine komplexe Verkaufssoftware, um ein CRM zu benötigen. Das eigentliche Signal ist, wie oft man in seinen E-Mails nach „wer war das nochmal, dieser Kunde" sucht.',
  category: 'Comparatifs & outils',
  keywords: ['CRM Handwerksbetrieb Bau', 'Kundenverwaltung Baufirma', 'Kundensoftware Handwerk', 'Kundenverfolgung Baustelle', 'Kundenbindung Bau'],
  publishedAt: '2026-06-05',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Das Wort CRM (Customer Relationship Management) weckt oft Assoziationen zu Verkaufsteams mit komplexen Verkaufstrichtern (eine Welt weit weg vom Alltag eines Handwerkers). Doch die Grundfunktion eines CRM – wissen, wer die eigenen Kunden sind, was sie bereits bestellt haben und wann man sie erneut kontaktieren sollte – betrifft einen Baubetrieb genau so sehr wie ein Verkaufsteam.',
    },
    { type: 'h2', text: 'Das Signal, das zeigt, dass ein CRM sinnvoll wird' },
    {
      type: 'list',
      items: [
        'Eine alte Offerte oder eine Baustellenadresse in der Mailbox suchen statt in einer zentralen Datei',
        'Sich nicht mehr erinnern, ob ein Kunde für einen früheren Einsatz bereits Rechnung erhalten hat',
        'Einen früheren Kunden zufällig statt durch strukturierte Nachverfolgung erneut kontaktieren',
        'Den Überblick verlieren, wer was auf welcher Baustelle unterzeichnet hat, mit welcher geleisteten Anzahlung',
      ],
    },
    {
      type: 'h2', text: 'Was ein auf das Bauwesen zugeschnittenes CRM konkret bringt',
    },
    {
      type: 'list',
      items: [
        'Eine vollständige Historie pro Kunde: Offerten, Rechnungen, Baustellen, Notizen zur Nachverfolgung, an einem einzigen Ort',
        'Eine Grundlage, um einen früheren Kunden zum richtigen Zeitpunkt erneut zu kontaktieren, statt nach Zufall einer Erinnerung',
        'Eine klare Übersicht, welche Kunden Stammkunden sind, oft die profitabelsten in der Kundenbindung',
        'Direkte Zeitersparnis: keine Notwendigkeit mehr, bei jedem neuen Kontakt mit einem bestehenden Kunden eine Historie zu rekonstruieren',
      ],
    },
    {
      type: 'callout',
      title: 'Ein Stammkunde kostet in der Bindung deutlich weniger als die Gewinnung eines neuen',
      text: 'Im Bauwesen wie anderswo ist Kundenbindung fast immer profitabler als Neukundengewinnung. Man braucht dafür allerdings den nötigen Überblick, um zu wissen, wen man wann erneut kontaktieren sollte.',
    },
    {
      type: 'cta',
      title: 'Eine integrierte Kundenhistorie, keine separate Software',
      text: 'Cantia zentralisiert Offerten, Rechnungen und Notizen pro Kunde direkt verknüpft mit den Baustellen: kein separates CRM nötig, das zusätzlich synchronisiert werden müsste.',
      buttonLabel: 'Kostenlos testen',
    },
  ],
  faq: [
    {
      question: 'Braucht ein selbstständiger Handwerker ein CRM?',
      answer:
        'Sobald es schwierig wird, sich ohne Suche in den E-Mails an die Historie jedes Kunden zu erinnern, bringt ein einfaches CRM einen echten Zeitgewinn, selbst als Einzelunternehmer.',
    },
    {
      question: 'Was ist der Unterschied zwischen einem CRM und einem einfachen Adressbuch?',
      answer:
        'Ein CRM verknüpft die vollständige Historie (Offerten, Rechnungen, Baustellen, Notizen) mit jedem Kunden, während ein Adressbuch nur die Kontaktdaten aufbewahrt.',
    },
    {
      question: 'Braucht es separate Software für CRM und Rechnungsstellung?',
      answer:
        'Nicht zwingend: Ein Werkzeug, das Kunden, Offerten und Rechnungen nativ verknüpft, vermeidet Doppelerfassung und die Synchronisation zwischen zwei getrennten Systemen.',
    },
  ],
  relatedSlugs: [
    'relancer-client-facture-impayee-sans-perdre-client',
    'meilleur-logiciel-devis-facture-batiment-suisse-2026',
    'excel-vs-logiciel-gestion-chantier-limites',
  ],
};
