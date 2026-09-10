import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'accident-travail-chantier-obligations-employeur-suva',
  question: 'Un operaio ha un infortunio sul cantiere: quali sono gli obblighi immediati del datore di lavoro verso la SUVA?',
  title: 'Infortunio sul lavoro in cantiere: gli obblighi del datore di lavoro verso la SUVA',
  description:
    'Dichiarazione entro i termini, salario durante l’incapacità, ripresa del lavoro: un infortunio in cantiere comporta obblighi precisi per il datore di lavoro edile, assicurato obbligatoriamente presso la SUVA.',
  excerpt:
    'L’edilizia è un settore a rischio, per cui le regole di dichiarazione e di follow-up della SUVA sono più severe che altrove. Una dichiarazione tardiva o compilata male può ritardare l’indennizzo del dipendente.',
  category: 'RH & salaires',
  keywords: ['infortunio sul lavoro cantiere', 'obblighi datore di lavoro SUVA', 'dichiarazione infortunio edilizia', 'incapacità lavorativa operaio', 'assicurazione infortuni edilizia'],
  publishedAt: '2026-08-06',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Ogni azienda del settore edile in Svizzera è obbligatoriamente assicurata presso la SUVA per gli infortuni professionali: a differenza di altri settori, su questo punto non è possibile scegliere l’assicuratore. Ciò comporta obblighi precisi non appena si verifica un infortunio in cantiere, professionale o non professionale a seconda dello statuto del dipendente.',
    },
    { type: 'h2', text: 'I 3 riflessi immediati' },
    {
      type: 'list',
      items: [
        'Dichiarare l’infortunio alla SUVA senza indugio, anche in caso di dubbio sulla gravità, utilizzando l’apposito modulo di dichiarazione d’infortunio (LAINF)',
        'Continuare a versare il salario durante i primi 2 giorni (o più a seconda del contratto), prima della presa a carico da parte dell’assicurazione all’80 % del salario assicurato',
        'Documentare le circostanze dell’infortunio finché sono ancora fresche, annotando il luogo esatto, l’ora e i testimoni presenti sul cantiere',
        'Verificare che il dipendente infortunato fosse effettivamente iscritto e affiliato al momento dei fatti, in particolare per un interinale o un neoassunto',
      ],
    },
    {
      type: 'callout',
      title: 'La documentazione del cantiere al momento dei fatti fa tutta la differenza',
      text: 'In caso di contestazione successiva sulle circostanze (infortunio professionale vs non professionale, colpa di un terzo, rispetto delle norme di sicurezza), avere una traccia precisa di chi era presente e dello stato del cantiere quel giorno tutela sia il datore di lavoro sia il dipendente.',
    },
    { type: 'h2', text: 'Il rientro al lavoro non è automatico' },
    {
      type: 'p',
      text: 'La ripresa avviene su certificato medico, talvolta a tempo parziale o con restrizioni temporanee (nessun sollevamento di carichi, nessun lavoro in altezza). Il datore di lavoro deve allora poter adattare la posizione o l’assegnazione di conseguenza, il che spesso richiede di riorganizzare temporaneamente i team sui cantieri in corso.',
    },
    {
      type: 'cta',
      title: 'Un team e dei cantieri visibili a colpo d’occhio',
      text: 'Il planning di squadra di Cantia permette di riorganizzare rapidamente le assegnazioni se un membro del team deve essere temporaneamente sollevato dopo un infortunio.',
      buttonLabel: 'Provare gratuitamente',
    },
  ],
  faq: [
    {
      question: 'Chi paga il salario nei primi giorni dopo un infortunio sul lavoro?',
      answer:
        'Il datore di lavoro continua a versare il salario per un breve periodo iniziale (generalmente 2 giorni), prima che la SUVA subentri all’80 % del salario assicurato.',
    },
    {
      question: 'Bisogna dichiarare alla SUVA anche un infortunio lieve?',
      answer:
        'Sì, è consigliato dichiarare ogni infortunio non appena comporta un’incapacità lavorativa o cure mediche, anche in caso di dubbio iniziale sulla gravità.',
    },
    {
      question: 'La SUVA è obbligatoria nel settore edile?',
      answer:
        'Sì, le imprese di costruzione sono legalmente tenute ad assicurare i propri dipendenti contro gli infortuni presso la SUVA, senza possibilità di scegliere un altro assicuratore per questa copertura.',
    },
  ],
  relatedSlugs: [
    'licenciement-ouvrier-batiment-delai-conge-cct',
    'salaire-minimum-cct-construction-suisse',
    'photos-chantier-preuve-juridique-litige',
  ],
};
