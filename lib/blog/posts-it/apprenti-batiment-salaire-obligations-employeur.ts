import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'apprenti-batiment-salaire-obligations-employeur',
  question: 'Quale salario versare a un apprendista edile, e quali obblighi per l’azienda formatrice?',
  title: 'Apprendista nell’edilizia: salario, inquadramento e obblighi dell’azienda formatrice',
  description:
    'Formare un apprendista nell’edilizia implica un salario progressivo fissato dal CCL, un inquadramento pedagogico reale e obblighi verso il Cantone: ecco cosa deve anticipare una piccola impresa.',
  excerpt:
    'Prendere un apprendista non è solo «un paio di braccia in più». È un impegno inquadrato, con un salario preciso per anno di formazione e un vero follow-up pedagogico atteso dall’azienda.',
  category: 'RH & salaires',
  keywords: ['salario apprendista edilizia', 'formazione professionale costruzione', 'CCL apprendista', 'azienda formatrice', 'contratto di tirocinio'],
  publishedAt: '2026-08-03',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Formare un apprendista nell’edilizia risponde spesso a un’esigenza reale (ricambio generazionale, costo salariale iniziale più basso) ma comporta obblighi concreti che molte piccole imprese scoprono strada facendo: un salario progressivo fissato dal CCL del mestiere, un inquadramento pedagogico documentato e un follow-up regolare con la scuola professionale.',
    },
    { type: 'h2', text: 'Un salario che progredisce ogni anno di formazione' },
    {
      type: 'p',
      text: 'Il salario di tirocinio è fissato dal contratto collettivo del mestiere interessato (muratura, carpenteria, gessatura-pittura, ecc.), con una griglia che aumenta a ogni anno di formazione. Non si tratta mai di un importo negoziabile caso per caso, quindi verificare il CCL applicabile al mestiere preciso evita un errore di griglia frequente.',
    },
    {
      type: 'list',
      items: [
        'Il salario progredisce ogni anno di formazione, generalmente su base annuale e non rigorosamente mensile',
        'Un CCL settoriale può prevedere importi diversi da un mestiere edile all’altro',
        'Le indennità di pasto e di trasferta seguono generalmente le stesse regole dei dipendenti qualificati',
        'Una tredicesima prorata si applica il più delle volte anche all’apprendista, salvo disposizione contraria del CCL',
      ],
    },
    {
      type: 'callout',
      title: 'L’azienda formatrice deve essere autorizzata dal Cantone',
      text: 'Formare un apprendista richiede un’autorizzazione a formare rilasciata dall’autorità cantonale competente, che verifica che l’azienda disponga dell’inquadramento e dell’attrezzatura necessari. Non è automatico per il solo fatto di esercitare un mestiere riconosciuto.',
    },
    { type: 'h2', text: 'Il follow-up pedagogico non è opzionale' },
    {
      type: 'p',
      text: 'Oltre al salario, l’azienda si impegna a seguire un piano di formazione, a designare un formatore responsabile e a collaborare con la scuola professionale e talvolta con i corsi interaziendali. Un libretto di formazione o un diario di progressione, anche informale, aiuta a documentare che l’apprendista è stato effettivamente esposto alle competenze attese a ogni fase.',
    },
    {
      type: 'cta',
      title: 'Un diario di cantiere che serve anche a formare',
      text: 'Il feed di aggiornamenti per cantiere di Cantia permette di documentare i compiti svolti da ogni membro del team, apprendisti compresi, il che costituisce una base concreta per un follow-up di formazione.',
      buttonLabel: 'Provare gratuitamente',
    },
  ],
  faq: [
    {
      question: 'Il salario di un apprendista edile è negoziabile?',
      answer:
        'No, segue una griglia fissata dal contratto collettivo del mestiere interessato, progressiva secondo l’anno di formazione, e non è liberamente negoziabile tra l’azienda e l’apprendista.',
    },
    {
      question: 'Serve un’autorizzazione per formare un apprendista?',
      answer:
        'Sì, l’azienda deve ottenere un’autorizzazione a formare rilasciata dall’autorità cantonale competente, che verifica l’inquadramento e l’attrezzatura disponibili.',
    },
    {
      question: 'Un apprendista ha diritto a una tredicesima prorata?',
      answer:
        'In generale sì, secondo le stesse regole dei dipendenti qualificati, salvo disposizione contraria esplicita del contratto collettivo applicabile.',
    },
  ],
  relatedSlugs: [
    'calculer-13e-salaire-prorata-employe',
    'salaire-minimum-cct-construction-suisse',
    'licenciement-ouvrier-batiment-delai-conge-cct',
  ],
};
