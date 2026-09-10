import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'retard-chantier-meteo-obligations-contractuelles',
  question: 'Un ritardo di cantiere dovuto al meteo impegna la responsabilità dell’impresario?',
  title: 'Ritardo di cantiere causato dal meteo: chi ne porta la responsabilità?',
  description:
    'Un termine contrattuale superato a causa di intemperie non è automaticamente una colpa dell’impresario. Occorre però poterlo dimostrare, giorno per giorno, e averlo comunicato in tempo.',
  excerpt:
    'Il cliente attende il suo cantiere terminato, il meteo non ha collaborato, e senza prova scritta, il ritardo rischia di ricadere interamente sull’impresario, anche quando non ne ha colpa.',
  category: 'Chantier & rentabilité',
  keywords: ['ritardo cantiere meteo', 'intemperie costruzione', 'termine contrattuale edilizia', 'responsabilità impresario', 'prova ritardo cantiere'],
  publishedAt: '2026-07-22',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Un termine di cantiere superato a causa di intemperie prolungate non costituisce in linea di principio una colpa dell’impresario, finché il ritardo resta entro una misura ragionevole rispetto alle condizioni incontrate. Ma questa protezione non è automatica: senza una documentazione precisa, un cliente in malafede (o semplicemente scontento) può contestare che il meteo abbia realmente impedito il lavoro, per mancanza di prove.',
    },
    { type: 'h2', text: 'Ciò che conta giuridicamente' },
    {
      type: 'list',
      items: [
        'Il meteo deve aver concretamente impedito l’esecuzione dei lavori, non solo reso il cantiere scomodo',
        'Il ritardo deve essere stato comunicato al cliente entro un termine ragionevole, non rivelato a posteriori al momento della consegna',
        'La durata del ritardo deve restare proporzionata ai giorni realmente impattati, non gonfiata da altre cause interne all’azienda',
        'Un contratto che prevede esplicitamente una clausola di intemperie protegge di più rispetto a un silenzio totale sull’argomento',
      ],
    },
    {
      type: 'callout',
      title: 'La prova si costruisce giorno per giorno, non a posteriori',
      text: 'Un rilievo meteo ufficiale ottenuto in seguito non sempre basta a convincere un cliente. Una traccia datata di ciò che è realmente accaduto sul cantiere quel giorno (foto, note, assenza di squadra constatata) è molto più solida.',
    },
    { type: 'h2', text: 'Prevenire piuttosto che giustificare in seguito' },
    {
      type: 'p',
      text: 'La miglior protezione resta comunicare il ritardo al cliente non appena diventa prevedibile, con una nuova data stimata, piuttosto che lasciar cadere il silenzio finché il cliente si spazientisce e scopre da solo lo scarto. Un messaggio datato, anche informale, vale spesso più di una giustificazione dettagliata presentata a posteriori.',
    },
    {
      type: 'cta',
      title: 'Un feed di cantiere datato e documentato',
      text: 'Il feed di aggiornamenti di Cantia timbra con data e ora ogni foto e ogni messaggio del cantiere, quanto basta per ricostruire con precisione una sequenza di giorni di fermo se un ritardo deve essere giustificato.',
      buttonLabel: 'Provare gratuitamente',
    },
  ],
  faq: [
    {
      question: 'Un impresario è responsabile di un ritardo causato dal meteo?',
      answer:
        'In linea di principio no, finché il ritardo resta ragionevole rispetto alle condizioni incontrate ed è stato correttamente comunicato al cliente. Ciò deve tuttavia poter essere documentato.',
    },
    {
      question: 'Bisogna avvisare il cliente di un ritardo non appena diventa probabile?',
      answer:
        'Sì, è la miglior protezione: comunicare presto, con una nuova data stimata, piuttosto che lasciare che il cliente scopra da solo lo scarto al momento della consegna.',
    },
    {
      question: 'Un rilievo meteo ufficiale basta a giustificare un ritardo di cantiere?',
      answer:
        'Aiuta, ma una traccia datata di ciò che è realmente accaduto sul cantiere (foto, note di squadra) è spesso più convincente di un dato meteo generale ottenuto a posteriori.',
    },
  ],
  relatedSlugs: [
    'gerer-plusieurs-chantiers-en-parallele-methode',
    'photos-chantier-preuve-juridique-litige',
    'avenant-chantier-plus-value-moins-value',
  ],
};
