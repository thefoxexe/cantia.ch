import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'difference-sia-108-sia-118-devis-contrat',
  question: 'Qual è la differenza tra la norma SIA 108 e la norma SIA 118, e quale si applica al mio preventivo?',
  title: 'SIA 108 vs SIA 118: due norme spesso confuse, due ruoli molto diversi',
  description:
    'La SIA 118 regola i rapporti tra committente e impresario, la SIA 108 quelli con i mandatari (architetti, ingegneri). Confonderle espone ad applicare le regole sbagliate.',
  excerpt:
    'Le due norme portano numeri vicini ed escono dallo stesso editore. Una riguarda però i lavori di costruzione, l’altra le prestazioni intellettuali. La confusione è frequente e costosa.',
  category: 'Juridique & normes',
  keywords: ['SIA 108 vs SIA 118', 'norma SIA costruzione', 'differenza SIA 108 SIA 118', 'norma SIA preventivo', 'contratto d’appalto SIA'],
  publishedAt: '2026-06-17',
  readMinutes: 4,
  blocks: [
    {
      type: 'p',
      text: 'La SIA 118 e la SIA 108 sono due norme contrattuali distinte edite dalla Società svizzera degli ingegneri e degli architetti, spesso confuse a causa dei loro numeri vicini. Non regolano lo stesso rapporto, e applicare una al posto dell’altra per errore può falsare punti essenziali come la garanzia o la responsabilità.',
    },
    { type: 'h2', text: 'Cosa copre ciascuna norma' },
    {
      type: 'table',
      headers: ['Norma', 'Rapporto coperto', 'Esempio tipico'],
      rows: [
        ['SIA 118', 'Committente ↔ Impresario (contratto d’appalto)', 'Un muratore o un elettricista che esegue lavori'],
        ['SIA 108', 'Committente ↔ Mandatario (contratto di mandato)', 'Un architetto o un ingegnere che progetta/dirige un progetto'],
      ],
    },
    {
      type: 'p',
      text: 'La SIA 118 si applica a un contratto d’appalto (art. 363 CO e seguenti): l’impresario deve un risultato (l’opera terminata). La SIA 108 si applica invece a un contratto di mandato (art. 394 CO e seguenti), dove il mandatario deve mezzi e diligenza, non un risultato garantito. Questa distinzione cambia fondamentalmente il regime di responsabilità applicabile.',
    },
    { type: 'h2', text: 'Come la SIA 118, nessuna delle due è automatica' },
    {
      type: 'list',
      items: [
        'Né la SIA 108 né la SIA 118 si applicano di default: devono essere esplicitamente menzionate nel contratto o nel preventivo',
        'In loro assenza, solo il Codice delle obbligazioni disciplina il rapporto, con regole talvolta meno dettagliate',
        'Un artigiano che esegue lavori (non progettazione) deve riferirsi alla SIA 118, mai alla SIA 108',
      ],
    },
    {
      type: 'callout',
      title: 'Per un artigiano edile, è quasi sempre la SIA 118 quella pertinente',
      text: 'La SIA 108 riguarda i mestieri di progettazione e direzione di progetto. Un impresario che esegue lavori rientra invece nel regime del contratto d’appalto, quindi nella SIA 118 se viene applicata.',
    },
    {
      type: 'cta',
      title: 'Menzionate la norma giusta su ogni preventivo',
      text: 'Cantia permette di aggiungere condizioni personalizzate, incluso un riferimento esplicito alla SIA 118, direttamente sui vostri preventivi e contratti.',
      buttonLabel: 'Provare gratuitamente',
    },
  ],
  faq: [
    {
      question: 'Quale norma SIA si applica a un artigiano che esegue lavori?',
      answer:
        'È la SIA 118, che regola il contratto d’appalto tra committente e impresario. La SIA 108, invece, riguarda i mandatari come architetti e ingegneri.',
    },
    {
      question: 'Le norme SIA si applicano automaticamente a un cantiere?',
      answer:
        'No, né la SIA 108 né la SIA 118 si applicano di default. Devono essere esplicitamente menzionate nel contratto o nel preventivo per essere valide.',
    },
    {
      question: 'Qual è la principale differenza di regime tra le due norme?',
      answer:
        'La SIA 118 si basa su un obbligo di risultato (l’opera terminata), la SIA 108 su un obbligo di mezzi e diligenza, senza garanzia di risultato.',
    },
  ],
  relatedSlugs: [
    'norme-sia-118-devis-obligatoire',
    'contrat-entreprise-vs-mandat-artisan',
    'garantie-travaux-construction-2-ou-5-ans',
  ],
};
