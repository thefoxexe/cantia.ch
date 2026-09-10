import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'certificat-de-travail-obligation-employeur-batiment',
  question: 'Un datore di lavoro dell’edilizia è obbligato a rilasciare un certificato di lavoro, e cosa deve contenere?',
  title: 'Certificato di lavoro nell’edilizia: un obbligo, non un favore',
  description:
    'Un dipendente che lascia l’impresa ha il diritto di esigere un certificato di lavoro in qualsiasi momento. Rifiutarlo o redigerlo con superficialità espone il datore di lavoro a una controversia, anche molto tempo dopo la partenza.',
  excerpt:
    'Molte piccole imprese trattano il certificato di lavoro come una formalità dell’ultimo minuto. È un diritto del dipendente, disciplinato da regole precise su ciò che può e non può contenere.',
  category: 'RH & salaires',
  keywords: ['certificato di lavoro obbligo', 'certificato di lavoro dipendente edilizia', 'attestato di lavoro Svizzera', 'diritto dipendente certificato', 'fine contratto di lavoro edilizia'],
  publishedAt: '2026-06-26',
  readMinutes: 4,
  blocks: [
    {
      type: 'p',
      text: 'L’art. 330a CO conferisce a ogni dipendente, senza eccezione, il diritto di esigere dal proprio datore di lavoro un certificato di lavoro, qualunque sia la natura della partenza: dimissione, licenziamento o fine di un contratto a tempo determinato. Questo diritto esiste in qualsiasi momento, anche anni dopo l’uscita effettiva dall’impresa.',
    },
    { type: 'h2', text: 'Due forme possibili' },
    {
      type: 'list',
      items: [
        'Il certificato completo, che descrive in dettaglio la natura e la durata del rapporto di lavoro nonché la qualità del lavoro e della condotta: è la forma di default quando il dipendente non specifica nulla',
        'L’attestato di lavoro semplice, che menziona unicamente la natura e la durata dell’impiego senza valutazione: il dipendente può richiederlo esplicitamente al posto del certificato completo',
      ],
    },
    { type: 'h2', text: 'Ciò che il certificato non deve mai contenere' },
    {
      type: 'list',
      items: [
        'Formulazioni in codice o ambigue destinate a nuocere discretamente al dipendente (una pratica riconosciuta e sanzionata dalla giurisprudenza)',
        'Giudizi di valore non oggettivamente fondati su fatti verificabili',
        'Una menzione di malattia, gravidanza o qualsiasi elemento senza legame diretto con la prestazione lavorativa in sé',
      ],
    },
    {
      type: 'callout',
      title: 'Un certificato di lavoro redatto frettolosamente si ritorce spesso contro l’impresa',
      text: 'Un dipendente che ritiene il proprio certificato inesatto o troppo vago può chiederne la rettifica, o addirittura adire il tribunale. Meglio quindi redigerlo con cura la prima volta piuttosto che doverlo rifare sotto pressione.',
    },
    { type: 'h2', text: 'Come semplificarne la redazione' },
    {
      type: 'p',
      text: 'Un certificato di lavoro ben fondato si basa su fatti concreti e documentati: i cantieri realizzati, le responsabilità assunte, le competenze dimostrate nel tempo. Più l’attività del dipendente è stata seguita e tracciata durante il suo impiego, più la redazione diventa rapida e oggettiva.',
    },
    {
      type: 'cta',
      title: 'Uno storico di attività per dipendente, pronto quando serve',
      text: 'Il modulo HR di Cantia tiene traccia delle assegnazioni e dell’attività di ogni membro del team. È una base concreta per redigere un certificato di lavoro giusto e rapido.',
      buttonLabel: 'Provare gratuitamente',
    },
  ],
  faq: [
    {
      question: 'Un datore di lavoro può rifiutarsi di rilasciare un certificato di lavoro?',
      answer:
        'No, è un diritto del dipendente previsto dall’art. 330a CO, esigibile in qualsiasi momento, anche molto tempo dopo la fine del rapporto di lavoro.',
    },
    {
      question: 'Qual è la differenza tra un certificato completo e un attestato di lavoro?',
      answer:
        'Il certificato completo include una valutazione della qualità del lavoro e della condotta, mentre l’attestato semplice menziona solo la natura e la durata dell’impiego, su richiesta del dipendente.',
    },
    {
      question: 'Si può menzionare una malattia in un certificato di lavoro?',
      answer:
        'No, salvo legame diretto con la prestazione lavorativa in sé: menzionare una malattia o una gravidanza senza pertinenza diretta non è consentito.',
    },
  ],
  relatedSlugs: [
    'licenciement-ouvrier-batiment-delai-conge-cct',
    'demission-employe-batiment-preavis-a-respecter',
    'apprenti-batiment-salaire-obligations-employeur',
  ],
};
