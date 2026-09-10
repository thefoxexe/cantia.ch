import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'sous-effectif-chantier-recruter-ou-sous-traiter',
  question: 'Mancanza di manodopera nei cantieri: conviene assumere o subappaltare?',
  title: 'Organico insufficiente nei cantieri: assumere o subappaltare, come decidere',
  description:
    'Rifiutare cantieri per mancanza di personale è un cattivo calcolo, ma assumere troppo in fretta lo è altrettanto. Ecco i criteri concreti per scegliere tra assunzione e subappalto.',
  excerpt:
    'Un portafoglio ordini pieno e un team troppo corto: la tentazione è assumere d’urgenza. È spesso la decisione più costosa a lungo termine, rispetto a un subappalto ben scelto.',
  category: 'RH & salaires',
  keywords: ['mancanza manodopera edilizia', 'assumere o subappaltare', 'gestione organico costruzione', 'subappalto cantiere', 'decisione RH artigiano'],
  publishedAt: '2026-08-05',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Un portafoglio ordini che trabocca e un team troppo corto per assorbirlo: è una buona notizia che diventa rapidamente un problema se la decisione di rafforzare l’organico viene presa d’urgenza. Assumere e subappaltare non rispondono alla stessa esigenza, e confondere i due porta spesso o a un organico sovradimensionato una volta passato il picco, o a una dipendenza mal controllata da subappaltatori.',
    },
    { type: 'h2', text: 'Quando assumere ha senso' },
    {
      type: 'list',
      items: [
        'Il sovraccarico è strutturale, non puntuale, perché si ripete cantiere dopo cantiere da diversi mesi',
        'Il know-how ricercato è centrale nel mestiere dell’azienda, non una competenza periferica',
        'L’azienda ha la tesoreria per sostenere un salario fisso anche in un mese più calmo',
      ],
    },
    { type: 'h2', text: 'Quando subappaltare è più pertinente' },
    {
      type: 'list',
      items: [
        'Il bisogno è puntuale o stagionale, legato a uno o due cantieri specifici',
        'La competenza necessaria è specializzata e raramente utilizzata (una prestazione tecnica precisa, un mestiere complementare)',
        'L’azienda vuole testare un volume di attività più elevato prima di impegnarsi in un’assunzione duratura',
      ],
    },
    {
      type: 'callout',
      title: 'Il vero costo di un’assunzione affrettata si vede dopo il picco di attività, non durante',
      text: 'Un salario fisso impegnato per assorbire un sovraccarico puntuale continua a pesare sulla tesoreria una volta passato il picco. È spesso lì, diversi mesi dopo, che la decisione si rivela essere stata sbagliata.',
    },
    {
      type: 'cta',
      title: 'Una rubrica di subappaltatori sempre aggiornata',
      text: 'Il modulo Subappaltatori di Cantia centralizza i vostri partner per mestiere e per cantiere. Quanto basta per decidere in fretta tra rinforzo puntuale e assunzione, senza ripartire da zero a ogni picco di attività.',
      buttonLabel: 'Provare gratuitamente',
    },
  ],
  faq: [
    {
      question: 'Come sapere se bisogna assumere piuttosto che subappaltare?',
      answer:
        'Se il sovraccarico si ripete cantiere dopo cantiere da diversi mesi e riguarda una competenza centrale nel mestiere dell’azienda, un’assunzione si giustifica meglio di un rinforzo puntuale.',
    },
    {
      question: 'Qual è il principale rischio di un’assunzione affrettata?',
      answer:
        'Un salario fisso continua a pesare sulla tesoreria una volta passato il picco di attività, cosicché il vero costo di una decisione sbagliata si vede spesso diversi mesi dopo, non immediatamente.',
    },
    {
      question: 'Il subappalto è adatto a un bisogno puntuale?',
      answer:
        'Sì, si adatta bene a un picco di attività limitato nel tempo o a una competenza specializzata raramente mobilitata, senza impegnare l’azienda a lungo termine.',
    },
  ],
  relatedSlugs: [
    'sous-traitant-batiment-suisse-contrat-facturation',
    'apprenti-batiment-salaire-obligations-employeur',
    'pourquoi-entreprises-batiment-font-faillite-suisse',
  ],
};
