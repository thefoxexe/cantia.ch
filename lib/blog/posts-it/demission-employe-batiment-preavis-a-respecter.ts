import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'demission-employe-batiment-preavis-a-respecter',
  question: 'Un dipendente dell’edilizia si dimette: quale termine di preavviso deve rispettare?',
  title: 'Dimissioni di un dipendente dell’edilizia: il termine di preavviso da rispettare (e cosa succede se non viene rispettato)',
  description:
    'Il preavviso di dimissione segue le stesse regole del licenziamento. Un dipendente che parte senza rispettarlo espone tuttavia l’impresa a una carenza organizzativa che essa può, in certi casi, far valere.',
  excerpt:
    'Un operaio che annuncia la propria partenza «tra due settimane» non può sempre partire così in fretta, perché il termine di preavviso funziona in entrambi i sensi, datore di lavoro come dipendente.',
  category: 'RH & salaires',
  keywords: ['dimissioni dipendente preavviso', 'termine di disdetta dimissioni edilizia', 'preavviso dipendente costruzione', 'partenza dipendente senza preavviso', 'CCT edilizia dimissioni'],
  publishedAt: '2026-06-29',
  readMinutes: 4,
  blocks: [
    {
      type: 'p',
      text: 'Il termine di preavviso in caso di dimissioni segue esattamente le stesse regole applicabili a un licenziamento (art. 335c CO, salvo disposizione CCT più favorevole). Non esiste un regime più flessibile per un dipendente che decide autonomamente di partire: un operaio che annuncia una partenza immediata o «tra due settimane», senza che tale termine sia contrattualmente compatibile, resta in linea di principio vincolato al preavviso normale.',
    },
    { type: 'h2', text: 'I termini applicabili (salvo CCT più favorevole)' },
    {
      type: 'table',
      headers: ['Anzianità', 'Termine di preavviso'],
      rows: [
        ['Durante il periodo di prova', '7 giorni'],
        ['1° anno di servizio', '1 mese per la fine di un mese'],
        ['2° al 9° anno di servizio', '2 mesi per la fine di un mese'],
        ['Dal 10° anno di servizio', '3 mesi per la fine di un mese'],
      ],
    },
    { type: 'h2', text: 'Cosa fare se un dipendente parte senza rispettare il preavviso' },
    {
      type: 'list',
      items: [
        'Il datore di lavoro può reclamare un’indennità corrispondente al salario che il dipendente avrebbe percepito se avesse rispettato il termine',
        'Se l’assenza causa un danno supplementare concreto (ritardo di cantiere fatturabile, penale contrattuale), può reclamarlo anche, a condizione di documentarlo',
        'In pratica, questo ricorso viene raramente esercitato fino in fondo, ma la sua esistenza pesa nella negoziazione di una partenza anticipata amichevole',
      ],
    },
    {
      type: 'callout',
      title: 'Una partenza anticipata negoziata resta quasi sempre preferibile a un conflitto',
      text: 'Accettare un preavviso ridotto in cambio di una transizione organizzata (passaggio di consegne, formazione di un sostituto) costa spesso meno all’impresa di un ricorso legale teorico contro un dipendente già partito.',
    },
    {
      type: 'cta',
      title: 'Anticipare una partenza senza perdere il filo dei cantieri',
      text: 'La pianificazione del team di Cantia permette di riorganizzare rapidamente le assegnazioni non appena viene annunciata una partenza, senza attendere l’ultimo momento.',
      buttonLabel: 'Provare gratuitamente',
    },
  ],
  faq: [
    {
      question: 'Il termine di preavviso è lo stesso per una dimissione e un licenziamento?',
      answer:
        'Sì, l’art. 335c CO fissa lo stesso regime in entrambi i sensi, salvo disposizione più favorevole prevista da una CCT applicabile.',
    },
    {
      question: 'Cosa può fare un datore di lavoro se un dipendente parte senza rispettare il preavviso?',
      answer:
        'Può reclamare un’indennità equivalente al salario del termine non rispettato, e un risarcimento supplementare se ne risulta un danno concreto e documentato.',
    },
    {
      question: 'Un dipendente può partire immediatamente invocando giusti motivi?',
      answer:
        'Sì, una disdetta immediata per giusti motivi (molestie, mancato pagamento del salario) resta possibile, ma richiede motivi seri e documentati, senza i quali espone lo stesso dipendente a conseguenze.',
    },
  ],
  relatedSlugs: [
    'licenciement-ouvrier-batiment-delai-conge-cct',
    'certificat-de-travail-obligation-employeur-batiment',
    'sous-effectif-chantier-recruter-ou-sous-traiter',
  ],
};
