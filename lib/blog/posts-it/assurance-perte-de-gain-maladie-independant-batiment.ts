import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'assurance-perte-de-gain-maladie-independant-batiment',
  question: 'Un indipendente dell’edilizia è coperto in caso di malattia?',
  title: 'Malattia quando si è indipendenti: cosa NON è coperto',
  description:
    'La LAMal paga le cure, mai il reddito perso. Senza un’assicurazione perdita di guadagno per malattia sottoscritta volontariamente, un indipendente in malattia non ha diritto ad alcun reddito sostitutivo.',
  excerpt:
    'Un indipendente costretto a letto per tre settimane non riceve nulla, a meno che non abbia lui stesso sottoscritto un’assicurazione che nulla lo obbliga ad avere. La LAMal copre solo le cure, mai il salario perso.',
  category: 'Juridique & normes',
  keywords: ['perdita di guadagno malattia', 'indipendente', 'lamal', 'indennità giornaliere', 'assicurazione malattia'],
  publishedAt: '2026-05-04',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Un dipendente in malattia continua in genere a percepire il suo salario per un certo periodo, tramite il datore di lavoro o un’assicurazione collettiva. Un indipendente dell’edilizia, invece, non riceve nulla per default: tre settimane di malattia senza un’assicurazione specifica significano tre settimane senza alcun reddito sostitutivo.',
    },
    { type: 'h2', text: 'La confusione più frequente: LAMal non significa reddito garantito' },
    {
      type: 'p',
      text: 'La LAMal (assicurazione malattia di base, obbligatoria per ogni residente svizzero) copre le cure mediche: consultazioni, ricoveri, medicinali. Non sostituisce mai un reddito perso. Le indennità giornaliere in caso di malattia rientrano in un regime totalmente distinto e facoltativo.',
    },
    {
      type: 'callout',
      title: 'Due modi per coprirsi, nessuno obbligatorio',
      text: 'Un’assicurazione di indennità giornaliera malattia (IGM) può essere sottoscritta sia come assicurazione privata disciplinata dalla LCA (legge sul contratto d’assicurazione), sia come assicurazione facoltativa d’indennità giornaliera rientrante essa stessa nella LAMal. In entrambi i casi, la scelta resta volontaria, nulla la impone legalmente a un indipendente.',
    },
    { type: 'h2', text: 'Cosa significa in pratica' },
    {
      type: 'list',
      items: [
        'Senza IGM, una malattia di più settimane può mettere in pericolo la liquidità personale e professionale di un indipendente senza altro reddito',
        'Il termine di attesa (periodo prima che le indennità comincino a decorrere) varia a seconda del contratto sottoscritto, un punto da verificare prima di considerare una copertura sufficiente',
        'Più l’attività dipende fisicamente dalla presenza dell’indipendente sul cantiere (a differenza di un ruolo di gestione a distanza), più l’assenza di copertura pesa in caso di incapacità',
      ],
    },
    { type: 'h2', text: 'Un tassello di un puzzle più ampio' },
    {
      type: 'p',
      text: 'L’assicurazione perdita di guadagno malattia si aggiunge a una lista di decisioni previdenziali che un indipendente deve prendere da solo, in assenza di obbligo legale: AVS/AI obbligatoria, LPP facoltativa, LAINF generalmente facoltativa senza dipendenti, e ora l’IGM. Nessuno di questi tasselli si mette in atto automaticamente: ognuno richiede un passo volontario, spesso trascurato nei primi anni di attività, quando la priorità va al fatturato piuttosto che alla previdenza.',
    },
    {
      type: 'cta',
      title: 'Una redditività chiara, anche per anticipare queste decisioni',
      text: 'Vedere con precisione cosa rende ogni cantiere aiuta anche a preventivare serenamente una previdenza volontaria, e il modulo Redditività di Cantia offre proprio questa visibilità continua.',
      buttonLabel: 'Scoprire la redditività per cantiere',
    },
  ],
  faq: [
    {
      question: 'La LAMal copre la perdita di reddito in caso di malattia per un indipendente?',
      answer:
        'No, la LAMal copre solo le cure mediche. Una perdita di reddito è coperta solo da un’assicurazione di indennità giornaliera malattia sottoscritta volontariamente.',
    },
    {
      question: 'Un indipendente è obbligato a sottoscrivere un’assicurazione perdita di guadagno malattia?',
      answer:
        'No, questa assicurazione resta interamente facoltativa in Svizzera, sia sotto forma di assicurazione privata (LCA) sia di assicurazione facoltativa collegata alla LAMal.',
    },
    {
      question: 'Cosa succede a un indipendente senza copertura in caso di malattia prolungata?',
      answer:
        'Non percepisce alcun reddito sostitutivo durante l’incapacità, il che può rapidamente pesare sulla sua liquidità personale e professionale.',
    },
  ],
  relatedSlugs: [
    'avs-ai-independant-batiment',
    'lpp-deuxieme-pilier-independant-batiment',
    'assurance-rc-professionnelle-batiment-obligatoire',
  ],
};
