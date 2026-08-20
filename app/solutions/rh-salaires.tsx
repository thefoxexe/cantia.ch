import { SolutionPage } from '../../components/SolutionPage';
import { ModuleMockup } from '../../components/solutions/ModuleMockup';

export default function RhSalairesSolutionPage() {
  return (
    <SolutionPage
      kicker="RH & Salaires"
      title="Les heures, les frais et les salaires de toute l'équipe, au même endroit"
      subtitle="Chaque employé pointe ses heures chantier par chantier et ses frais professionnels. La secrétaire ou l'administrateur gère la fiche de salaire de chacun — taux, cotisations et salaire net — sans tableur séparé."
      visual={<ModuleMockup kind="rh-salaires" />}
      features={[
        {
          icon: 'clock',
          title: 'Pointage par chantier',
          text: "Chaque membre saisit ses heures travaillées, chantier par chantier et jour par jour, en quelques taps.",
        },
        {
          icon: 'truck',
          title: 'Frais professionnels',
          text: "Kilomètres ou autres frais, avec une indemnité kilométrique définie une fois pour toute l'entreprise.",
        },
        {
          icon: 'download',
          title: 'Export journalier, hebdomadaire ou mensuel',
          text: "Chaque employé exporte sa propre feuille d'heures au format CSV, à la granularité de son choix.",
        },
        {
          icon: 'user',
          title: 'Fiche salaire par employé',
          text: "La secrétaire RH ou l'administrateur ouvre la fiche de chaque membre : taux horaire ou salaire fixe, historique des heures et des frais.",
        },
        {
          icon: 'percent',
          title: 'Brut → net avec cotisations',
          text: "AVS/AC, LPP, LAA et impôt à la source : chaque taux est éditable par employé, et le salaire net se calcule automatiquement.",
        },
        {
          icon: 'lock',
          title: 'Confidentialité par permission',
          text: "Un employé ne voit que ses propres heures et frais — les fiches de salaire restent réservées à la secrétaire RH et aux administrateurs.",
        },
      ]}
      faq={[
        {
          question: 'Qui peut voir les salaires dans Cantia ?',
          answer:
            "Uniquement la secrétaire RH et les administrateurs de l'entreprise, selon les permissions accordées depuis Équipe. Un employé standard ne voit que ses propres heures et frais.",
        },
        {
          question: 'Cantia calcule-t-il automatiquement les cotisations sociales suisses ?',
          answer:
            "Cantia calcule le salaire net à partir de taux AVS/AC/LPP/LAA et d'un taux d'impôt à la source que vous configurez par employé — les taux par défaut sont indicatifs, à ajuster selon votre caisse de compensation, votre caisse LPP et le canton.",
        },
        {
          question: 'Comment un employé exporte-t-il sa feuille d\'heures ?',
          answer:
            "Depuis le module RH & Salaires, en choisissant la granularité — journalière, hebdomadaire ou mensuelle — puis en téléchargeant un fichier CSV.",
        },
        {
          question: 'Le module RH & Salaires est-il inclus dans le plan gratuit ?',
          answer: "Il est disponible à partir du plan Équipe, activable depuis les paramètres de votre organisation.",
        },
      ]}
      related={[
        { href: '/solutions/planning', label: "Planning d'équipe" },
        { href: '/solutions/rentabilite', label: 'Rentabilité par chantier' },
        { href: '/solutions/facturation', label: 'Facturation & QR-facture' },
        { href: '/solutions/tresorerie', label: 'Trésorerie prévisionnelle' },
      ]}
      closingTitle="Fini les feuilles d'heures éparpillées"
      closingText="Le module RH & Salaires s'active depuis les paramètres de votre organisation, à partir du plan Équipe."
    />
  );
}
