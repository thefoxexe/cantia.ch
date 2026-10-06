import type { PartnersLocale } from './copy';

// Personal terms (blurred until agreed) and logo wall, in the partner space.
export const TERMS_COPY: Record<
  PartnersLocale,
  {
    title: string;
    pendingTitle: string;
    pendingText: string;
    blurLabel: string;
    cta: string;
    requestedTitle: string;
    requestedText: string;
    awaiting: string;
    setTitle: string;
    setValue: string;
    setText: string;
    form: { phone: string; availability: string; availabilityPh: string; message: string; messagePh: string; send: string; cancel: string; sent: string };
    showcase: {
      title: string;
      text: string;
      logo: string;
      choose: string;
      change: string;
      website: string;
      tagline: string;
      taglinePh: string;
      submit: string;
      withdraw: string;
      statuses: Record<'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED', string>;
      unavailable: string;
      hint: string;
    };
  }
> = {
  fr: {
    title: 'Votre commission',
    pendingTitle: 'Des conditions à votre mesure',
    pendingText: 'Chez Cantia, la rémunération de chaque partenaire se définit ensemble, selon votre réseau et votre façon de travailler. Votre lien est déjà actif : tout ce que vous apportez dès aujourd’hui sera rémunéré au taux convenu.',
    blurLabel: 'Taux personnalisé',
    cta: 'Planifier mon entretien',
    requestedTitle: 'Demande d’entretien envoyée',
    requestedText: 'Envoyée le {date}. Nous vous contactons rapidement pour convenir de vos conditions.',
    awaiting: '{amount} de paiements de vos clients attendent votre taux : vos commissions seront calculées dès qu’il sera fixé.',
    setTitle: 'Vos conditions',
    setValue: '{rate} % pendant {months} mois',
    setText: 'De chaque paiement de vos clients, hors TVA. Conditions convenues le {date}.',
    form: {
      phone: 'Téléphone',
      availability: 'Vos disponibilités',
      availabilityPh: 'Ex. : en semaine après 16 h',
      message: 'Message (facultatif)',
      messagePh: 'Votre activité, vos clients, ce que vous imaginez avec Cantia…',
      send: 'Envoyer la demande',
      cancel: 'Annuler',
      sent: 'Merci, votre demande est envoyée.',
    },
    showcase: {
      title: 'Votre logo sur partners.cantia.ch',
      text: 'Apparaissez parmi les partenaires officiels de Cantia, avec un lien vers votre site. Votre logo est publié après validation par notre équipe.',
      logo: 'Logo (PNG, JPG, SVG ou WebP, 2 Mo max.)',
      choose: 'Choisir un logo',
      change: 'Changer',
      website: 'Site web',
      tagline: 'Phrase de présentation',
      taglinePh: 'Ex. : Fiduciaire des PME du bâtiment à Lausanne',
      submit: 'Demander la publication',
      withdraw: 'Retirer de la page',
      statuses: { NONE: 'Non publié', PENDING: 'En cours de validation', APPROVED: 'Publié', REJECTED: 'Non retenu, contactez-nous' },
      unavailable: 'Cette fonction sera disponible très bientôt.',
      hint: 'Fond transparent de préférence, logo horizontal.',
    },
  },
  de: {
    title: 'Ihre Provision',
    pendingTitle: 'Konditionen nach Mass',
    pendingText: 'Bei Cantia wird die Vergütung jedes Partners gemeinsam festgelegt, je nach Netzwerk und Arbeitsweise. Ihr Link ist bereits aktiv: Alles, was Sie ab heute vermitteln, wird zum vereinbarten Satz vergütet.',
    blurLabel: 'Persönlicher Satz',
    cta: 'Gespräch vereinbaren',
    requestedTitle: 'Gesprächsanfrage gesendet',
    requestedText: 'Gesendet am {date}. Wir melden uns rasch, um Ihre Konditionen zu vereinbaren.',
    awaiting: '{amount} an Zahlungen Ihrer Kunden warten auf Ihren Satz: Ihre Provisionen werden berechnet, sobald er feststeht.',
    setTitle: 'Ihre Konditionen',
    setValue: '{rate} % während {months} Monaten',
    setText: 'Von jeder Zahlung Ihrer Kunden, ohne MWST. Vereinbart am {date}.',
    form: {
      phone: 'Telefon',
      availability: 'Ihre Verfügbarkeit',
      availabilityPh: 'z. B.: werktags nach 16 Uhr',
      message: 'Nachricht (optional)',
      messagePh: 'Ihre Tätigkeit, Ihre Kunden, Ihre Ideen mit Cantia…',
      send: 'Anfrage senden',
      cancel: 'Abbrechen',
      sent: 'Danke, Ihre Anfrage wurde gesendet.',
    },
    showcase: {
      title: 'Ihr Logo auf partners.cantia.ch',
      text: 'Erscheinen Sie unter den offiziellen Partnern von Cantia, mit einem Link zu Ihrer Website. Ihr Logo wird nach Prüfung durch unser Team veröffentlicht.',
      logo: 'Logo (PNG, JPG, SVG oder WebP, max. 2 MB)',
      choose: 'Logo wählen',
      change: 'Ändern',
      website: 'Website',
      tagline: 'Kurzbeschreibung',
      taglinePh: 'z. B.: Treuhand für Bau-KMU in Bern',
      submit: 'Veröffentlichung beantragen',
      withdraw: 'Von der Seite entfernen',
      statuses: { NONE: 'Nicht veröffentlicht', PENDING: 'Wird geprüft', APPROVED: 'Veröffentlicht', REJECTED: 'Nicht angenommen, kontaktieren Sie uns' },
      unavailable: 'Diese Funktion ist in Kürze verfügbar.',
      hint: 'Am besten transparenter Hintergrund, Logo im Querformat.',
    },
  },
  it: {
    title: 'La sua commissione',
    pendingTitle: 'Condizioni su misura',
    pendingText: 'In Cantia la remunerazione di ogni partner si definisce insieme, in base alla sua rete e al suo modo di lavorare. Il suo link è già attivo: tutto ciò che porta da oggi sarà remunerato al tasso concordato.',
    blurLabel: 'Tasso personalizzato',
    cta: 'Fissare un colloquio',
    requestedTitle: 'Richiesta di colloquio inviata',
    requestedText: 'Inviata il {date}. La contattiamo rapidamente per concordare le sue condizioni.',
    awaiting: '{amount} di pagamenti dei suoi clienti attendono il suo tasso: le commissioni saranno calcolate appena fissato.',
    setTitle: 'Le sue condizioni',
    setValue: '{rate} % per {months} mesi',
    setText: 'Di ogni pagamento dei suoi clienti, IVA esclusa. Concordate il {date}.',
    form: {
      phone: 'Telefono',
      availability: 'Le sue disponibilità',
      availabilityPh: 'Es.: in settimana dopo le 16',
      message: 'Messaggio (facoltativo)',
      messagePh: 'La sua attività, i suoi clienti, le sue idee con Cantia…',
      send: 'Inviare la richiesta',
      cancel: 'Annullare',
      sent: 'Grazie, la sua richiesta è stata inviata.',
    },
    showcase: {
      title: 'Il suo logo su partners.cantia.ch',
      text: 'Appaia tra i partner ufficiali di Cantia, con un link al suo sito. Il logo viene pubblicato dopo la convalida del nostro team.',
      logo: 'Logo (PNG, JPG, SVG o WebP, max. 2 MB)',
      choose: 'Scegliere un logo',
      change: 'Cambiare',
      website: 'Sito web',
      tagline: 'Frase di presentazione',
      taglinePh: 'Es.: Fiduciaria per le PMI edili a Lugano',
      submit: 'Chiedere la pubblicazione',
      withdraw: 'Ritirare dalla pagina',
      statuses: { NONE: 'Non pubblicato', PENDING: 'In convalida', APPROVED: 'Pubblicato', REJECTED: 'Non accettato, ci contatti' },
      unavailable: 'Questa funzione sarà disponibile a breve.',
      hint: 'Sfondo trasparente se possibile, logo orizzontale.',
    },
  },
};
