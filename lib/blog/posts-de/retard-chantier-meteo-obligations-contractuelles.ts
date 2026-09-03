import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'retard-chantier-meteo-obligations-contractuelles',
  question: 'Begründet ein wetterbedingter Baustellenverzug die Haftung des Unternehmers?',
  title: 'Wetterbedingter Baustellenverzug: wer trägt die Verantwortung?',
  description:
    'Eine wegen Unwetter überschrittene Vertragsfrist ist nicht automatisch ein Verschulden des Unternehmers. Man muss es aber Tag für Tag beweisen können und rechtzeitig kommuniziert haben.',
  excerpt:
    'Der Kunde wartet auf die fertige Baustelle, das Wetter hat nicht mitgespielt, und ohne schriftlichen Beweis droht der Verzug vollständig auf den Unternehmer zurückzufallen, selbst wenn er nichts dafür kann.',
  category: 'Chantier & rentabilité',
  keywords: ['baustellenverzug wetter', 'unwetter bauverzögerung', 'vertragsfrist bauwesen', 'haftung unternehmer bauverzug', 'nachweis bauverzögerung'],
  publishedAt: '2026-07-22',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Eine wegen anhaltender Unwetter überschrittene Baustellenfrist stellt grundsätzlich kein Verschulden des Unternehmers dar, solange der Verzug in einem angesichts der angetroffenen Bedingungen vernünftigen Rahmen bleibt. Dieser Schutz gilt aber nicht automatisch: Ohne präzise Dokumentation kann ein unredlicher (oder einfach unzufriedener) Kunde bestreiten, dass das Wetter die Arbeit tatsächlich verhindert hat – mangels Beweis.',
    },
    { type: 'h2', text: 'Was rechtlich zählt' },
    {
      type: 'list',
      items: [
        'Das Wetter muss die Ausführung der Arbeiten konkret verhindert haben, nicht nur die Baustelle unangenehm gemacht haben',
        'Der Verzug muss dem Kunden innert vernünftiger Frist mitgeteilt worden sein, nicht erst nachträglich bei der Übergabe offengelegt werden',
        'Die Dauer des Verzugs muss im Verhältnis zu den tatsächlich betroffenen Tagen stehen, nicht durch andere unternehmensinterne Ursachen aufgebläht sein',
        'Ein Vertrag, der ausdrücklich eine Unwetterklausel vorsieht, schützt besser als völliges Schweigen zu diesem Thema',
      ],
    },
    {
      type: 'callout',
      title: 'Der Beweis entsteht Tag für Tag, nicht nachträglich',
      text: 'Eine nachträglich eingeholte offizielle Wetteraufzeichnung überzeugt einen Kunden nicht immer. Eine datierte Spur dessen, was an diesem Tag auf der Baustelle tatsächlich geschah (Fotos, Notizen, festgestellte Teamabwesenheit), ist deutlich solider.',
    },
    { type: 'h2', text: 'Vorbeugen statt nachträglich rechtfertigen' },
    {
      type: 'p',
      text: 'Der beste Schutz bleibt, den Verzug dem Kunden zu kommunizieren, sobald er absehbar wird, mit einem neuen geschätzten Termin, statt Schweigen aufkommen zu lassen, bis der Kunde ungeduldig wird und die Verschiebung allein entdeckt. Eine datierte Nachricht, auch informell, wiegt oft mehr als eine ausführliche, nachträglich vorgelegte Rechtfertigung.',
    },
    {
      type: 'cta',
      title: 'Ein datierter und dokumentierter Baustellen-Feed',
      text: 'Der Aktivitäten-Feed von Cantia versieht jedes Foto und jede Nachricht der Baustelle mit einem Zeitstempel – ideal, um eine Abfolge von Stillstandstagen präzise zu rekonstruieren, falls ein Verzug begründet werden muss.',
      buttonLabel: 'Kostenlos testen',
    },
  ],
  faq: [
    {
      question: 'Haftet ein Unternehmer für einen wetterbedingten Verzug?',
      answer:
        'Grundsätzlich nicht, solange der Verzug angesichts der angetroffenen Bedingungen vernünftig bleibt und dem Kunden korrekt kommuniziert wurde. Dies muss allerdings dokumentiert werden können.',
    },
    {
      question: 'Muss man den Kunden warnen, sobald ein Verzug wahrscheinlich wird?',
      answer:
        'Ja, das ist der beste Schutz: früh kommunizieren, mit einem neuen geschätzten Termin, statt den Kunden die Verschiebung erst bei der Übergabe allein entdecken zu lassen.',
    },
    {
      question: 'Genügt eine offizielle Wetteraufzeichnung, um einen Baustellenverzug zu rechtfertigen?',
      answer:
        'Sie hilft, aber eine datierte Spur dessen, was tatsächlich auf der Baustelle geschah (Fotos, Teamnotizen), ist oft überzeugender als eine allgemeine, nachträglich beschaffte Wetterangabe.',
    },
  ],
  relatedSlugs: [
    'gerer-plusieurs-chantiers-en-parallele-methode',
    'photos-chantier-preuve-juridique-litige',
    'avenant-chantier-plus-value-moins-value',
  ],
};
