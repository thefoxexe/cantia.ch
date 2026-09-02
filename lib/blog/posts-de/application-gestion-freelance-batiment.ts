import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'application-gestion-freelance-batiment',
  question: 'Welche Verwaltungs-App sollte man als Freelancer im Bauwesen wählen?',
  title: 'Verwaltungs-App für Freelancer im Bauwesen: Mobile zuerst',
  description:
    'Ein Freelancer im Bauwesen verbringt die meiste Zeit auf der Baustelle, nicht am Computer: Eine Verwaltungs-App muss deshalb vor allem dafür gedacht sein.',
  excerpt:
    'Ein Freelancer im Bauwesen hat kein festes Büro, in das er jeden Abend zurückkehrt – deshalb muss sein Verwaltungstool in der Hosentasche leben, nicht nur auf einem Computerbildschirm.',
  category: 'Comparatifs & outils',
  keywords: ['Verwaltungs-App Freelancer Bau', 'mobile Baustellen-App', 'Tool Freelancer Bauwesen Schweiz', 'Verwaltung unterwegs am Handy', 'App selbstständiger Handwerker'],
  publishedAt: '2026-07-11',
  readMinutes: 4,
  blocks: [
    {
      type: 'p',
      text: 'Ein Freelancer im Bauwesen reiht Baustellen, Termine und Fahrten aneinander und hat selten einen festen Moment, um sich an einen Computer zu setzen. Eine Verwaltungs-App, die für diesen Rhythmus gedacht ist, muss alles vom Handy aus erlauben, nicht nur das Einsehen bereits andernorts erfasster Informationen.',
    },
    { type: 'h2', text: 'Was eine echte mobile App können muss' },
    {
      type: 'list',
      items: [
        'Eine vollständige Offerte direkt von der Baustelle aus erstellen, während oder direkt nach der Besichtigung',
        'Geolokalisierte und zeitgestempelte Fotos aufnehmen, später nützlich bei Streitigkeiten',
        'Eine Rechnung per E-Mail versenden, ohne ins Büro zurückkehren zu müssen',
        'Auch bei schwachem oder fehlendem Netz auf manchen Baustellen einwandfrei funktionieren',
      ],
    },
    {
      type: 'stat',
      value: '60-70 %',
      label: 'Anteil der Arbeitszeit eines Freelancers im Bauwesen, der in der Regel ausserhalb des Büros verbracht wird, auf der Baustelle oder unterwegs',
    },
    { type: 'h2', text: 'Eine „responsive" App ist nicht dasselbe wie eine für den Einsatz vor Ort gedachte mobile App' },
    {
      type: 'p',
      text: 'Viele Verwaltungstools werden auf dem Handy korrekt angezeigt, ohne je für den Einsatz auf Touchscreen, einhändig, manchmal mit Handschuhen oder staubigen Fingern gedacht worden zu sein. Der Unterschied ist bereits ab den ersten Tagen des tatsächlichen Einsatzes auf der Baustelle spürbar.',
    },
    {
      type: 'callout',
      title: 'Der Offline-Modus zählt mehr, als man denkt',
      text: 'Eine Baustelle im Untergeschoss oder in ländlicher Gegend kann ein nahezu inexistentes Netz haben, und eine App, die ohne Verbindung eingegebene Daten verliert, bestraft genau die Momente, in denen man sie am meisten braucht.',
    },
    {
      type: 'cta',
      title: 'Gedacht für die Baustelle, nicht nur fürs Büro',
      text: 'Cantia funktioniert genauso gut vom Handy auf der Baustelle wie vom Computer aus: Offerten, Fotos und Rechnungen, wo auch immer Sie sind.',
      buttonLabel: 'Kostenlos testen',
    },
  ],
  faq: [
    {
      question: 'Muss eine Verwaltungs-App für Freelancer im Bauwesen offline funktionieren?',
      answer:
        'Das ist stark zu empfehlen, denn viele Baustellen haben ein schwaches oder fehlendes Netz, und der Verlust mangels Verbindung eingegebener Daten ist besonders schmerzhaft.',
    },
    {
      question: 'Kann man eine vollständige Offerte direkt vom Handy aus erstellen?',
      answer:
        'Mit einer gut durchdachten mobilen App, ja, inklusive eines Preiskatalogs, der das erneute Eintippen jeder Leistung von Hand erspart.',
    },
    {
      question: 'Was ist der Unterschied zwischen einer „responsive" App und einer echten mobilen App?',
      answer:
        'Eine responsive App wird auf dem Handy korrekt angezeigt, ist aber nicht zwingend für den tatsächlichen Einsatz per Touch auf der Baustelle gedacht. Der Unterschied macht sich im täglichen Gebrauch bemerkbar.',
    },
  ],
  relatedSlugs: [
    'application-hors-ligne-chantier-pourquoi-important',
    'gestion-entreprise-sur-mobile-artisan',
    'meilleur-outil-gestion-independant-suisse',
  ],
};
