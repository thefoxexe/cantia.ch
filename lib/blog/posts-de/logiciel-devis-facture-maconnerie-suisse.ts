import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'logiciel-devis-facture-maconnerie-suisse',
  question: 'Wie sollte ein selbstständiger Maurer oder ein kleines Maurerunternehmen seine Offerten und Rechnungen strukturieren?',
  title: 'Offerten und Rechnungen für ein Maurerunternehmen: die Methode, die böse Überraschungen vermeidet',
  description:
    'Eine schlecht strukturierte Maurerofferte verbirgt oft einen Verlust: unterbewertete Materialien, falsch gezählte Teamstunden, nicht eingeplante Unwägbarkeiten. Konkrete Methode für eine treffsichere Kalkulation.',
  excerpt:
    'Zwischen dem nach m³ fakturierten Rohbau, den Ausbauarbeiten nach m² und den Handling-Stunden, die in keine Kategorie passen, frisst eine schlecht aufgebaute Maurerofferte die Marge schon vor dem ersten Spatenstich auf.',
  category: 'Métiers du bâtiment',
  keywords: ['offerte maurerarbeiten', 'fakturierung selbstständiger maurer', 'verwaltungssoftware maurerunternehmen', 'rohbau baustelle kalkulieren', 'preise maurerarbeiten schweiz'],
  publishedAt: '2026-08-28',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Die Maurerarbeit vermischt mehrere Masseinheiten auf derselben Baustelle: den m³ gegossenen Beton, den m² gemauerte Wand, die Anzahl Stunden für Handling und Ausbau. Eine Offerte, die einen einzigen Pauschalpreis über alles legt, unterbewertet fast immer einen Teil der Arbeit — meist die Ausbauarbeit, die in Wirklichkeit mehr Zeit beansprucht als geplant.',
    },
    { type: 'h2', text: 'Die Offerte nach Posten strukturieren, nicht nach ganzer Baustelle' },
    {
      type: 'list',
      items: [
        'Aushub und Fundamente: nach m³ oder Pauschal je nach Komplexität des Bodens',
        'Mauerwerk (Backsteine, Ziegel, Beton): nach m² oder m³ je nach Art des Mauerwerks',
        'Betonieren und Bodenplatten: nach m³, mit den Kosten für Transportbeton getrennt von der Arbeitszeit',
        'Ausbauarbeiten (Verputz, Fugen, Neuverfugung): nach m², oft unterschätzt, da zeitaufwendig',
        'Handling, Schuttentsorgung, Baustellenreinigung: in Regiestunden, nie vergessen',
      ],
    },
    {
      type: 'stat',
      value: '15-20 %',
      label: 'typischer Anteil der Gesamtzeit einer Maurerbaustelle, der für Handling und Reinigung aufgewendet wird — ein Posten, der in der Erstofferte oft fehlt',
    },
    { type: 'h2', text: 'Die Falle des m²-Preises, der nichts über den Baustellenzugang aussagt' },
    {
      type: 'p',
      text: 'Zwei Baustellen mit derselben zu mauernden Wandfläche können je nach Zugang (kann der Betonmischer-Lkw heranfahren oder nicht, Stockwerk, Lagerplatz für Material) sehr unterschiedliche Kosten haben. Eine Offerte, die überall denselben m²-Preis anwendet, ohne die tatsächliche Zugänglichkeit der Baustelle zu berücksichtigen, gleicht die Margen am Ende nach unten an. Die einfache Baustelle bezahlt dann für die schwierige.',
    },
    {
      type: 'callout',
      title: 'Material und Arbeitszeit auf der Offerte immer trennen',
      text: 'Der Preis von Zement, Steinen oder Bewehrung schwankt regelmässig. Eine Offerte, die sie in einer Gesamtpauschale untergehen lässt, verhindert jede saubere Neubewertung, falls sich die Baustelle verzögert und sich die Materialpreise in der Zwischenzeit ändern.',
    },
    {
      type: 'cta',
      title: 'Ein Preiskatalog, der Ihre wiederkehrenden Posten speichert',
      text: 'Cantia behält Ihre Maurerpreise (m³ Beton, m² Mauerwerk, Ausbaupauschalen) im Gedächtnis, sodass sich jede neue Offerte aus bereits kalkulierten Posten zusammensetzt, statt bei null zu beginnen.',
      buttonLabel: 'Kostenlos testen',
    },
  ],
  faq: [
    {
      question: 'Wie kalkuliert man eine Maurerofferte, die mehrere Masseinheiten mischt?',
      answer:
        'Indem man jeden Posten mit seiner eigenen Einheit detailliert (m³ für Beton und Fundamente, m² für Wände und Ausbau, Regiestunden für Handling), statt eines einzigen Pauschalpreises, der die Unterschiede verdeckt.',
    },
    {
      question: 'Sollte der Materialpreis im m²-Preis für Maurerarbeiten enthalten sein?',
      answer:
        'Besser ist es, sie auf der Offerte zu trennen: So lässt sich leicht anpassen, falls sich die Materialpreise vor Baubeginn ändern, ohne die gesamte Kalkulation neu machen zu müssen.',
    },
    {
      question: 'Wie vergisst man den Handling-Aufwand in einer Maurerofferte nicht?',
      answer:
        'Indem man eine eigene Position in Regiestunden für den Materialtransport, die Schuttentsorgung und die Reinigung vorsieht — ein Posten, der oft 15 bis 20 % der Gesamtzeit der Baustelle ausmacht.',
    },
  ],
  relatedSlugs: [
    'calculer-prix-devis-renovation-suisse',
    'calculer-prix-de-revient-chantier-batiment',
    'checklist-ouverture-chantier-artisan',
  ],
};
