import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'lancer-entreprise-batiment-suisse-par-ou-commencer',
  question: 'Da dove cominciare concretamente per lanciare la propria impresa edile in Svizzera?',
  title: 'Lanciare la propria impresa edile in Svizzera: da dove cominciare',
  description:
    'Tra statuto giuridico, assicurazioni e primi strumenti, un ordine logico per non dimenticare nulla al momento di lanciarsi nell’edilizia in Svizzera.',
  excerpt:
    'Lanciarsi nell’edilizia implica una decina di decisioni da prendere quasi contemporaneamente: un ordine chiaro aiuta a non dimenticare nulla senza sentirsi sopraffatti fin dal primo giorno.',
  category: 'Comparatifs & outils',
  keywords: ['lanciare impresa edile Svizzera', 'da dove cominciare impresa costruzioni', 'tappe creazione impresa edile', 'pratiche impresa artigiano Svizzera', 'checklist lancio attività edile'],
  publishedAt: '2026-08-13',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Lanciare un’impresa edile in Svizzera implica pratiche giuridiche, amministrative e pratiche che arrivano quasi tutte contemporaneamente. Un ordine chiaro permette di procedere metodicamente, senza sentirsi sopraffatti da tutto ciò che resta da fare.',
    },
    { type: 'h2', text: 'Le grandi tappe, in ordine logico' },
    {
      type: 'list',
      items: [
        '1. Scegliere uno statuto giuridico (ditta individuale, Sagl, SA) adatto alla situazione e all’ambizione di crescita',
        '2. Iscriversi al registro di commercio se necessario, e verificare le autorizzazioni all’esercizio proprie del mestiere',
        '3. Sottoscrivere un’assicurazione RC professionale, generalmente indispensabile',
        '4. Aprire un conto bancario professionale separato dal conto personale',
        '5. Mettere in atto uno strumento di preventivi e fatture conforme, prima del primissimo cliente',
        '6. Rivolgersi a un’associazione di categoria o a una camera di commercio cantonale per i primi contatti e raccomandazioni',
      ],
    },
    {
      type: 'stat',
      value: '2-4 sett.',
      label: 'termine comune per finalizzare le pratiche amministrative di base (iscrizione, assicurazione, conto bancario) prima di poter fatturare legalmente',
    },
    { type: 'h2', text: 'Non voler perfezionare tutto prima di iniziare' },
    {
      type: 'p',
      text: 'Aspettare di avere "tutto" in ordine prima di accettare un primo cliente rimanda inutilmente l’inizio dell’attività. Lo stretto necessario (statuto, assicurazione, strumento di fatturazione) basta per iniziare. Il resto (catalogo prezzi completo, pianificazione, HR) può costruirsi strada facendo.',
    },
    {
      type: 'callout',
      title: 'Un software gestionale fin dall’inizio facilita tutte le altre tappe',
      text: 'Uno strumento che centralizza preventivi, fatture e monitoraggio dei cantieri fin dal primo giorno rende le tappe successive (contabilità, IVA, crescita) più semplici da gestire senza ripartire da zero.',
    },
    {
      type: 'cta',
      title: 'Pronto a fatturare fin dal Suo primo giorno di attività',
      text: 'Cantia si installa rapidamente e copre preventivi, fatture e monitoraggio dei cantieri fin dal lancio. Lo provi gratuitamente per 14 giorni, senza inserire alcun codice.',
      buttonLabel: 'Provare gratuitamente',
    },
  ],
  faq: [
    {
      question: 'Qual è la prima tappa per lanciare un’impresa edile in Svizzera?',
      answer:
        'Scegliere uno statuto giuridico adatto (ditta individuale, Sagl, SA), poi iscriversi al registro di commercio se necessario e verificare le autorizzazioni proprie del mestiere.',
    },
    {
      question: 'Bisogna avere tutto in ordine prima di accettare il primo cliente?',
      answer:
        'No, perché lo stretto necessario (statuto giuridico, assicurazione RC, strumento di fatturazione conforme) basta per iniziare, e il resto può costruirsi progressivamente.',
    },
    {
      question: 'In quale momento mettere in atto il proprio strumento gestionale lanciando la propria impresa?',
      answer:
        'Idealmente prima del primissimo cliente, per garantire preventivi e fatture conformi fin dall’inizio dell’attività.',
    },
  ],
  relatedSlugs: [
    'demarrer-entreprise-batiment-outils-indispensables',
    'checklist-logiciels-ouverture-societe-construction',
    'pourquoi-artisan-independant-besoin-logiciel-des-le-debut',
  ],
};
