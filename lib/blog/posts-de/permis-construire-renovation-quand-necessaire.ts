import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'permis-construire-renovation-quand-necessaire',
  question: 'Braucht man in der Schweiz eine Baubewilligung für eine Renovation?',
  title: 'Baubewilligung für eine Renovation: Wann sie wirklich nötig ist',
  description:
    'Eine Küche oder ein Bad neu zu gestalten, erfordert grundsätzlich keine Baubewilligung. Sobald die Struktur, das äussere Erscheinungsbild oder die Nutzung sich ändern, ändert sich alles – und das hängt stark vom Kanton ab.',
  excerpt:
    'Ein Bad neu zu gestalten, erfordert grundsätzlich keine Bewilligung. Eine tragende Wand anzufassen hingegen schon, und die Grenze zwischen beidem liegt in Details, die kaum ein Handwerker vor Baubeginn prüft.',
  category: 'Juridique & normes',
  keywords: ['baubewilligung renovation schweiz', 'meldeverfahren bau', 'baugesuch sanierung', 'tragende wand bewilligung', 'kanton baubewilligung unterschied'],
  publishedAt: '2026-03-16',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'Eine Innenrenovation, die weder die tragende Struktur noch die Nutzung der Räume betrifft, ist in der Schweiz grundsätzlich bewilligungsfrei: eine Küche, ein Bad, Böden oder Wandanstriche neu zu machen, benötigt in der Regel keine Bewilligung. Die Regel ändert sich, sobald eine tragende Wand, das äussere Erscheinungsbild oder die Zweckbestimmung eines Raums ins Spiel kommen.',
    },
    { type: 'h2', text: 'Was in der Regel ohne Bewilligung auskommt' },
    {
      type: 'list',
      items: [
        'Innenrenovation ohne Eingriff in die Struktur (Küche, Bad, Bodenbeläge, Anstrich)',
        'Identischer Ersatz bestehender Installationen (Heizung, Sanitär, Elektrik)',
        'Kleinere Unterhaltsarbeiten',
      ],
    },
    { type: 'h2', text: 'Was fast immer ein Verfahren auslöst' },
    {
      type: 'list',
      items: [
        'Jede Änderung an der tragenden Struktur (tragende Wand abgerissen oder durchbrochen)',
        'Eine Änderung des äusseren Erscheinungsbilds (Fassade, Dach, von aussen sichtbare Fenster)',
        'Eine Nutzungsänderung eines Raums (zum Beispiel eine Garage in einen Wohnraum umwandeln)',
        'Jede Frage des Brandschutzes, die durch die Arbeiten verändert wird',
      ],
    },
    {
      type: 'callout',
      title: 'Die Falle: «bewilligungsfrei» heisst nicht «meldefrei»',
      text: 'Selbst kleinere Arbeiten müssen der Gemeinde oft vor Baubeginn gemeldet werden, damit diese selbst über das passende Verfahren entscheidet (vereinfachtes Meldeverfahren ohne öffentliche Auflage und Einsprachemöglichkeit der Nachbarn, oder ordentliches Verfahren). Ohne vorherige Meldung zu beginnen, selbst bei eigentlich bewilligungsfreien Arbeiten, kann zu einem Baustopp führen.',
    },
    { type: 'h2', text: 'Die eigentliche Variable: der Kanton, nicht der Bund' },
    {
      type: 'p',
      text: 'Es gibt keine einheitliche Bundesregel: Jeder Kanton, teils sogar jede Gemeinde, legt ihre eigenen Bewilligungsschwellen und Verfahren fest. Dieselbe Renovationsbaustelle kann in einem Kanton völlig frei sein und in einem anderen dem vereinfachten Meldeverfahren unterliegen. Vorab bei der Gemeinde nachzufragen kostet einen Besuch; es nicht zu tun, kann einen Baustopp mitten in der Ausführung kosten.',
    },
    {
      type: 'p',
      text: 'Bei einer Baustelle, die potenziell die Struktur oder das äussere Erscheinungsbild betrifft, lohnt es sich, die Frage vor der Offerte bei der Gemeinde zu klären, nicht danach. Eine falsch eingeschätzte Verfahrensdauer wirkt sich direkt auf den dem Kunden versprochenen Terminplan aus.',
    },
    {
      type: 'cta',
      title: 'Der Terminplan der Baustelle, nie aus den Augen verloren',
      text: 'Die Team-Planung von Cantia verknüpft jeden Einsatz mit einer bestimmten Baustelle, was hilft, eine Verfahrensverzögerung aufzufangen, ohne den Überblick über die übrigen Verpflichtungen zu verlieren.',
      buttonLabel: 'Team-Planung entdecken',
    },
  ],
  faq: [
    {
      question: 'Braucht man für eine neue Küche oder ein neues Bad eine Baubewilligung?',
      answer:
        'Grundsätzlich nein, solange die tragende Struktur und die Raumnutzung nicht verändert werden. Eine Meldung an die Gemeinde kann je nach Kanton dennoch nötig sein.',
    },
    {
      question: 'Welche Renovationsarbeiten benötigen fast immer eine Bewilligung?',
      answer:
        'Alles, was eine tragende Wand, das äussere Erscheinungsbild des Gebäudes, die Zweckbestimmung eines Raums oder den Brandschutz betrifft, löst in der Regel ein Verfahren aus.',
    },
    {
      question: 'Sind die Bewilligungsregeln in allen Schweizer Kantonen gleich?',
      answer:
        'Nein, das ist nicht der Fall. Jeder Kanton, teils sogar jede Gemeinde, legt eigene Bewilligungsschwellen und Verfahren fest: Es gibt keine einheitliche Bundesregel für Renovationen.',
    },
  ],
  relatedSlugs: [
    'contrat-entreprise-vs-mandat-artisan',
    'garantie-travaux-construction-2-ou-5-ans',
    'norme-sia-118-devis-obligatoire',
  ],
};
