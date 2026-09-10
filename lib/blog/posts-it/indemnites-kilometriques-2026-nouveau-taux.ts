import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'indemnites-kilometriques-2026-nouveau-taux',
  question: 'Quale tariffa di indennità chilometrica applicare ai propri dipendenti nel 2026?',
  title: 'Indennità chilometriche 2026: la tariffa che è appena cambiata',
  description:
    'Dal 1° gennaio 2026, l’Amministrazione federale delle contribuzioni alza la tariffa forfettaria da CHF 0,70 a CHF 0,75/km, e introduce un nuovo obbligo di dichiarazione sul certificato di salario.',
  excerpt:
    'CHF 0,70 al chilometro, è finita. La nuova guida al certificato di salario fissa CHF 0,75 dal 1° gennaio 2026. Aggiunge anche una casella da spuntare che quasi nessuno conosce ancora.',
  category: 'RH & salaires',
  keywords: ['indennità chilometrica', 'spese professionali', 'certificato di salario', 'veicolo privato', 'afc'],
  publishedAt: '2026-03-30',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'CHF 0,70 al chilometro: la cifra che quasi tutte le aziende svizzere avevano in mente per indennizzare un dipendente che utilizza il proprio veicolo privato. Dal 1° gennaio 2026, non è più la cifra corretta: l’Amministrazione federale delle contribuzioni l’ha alzata a CHF 0,75/km nella sua guida aggiornata per la compilazione del certificato di salario.',
    },
    { type: 'h2', text: 'Cosa copre realmente questa tariffa' },
    {
      type: 'p',
      text: 'È una tariffa forfettaria, destinata a coprire l’insieme delle spese legate all’uso professionale di un veicolo privato (carburante, usura, assicurazione, ammortamento), senza che il dipendente debba giustificare ogni voce separatamente. Un’azienda resta libera di fissare una tariffa diversa per contratto o accordo interno, ma CHF 0,75/km funge da riferimento predefinito per l’amministrazione fiscale.',
    },
    {
      type: 'callout',
      title: 'La novità che conta più dell’importo stesso',
      text: 'Un’indennità forfettaria per l’uso di un veicolo privato deve ormai essere espressamente segnalata sul certificato di salario, con una crocetta alla lettera F (un obbligo dichiarativo che non esisteva in questa forma prima). Non spuntarla non annulla l’indennità, ma espone a una rettifica in caso di controllo fiscale.',
    },
    { type: 'h2', text: 'Cosa cambia concretamente per un’azienda edile' },
    {
      type: 'list',
      items: [
        'Le indennità chilometriche versate dopo il 1° gennaio 2026 devono utilizzare la nuova tariffa di riferimento per restare allineate con la guida AFC',
        'Il certificato di salario di fine anno deve riflettere la nuova casella spuntata per ogni dipendente che riceve questo tipo di indennità',
        'Una tariffa diversa, fissata contrattualmente, resta possibile. Uno scarto significativo rispetto alla tariffa di riferimento può tuttavia attirare l’attenzione in un controllo',
      ],
    },
    {
      type: 'p',
      text: 'Per un team che si sposta molto da un cantiere all’altro, la differenza tra CHF 0,70 e CHF 0,75 al chilometro non è cosmetica sull’intero anno: per 15’000 km percorsi, rappresenta CHF 750 in più da versare, oppure, in mancanza di aggiornamento, CHF 750 al di sotto del barema di riferimento.',
    },
    {
      type: 'cta',
      title: 'La tariffa chilometrica, configurabile per organizzazione',
      text: 'Cantia permette di definire una tariffa di indennità chilometrica propria alla Sua azienda, applicata automaticamente alle note spese del team.',
      buttonLabel: 'Scoprire RH & Stipendi',
    },
  ],
  faq: [
    {
      question: 'Qual è la nuova tariffa di indennità chilometrica in Svizzera nel 2026?',
      answer:
        'CHF 0,75 al chilometro dal 1° gennaio 2026, contro CHF 0,70 in precedenza, secondo la guida aggiornata dell’Amministrazione federale delle contribuzioni per la compilazione del certificato di salario.',
    },
    {
      question: 'Un’azienda deve obbligatoriamente applicare questa tariffa?',
      answer:
        'No, resta libera di fissare una tariffa diversa per contratto o accordo interno: CHF 0,75/km funge da riferimento predefinito per l’amministrazione fiscale, non da soglia minima legale obbligatoria.',
    },
    {
      question: 'Cosa deve ormai figurare sul certificato di salario?',
      answer:
        'Una crocetta alla lettera F, che segnala esplicitamente che un’indennità forfettaria per l’uso di un veicolo privato a fini professionali è stata versata al dipendente durante l’anno.',
    },
  ],
  relatedSlugs: [
    'heures-supplementaires-batiment-majoration-25',
    'salaire-minimum-cct-construction-suisse',
    'calculer-heures-travail-ouvrier-minutes-decimales',
  ],
};
