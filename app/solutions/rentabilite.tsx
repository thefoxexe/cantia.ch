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
      ]}
      closingTitle="Ne découvrez plus vos marges en fin d'année"
      closingText="Le module Rentabilité s'active ou se désactive selon vos besoins, depuis les paramètres de votre organisation."
    />
  );
}
