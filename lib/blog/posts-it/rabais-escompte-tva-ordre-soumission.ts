import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'rabais-escompte-tva-ordre-soumission',
  question: 'In che ordine applicare ribasso, sconto e IVA su un capitolato?',
  title: 'Ribasso, sconto, IVA: in che ordine nel riepilogo di un capitolato?',
  description:
    'Ribasso e sconto non sono la stessa cosa, e l’ordine del calcolo cambia il totale. Esempio con le cifre del riepilogo di un capitolato svizzero, dalla somma lorda al totale IVA inclusa.',
  excerpt:
    'Due imprese offrono lo stesso ribasso e lo stesso sconto, ma non arrivano allo stesso totale. Una delle due ha sbagliato l’ordine.',
  category: 'Devis & facturation',
  keywords: ['ribasso sconto capitolato', 'sconto 2%', 'riepilogo capitolato', 'iva offerta edilizia', 'totale offerta edilizia'],
  publishedAt: '2026-10-24',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'In fondo a un capitolato, il riepilogo somma i capitoli e poi applica le deduzioni e l’IVA. Le due deduzioni più comuni, il ribasso e lo sconto, non hanno lo stesso ruolo, e il documento indica in genere in che ordine applicarle.',
    },
    { type: 'h2', text: 'Ribasso e sconto, due cose diverse' },
    {
      type: 'list',
      items: [
        'Il ribasso riduce il prezzo dell’offerta, senza condizioni: è un gesto commerciale, spesso per vincere l’appalto.',
        'Lo sconto è una riduzione concessa se il cliente paga entro un termine breve (per esempio 2 % a 30 giorni). Si applica solo se la condizione è rispettata.',
      ],
    },
    { type: 'h2', text: 'L’ordine più comune' },
    {
      type: 'table',
      headers: ['Riga', 'Calcolo', 'CHF'],
      rows: [
        ['Totale lordo dei capitoli', '', '100’000.00'],
        ['Ribasso 3 %', '100’000 × 3 %', '− 3’000.00'],
        ['Totale dopo ribasso', '', '97’000.00'],
        ['Sconto 2 %', '97’000 × 2 %', '− 1’940.00'],
        ['Totale netto IVA esclusa', '', '95’060.00'],
        ['IVA 8,1 %', '95’060 × 8,1 %', '7’699.86'],
        ['Totale IVA inclusa', '', '102’759.86'],
      ],
    },
    {
      type: 'callout',
      title: 'Seguire sempre il documento',
      text: 'Alcuni capitolati mettono lo sconto dopo l’IVA, altri chiedono un totale netto senza sconto. Fa fede il riepilogo del documento: compilate le righe che prevede, nel suo ordine, invece della vostra presentazione abituale.',
    },
    { type: 'h2', text: 'Gli errori frequenti' },
    {
      type: 'list',
      items: [
        'Sommare ribasso e sconto (5 % sul lordo) invece di applicarli uno dopo l’altro: la differenza è piccola, ma il totale non corrisponde più a quello dell’architetto.',
        'Applicare l’IVA sul lordo e poi dedurre le riduzioni.',
        'Dimenticare che un ribasso indicato nel riepilogo si aggiunge a prezzi unitari già tirati.',
      ],
    },
    {
      type: 'p',
      text: 'L’aliquota normale dell’IVA in Svizzera è dell’8,1 % dal 2024. Un’impresa non assoggettata non aggiunge IVA e deve indicarlo chiaramente.',
    },
    { type: 'h2', text: 'Con Cantia (beta)' },
    {
      type: 'p',
      text: 'Quando compilate un capitolato in Cantia, ribasso, sconto e IVA si impostano nel riepilogo; i totali vengono ricalcolati e scritti al loro posto nel PDF originale. Funzione in beta, dal piano Team (3 capitolati al mese), illimitata con Entreprise.',
    },
    {
      type: 'cta',
      title: 'Un riepilogo giusto, senza calcolatrice',
      text: 'Importate il capitolato, inserite prezzi e riduzioni: Cantia calcola e compila il PDF.',
      buttonLabel: 'Provare 14 giorni',
    },
  ],
  faq: [
    {
      question: 'L’IVA si calcola prima o dopo lo sconto?',
      answer:
        'Il più delle volte dopo le riduzioni, sull’importo netto. Ma prevale il riepilogo del capitolato: seguite l’ordine che indica.',
    },
    {
      question: 'Bisogna concedere uno sconto su un capitolato?',
      answer: 'Non è un obbligo. Alcuni capitolati prevedono la riga e vi lasciano fissare il tasso, altri lo impongono. Uno sconto ha senso solo se vi preme essere pagati in fretta.',
    },
    {
      question: 'Quale aliquota IVA applicare ai lavori di costruzione?',
      answer: 'Di regola l’aliquota normale dell’8,1 %. Un’impresa non assoggettata all’IVA non la fattura.',
    },
  ],
  relatedSlugs: ['remplir-soumission-pdf-architecte', 'erreurs-soumission-qui-coutent-le-marche', 'calculer-prix-unitaire-soumission'],
};
