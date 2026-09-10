import { forceLocale } from '../../../lib/translations';
import { SolutionPage } from '../../../components/SolutionPage';
import { ModuleMockup } from '../../../components/solutions/ModuleMockup';

forceLocale('it');

export default function TravauxSupplementairesSolutionPageIt() {
  return (
    <SolutionPage
      kicker="Lavori supplementari"
      title="Gli extra di cantiere, finalmente tracciabili — e pagati"
      subtitle="«Già che c'è…» Quello che si decide a voce in cantiere finisce dimenticato o contestato alla fine. Cantia trasforma ogni extra in un documento datato, firmato e fatturato — senza dover rifare un preventivo completo."
      visual={<ModuleMockup kind="travaux-supplementaires" />}
      features={[
        {
          icon: 'plus-circle',
          title: 'Un documento dedicato, non una nota persa',
          text: "Ogni extra diventa un Lavoro supplementare numerato (LS-2026-004), collegato al cantiere — basta con il post-it o l'SMS che si perde nella giornata.",
        },
        {
          icon: 'link',
          title: 'Collegato al preventivo esistente, o no',
          text: "Crei un LS da un preventivo in corso per mantenere il filo, oppure in modo indipendente se il cantiere non ha un preventivo iniziale in Cantia.",
        },
        {
          icon: 'edit-3',
          title: 'Firma del cliente a distanza',
          text: "Il cliente riceve un link, consulta il dettaglio con i prezzi e firma online — l'accordo è marcato temporalmente, basta con il «non l'ho mai approvato».",
        },
        {
          icon: 'file-text',
          title: 'Trasformato in fattura automaticamente',
          text: "Non appena il cliente accetta, viene generata una fattura dedicata con le stesse righe — niente da reinserire, niente da dimenticare di fatturare.",
        },
        {
          icon: 'database',
          title: 'Lo stesso catalogo dei Suoi preventivi',
          text: "Le righe dei LS alimentano il catalogo prezzi condiviso con i Suoi preventivi — la coerenza delle Sue tariffe resta garantita, anche per un extra deciso al volo.",
        },
        {
          icon: 'trending-up',
          title: 'Integrati nella Redditività per cantiere',
          text: "Un LS accettato si aggiunge automaticamente all'importo preventivato del cantiere nel modulo Redditività — il margine reale non trascura più gli extra.",
        },
        {
          icon: 'alert-triangle',
          title: "La perdita di denaro invisibile, finalmente visibile",
          text: "In un cantiere di ristrutturazione, gli extra non fatturati si contano spesso in migliaia di franchi alla fine — Cantia rende impossibile dimenticarli.",
        },
      ]}
      steps={[
        { title: "Annoti l'extra dal cantiere", text: 'Crei un Lavoro supplementare in poche righe — come un preventivo, ma più rapido.' },
        { title: 'Lo invii al cliente', text: 'Link sicuro via e-mail o copiato direttamente — il cliente consulta e firma online.' },
        { title: 'La fattura parte da sola', text: "Non appena accettato, viene generata una fattura dedicata e l'importo si aggiunge alla redditività del cantiere." },
      ]}
      faq={[
        {
          question: "Che cos'è un Lavoro supplementare (LS) in Cantia?",
          answer:
            "È un documento dedicato per tutto ciò che viene richiesto durante il cantiere in aggiunta al preventivo iniziale — un muro da spostare, una presa da aggiungere. Si crea, si invia e si firma come un preventivo, poi si trasforma automaticamente in fattura una volta accettato.",
        },
        {
          question: 'Un LS deve essere collegato a un preventivo esistente?',
          answer:
            "No, è facoltativo. Può collegarlo al preventivo d'origine per mantenere il contesto, oppure crearlo da solo se il cantiere non ha un preventivo iniziale in Cantia.",
        },
        {
          question: 'Come approva il cliente un Lavoro supplementare?',
          answer:
            "Riceve un link a un portale sicuro, consulta il dettaglio con i prezzi e firma online — l'accettazione è marcata temporalmente e attiva automaticamente la fattura corrispondente.",
        },
        {
          question: 'I lavori supplementari contano nella Redditività per cantiere?',
          answer: "Sì: non appena un LS viene accettato, il suo importo si aggiunge automaticamente al totale preventivato del cantiere nel modulo Redditività.",
        },
      ]}
      related={[
        { href: '/it/solutions/devis', label: 'Preventivi' },
        { href: '/it/solutions/facturation', label: 'Fatturazione & fattura QR' },
        { href: '/it/solutions/rentabilite', label: 'Redditività per cantiere' },
      ]}
      closingTitle="Non lasci più sfuggire nemmeno un extra"
      closingText="Lavori supplementari è incluso in tutti i piani Cantia, con lo stesso monitoraggio illimitato dei Suoi preventivi e fatture."
    />
  );
}
