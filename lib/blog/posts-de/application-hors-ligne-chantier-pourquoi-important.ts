import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'application-hors-ligne-chantier-pourquoi-important',
  question: 'Warum ist der Offline-Modus für eine auf einer Baustelle genutzte App so wichtig?',
  title: 'Baustellen-App ohne Netz: Warum der Offline-Modus keine Nebensache ist',
  description:
    'Ein Betonkeller, ein schlecht abgedecktes Tal, eine abgelegene Baustelle: Mobilfunknetz ist auf einer Baustelle nie garantiert. Eine App, die es dauerhaft voraussetzt, verliert genau im schlimmsten Moment ihren Wert.',
  excerpt:
    'Die Vorführung im Sitzungszimmer, mit WLAN überall, verbirgt den eigentlichen Test: was die App tut, wenn das Netz mitten im Baustellenrapport ausfällt, in einem Untergeschoss oder in ländlicher Gegend.',
  category: 'Comparatifs & outils',
  keywords: ['Offline-Modus Baustelle', 'Bau-App ohne Netz', 'Baustellen-App offline', 'Digitalisierung Baustelle', 'mobiles Tool Baustelle'],
  publishedAt: '2026-07-10',
  readMinutes: 4,
  blocks: [
    {
      type: 'p',
      text: 'Viele Baustellen-Verwaltungs-Apps werden unter idealen Bedingungen getestet und vorgeführt, im Büro, mit stabilem WLAN. Der eigentliche Test findet anderswo statt: in einem Betonkeller, der jedes Signal blockiert, in einem schlecht abgedeckten Alpental, oder schlicht auf einer Baustelle, wo mehrere Gewerke das lokale Netz vorübergehend überlasten.',
    },
    { type: 'h2', text: 'Was ohne Offline-Modus passiert' },
    {
      type: 'list',
      items: [
        'Ein auf der Baustelle aufgenommenes Foto, das nicht gespeichert wird und später, sobald man wieder in einer versorgten Zone ist, erneut aufgenommen werden muss',
        'Ein vor Ort verfasster Rapport, der verloren geht, wenn die App mangels Verbindung abstürzt, statt einfach in eine Warteschlange gestellt zu werden',
        'Ein Bauarbeiter, der nach zwei oder drei solchen Fehlschlägen die Nutzung des Tools aufgibt und zu Papier oder WhatsApp zurückkehrt',
      ],
    },
    {
      type: 'callout',
      title: 'Die Akzeptanz eines Tools entscheidet sich in seinen schlechtesten Momenten, nicht in seinen besten',
      text: 'Ein Team, das ein einziges Mal durch fehlendes Netz blockiert wurde, behält diese Erfahrung deutlich stärker im Gedächtnis als zehn erfolgreiche Nutzungen, und genau dieser Moment entscheidet, ob das Tool auf der Baustelle im Einsatz bleibt.',
    },
    { type: 'h2', text: 'Was ein echter Offline-Modus garantieren muss' },
    {
      type: 'list',
      items: [
        'Fotos aufnehmen und einen Rapport verfassen ohne Verbindung, mit automatischer Synchronisation, sobald das Netz zurückkehrt',
        'Während des Unterbruchs nie Daten verlieren, selbst bei versehentlichem Schliessen der App',
        'Identisch funktionieren, ohne für den Nutzer spürbaren Notmodus',
      ],
    },
    {
      type: 'cta',
      title: 'Entwickelt, um auch ohne Netz zu funktionieren',
      text: 'Der Baustellen-Feed von Cantia speichert Fotos und Rapporte auch ohne Verbindung, mit automatischer Synchronisation, sobald das Netz zurückkehrt – gedacht für echte Baustellenbedingungen.',
      buttonLabel: 'Kostenlos testen',
    },
  ],
  faq: [
    {
      question: 'Warum ist das Mobilfunknetz auf einer Baustelle nicht zuverlässig?',
      answer:
        'Stahlbetonstrukturen, Untergeschosse, schlecht abgedeckte ländliche Gebiete oder eine vorübergehende Überlastung des lokalen Netzes machen die Verbindung auf vielen Baustellen instabil, selbst in der Stadt.',
    },
    {
      question: 'Was passiert, wenn eine Baustellen-App keinen Offline-Modus hat?',
      answer:
        'Fotos und Rapporte riskieren verloren zu gehen oder nicht gespeichert zu werden, was das Team häufig dazu bringt, das Tool nach ein paar schlechten Erfahrungen aufzugeben und zu Papier oder informellen Nachrichten zurückzukehren.',
    },
    {
      question: 'Synchronisiert ein echter Offline-Modus die Daten automatisch?',
      answer:
        'Ja, das ist die Grundanforderung: Alles, was ohne Verbindung gespeichert wurde, muss automatisch synchronisiert werden, sobald das Netz zurückkehrt, ohne manuellen Eingriff des Nutzers.',
    },
  ],
  relatedSlugs: [
    'logiciel-gestion-chantier-independant-seul',
    'whatsapp-gestion-equipe-chantier-limites',
    'excel-vs-logiciel-gestion-chantier-limites',
  ],
};
