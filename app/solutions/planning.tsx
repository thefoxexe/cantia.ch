import { SolutionPage } from '../../components/SolutionPage';
import { ModuleMockup } from '../../components/solutions/ModuleMockup';

export default function PlanningSolutionPage() {
  return (
    <SolutionPage
      kicker="Planning"
      title="Qui est où, cette semaine, en un coup d'œil"
      subtitle="Un vrai calendrier d'équipe : chaque membre, chaque chantier, chaque jour. Fini les plannings sur papier ou dans un groupe WhatsApp qu'il faut faire défiler pour retrouver la bonne info."
      visual={<ModuleMockup kind="planning" />}
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
        {
          icon: 'trending-up',
          title: 'Alimente la rentabilité par chantier',
          text: "Les jours planifiés servent aussi à calculer le coût de main d'œuvre réel de chaque chantier — aucune double saisie.",
        },
      ]}
      faq={[
        {
          question: "Comment organiser le planning d'une équipe de chantier ?",
          answer: "Cantia affiche un calendrier hebdomadaire partagé : chaque membre voit qui est sur quel chantier, chaque jour.",
        },
        {
          question: 'Le planning remplace-t-il un tableau Excel ou un groupe WhatsApp ?',
          answer: "Oui, toute l'équipe consulte les mêmes informations en temps réel, sans fichier ni message à faire défiler.",
        },
        {
          question: 'Peut-on planifier plusieurs chantiers en parallèle ?',
          answer: "Oui, chaque affectation est liée à un chantier précis et reste visible sur toute la semaine, membre par membre.",
        },
        {
          question: 'Le planning est-il inclus dans le plan gratuit ?',
          answer: "Le planning est disponible à partir du plan Équipe, activable depuis les paramètres de votre organisation.",
        },
      ]}
      related={[
        { href: '/solutions/rapports-chantier', label: 'Rapports de chantier' },
        { href: '/solutions/rentabilite', label: 'Rentabilité par chantier' },
      ]}
      closingTitle="Un planning que toute l'équipe consulte, pas seulement le patron"
      closingText="Le module Planning s'active ou se désactive selon vos besoins, depuis les paramètres de votre organisation."
    />
  );
}
