import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'comprendre-soumission-can-positions',
  question: 'Wie liest man ein Leistungsverzeichnis nach NPK (Kapitel, Positionen, Ergänzungstexte)?',
  title: 'Ein Leistungsverzeichnis nach NPK lesen: Kapitel, Positionen und Ergänzungstexte',
  description:
    'Was Nummern, Kapitel, Eventualpositionen und Ergänzungstexte in einem Leistungsverzeichnis nach NPK bedeuten, damit Sie kalkulieren können, ohne etwas zu vergessen.',
  excerpt:
    'Ein NPK-Leistungsverzeichnis sieht verschlüsselt aus. Wer die Logik verstanden hat, liest es schnell, und genau das erlaubt es, Preise von Baustelle zu Baustelle wiederzuverwenden.',
  category: 'Juridique & normes',
  keywords: ['NPK Leistungsverzeichnis', 'Normpositionen-Katalog', 'CRB NPK', 'Position Leistungsverzeichnis', 'LV lesen'],
  publishedAt: '2026-10-24',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'In der Schweiz werden viele Leistungsverzeichnisse im Bau mit dem NPK erstellt, dem Normpositionen-Katalog des CRB (auf Französisch CAN, auf Italienisch CPN). Der Architekt wählt darin standardisierte Texte, ergänzt sie und fügt die Mengen hinzu. Für das Unternehmen hat das einen doppelten Vorteil: Die Beschreibungen sind präzise, und dieselbe Leistung trägt von Projekt zu Projekt dieselbe Nummer.',
    },
    { type: 'h2', text: 'Der Aufbau eines NPK-Leistungsverzeichnisses' },
    {
      type: 'list',
      items: [
        'Das Kapitel, mit einer dreistelligen Nummer bezeichnet, entspricht einem Arbeitsgebiet.',
        'Darin fassen Abschnitte und Unterabschnitte verwandte Leistungen zusammen.',
        'Die Position ist die Zeile, die Sie kalkulieren: Nummer, Text, Einheit, Menge, dann Einheitspreis und Betrag zum Ausfüllen.',
        'Die Zusammenstellung addiert die Kapitel und wendet Abzüge und MWST an.',
      ],
    },
    { type: 'h2', text: 'Die Ergänzungstexte' },
    {
      type: 'p',
      text: 'Manche Positionen enthalten Stellen, die der Architekt präzisiert hat (Material, Stärke, Produkt), andere verlangen eine Angabe von Ihnen: angebotenes Fabrikat, Produkttyp oder manchmal eine Menge. Lesen Sie sie aufmerksam: Ein fehlendes Fabrikat kann das Angebot unvollständig machen, und ein vorgeschriebenes Produkt verändert Ihren Einkaufspreis.',
    },
    { type: 'h2', text: 'Reservierte Positionen und Eventualpositionen' },
    {
      type: 'p',
      text: 'Ein Leistungsverzeichnis kann Positionen enthalten, die nur bei Bedarf ausgeführt werden, oder Varianten, die zusätzlich zum Grundangebot zu kalkulieren sind. Das Dokument gibt an, wie sie im Total zählen. Kalkulieren Sie sie seriös: Sie dienen oft als Grundlage für Mehrleistungen während der Bauzeit.',
    },
    {
      type: 'callout',
      title: 'Und Leistungsverzeichnisse ohne NPK?',
      text: 'Viele Architekten, vor allem bei kleinen Projekten, schreiben ihre eigenen Positionen. Die Logik bleibt dieselbe: nummerierte Zeilen mit Einheit und Menge, ein Einheitspreis zum Ausfüllen, Zwischentotale und eine Zusammenstellung.',
    },
    { type: 'h2', text: 'Warum das für Ihre Preise nützlich ist' },
    {
      type: 'p',
      text: 'Da dieselbe Leistung ihre Positionsnummer behält, können Sie einen Katalog Ihrer Preise nach Nummer aufbauen und wiederverwenden. In Cantia werden die Preise, die Sie für eine Nummer schon angeboten haben, vorgeschlagen, wenn dieselbe Position in einem neu importierten Leistungsverzeichnis wieder vorkommt. Der Katalog speichert Nummer, Einheit und Ihren Preis, nie den NPK-Text.',
    },
    {
      type: 'cta',
      title: 'Importieren Sie Ihr nächstes Leistungsverzeichnis, mit oder ohne NPK',
      text: 'Positionen, Einheiten und Mengen übernommen, Ihre Preise vorgeschlagen, das Original-PDF ausgefüllt. In der Beta, eines zum Testen ab dem Plan Basis.',
      buttonLabel: '14 Tage testen',
    },
  ],
  faq: [
    {
      question: 'Was bedeutet NPK?',
      answer: 'Normpositionen-Katalog, herausgegeben vom CRB. In der Romandie heisst er CAN (Catalogue des articles normalisés), im Tessin CPN.',
    },
    {
      question: 'Braucht man eine Lizenz, um ein NPK-Leistungsverzeichnis zu lesen?',
      answer:
        'Grundsätzlich nicht: Sie erhalten das Dokument vom Architekten und füllen es aus. Die Lizenzen des CRB betreffen vor allem jene, die Leistungsverzeichnisse verfassen oder den Katalog in einer Software nutzen.',
    },
    {
      question: 'Liest Cantia auch Leistungsverzeichnisse ohne NPK?',
      answer: 'Ja. Der Import funktioniert mit NPK-Leistungsverzeichnissen und mit solchen, die der Architekt selbst verfasst hat, auch mit gescannten Dokumenten, mit einer Prüfansicht.',
    },
  ],
  relatedSlugs: ['remplir-soumission-pdf-architecte', 'calculer-prix-unitaire-soumission', 'norme-sia-118-devis-obligatoire'],
};
