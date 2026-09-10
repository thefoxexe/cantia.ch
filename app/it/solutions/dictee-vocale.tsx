import { forceLocale } from '../../../lib/translations';
import { SolutionPage } from '../../../components/SolutionPage';
import { ModuleMockup } from '../../../components/solutions/ModuleMockup';

forceLocale('it');

export default function DicteeVocaleSolutionPageIt() {
  return (
    <SolutionPage
      kicker="Dettatura vocale"
      title="Parli, Cantia scrive"
      subtitle="Preventivi, rapporti, messaggi di squadra: ovunque nell'applicazione, un pulsante per dettare sostituisce la digitazione. Pratico con i guanti, in auto tra un cantiere e l'altro, o semplicemente più veloce che scrivere."
      visual={<ModuleMockup kind="dictee-vocale" />}
      features={[
        {
          icon: 'mic',
          title: "Ovunque nell'applicazione",
          text: "Note di rapporto, righe di preventivo, messaggi del feed di cantiere: il pulsante per dettare è disponibile ovunque Lei scriva.",
        },
        {
          icon: 'cpu',
          title: 'Trascrizione lato server',
          text: "Il riconoscimento vocale avviene su server sicuri, non sul Suo telefono — un risultato affidabile anche nel rumore di un cantiere.",
        },
        {
          icon: 'zap',
          title: 'Posizioni di preventivo generate automaticamente',
          text: "Detti un elenco di lavori, e l'IA ne ricava righe di preventivo con prezzo a partire dal Suo catalogo.",
        },
        {
          icon: 'file-text',
          title: 'Diventa un rapporto redatto',
          text: "Le Sue note vocali vengono riprese direttamente e formattate dal redattore IA dei rapporti di cantiere.",
        },
        {
          icon: 'users',
          title: "Anche per tutta la squadra",
          text: "Ogni membro può dettare i propri messaggi nel feed di cantiere — pratico per segnalare un imprevisto senza smettere di lavorare.",
        },
        {
          icon: 'tool',
          title: 'Vocabolario edile riconosciuto',
          text: "Unità, materiali ed espressioni del mestiere sono ben riconosciuti, non solo vocabolario generico.",
        },
        {
          icon: 'message-circle',
          title: 'Un assistente vocale globale, non solo un campo dettato',
          text: "Dal pulsante microfono flottante, dica «crea un preventivo per Marc Dupont, 20m² di piastrelle a 85 franchi»: l'assistente capisce, prepara il preventivo con cliente e righe già compilati, e Le lascia confermare. Funziona anche per creare direttamente una fattura, o per porre una domanda — «quali fatture sono in ritardo?», «riassumi i miei compiti» — con una vera risposta basata sui dati della Sua azienda.",
        },
      ]}
      faq={[
        {
          question: 'La dettatura vocale funziona bene con il vocabolario edile?',
          answer:
            "Sì, il riconoscimento è adattato al vocabolario tecnico dell'edilizia — materiali, unità, mestieri — non solo al linguaggio comune.",
        },
        {
          question: "L'assistente vocale può creare un preventivo o una fattura da solo?",
          answer:
            "Prepara il documento — cliente e prestazioni dettate già compilati — e La porta alla schermata di creazione per verificare e salvare Lei stesso. Nulla viene mai creato senza questa conferma.",
        },
        {
          question: 'Serve una connessione internet per dettare?',
          answer:
            "Sì, la dettatura richiede una connessione per la trascrizione, ma i preventivi e i rapporti generati restano consultabili una volta creati.",
        },
        {
          question: 'Dove si può usare la dettatura vocale in Cantia?',
          answer: "Sui preventivi, sui rapporti di cantiere e sui messaggi di squadra del feed — ovunque Lei scriva.",
        },
        {
          question: 'La dettatura vocale è più veloce della tastiera sul campo?',
          answer:
            "Per la maggior parte degli artigiani in cantiere, sì — parlare è più veloce che digitare su un telefono con le mani sporche o i guanti.",
        },
      ]}
      related={[
        { href: '/it/solutions/devis', label: 'Preventivi online' },
        { href: '/it/solutions/rapports-chantier', label: 'Rapporti di cantiere' },
      ]}
      closingTitle="Meno tempo a digitare, più tempo in cantiere"
      closingText="La dettatura vocale è inclusa in tutti i piani Cantia, senza eccezioni."
    />
  );
}
