import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'automatiser-rappels-relances-entreprise',
  question: 'Come automatizzare l’invio di promemoria e solleciti per la propria impresa edile?',
  title: 'Automatizzare i solleciti: non dimenticare mai più un mancato pagamento',
  description:
    'Sollecitare un cliente per una fattura non pagata o un preventivo in attesa è spesso la prima attività amministrativa dimenticata. Come automatizzarla senza perdere il tono personale.',
  excerpt:
    'Il sollecito al cliente è spesso l’attività amministrativa più facile da dimenticare, non per negligenza, ma perché non ha mai una data fissa in agenda, a differenza di un appuntamento in cantiere.',
  category: 'Sur-mesure & automatisations',
  keywords: ['automatizzare solleciti impresa', 'promemoria fattura non pagata automatico', 'sollecito preventivo automatico', 'automazione pagamento cliente edilizia', 'non dimenticare più sollecito cliente'],
  publishedAt: '2026-08-21',
  readMinutes: 4,
  blocks: [
    {
      type: 'p',
      text: 'A differenza di un appuntamento in cantiere, un sollecito per fattura non pagata non ha una data fissata in agenda. Dipende da un termine trascorso, facile da perdere di vista in mezzo al resto dell’attività. Risultato: mancati pagamenti che si trascinano, non per cattiva volontà, ma per semplice dimenticanza.',
    },
    { type: 'h2', text: 'Ciò che un sollecito automatizzato permette concretamente' },
    {
      type: 'list',
      items: [
        'Un promemoria inviato automaticamente X giorni dopo la scadenza di una fattura, senza doverci pensare',
        'Un tono diverso a seconda del numero di solleciti già inviati (cortese all’inizio, più fermo in seguito)',
        'Un avviso interno visibile per l’impresa, anche se il sollecito stesso parte automaticamente',
        'La possibilità di sospendere un sollecito automatico in caso di accordo particolare con il cliente',
      ],
    },
    {
      type: 'stat',
      value: '15-20 %',
      label: 'quota di fatture in ritardo generalmente saldate nei giorni successivi a un sollecito automatico ben calibrato, senza intervento manuale',
    },
    { type: 'h2', text: 'Automatizzare non significa perdere il controllo della relazione con il cliente' },
    {
      type: 'p',
      text: 'Un buon sollecito automatizzato resta sempre modificabile caso per caso: per un cliente fedele con semplicemente un giorno di ritardo, l’impresa mantiene la possibilità di adattare il tono o rimandare l’invio, piuttosto che subire un’automazione rigida.',
    },
    {
      type: 'callout',
      title: 'La regolarità conta più dell’aggressività del tono',
      text: 'Un sollecito automatico inviato sistematicamente al momento giusto è spesso più efficace di un sollecito occasionale molto insistente ma inviato ben dopo il termine.',
    },
    {
      type: 'cta',
      title: 'Solleciti che partono da soli, al momento giusto',
      text: 'Cantia può automatizzare i Suoi solleciti di fatture non pagate, con la possibilità di adattare il tono o sospenderli caso per caso.',
      buttonLabel: 'Provare gratuitamente',
    },
  ],
  faq: [
    {
      question: 'Perché i solleciti di fatture non pagate vengono spesso dimenticati?',
      answer:
        'Non hanno una data fissa in agenda, a differenza di un appuntamento in cantiere, perché dipendono da un termine trascorso, più facile da perdere di vista.',
    },
    {
      question: 'Un sollecito automatico sostituisce completamente il monitoraggio manuale?',
      answer:
        'No, l’automazione non sostituisce completamente il monitoraggio manuale: un buon sollecito resta modificabile caso per caso, in particolare per un cliente fedele con cui un adattamento di tono o di termine è giustificato.',
    },
    {
      question: 'Qual è l’impatto concreto di un sollecito automatico ben calibrato?',
      answer:
        'Generalmente il 15-20% delle fatture in ritardo viene saldato nei giorni successivi a un sollecito automatico inviato al momento giusto, senza intervento manuale.',
    },
  ],
  relatedSlugs: [
    'relancer-client-facture-impayee-sans-perdre-client',
    'automatiser-taches-repetitives-entreprise-sans-developpeur',
    'poursuite-facture-impayee-procedure-suisse',
  ],
};
