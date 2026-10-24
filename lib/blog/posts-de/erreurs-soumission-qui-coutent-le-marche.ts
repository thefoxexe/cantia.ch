import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'erreurs-soumission-qui-coutent-le-marche',
  question: 'Welche Fehler kosten im Bau den Zuschlag bei einer Submission?',
  title: 'Leistungsverzeichnisse: die 8 Fehler, die den Auftrag (oder die Marge) kosten',
  description:
    'Vergessene Position, falscher Seitenübertrag, falsch gelesene Einheit, Skonto am falschen Ort: Fehler, die ein Angebot ausschliessen oder einen Auftrag mit Verlust bringen, und wie man sie vermeidet.',
  excerpt:
    'Man verliert eine Submission selten, weil man 2 % zu teuer war. Man verliert sie, oder gewinnt sie mit Verlust, wegen einer leeren Zeile oder eines falschen Übertrags.',
  category: 'Devis & facturation',
  keywords: ['Fehler Leistungsverzeichnis', 'Submission Bau', 'Angebot ausgeschlossen', 'Seitenübertrag LV', 'Kontrolle Offerte'],
  publishedAt: '2026-10-24',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'Eine Submission entscheidet sich über den Preis, aber auch über die Sorgfalt. Ein unvollständiges Angebot kann ausgeschlossen werden, bevor es überhaupt verglichen wird, und ein Rechenfehler, der nach dem Zuschlag auffällt, kostet während der ganzen Bauzeit. Hier die häufigsten Fehler und die einfache Kontrolle, die sie verhindert.',
    },
    { type: 'h2', text: '1. Eine Position ohne Preis' },
    {
      type: 'p',
      text: 'Der häufigste Fehler in einem Dokument mit mehreren Dutzend Seiten. Je nach Kontext gilt die leere Position als gratis inbegriffen oder macht das Angebot unvollständig. Zählen Sie vor dem Versand die Positionen ohne Preis: Die Zahl muss null sein, ausser bei Positionen, die Sie schriftlich bewusst ausschliessen.',
    },
    { type: 'h2', text: '2. Ein falscher Seitenübertrag' },
    {
      type: 'p',
      text: 'Auf Papier wird das Total jeder Seite oben auf die nächste übertragen. Ein einziger Abschreibfehler verschiebt das ganze Kapitel und das Total. Ein Werkzeug, das die Überträge aus den Beträgen berechnet, beseitigt dieses Risiko.',
    },
    { type: 'h2', text: '3. Eine falsch gelesene Einheit' },
    {
      type: 'p',
      text: 'Preis pro m², obwohl die Position in m³ ist, pro Laufmeter statt pro Stück, pro Stunde statt pauschal: Die Abweichung kann einen Faktor zehn ausmachen. Lesen Sie die Einheit jeder Position, bevor Sie einen Preis aus Ihrem Katalog übernehmen.',
    },
    { type: 'h2', text: '4. Die Mengen des Dokuments ändern' },
    {
      type: 'p',
      text: 'Die Mengen dienen dem Vergleich der Angebote untereinander. Wenn Sie eine Menge für falsch halten, sagen Sie es in einer Bemerkung oder einem Schreiben, aber ändern Sie die Zeile nicht. Sie füllen nur die Mengen aus, die eine Position ausdrücklich verlangt.',
    },
    { type: 'h2', text: '5. Rabatt und Skonto am falschen Ort' },
    {
      type: 'p',
      text: 'Der Rabatt senkt den Angebotspreis; das Skonto belohnt eine schnelle Zahlung. Wer sie in der falschen Reihenfolge anwendet oder die MWST vorher berechnet, verändert das Total. Halten Sie sich an die Reihenfolge der Zusammenstellung im Leistungsverzeichnis.',
    },
    { type: 'h2', text: '6. Die besonderen Bestimmungen übersehen' },
    {
      type: 'p',
      text: 'Die ersten Seiten enthalten oft das, was am meisten kostet: Ausführungsfristen, Konventionalstrafen, Baustelleninstallationen zulasten des Unternehmers, eingeschränkte Arbeitszeiten, Entsorgung. Ein richtiger Einheitspreis kann zum Verlustgeschäft werden, wenn diese Bedingungen nicht eingerechnet sind.',
    },
    { type: 'h2', text: '7. Ein anderes Dokument als das verlangte einreichen' },
    {
      type: 'p',
      text: 'Eine Offerte im eigenen Format, eine Excel-Tabelle statt des Formulars: Der Vergleich wird schwierig, und bei einem öffentlichen Auftrag kann das Angebot als nicht konform gelten. Reichen Sie das ausgefüllte Originaldokument mit den verlangten Beilagen ein.',
    },
    { type: 'h2', text: '8. Zu spät einreichen' },
    {
      type: 'p',
      text: 'Bei einem öffentlichen Auftrag wird ein Angebot, das nach Ablauf der Frist eintrifft, grundsätzlich ausgeschlossen, auch wenn es ausgezeichnet ist. Notieren Sie Datum und Uhrzeit der Eingabefrist gleich beim Eingang und planen Sie den Versand am Vortag.',
    },
    {
      type: 'callout',
      title: 'Die 5-Minuten-Kontrolle vor dem Versand',
      text: 'Positionen ohne Preis: null. Summe der Kapitel gleich Zusammenstellung. Rabatt, Skonto und MWST in der Reihenfolge des Dokuments. Datum, Unterschrift, Beilagen. Eingabedatum und -zeit eingehalten.',
    },
    { type: 'h2', text: 'Mit Cantia (Beta)' },
    {
      type: 'p',
      text: 'Cantia übernimmt die Positionen aus dem erhaltenen PDF und lässt Sie nur die Preise ausfüllen: Die Mengen des Dokuments bleiben unverändert, Beträge, Überträge und Totale werden berechnet, und die Zusammenstellung zeigt, was noch zu kalkulieren ist. Das Original-PDF kommt ausgefüllt zurück. In der Beta, ab dem Plan Team (3 Leistungsverzeichnisse pro Monat), unbegrenzt im Plan Entreprise.',
    },
    {
      type: 'cta',
      title: 'Kein falscher Übertrag in Ihrem nächsten Leistungsverzeichnis',
      text: 'PDF importieren, Preise einsetzen, Cantia rechnet und füllt das Originaldokument aus.',
      buttonLabel: '14 Tage testen',
    },
  ],
  faq: [
    {
      question: 'Wird ein Angebot mit einer leeren Position automatisch ausgeschlossen?',
      answer:
        'Nicht immer, aber das Risiko ist real: Je nach Ausschreibungsbedingungen kann es als unvollständig gelten. Bei einem privaten Auftrag bittet Sie der Architekt bestenfalls um Ergänzung, schlimmstenfalls vergleicht er, als wäre die Position inbegriffen.',
    },
    {
      question: 'Kann man ein Leistungsverzeichnis nach der Eingabe noch korrigieren?',
      answer:
        'Bei einem öffentlichen Auftrag sind Änderungen nach der Eingabe streng geregelt, und der Preis wird grundsätzlich nicht frei nachverhandelt. Besser vor dem Versand kontrollieren, als auf eine Korrektur danach zu hoffen.',
    },
    {
      question: 'Wie vermeidet man Fehler beim Seitenübertrag?',
      answer: 'Indem man sie nicht von Hand macht: Eine Tabellenkalkulation oder ein Werkzeug, das Beträge berechnet und Seitentotale automatisch überträgt, beseitigt dieses Risiko.',
    },
  ],
  relatedSlugs: ['remplir-soumission-pdf-architecte', 'rabais-escompte-tva-ordre-soumission', 'repondre-appel-offres-public-batiment-etapes'],
};
