import { forceLocale } from '../../../lib/translations';
import { SolutionPage } from '../../../components/SolutionPage';
import { ModuleMockup } from '../../../components/solutions/ModuleMockup';

forceLocale('it');

export default function TresorerieSolutionPageIt() {
  return (
    <SolutionPage
      kicker="Liquidità"
      title="Riuscirà a pagare i salari tra tre settimane?"
      subtitle="Fatture da incassare, salari da versare, subappaltatori da pagare, abbonamenti che partono da soli — Cantia riunisce tutto ciò che si muove sul Suo conto in un'unica proiezione a 90 giorni."
      visual={<ModuleMockup kind="tresorerie" />}
      features={[
        {
          icon: 'trending-up',
          title: 'Una proiezione su 90 giorni',
          text: "Inserisca il Suo saldo attuale una sola volta, Cantia ne proietta l'evoluzione giorno per giorno a partire da tutto ciò che è già presente nell'applicazione.",
        },
        {
          icon: 'file-text',
          title: 'Fatture clienti non ancora incassate',
          text: "Ogni fattura inviata o parzialmente pagata compare alla sua scadenza, con una segnalazione chiara se è già in ritardo.",
        },
        {
          icon: 'users',
          title: 'Massa salariale stimata',
          text: "Calcolata dai Suoi profili HR — salari mensili e ore già inserite questo mese — e collocata nel giorno di paga da Lei configurato.",
        },
        {
          icon: 'briefcase',
          title: 'Fatture subappaltatori non pagate',
          text: "Quanto deve ancora saldare ai Suoi subappaltatori compare nella stessa linea temporale, alla loro scadenza.",
        },
        {
          icon: 'repeat',
          title: 'Abbonamenti e spese ricorrenti',
          text: "Assicurazioni, software, affitti... li registri una volta, mensili o annuali — Cantia li proietta automaticamente, mese dopo mese.",
        },
        {
          icon: 'bell',
          title: 'Promemoria prima di ogni addebito',
          text: "Un banner Le segnala le spese ricorrenti dei prossimi 7 giorni — niente più brutte sorprese sull'estratto conto bancario.",
        },
        {
          icon: 'shield',
          title: 'Nessuna connessione bancaria richiesta',
          text: "Inserisce il Suo saldo manualmente, quando lo desidera — non è necessario alcun accesso al Suo conto bancario.",
        },
      ]}
      steps={[
        { title: 'Inserisca il Suo saldo', text: 'Una cifra, aggiornata quando lo desidera — senza connessione bancaria.' },
        { title: 'Aggiunga le Sue spese ricorrenti', text: 'Abbonamenti, assicurazioni, affitti — una volta, con la loro frequenza e la loro prossima scadenza.' },
        { title: 'Consulti la proiezione', text: 'Fatture, salari, subappaltatori e spese ricorrenti si combinano automaticamente in una linea temporale a 90 giorni.' },
      ]}
      faq={[
        {
          question: 'Cantia si collega al mio conto bancario?',
          answer: 'No. Inserisce il Suo saldo manualmente quando lo desidera — non viene richiesto né è necessario alcun accesso bancario.',
        },
        {
          question: 'Da dove provengono gli importi della proiezione?',
          answer:
            "Dalle fatture clienti non saldate, da una stima della massa salariale (profili HR + ore inserite), dalle fatture subappaltatori non pagate e dalle spese ricorrenti che Lei registra — tutto ciò che Cantia sa già sulla Sua attività.",
        },
        {
          question: 'Come funzionano i promemoria delle spese ricorrenti?',
          answer:
            "Un banner sulla home e sulla pagina Liquidità Le segnala le spese ricorrenti attive in scadenza nei prossimi 7 giorni, prima che vengano addebitate.",
        },
        {
          question: 'La Liquidità previsionale è inclusa in tutti i piani Cantia?',
          answer: 'È disponibile a partire dal piano Team, attivabile dalle impostazioni della Sua organizzazione.',
        },
      ]}
      related={[
        { href: '/it/solutions/facturation', label: 'Fatturazione & fattura QR' },
        { href: '/it/solutions/rh-salaires', label: 'HR & Salari' },
        { href: '/it/solutions/rentabilite', label: 'Redditività per cantiere' },
      ]}
      closingTitle="Non scopra più un buco di tesoreria a posteriori"
      closingText="Liquidità previsionale è disponibile a partire dal piano Team — senza connessione bancaria, senza configurazioni complicate."
    />
  );
}
