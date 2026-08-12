import { SolutionPage } from '../../components/SolutionPage';

export default function RentabiliteSolutionPage() {
  return (
    <SolutionPage
      kicker="Rentabilité"
      title="Enfin savoir si un chantier vous a fait gagner de l'argent"
      subtitle="Beaucoup d'entreprises du bâtiment devisent, exécutent et facturent un chantier sans jamais comparer ce qui a été devisé à ce qu'il a réellement coûté. Cantia le fait pour vous, chantier par chantier."
      features={[
        {
          icon: 'trending-up',
          title: 'Devisé vs coût réel',
          text: "Le montant du devis accepté comparé au coût réel du chantier — matériel et main d'œuvre — avec une marge affichée en CHF et en %.",
        },
        {
          icon: 'shopping-bag',
          title: 'Dépenses matériel en un tap',
          text: "Ajoutez vos achats au fil du chantier — libellé et montant, sans ressaisir votre catalogue.",
        },
        {
          icon: 'calendar',
          title: "Main d'œuvre sans double saisie",
          text: "Le coût de la main d'œuvre est calculé depuis les affectations déjà saisies dans le Planning — aucun pointage d'heures séparé à faire.",
        },
        {
          icon: 'alert-triangle',
          title: 'Alerte visuelle immédiate',
          text: "Un badge vert, orange ou rouge indique en un coup d'œil si le chantier est rentable, en marge serrée, ou en perte.",
        },
        {
          icon: 'bar-chart-2',
          title: 'Chantier par chantier',
          text: "Comparez la marge de plusieurs chantiers pour repérer vite ceux qui tirent votre rentabilité vers le bas.",
        },
      ]}
      faq={[
        {
          question: 'Comment savoir si un chantier est rentable ?',
          answer:
            "Cantia compare le devis accepté (revenu) au coût réel — matériel saisi et main d'œuvre issue du planning — et affiche la marge en CHF et en % en temps réel.",
        },
        {
          question: "D'où vient le calcul du coût de main d'œuvre ?",
          answer:
            "Du planning d'équipe : les jours affectés à un chantier sont multipliés par le coût horaire de votre entreprise, sans pointage séparé.",
        },
        {
          question: 'Peut-on comparer plusieurs chantiers entre eux ?',
          answer: "Oui, chaque chantier affiche sa propre marge, ce qui permet de repérer rapidement les chantiers en perte.",
        },
        {
          question: 'La rentabilité par chantier est-elle incluse dans le plan gratuit ?',
          answer: "Elle est disponible à partir du plan Équipe, activable depuis les paramètres de votre organisation.",
        },
      ]}
      related={[
        { href: '/solutions/devis', label: 'Devis en ligne' },
        { href: '/solutions/facturation', label: 'Facturation & QR-facture' },
        { href: '/solutions/planning', label: "Planning d'équipe" },
      ]}
      closingTitle="Ne découvrez plus vos marges en fin d'année"
      closingText="Le module Rentabilité s'active ou se désactive selon vos besoins, depuis les paramètres de votre organisation."
    />
  );
}
