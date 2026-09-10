import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'lpp-deuxieme-pilier-independant-batiment',
  question: 'Un indipendente dell’edilizia deve versare contributi al 2° pilastro (LPP)?',
  title: 'LPP per un indipendente dell’edilizia: obbligatoria o no?',
  description:
    'Il 2° pilastro (LPP) non è obbligatorio per un indipendente svizzero, ad eccezione di alcuni mestieri dell’edilizia legati alla SUVA. Il punto completo.',
  excerpt:
    'La LPP è facoltativa per un indipendente. Salvo che in alcuni mestieri dell’edilizia, la SUVA può decidere diversamente senza che nessuno La avvisi.',
  category: 'Juridique & normes',
  keywords: ['lpp', '2° pilastro', 'indipendente', 'suva', 'laa', 'previdenza'],
  publishedAt: '2026-01-29',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Molti artigiani che si mettono in proprio suppongono che tutte le assicurazioni sociali svizzere funzionino allo stesso modo obbligatorio dell’AVS. Falso per il 2° pilastro. Ma la risposta si complica seriamente non appena si entra in alcuni mestieri dell’edilizia coperti dalla SUVA.',
    },
    { type: 'h2', text: 'La regola generale: facoltativa, punto' },
    {
      type: 'p',
      text: 'Per un dipendente, la LPP diventa obbligatoria a partire da una soglia salariale precisa (il «salario coordinato»). Per un indipendente, resta facoltativa: è possibile affiliarsi volontariamente presso una cassa di previdenza o l’istituto collettore, ma nessun obbligo legale sussiste.',
    },
    {
      type: 'callout',
      title: 'Perché affiliarsi volontariamente comunque',
      text: 'Senza 2° pilastro, un indipendente conta solo sull’AVS e sul proprio risparmio privato per la pensione. I contributi LPP volontari sono anche deducibili fiscalmente, il che ne fa a un tempo uno strumento di previdenza e di ottimizzazione fiscale, da valutare con un professionista secondo la situazione esatta.',
    },
    { type: 'h2', text: 'L’eccezione che trae in inganno tutti: la LAINF/SUVA' },
    {
      type: 'p',
      text: 'Ciò che complica la questione non è direttamente la LPP, bensì la LAINF (assicurazione contro gli infortuni). Per i dipendenti è obbligatoria e gestita dalla SUVA in numerosi mestieri dell’edilizia considerati a rischio, tra cui il grezzo, la copertura, il ponteggio e il genio civile. Per un indipendente senza personale, la LAINF resta in linea di principio facoltativa, salvo in alcuni mestieri in cui la SUVA impone un’affiliazione anche all’indipendente stesso, sulla base di un elenco regolamentare che poche persone consultano prima di firmare il loro primo cantiere.',
    },
    {
      type: 'list',
      items: [
        'LPP (2° pilastro pensionistico): facoltativa per ogni indipendente, senza eccezione legata al mestiere',
        'LAINF (infortuni): facoltativa per l’indipendente senza personale, obbligatoria per i suoi dipendenti dal primo assunto',
        'Alcuni mestieri a rischio dell’edilizia possono ricadere sotto affiliazione SUVA obbligatoria anche per l’indipendente (da verificare caso per caso)',
      ],
    },
    { type: 'h2', text: 'Il vero punto di svolta: il primo dipendente' },
    {
      type: 'p',
      text: 'Un indipendente che assume il suo primo collaboratore diventa datore di lavoro ai sensi delle assicurazioni sociali: LAINF obbligatoria per quel collaboratore, LPP obbligatoria non appena il suo salario supera la soglia d’entrata fissata ogni anno. È il momento amministrativo più sottovalutato della prima assunzione: il numero di moduli raddoppia senza che ce lo si aspetti.',
    },
    {
      type: 'cta',
      title: 'Gli stipendi del team, nello stesso posto del cantiere',
      text: 'Il modulo RH & Stipendi di Cantia centralizza ore, stipendi e oneri del Suo team, senza dover destreggiarsi tra tre strumenti diversi a ogni fine mese.',
      buttonLabel: 'Scoprire RH & Stipendi',
    },
  ],
  faq: [
    {
      question: 'Un indipendente dell’edilizia deve obbligatoriamente versare contributi al 2° pilastro?',
      answer:
        'No, in linea generale la LPP resta facoltativa per ogni indipendente in Svizzera. Può affiliarvisi volontariamente ma non vi è legalmente tenuto.',
    },
    {
      question: 'La SUVA può imporre un’assicurazione a un indipendente senza dipendenti?',
      answer:
        'In alcuni mestieri dell’edilizia considerati a rischio, l’affiliazione alla LAINF/SUVA può essere obbligatoria anche per l’indipendente stesso, poiché dipende dall’attività esatta esercitata, da verificare presso la SUVA.',
    },
    {
      question: 'Cosa diventa l’obbligo LPP non appena si assume un primo dipendente?',
      answer:
        'Dal primo dipendente, il datore di lavoro deve affiliarlo obbligatoriamente alla LAINF, e alla LPP non appena il suo salario annuo supera la soglia d’entrata fissata ogni anno dalla Confederazione.',
    },
  ],
  relatedSlugs: [
    'avs-ai-independant-batiment',
    'calculer-heures-travail-ouvrier-minutes-decimales',
    'sous-traitant-batiment-suisse-contrat-facturation',
  ],
};
