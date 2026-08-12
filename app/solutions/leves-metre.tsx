import { SolutionPage } from '../../components/SolutionPage';

export default function LevesMetreSolutionPage() {
  return (
    <SolutionPage
      kicker="Levés & Métré"
      title="Levés de terrain et métrés, sur fond de cadastre suisse"
      subtitle="Placez vos points directement sur une carte avec cadastre et orthophoto officiels suisses, puis passez au métré pour chiffrer les quantités — sans changer d'outil."
      features={[
        {
          icon: 'map-pin',
          title: 'Carte cadastre & orthophoto',
          text: "Vos points de levé s'affichent sur les tuiles officielles du cadastre suisse et sur une orthophoto récente, directement dans l'application.",
        },
        {
          icon: 'crosshair',
          title: 'Position GPS en direct',
          text: "Votre position s'affiche en temps réel sur la carte, avec possibilité d'ajouter un point directement sur votre emplacement actuel.",
        },
        {
          icon: 'hash',
          title: 'Numérotation et classes automatiques',
          text: "Chaque point reçoit un numéro sans y penser, et peut être classé selon vos propres catégories.",
        },
        {
          icon: 'grid',
          title: 'Module Métré intégré',
          text: "Passez du relevé au chiffrage : le module Métré reprend vos mesures pour calculer les quantités, dans un tableau pensé pour le mobile.",
        },
        {
          icon: 'download',
          title: 'Export DXF, LandXML, CSV ou GPX',
          text: "Exportez vos points de levé dans le format attendu par vos outils ou par un bureau d'ingénieurs, sans ressaisie.",
        },
        {
          icon: 'zap',
          title: 'Métré → devis en un clic',
          text: "Chaque poste de métré chiffré se transforme directement en ligne de devis, sans retaper les quantités.",
        },
      ]}
      faq={[
        {
          question: 'Peut-on faire des levés directement sur le cadastre suisse ?',
          answer: "Oui, Cantia affiche le cadastre et l'orthophoto officiels suisses, et vous placez vos points directement dessus.",
        },
        {
          question: 'Comment exporter les données de levés ?',
          answer: "Au format DXF, LandXML, CSV ou GPX, pour les réutiliser dans d'autres logiciels ou les partager avec un bureau d'ingénieurs.",
        },
        {
          question: 'Le métré est-il relié directement au devis ?',
          answer: "Oui, chaque poste de métré peut être transformé en ligne de devis chiffrée en un clic.",
        },
        {
          question: 'Faut-il un récepteur GPS professionnel pour les levés ?',
          answer: "Non, un smartphone suffit pour la plupart des usages de terrain.",
        },
      ]}
      related={[{ href: '/solutions/devis', label: 'Devis en ligne' }]}
      closingTitle="Du relevé de terrain au chiffrage, dans la même application"
      closingText="Les modules Levés et Métré s'activent selon les besoins de votre organisation."
    />
  );
}
