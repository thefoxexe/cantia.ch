import type { PartnersLocale } from './copy';

// partners.cantia.ch landing (October 2026, honest version): the programme
// is starting, so the page says so. No label, no "official partner", no
// empty logo wall. What it shows is true and checkable: how a
// recommendation is followed (the rules of partners_config: link kept
// 90 days, commission available 30 days after payment, payout from CHF 30,
// rate and duration agreed with each partner), what the partner recommends
// and what they see.
export const CONTACT_EMAIL = 'info@cantia.ch';

type Item = { title: string; text: string };

export type LandingCopy = {
  meta: { title: string; description: string };
  hero: { eyebrow: string; title: string; text: string; cta: string; secondary: string; note: string };
  trace: { label: string; example: string; linkLabel: string; code: string; steps: { when: string; title: string; text: string }[]; foot: string };
  honest: { eyebrow: string; title: string; text: string; facts: { k: string; v: string }[] };
  products: { eyebrow: string; title: string; items: { name: string; who: string; text: string; points: string[] }[] };
  pillars: { eyebrow: string; title: string; items: Item[] };
  profiles: { eyebrow: string; title: string; text: string; items: Item[] };
  process: { eyebrow: string; title: string; items: Item[] };
  wall: { eyebrow: string; title: string };
  faq: { eyebrow: string; title: string; items: { q: string; a: string }[] };
  final: { title: string; text: string; cta: string; write: string };
};

export const LANDING_COPY: Record<PartnersLocale, LandingCopy> = {
  fr: {
    meta: {
      title: 'Cantia Partners · Recommandez Cantia à vos clients',
      description: 'Fiduciaires, revendeurs, fournisseurs et consultants : recommandez Cantia aux entreprises que vous accompagnez. Un lien, un suivi transparent et des conditions fixées avec vous.',
    },
    hero: {
      eyebrow: 'Programme partenaires · Suisse',
      title: 'Vous conseillez des entreprises.\nRecommandez-leur Cantia.',
      text: 'Fiduciaire, revendeur, fournisseur ou consultant : si Cantia fait gagner du temps à vos clients, recommandez-le avec votre lien. Chaque entreprise qui s’abonne est rattachée à vous, et vous êtes rémunéré selon des conditions que nous fixons ensemble.',
      cta: 'Créer mon espace partenaire',
      secondary: 'Écrire à l’équipe',
      note: 'Gratuit · Sans engagement · Conditions écrites dans votre espace',
    },
    trace: {
      label: 'Le parcours d’une recommandation',
      example: 'Exemple',
      linkLabel: 'Votre lien et son code QR',
      code: 'VOTRE-CODE',
      steps: [
        { when: 'J 0', title: 'Un client clique sur votre lien', text: 'Ou scanne votre code QR. Le clic est retenu 90 jours.' },
        { when: 'J 3', title: 'Il crée son entreprise sur Cantia', text: 'Elle vous est rattachée sous une référence anonyme, ici CNT-1042.' },
        { when: 'J 17', title: 'Il paie son abonnement', text: 'Votre commission est calculée au taux convenu avec vous.' },
        { when: 'J 47', title: 'La commission devient disponible', text: '30 jours après le paiement, une fois le délai de remboursement passé.' },
        { when: 'Le 5', title: 'Versement sur votre compte', text: 'Chaque mois, par virement, dès CHF 30 disponibles.' },
      ],
      foot: 'Chaque étape s’affiche dans votre espace, au moment où elle se produit.',
    },
    honest: {
      eyebrow: 'Où nous en sommes',
      title: 'Le programme démarre.\nVous seriez parmi les premiers.',
      text: 'Cantia est une jeune entreprise suisse. Nous n’avons pas encore de réseau de partenaires à vous montrer, et nous ne ferons pas semblant. Ce que nous avons : un logiciel en production, hébergé en Suisse, et l’envie de construire ce programme avec les premières personnes qui y croient. Les premiers partenaires fixent leurs conditions avec nous, parlent directement à l’équipe et pèsent sur ce que nous développons.',
      facts: [
        { k: 'Hébergement', v: 'Zurich, Suisse' },
        { k: 'Langues', v: 'Français · Deutsch · Italiano' },
        { k: 'Frais pour vous', v: 'Aucun' },
        { k: 'Vos conditions', v: 'Fixées ensemble, écrites dans votre espace' },
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
      eyebrow: 'Ce que vous obtenez',
      title: 'Un partenariat, pas un lien d’affiliation.',
      items: [
        { title: 'Des conditions fixées avec vous', text: 'Taux et durée définis lors d’un entretien, selon votre rôle auprès des clients. Ils s’appliquent aussi aux clients déjà apportés.' },
        { title: 'Un espace de suivi', text: 'Votre lien, votre code QR, vos clients sous référence anonyme, vos commissions et vos versements, à jour en permanence.' },
        { title: 'Une ligne directe', text: 'Vous parlez à l’équipe qui fait Cantia : démonstrations avec vos clients, questions, retours sur le produit.' },
        { title: 'Des clients protégés', text: 'Vous ne voyez jamais leurs données, leurs devis ou leurs chiffres. Ils ne voient pas vos conditions.' },
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
      eyebrow: 'Comment ça se passe',
      title: 'Quatre étapes, à votre rythme.',
      items: [
        { title: 'Inscription', text: 'Vous créez votre espace en deux minutes. Votre lien est actif tout de suite.' },
        { title: 'Entretien', text: 'Nous parlons de votre activité, de vos clients et de la façon dont vous présentez Cantia.' },
        { title: 'Conditions', text: 'Nous fixons ensemble taux et durée. Ils apparaissent dans votre espace.' },
        { title: 'Lancement', text: 'Kit de présentation, code QR imprimable et, si vous le souhaitez, une première démo faite ensemble.' },
      ],
    },
    wall: { eyebrow: 'Partenaires', title: 'Ils recommandent Cantia.' },
    faq: {
      eyebrow: 'Questions fréquentes',
      title: 'Ce qu’il faut savoir',
      items: [
        { q: 'Comment ma rémunération est-elle définie ?', a: 'Lors d’un entretien avec l’équipe Cantia, selon votre rôle auprès des clients et l’accompagnement que vous apportez. Le taux et la durée convenus s’affichent ensuite dans votre espace.' },
        { q: 'Puis-je recommander Cantia avant l’entretien ?', a: 'Oui. Votre lien est actif dès l’inscription. Les clients apportés avant l’accord vous sont rattachés et rémunérés au taux convenu.' },
        { q: 'Quand suis-je payé ?', a: 'Une fois par mois, par virement, dès CHF 30 de commissions disponibles. Une commission devient disponible 30 jours après le paiement du client.' },
        { q: 'Combien de temps mon lien compte-t-il ?', a: 'Un clic est retenu 90 jours : si l’entreprise s’inscrit dans ce délai, elle vous est rattachée. Une même entreprise n’est comptée qu’une fois.' },
        { q: 'Qu’est-ce que je vois de mes clients ?', a: 'Une référence anonyme, le plan, le statut et vos commissions. Jamais leurs données, leurs devis ou leurs chantiers.' },
        { q: 'Y a-t-il des frais ou un engagement ?', a: 'Aucun. Le programme est gratuit et vous pouvez arrêter à tout moment.' },
      ],
    },
    final: { title: 'Parlons de vos clients.', text: 'Créez votre espace : votre lien est actif tout de suite, et nous vous contactons pour fixer vos conditions.', cta: 'Créer mon espace partenaire', write: 'Écrire à l’équipe' },
  },
  de: {
    meta: {
      title: 'Cantia Partners · Empfehlen Sie Cantia Ihren Kunden',
      description: 'Treuhänder, Wiederverkäufer, Lieferanten und Berater: Empfehlen Sie Cantia den Unternehmen, die Sie begleiten. Ein Link, transparente Nachverfolgung und Konditionen, die wir mit Ihnen festlegen.',
    },
    hero: {
      eyebrow: 'Partnerprogramm · Schweiz',
      title: 'Sie beraten Unternehmen.\nEmpfehlen Sie ihnen Cantia.',
      text: 'Treuhänder, Wiederverkäufer, Lieferant oder Berater: Wenn Cantia Ihren Kunden Zeit spart, empfehlen Sie es mit Ihrem Link. Jedes Unternehmen, das ein Abo abschliesst, wird Ihnen zugeordnet, und Sie werden zu Konditionen vergütet, die wir gemeinsam festlegen.',
      cta: 'Partnerbereich erstellen',
      secondary: 'Dem Team schreiben',
      note: 'Kostenlos · Unverbindlich · Konditionen schriftlich in Ihrem Bereich',
    },
    trace: {
      label: 'Der Weg einer Empfehlung',
      example: 'Beispiel',
      linkLabel: 'Ihr Link und QR-Code',
      code: 'IHR-CODE',
      steps: [
        { when: 'Tag 0', title: 'Ein Kunde klickt auf Ihren Link', text: 'Oder scannt Ihren QR-Code. Der Klick wird 90 Tage gespeichert.' },
        { when: 'Tag 3', title: 'Er erstellt sein Unternehmen in Cantia', text: 'Es wird Ihnen unter einer anonymen Referenz zugeordnet, hier CNT-1042.' },
        { when: 'Tag 17', title: 'Er bezahlt sein Abo', text: 'Ihre Provision wird zum vereinbarten Satz berechnet.' },
        { when: 'Tag 47', title: 'Die Provision wird verfügbar', text: '30 Tage nach der Zahlung, nach Ablauf der Rückerstattungsfrist.' },
        { when: 'Am 5.', title: 'Auszahlung auf Ihr Konto', text: 'Jeden Monat per Überweisung, ab CHF 30 verfügbar.' },
      ],
      foot: 'Jeder Schritt erscheint in Ihrem Bereich, sobald er eintritt.',
    },
    honest: {
      eyebrow: 'Wo wir stehen',
      title: 'Das Programm startet.\nSie wären unter den Ersten.',
      text: 'Cantia ist ein junges Schweizer Unternehmen. Wir haben noch kein Partnernetzwerk, das wir Ihnen zeigen könnten, und wir tun nicht so. Was wir haben: eine Software im Produktivbetrieb, in der Schweiz gehostet, und den Willen, dieses Programm mit den ersten Menschen aufzubauen, die daran glauben. Die ersten Partner legen ihre Konditionen mit uns fest, sprechen direkt mit dem Team und beeinflussen, was wir entwickeln.',
      facts: [
        { k: 'Hosting', v: 'Zürich, Schweiz' },
        { k: 'Sprachen', v: 'Français · Deutsch · Italiano' },
        { k: 'Kosten für Sie', v: 'Keine' },
        { k: 'Ihre Konditionen', v: 'Gemeinsam festgelegt, schriftlich in Ihrem Bereich' },
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
      eyebrow: 'Was Sie erhalten',
      title: 'Eine Partnerschaft, kein Affiliate-Link.',
      items: [
        { title: 'Konditionen, mit Ihnen festgelegt', text: 'Satz und Dauer im Gespräch definiert, je nach Ihrer Rolle bei den Kunden. Sie gelten auch für bereits vermittelte Kunden.' },
        { title: 'Ein Bereich zur Nachverfolgung', text: 'Ihr Link, Ihr QR-Code, Ihre Kunden unter anonymer Referenz, Ihre Provisionen und Auszahlungen, jederzeit aktuell.' },
        { title: 'Ein direkter Draht', text: 'Sie sprechen mit dem Team, das Cantia baut: Demos mit Ihren Kunden, Fragen, Rückmeldungen zum Produkt.' },
        { title: 'Geschützte Kunden', text: 'Sie sehen nie ihre Daten, Offerten oder Zahlen. Sie sehen Ihre Konditionen nicht.' },
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
      eyebrow: 'So läuft es ab',
      title: 'Vier Schritte, in Ihrem Tempo.',
      items: [
        { title: 'Anmeldung', text: 'Sie erstellen Ihren Bereich in zwei Minuten. Ihr Link ist sofort aktiv.' },
        { title: 'Gespräch', text: 'Wir sprechen über Ihre Tätigkeit, Ihre Kunden und wie Sie Cantia vorstellen.' },
        { title: 'Konditionen', text: 'Wir legen Satz und Dauer gemeinsam fest. Sie erscheinen in Ihrem Bereich.' },
        { title: 'Start', text: 'Präsentationskit, druckbarer QR-Code und auf Wunsch eine erste gemeinsame Demo.' },
      ],
    },
    wall: { eyebrow: 'Partner', title: 'Sie empfehlen Cantia.' },
    faq: {
      eyebrow: 'Häufige Fragen',
      title: 'Was Sie wissen sollten',
      items: [
        { q: 'Wie wird meine Vergütung festgelegt?', a: 'In einem Gespräch mit dem Cantia-Team, je nach Ihrer Rolle bei den Kunden und Ihrer Begleitung. Satz und Dauer erscheinen danach in Ihrem Bereich.' },
        { q: 'Kann ich Cantia vor dem Gespräch empfehlen?', a: 'Ja. Ihr Link ist ab der Anmeldung aktiv. Vorher vermittelte Kunden werden Ihnen zugeordnet und zum vereinbarten Satz vergütet.' },
        { q: 'Wann werde ich bezahlt?', a: 'Einmal im Monat per Überweisung, ab CHF 30 verfügbarer Provisionen. Eine Provision wird 30 Tage nach der Zahlung des Kunden verfügbar.' },
        { q: 'Wie lange zählt mein Link?', a: 'Ein Klick wird 90 Tage gespeichert: Meldet sich das Unternehmen in dieser Frist an, wird es Ihnen zugeordnet. Dasselbe Unternehmen zählt nur einmal.' },
        { q: 'Was sehe ich von meinen Kunden?', a: 'Eine anonyme Referenz, das Abo, den Status und Ihre Provisionen. Nie ihre Daten, Offerten oder Baustellen.' },
        { q: 'Gibt es Kosten oder eine Verpflichtung?', a: 'Nein. Das Programm ist kostenlos und Sie können jederzeit aufhören.' },
      ],
    },
    final: { title: 'Sprechen wir über Ihre Kunden.', text: 'Erstellen Sie Ihren Bereich: Ihr Link ist sofort aktiv, und wir melden uns, um Ihre Konditionen festzulegen.', cta: 'Partnerbereich erstellen', write: 'Dem Team schreiben' },
  },
  it: {
    meta: {
      title: 'Cantia Partners · Raccomandi Cantia ai suoi clienti',
      description: 'Fiduciari, rivenditori, fornitori e consulenti: raccomandi Cantia alle imprese che accompagna. Un link, un monitoraggio trasparente e condizioni fissate con lei.',
    },
    hero: {
      eyebrow: 'Programma partner · Svizzera',
      title: 'Lei consiglia le imprese.\nRaccomandi loro Cantia.',
      text: 'Fiduciario, rivenditore, fornitore o consulente: se Cantia fa risparmiare tempo ai suoi clienti, lo raccomandi con il suo link. Ogni impresa che si abbona le viene collegata, e lei è remunerato secondo condizioni che fissiamo insieme.',
      cta: 'Creare il mio spazio partner',
      secondary: 'Scrivere al team',
      note: 'Gratuito · Senza impegno · Condizioni scritte nel suo spazio',
    },
    trace: {
      label: 'Il percorso di una raccomandazione',
      example: 'Esempio',
      linkLabel: 'Il suo link e il codice QR',
      code: 'SUO-CODICE',
      steps: [
        { when: 'G 0', title: 'Un cliente clicca sul suo link', text: 'O scansiona il suo codice QR. Il clic è conservato 90 giorni.' },
        { when: 'G 3', title: 'Crea la sua impresa su Cantia', text: 'Le viene collegata con un riferimento anonimo, qui CNT-1042.' },
        { when: 'G 17', title: 'Paga l’abbonamento', text: 'La sua commissione è calcolata al tasso concordato con lei.' },
        { when: 'G 47', title: 'La commissione diventa disponibile', text: '30 giorni dopo il pagamento, trascorso il termine di rimborso.' },
        { when: 'Il 5', title: 'Versamento sul suo conto', text: 'Ogni mese, con bonifico, da CHF 30 disponibili.' },
      ],
      foot: 'Ogni tappa appare nel suo spazio nel momento in cui avviene.',
    },
    honest: {
      eyebrow: 'A che punto siamo',
      title: 'Il programma parte ora.\nSarebbe tra i primi.',
      text: 'Cantia è una giovane impresa svizzera. Non abbiamo ancora una rete di partner da mostrarle, e non faremo finta di averla. Quello che abbiamo: un software in produzione, ospitato in Svizzera, e la voglia di costruire questo programma con le prime persone che ci credono. I primi partner fissano le loro condizioni con noi, parlano direttamente con il team e influiscono su ciò che sviluppiamo.',
      facts: [
        { k: 'Hosting', v: 'Zurigo, Svizzera' },
        { k: 'Lingue', v: 'Français · Deutsch · Italiano' },
        { k: 'Costi per lei', v: 'Nessuno' },
        { k: 'Le sue condizioni', v: 'Fissate insieme, scritte nel suo spazio' },
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
      eyebrow: 'Cosa ottiene',
      title: 'Una partnership, non un link di affiliazione.',
      items: [
        { title: 'Condizioni fissate con lei', text: 'Tasso e durata definiti in un colloquio, secondo il suo ruolo con i clienti. Valgono anche per i clienti già portati.' },
        { title: 'Uno spazio di monitoraggio', text: 'Il suo link, il codice QR, i clienti con riferimento anonimo, commissioni e versamenti, sempre aggiornati.' },
        { title: 'Una linea diretta', text: 'Parla con il team che fa Cantia: demo con i suoi clienti, domande, riscontri sul prodotto.' },
        { title: 'Clienti protetti', text: 'Non vede mai i loro dati, preventivi o cifre. Loro non vedono le sue condizioni.' },
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
      eyebrow: 'Come funziona',
      title: 'Quattro tappe, al suo ritmo.',
      items: [
        { title: 'Iscrizione', text: 'Crea il suo spazio in due minuti. Il suo link è subito attivo.' },
        { title: 'Colloquio', text: 'Parliamo della sua attività, dei suoi clienti e di come presenta Cantia.' },
        { title: 'Condizioni', text: 'Fissiamo insieme tasso e durata. Appaiono nel suo spazio.' },
        { title: 'Lancio', text: 'Kit di presentazione, codice QR stampabile e, se lo desidera, una prima demo fatta insieme.' },
      ],
    },
    wall: { eyebrow: 'Partner', title: 'Raccomandano Cantia.' },
    faq: {
      eyebrow: 'Domande frequenti',
      title: 'Cosa sapere',
      items: [
        { q: 'Come viene definita la mia remunerazione?', a: 'Durante un colloquio con il team Cantia, secondo il suo ruolo con i clienti e l’accompagnamento che offre. Tasso e durata appaiono poi nel suo spazio.' },
        { q: 'Posso raccomandare Cantia prima del colloquio?', a: 'Sì. Il suo link è attivo dall’iscrizione. I clienti portati prima dell’accordo le sono collegati e remunerati al tasso concordato.' },
        { q: 'Quando vengo pagato?', a: 'Una volta al mese, con bonifico, da CHF 30 di commissioni disponibili. Una commissione diventa disponibile 30 giorni dopo il pagamento del cliente.' },
        { q: 'Per quanto tempo vale il mio link?', a: 'Un clic è conservato 90 giorni: se l’impresa si iscrive entro questo termine, le viene collegata. La stessa impresa conta una sola volta.' },
        { q: 'Cosa vedo dei miei clienti?', a: 'Un riferimento anonimo, il piano, lo stato e le sue commissioni. Mai i loro dati, preventivi o cantieri.' },
        { q: 'Ci sono costi o impegni?', a: 'Nessuno. Il programma è gratuito e può smettere in qualsiasi momento.' },
      ],
    },
    final: { title: 'Parliamo dei suoi clienti.', text: 'Crei il suo spazio: il link è subito attivo, e la contattiamo per fissare le sue condizioni.', cta: 'Creare il mio spazio partner', write: 'Scrivere al team' },
  },
};
