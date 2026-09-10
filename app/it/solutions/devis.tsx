import { forceLocale } from '../../../lib/translations';
import { SolutionPage } from '../../../components/SolutionPage';
import { ModuleMockup } from '../../../components/solutions/ModuleMockup';

forceLocale('it');

export default function DevisSolutionPageIt() {
  return (
    <SolutionPage
      kicker="Preventivi"
      title="Preventivi dettagliati in pochi minuti, non a fine giornata"
      subtitle="Detti le voci del preventivo a voce alta in cantiere o in auto. Cantia le trasforma in posizioni con prezzo, riprende i Suoi prezzi abituali dal catalogo e prepara un PDF pronto per l'invio."
      visual={<ModuleMockup kind="devis" />}
      features={[
        {
          icon: 'mic',
          title: 'Dettatura vocale integrata',
          text: "Descriva il lavoro da svolgere normalmente, come a un collega. La trascrizione e la creazione delle posizioni avvengono automaticamente.",
        },
        {
          icon: 'database',
          title: 'Il Suo catalogo, i Suoi prezzi',
          text: "Ogni descrizione riconosciuta riprende il prezzo e l'unità già in uso — un tubo in PVC viene proposto al metro lineare senza doverlo precisare.",
        },
        {
          icon: 'layout',
          title: 'Modelli di preventivo riutilizzabili',
          text: "Salvi le Sue posizioni tipo (posa di piastrelle, isolamento, ecc.) una volta come modello, poi inizi ogni nuovo preventivo con tutte le righe già presenti — resta solo da adattare le quantità.",
        },
        {
          icon: 'alert-triangle',
          title: 'Avviso in caso di scostamento',
          text: "Se un prezzo inserito differisce da quello già a catalogo, Cantia Glielo segnala prima dell'invio — mai una correzione silenziosa.",
        },
        {
          icon: 'edit-3',
          title: 'Firma integrata',
          text: "Ogni preventivo riporta la firma di chi lo ha redatto e uno spazio per quella del cliente, pronto per essere accettato e rinviato.",
        },
        {
          icon: 'trending-up',
          title: 'Monitoraggio dello stato',
          text: "Bozza, pronto per l'invio, inviato, accettato o rifiutato: sappia sempre a che punto è ogni preventivo senza riaprire le e-mail.",
        },
        {
          icon: 'file-text',
          title: 'Preventivo → fattura in un gesto',
          text: "Un preventivo accettato si trasforma direttamente in fattura, senza dover reinserire le righe.",
        },
      ]}
      steps={[
        { title: 'Crei il preventivo', text: 'Inserisca il cliente, poi detti o digiti le Sue righe.' },
        { title: "L'IA struttura le posizioni", text: 'Quantità, unità e prezzi di catalogo vengono proposti automaticamente.' },
        { title: 'Verifichi e invii', text: 'Corregga se necessario, poi generi il PDF — impaginazione sobria, nei colori del Suo marchio.' },
      ]}
      faq={[
        {
          question: 'Come si fa un preventivo velocemente da artigiano?',
          answer:
            "Detti le Sue righe a voce alta in cantiere o in auto. Cantia le trasforma in posizioni con prezzo usando i Suoi prezzi abituali, e il PDF è pronto ancora prima di aver lasciato il cliente.",
        },
        {
          question: 'Il preventivo è conforme agli usi svizzeri (IVA, impaginazione)?',
          answer:
            "Sì: ogni preventivo riprende la Sua aliquota IVA, i Suoi dati aziendali e può essere personalizzato con il colore del Suo marchio e il Suo logo.",
        },
        {
          question: 'Si può trasformare automaticamente un preventivo accettato in fattura?',
          answer: "Sì, un preventivo accettato si converte in fattura — con fattura QR svizzera — con un clic, senza reinserire le righe.",
        },
        {
          question: 'Cantia è gratuito per fare i preventivi?',
          answer: "Sì, è disponibile gratuitamente una quota mensile di preventivi, senza carta di credito né impegno.",
        },
      ]}
      related={[
        { href: '/it/solutions/facturation', label: 'Fatturazione & fattura QR' },
        { href: '/it/solutions/dictee-vocale', label: 'Dettatura vocale' },
        { href: '/it/solutions/rentabilite', label: 'Redditività per cantiere' },
        { href: '/it/solutions/travaux-supplementaires', label: 'Lavori supplementari' },
      ]}
      closingTitle="Meno tempo sui preventivi, non meno tempo in cantiere"
      closingText="Cantia è gratuito per iniziare, con una quota mensile di preventivi — senza impegno."
    />
  );
}
