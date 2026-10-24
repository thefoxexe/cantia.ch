import { forceLocale } from '../../../lib/translations';
import { SolutionPage } from '../../../components/SolutionPage';
import { ModuleMockup } from '../../../components/solutions/ModuleMockup';

forceLocale('it');

export default function SoumissionsSolutionPageIt() {
  return (
    <SolutionPage
      kicker="Compilare un capitolato · Beta"
      title="Il capitolato ricevuto, compilato con i vostri prezzi"
      subtitle="L’architetto vi invia un capitolato in PDF. Cantia ne riprende le posizioni, voi inserite i prezzi e rinviate il PDF originale compilato: prezzi unitari, importi, riporti di pagina e totali al loro posto."
      visual={<ModuleMockup kind="soumissions" />}
      features={[
        {
          icon: 'upload',
          title: 'Il PDF ricevuto, così com’è',
          text: 'Importate il capitolato dell’architetto o del committente, CPN o no. Capitoli, posizioni, unità e quantità vengono ripresi automaticamente, anche da un documento scansionato.',
        },
        {
          icon: 'check-square',
          title: 'Verificate prima di prezzare',
          text: 'Una schermata di verifica mostra posizione per posizione ciò che è stato letto e pone domande quando un passaggio è ambiguo. Nulla viene aggiunto senza di voi.',
        },
        {
          icon: 'lock',
          title: 'Le quantità del documento restano intatte',
          text: 'Compilate solo il prezzo. Le quantità sono quelle dell’architetto; quando il documento lascia una quantità da indicare, la inserite voi.',
        },
        {
          icon: 'zap',
          title: 'Prezzare da tastiera, in fretta',
          text: 'Frecce su e giù per passare da una posizione all’altra, prezzi ripresi dal vostro catalogo per numero di posizione e dai capitolati precedenti. Il totale si ricalcola a ogni prezzo.',
        },
        {
          icon: 'file-text',
          title: 'Il PDF originale, compilato',
          text: 'Cantia scrive prezzi unitari e importi nel PDF ricevuto, con riporti di pagina, sconto, sconto cassa, IVA e i dati della vostra impresa. Rinviate il documento atteso, non una tabella a parte.',
        },
        {
          icon: 'archive',
          title: 'Archiviato nel cantiere',
          text: 'Ogni capitolato resta nel suo cantiere, accanto a documenti e foto, e tutti si ritrovano nel menu Capitolati.',
        },
      ]}
      steps={[
        { title: 'Importate il PDF', text: 'Da un computer, scegliete il cantiere e poi il capitolato ricevuto.' },
        { title: 'Inserite i prezzi', text: 'Posizione per posizione, da tastiera, con i vostri prezzi abituali proposti.' },
        { title: 'Rinviate il PDF compilato', text: 'Scaricate il PDF originale completato, pronto da firmare e inviare.' },
      ]}
      faq={[
        {
          question: 'Che cos’è «Compilare un capitolato» in Cantia?',
          answer:
            'Una funzione in beta per rispondere ai capitolati ricevuti in PDF: Cantia riprende le posizioni del documento, voi inserite i prezzi e ottenete il PDF originale compilato con prezzi unitari, importi, riporti e totali.',
        },
        {
          question: 'In quali piani è disponibile?',
          answer: 'Dal piano Team, con 3 capitolati al mese. Il piano Entreprise li rende illimitati. Non è inclusa nel piano Essenziale.',
        },
        {
          question: 'Quali capitolati si possono importare?',
          answer:
            'I capitolati in PDF, strutturati secondo il CPN o no, compresi i documenti scansionati. Cantia non crea capitolati vuoti: la funzione serve a rispondere a quelli che ricevete.',
        },
        {
          question: 'Perché la funzione è in beta?',
          answer:
            'Ogni architetto impagina i capitolati a modo suo. La lettura copre già i casi correnti; la schermata di verifica vi permette di correggere ciò che non è stato letto bene, e ogni riscontro ci aiuta a migliorare.',
        },
        {
          question: 'Si può compilare un capitolato dal telefono?',
          answer: 'Sul telefono i capitolati si consultano. L’importazione e i prezzi si fanno al computer, dove si vede l’intero documento.',
        },
        {
          question: 'Per quali mestieri?',
          answer: 'Per le imprese edili e del genio civile: muratura, opere grezze, elettricità, sanitari, riscaldamento, falegnameria, pittura, gessatura e gli altri mestieri che rispondono a capitolati.',
        },
      ]}
      related={[
        { href: '/it/solutions/devis', label: 'Preventivi' },
        { href: '/it/solutions/planning', label: 'Pianificazione' },
        { href: '/it/solutions/rentabilite', label: 'Redditività per cantiere' },
      ]}
      closingTitle="Rispondete a più capitolati, con meno serate al computer"
      closingText="Compilare un capitolato è in beta, dal piano Team (3 al mese) e illimitato con il piano Entreprise. 14 giorni di prova, senza impegno."
    />
  );
}
