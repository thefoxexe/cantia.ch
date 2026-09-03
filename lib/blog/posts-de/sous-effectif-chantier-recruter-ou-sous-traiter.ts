import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'sous-effectif-chantier-recruter-ou-sous-traiter',
  question: 'Personalmangel auf der Baustelle: Ist es besser, einzustellen oder zu sub-unternehmen?',
  title: 'Unterbesetzung auf der Baustelle: Rekrutieren oder subunternehmen, wie entscheiden',
  description:
    'Aufträge wegen Personalmangel abzulehnen ist eine schlechte Rechnung, aber zu schnell zu rekrutieren ist es ebenfalls. Hier die konkreten Kriterien, um zwischen Einstellung und Subunternehmen zu wählen.',
  excerpt:
    'Ein voller Auftragsbestand und ein zu knappes Team: Die Versuchung ist, in der Not zu rekrutieren. Das ist langfristig oft die teuerste Entscheidung, verglichen mit einem gut gewählten Subunternehmer.',
  category: 'RH & salaires',
  keywords: ['personalmangel baugewerbe schweiz', 'einstellen oder subunternehmer', 'personalplanung bau', 'subunternehmer baustelle', 'personalentscheid handwerksbetrieb'],
  publishedAt: '2026-08-05',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Ein übervoller Auftragsbestand und ein Team, das zu knapp ist, um ihn zu bewältigen: Das ist eigentlich eine gute Nachricht, die schnell zum Problem wird, wenn die Entscheidung zur Aufstockung des Personals unter Zeitdruck getroffen wird. Rekrutieren und Subunternehmen beantworten nicht dasselbe Bedürfnis, und die beiden zu verwechseln führt oft entweder zu einem überdimensionierten Personalbestand, sobald der Spitzenwert vorbei ist, oder zu einer schlecht kontrollierten Abhängigkeit von Subunternehmern.',
    },
    { type: 'h2', text: 'Wann Rekrutieren Sinn ergibt' },
    {
      type: 'list',
      items: [
        'Die Überlastung ist strukturell, nicht punktuell, da sie sich seit mehreren Monaten Baustelle für Baustelle wiederholt',
        'Das gesuchte Know-how ist zentral für den Kernberuf des Unternehmens, nicht eine Randkompetenz',
        'Das Unternehmen verfügt über die Liquidität, um einen Fixlohn auch in einem ruhigeren Monat zu tragen',
      ],
    },
    { type: 'h2', text: 'Wann Subunternehmen sinnvoller ist' },
    {
      type: 'list',
      items: [
        'Der Bedarf ist punktuell oder saisonal und an eine oder zwei konkrete Baustellen gebunden',
        'Die benötigte Kompetenz ist spezialisiert und wird selten gebraucht (eine präzise technische Leistung, ein ergänzendes Gewerk)',
        'Das Unternehmen möchte ein höheres Aktivitätsvolumen testen, bevor es sich für eine dauerhafte Einstellung entscheidet',
      ],
    },
    {
      type: 'callout',
      title: 'Die wahren Kosten einer übereilten Rekrutierung zeigen sich nach der Spitzenzeit, nicht während ihr',
      text: 'Ein Fixlohn, der zur Bewältigung einer punktuellen Überlastung eingegangen wird, belastet die Liquidität weiter, sobald die Spitze abgeflacht ist. Genau dort, mehrere Monate später, zeigt sich oft, dass die Entscheidung falsch war.',
    },
    {
      type: 'cta',
      title: 'Ein stets aktuelles Verzeichnis der Subunternehmer',
      text: 'Das Modul Subunternehmer von Cantia zentralisiert Ihre Partner nach Gewerk und Baustelle. So entscheiden Sie schnell zwischen punktueller Verstärkung und Rekrutierung, ohne bei jeder Spitzenbelastung wieder bei null anzufangen.',
      buttonLabel: 'Kostenlos testen',
    },
  ],
  faq: [
    {
      question: 'Wie erkennt man, ob man rekrutieren statt subunternehmen sollte?',
      answer:
        'Wenn sich die Überlastung seit mehreren Monaten Baustelle für Baustelle wiederholt und eine für den Kernberuf des Unternehmens zentrale Kompetenz betrifft, rechtfertigt sich eine Rekrutierung besser als eine punktuelle Verstärkung.',
    },
    {
      question: 'Was ist das grösste Risiko einer übereilten Rekrutierung?',
      answer:
        'Ein Fixlohn belastet die Liquidität weiter, sobald die Aktivitätsspitze abgeflacht ist, sodass sich die realen Kosten einer Fehlentscheidung oft erst mehrere Monate später zeigen, nicht sofort.',
    },
    {
      question: 'Eignet sich Subunternehmen für einen punktuellen Bedarf?',
      answer:
        'Ja, es eignet sich gut für eine zeitlich begrenzte Aktivitätsspitze oder eine spezialisierte, selten genutzte Kompetenz, ohne das Unternehmen langfristig zu binden.',
    },
  ],
  relatedSlugs: [
    'sous-traitant-batiment-suisse-contrat-facturation',
    'apprenti-batiment-salaire-obligations-employeur',
    'pourquoi-entreprises-batiment-font-faillite-suisse',
  ],
};
