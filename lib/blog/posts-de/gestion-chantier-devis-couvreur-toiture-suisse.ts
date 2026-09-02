import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'gestion-chantier-devis-couvreur-toiture-suisse',
  question: 'Wie soll ein Dachdecker eine Offerte für ein Dach kalkulieren, um Wetter und Sicherheit einzubeziehen?',
  title: 'Dachdecker: ein Dach kalkulieren, ohne vom Wetter überrascht zu werden',
  description:
    'Eine Dachbaustelle hängt direkt vom Wetter ab und erfordert Sicherheitsmassnahmen mit echten Kosten. So integrieren Sie diese in die Offerte, statt sie in einer unsichtbaren Marge zu verstecken.',
  excerpt:
    'Kein anderes Bau-Gewerbe ist so direkt dem Wetter ausgesetzt wie die Dachdeckerei. Eine Dachofferte ohne Wettermarge und ohne Sicherheitskosten geht deshalb ein Risiko ein, das sie oft verliert.',
  category: 'Métiers du bâtiment',
  keywords: ['offerte dachdecker', 'dach fakturierung schweiz', 'preis dachsanierung', 'sicherheit baustelle dach', 'offerte dachstuhl deckung'],
  publishedAt: '2026-09-07',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Eine Dachbaustelle kann bei Regen nicht vorankommen, manchmal auch nicht bei zu starkem Wind. Eine Offerte, die dieses Wetterrisiko nicht einkalkuliert, verwandelt jede Schlechtwetterperiode in einen reinen Verlust für das Unternehmen, denn der Kunde bezahlt nur die tatsächlich geleistete Arbeit.',
    },
    { type: 'h2', text: 'Was explizit in der Offerte stehen muss' },
    {
      type: 'list',
      items: [
        'Abbruch der bestehenden Eindeckung und Entsorgung (oft unterschätzt)',
        'Dachstuhl: allfällige Reparatur oder Verstärkung, erst nach Inspektion zu kalkulieren, nie blind',
        'Neue Eindeckung (Ziegel, Schiefer, Blechdach) inklusive Kosten für die Absicherung der Baustelle',
        'Spenglerarbeiten, Regenrinnen und Ableitungen (ein eigener Posten, der im Gesamtpreis «Dach» oft vergessen geht)',
      ],
    },
    { type: 'h2', text: 'Der Sicherheitsaufwand ist nicht verhandelbar' },
    {
      type: 'p',
      text: 'Gerüst, Absturzsicherung, Randabschrankung: diese Vorrichtungen für die Höhenarbeit haben reale Miet- und Montagekosten, die klar auf der Offerte erscheinen müssen, statt still im Preis pro m² Dacheindeckung unterzugehen. Sonst besteht die Versuchung, sie bei finanziell knappen Baustellen zu reduzieren.',
    },
    {
      type: 'stat',
      value: '5-10 %',
      label: 'Anteil des Budgets einer Dachbaustelle, der typischerweise für Höhensicherheitsvorrichtungen (Gerüst, Absturzsicherung, Schutzeinrichtungen) aufgewendet wird',
    },
    {
      type: 'callout',
      title: 'Eine Wetterklausel schützt die Kundenbeziehung genauso wie die Marge',
      text: 'Wenn in der Offerte ausdrücklich festgehalten wird, dass ein Wetterstopp den Zeitplan ohne Vertragsstrafe verschiebt, entfällt eine angespannte Verhandlung mitten auf der Baustelle: Der Kunde versteht eine vorher angekündigte Verschiebung nämlich besser als eine vor Ort entdeckte Verzögerung.',
    },
    {
      type: 'cta',
      title: 'Verfolgen Sie den Baustellenfortschritt vom Handy aus, auch in der Höhe',
      text: 'Mit Cantia lassen sich Fotos und Fortschrittsrapporte direkt von der Baustelle aus erfassen — nützlich, um einen Wetterstopp oder eine beim Abbruch entdeckte unerwartete Dachstuhlproblematik zu dokumentieren.',
      buttonLabel: 'Kostenlos testen',
    },
  ],
  faq: [
    {
      question: 'Wie integriert man das Wetterrisiko in eine Dachofferte?',
      answer:
        'Indem man explizit eine Verschiebungsklausel ohne Vertragsstrafe für den Fall von Schlechtwetter vorsieht, das die Höhenarbeit verhindert. Das schützt das Unternehmen und verhindert eine angespannte Verhandlung mitten auf der Baustelle.',
    },
    {
      question: 'Sollte man die Sicherheitsvorrichtungen auf einer Dachbaustelle separat fakturieren?',
      answer:
        'Das wird empfohlen: Gerüst, Absturzsicherung und Geländer haben reale Miet- und Montagekosten, die sichtbar bleiben sollten, statt im Preis pro m² Eindeckung zu verschwinden.',
    },
    {
      question: 'Kann man eine Dachstuhlreparatur ohne vorherige Inspektion kalkulieren?',
      answer:
        'Nein, oder nur sehr grob, denn der tatsächliche Zustand eines Dachstuhls ist oft erst nach dem Abbruch der bestehenden Eindeckung sichtbar — daher lohnt sich eine Inspektion vor der definitiven Offerte.',
    },
  ],
  relatedSlugs: [
    'retard-chantier-meteo-obligations-contractuelles',
    'assurance-chantier-tous-risques-ectr-obligatoire',
    'application-hors-ligne-chantier-pourquoi-important',
  ],
};
