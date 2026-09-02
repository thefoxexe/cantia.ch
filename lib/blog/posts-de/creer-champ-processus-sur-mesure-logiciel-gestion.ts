import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'creer-champ-processus-sur-mesure-logiciel-gestion',
  question: 'Ist es möglich, ein massgeschneidertes Feld oder einen Prozess in der eigenen Verwaltungssoftware hinzuzufügen?',
  title: 'Ein Feld oder einen Prozess hinzufügen, den es sonst nirgends gibt',
  description:
    'Ein Standardformular passt nie zu 100% zur Arbeitsweise eines Unternehmens. Wie ein massgeschneidertes Feld oder ein massgeschneiderter Prozess diese letzte Lücke schliesst.',
  excerpt:
    'Ein Standard-Offertenformular deckt 90% der Bedürfnisse ab. Die restlichen 10%, die zur spezifischen Arbeitsweise eines Unternehmens gehören, verdienen manchmal ein Feld, das es in keinem generischen Tool gibt.',
  category: 'Sur-mesure & automatisations',
  keywords: ['individuelles Feld Software hinzufügen', 'personalisierter Prozess Verwaltung', 'massgeschneidertes Formular Offerte Rechnung', 'Software an spezifische Bedürfnisse anpassen', 'individuelles Feld Bausoftware'],
  publishedAt: '2026-08-18',
  readMinutes: 4,
  blocks: [
    {
      type: 'p',
      text: 'Ein Standard-Verwaltungstool deckt in der Regel die grosse Mehrheit der Bedürfnisse eines Bauunternehmens ab. Manche Unternehmen haben jedoch eine eigene Besonderheit in ihrer Arbeitsweise (eine Information, die systematisch verfolgt werden muss, ein besonderer Freigabeschritt), die kein generisches Formular vorsieht.',
    },
    { type: 'h2', text: 'Beispiele für wirklich massgeschneiderte Felder oder Prozesse' },
    {
      type: 'list',
      items: [
        'Ein spezifisches Feld, das angekreuzt werden muss, bevor eine Offerte versendet werden kann (branchenspezifische Prüfung)',
        'Ein zusätzlicher Freigabeschritt durch eine verantwortliche Person vor der Ausstellung einer Rechnung',
        'Ein Verfolgungsfeld, spezifisch für einen bestimmten Baustellentyp, das in Standardformularen fehlt',
        'Ein Abnahmeprozess mit unternehmenseigenen Kriterien',
      ],
    },
    {
      type: 'stat',
      value: '80/20',
      label: 'typische Aufteilung zwischen von einem Standardtool abgedeckten Bedürfnissen und wirklich unternehmensspezifischen Bedürfnissen: bei diesen letzten 20% macht Massschneiderung den Unterschied',
    },
    { type: 'h2', text: 'Massschneiderung geht immer von einem echten Bedürfnis aus, nicht von einer abstrakten Idee' },
    {
      type: 'p',
      text: 'Ein massgeschneidertes Feld oder ein massgeschneiderter Prozess ergibt nur dann Sinn, wenn er auf eine im Alltag tatsächlich auftretende Reibung reagiert. Deshalb entsteht er in der Regel aus einem direkten Gespräch über das konkrete Problem, nicht aus einer Liste theoretischer Wünsche.',
    },
    {
      type: 'callout',
      title: 'Ein massgeschneidertes Feld bleibt in den Rest des Tools integriert',
      text: 'Im Gegensatz zu einem improvisierten Umweg (etwa einer separaten Excel-Tabelle) fügt sich ein massgeschneidert entwickeltes Feld an derselben Stelle ein wie die übrigen Daten. Es gibt dann weder doppelte Erfassung noch ein Parallelsystem, das gepflegt werden müsste.',
    },
    {
      type: 'cta',
      title: 'Sprechen wir über das, was in Ihrem Alltag fehlt',
      text: 'Wenn eine Besonderheit Ihrer Arbeitsweise heute in Cantia keinen Platz findet, sprechen wir darüber. Das ist oft der Ausgangspunkt für eine massgeschneiderte Funktion.',
      buttonLabel: 'Kostenlos testen',
    },
  ],
  faq: [
    {
      question: 'Kann man in Cantia ein individuelles Feld zu einer Offerte oder Rechnung hinzufügen?',
      answer:
        'Das ist über die Entwicklung massgeschneiderter Funktionen möglich, für Bedürfnisse, die zur spezifischen Arbeitsweise eines bestimmten Unternehmens gehören.',
    },
    {
      question: 'Wie beginnt eine Anfrage für ein individuelles Feld oder einen individuellen Prozess konkret?',
      answer:
        'In der Regel mit einem direkten Gespräch über das im Alltag konkret auftretende Problem, statt mit einer theoretischen Wunschliste.',
    },
    {
      question: 'Bleibt ein individuelles Feld in den Rest des Tools integriert?',
      answer:
        'Ja: Im Gegensatz zu einer externen Umgehungslösung (etwa einer separaten Tabelle) fügt sich ein massgeschneidert entwickeltes Feld direkt in die bestehenden Daten ein, ohne doppelte Erfassung.',
    },
  ],
  relatedSlugs: [
    'cantia-adapte-metier-specifique-batiment',
    'pourquoi-modeles-figes-ne-conviennent-pas-tous-metiers-batiment',
    'demander-fonctionnalite-sur-mesure-editeur-logiciel',
  ],
};
