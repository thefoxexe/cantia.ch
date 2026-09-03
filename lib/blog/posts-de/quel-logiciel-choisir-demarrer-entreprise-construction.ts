import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'quel-logiciel-choisir-demarrer-entreprise-construction',
  question: 'Welche Software wählen, um ein Bauunternehmen in der Schweiz zu gründen?',
  title: 'Welche Software beim Start des eigenen Bauunternehmens wählen',
  description:
    'Angesichts der Vielzahl verfügbarer Tools ist die einfachste Methode zur Wahl: von dem auszugehen, was man in den ersten drei Monaten wirklich braucht, nicht von der vollständigen Liste möglicher Funktionen.',
  excerpt:
    'Eine Software zu wählen, noch bevor man den ersten Kunden hat, verleitet leicht zu Fehlentscheidungen. Besser fragt man sich, was in den ersten drei Monaten gebraucht wird, nicht in den nächsten drei Jahren.',
  category: 'Comparatifs & outils',
  keywords: ['software firmengründung bauunternehmen', 'baugewerbe software wählen', 'tool für neue baufirma', 'baufirma software schweiz', 'baufirma gründen software'],
  publishedAt: '2026-07-08',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Bei der Gründung eines Bauunternehmens liegt die Versuchung nahe, sofort eine Komplettsoftware zu wählen, die alles kann (auch Dinge, die noch lange nicht gebraucht werden). Ein effizienterer Ansatz: von den drei oder vier tatsächlichen Bedürfnissen des ersten Quartals ausgehen.',
    },
    { type: 'h2', text: 'Was in den ersten drei Monaten wirklich zählt' },
    {
      type: 'list',
      items: [
        'Rasch eine professionelle und konforme Offerte erstellen, um keine ersten Kunden zu verlieren',
        'Diese Offerte in eine Rechnung umwandeln, ohne alles neu zu erfassen',
        'Jede Baustelle dokumentieren (Fotos, Fortschritt), ohne zusätzlich zur eigentlichen Arbeit daran denken zu müssen',
        'Einfach allein zu bedienen bleiben, solange noch kein Team darauf geschult werden muss',
      ],
    },
    {
      type: 'stat',
      value: '80 %',
      label: 'Anteil der Softwarebedürfnisse eines neuen Bauunternehmens, der in der Regel allein durch Offerten, Rechnungen und Baustellenverfolgung abgedeckt wird, bevor Module für Personal & Löhne oder Liquidität nötig werden',
    },
    { type: 'h2', text: 'Ein Tool wählen, das mitwächst, statt eines, das man ersetzen muss' },
    {
      type: 'p',
      text: 'Die eigentliche Frage lautet nicht «kann dieses Tool heute alles, was ich brauche», sondern «kann es mithalten, wenn ich den ersten Mitarbeiter einstelle oder mehrere Baustellen parallel führe». Ein Tool ein Jahr nach dem Start zu wechseln, kostet Zeit und Verlauf.',
    },
    {
      type: 'callout',
      title: 'Die Konformität ab dem allerersten Dokument nicht unterschätzen',
      text: 'MWST, QR-Rechnung, obligatorische gesetzliche Angaben: Diese Elemente müssen bereits bei der allerersten versendeten Offerte korrekt sein, nicht erst, wenn das Unternehmen «etabliert» ist.',
    },
    {
      type: 'cta',
      title: 'Ein Tool, das mit dem Unternehmen mitwächst',
      text: 'Cantia begleitet ein Bauunternehmen von der ersten Offerte bis zur Führung eines ganzen Teams, ohne jemals unterwegs zu einem anderen Tool wechseln zu müssen.',
      buttonLabel: 'Kostenlos testen',
    },
  ],
  faq: [
    {
      question: 'Muss man bei der Gründung des Bauunternehmens gleich eine Komplettsoftware wählen?',
      answer:
        'Nicht zwingend alles von Anfang an nutzen, aber ein Tool wählen, das künftige Bedürfnisse abdecken kann, erspart eine erzwungene Migration wenige Monate später.',
    },
    {
      question: 'Was sind die vorrangigen Softwarebedürfnisse einer neuen Baufirma?',
      answer:
        'Konforme Offerten erstellen, sie ohne Neuerfassung in Rechnungen umwandeln und jede Baustelle verfolgen: Diese drei Bedürfnisse decken den grössten Teil der Tätigkeit der ersten Monate ab.',
    },
    {
      question: 'Warum das künftige Wachstum bei der Softwarewahl mitdenken?',
      answer:
        'Nach mehreren Monaten Aktivität das Tool zu wechseln, kostet Zeit und Verlauf. Ein von Anfang an skalierbares Tool erspart diese Migration.',
    },
  ],
  relatedSlugs: [
    'demarrer-entreprise-batiment-outils-indispensables',
    'checklist-logiciels-ouverture-societe-construction',
    'lancer-entreprise-batiment-suisse-par-ou-commencer',
  ],
};
