import type { PartnersLocale } from './copy';

// partners.cantia.ch landing (October 2026): a business partner programme,
// not an affiliate page. No public commission rate: terms are agreed with
// each partner after a conversation.
export const CONTACT_EMAIL = 'info@cantia.ch';

type LandingCopy = {
  meta: { title: string; description: string };
  hero: { eyebrow: string; title: string; text: string; cta: string; secondary: string; note: string };
  seal: { top: string; bottom: string; caption: string };
  statement: { eyebrow: string; title: string; text: string };
  pillars: { eyebrow: string; title: string; items: { title: string; text: string }[] };
  profiles: { eyebrow: string; title: string; text: string; items: { title: string; text: string }[] };
  process: { eyebrow: string; title: string; items: { title: string; text: string }[] };
  wall: { eyebrow: string; title: string; text: string; yours: string; yoursText: string; visit: string };
  faq: { eyebrow: string; title: string; items: { q: string; a: string }[] };
  final: { title: string; text: string; cta: string; write: string };
};

export const LANDING_COPY: Record<PartnersLocale, LandingCopy> = {
  fr: {
    meta: {
      title: 'Cantia Partners · Le réseau des partenaires de Cantia',
      description: 'Revendeurs, fiduciaires, intégrateurs et fournisseurs : rejoignez le réseau de partenaires de Cantia, le logiciel suisse des entreprises du bâtiment. Conditions définies avec chaque partenaire.',
    },
    hero: {
      eyebrow: 'Programme partenaires · Suisse',
      title: 'Le réseau des partenaires\nqui équipent le bâtiment suisse.',
      text: 'Revendeurs, fiduciaires, intégrateurs et fournisseurs : vous accompagnez les entreprises du bâtiment au quotidien. Cantia vous apporte un logiciel suisse que vos clients adoptent, et un partenariat construit avec vous.',
      cta: 'Déposer ma candidature',
      secondary: 'Prendre contact',
      note: 'Sans frais, sans engagement. Conditions définies lors d’un entretien.',
    },
    seal: { top: 'PARTENAIRE OFFICIEL', bottom: 'CANTIA · SUISSE', caption: 'Le label remis à chaque partenaire, à afficher sur son site et ses documents.' },
    statement: {
      eyebrow: 'Notre approche',
      title: 'Pas de grille publique.\nUn accord avec chaque partenaire.',
      text: 'Un cabinet fiduciaire, un revendeur informatique et un négoce de matériaux n’apportent pas la même chose. Nous définissons vos conditions ensemble, lors d’un entretien : votre rémunération, la durée, l’accompagnement de vos clients et la visibilité que nous vous donnons.',
    },
    pillars: {
      eyebrow: 'Ce que vous obtenez',
      title: 'Un partenariat, pas un lien d’affiliation.',
      items: [
        { title: 'Des conditions sur mesure', text: 'Une rémunération négociée selon votre réseau et votre rôle auprès des clients, versée chaque mois.' },
        { title: 'Un interlocuteur dédié', text: 'Une personne de l’équipe Cantia qui connaît vos clients, répond vite et vous accompagne dans les démonstrations.' },
        { title: 'Votre logo sur notre site', text: 'Les partenaires officiels figurent sur partners.cantia.ch avec leur logo et un lien vers leur site.' },
        { title: 'Un espace de suivi complet', text: 'Votre lien et son code QR, vos clients recommandés, vos commissions et vos versements, en temps réel.' },
      ],
    },
    profiles: {
      eyebrow: 'Avec qui nous travaillons',
      title: 'Des professionnels qui ont la confiance des entreprises.',
      text: 'Le programme est ouvert aux professionnels établis en Suisse.',
      items: [
        { title: 'Revendeurs et intégrateurs', text: 'Proposez une solution suisse complète lors de la digitalisation d’une PME du bâtiment.' },
        { title: 'Fiduciaires', text: 'Des clients organisés, des factures QR propres et des chiffres fiables à la clôture.' },
        { title: 'Fournisseurs et négoces', text: 'Un service à valeur ajoutée pour vos clients artisans, au-delà du matériau.' },
        { title: 'Consultants et associations', text: 'Un outil à recommander à vos membres et à vos mandants, avec un accompagnement Cantia.' },
      ],
    },
    process: {
      eyebrow: 'Comment ça se passe',
      title: 'Quatre étapes, à votre rythme.',
      items: [
        { title: 'Candidature', text: 'Vous créez votre espace en deux minutes. Votre lien personnel est actif immédiatement.' },
        { title: 'Entretien', text: 'Nous échangeons sur votre activité, votre réseau et la façon dont vous souhaitez présenter Cantia.' },
        { title: 'Accord personnalisé', text: 'Nous fixons ensemble vos conditions. Elles apparaissent dans votre espace et s’appliquent aussi aux clients déjà apportés.' },
        { title: 'Lancement', text: 'Kit de présentation, label partenaire et, si vous le souhaitez, votre logo publié sur notre site.' },
      ],
    },
    wall: {
      eyebrow: 'Nos partenaires',
      title: 'Ils accompagnent les entreprises avec Cantia.',
      text: 'Chaque partenaire officiel peut faire figurer son logo ici, avec un lien vers son site.',
      yours: 'Votre logo ici',
      yoursText: 'Rejoignez le réseau',
      visit: 'Visiter le site',
    },
    faq: {
      eyebrow: 'Questions fréquentes',
      title: 'Ce qu’il faut savoir',
      items: [
        { q: 'Comment ma rémunération est-elle définie ?', a: 'Lors d’un entretien avec l’équipe Cantia, selon votre réseau, votre rôle auprès des clients et l’accompagnement que vous apportez. Le taux et la durée convenus s’affichent ensuite dans votre espace.' },
        { q: 'Puis-je recommander Cantia avant l’entretien ?', a: 'Oui. Votre lien est actif dès l’inscription. Les clients apportés avant l’accord sont rattachés à votre compte et rémunérés au taux convenu.' },
        { q: 'Quand suis-je payé ?', a: 'Une fois par mois, par virement, dès CHF 30 de commissions disponibles. Une commission devient disponible 30 jours après le paiement du client.' },
        { q: 'Qu’est-ce que je vois de mes clients ?', a: 'Une référence anonyme, le plan, le statut et vos commissions. Jamais leurs données, leurs devis ou leurs chantiers.' },
        { q: 'Comment mon logo apparaît-il sur ce site ?', a: 'Depuis votre espace, ajoutez votre logo et votre site web. Il est publié après validation par notre équipe.' },
        { q: 'Y a-t-il des frais ?', a: 'Aucun. Le programme est gratuit et sans engagement, vous pouvez arrêter à tout moment.' },
      ],
    },
    final: { title: 'Parlons de votre réseau.', text: 'Déposez votre candidature : nous vous contactons pour un premier échange et définir vos conditions.', cta: 'Déposer ma candidature', write: 'Écrire à l’équipe' },
  },
  de: {
    meta: {
      title: 'Cantia Partners · Das Partnernetzwerk von Cantia',
      description: 'Wiederverkäufer, Treuhänder, Integratoren und Lieferanten: Werden Sie Teil des Partnernetzwerks von Cantia, der Schweizer Software für Bauunternehmen. Konditionen mit jedem Partner vereinbart.',
    },
    hero: {
      eyebrow: 'Partnerprogramm · Schweiz',
      title: 'Das Partnernetzwerk,\ndas den Schweizer Bau ausrüstet.',
      text: 'Wiederverkäufer, Treuhänder, Integratoren und Lieferanten: Sie begleiten Bauunternehmen im Alltag. Cantia bringt Ihnen eine Schweizer Software, die Ihre Kunden gerne nutzen, und eine Partnerschaft, die wir mit Ihnen aufbauen.',
      cta: 'Bewerbung einreichen',
      secondary: 'Kontakt aufnehmen',
      note: 'Kostenlos und unverbindlich. Konditionen werden im Gespräch festgelegt.',
    },
    seal: { top: 'OFFIZIELLER PARTNER', bottom: 'CANTIA · SCHWEIZ', caption: 'Das Label für jeden Partner, für Website und Unterlagen.' },
    statement: {
      eyebrow: 'Unser Ansatz',
      title: 'Kein öffentlicher Tarif.\nEine Vereinbarung mit jedem Partner.',
      text: 'Ein Treuhandbüro, ein IT-Händler und ein Baustoffhandel bringen nicht dasselbe. Wir legen Ihre Konditionen gemeinsam im Gespräch fest: Vergütung, Dauer, Begleitung Ihrer Kunden und die Sichtbarkeit, die wir Ihnen geben.',
    },
    pillars: {
      eyebrow: 'Was Sie erhalten',
      title: 'Eine Partnerschaft, kein Affiliate-Link.',
      items: [
        { title: 'Konditionen nach Mass', text: 'Eine je nach Netzwerk und Rolle ausgehandelte Vergütung, monatlich ausbezahlt.' },
        { title: 'Ein persönlicher Ansprechpartner', text: 'Eine Person im Cantia-Team, die Ihre Kunden kennt, schnell antwortet und Sie bei Demos begleitet.' },
        { title: 'Ihr Logo auf unserer Website', text: 'Offizielle Partner erscheinen auf partners.cantia.ch mit Logo und Link zu ihrer Website.' },
        { title: 'Ein vollständiger Partnerbereich', text: 'Ihr Link und QR-Code, Ihre empfohlenen Kunden, Provisionen und Auszahlungen in Echtzeit.' },
      ],
    },
    profiles: {
      eyebrow: 'Mit wem wir arbeiten',
      title: 'Fachleute, denen Unternehmen vertrauen.',
      text: 'Das Programm steht in der Schweiz ansässigen Fachleuten offen.',
      items: [
        { title: 'Wiederverkäufer und Integratoren', text: 'Bieten Sie bei der Digitalisierung eines Bau-KMU eine vollständige Schweizer Lösung an.' },
        { title: 'Treuhänder', text: 'Organisierte Kunden, saubere QR-Rechnungen und verlässliche Zahlen beim Abschluss.' },
        { title: 'Lieferanten und Handel', text: 'Ein Mehrwert für Ihre Handwerkskunden, über das Material hinaus.' },
        { title: 'Berater und Verbände', text: 'Ein Werkzeug für Ihre Mitglieder und Mandanten, mit Begleitung durch Cantia.' },
      ],
    },
    process: {
      eyebrow: 'So läuft es ab',
      title: 'Vier Schritte, in Ihrem Tempo.',
      items: [
        { title: 'Bewerbung', text: 'Sie erstellen Ihren Bereich in zwei Minuten. Ihr persönlicher Link ist sofort aktiv.' },
        { title: 'Gespräch', text: 'Wir sprechen über Ihre Tätigkeit, Ihr Netzwerk und wie Sie Cantia vorstellen möchten.' },
        { title: 'Persönliche Vereinbarung', text: 'Wir legen Ihre Konditionen gemeinsam fest. Sie erscheinen in Ihrem Bereich und gelten auch für bereits vermittelte Kunden.' },
        { title: 'Start', text: 'Präsentationskit, Partnerlabel und auf Wunsch Ihr Logo auf unserer Website.' },
      ],
    },
    wall: {
      eyebrow: 'Unsere Partner',
      title: 'Sie begleiten Unternehmen mit Cantia.',
      text: 'Jeder offizielle Partner kann hier sein Logo mit einem Link zu seiner Website zeigen.',
      yours: 'Ihr Logo hier',
      yoursText: 'Werden Sie Teil des Netzwerks',
      visit: 'Website besuchen',
    },
    faq: {
      eyebrow: 'Häufige Fragen',
      title: 'Was Sie wissen sollten',
      items: [
        { q: 'Wie wird meine Vergütung festgelegt?', a: 'In einem Gespräch mit dem Cantia-Team, je nach Netzwerk, Rolle bei den Kunden und Begleitung. Satz und Dauer erscheinen danach in Ihrem Bereich.' },
        { q: 'Kann ich Cantia vor dem Gespräch empfehlen?', a: 'Ja. Ihr Link ist ab der Anmeldung aktiv. Vorher vermittelte Kunden werden Ihrem Konto zugeordnet und zum vereinbarten Satz vergütet.' },
        { q: 'Wann werde ich bezahlt?', a: 'Einmal im Monat per Überweisung, ab CHF 30 verfügbarer Provisionen. Eine Provision wird 30 Tage nach der Zahlung des Kunden verfügbar.' },
        { q: 'Was sehe ich von meinen Kunden?', a: 'Eine anonyme Referenz, das Abo, den Status und Ihre Provisionen. Nie ihre Daten, Offerten oder Baustellen.' },
        { q: 'Wie erscheint mein Logo auf dieser Website?', a: 'Fügen Sie in Ihrem Bereich Logo und Website hinzu. Es wird nach Prüfung durch unser Team veröffentlicht.' },
        { q: 'Gibt es Kosten?', a: 'Keine. Das Programm ist kostenlos und unverbindlich, Sie können jederzeit aufhören.' },
      ],
    },
    final: { title: 'Sprechen wir über Ihr Netzwerk.', text: 'Reichen Sie Ihre Bewerbung ein: Wir melden uns für ein erstes Gespräch und legen Ihre Konditionen fest.', cta: 'Bewerbung einreichen', write: 'Dem Team schreiben' },
  },
  it: {
    meta: {
      title: 'Cantia Partners · La rete dei partner di Cantia',
      description: 'Rivenditori, fiduciari, integratori e fornitori: entri nella rete di partner di Cantia, il software svizzero per le imprese edili. Condizioni definite con ogni partner.',
    },
    hero: {
      eyebrow: 'Programma partner · Svizzera',
      title: 'La rete dei partner\nche equipaggiano l’edilizia svizzera.',
      text: 'Rivenditori, fiduciari, integratori e fornitori: accompagnate ogni giorno le imprese edili. Cantia le porta un software svizzero che i suoi clienti adottano, e una partnership costruita con lei.',
      cta: 'Inviare la candidatura',
      secondary: 'Contattarci',
      note: 'Gratuito e senza impegno. Condizioni definite durante un colloquio.',
    },
    seal: { top: 'PARTNER UFFICIALE', bottom: 'CANTIA · SVIZZERA', caption: 'Il label consegnato a ogni partner, da mostrare sul sito e sui documenti.' },
    statement: {
      eyebrow: 'Il nostro approccio',
      title: 'Nessuna tariffa pubblica.\nUn accordo con ogni partner.',
      text: 'Uno studio fiduciario, un rivenditore informatico e un commercio di materiali non portano la stessa cosa. Definiamo insieme le sue condizioni durante un colloquio: remunerazione, durata, accompagnamento dei clienti e visibilità.',
    },
    pillars: {
      eyebrow: 'Cosa ottiene',
      title: 'Una partnership, non un link di affiliazione.',
      items: [
        { title: 'Condizioni su misura', text: 'Una remunerazione negoziata secondo la sua rete e il suo ruolo, versata ogni mese.' },
        { title: 'Un interlocutore dedicato', text: 'Una persona del team Cantia che conosce i suoi clienti, risponde rapidamente e la accompagna nelle demo.' },
        { title: 'Il suo logo sul nostro sito', text: 'I partner ufficiali figurano su partners.cantia.ch con logo e link al loro sito.' },
        { title: 'Uno spazio di monitoraggio completo', text: 'Il suo link e codice QR, i clienti raccomandati, le commissioni e i versamenti in tempo reale.' },
      ],
    },
    profiles: {
      eyebrow: 'Con chi lavoriamo',
      title: 'Professionisti che godono della fiducia delle imprese.',
      text: 'Il programma è aperto ai professionisti con sede in Svizzera.',
      items: [
        { title: 'Rivenditori e integratori', text: 'Proponga una soluzione svizzera completa nella digitalizzazione di una PMI edile.' },
        { title: 'Fiduciari', text: 'Clienti organizzati, fatture QR pulite e cifre affidabili alla chiusura.' },
        { title: 'Fornitori e commercio', text: 'Un servizio in più per i suoi clienti artigiani, oltre il materiale.' },
        { title: 'Consulenti e associazioni', text: 'Uno strumento da raccomandare ai suoi membri e mandanti, con l’accompagnamento di Cantia.' },
      ],
    },
    process: {
      eyebrow: 'Come funziona',
      title: 'Quattro tappe, al suo ritmo.',
      items: [
        { title: 'Candidatura', text: 'Crea il suo spazio in due minuti. Il suo link personale è subito attivo.' },
        { title: 'Colloquio', text: 'Parliamo della sua attività, della sua rete e di come desidera presentare Cantia.' },
        { title: 'Accordo personalizzato', text: 'Fissiamo insieme le sue condizioni. Appaiono nel suo spazio e valgono anche per i clienti già portati.' },
        { title: 'Lancio', text: 'Kit di presentazione, label partner e, se lo desidera, il suo logo pubblicato sul nostro sito.' },
      ],
    },
    wall: {
      eyebrow: 'I nostri partner',
      title: 'Accompagnano le imprese con Cantia.',
      text: 'Ogni partner ufficiale può mostrare qui il suo logo, con un link al suo sito.',
      yours: 'Il suo logo qui',
      yoursText: 'Entri nella rete',
      visit: 'Visitare il sito',
    },
    faq: {
      eyebrow: 'Domande frequenti',
      title: 'Cosa sapere',
      items: [
        { q: 'Come viene definita la mia remunerazione?', a: 'Durante un colloquio con il team Cantia, secondo la sua rete, il suo ruolo con i clienti e l’accompagnamento che offre. Tasso e durata appaiono poi nel suo spazio.' },
        { q: 'Posso raccomandare Cantia prima del colloquio?', a: 'Sì. Il suo link è attivo dall’iscrizione. I clienti portati prima dell’accordo sono collegati al suo conto e remunerati al tasso concordato.' },
        { q: 'Quando vengo pagato?', a: 'Una volta al mese, con bonifico, da CHF 30 di commissioni disponibili. Una commissione diventa disponibile 30 giorni dopo il pagamento del cliente.' },
        { q: 'Cosa vedo dei miei clienti?', a: 'Un riferimento anonimo, il piano, lo stato e le sue commissioni. Mai i loro dati, preventivi o cantieri.' },
        { q: 'Come appare il mio logo su questo sito?', a: 'Dal suo spazio, aggiunga logo e sito web. Viene pubblicato dopo la convalida del nostro team.' },
        { q: 'Ci sono costi?', a: 'Nessuno. Il programma è gratuito e senza impegno, può smettere in qualsiasi momento.' },
      ],
    },
    final: { title: 'Parliamo della sua rete.', text: 'Invii la candidatura: la contattiamo per un primo scambio e per definire le sue condizioni.', cta: 'Inviare la candidatura', write: 'Scrivere al team' },
  },
};
