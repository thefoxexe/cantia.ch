import type { PartnersLocale } from './copy';

// partners.cantia.ch landing (October 2026): a long-term business
// partnership, in the tone of a B2B programme. No affiliation vocabulary
// (link, QR code, attribution window): the page presents three ways of
// working together, what each side commits to, the written framework of
// each partnership and, plainly, how it is paid. Commitments listed here are
// the benefits of the partner space (lib/partners/appCopy.ts).
export const CONTACT_EMAIL = 'info@cantia.ch';

type Item = { title: string; text: string };

export type LandingCopy = {
  meta: { title: string; description: string };
  hero: { eyebrow: string; title: string; text: string; cta: string; secondary: string; note: string };
  charter: {
    title: string;
    example: string;
    partner: string;
    partnerMeta: string;
    rows: { k: string; v: string[] }[];
    status: string;
  };
  kinds: { eyebrow: string; title: string; text: string; you: string; us: string; items: { name: string; who: string; you: string; us: string }[] };
  commitments: { eyebrow: string; title: string; items: Item[] };
  honest: { eyebrow: string; title: string; text: string; facts: { k: string; v: string }[] };
  products: { eyebrow: string; title: string; items: { name: string; who: string; text: string; points: string[] }[] };
  process: { eyebrow: string; title: string; items: Item[] };
  terms: { eyebrow: string; title: string; text: string; facts: string[] };
  wall: { eyebrow: string; title: string };
  faq: { eyebrow: string; title: string; items: { q: string; a: string }[] };
  final: { title: string; text: string; cta: string; write: string };
};

export const LANDING_COPY: Record<PartnersLocale, LandingCopy> = {
  fr: {
    meta: {
      title: 'Cantia Partners · Un partenariat sur la durée',
      description: 'Fiduciaires, intégrateurs, fournisseurs et associations professionnelles : construisez avec Cantia un partenariat sur la durée, autour des PME que vous accompagnez. Un cadre écrit, des engagements des deux côtés.',
    },
    hero: {
      eyebrow: 'Programme partenaires · Suisse',
      title: 'Un partenariat\nsur la durée.',
      text: 'Fiduciaires, intégrateurs, fournisseurs, associations professionnelles : vous accompagnez des PME suisses depuis des années. Nous cherchons quelques partenaires avec qui travailler dans la durée, autour de vos clients, avec un cadre clair et une équipe disponible.',
      cta: 'Devenir partenaire',
      secondary: 'Écrire à l’équipe',
      note: 'Un échange d’abord. Un cadre écrit ensuite.',
    },
    charter: {
      title: 'Cadre du partenariat',
      example: 'Exemple',
      partner: 'Rossier & Associés',
      partnerMeta: 'Fiduciaire · Sion',
      rows: [
        { k: 'Type', v: ['Partenariat conseil'] },
        { k: 'Engagements de Cantia', v: ['Démonstrations faites ensemble', 'Accompagnement au démarrage de vos clients', 'Accès anticipé aux nouveautés', 'Ligne directe avec l’équipe'] },
        { k: 'Engagements du partenaire', v: ['Présenter Cantia aux clients concernés', 'Partager les retours du terrain'] },
        { k: 'Conditions commerciales', v: ['Définies ensemble, consignées dans l’espace partenaire'] },
        { k: 'Durée', v: ['Sans durée minimale'] },
      ],
      status: 'Partenaire depuis octobre 2026',
    },
    kinds: {
      eyebrow: 'Trois façons de travailler ensemble',
      title: 'Chaque partenaire a son rôle.',
      text: 'Le cadre dépend de ce que vous faites déjà pour vos clients. Nous le définissons ensemble, au premier échange.',
      you: 'Votre rôle',
      us: 'Ce que Cantia apporte',
      items: [
        { name: 'Conseil', who: 'Fiduciaires, consultants', you: 'Vous conseillez vos mandants sur leur organisation et recommandez Cantia quand c’est utile.', us: 'Un espace gratuit pour vos mandants, des chiffres propres au bouclement, une démo avec vous.' },
        { name: 'Intégration', who: 'Revendeurs informatiques, intégrateurs', you: 'Vous accompagnez la digitalisation de PME et mettez Cantia en place chez vos clients.', us: 'Une solution suisse complète, la prise en main avec votre équipe, une ligne directe.' },
        { name: 'Réseau', who: 'Associations, fournisseurs, négoces', you: 'Vous faites connaître Cantia auprès de vos membres ou de vos clients artisans.', us: 'Des présentations pour vos membres et des supports à votre nom, sur demande.' },
      ],
    },
    commitments: {
      eyebrow: 'Nos engagements',
      title: 'Ce que nous faisons pour nos partenaires.',
      items: [
        { title: 'Une ligne directe', text: 'Vous parlez à l’équipe qui fait Cantia. Vos questions et celles de vos clients arrivent chez les bonnes personnes.' },
        { title: 'Des démonstrations communes', text: 'Pour un client qui se pose des questions, nous présentons Cantia avec vous, sur ses vrais cas.' },
        { title: 'Votre avis dans le produit', text: 'Vos retours du terrain pèsent sur ce que nous développons, et vous voyez les nouveautés avant tout le monde.' },
        { title: 'Des clients qui restent les vôtres', text: 'Vous ne voyez jamais leurs données, leurs devis ou leurs chiffres. La relation reste la vôtre.' },
      ],
    },
    honest: {
      eyebrow: 'Où nous en sommes',
      title: 'Un programme\nqui commence.',
      text: 'Cantia est une jeune entreprise suisse. Nous n’avons pas encore de réseau de partenaires à vous présenter, et nous ne ferons pas semblant. Nous préférons quelques partenaires choisis, avec qui construire sur plusieurs années, à une longue liste de noms. Les premiers partenaires travaillent directement avec l’équipe et pèsent sur ce que nous développons.',
      facts: [
        { k: 'Hébergement', v: 'Zurich, Suisse' },
        { k: 'Langues', v: 'Français · Deutsch · Italiano' },
        { k: 'Frais d’adhésion', v: 'Aucun' },
        { k: 'Cadre', v: 'Écrit, défini avec chaque partenaire' },
      ],
    },
    products: {
      eyebrow: 'Ce que vous apportez à vos clients',
      title: 'Deux produits, un même compte.',
      items: [
        {
          name: 'Cantia',
          who: 'Pour les entreprises',
          text: 'Le logiciel de gestion des PME suisses, du devis au salaire.',
          points: ['Devis, factures QR et relances', 'Chantiers, planning et équipe', 'Comptabilité, TVA et salaires', 'Sur ordinateur et téléphone'],
        },
        {
          name: 'Cantia Accounting',
          who: 'Pour les fiduciaires',
          text: 'L’espace de travail des fiduciaires, gratuit, pour tous leurs mandants.',
          points: ['Mandants sur Cantia ou sur un autre logiciel', 'Décompte TVA AFC et bouclement', 'Pièces et signatures depuis le téléphone du client', 'Exports Banana, Abacus et Winbiz'],
        },
      ],
    },
    process: {
      eyebrow: 'Comment ça commence',
      title: 'Quatre étapes, sans précipitation.',
      items: [
        { title: 'Premier échange', text: 'Nous faisons connaissance : votre activité, vos clients, ce que vous attendez d’un partenariat.' },
        { title: 'Prise en main', text: 'Nous présentons Cantia à votre équipe, sur les cas de vos clients.' },
        { title: 'Cadre écrit', text: 'Nous convenons ensemble des rôles et des engagements ; les conditions commerciales sont consignées dans votre espace partenaire.' },
        { title: 'Premiers clients', text: 'Nous accompagnons ensemble vos premiers clients, puis nous faisons le point régulièrement.' },
      ],
    },
    terms: {
      eyebrow: 'Conditions',
      title: 'Un cadre clair, défini avec vous.',
      text: 'Les conditions commerciales dépendent de votre rôle et de l’accompagnement que vous apportez. Elles sont fixées lors du premier échange, consignées dans votre espace partenaire, et votre rémunération est versée chaque mois.',
      facts: ['Conditions écrites, propres à chaque partenaire', 'Rémunération versée chaque mois', 'Aucun frais d’adhésion, aucune durée minimale'],
    },
    wall: { eyebrow: 'Partenaires', title: 'Ils accompagnent leurs clients avec Cantia.' },
    faq: {
      eyebrow: 'Questions fréquentes',
      title: 'Ce qu’il faut savoir',
      items: [
        { q: 'Qui peut devenir partenaire ?', a: 'Les professionnels établis en Suisse qui accompagnent des PME : fiduciaires, consultants, revendeurs et intégrateurs, associations professionnelles, fournisseurs.' },
        { q: 'Comment se passe le premier échange ?', a: 'Une discussion avec l’équipe Cantia, en visio ou en personne : votre activité, vos clients, ce que vous attendez. Rien n’est signé à ce stade.' },
        { q: 'Que fait Cantia pour mes clients ?', a: 'Nous les aidons à démarrer, répondons à leurs questions et faisons les démonstrations avec vous quand c’est utile.' },
        { q: 'Mes clients restent-ils mes clients ?', a: 'Oui. Vous ne voyez jamais leurs données, et la relation avec eux reste la vôtre.' },
        { q: 'Comment les conditions sont-elles définies ?', a: 'Avec vous, selon votre rôle et l’accompagnement que vous apportez. Elles sont consignées dans votre espace partenaire et la rémunération est versée chaque mois.' },
        { q: 'Y a-t-il des frais ou une durée minimale ?', a: 'Non. Aucun frais d’adhésion et aucune durée minimale : un partenariat se construit dans la durée parce qu’il fonctionne, pas parce qu’un contrat l’impose.' },
      ],
    },
    final: { title: 'Parlons d’un partenariat.', text: 'Créez votre espace ou écrivez-nous directement : nous prenons le temps de faire connaissance.', cta: 'Devenir partenaire', write: 'Écrire à l’équipe' },
  },
  de: {
    meta: {
      title: 'Cantia Partners · Eine langfristige Partnerschaft',
      description: 'Treuhänder, Integratoren, Lieferanten und Berufsverbände: Bauen Sie mit Cantia eine langfristige Partnerschaft rund um die KMU auf, die Sie begleiten. Ein schriftlicher Rahmen, Verpflichtungen auf beiden Seiten.',
    },
    hero: {
      eyebrow: 'Partnerprogramm · Schweiz',
      title: 'Eine Partnerschaft\nauf Dauer.',
      text: 'Treuhänder, Integratoren, Lieferanten, Berufsverbände: Sie begleiten Schweizer KMU seit Jahren. Wir suchen einige Partner, mit denen wir langfristig zusammenarbeiten, rund um Ihre Kunden, mit einem klaren Rahmen und einem verfügbaren Team.',
      cta: 'Partner werden',
      secondary: 'Dem Team schreiben',
      note: 'Zuerst ein Gespräch. Danach ein schriftlicher Rahmen.',
    },
    charter: {
      title: 'Rahmen der Partnerschaft',
      example: 'Beispiel',
      partner: 'Rossier & Partner',
      partnerMeta: 'Treuhand · Sitten',
      rows: [
        { k: 'Art', v: ['Beratungspartnerschaft'] },
        { k: 'Verpflichtungen von Cantia', v: ['Gemeinsame Demos', 'Begleitung Ihrer Kunden beim Start', 'Früher Zugang zu Neuerungen', 'Direkter Draht zum Team'] },
        { k: 'Verpflichtungen des Partners', v: ['Cantia passenden Kunden vorstellen', 'Rückmeldungen aus der Praxis teilen'] },
        { k: 'Kommerzielle Konditionen', v: ['Gemeinsam festgelegt, im Partnerbereich festgehalten'] },
        { k: 'Dauer', v: ['Ohne Mindestdauer'] },
      ],
      status: 'Partner seit Oktober 2026',
    },
    kinds: {
      eyebrow: 'Drei Arten der Zusammenarbeit',
      title: 'Jeder Partner hat seine Rolle.',
      text: 'Der Rahmen hängt davon ab, was Sie bereits für Ihre Kunden tun. Wir legen ihn im ersten Gespräch gemeinsam fest.',
      you: 'Ihre Rolle',
      us: 'Was Cantia beiträgt',
      items: [
        { name: 'Beratung', who: 'Treuhänder, Berater', you: 'Sie beraten Ihre Mandanten zu ihrer Organisation und empfehlen Cantia, wo es sinnvoll ist.', us: 'Ein kostenloser Bereich für Ihre Mandanten, saubere Zahlen beim Abschluss, eine Demo mit Ihnen.' },
        { name: 'Integration', who: 'IT-Händler, Integratoren', you: 'Sie begleiten die Digitalisierung von KMU und führen Cantia bei Ihren Kunden ein.', us: 'Eine vollständige Schweizer Lösung, die Einführung mit Ihrem Team, ein direkter Draht.' },
        { name: 'Netzwerk', who: 'Verbände, Lieferanten, Handel', you: 'Sie machen Cantia bei Ihren Mitgliedern oder Handwerkskunden bekannt.', us: 'Präsentationen für Ihre Mitglieder und Unterlagen in Ihrem Namen, auf Anfrage.' },
      ],
    },
    commitments: {
      eyebrow: 'Unsere Verpflichtungen',
      title: 'Was wir für unsere Partner tun.',
      items: [
        { title: 'Ein direkter Draht', text: 'Sie sprechen mit dem Team, das Cantia baut. Ihre Fragen und die Ihrer Kunden landen bei den richtigen Personen.' },
        { title: 'Gemeinsame Demos', text: 'Für einen Kunden mit Fragen stellen wir Cantia mit Ihnen vor, an seinen echten Fällen.' },
        { title: 'Ihre Meinung im Produkt', text: 'Ihre Rückmeldungen aus der Praxis beeinflussen, was wir entwickeln, und Sie sehen Neuerungen vor allen anderen.' },
        { title: 'Ihre Kunden bleiben Ihre Kunden', text: 'Sie sehen nie ihre Daten, Offerten oder Zahlen. Die Beziehung bleibt Ihre.' },
      ],
    },
    honest: {
      eyebrow: 'Wo wir stehen',
      title: 'Ein Programm,\ndas beginnt.',
      text: 'Cantia ist ein junges Schweizer Unternehmen. Wir haben noch kein Partnernetzwerk, das wir Ihnen vorstellen könnten, und wir tun nicht so. Wir ziehen einige ausgewählte Partner, mit denen wir über Jahre aufbauen, einer langen Namensliste vor. Die ersten Partner arbeiten direkt mit dem Team und beeinflussen, was wir entwickeln.',
      facts: [
        { k: 'Hosting', v: 'Zürich, Schweiz' },
        { k: 'Sprachen', v: 'Français · Deutsch · Italiano' },
        { k: 'Beitrittsgebühr', v: 'Keine' },
        { k: 'Rahmen', v: 'Schriftlich, mit jedem Partner festgelegt' },
      ],
    },
    products: {
      eyebrow: 'Was Sie Ihren Kunden bieten',
      title: 'Zwei Produkte, ein Konto.',
      items: [
        {
          name: 'Cantia',
          who: 'Für Unternehmen',
          text: 'Die Verwaltungssoftware für Schweizer KMU, von der Offerte bis zum Lohn.',
          points: ['Offerten, QR-Rechnungen und Mahnungen', 'Baustellen, Planung und Team', 'Buchhaltung, MWST und Löhne', 'Auf Computer und Handy'],
        },
        {
          name: 'Cantia Accounting',
          who: 'Für Treuhänder',
          text: 'Der Arbeitsbereich für Treuhänder, kostenlos, für alle Mandanten.',
          points: ['Mandanten auf Cantia oder einer anderen Software', 'MWST-Abrechnung ESTV und Abschluss', 'Belege und Unterschriften vom Handy des Kunden', 'Exporte für Banana, Abacus und Winbiz'],
        },
      ],
    },
    process: {
      eyebrow: 'Wie es beginnt',
      title: 'Vier Schritte, ohne Eile.',
      items: [
        { title: 'Erstes Gespräch', text: 'Wir lernen uns kennen: Ihre Tätigkeit, Ihre Kunden, was Sie von einer Partnerschaft erwarten.' },
        { title: 'Einführung', text: 'Wir stellen Cantia Ihrem Team vor, an den Fällen Ihrer Kunden.' },
        { title: 'Schriftlicher Rahmen', text: 'Wir vereinbaren Rollen und Verpflichtungen gemeinsam; die kommerziellen Konditionen werden im Partnerbereich festgehalten.' },
        { title: 'Erste Kunden', text: 'Wir begleiten Ihre ersten Kunden gemeinsam und ziehen regelmässig Bilanz.' },
      ],
    },
    terms: {
      eyebrow: 'Konditionen',
      title: 'Ein klarer Rahmen, mit Ihnen festgelegt.',
      text: 'Die kommerziellen Konditionen hängen von Ihrer Rolle und Ihrer Begleitung ab. Sie werden im ersten Gespräch festgelegt, im Partnerbereich festgehalten, und Ihre Vergütung wird monatlich ausbezahlt.',
      facts: ['Schriftliche Konditionen, für jeden Partner eigene', 'Vergütung monatlich ausbezahlt', 'Keine Beitrittsgebühr, keine Mindestdauer'],
    },
    wall: { eyebrow: 'Partner', title: 'Sie begleiten ihre Kunden mit Cantia.' },
    faq: {
      eyebrow: 'Häufige Fragen',
      title: 'Was Sie wissen sollten',
      items: [
        { q: 'Wer kann Partner werden?', a: 'In der Schweiz ansässige Fachleute, die KMU begleiten: Treuhänder, Berater, Händler und Integratoren, Berufsverbände, Lieferanten.' },
        { q: 'Wie läuft das erste Gespräch ab?', a: 'Ein Austausch mit dem Cantia-Team, per Video oder persönlich: Ihre Tätigkeit, Ihre Kunden, Ihre Erwartungen. In diesem Stadium wird nichts unterschrieben.' },
        { q: 'Was tut Cantia für meine Kunden?', a: 'Wir helfen ihnen beim Start, beantworten ihre Fragen und machen Demos mit Ihnen, wenn es sinnvoll ist.' },
        { q: 'Bleiben meine Kunden meine Kunden?', a: 'Ja. Sie sehen nie ihre Daten, und die Beziehung zu ihnen bleibt Ihre.' },
        { q: 'Wie werden die Konditionen festgelegt?', a: 'Mit Ihnen, je nach Ihrer Rolle und Begleitung. Sie werden im Partnerbereich festgehalten, die Vergütung wird monatlich ausbezahlt.' },
        { q: 'Gibt es Kosten oder eine Mindestdauer?', a: 'Nein. Keine Beitrittsgebühr und keine Mindestdauer: Eine Partnerschaft hält, weil sie funktioniert, nicht weil ein Vertrag es verlangt.' },
      ],
    },
    final: { title: 'Sprechen wir über eine Partnerschaft.', text: 'Erstellen Sie Ihren Bereich oder schreiben Sie uns direkt: Wir nehmen uns Zeit, Sie kennenzulernen.', cta: 'Partner werden', write: 'Dem Team schreiben' },
  },
  it: {
    meta: {
      title: 'Cantia Partners · Una partnership nel tempo',
      description: 'Fiduciari, integratori, fornitori e associazioni professionali: costruisca con Cantia una partnership nel tempo, attorno alle PMI che accompagna. Un quadro scritto, impegni da entrambe le parti.',
    },
    hero: {
      eyebrow: 'Programma partner · Svizzera',
      title: 'Una partnership\nnel tempo.',
      text: 'Fiduciari, integratori, fornitori, associazioni professionali: accompagnate le PMI svizzere da anni. Cerchiamo alcuni partner con cui lavorare nel tempo, attorno ai vostri clienti, con un quadro chiaro e un team disponibile.',
      cta: 'Diventare partner',
      secondary: 'Scrivere al team',
      note: 'Prima un incontro. Poi un quadro scritto.',
    },
    charter: {
      title: 'Quadro della partnership',
      example: 'Esempio',
      partner: 'Rossier & Associati',
      partnerMeta: 'Fiduciaria · Sion',
      rows: [
        { k: 'Tipo', v: ['Partnership di consulenza'] },
        { k: 'Impegni di Cantia', v: ['Demo fatte insieme', 'Accompagnamento all’avvio dei suoi clienti', 'Accesso anticipato alle novità', 'Linea diretta con il team'] },
        { k: 'Impegni del partner', v: ['Presentare Cantia ai clienti interessati', 'Condividere i riscontri dal terreno'] },
        { k: 'Condizioni commerciali', v: ['Definite insieme, registrate nello spazio partner'] },
        { k: 'Durata', v: ['Senza durata minima'] },
      ],
      status: 'Partner da ottobre 2026',
    },
    kinds: {
      eyebrow: 'Tre modi di lavorare insieme',
      title: 'Ogni partner ha il suo ruolo.',
      text: 'Il quadro dipende da ciò che fa già per i suoi clienti. Lo definiamo insieme, al primo incontro.',
      you: 'Il suo ruolo',
      us: 'Cosa porta Cantia',
      items: [
        { name: 'Consulenza', who: 'Fiduciari, consulenti', you: 'Consiglia i suoi mandanti sulla loro organizzazione e raccomanda Cantia quando è utile.', us: 'Uno spazio gratuito per i suoi mandanti, cifre pulite alla chiusura, una demo con lei.' },
        { name: 'Integrazione', who: 'Rivenditori informatici, integratori', you: 'Accompagna la digitalizzazione delle PMI e introduce Cantia presso i suoi clienti.', us: 'Una soluzione svizzera completa, la presa in mano con il suo team, una linea diretta.' },
        { name: 'Rete', who: 'Associazioni, fornitori, commercio', you: 'Fa conoscere Cantia ai suoi membri o ai suoi clienti artigiani.', us: 'Presentazioni per i suoi membri e materiale a suo nome, su richiesta.' },
      ],
    },
    commitments: {
      eyebrow: 'I nostri impegni',
      title: 'Cosa facciamo per i nostri partner.',
      items: [
        { title: 'Una linea diretta', text: 'Parla con il team che fa Cantia. Le sue domande e quelle dei suoi clienti arrivano alle persone giuste.' },
        { title: 'Demo fatte insieme', text: 'Per un cliente con delle domande, presentiamo Cantia con lei, sui suoi casi reali.' },
        { title: 'Il suo parere nel prodotto', text: 'I suoi riscontri dal terreno pesano su ciò che sviluppiamo, e vede le novità prima di tutti.' },
        { title: 'Clienti che restano suoi', text: 'Non vede mai i loro dati, preventivi o cifre. La relazione resta sua.' },
      ],
    },
    honest: {
      eyebrow: 'A che punto siamo',
      title: 'Un programma\nche comincia.',
      text: 'Cantia è una giovane impresa svizzera. Non abbiamo ancora una rete di partner da presentarle, e non faremo finta di averla. Preferiamo alcuni partner scelti, con cui costruire su più anni, a una lunga lista di nomi. I primi partner lavorano direttamente con il team e influiscono su ciò che sviluppiamo.',
      facts: [
        { k: 'Hosting', v: 'Zurigo, Svizzera' },
        { k: 'Lingue', v: 'Français · Deutsch · Italiano' },
        { k: 'Quota di adesione', v: 'Nessuna' },
        { k: 'Quadro', v: 'Scritto, definito con ogni partner' },
      ],
    },
    products: {
      eyebrow: 'Cosa offre ai suoi clienti',
      title: 'Due prodotti, un solo conto.',
      items: [
        {
          name: 'Cantia',
          who: 'Per le imprese',
          text: 'Il software di gestione delle PMI svizzere, dal preventivo al salario.',
          points: ['Preventivi, fatture QR e solleciti', 'Cantieri, pianificazione e squadra', 'Contabilità, IVA e salari', 'Su computer e telefono'],
        },
        {
          name: 'Cantia Accounting',
          who: 'Per i fiduciari',
          text: 'Lo spazio di lavoro dei fiduciari, gratuito, per tutti i loro mandanti.',
          points: ['Mandanti su Cantia o su un altro software', 'Rendiconto IVA AFC e chiusura', 'Documenti e firme dal telefono del cliente', 'Esportazioni Banana, Abacus e Winbiz'],
        },
      ],
    },
    process: {
      eyebrow: 'Come si comincia',
      title: 'Quattro tappe, senza fretta.',
      items: [
        { title: 'Primo incontro', text: 'Ci conosciamo: la sua attività, i suoi clienti, cosa si aspetta da una partnership.' },
        { title: 'Presa in mano', text: 'Presentiamo Cantia al suo team, sui casi dei suoi clienti.' },
        { title: 'Quadro scritto', text: 'Concordiamo insieme ruoli e impegni; le condizioni commerciali sono registrate nel suo spazio partner.' },
        { title: 'Primi clienti', text: 'Accompagniamo insieme i suoi primi clienti, poi facciamo il punto regolarmente.' },
      ],
    },
    terms: {
      eyebrow: 'Condizioni',
      title: 'Un quadro chiaro, definito con lei.',
      text: 'Le condizioni commerciali dipendono dal suo ruolo e dall’accompagnamento che offre. Sono fissate al primo incontro, registrate nel suo spazio partner, e la sua remunerazione è versata ogni mese.',
      facts: ['Condizioni scritte, proprie a ogni partner', 'Remunerazione versata ogni mese', 'Nessuna quota di adesione, nessuna durata minima'],
    },
    wall: { eyebrow: 'Partner', title: 'Accompagnano i loro clienti con Cantia.' },
    faq: {
      eyebrow: 'Domande frequenti',
      title: 'Cosa sapere',
      items: [
        { q: 'Chi può diventare partner?', a: 'I professionisti con sede in Svizzera che accompagnano PMI: fiduciari, consulenti, rivenditori e integratori, associazioni professionali, fornitori.' },
        { q: 'Come si svolge il primo incontro?', a: 'Uno scambio con il team Cantia, in video o di persona: la sua attività, i suoi clienti, le sue aspettative. In questa fase non si firma nulla.' },
        { q: 'Cosa fa Cantia per i miei clienti?', a: 'Li aiutiamo ad avviarsi, rispondiamo alle loro domande e facciamo le demo con lei quando è utile.' },
        { q: 'I miei clienti restano miei?', a: 'Sì. Non vede mai i loro dati, e la relazione con loro resta sua.' },
        { q: 'Come sono definite le condizioni?', a: 'Con lei, secondo il suo ruolo e l’accompagnamento che offre. Sono registrate nel suo spazio partner e la remunerazione è versata ogni mese.' },
        { q: 'Ci sono costi o una durata minima?', a: 'No. Nessuna quota di adesione e nessuna durata minima: una partnership dura perché funziona, non perché un contratto lo impone.' },
      ],
    },
    final: { title: 'Parliamo di una partnership.', text: 'Crei il suo spazio o ci scriva direttamente: ci prendiamo il tempo di conoscerci.', cta: 'Diventare partner', write: 'Scrivere al team' },
  },
};
