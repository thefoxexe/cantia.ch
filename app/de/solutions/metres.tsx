import { SolutionPage } from '../../../components/SolutionPage';
import { ModuleMockup } from '../../../components/solutions/ModuleMockup';
import { forceLocale } from '../../../lib/translations';

forceLocale('de');

// The Métrés module (post-calcul): after the soumission, the quantities
// executed and the real costs, compared with what was sold (app/(app)/metres).
export default function MetresSolutionPageDE() {
  return (
    <SolutionPage
      kicker="Ausmass · Nachkalkulation"
      title="Nach dem Leistungsverzeichnis wissen, ob sich die Baustelle gelohnt hat"
      subtitle="Das Leistungsverzeichnis zeigt, was Sie verkauft haben. Das Ausmass zeigt, was Sie effektiv ausgeführt haben und was es gekostet hat. In Cantia übernehmen Sie das LV der Baustelle, tragen die ausgeführten Mengen und Ihre effektiven Kosten ein und sehen den Gewinn pro Position."
      visual={<ModuleMockup kind="metres" />}
      features={[
        { icon: "clipboard", title: "Vom Leistungsverzeichnis ausgehen", text: "Wählen Sie die Baustelle und das LV als Basis: Das Ausmass übernimmt Kapitel, Positionen, Einheiten und Mengen. Nichts abzutippen." },
        { icon: "edit-3", title: "Die effektiv ausgeführten Mengen", text: "Korrigieren Sie jede Menge mit dem, was wirklich ausgeführt wurde. Das Verrechenbare folgt: ausgeführte Menge × Einheitspreis des LV." },
        { icon: "dollar-sign", title: "Ihre effektiven Kosten pro Einheit", text: "Statt des Verkaufspreises tragen Sie ein, was die Position gekostet hat: Arbeit, Material, Subunternehmer. Die Verkaufspreise bleiben im LV." },
        { icon: "plus-circle", title: "Zusätzliche Arbeiten", text: "Eine Arbeit war nicht vorgesehen? Fügen Sie die Position im Ausmass hinzu: Ihre Kosten zählen, und sie wird als ausserhalb LV markiert, um separat verrechnet zu werden." },
        { icon: "bar-chart-2", title: "Der Gewinn, Position für Position", text: "Offerte, Verrechenbares, effektive Kosten, Gewinn und Marge für die ganze Baustelle, dann pro Kapitel und Position. Positionen mit Verlust erscheinen rot und lassen sich mit einem Klick filtern." },
        { icon: "repeat", title: "Beim nächsten Mal besser kalkulieren", text: "Sie sehen, welche Positionen Geld bringen und welche Geld kosten: so passen Sie Ihre Preise beim nächsten LV an." },
      ]}
      steps={[
        { title: "LV ausfüllen", text: "Importieren Sie das erhaltene LV, setzen Sie Ihre Preise ein und senden Sie es zurück." },
        { title: "Ausmass erstellen", text: "Während oder nach der Baustelle wählen Sie das LV als Basis." },
        { title: "Effektive Werte eintragen", text: "Ausgeführte Mengen und effektive Kosten: Der Gewinn erscheint sofort." },
      ]}
      faq={[
        { question: "Was ist der Unterschied zwischen Leistungsverzeichnis und Ausmass in Cantia?", answer: "Das Leistungsverzeichnis enthält, was Sie offeriert haben: Mengen und Verkaufspreise. Das Ausmass übernimmt dasselbe LV mit dem, was effektiv ausgeführt wurde, und was jede Position gekostet hat. Cantia vergleicht beides." },
        { question: "Wie wird der Gewinn berechnet?", answer: "Das Verrechenbare sind die ausgeführten Mengen mal die Einheitspreise des LV, nach Rabatt und Skonto, ohne MWST. Der Gewinn ist das Verrechenbare minus die effektiven Kosten (ausgeführte Mengen mal Ihre Kosten pro Einheit)." },
        { question: "Muss das Leistungsverzeichnis neu erfasst werden?", answer: "Nein. Das Ausmass übernimmt alle Positionen und Mengen des gewählten LV; Sie korrigieren nur, was sich geändert hat." },
        { question: "Kann man Positionen hinzufügen, die nicht im LV waren?", answer: "Ja, in jedem Kapitel. Ihre Kosten zählen im Gewinn, und sie werden als ausserhalb LV markiert, um separat verrechnet zu werden." },
        { question: "Wie aktiviert man das Ausmass?", answer: "In Einstellungen › Module aktivieren Sie «Ausmass & Nachkalkulation». Das Modul ist für Bauunternehmen gedacht und erscheint danach im Menü unter den Leistungsverzeichnissen." },
        { question: "Zählt ein Ausmass im Kontingent der Leistungsverzeichnisse?", answer: "Nein: Nur der Import eines LV als PDF zählt. Ein Ausmass aus einem bereits importierten LV verbraucht nichts." },
        { question: "Funktioniert es auf dem Telefon?", answer: "Auf dem Telefon lässt sich der Vergleich ansehen. Mengen und Kosten werden am Computer erfasst." },
      ]}
      related={[
        { href: "/de/solutions/soumissions", label: "Leistungsverzeichnis ausfüllen" },
        { href: "/de/solutions/rentabilite", label: "Rentabilität pro Baustelle" },
        { href: "/de/solutions/travaux-supplementaires", label: "Zusatzarbeiten" },
      ]}
      closingTitle="Wissen, was jede Baustelle wirklich eingebracht hat"
      closingText="Das Modul Ausmass wird unter Einstellungen › Module aktiviert, für Bauunternehmen. 14 Tage Testphase, ohne Verpflichtung."
    />
  );
}
