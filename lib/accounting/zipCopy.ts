// Texts of the accounting.cantia.ch home in the November 2026 identity
// (design hand-off "Cantia_Claude_Code", page accounting.html), FR / DE / IT.
// SEO meta and the longer FAQ stay in lib/accounting/siteCopy.ts.

export type ZipLocale = 'fr' | 'de' | 'it';

export interface AccZipCopy {
  nav: { features: string; clients: string; questions: string };
  hero: { eyebrow: string; plain: string; accent: string; text: string; cta: string; more: string; micro: string; shotAlt: string; shotNote: string };
  trust: string[];
  uses: { eyebrow: string; plain: string; accent: string; text: string; items: [string, string][] };
  clients: { eyebrow: string; plain: string; accent: string; text: string; items: { label: string; title: string; text: string }[]; formatsLabel: string };
  free: { eyebrow: string; plain: string; accent: string; text: string; cta: string; currency: string; note: string };
  faq: { eyebrow: string; title: string; items: { q: string; a: string }[] };
  final: { plain: string; accent: string; text: string; cta: string };
}

const fr: AccZipCopy = {
  nav: { features: 'Fonctionnalités', clients: 'Vos mandants', questions: 'Questions' },
  hero: {
    eyebrow: 'Cantia Accounting · Pour les fiduciaires',
    plain: 'Vos mandants.',
    accent: 'Le même fil.',
    text: 'La comptabilité, les pièces et les échéances de votre cabinet, dans un seul espace. Pour vos mandants sur Cantia comme sur un autre logiciel.',
    cta: 'Créer mon espace gratuitement',
    more: 'Découvrir les fonctions',
    micro: 'Gratuit pour les fiduciaires · Sans carte bancaire',
    shotAlt: 'Vue d’ensemble de l’espace fiduciaire Cantia Accounting',
    shotNote: 'L’espace fiduciaire tel quel · données d’exemple',
  },
  trust: ['Mandants et collaborateurs illimités', 'Hébergé à Zurich', 'FR · DE · IT'],
  uses: {
    eyebrow: 'De la pièce aux comptes annuels',
    plain: 'Le dossier avance.',
    accent: 'Vous gardez le fil.',
    text: 'Six usages pour accompagner le travail du cabinet, tout au long de l’année.',
    items: [
      ['Saisir', 'Écritures et imports Banana, Abacus, Winbiz ou Excel.'],
      ['Contrôler', 'Journal, grand livre, bilan et résultat avec comparaison N-1.'],
      ['Déclarer', 'Préparez le décompte TVA et le fichier destiné au portail de l’AFC.'],
      ['Boucler', 'Contrôlez l’exercice et préparez les comptes annuels.'],
      ['Échanger', 'Le client transmet ses pièces et signe depuis un lien privé.'],
      ['Piloter', 'Travaux, échéances, temps et honoraires du cabinet.'],
    ],
  },
  clients: {
    eyebrow: 'Avec ou sans Cantia',
    plain: 'Votre client garde son outil.',
    accent: 'Vous retrouvez son dossier.',
    text: 'Un accès donné par le mandant, ou une comptabilité reprise depuis son logiciel. Le cabinet travaille dans le même environnement.',
    items: [
      { label: '01 · Mandant sur Cantia', title: 'Les données se rejoignent.', text: 'Accès autorisé par le client, révocable à tout moment.' },
      { label: '02 · Autre logiciel', title: 'Le dossier reste complet.', text: 'Import, saisie, pièces et signatures par lien privé.' },
    ],
    formatsLabel: 'Vos formats habituels',
  },
  free: {
    eyebrow: 'Un espace pour votre cabinet',
    plain: 'Tout votre cabinet.',
    accent: 'Un espace gratuit.',
    text: 'Vos mandants et vos collaborateurs réunis, sans carte bancaire.',
    cta: 'Ouvrir mon espace',
    currency: 'CHF',
    note: 'pour les fiduciaires',
  },
  faq: {
    eyebrow: 'Les réponses utiles',
    title: 'Avant de commencer.',
    items: [
      { q: 'Mes mandants doivent-ils utiliser Cantia ?', a: 'Non. Vous pouvez aussi tenir leurs livres par saisie ou import et échanger par un lien privé.' },
      { q: 'Le décompte est-il transmis automatiquement à l’AFC ?', a: 'Le fichier est préparé pour votre dépôt sur le portail de l’AFC.' },
      { q: 'J’ai déjà un compte Cantia.', a: 'Utilisez les mêmes identifiants pour accéder à votre espace fiduciaire.' },
    ],
  },
  final: { plain: 'Votre cabinet.', accent: 'La suite commence ici.', text: 'Un espace pour retrouver vos dossiers et votre équipe.', cta: 'Créer mon espace gratuitement' },
};

const de: AccZipCopy = {
  nav: { features: 'Funktionen', clients: 'Ihre Mandanten', questions: 'Fragen' },
  hero: {
    eyebrow: 'Cantia Accounting · Für Treuhänder',
    plain: 'Ihre Mandanten.',
    accent: 'Derselbe Faden.',
    text: 'Buchhaltung, Belege und Fristen Ihrer Treuhand in einem einzigen Bereich. Für Mandanten auf Cantia wie für Mandanten mit einer anderen Software.',
    cta: 'Bereich kostenlos erstellen',
    more: 'Funktionen entdecken',
    micro: 'Kostenlos für Treuhänder · Ohne Kreditkarte',
    shotAlt: 'Übersicht des Treuhandbereichs von Cantia Accounting',
    shotNote: 'Der Treuhandbereich, wie er ist · Beispieldaten',
  },
  trust: ['Unbegrenzt Mandanten und Mitarbeitende', 'Gehostet in Zürich', 'FR · DE · IT'],
  uses: {
    eyebrow: 'Vom Beleg zur Jahresrechnung',
    plain: 'Das Dossier kommt voran.',
    accent: 'Sie behalten den Faden.',
    text: 'Sechs Anwendungen, die die Arbeit der Treuhand das ganze Jahr begleiten.',
    items: [
      ['Erfassen', 'Buchungen und Importe aus Banana, Abacus, Winbiz oder Excel.'],
      ['Prüfen', 'Journal, Hauptbuch, Bilanz und Erfolgsrechnung mit Vorjahresvergleich.'],
      ['Abrechnen', 'MWST-Abrechnung und Datei für das ESTV-Portal vorbereiten.'],
      ['Abschliessen', 'Geschäftsjahr prüfen und Jahresrechnung vorbereiten.'],
      ['Austauschen', 'Der Kunde übermittelt Belege und unterzeichnet über einen privaten Link.'],
      ['Steuern', 'Aufträge, Fristen, Zeit und Honorare der Treuhand.'],
    ],
  },
  clients: {
    eyebrow: 'Mit oder ohne Cantia',
    plain: 'Ihr Kunde behält sein Werkzeug.',
    accent: 'Sie finden sein Dossier.',
    text: 'Ein Zugang, den der Mandant erteilt, oder eine Buchhaltung, die aus seiner Software übernommen wird. Die Treuhand arbeitet in derselben Umgebung.',
    items: [
      { label: '01 · Mandant auf Cantia', title: 'Die Daten kommen zusammen.', text: 'Vom Kunden erteilter Zugang, jederzeit widerrufbar.' },
      { label: '02 · Andere Software', title: 'Das Dossier bleibt vollständig.', text: 'Import, Erfassung, Belege und Unterschriften über einen privaten Link.' },
    ],
    formatsLabel: 'Ihre gewohnten Formate',
  },
  free: {
    eyebrow: 'Ein Bereich für Ihre Treuhand',
    plain: 'Ihre ganze Treuhand.',
    accent: 'Ein kostenloser Bereich.',
    text: 'Ihre Mandanten und Mitarbeitenden an einem Ort, ohne Kreditkarte.',
    cta: 'Meinen Bereich öffnen',
    currency: 'CHF',
    note: 'für Treuhänder',
  },
  faq: {
    eyebrow: 'Die wichtigsten Antworten',
    title: 'Bevor Sie beginnen.',
    items: [
      { q: 'Müssen meine Mandanten Cantia verwenden?', a: 'Nein. Sie können ihre Bücher auch per Erfassung oder Import führen und über einen privaten Link austauschen.' },
      { q: 'Wird die Abrechnung automatisch an die ESTV übermittelt?', a: 'Die Datei wird für Ihre Einreichung im ESTV-Portal vorbereitet.' },
      { q: 'Ich habe bereits ein Cantia-Konto.', a: 'Verwenden Sie dieselben Zugangsdaten für Ihren Treuhandbereich.' },
    ],
  },
  final: { plain: 'Ihre Treuhand.', accent: 'Hier geht es weiter.', text: 'Ein Bereich für Ihre Dossiers und Ihr Team.', cta: 'Bereich kostenlos erstellen' },
};

const it: AccZipCopy = {
  nav: { features: 'Funzioni', clients: 'I vostri mandanti', questions: 'Domande' },
  hero: {
    eyebrow: 'Cantia Accounting · Per le fiduciarie',
    plain: 'I vostri mandanti.',
    accent: 'Lo stesso filo.',
    text: 'Contabilità, giustificativi e scadenze dello studio in un unico spazio. Per i mandanti su Cantia come per quelli con un altro software.',
    cta: 'Creare il mio spazio gratis',
    more: 'Scoprire le funzioni',
    micro: 'Gratuito per le fiduciarie · Senza carta di credito',
    shotAlt: 'Panoramica dello spazio fiduciario Cantia Accounting',
    shotNote: 'Lo spazio fiduciario così com’è · dati di esempio',
  },
  trust: ['Mandanti e collaboratori illimitati', 'Ospitato a Zurigo', 'FR · DE · IT'],
  uses: {
    eyebrow: 'Dal giustificativo ai conti annuali',
    plain: 'Il dossier avanza.',
    accent: 'Voi tenete il filo.',
    text: 'Sei utilizzi per accompagnare il lavoro dello studio, tutto l’anno.',
    items: [
      ['Registrare', 'Scritture e importazioni da Banana, Abacus, Winbiz o Excel.'],
      ['Controllare', 'Giornale, mastro, bilancio e conto economico con confronto N-1.'],
      ['Dichiarare', 'Preparate il rendiconto IVA e il file per il portale dell’AFC.'],
      ['Chiudere', 'Controllate l’esercizio e preparate i conti annuali.'],
      ['Scambiare', 'Il cliente trasmette i giustificativi e firma da un link privato.'],
      ['Gestire', 'Lavori, scadenze, tempo e onorari dello studio.'],
    ],
  },
  clients: {
    eyebrow: 'Con o senza Cantia',
    plain: 'Il cliente tiene il suo strumento.',
    accent: 'Voi ritrovate il suo dossier.',
    text: 'Un accesso concesso dal mandante, o una contabilità ripresa dal suo software. Lo studio lavora nello stesso ambiente.',
    items: [
      { label: '01 · Mandante su Cantia', title: 'I dati si ritrovano.', text: 'Accesso autorizzato dal cliente, revocabile in ogni momento.' },
      { label: '02 · Altro software', title: 'Il dossier resta completo.', text: 'Importazione, registrazione, giustificativi e firme tramite link privato.' },
    ],
    formatsLabel: 'I vostri formati abituali',
  },
  free: {
    eyebrow: 'Uno spazio per il vostro studio',
    plain: 'Tutto il vostro studio.',
    accent: 'Uno spazio gratuito.',
    text: 'Mandanti e collaboratori riuniti, senza carta di credito.',
    cta: 'Aprire il mio spazio',
    currency: 'CHF',
    note: 'per le fiduciarie',
  },
  faq: {
    eyebrow: 'Le risposte utili',
    title: 'Prima di iniziare.',
    items: [
      { q: 'I miei mandanti devono usare Cantia?', a: 'No. Potete anche tenere i loro libri tramite registrazione o importazione e scambiare con un link privato.' },
      { q: 'Il rendiconto viene trasmesso automaticamente all’AFC?', a: 'Il file è preparato per il vostro deposito sul portale dell’AFC.' },
      { q: 'Ho già un conto Cantia.', a: 'Usate le stesse credenziali per accedere al vostro spazio fiduciario.' },
    ],
  },
  final: { plain: 'Il vostro studio.', accent: 'Il seguito inizia qui.', text: 'Uno spazio per ritrovare i dossier e il team.', cta: 'Creare il mio spazio gratis' },
};

export const ACC_ZIP: Record<ZipLocale, AccZipCopy> = { fr, de, it };
