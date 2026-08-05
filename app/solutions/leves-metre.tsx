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
          title: 'Export de vos données',
          text: "Exportez vos points de levé pour les réutiliser dans vos propres outils ou les partager avec un bureau d'ingénieurs.",
        },
      ]}
      closingTitle="Du relevé de terrain au chiffrage, dans la même application"
      closingText="Les modules Levés et Métré s'activent selon les besoins de votre organisation."
    />
  );
}
