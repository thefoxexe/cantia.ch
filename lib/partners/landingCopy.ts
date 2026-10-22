import type { PartnersLocale } from './copy';

// partners.cantia.ch landing (October 2026): a partnership first. The hero
// shows what partners and Cantia do together for a client, and the partner
// space as it is (without amounts); how partners are paid is said plainly,
// lower on the page. No label, no "official partner", no empty logo wall.
// Facts used here are the rules of partners_config (payout from CHF 30,
// terms agreed with each partner) and the benefits of the partner space
// (lib/partners/appCopy.ts).
export const CONTACT_EMAIL = 'info@cantia.ch';

type Item = { title: string; text: string };

export type LandingCopy = {
  meta: { title: string; description: string };
  hero: { eyebrow: string; title: string; text: string; cta: string; secondary: string; note: string };
  space: {
    example: string;
    hello: string;
    firm: string;
    tabs: string[];
    linkTitle: string;
    code: string;
    copy: string;
    kit: string;
    teamTitle: string;
    team: string[];
    clientsTitle: string;
    clients: [string, string, string][];
    clientsNote: string;
  };
  together: { eyebrow: string; title: string; text: string; you: { title: string; items: string[] }; client: { title: string; text: string }; us: { title: string; items: string[] } };
  honest: { eyebrow: string; title: string; text: string; facts: { k: string; v: string }[] };
  products: { eyebrow: string; title: string; items: { name: string; who: string; text: string; points: string[] }[] };
  pillars: { eyebrow: string; title: string; items: Item[] };
  profiles: { eyebrow: string; title: string; text: string; items: Item[] };
  process: { eyebrow: string; title: string; items: Item[] };
  money: { eyebrow: string; title: string; text: string; facts: string[] };
  wall: { eyebrow: string; title: string };
  faq: { eyebrow: string; title: string; items: { q: string; a: string }[] };
  final: { title: string; text: string; cta: string; write: string };
};

export const LANDING_COPY: Record<PartnersLocale, LandingCopy> = {
  fr: {
    meta: {
      title: 'Cantia Partners · Accompagnons ensemble les entreprises suisses',
      description: 'Fiduciaires, revendeurs, fournisseurs et consultants : accompagnez vos clients avec Cantia, aux côtés de notre équipe. Démonstrations faites ensemble, ligne directe, conditions fixées avec vous.',
    },
    hero: {
      eyebrow: 'Programme partenaires · Suisse',
      title: 'Accompagnons ensemble\nles entreprises suisses.',
      text: 'Vous êtes la personne à qui vos clients demandent conseil. Nous faisons le logiciel qui leur fait gagner du temps. Ensemble, on les aide à mieux s’organiser : vous connaissez leur métier, nous nous occupons de la mise en route et de leurs questions.',
      cta: 'Devenir partenaire',
      secondary: 'Écrire à l’équipe',
      note: 'Gratuit · Sans engagement · Un programme construit avec vous',
    },
    space: {
      example: 'Exemple',
      hello: 'Bonjour Claire',
      firm: 'Rossier & Associés · Fiduciaire, Sion',
      tabs: ['Vue d’ensemble', 'Clients', 'Ressources', 'Profil'],
      linkTitle: 'Votre lien',
      code: 'ROSSIER',
      copy: 'Copier',
      kit: 'Kit de présentation',
      teamTitle: 'Avec l’équipe Cantia',
      team: ['Démonstration pour vos clients, faite ensemble', 'Supports de présentation sur demande', 'Accès anticipé aux nouveautés'],
      clientsTitle: 'Clients accompagnés',
      clients: [
        ['CNT-1042', 'Équipe', 'Actif'],
        ['CNT-1038', 'Essentiel', 'Actif'],
        ['CNT-1031', 'Équipe', 'Essai gratuit'],
      ],
      clientsNote: 'Références anonymes : leurs données restent les leurs.',
    },
    together: {
      eyebrow: 'Comment on travaille ensemble',
      title: 'Vous connaissez vos clients.\nNous connaissons le logiciel.',
      text: 'Un partenariat, ce sont deux métiers qui se complètent autour d’une même entreprise.',
      you: {
        title: 'Vous',
        items: ['Vous connaissez le métier et les besoins de vos clients', 'Vous repérez ceux à qui Cantia ferait gagner du temps', 'Vous présentez Cantia avec vos mots, ou avec notre kit'],
      },
      client: { title: 'Votre client', text: 'Mieux organisé, des factures propres, des chiffres à jour. Et deux interlocuteurs qui se parlent.' },
      us: {
        title: 'Cantia',
        items: ['Nous faisons la démonstration avec vous, si vous le souhaitez', 'Nous aidons votre client à démarrer et répondons à ses questions', 'Nous vous montrons les nouveautés avant tout le monde'],
      },
    },
    honest: {
      eyebrow: 'Où nous en sommes',
      title: 'Un partenariat\nqui commence avec vous.',
      text: 'Cantia est une jeune entreprise suisse. Nous n’avons pas encore de réseau de partenaires à vous montrer, et nous ne ferons pas semblant. Ce que nous avons : un logiciel en production, hébergé en Suisse, et l’envie de construire ce programme avec les premières personnes qui y croient. Les premiers partenaires parlent directement à l’équipe et pèsent sur ce que nous développons.',
      facts: [
        { k: 'Hébergement', v: 'Zurich, Suisse' },
        { k: 'Langues', v: 'Français · Deutsch · Italiano' },
        { k: 'Frais pour vous', v: 'Aucun' },
        { k: 'Engagement', v: 'Aucun, vous arrêtez quand vous voulez' },
      ],
    },
    products: {
      eyebrow: 'Ce que vous recommandez',
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
    pillars: {
      eyebrow: 'Ce que le partenariat vous apporte',
      title: 'Plus qu’un lien : une équipe à vos côtés.',
      items: [
        { title: 'Une ligne directe', text: 'Vous parlez à l’équipe qui fait Cantia. Vos questions et celles de vos clients arrivent chez les bonnes personnes.' },
        { title: 'Des démos faites ensemble', text: 'Pour un client qui hésite, nous présentons Cantia avec vous, sur ses vrais cas.' },
        { title: 'Votre avis compte', text: 'Vos retours et ceux de vos clients pèsent sur ce que nous développons ensuite.' },
        { title: 'Des clients protégés', text: 'Vous ne voyez jamais leurs données, leurs devis ou leurs chiffres. Ils restent vos clients.' },
      ],
    },
    profiles: {
      eyebrow: 'Pour qui',
      title: 'Les personnes à qui les entreprises demandent conseil.',
      text: 'Le programme est ouvert aux professionnels établis en Suisse.',
      items: [
        { title: 'Fiduciaires', text: 'Des clients organisés, des factures QR propres et des chiffres fiables au bouclement, partagés avec vous.' },
        { title: 'Revendeurs et intégrateurs', text: 'Une solution suisse complète à proposer quand une PME se digitalise.' },
        { title: 'Fournisseurs et négoces', text: 'Un service utile à vos clients artisans, au-delà du matériau.' },
        { title: 'Consultants et associations', text: 'Un outil à recommander à vos membres et à vos mandants, avec l’équipe Cantia en appui.' },
      ],
    },
    process: {
      eyebrow: 'Comment ça commence',
      title: 'Quatre étapes, à votre rythme.',
      items: [
        { title: 'Inscription', text: 'Vous créez votre espace en deux minutes. Votre lien est actif tout de suite.' },
        { title: 'Rencontre', text: 'Nous faisons connaissance : votre activité, vos clients, la façon dont vous voulez présenter Cantia.' },
        { title: 'Accord', text: 'Nous fixons ensemble le cadre du partenariat. Il apparaît dans votre espace.' },
        { title: 'Premiers clients', text: 'Kit de présentation, code QR imprimable et, si vous le souhaitez, une première démo faite ensemble.' },
      ],
    },
    money: {
      eyebrow: 'Et la rémunération ?',
      title: 'Votre travail est rémunéré, simplement.',
      text: 'Chaque entreprise qui choisit Cantia grâce à vous vous est rattachée. Les conditions sont fixées avec vous lors de la rencontre, puis écrites dans votre espace.',
      facts: ['Conditions fixées ensemble', 'Versement chaque mois, dès CHF 30', 'Aucun frais, aucun engagement'],
    },
    wall: { eyebrow: 'Partenaires', title: 'Ils accompagnent leurs clients avec Cantia.' },
    faq: {
      eyebrow: 'Questions fréquentes',
      title: 'Ce qu’il faut savoir',
      items: [
        { q: 'Comment se passe une démo faite ensemble ?', a: 'Vous nous écrivez avec le nom du client et ce qu’il cherche. Nous préparons la présentation sur ses vrais cas et la faisons avec vous.' },
        { q: 'Qu’est-ce que je vois de mes clients ?', a: 'Une référence anonyme, le plan et le statut. Jamais leurs données, leurs devis ou leurs chantiers.' },
        { q: 'Puis-je recommander Cantia avant notre rencontre ?', a: 'Oui. Votre lien est actif dès l’inscription. Les clients apportés avant l’accord vous sont rattachés.' },
        { q: 'Combien de temps mon lien compte-t-il ?', a: 'Un clic est retenu 90 jours : si l’entreprise s’inscrit dans ce délai, elle vous est rattachée. Une même entreprise n’est comptée qu’une fois.' },
        { q: 'Comment ma rémunération est-elle définie ?', a: 'Lors de notre rencontre, selon votre rôle auprès des clients et l’accompagnement que vous apportez. Le cadre convenu s’affiche ensuite dans votre espace, et les versements ont lieu chaque mois dès CHF 30.' },
        { q: 'Y a-t-il des frais ou un engagement ?', a: 'Aucun. Le programme est gratuit et vous pouvez arrêter à tout moment.' },
      ],
    },
    final: { title: 'Parlons de vos clients.', text: 'Créez votre espace ou écrivez-nous : nous prenons le temps de faire connaissance.', cta: 'Devenir partenaire', write: 'Écrire à l’équipe' },
  },
  de: {
    meta: {
      title: 'Cantia Partners · Begleiten wir gemeinsam Schweizer Unternehmen',
      description: 'Treuhänder, Wiederverkäufer, Lieferanten und Berater: Begleiten Sie Ihre Kunden mit Cantia, an der Seite unseres Teams. Gemeinsame Demos, direkter Draht, mit Ihnen festgelegte Konditionen.',
    },
    hero: {
      eyebrow: 'Partnerprogramm · Schweiz',
      title: 'Begleiten wir gemeinsam\nSchweizer Unternehmen.',
      text: 'Sie sind die Person, die Ihre Kunden um Rat fragen. Wir bauen die Software, die ihnen Zeit spart. Gemeinsam helfen wir ihnen, sich besser zu organisieren: Sie kennen ihr Geschäft, wir kümmern uns um den Start und um ihre Fragen.',
      cta: 'Partner werden',
      secondary: 'Dem Team schreiben',
      note: 'Kostenlos · Unverbindlich · Ein Programm, das wir mit Ihnen aufbauen',
    },
    space: {
      example: 'Beispiel',
      hello: 'Guten Tag, Claire',
      firm: 'Rossier & Partner · Treuhand, Sitten',
      tabs: ['Übersicht', 'Kunden', 'Ressourcen', 'Profil'],
      linkTitle: 'Ihr Link',
      code: 'ROSSIER',
      copy: 'Kopieren',
      kit: 'Präsentationskit',
      teamTitle: 'Mit dem Cantia-Team',
      team: ['Demo für Ihre Kunden, gemeinsam durchgeführt', 'Präsentationsunterlagen auf Anfrage', 'Früher Zugang zu Neuerungen'],
      clientsTitle: 'Begleitete Kunden',
      clients: [
        ['CNT-1042', 'Team', 'Aktiv'],
        ['CNT-1038', 'Basis', 'Aktiv'],
        ['CNT-1031', 'Team', 'Gratis-Test'],
      ],
      clientsNote: 'Anonyme Referenzen: Ihre Daten bleiben ihre Daten.',
    },
    together: {
      eyebrow: 'So arbeiten wir zusammen',
      title: 'Sie kennen Ihre Kunden.\nWir kennen die Software.',
      text: 'Eine Partnerschaft sind zwei Berufe, die sich rund um dasselbe Unternehmen ergänzen.',
      you: {
        title: 'Sie',
        items: ['Sie kennen das Geschäft und die Bedürfnisse Ihrer Kunden', 'Sie erkennen, wem Cantia Zeit sparen würde', 'Sie stellen Cantia mit Ihren Worten vor, oder mit unserem Kit'],
      },
      client: { title: 'Ihr Kunde', text: 'Besser organisiert, saubere Rechnungen, aktuelle Zahlen. Und zwei Ansprechpartner, die miteinander reden.' },
      us: {
        title: 'Cantia',
        items: ['Wir machen die Demo mit Ihnen, wenn Sie möchten', 'Wir helfen Ihrem Kunden beim Start und beantworten seine Fragen', 'Wir zeigen Ihnen Neuerungen vor allen anderen'],
      },
    },
    honest: {
      eyebrow: 'Wo wir stehen',
      title: 'Eine Partnerschaft,\ndie mit Ihnen beginnt.',
      text: 'Cantia ist ein junges Schweizer Unternehmen. Wir haben noch kein Partnernetzwerk, das wir Ihnen zeigen könnten, und wir tun nicht so. Was wir haben: eine Software im Produktivbetrieb, in der Schweiz gehostet, und den Willen, dieses Programm mit den ersten Menschen aufzubauen, die daran glauben. Die ersten Partner sprechen direkt mit dem Team und beeinflussen, was wir entwickeln.',
      facts: [
        { k: 'Hosting', v: 'Zürich, Schweiz' },
        { k: 'Sprachen', v: 'Français · Deutsch · Italiano' },
        { k: 'Kosten für Sie', v: 'Keine' },
        { k: 'Verpflichtung', v: 'Keine, Sie hören auf, wann Sie wollen' },
      ],
    },
    products: {
      eyebrow: 'Was Sie empfehlen',
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
    pillars: {
      eyebrow: 'Was Ihnen die Partnerschaft bringt',
      title: 'Mehr als ein Link: ein Team an Ihrer Seite.',
      items: [
        { title: 'Ein direkter Draht', text: 'Sie sprechen mit dem Team, das Cantia baut. Ihre Fragen und die Ihrer Kunden landen bei den richtigen Personen.' },
        { title: 'Gemeinsame Demos', text: 'Für einen Kunden, der zögert, stellen wir Cantia mit Ihnen vor, an seinen echten Fällen.' },
        { title: 'Ihre Meinung zählt', text: 'Ihre Rückmeldungen und die Ihrer Kunden beeinflussen, was wir als Nächstes entwickeln.' },
        { title: 'Geschützte Kunden', text: 'Sie sehen nie ihre Daten, Offerten oder Zahlen. Sie bleiben Ihre Kunden.' },
      ],
    },
    profiles: {
      eyebrow: 'Für wen',
      title: 'Die Menschen, die Unternehmen um Rat fragen.',
      text: 'Das Programm steht in der Schweiz ansässigen Fachleuten offen.',
      items: [
        { title: 'Treuhänder', text: 'Organisierte Kunden, saubere QR-Rechnungen und verlässliche Zahlen beim Abschluss, mit Ihnen geteilt.' },
        { title: 'Wiederverkäufer und Integratoren', text: 'Eine vollständige Schweizer Lösung, wenn ein KMU digitalisiert.' },
        { title: 'Lieferanten und Handel', text: 'Ein nützlicher Service für Ihre Handwerkskunden, über das Material hinaus.' },
        { title: 'Berater und Verbände', text: 'Ein Werkzeug für Ihre Mitglieder und Mandanten, mit dem Cantia-Team im Rücken.' },
      ],
    },
    process: {
      eyebrow: 'Wie es beginnt',
      title: 'Vier Schritte, in Ihrem Tempo.',
      items: [
        { title: 'Anmeldung', text: 'Sie erstellen Ihren Bereich in zwei Minuten. Ihr Link ist sofort aktiv.' },
        { title: 'Kennenlernen', text: 'Wir lernen uns kennen: Ihre Tätigkeit, Ihre Kunden und wie Sie Cantia vorstellen möchten.' },
        { title: 'Vereinbarung', text: 'Wir legen den Rahmen der Partnerschaft gemeinsam fest. Er erscheint in Ihrem Bereich.' },
        { title: 'Erste Kunden', text: 'Präsentationskit, druckbarer QR-Code und auf Wunsch eine erste gemeinsame Demo.' },
      ],
    },
    money: {
      eyebrow: 'Und die Vergütung?',
      title: 'Ihre Arbeit wird vergütet, ganz einfach.',
      text: 'Jedes Unternehmen, das sich dank Ihnen für Cantia entscheidet, wird Ihnen zugeordnet. Die Konditionen legen wir beim Kennenlernen mit Ihnen fest, danach stehen sie in Ihrem Bereich.',
      facts: ['Gemeinsam festgelegte Konditionen', 'Auszahlung jeden Monat, ab CHF 30', 'Keine Kosten, keine Verpflichtung'],
    },
    wall: { eyebrow: 'Partner', title: 'Sie begleiten ihre Kunden mit Cantia.' },
    faq: {
      eyebrow: 'Häufige Fragen',
      title: 'Was Sie wissen sollten',
      items: [
        { q: 'Wie läuft eine gemeinsame Demo ab?', a: 'Sie schreiben uns den Namen des Kunden und was er sucht. Wir bereiten die Präsentation an seinen echten Fällen vor und machen sie mit Ihnen.' },
        { q: 'Was sehe ich von meinen Kunden?', a: 'Eine anonyme Referenz, das Abo und den Status. Nie ihre Daten, Offerten oder Baustellen.' },
        { q: 'Kann ich Cantia vor unserem Kennenlernen empfehlen?', a: 'Ja. Ihr Link ist ab der Anmeldung aktiv. Vorher vermittelte Kunden werden Ihnen zugeordnet.' },
        { q: 'Wie lange zählt mein Link?', a: 'Ein Klick wird 90 Tage gespeichert: Meldet sich das Unternehmen in dieser Frist an, wird es Ihnen zugeordnet. Dasselbe Unternehmen zählt nur einmal.' },
        { q: 'Wie wird meine Vergütung festgelegt?', a: 'Beim Kennenlernen, je nach Ihrer Rolle bei den Kunden und Ihrer Begleitung. Der vereinbarte Rahmen erscheint danach in Ihrem Bereich, Auszahlungen erfolgen monatlich ab CHF 30.' },
        { q: 'Gibt es Kosten oder eine Verpflichtung?', a: 'Nein. Das Programm ist kostenlos und Sie können jederzeit aufhören.' },
      ],
    },
    final: { title: 'Sprechen wir über Ihre Kunden.', text: 'Erstellen Sie Ihren Bereich oder schreiben Sie uns: Wir nehmen uns Zeit, Sie kennenzulernen.', cta: 'Partner werden', write: 'Dem Team schreiben' },
  },
  it: {
    meta: {
      title: 'Cantia Partners · Accompagniamo insieme le imprese svizzere',
      description: 'Fiduciari, rivenditori, fornitori e consulenti: accompagni i suoi clienti con Cantia, al fianco del nostro team. Demo fatte insieme, linea diretta, condizioni fissate con lei.',
    },
    hero: {
      eyebrow: 'Programma partner · Svizzera',
      title: 'Accompagniamo insieme\nle imprese svizzere.',
      text: 'Lei è la persona a cui i suoi clienti chiedono consiglio. Noi facciamo il software che fa loro risparmiare tempo. Insieme li aiutiamo a organizzarsi meglio: lei conosce il loro mestiere, noi ci occupiamo dell’avvio e delle loro domande.',
      cta: 'Diventare partner',
      secondary: 'Scrivere al team',
      note: 'Gratuito · Senza impegno · Un programma costruito con lei',
    },
    space: {
      example: 'Esempio',
      hello: 'Buongiorno Claire',
      firm: 'Rossier & Associati · Fiduciaria, Sion',
      tabs: ['Panoramica', 'Clienti', 'Risorse', 'Profilo'],
      linkTitle: 'Il suo link',
      code: 'ROSSIER',
      copy: 'Copiare',
      kit: 'Kit di presentazione',
      teamTitle: 'Con il team Cantia',
      team: ['Demo per i suoi clienti, fatta insieme', 'Materiale di presentazione su richiesta', 'Accesso anticipato alle novità'],
      clientsTitle: 'Clienti accompagnati',
      clients: [
        ['CNT-1042', 'Team', 'Attivo'],
        ['CNT-1038', 'Essenziale', 'Attivo'],
        ['CNT-1031', 'Team', 'Prova gratuita'],
      ],
      clientsNote: 'Riferimenti anonimi: i loro dati restano loro.',
    },
    together: {
      eyebrow: 'Come lavoriamo insieme',
      title: 'Lei conosce i suoi clienti.\nNoi conosciamo il software.',
      text: 'Una partnership sono due mestieri che si completano attorno alla stessa impresa.',
      you: {
        title: 'Lei',
        items: ['Conosce il mestiere e i bisogni dei suoi clienti', 'Individua quelli a cui Cantia farebbe risparmiare tempo', 'Presenta Cantia con le sue parole, o con il nostro kit'],
      },
      client: { title: 'Il suo cliente', text: 'Meglio organizzato, fatture pulite, cifre aggiornate. E due interlocutori che si parlano.' },
      us: {
        title: 'Cantia',
        items: ['Facciamo la demo con lei, se lo desidera', 'Aiutiamo il suo cliente ad avviarsi e rispondiamo alle sue domande', 'Le mostriamo le novità prima di tutti'],
      },
    },
    honest: {
      eyebrow: 'A che punto siamo',
      title: 'Una partnership\nche comincia con lei.',
      text: 'Cantia è una giovane impresa svizzera. Non abbiamo ancora una rete di partner da mostrarle, e non faremo finta di averla. Quello che abbiamo: un software in produzione, ospitato in Svizzera, e la voglia di costruire questo programma con le prime persone che ci credono. I primi partner parlano direttamente con il team e influiscono su ciò che sviluppiamo.',
      facts: [
        { k: 'Hosting', v: 'Zurigo, Svizzera' },
        { k: 'Lingue', v: 'Français · Deutsch · Italiano' },
        { k: 'Costi per lei', v: 'Nessuno' },
        { k: 'Impegno', v: 'Nessuno, smette quando vuole' },
      ],
    },
    products: {
      eyebrow: 'Cosa raccomanda',
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
    pillars: {
      eyebrow: 'Cosa le porta la partnership',
      title: 'Più di un link: un team al suo fianco.',
      items: [
        { title: 'Una linea diretta', text: 'Parla con il team che fa Cantia. Le sue domande e quelle dei suoi clienti arrivano alle persone giuste.' },
        { title: 'Demo fatte insieme', text: 'Per un cliente che esita, presentiamo Cantia con lei, sui suoi casi reali.' },
        { title: 'Il suo parere conta', text: 'I suoi riscontri e quelli dei suoi clienti pesano su ciò che sviluppiamo.' },
        { title: 'Clienti protetti', text: 'Non vede mai i loro dati, preventivi o cifre. Restano suoi clienti.' },
      ],
    },
    profiles: {
      eyebrow: 'Per chi',
      title: 'Le persone a cui le imprese chiedono consiglio.',
      text: 'Il programma è aperto ai professionisti con sede in Svizzera.',
      items: [
        { title: 'Fiduciari', text: 'Clienti organizzati, fatture QR pulite e cifre affidabili alla chiusura, condivise con lei.' },
        { title: 'Rivenditori e integratori', text: 'Una soluzione svizzera completa da proporre quando una PMI si digitalizza.' },
        { title: 'Fornitori e commercio', text: 'Un servizio utile ai suoi clienti artigiani, oltre il materiale.' },
        { title: 'Consulenti e associazioni', text: 'Uno strumento da raccomandare a membri e mandanti, con il team Cantia al suo fianco.' },
      ],
    },
    process: {
      eyebrow: 'Come si comincia',
      title: 'Quattro tappe, al suo ritmo.',
      items: [
        { title: 'Iscrizione', text: 'Crea il suo spazio in due minuti. Il suo link è subito attivo.' },
        { title: 'Incontro', text: 'Ci conosciamo: la sua attività, i suoi clienti, il modo in cui vuole presentare Cantia.' },
        { title: 'Accordo', text: 'Fissiamo insieme il quadro della partnership. Appare nel suo spazio.' },
        { title: 'Primi clienti', text: 'Kit di presentazione, codice QR stampabile e, se lo desidera, una prima demo fatta insieme.' },
      ],
    },
    money: {
      eyebrow: 'E la remunerazione?',
      title: 'Il suo lavoro è remunerato, semplicemente.',
      text: 'Ogni impresa che sceglie Cantia grazie a lei le viene collegata. Le condizioni sono fissate con lei durante l’incontro, poi scritte nel suo spazio.',
      facts: ['Condizioni fissate insieme', 'Versamento ogni mese, da CHF 30', 'Nessun costo, nessun impegno'],
    },
    wall: { eyebrow: 'Partner', title: 'Accompagnano i loro clienti con Cantia.' },
    faq: {
      eyebrow: 'Domande frequenti',
      title: 'Cosa sapere',
      items: [
        { q: 'Come si svolge una demo fatta insieme?', a: 'Ci scrive il nome del cliente e cosa cerca. Prepariamo la presentazione sui suoi casi reali e la facciamo con lei.' },
        { q: 'Cosa vedo dei miei clienti?', a: 'Un riferimento anonimo, il piano e lo stato. Mai i loro dati, preventivi o cantieri.' },
        { q: 'Posso raccomandare Cantia prima del nostro incontro?', a: 'Sì. Il suo link è attivo dall’iscrizione. I clienti portati prima dell’accordo le sono collegati.' },
        { q: 'Per quanto tempo vale il mio link?', a: 'Un clic è conservato 90 giorni: se l’impresa si iscrive entro questo termine, le viene collegata. La stessa impresa conta una sola volta.' },
        { q: 'Come viene definita la mia remunerazione?', a: 'Durante il nostro incontro, secondo il suo ruolo con i clienti e l’accompagnamento che offre. Il quadro concordato appare poi nel suo spazio, e i versamenti avvengono ogni mese da CHF 30.' },
        { q: 'Ci sono costi o impegni?', a: 'Nessuno. Il programma è gratuito e può smettere in qualsiasi momento.' },
      ],
    },
    final: { title: 'Parliamo dei suoi clienti.', text: 'Crei il suo spazio o ci scriva: ci prendiamo il tempo di conoscerci.', cta: 'Diventare partner', write: 'Scrivere al team' },
  },
};
