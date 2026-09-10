import { forceLocale } from '../../../lib/translations';
import { SolutionPage } from '../../../components/SolutionPage';
import { ModuleMockup } from '../../../components/solutions/ModuleMockup';

forceLocale('it');

export default function RentabiliteSolutionPageIt() {
  return (
    <SolutionPage
      kicker="Redditività"
      title="Sapere finalmente se un cantiere Le ha fatto guadagnare denaro"
      subtitle="Molte imprese edili preventivano, eseguono e fatturano un cantiere senza mai confrontare ciò che è stato preventivato con ciò che è realmente costato. Cantia lo fa per Lei, cantiere per cantiere."
      visual={<ModuleMockup kind="rentabilite" />}
      features={[
        {
          icon: 'trending-up',
          title: 'Preventivato vs. costo reale',
          text: "L'importo del preventivo accettato confrontato con il costo reale del cantiere — materiale e manodopera — con un margine visualizzato in CHF e in %.",
        },
        {
          icon: 'camera',
          title: 'Uno scontrino fotografato, una spesa registrata',
          text: "Fotografi uno scontrino o una fattura fornitore: fornitore e importo vengono letti automaticamente. Oppure lo dica semplicemente a voce — l'assistente vocale, accessibile da tutta l'applicazione, capisce il cantiere e l'importo e Le fa confermare prima di registrare.",
        },
        {
          icon: 'calendar',
          title: 'Manodopera senza doppia registrazione',
          text: "Il costo della manodopera viene calcolato dalle ore effettivamente registrate in HR & Salari (o una stima dalla pianificazione finché non è ancora stata inserita alcuna ora) — nessuna registrazione separata da fare.",
        },
        {
          icon: 'alert-triangle',
          title: 'Avviso visivo immediato',
          text: "Un badge verde, arancione o rosso indica a colpo d'occhio se il cantiere è redditizio, ha un margine ristretto o è in perdita.",
        },
        {
          icon: 'bar-chart-2',
          title: 'Cantiere per cantiere',
          text: "Confronti il margine di più cantieri per individuare rapidamente quelli che tirano verso il basso la Sua redditività.",
        },
        {
          icon: 'shopping-bag',
          title: 'Tutte le spese in un unico posto',
          text: "La sezione Spese raggruppa in un elenco filtrabile gli acquisti di tutti i Suoi cantieri e le Sue spese generali — crei, modifichi o elimini queste ultime direttamente da qui, con un link diretto al cantiere interessato per le altre.",
        },
      ]}
      faq={[
        {
          question: 'Come si sa se un cantiere è redditizio?',
          answer:
            "Cantia confronta il preventivo accettato (ricavo) con il costo reale — materiale registrato e manodopera derivata dalle ore inserite — e mostra il margine in CHF e in % in tempo reale.",
        },
        {
          question: 'Da dove viene il calcolo del costo della manodopera?',
          answer:
            "Dalle ore effettivamente inserite per questo cantiere in HR & Salari, moltiplicate per il costo orario della Sua azienda. Finché non è ancora stata registrata alcuna ora, Cantia mostra una stima basata sulla pianificazione di squadra.",
        },
        {
          question: 'Si possono confrontare più cantieri tra loro?',
          answer: "Sì, ogni cantiere mostra il proprio margine, il che permette di individuare rapidamente i cantieri in perdita.",
        },
        {
          question: 'La redditività per cantiere è inclusa in tutti i piani Cantia?',
          answer: "È disponibile a partire dal piano Team, attivabile dalle impostazioni della Sua organizzazione.",
        },
      ]}
      related={[
        { href: '/it/solutions/devis', label: 'Preventivi online' },
        { href: '/it/solutions/facturation', label: 'Fatturazione & fattura QR' },
        { href: '/it/solutions/planning', label: "Pianificazione di squadra" },
        { href: '/it/solutions/travaux-supplementaires', label: 'Lavori supplementari' },
      ]}
      closingTitle="Non scopra più i Suoi margini a fine anno"
      closingText="Il modulo Redditività si attiva o disattiva secondo le Sue esigenze, dalle impostazioni della Sua organizzazione."
    />
  );
}
