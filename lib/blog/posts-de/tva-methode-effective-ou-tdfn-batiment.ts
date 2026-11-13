import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'tva-methode-effective-ou-tdfn-batiment',
  question: 'Effektive Methode oder Saldosteuersatz: welche MWST-Abrechnung passt zu einem Baubetrieb?',
  title: 'MWST: effektive Methode oder Saldosteuersatz, was wählen?',
  description:
    'Effektive Methode oder Saldosteuersatz für die MWST eines Baubetriebs: Aufwand, abziehbare Vorsteuer und wie Sie sich entscheiden.',
  excerpt:
    'Beide Methoden gibt es aus demselben Grund: Sie sollen manchen Unternehmen das Leben erleichtern. Doch einfacher heisst nicht immer günstiger, und eine falsche Wahl zahlt man über mehrere Jahre.',
  category: 'Juridique & normes',
  keywords: [
    'effektive Methode oder Saldosteuersatz Bau',
    'Saldosteuersatz Baugewerbe',
    'MWST Methode wählen Baufirma',
    'Saldosteuersatz Handwerker Schweiz',
    'Vorsteuer MWST Bau',
  ],
  publishedAt: '2026-09-22',
  readMinutes: 7,
  blocks: [
    {
      type: 'p',
      text: 'Für die Berechnung der geschuldeten MWST eines steuerpflichtigen Unternehmens in der Schweiz gibt es zwei Methoden: die effektive Methode, die genau die Differenz zwischen fakturierter MWST und tatsächlich bezahlter Vorsteuer berechnet, und den Saldosteuersatz, einen Pauschalsatz pro Branche, der die Abrechnung vereinfacht, aber die Berechnungslogik verändert. Gewählt wird bei der Anmeldung oder bei einem Methodenwechsel bei der ESTV, und die Wahl prägt die Buchhaltung für die folgenden Jahre.',
    },
    { type: 'h2', text: 'Die effektive Methode: genau, aber mehr Buchhaltung' },
    {
      type: 'p',
      text: 'Bei der effektiven Methode trägt jede ausgestellte Rechnung die MWST zum anwendbaren Satz, und jede erhaltene Rechnung (Material, Subunternehmer, Maschinenmiete, Treibstoff) erlaubt den Abzug der entsprechenden Vorsteuer. Geschuldet ist die Differenz. Das ist die genaueste Methode, verlangt aber, jede Eingangsrechnung und ihren Satz konsequent zu erfassen, ein echter Aufwand für einen kleinen Betrieb ohne eigene Buchhaltung.',
    },
    { type: 'h2', text: 'Der Saldosteuersatz: einfacher, aber nicht immer günstiger' },
    {
      type: 'p',
      text: 'Der Saldosteuersatz wendet einen branchenspezifischen Pauschalsatz direkt auf den vereinnahmten Umsatz an, ohne die Vorsteuer auf jedem Einkauf einzeln zu berechnen. Die Abrechnung ist viel schneller erstellt, in der Regel zweimal statt viermal pro Jahr. Der genaue Satz für das Baugewerbe hängt von der deklarierten Tätigkeit ab und ändert periodisch: Er ist direkt bei der ESTV oder beim Treuhänder zu prüfen, nie von einem Jahr aufs nächste anzunehmen.',
    },
    { type: 'h2', text: 'Das eigentliche Kriterium: wie viel abziehbare Einkäufe' },
    {
      type: 'table',
      headers: ['Situation', 'Eher vorteilhafte Methode'],
      rows: [
        ['Viele Materialeinkäufe und Investitionen', 'Effektive Methode, um die tatsächliche Vorsteuer zurückzuholen'],
        ['Vor allem Arbeitsleistung, wenig Einkäufe', 'Saldosteuersatz, oft einfacher ohne nennenswerten Verlust'],
        ['Keine eigene Buchhaltung im Betrieb', 'Saldosteuersatz, weniger Aufwand pro Quartal'],
        ['Buchhaltung bereits genau geführt (Verwaltungssoftware)', 'Effektive Methode, da die Erfassung keinen echten Mehraufwand bedeutet'],
      ],
    },
    {
      type: 'callout',
      title: 'Eine Verpflichtung auf Dauer, keine Wahl pro Quartal',
      text: 'Ein Methodenwechsel geht nicht sofort: Die ESTV verlangt in der Regel eine Mindestdauer, bevor man von einer Methode zur anderen wechseln kann. Bevor Sie den Saldosteuersatz wegen der Einfachheit wählen, lohnt es sich, ein ganzes Jahr mit beiden Methoden durchzurechnen, besonders wenn bald eine grössere Investition (Fahrzeug, Maschine) ansteht.',
    },
    {
      type: 'cta',
      title: 'Welche MWST-Methode Sie auch wählen: jede Rechnung bei ihrer Baustelle',
      text: 'Cantia führt Offerten, Rechnungen und Einkäufe pro Baustelle zusammen und vereinfacht so die Abrechnung, ob effektiv oder mit Saldosteuersatz.',
      buttonLabel: '14 Tage testen',
    },
  ],
  faq: [
    {
      question: 'Kann man die MWST-Methode im Lauf des Jahres wechseln?',
      answer:
        'Nein, ein Methodenwechsel erfolgt in der Regel auf Beginn einer Steuerperiode, und vor einem erneuten Wechsel gilt eine Mindestdauer. Jeder Wechsel läuft über die ESTV.',
    },
    {
      question: 'Muss man mit dem Saldosteuersatz die Einkaufsbelege nicht mehr aufbewahren?',
      answer:
        'Doch. Der Saldosteuersatz vereinfacht die Berechnung der geschuldeten MWST, aber das Unternehmen muss Einkaufs- und Verkaufsbelege aufbewahren wie jedes steuerpflichtige Unternehmen, namentlich für eine Kontrolle.',
    },
    {
      question: 'Lohnt sich die effektive Methode für einen kleinen Baubetrieb?',
      answer:
        'Das hängt vor allem vom Umfang der abziehbaren Material- und Investitionskäufe ab. Wer viel Material einkauft, fährt oft besser mit der effektiven Methode und holt die tatsächliche Vorsteuer zurück statt einen Pauschalsatz anzuwenden.',
    },
  ],
  relatedSlugs: [
    'declaration-tva-trimestrielle-artisan-suisse',
    'delai-declaration-tva-suisse-calendrier',
    'mentions-obligatoires-facture-suisse-tva',
  ],
};
