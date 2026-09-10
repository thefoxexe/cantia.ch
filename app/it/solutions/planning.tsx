import { forceLocale } from '../../../lib/translations';
import { SolutionPage } from '../../../components/SolutionPage';
import { ModuleMockup } from '../../../components/solutions/ModuleMockup';

forceLocale('it');

export default function PlanningSolutionPageIt() {
  return (
    <SolutionPage
      kicker="Pianificazione"
      title="Chi è dove, questa settimana, a colpo d'occhio"
      subtitle="Un vero calendario di squadra: ogni membro, ogni cantiere, ogni giorno. Basta con i planning su carta o in un gruppo WhatsApp da scorrere per ritrovare l'informazione giusta."
      visual={<ModuleMockup kind="planning" />}
      features={[
        {
          icon: 'calendar',
          title: 'Vista a griglia membri × giorni',
          text: "Tutta la squadra e tutta la settimana su un unico schermo, con le assegnazioni di ciascuno visibili a colpo d'occhio.",
        },
        {
          icon: 'layers',
          title: 'Collegata ai Suoi cantieri',
          text: "Ogni assegnazione rimanda a un cantiere reale — dalla pianificazione ritrova direttamente rapporti, foto e preventivi associati.",
        },
        {
          icon: 'users',
          title: 'Presenza in tempo reale',
          text: "Il cruscotto mostra chi è attualmente attivo sull'applicazione, oltre a chi è pianificato dove.",
        },
        {
          icon: 'smartphone',
          title: "Accessibile a tutta la squadra",
          text: "Ogni membro consulta la propria pianificazione dal telefono, senza dipendere da una lavagna in ufficio.",
        },
        {
          icon: 'trending-up',
          title: 'Alimenta la redditività per cantiere',
          text: "I giorni pianificati servono anche a calcolare il costo di manodopera reale di ogni cantiere — nessuna doppia registrazione.",
        },
      ]}
      faq={[
        {
          question: "Come organizzare la pianificazione di una squadra di cantiere?",
          answer: "Cantia mostra un calendario settimanale condiviso: ogni membro vede chi è su quale cantiere, ogni giorno.",
        },
        {
          question: 'La pianificazione sostituisce un foglio Excel o un gruppo WhatsApp?',
          answer: "Sì, tutta la squadra consulta le stesse informazioni in tempo reale, senza file né messaggi da scorrere.",
        },
        {
          question: 'Si possono pianificare più cantieri in parallelo?',
          answer: "Sì, ogni assegnazione è collegata a un cantiere preciso e resta visibile per tutta la settimana, membro per membro.",
        },
        {
          question: 'La pianificazione è inclusa in tutti i piani Cantia?',
          answer: "È disponibile a partire dal piano Team, attivabile dalle impostazioni della Sua organizzazione.",
        },
      ]}
      related={[
        { href: '/it/solutions/rapports-chantier', label: 'Rapporti di cantiere' },
        { href: '/it/solutions/rentabilite', label: 'Redditività per cantiere' },
      ]}
      closingTitle="Una pianificazione che tutta la squadra consulta, non solo il titolare"
      closingText="Il modulo Pianificazione si attiva o disattiva secondo le Sue esigenze, dalle impostazioni della Sua organizzazione."
    />
  );
}
