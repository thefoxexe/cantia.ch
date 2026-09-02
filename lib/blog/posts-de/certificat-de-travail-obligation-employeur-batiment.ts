import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'certificat-de-travail-obligation-employeur-batiment',
  question: 'Ist ein Bauunternehmen als Arbeitgeber verpflichtet, ein Arbeitszeugnis auszustellen, und was muss es enthalten?',
  title: 'Arbeitszeugnis im Bauwesen: eine Pflicht, kein Gefallen',
  description:
    'Ein Mitarbeiter, der das Unternehmen verlässt, hat jederzeit das Recht, ein Arbeitszeugnis zu verlangen. Es zu verweigern oder schludrig zu erstellen setzt den Arbeitgeber einem Rechtsstreit aus, auch lange nach dem Austritt.',
  excerpt:
    'Viele Kleinunternehmen behandeln das Arbeitszeugnis als Formalität in letzter Minute. Es ist ein Recht des Arbeitnehmers, geregelt durch präzise Vorschriften darüber, was es enthalten darf und was nicht.',
  category: 'RH & salaires',
  keywords: ['arbeitszeugnis pflicht arbeitgeber', 'arbeitszeugnis mitarbeiter bau', 'arbeitszeugnis schweiz', 'recht arbeitnehmer zeugnis', 'austritt mitarbeiter bauunternehmen'],
  publishedAt: '2026-06-26',
  readMinutes: 4,
  blocks: [
    {
      type: 'p',
      text: 'Art. 330a des Obligationenrechts (OR) gibt jedem Arbeitnehmer, ohne Ausnahme, das Recht, von seinem Arbeitgeber ein Arbeitszeugnis zu verlangen, unabhängig von der Art des Austritts: Kündigung durch den Arbeitnehmer, Kündigung durch den Arbeitgeber oder Ende eines befristeten Vertrags. Dieses Recht besteht jederzeit, auch Jahre nach dem tatsächlichen Austritt aus dem Unternehmen.',
    },
    { type: 'h2', text: 'Zwei mögliche Formen' },
    {
      type: 'list',
      items: [
        'Das vollständige Arbeitszeugnis, das Art und Dauer des Arbeitsverhältnisses sowie die Qualität von Arbeit und Verhalten beschreibt: Das ist die Standardform, wenn der Arbeitnehmer nichts anderes präzisiert',
        'Die einfache Arbeitsbestätigung, die nur Art und Dauer der Anstellung nennt, ohne Beurteilung: Der Arbeitnehmer kann sie ausdrücklich anstelle des vollständigen Zeugnisses verlangen',
      ],
    },
    { type: 'h2', text: 'Was das Zeugnis niemals enthalten darf' },
    {
      type: 'list',
      items: [
        'Verschlüsselte oder mehrdeutige Formulierungen, die dem Arbeitnehmer verdeckt schaden sollen (eine von der Rechtsprechung anerkannte und geahndete Praxis)',
        'Werturteile, die nicht objektiv auf überprüfbaren Tatsachen beruhen',
        'Angaben zu Krankheit, Schwangerschaft oder jedem Element ohne direkten Bezug zur eigentlichen Arbeitsleistung',
      ],
    },
    {
      type: 'callout',
      title: 'Ein hastig verfasstes Arbeitszeugnis fällt oft auf das Unternehmen zurück',
      text: 'Ein Arbeitnehmer, der sein Zeugnis für unrichtig oder zu vage hält, kann eine Berichtigung verlangen oder sogar das Gericht anrufen. Es lohnt sich daher, es gleich beim ersten Mal sorgfältig zu verfassen, statt es später unter Druck neu erstellen zu müssen.',
    },
    { type: 'h2', text: 'Wie man die Erstellung vereinfacht' },
    {
      type: 'p',
      text: 'Ein gut fundiertes Arbeitszeugnis stützt sich auf konkrete, dokumentierte Fakten: die ausgeführten Baustellen, die übernommenen Verantwortlichkeiten, die im Laufe der Zeit gezeigten Kompetenzen. Je besser die Tätigkeit des Arbeitnehmers während seiner Anstellung nachverfolgt und dokumentiert wurde, desto schneller und objektiver wird die Erstellung.',
    },
    {
      type: 'cta',
      title: 'Ein Tätigkeitsverlauf pro Mitarbeiter, bereit wenn Sie ihn brauchen',
      text: 'Das Modul Personal & Löhne von Cantia hält die Einsätze und die Tätigkeit jedes Teammitglieds fest. Das ist eine konkrete Grundlage, um ein faires und rasch erstelltes Arbeitszeugnis zu verfassen.',
      buttonLabel: 'Kostenlos testen',
    },
  ],
  faq: [
    {
      question: 'Kann ein Arbeitgeber die Ausstellung eines Arbeitszeugnisses verweigern?',
      answer:
        'Nein, das ist ein Recht des Arbeitnehmers gemäss Art. 330a OR, jederzeit einforderbar, auch lange nach Beendigung des Arbeitsverhältnisses.',
    },
    {
      question: 'Was ist der Unterschied zwischen einem vollständigen Arbeitszeugnis und einer Arbeitsbestätigung?',
      answer:
        'Das vollständige Zeugnis enthält eine Beurteilung von Arbeitsqualität und Verhalten, während die einfache Bestätigung nur Art und Dauer der Anstellung nennt, auf Wunsch des Arbeitnehmers.',
    },
    {
      question: 'Darf in einem Arbeitszeugnis eine Krankheit erwähnt werden?',
      answer:
        'Nein, ausser bei direktem Bezug zur eigentlichen Arbeitsleistung: Die Erwähnung einer Krankheit oder Schwangerschaft ohne direkten Bezug ist nicht zulässig.',
    },
  ],
  relatedSlugs: [
    'licenciement-ouvrier-batiment-delai-conge-cct',
    'demission-employe-batiment-preavis-a-respecter',
    'apprenti-batiment-salaire-obligations-employeur',
  ],
};
