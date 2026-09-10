import { forceLocale } from '../../../lib/translations';
import { SolutionPage } from '../../../components/SolutionPage';
import { ModuleMockup } from '../../../components/solutions/ModuleMockup';

forceLocale('it');

export default function RhSalairesSolutionPageIt() {
  return (
    <SolutionPage
      kicker="HR & Salari"
      title="Ore, spese e salari di tutta la squadra, in un unico posto"
      subtitle="Ogni dipendente registra le proprie ore cantiere per cantiere e le proprie spese professionali. La segretaria o l'amministratore gestisce la busta paga di ciascuno — tariffa, contributi e salario netto — senza fogli di calcolo separati."
      visual={<ModuleMockup kind="rh-salaires" />}
      features={[
        {
          icon: 'clock',
          title: 'Registrazione per cantiere',
          text: "Ogni membro inserisce le proprie ore lavorate, cantiere per cantiere e giorno per giorno, in pochi tocchi.",
        },
        {
          icon: 'truck',
          title: 'Spese professionali',
          text: "Chilometri o altre spese, con un'indennità chilometrica definita una volta per tutta l'azienda.",
        },
        {
          icon: 'download',
          title: 'Esportazione giornaliera, settimanale o mensile',
          text: "Ogni dipendente esporta il proprio foglio ore in formato CSV, con la granularità di sua scelta.",
        },
        {
          icon: 'user',
          title: 'Busta paga per dipendente',
          text: "La segretaria HR o l'amministratore apre la scheda di ogni membro: tariffa oraria o salario fisso, storico delle ore e delle spese.",
        },
        {
          icon: 'percent',
          title: 'Lordo → netto con contributi',
          text: "AVS/AD, LPP, LAINF e imposta alla fonte: ogni aliquota è modificabile per dipendente, e il salario netto si calcola automaticamente.",
        },
        {
          icon: 'lock',
          title: 'Riservatezza tramite permessi',
          text: "Un dipendente vede solo le proprie ore e spese — le buste paga restano riservate alla segretaria HR e agli amministratori.",
        },
      ]}
      faq={[
        {
          question: 'Chi può vedere i salari in Cantia?',
          answer:
            "Solo la segretaria HR e gli amministratori dell'azienda, secondo i permessi assegnati da Squadra. Un dipendente standard vede solo le proprie ore e spese.",
        },
        {
          question: 'Cantia calcola automaticamente i contributi sociali svizzeri?',
          answer:
            "Cantia calcola il salario netto a partire da aliquote AVS/AD/LPP/LAINF e da un'aliquota d'imposta alla fonte che Lei configura per dipendente — le aliquote predefinite sono indicative, da adattare secondo la Sua cassa di compensazione, la Sua cassa LPP e il cantone.",
        },
        {
          question: "Come esporta un dipendente il proprio foglio ore?",
          answer:
            "Dal modulo HR & Salari, scegliendo la granularità — giornaliera, settimanale o mensile — poi scaricando un file CSV.",
        },
        {
          question: "Il modulo HR & Salari è incluso in tutti i piani Cantia?",
          answer: "È disponibile a partire dal piano Team, attivabile dalle impostazioni della Sua organizzazione.",
        },
      ]}
      related={[
        { href: '/it/solutions/planning', label: "Pianificazione di squadra" },
        { href: '/it/solutions/rentabilite', label: 'Redditività per cantiere' },
        { href: '/it/solutions/facturation', label: 'Fatturazione & fattura QR' },
        { href: '/it/solutions/tresorerie', label: 'Tesoreria previsionale' },
      ]}
      closingTitle="Basta con i fogli ore sparsi"
      closingText="Il modulo HR & Salari si attiva dalle impostazioni della Sua organizzazione, a partire dal piano Team."
    />
  );
}
