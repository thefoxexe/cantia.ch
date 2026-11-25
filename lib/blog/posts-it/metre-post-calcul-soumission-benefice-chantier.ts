import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'metre-post-calcul-soumission-benefice-chantier',
  question: 'Come sapere, a cantiere finito, se un capitolato vi ha fatto davvero guadagnare?',
  title: 'Computo e consuntivo: il preventivo vi ha fatto davvero guadagnare?',
  description:
    'Il capitolato dice cosa avete venduto, il computo cosa avete eseguito. Confrontarli posizione per posizione mostra dove guadagnate e dove perdete denaro.',
  excerpt:
    'Un capitolato vinto non è ancora un cantiere redditizio. Tra quantità che cambiano, rese e imprevisti, solo il consuntivo dice se avete guadagnato davvero.',
  category: 'Chantier & rentabilité',
  keywords: ['computo metrico cantiere', 'consuntivo cantiere', 'consuntivo edilizia', 'quantità eseguite', 'prezzo unitario capitolato', 'redditività cantiere'],
  publishedAt: '2026-11-25',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'Quando compilate un capitolato, fissate un prezzo unitario per ogni posizione, sulla base delle quantità dell’architetto e delle vostre rese abituali. Poi inizia il cantiere: alcune quantità aumentano, altre diminuiscono, una cassaforma richiede più tempo del previsto, si aggiunge un lavoro non previsto. Senza consuntivo non sapete se il capitolato vi ha fatto guadagnare o se vi è costato.',
    },
    { type: 'h2', text: 'Capitolato, computo, consuntivo: di cosa parliamo?' },
    {
      type: 'list',
      items: [
        'Il capitolato: cosa avete offerto, con le quantità del documento e i vostri prezzi unitari.',
        'Il computo: le quantità realmente eseguite in cantiere, misurate o rilevate posizione per posizione.',
        'Il consuntivo: il confronto tra ciò che potete fatturare e ciò che ogni posizione vi è costata davvero.',
      ],
    },
    { type: 'h2', text: 'Cosa cambia il computo in un contratto a prezzi unitari' },
    {
      type: 'p',
      text: 'Con un contratto a prezzi unitari fatturate le quantità realmente eseguite ai prezzi unitari del capitolato. Se la platea richiede 46 m³ di calcestruzzo invece dei 42 m³ previsti, fatturate 46 m³. Il computo serve quindi due volte: per la fattura e per sapere cosa vi lascia ogni posizione, dedotti i costi.',
    },
    { type: 'h2', text: 'Il consuntivo passo per passo' },
    {
      type: 'list',
      ordered: true,
      items: [
        'Partite dal capitolato compilato: stessi capitoli, stesse posizioni, stesse unità.',
        'Per ogni posizione rilevate la quantità realmente eseguita.',
        'Calcolate il fatturabile: quantità eseguita × prezzo unitario del capitolato.',
        'Mettete a confronto il costo reale per unità: ore al costo orario reale, materiale, noleggio macchine, subappalto.',
        'Utile della posizione = fatturabile − (quantità eseguita × costo reale per unità). Poi sommate per capitolo e per tutto il cantiere, senza dimenticare ribasso e sconto concessi nel capitolato.',
      ],
    },
    { type: 'h2', text: 'Esempio di calcolo su due posizioni' },
    {
      type: 'table',
      headers: ['Posizione', 'Capitolato', 'Eseguito e costo reale', 'Fatturabile', 'Costo reale', 'Utile'],
      rows: [
        ['Calcestruzzo per platea', '42 m³ × CHF 210', '46 m³ × CHF 168', 'CHF 9’660', 'CHF 7’728', 'CHF 1’932'],
        ['Casseforme dei muri', '180 m² × CHF 38', '196 m² × CHF 41', 'CHF 7’448', 'CHF 8’036', '− CHF 588'],
      ],
    },
    {
      type: 'p',
      text: 'Su queste due posizioni il totale resta positivo: CHF 1’344. Eppure le casseforme costano più di quanto rendono. Il totale nasconde una posizione da ricalcolare prima del prossimo capitolato.',
    },
    {
      type: 'callout',
      title: 'La trappola: guardare solo il totale',
      text: 'Un cantiere in utile può nascondere diverse posizioni in perdita, compensate da una o due posizioni molto redditizie. Finché il consuntivo si ferma al totale, quelle posizioni restano calcolate male da un capitolato all’altro.',
    },
    { type: 'h2', text: 'Cosa fare di una posizione in perdita?' },
    {
      type: 'list',
      items: [
        'Verificare la resa: il tempo realmente impiegato per unità corrisponde a quello usato per il calcolo?',
        'Rivedere il prezzo unitario della posizione nel vostro catalogo, per il prossimo capitolato.',
        'Verificare se la perdita viene da una condizione particolare del cantiere (accesso, altezza, meteo) da menzionare nell’offerta.',
        'Confrontare con il costo di un subappalto per questo tipo di lavoro.',
      ],
    },
    { type: 'h2', text: 'E i lavori che non erano nel capitolato?' },
    {
      type: 'p',
      text: 'Un lavoro aggiunto durante il cantiere non ha un prezzo nel capitolato. Va calcolato e fatturato a parte, idealmente accettato per iscritto prima dell’esecuzione. Nel consuntivo il suo costo conta comunque: se non viene fatturato, riduce direttamente l’utile del cantiere.',
    },
    {
      type: 'cta',
      title: 'Il consuntivo in Cantia',
      text: 'Con il modulo Computi riprendete il capitolato del cantiere in un clic, inserite quantità eseguite e costi reali e aggiungete i lavori in più. Cantia mostra fatturabile, costo reale, utile e margine, posizione per posizione.',
      buttonLabel: 'Provare 14 giorni',
    },
  ],
  faq: [
    {
      question: 'Qual è la differenza tra capitolato e computo?',
      answer:
        'Il capitolato contiene ciò che avete offerto: quantità previste e prezzi unitari. Il computo rileva le quantità realmente eseguite in cantiere. Il confronto tra i due, con i vostri costi reali, dà l’utile di ogni posizione.',
    },
    {
      question: 'Come si calcola l’utile di una posizione?',
      answer:
        'Fatturabile = quantità eseguita × prezzo unitario del capitolato. Costo reale = quantità eseguita × costo reale per unità. L’utile è la differenza.',
    },
    {
      question: 'Quando fare il consuntivo di un cantiere?',
      answer:
        'Appena le quantità sono note, idealmente già durante il cantiere per correggere il tiro, e al più tardi alla fattura finale, quando il computo è pronto.',
    },
  ],
  relatedSlugs: ['calculer-prix-unitaire-soumission', 'rabais-escompte-tva-ordre-soumission', 'comprendre-soumission-can-positions'],
};
