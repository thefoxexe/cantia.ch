import { forceLocale } from '../../../lib/translations';
import { SolutionPage } from '../../../components/SolutionPage';
import { ModuleMockup } from '../../../components/solutions/ModuleMockup';

forceLocale('de');

export default function SoumissionsSolutionPageDe() {
  return (
    <SolutionPage
      kicker="Leistungsverzeichnis ausfüllen · Beta"
      title="Das erhaltene Leistungsverzeichnis, mit Ihren Preisen ausgefüllt — ohne eine Position abzutippen"
      subtitle="Der Architekt schickt Ihnen ein Leistungsverzeichnis als PDF. Cantia übernimmt die Positionen, Sie setzen Ihre Preise ein und senden das Original-PDF ausgefüllt zurück: Einheitspreise, Beträge, Überträge und Totale am richtigen Ort."
      visual={<ModuleMockup kind="soumissions" />}
      features={[
        {
          icon: 'upload',
          title: 'Das erhaltene PDF, so wie es ist',
          text: 'Importieren Sie das Leistungsverzeichnis des Architekten oder Bauherrn, nach NPK oder nicht. Kapitel, Positionen, Einheiten und Mengen werden automatisch übernommen, auch bei gescannten Dokumenten.',
        },
        {
          icon: 'check-square',
          title: 'Sie prüfen, bevor Sie kalkulieren',
          text: 'Eine Prüfansicht zeigt Position für Position, was gelesen wurde, und fragt nach, wenn eine Stelle unklar ist. Nichts wird ohne Sie übernommen.',
        },
        {
          icon: 'lock',
          title: 'Die Mengen des Dokuments bleiben unverändert',
          text: 'Sie füllen nur den Preis aus. Die Mengen sind die des Architekten; lässt das Dokument eine Menge offen, tragen Sie sie ein.',
        },
        {
          icon: 'zap',
          title: 'Schnell per Tastatur kalkulieren',
          text: 'Pfeiltasten von Position zu Position, Preise aus Ihrem Katalog nach Positionsnummer und aus früheren Leistungsverzeichnissen. Das Total rechnet sich bei jedem Preis neu.',
        },
        {
          icon: 'file-text',
          title: 'Das Original-PDF, ausgefüllt',
          text: 'Cantia schreibt Ihre Einheitspreise und Beträge ins erhaltene PDF, mit Überträgen, Rabatt, Skonto, MWST und Ihren Firmenangaben. Sie senden das erwartete Dokument zurück, keine separate Tabelle.',
        },
        {
          icon: 'archive',
          title: 'Bei der Baustelle abgelegt',
          text: 'Jedes Leistungsverzeichnis bleibt bei seiner Baustelle, neben Dokumenten und Fotos, und alle finden sich im Menü Leistungsverzeichnisse.',
        },
      ]}
      steps={[
        { title: 'PDF importieren', text: 'Am Computer die Baustelle wählen, dann das erhaltene Leistungsverzeichnis.' },
        { title: 'Preise einsetzen', text: 'Position für Position per Tastatur, Ihre üblichen Preise werden vorgeschlagen.' },
        { title: 'Ausgefülltes PDF zurücksenden', text: 'Das ergänzte Original-PDF herunterladen, bereit zum Unterschreiben und Versenden.' },
      ]}
      faq={[
        {
          question: 'Was ist «Leistungsverzeichnis ausfüllen» in Cantia?',
          answer:
            'Eine Beta-Funktion, um auf erhaltene Leistungsverzeichnisse im PDF-Format zu antworten: Cantia übernimmt die Positionen, Sie setzen Ihre Preise ein und erhalten das Original-PDF mit Einheitspreisen, Beträgen, Überträgen und Totalen.',
        },
        {
          question: 'In welchen Plänen ist die Funktion enthalten?',
          answer: 'Ab dem Plan Team, mit 3 Leistungsverzeichnissen pro Monat. Im Plan Entreprise unbegrenzt. Im Plan Basis nicht enthalten.',
        },
        {
          question: 'Welche Leistungsverzeichnisse lassen sich importieren?',
          answer:
            'Leistungsverzeichnisse als PDF, nach NPK gegliedert oder nicht, auch gescannte Dokumente. Cantia erstellt keine leeren Leistungsverzeichnisse: Die Funktion dient dazu, auf erhaltene zu antworten.',
        },
        {
          question: 'Warum ist die Funktion in Beta?',
          answer:
            'Jeder Architekt gestaltet seine Leistungsverzeichnisse anders. Die gängigen Fälle werden bereits gelesen; in der Prüfansicht korrigieren Sie, was nicht richtig erkannt wurde, und jede Rückmeldung hilft uns, besser zu werden.',
        },
        {
          question: 'Kann man ein Leistungsverzeichnis am Telefon ausfüllen?',
          answer: 'Am Telefon lassen sich Leistungsverzeichnisse ansehen. Import und Preiseingabe erfolgen am Computer, wo das ganze Dokument sichtbar ist.',
        },
        {
          question: 'Für welche Branchen?',
          answer: 'Für Bau- und Tiefbauunternehmen: Maurer, Rohbau, Elektro, Sanitär, Heizung, Schreiner, Maler, Gipser und alle anderen Gewerke, die auf Ausschreibungen antworten.',
        },
      ]}
      related={[
        { href: '/de/solutions/devis', label: 'Offerten' },
        { href: '/de/solutions/planning', label: 'Planung' },
        { href: '/de/solutions/rentabilite', label: 'Rentabilität pro Baustelle' },
      ]}
      closingTitle="Mehr Ausschreibungen beantworten, mit weniger Abendarbeit"
      closingText="Leistungsverzeichnis ausfüllen ist in Beta, ab dem Plan Team (3 pro Monat) und unbegrenzt im Plan Entreprise. 14 Tage testen, ohne Verpflichtung."
    />
  );
}
