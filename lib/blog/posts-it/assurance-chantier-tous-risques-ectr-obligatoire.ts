import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'assurance-chantier-tous-risques-ectr-obligatoire',
  question: 'L’assicurazione cantiere tutti i rischi (ECTR) è obbligatoria, e chi deve stipularla?',
  title: 'Assicurazione cantiere tutti i rischi (ECTR): obbligatoria o no, e chi paga in caso di sinistro',
  description:
    'A differenza della RC professionale, l’ECTR non è imposta da alcuna legge federale, ma la sua assenza può costare molto caro in caso di danno prima della consegna. Ecco chi la stipula in pratica e perché.',
  excerpt:
    'Un danno d’acqua che distrugge un cantiere in corso, un incendio, un furto di materiale prima della posa: senza ECTR, la domanda «chi paga» si trasforma rapidamente in un conflitto tra committente e imprese.',
  category: 'Juridique & normes',
  keywords: ['assicurazione cantiere tutti i rischi', 'ECTR costruzione', 'assicurazione danno cantiere', 'sinistro cantiere in corso', 'assicurazione lavori'],
  publishedAt: '2026-08-01',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'L’assicurazione cantiere tutti i rischi (ECTR, Entreprise de Construction Tous Risques) copre i danni materiali che si verificano sull’opera in corso di costruzione, prima della sua consegna: incendio, danno d’acqua, tempesta, furto di materiali già posati, persino un errore di esecuzione accidentale. A differenza della RC professionale, nessuna legge federale la impone, ma la sua assenza espone tutti gli intervenienti a un rischio finanziario sproporzionato.',
    },
    { type: 'h2', text: 'Chi la stipula, in pratica' },
    {
      type: 'p',
      text: 'È generalmente il committente a stipulare un’ECTR per l’intero cantiere, a beneficio di tutti gli intervenienti (architetto, imprese, subappaltatori). Su cantieri più modesti, alcune imprese generali o imprenditori principali la stipulano loro stessi e rifatturano il premio nel loro preventivo globale.',
    },
    {
      type: 'list',
      items: [
        'Verificare prima dell’inizio del cantiere chi ha stipulato l’ECTR, e non presumere mai che esista senza conferma scritta',
        'Un contratto che non menziona alcuna ECTR lascia ogni interveniente esposto per la propria opera in caso di sinistro',
        'L’ECTR non sostituisce mai la RC professionale dell’impresario, che copre un rischio del tutto diverso (danno causato a un terzo per colpa)',
      ],
    },
    {
      type: 'callout',
      title: 'Senza ECTR, un sinistro prima della consegna ricade spesso sull’impresario',
      text: 'Finché l’opera non è consegnata, l’impresario ne resta responsabile. Un incendio o un danno d’acqua che distrugge un cantiere in corso può quindi, in assenza di ECTR, rappresentare una perdita secca per l’azienda che ha eseguito i lavori.',
    },
    {
      type: 'cta',
      title: 'Documentare lo stato del cantiere prima di ogni sinistro',
      text: 'I rapporti di cantiere di Cantia, con foto geolocalizzate e con data e ora, offrono una base fattuale preziosa per qualsiasi dichiarazione di sinistro, sia per l’ECTR sia per la RC professionale.',
      buttonLabel: 'Provare gratuitamente',
    },
  ],
  faq: [
    {
      question: 'L’ECTR è obbligatoria in Svizzera?',
      answer:
        'No, nessuna legge federale la impone, ma la sua assenza espone fortemente gli intervenienti del cantiere in caso di sinistro prima della consegna, e alcuni committenti la esigono contrattualmente.',
    },
    {
      question: 'Chi stipula generalmente l’assicurazione cantiere tutti i rischi?',
      answer:
        'Il più delle volte il committente, a beneficio di tutti gli intervenienti del cantiere. Su progetti più modesti, tuttavia, l’impresa principale può anche stipularla essa stessa.',
    },
    {
      question: 'L’ECTR sostituisce la RC professionale dell’impresario?',
      answer:
        'No, sono due coperture diverse: l’ECTR copre i danni materiali al cantiere stesso, la RC professionale copre i danni causati a un terzo per colpa dell’impresario.',
    },
  ],
  relatedSlugs: [
    'assurance-rc-professionnelle-batiment-obligatoire',
    'reception-travaux-proces-verbal-chantier',
    'defaut-construction-decouvert-apres-reception-qui-paie',
  ],
};
