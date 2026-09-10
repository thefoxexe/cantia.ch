import { forceLocale } from '../../../lib/translations';
import { SolutionPage } from '../../../components/SolutionPage';
import { ModuleMockup } from '../../../components/solutions/ModuleMockup';

forceLocale('it');

export default function FacturationSolutionPageIt() {
  return (
    <SolutionPage
      kicker="Fatturazione"
      title="Fatture con vera polizza QR svizzera, senza software a parte"
      subtitle="Ogni fattura Cantia integra automaticamente la fattura QR svizzera conforme alla norma — IBAN, riferimento strutturato e importo già codificati, pronti per essere scansionati da qualsiasi app bancaria."
      visual={<ModuleMockup kind="facturation" />}
      features={[
        {
          icon: 'file-text',
          title: 'Fattura QR generata automaticamente',
          text: "Inserisca il Suo IBAN una sola volta nelle impostazioni: ogni fattura riceve poi la sua polizza di pagamento QR conforme, senza alcuna operazione manuale.",
        },
        {
          icon: 'hash',
          title: 'Riferimento strutturato',
          text: "Ogni fattura ha il proprio riferimento (QRR o SCOR a seconda del Suo IBAN), riconosciuto automaticamente dalle banche svizzere al momento del pagamento.",
        },
        {
          icon: 'search',
          title: 'Riconciliazione per riferimento',
          text: "Cerchi e riconcili un pagamento ricevuto direttamente dal suo numero di riferimento, senza dover indovinare a quale fattura corrisponde.",
        },
        {
          icon: 'pie-chart',
          title: 'Cruscotto fatturazione',
          text: "Stati, scadenze e panoramica di quanto incassato o in attesa, su tutti i Suoi cantieri.",
        },
        {
          icon: 'clipboard',
          title: 'Preventivo → fattura senza reinserimento',
          text: "Un preventivo accettato diventa una fattura in un gesto, con le stesse righe e lo stesso cliente.",
        },
        {
          icon: 'percent',
          title: 'Fatturi un acconto',
          text: "Emetta una fattura d'acconto per una percentuale del preventivo prima di iniziare, poi la fattura finale deduce automaticamente quanto già incassato.",
        },
        {
          icon: 'layers',
          title: 'Pagamenti parziali monitorati automaticamente',
          text: "Registri ogni versamento ricevuto: il saldo residuo si aggiorna da solo, la fattura passa a «parzialmente pagata» poi a «pagata» non appena l'importo corrisponde.",
        },
        {
          icon: 'shield',
          title: 'Ospitato in Svizzera',
          text: "Le Sue fatture e i dati dei clienti restano su server situati in Svizzera, criptati.",
        },
      ]}
      steps={[
        { title: 'Inserisca il Suo IBAN', text: 'Una sola volta, in Account → Profilo aziendale.' },
        { title: 'Converta o crei una fattura', text: 'Da un preventivo accettato, o direttamente.' },
        { title: 'Invii il PDF', text: 'La fattura QR è già integrata — il Suo cliente scansiona e paga dalla sua app bancaria.' },
      ]}
      faq={[
        {
          question: 'Come si crea una fattura con fattura QR svizzera?',
          answer:
            "Inserisca il Suo IBAN una sola volta nelle impostazioni: ogni fattura genera poi automaticamente la polizza QR conforme alla norma SIX, con IBAN e riferimento strutturato già codificati.",
        },
        {
          question: "Si può fatturare un acconto prima della fine del cantiere?",
          answer:
            "Sì, Cantia consente di emettere una fattura d'acconto per una percentuale del preventivo, poi deduce automaticamente questo importo dalla fattura finale.",
        },
        {
          question: 'Come si sa se una fattura è stata pagata?',
          answer:
            "Cerchi e riconcili un pagamento direttamente dal suo numero di riferimento QR — lo stato passa a «pagata» senza dover verificare manualmente il Suo conto bancario.",
        },
        {
          question: 'Quanto costa la fatturazione con QR-code tramite Cantia?',
          answer: "La fatturazione con fattura QR svizzera è inclusa in tutti i piani Cantia, senza eccezioni, già a partire dal piano Essentiel.",
        },
      ]}
      related={[
        { href: '/it/solutions/devis', label: 'Preventivi online' },
        { href: '/it/solutions/rentabilite', label: 'Redditività per cantiere' },
        { href: '/it/solutions/tresorerie', label: 'Liquidità previsionale' },
      ]}
      closingTitle="La fatturazione svizzera, senza destreggiarsi tra due strumenti"
      closingText="Preventivi e fatture illimitati su tutti i piani Cantia. Provi per 14 giorni, senza codice promozionale."
    />
  );
}
