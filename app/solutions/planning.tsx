import { SolutionPage } from '../../components/SolutionPage';

export default function PlanningSolutionPage() {
  return (
    <SolutionPage
      kicker="Planning"
      title="Qui est où, cette semaine, en un coup d'œil"
      subtitle="Un vrai calendrier d'équipe : chaque membre, chaque chantier, chaque jour. Fini les plannings sur papier ou dans un groupe WhatsApp qu'il faut faire défiler pour retrouver la bonne info."
      features={[
        {
          icon: 'calendar',
          title: 'Vue grille membres × jours',
          text: "Toute l'équipe et toute la semaine sur un seul écran, avec les affectations de chacun visibles d'un regard.",
        },
        {
          icon: 'layers',
          title: 'Lié à vos chantiers',
          text: "Chaque affectation pointe vers un chantier réel — depuis le planning, retrouvez directement rapports, photos et devis associés.",
        },
        {
          icon: 'users',
          title: 'Présence en temps réel',
          text: "Le dashboard affiche qui est actuellement actif sur l'application, en plus de qui est planifié où.",
        },
        {
          icon: 'smartphone',
          title: "Accessible à toute l'équipe",
          text: "Chaque membre consulte son planning depuis son téléphone, sans dépendre d'un tableau au bureau.",
        },
      ]}
      closingTitle="Un planning que toute l'équipe consulte, pas seulement le patron"
      closingText="Le module Planning s'active ou se désactive selon vos besoins, depuis les paramètres de votre organisation."
    />
  );
}
