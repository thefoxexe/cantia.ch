import { forceLocale } from '../../../lib/translations';
import { SolutionPage } from '../../../components/SolutionPage';
import { ModuleMockup } from '../../../components/solutions/ModuleMockup';

forceLocale('de');

export default function RapportsChantierSolutionPageDe() {
  return (
    <SolutionPage
      kicker="Baustellenrapporte"
      title="Der Rapport entsteht, während Sie noch auf der Baustelle sind"
      subtitle="Sprachnotizen, georeferenzierte Fotos und Nachrichten aus dem Feed: Cantia sammelt alles und erstellt daraus einen verfassten, strukturierten und versandbereiten Rapport — Sie müssen nur noch gegenlesen."
      visual={<ModuleMockup kind="rapports-chantier" />}
      features={[
        {
          icon: 'mic',
          title: 'Per Sprache diktiert',
          text: 'Erzählen Sie einfach, was passiert ist — Cantia transkribiert und der KI-Textassistent erstellt daraus einen professionellen Text, ohne Fehler oder Umgangssprache.',
        },
        {
          icon: 'message-square',
          title: 'Aus dem Baustellen-Feed',
          text: 'Notizen und Sprachnachrichten aus dem Team-Feed können direkt in den Rapport einfliessen, ohne alles neu zu tippen.',
        },
        {
          icon: 'camera',
          title: 'Georeferenzierte Fotos',
          text: 'Jedes Foto behält seinen GPS-Standort und Zeitstempel, automatisch als Raster im PDF organisiert.',
        },
        {
          icon: 'map',
          title: 'Standortübersicht der Fotos',
          text: 'Wenn Fotos an mehreren Stellen der Baustelle aufgenommen werden, ordnet ein Lageschema sie relativ zueinander ein.',
        },
        {
          icon: 'edit-3',
          title: 'Unterschrift des Verfassers',
          text: 'Der Rapport trägt die persönliche Unterschrift der Person, die ihn erstellt hat, nicht einen generischen Firmenstempel.',
        },
        {
          icon: 'droplet',
          title: 'Eine Darstellung für alle Berufe',
          text: 'Ob Maurer, Maler, Elektriker oder Geometer — dieselbe schlichte Vorlage passt sich Ihrer Markenfarbe an.',
        },
      ]}
      steps={[
        { title: 'Notieren Sie vor Ort', text: 'Per Sprache, per Text, oder aus dem mit Ihrem Team geteilten Baustellen-Feed.' },
        { title: 'Die KI verfasst', text: 'Rohnotizen, Fotolegenden und Standortangaben werden zu einem klaren Text zusammengefügt.' },
        { title: 'Gegenlesen und PDF erstellen', text: 'Bei Bedarf anpassen, dann einen versandbereiten Rapport für den Kunden exportieren.' },
      ]}
      faq={[
        {
          question: 'Wie erstellt man schnell einen Baustellenrapport?',
          answer:
            'Machen Sie Ihre Fotos und diktieren Sie Ihre Notizen vor Ort — Cantia fügt alles zu einem strukturierten, versandbereiten PDF-Rapport zusammen, ohne dass Sie abends alles neu tippen müssen.',
        },
        {
          question: 'Werden Fotos automatisch georeferenziert?',
          answer: 'Ja, jedes Foto wird ohne zusätzliches Zutun mit Zeitstempel und Standort versehen.',
        },
        {
          question: 'Kann man den Rapport mit Logo und Unterschrift personalisieren?',
          answer: 'Ja, jeder PDF-Rapport übernimmt Ihr Logo, Ihre Markenfarbe und die Unterschrift des Verfassers.',
        },
        {
          question: 'Ersetzt der Baustellenrapport ein Papier-Bautagebuch?',
          answer: 'Ja — Notizen, Fotos und Verlauf sind in einem digitalen Dokument gebündelt, jederzeit pro Baustelle einsehbar.',
        },
      ]}
      related={[
        { href: '/de/solutions/dictee-vocale', label: 'Sprachdiktat' },
        { href: '/de/solutions/planning', label: 'Teamplanung' },
      ]}
      closingTitle="Ein professioneller Rapport, ohne den Abend dafür zu opfern"
      closingText="In allen Cantia-Plänen enthalten, ohne Ausnahme."
    />
  );
}
