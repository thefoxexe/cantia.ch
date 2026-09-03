import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'degats-voisinage-chantier-qui-est-responsable',
  question: 'Wer zahlt, wenn eine Baustelle beim Nachbarn Schäden verursacht (Riss, Staub, Erschütterungen)?',
  title: 'Schäden bei der Nachbarschaft durch eine Baustelle: wer haftet, und wie man sich schützt',
  description:
    'Ein Riss beim Nachbarn nach Aushubarbeiten, Staub auf einer frisch gestrichenen Fassade: Die Haftung ist nicht automatisch, sondern wird mit einem vorherigen Zustandsbericht bewiesen.',
  excerpt:
    'Ohne Zustandsbericht vor Arbeitsbeginn kann ein Nachbar Ihrer Baustelle einen Riss zuschreiben, der bereits vorher bestand. Das Unternehmen muss dann das Gegenteil beweisen – oft zu spät.',
  category: 'Juridique & normes',
  keywords: ['Nachbarschaftsschäden Baustelle', 'Haftung Arbeiten Nachbar', 'Riss Baustelle Nachbarschaft', 'Baustellenimmissionen', 'Zustandsbericht vor Arbeitsbeginn'],
  publishedAt: '2026-06-19',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Eine Aushub-, Abbruch- oder Rohbaustelle kann bei einem Nachbarn Immissionen oder Schäden verursachen (Risse, Erschütterungen, Staub, überschwappende Materiallagerung auf ein Nachbargrundstück). Die Haftung ist nie automatisch: Sie hängt davon ab, wer den Schaden verursacht hat, und vor allem, was bewiesen werden kann.',
    },
    { type: 'h2', text: 'Wer grundsätzlich haftet' },
    {
      type: 'list',
      items: [
        'Der Unternehmer haftet für seine eigene mangelhafte oder fahrlässige Ausführung (Art. 41 OR, Verschuldenshaftung)',
        'Auch der Bauherr kann belangt werden, wenn die von ihm in Auftrag gegebenen Arbeiten für die Nachbarschaft inhärent riskant waren (Art. 679 ZGB, Nachbarrecht)',
        'Eine Betriebshaftpflichtversicherung des Unternehmens deckt diese Art von Schaden in der Regel, sofern er korrekt dokumentiert ist',
      ],
    },
    { type: 'h2', text: 'Der wirksamste Schutz: der Zustandsbericht vor Arbeitsbeginn' },
    {
      type: 'p',
      text: 'Ein gemeinsam erstellter Zustandsbericht (datierte Fotos, gegebenenfalls mit dem Nachbarn) vor Beginn der Arbeiten ist der beste Schutz für das Unternehmen. Ohne ihn kann ein Nachbar, berechtigt oder in böser Absicht, einen bereits bestehenden Riss der Baustelle zuschreiben, und das Unternehmen hat dann keine Möglichkeit, das Gegenteil zu beweisen.',
    },
    {
      type: 'list',
      items: [
        'Fassaden und empfindliche Elemente der Nachbarschaft vor Arbeitsbeginn systematisch fotografieren',
        'Während der Baustelle festgestellte Erschütterungen oder Immissionen dokumentieren, wenn sie ungewöhnlich erscheinen',
        'Diese Beweise im Baustellendossier aufbewahren, nicht nur auf einem privaten Mobiltelefon, das verloren gehen kann',
      ],
    },
    {
      type: 'callout',
      title: 'Ein nach einer Beschwerde des Nachbarn erstellter Zustandsbericht beweist nichts',
      text: 'Der Beweis muss vor dem strittigen Ereignis existieren: eine Aufnahme, die im Nachhinein gemacht wird, nachdem der Streit bereits erklärt wurde, hat keinen Wert, um den vorherigen Zustand der Liegenschaft zu belegen.',
    },
    {
      type: 'cta',
      title: 'Zeitgestempelte Baustellenfotos, ab dem ersten Tag',
      text: 'Der Cantia-Aktivitätsstream versieht jedes Foto mit Standort und Zeitstempel. Ein Zustandsbericht vor Arbeitsbeginn wird so zu einem einfachen Reflex, automatisch dokumentiert.',
      buttonLabel: 'Kostenlos testen',
    },
  ],
  faq: [
    {
      question: 'Wer haftet für Schäden, die einem Nachbarn durch eine Baustelle entstehen?',
      answer:
        'Der Unternehmer haftet für seine eigene fehlerhafte Ausführung, und auch der Bauherr kann belangt werden, wenn die beauftragten Arbeiten für die Nachbarschaft inhärent riskant waren.',
    },
    {
      question: 'Wie schützt man sich gegen einen unbegründeten Schadensvorwurf?',
      answer:
        'Durch einen gemeinsam erstellten Zustandsbericht mit datierten Fotos vor Beginn der Arbeiten: das ist der einzige zuverlässige Beweis für den vorherigen Zustand der Nachbarliegenschaft.',
    },
    {
      question: 'Deckt die Betriebshaftpflichtversicherung Schäden bei der Nachbarschaft?',
      answer:
        'In der Regel ja, sofern der Schaden korrekt dokumentiert ist und die Haftung des Unternehmens feststeht.',
    },
  ],
  relatedSlugs: [
    'assurance-rc-professionnelle-batiment-obligatoire',
    'photos-chantier-preuve-juridique-litige',
    'assurance-chantier-tous-risques-ectr-obligatoire',
  ],
};
