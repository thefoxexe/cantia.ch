import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'chantier-complet-peut-etre-en-perte-taux-horaire',
  question: 'Warum kann eine abgeschlossene und bezahlte Baustelle trotzdem ein Verlust sein?',
  title: 'Eine «erfolgreiche» Baustelle kann trotzdem ein Verlust sein — hier ist warum',
  description:
    'Eine fristgerecht gelieferte, vollständig bezahlte Baustelle kann trotzdem einen realen Verlust bedeuten, wenn die eingesetzten Stundenkosten nie mit den tatsächlich aufgewendeten Stunden verglichen wurden.',
  excerpt:
    'Die Baustelle ist geliefert, der Kunde zufrieden, die Rechnung bezahlt. Und trotzdem hat das Unternehmen vielleicht Geld daran verloren, ohne dass je ein Signal darauf hingewiesen hätte.',
  category: 'Chantier & rentabilité',
  keywords: ['baustelle im verlust', 'rentabilität baustelle', 'stundenkosten', 'devisiert vs real', 'reale marge bau'],
  publishedAt: '2026-04-06',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'Der Kunde ist zufrieden, die Zahlung ist eingegangen, die nächste Baustelle beginnt bereits. Alles deutet auf einen Erfolg hin. Ausser einer Zahl, die niemand angeschaut hat: wie viele Stunden wirklich aufgewendet wurden, verglichen mit dem, was devisiert worden war. Genau dort versteckt sich der Verlust, den das Gefühl der «erfolgreichen Baustelle» fast immer verdeckt.',
    },
    { type: 'h2', text: 'Die Falle des Denkens «ich wurde bezahlt, also habe ich verdient»' },
    {
      type: 'p',
      text: 'Den Offertbetrag bezahlt zu bekommen, sagt nichts über die Rentabilität aus, wenn die Offerte selbst die benötigten Stunden unterschätzt hat. Eine Baustelle, die auf 40h Arbeitszeit offeriert wurde und tatsächlich 58h beanspruchte, hat nicht die erwartete Marge erzielt, auch wenn der Kunde genau den vereinbarten Betrag bezahlt hat. Die Stundendifferenz wurde einfach still absorbiert, ohne dass die Rechnung etwas davon zeigt.',
    },
    {
      type: 'callout',
      title: 'Die Rechnung, die fast niemand macht',
      text: 'Reale Marge = Verkaufspreis − (tatsächlich aufgewendete Stunden × reale Stundenkosten) − tatsächlich gekauftes Material − tatsächlich fakturierte Subunternehmerleistungen. Ohne diese spezifische Berechnung pro Baustelle kann ein Unternehmen am Jahresende rentabel erscheinen, obwohl es Baustelle für Baustelle systematisch seine Stunden unterschätzt hat.',
    },
    { type: 'h2', text: 'Warum es unbemerkt bleibt' },
    {
      type: 'list',
      items: [
        'Die allgemeine Buchhaltung des Unternehmens bleibt positiv, solange eine andere, rentablere Baustelle den Verlust der ersten ausgleicht, sodass der einzelne Verlust im Durchschnitt untergeht',
        'Ohne Stundenerfassung pro Baustelle gibt es schlicht keine Zahl, die mit der ursprünglichen Offerte verglichen werden könnte',
        'Eine über mehrere Wochen verteilte Stundenüberschreitung fällt nie so auf wie eine Überschreitung an einem einzigen Tag',
      ],
    },
    { type: 'h2', text: 'Das Signal, das man beobachten sollte — nicht erst im Nachhinein' },
    {
      type: 'p',
      text: 'Der richtige Moment, um diese Art von Verlust zu erkennen, ist nicht der Abschluss der Baustelle, sondern die Mitte, wenn die bereits aufgewendeten Stunden sich schon dem für die gesamte Baustelle Devisierten nähern. In diesem Stadium besteht noch Handlungsspielraum: reorganisieren, beschleunigen oder zumindest für die nächste ähnliche Offerte daraus lernen.',
    },
    {
      type: 'p',
      text: 'Über die Zeit betrachtet ist es genau diese Zahl, die ein wachsendes Unternehmen von einem unterscheidet, das läuft, ohne je reicher zu werden: nicht der fakturierte Umsatz, sondern die durchschnittliche Abweichung zwischen devisierten und tatsächlichen Stunden, Baustelle für Baustelle.',
    },
    {
      type: 'cta',
      title: 'Die reale Marge, sichtbar Baustelle für Baustelle',
      text: 'Das Rentabilitätsmodul von Cantia vergleicht automatisch Devisiertes und Reales (Stunden, Material, Subunternehmerleistungen), um eine Überschreitung vor dem Abschluss zu erkennen, nicht danach.',
      buttonLabel: 'Rentabilität pro Baustelle entdecken',
    },
  ],
  faq: [
    {
      question: 'Wie kann eine vollständig bezahlte Baustelle trotzdem ein Verlust sein?',
      answer:
        'Wenn die tatsächlich aufgewendeten Stunden die devisierten deutlich übersteigen, können die realen Arbeitskosten die vorgesehene Marge übersteigen, selbst wenn der Kunde genau den Offertbetrag bezahlt hat.',
    },
    {
      question: 'Warum bleibt diese Art von Verlust oft unbemerkt?',
      answer:
        'Weil die allgemeine Buchhaltung des Unternehmens dank anderer, rentablerer Baustellen positiv bleiben kann, und weil ohne präzise Stundenerfassung pro Baustelle keine Zahl existiert, die mit der ursprünglichen Offerte verglichen werden könnte.',
    },
    {
      question: 'Wann sollte man prüfen, ob eine Baustelle bei den Stunden entgleist?',
      answer:
        'Während der Bauzeit, nicht beim Abschluss: Eine laufende Nachverfolgung erlaubt noch Anpassungen, während eine Feststellung nach Bauende nur noch dazu dient, im Nachhinein zu verstehen, was passiert ist.',
    },
  ],
  relatedSlugs: [
    'suivre-rentabilite-chantier-sans-excel',
    'calculer-prix-devis-renovation-suisse',
    'gerer-plusieurs-chantiers-en-parallele-methode',
  ],
};
