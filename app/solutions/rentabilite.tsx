import { SolutionPage } from '../../components/SolutionPage';
import { ModuleMockup } from '../../components/solutions/ModuleMockup';

export default function RentabiliteSolutionPage() {
  return (
    <SolutionPage
      kicker="Rentabilité"
      title="Enfin savoir si un chantier vous a fait gagner de l'argent"
      subtitle="Beaucoup d'entreprises du bâtiment devisent, exécutent et facturent un chantier sans jamais comparer ce qui a été devisé à ce qu'il a réellement coûté. Cantia le fait pour vous, chantier par chantier."
      visual={<ModuleMockup kind="rentabilite" />}
      features={[
        {
          icon: 'trending-up',
          title: 'Devisé vs coût réel',
          text: "Le montant du devis accepté comparé au coût réel du chantier — matériel et main d'œuvre — avec une marge affichée en CHF et en %.",
        },
        {
          icon: 'camera',
          title: 'Un ticket photographié, une dépense enregistrée',
          text: "Prenez en photo un ticket de caisse ou une facture fournisseur : le fournisseur et le montant sont lus automatiquement. Ou dites-le simplement à voix haute — l'assistant vocal, accessible depuis toute l'application, comprend le chantier et le montant et vous fait confirmer avant d'enregistrer.",
        },
        {
          icon: 'calendar',
          title: "Main d'œuvre sans double saisie",
          text: "Le coût de la main d'œuvre est calculé depuis les heures réellement pointées dans RH & Salaires (ou une estimation depuis le planning tant qu'aucune heure n'est encore saisie) — aucun pointage séparé à faire.",
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
        {
          icon: 'shopping-bag',
          title: 'Toutes les dépenses au même endroit',
          text: "La section Dépenses regroupe en une liste filtrable les achats de tous vos chantiers et vos dépenses générales, avec un lien direct vers le chantier concerné.",
        },
      ]}
      faq={[
        {
          question: 'Comment savoir si un chantier est rentable ?',
          answer:
            "Cantia compare le devis accepté (revenu) au coût réel — matériel saisi et main d'œuvre issue des heures pointées — et affiche la marge en CHF et en % en temps réel.",
        },
        {
          question: "D'où vient le calcul du coût de main d'œuvre ?",
          answer:
            "Des heures réellement saisies pour ce chantier dans RH & Salaires, multipliées par le coût horaire de votre entreprise. Tant qu'aucune heure n'est encore pointée, Cantia affiche une estimation basée sur le planning d'équipe.",
        },
        {
          question: 'Peut-on comparer plusieurs chantiers entre eux ?',
          answer: "Oui, chaque chantier affiche sa propre marge, ce qui permet de repérer rapidement les chantiers en perte.",
        },
        {
          question: 'La rentabilité par chantier est-elle incluse dans tous les plans Cantia ?',
          answer: "Elle est disponible à partir du plan Équipe, activable depuis les paramètres de votre organisation.",
        },
      ]}
      related={[
        { href: '/solutions/devis', label: 'Devis en ligne' },
        { href: '/solutions/facturation', label: 'Facturation & QR-facture' },
        { href: '/solutions/planning', label: "Planning d'équipe" },
        { href: '/solutions/travaux-supplementaires', label: 'Travaux supplémentaires' },
      ]}
      closingTitle="Ne découvrez plus vos marges en fin d'année"
      closingText="Le module Rentabilité s'active ou se désactive selon vos besoins, depuis les paramètres de votre organisation."
    />
  );
}
