import { SolutionPage } from '../../../components/SolutionPage';
import { ModuleMockup } from '../../../components/solutions/ModuleMockup';
import { forceLocale } from '../../../lib/translations';

forceLocale('it');

// The Métrés module (post-calcul): after the soumission, the quantities
// executed and the real costs, compared with what was sold (app/(app)/metres).
export default function MetresSolutionPageIT() {
  return (
    <SolutionPage
      kicker="Computi · Consuntivo"
      title="Dopo il capitolato, sapere se il cantiere ha davvero reso"
      subtitle="Il capitolato dice cosa avete venduto. Il computo dice cosa avete eseguito davvero e quanto vi è costato. In Cantia riprendete il capitolato del cantiere, inserite le quantità eseguite e i costi reali, e vedete l’utile posizione per posizione."
      visual={<ModuleMockup kind="metres" />}
      features={[
        { icon: "clipboard", title: "Partire dal capitolato", text: "Scegliete il cantiere e il capitolato di base: il computo ne riprende capitoli, posizioni, unità e quantità. Niente da ricopiare." },
        { icon: "edit-3", title: "Le quantità realmente eseguite", text: "Correggete ogni quantità con quanto è stato davvero eseguito. Il fatturabile segue: quantità eseguita × prezzo unitario del capitolato." },
        { icon: "dollar-sign", title: "I costi reali per unità", text: "Al posto del prezzo di vendita, inserite quanto vi è costata la posizione: manodopera, materiale, subappalto. I prezzi di vendita restano nel capitolato." },
        { icon: "plus-circle", title: "I lavori in più", text: "Un lavoro non previsto? Aggiungete la posizione nel computo: il suo costo conta ed è segnalata fuori capitolato, da fatturare a parte." },
        { icon: "bar-chart-2", title: "L’utile, posizione per posizione", text: "Offerta, fatturabile, costo reale, utile e margine per tutto il cantiere, poi per capitolo e per posizione. Le posizioni in perdita appaiono in rosso e si filtrano con un clic." },
        { icon: "repeat", title: "Calcolare meglio la prossima volta", text: "Vedete quali posizioni vi fanno guadagnare e quali vi costano: per adeguare i prezzi al prossimo capitolato." },
      ]}
      steps={[
        { title: "Compilate il capitolato", text: "Importate il capitolato ricevuto, inserite i prezzi e rispeditelo." },
        { title: "Create il computo", text: "Durante o dopo il cantiere, scegliete il capitolato come base." },
        { title: "Inserite il reale", text: "Quantità eseguite e costi reali: l’utile appare subito." },
      ]}
      faq={[
        { question: "Che differenza c’è tra capitolato e computo in Cantia?", answer: "Il capitolato contiene quanto avete offerto: quantità e prezzi di vendita. Il computo riprende lo stesso capitolato con quanto è stato eseguito davvero e quanto è costata ogni posizione. Cantia confronta i due." },
        { question: "Come si calcola l’utile?", answer: "Il fatturabile corrisponde alle quantità eseguite moltiplicate per i prezzi unitari del capitolato, dopo ribasso e sconto, senza IVA. L’utile è il fatturabile meno il costo reale (quantità eseguite moltiplicate per i costi per unità)." },
        { question: "Bisogna reinserire il capitolato?", answer: "No. Il computo riprende tutte le posizioni e quantità del capitolato scelto; correggete solo ciò che è cambiato." },
        { question: "Si possono aggiungere posizioni non previste nel capitolato?", answer: "Sì, in ogni capitolo. Il loro costo conta nell’utile e sono segnalate fuori capitolato, da fatturare a parte." },
        { question: "Come si attivano i computi?", answer: "In Impostazioni › Moduli attivate «Computi e consuntivo». Il modulo è pensato per le imprese edili e appare poi nel menu, sotto i capitolati." },
        { question: "I computi contano nella quota di capitolati?", answer: "No: conta solo l’importazione di un capitolato PDF. Creare un computo da un capitolato già importato non consuma nulla." },
        { question: "Si può usare dal telefono?", answer: "Dal telefono il confronto si consulta. Quantità e costi si inseriscono dal computer." },
      ]}
      related={[
        { href: "/it/solutions/soumissions", label: "Compilare un capitolato" },
        { href: "/it/solutions/rentabilite", label: "Redditività per cantiere" },
        { href: "/it/solutions/travaux-supplementaires", label: "Lavori supplementari" },
      ]}
      closingTitle="Sapere quanto vi ha reso davvero ogni cantiere"
      closingText="Il modulo Computi si attiva in Impostazioni › Moduli, per le imprese edili. 14 giorni di prova, senza impegno."
    />
  );
}
