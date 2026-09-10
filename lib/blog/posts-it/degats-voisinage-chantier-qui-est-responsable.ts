import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'degats-voisinage-chantier-qui-est-responsable',
  question: 'Chi paga se un cantiere causa danni al vicinato (crepe, polvere, vibrazioni)?',
  title: 'Danni al vicinato causati da un cantiere: chi è responsabile, e come proteggersi',
  description:
    'Una crepa dal vicino dopo lavori di sterro, polvere su una facciata appena ridipinta: la responsabilità non è automatica, e si dimostra con un sopralluogo preliminare.',
  excerpt:
    'Senza un sopralluogo prima dei lavori, un vicino può attribuire al vostro cantiere una crepa già esistente. L’azienda si ritrova allora a dover provare il contrario, spesso troppo tardi.',
  category: 'Juridique & normes',
  keywords: ['danni vicinato cantiere', 'responsabilità lavori vicino', 'crepa cantiere vicinato', 'disturbi cantiere', 'sopralluogo prima dei lavori'],
  publishedAt: '2026-06-19',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Un cantiere di sterro, demolizione o opere grezze può causare disturbi o danni a un vicino (crepe, vibrazioni, polvere, deposito di materiali che sconfina su una proprietà adiacente). La responsabilità non è mai automatica: dipende da chi ha causato il danno, e soprattutto, da ciò che può essere provato.',
    },
    { type: 'h2', text: 'Chi porta la responsabilità in linea di principio' },
    {
      type: 'list',
      items: [
        'L’impresario risponde della propria esecuzione difettosa o negligente (art. 41 CO, responsabilità per colpa)',
        'Anche il committente può essere chiamato in causa se i lavori commissionati erano intrinsecamente rischiosi per il vicinato (art. 679 CC, diritti di vicinato)',
        'Un’assicurazione RC professionale dell’azienda copre in genere questo tipo di danno, a condizione che sia correttamente documentato',
      ],
    },
    { type: 'h2', text: 'La protezione più efficace: il sopralluogo prima dei lavori' },
    {
      type: 'p',
      text: 'Un sopralluogo in contraddittorio (foto datate, eventualmente con il vicino) effettuato prima dell’inizio dei lavori è la miglior protezione per l’azienda. Senza di esso, un vicino può, legittimamente o in malafede, attribuire una crepa preesistente al cantiere, e l’azienda non ha allora alcun mezzo per provare il contrario.',
    },
    {
      type: 'list',
      items: [
        'Fotografare sistematicamente le facciate e gli elementi sensibili del vicinato prima dell’inizio dei lavori',
        'Documentare le vibrazioni o i disturbi constatati durante il cantiere se sembrano anomali',
        'Conservare queste prove nel fascicolo del cantiere, non solo su un telefono personale che può andare perso',
      ],
    },
    {
      type: 'callout',
      title: 'Un sopralluogo effettuato dopo un reclamo del vicino non prova nulla',
      text: 'La prova deve esistere prima del fatto contestato: un rilievo effettuato in seguito, una volta dichiarata la controversia, non ha alcun valore per stabilire lo stato precedente del bene.',
    },
    {
      type: 'cta',
      title: 'Foto di cantiere con data e ora, fin dal primo giorno',
      text: 'Il feed di aggiornamenti di Cantia geolocalizza e timbra con data e ora ogni foto. Un sopralluogo prima dei lavori diventa così un riflesso semplice, documentato automaticamente.',
      buttonLabel: 'Provare gratuitamente',
    },
  ],
  faq: [
    {
      question: 'Chi è responsabile dei danni causati a un vicino da un cantiere?',
      answer:
        'L’impresario risponde della propria esecuzione colposa, e anche il committente può essere chiamato in causa se i lavori commissionati erano intrinsecamente rischiosi per il vicinato.',
    },
    {
      question: 'Come proteggersi da un’accusa di danno infondata?',
      answer:
        'Effettuando un sopralluogo in contraddittorio, con foto datate, prima dell’inizio dei lavori: è l’unica prova affidabile dello stato precedente del bene vicino.',
    },
    {
      question: 'L’assicurazione RC professionale copre i danni al vicinato?',
      answer:
        'In generale sì, a condizione che il danno sia correttamente documentato e che la responsabilità dell’azienda sia accertata.',
    },
  ],
  relatedSlugs: [
    'assurance-rc-professionnelle-batiment-obligatoire',
    'photos-chantier-preuve-juridique-litige',
    'assurance-chantier-tous-risques-ectr-obligatoire',
  ],
};
