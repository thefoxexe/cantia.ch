import { SolutionPage } from '../../components/SolutionPage';
import { ModuleMockup } from '../../components/solutions/ModuleMockup';

export default function TresorerieSolutionPage() {
  return (
    <SolutionPage
      kicker="Trésorerie"
      title="Saurez-vous payer les salaires dans trois semaines ?"
      subtitle="Factures à encaisser, salaires à sortir, sous-traitants à payer, abonnements qui partent tout seuls — Cantia réunit tout ce qui bouge sur votre compte en une seule projection à 90 jours."
      visual={<ModuleMockup kind="tresorerie" />}
      features={[
        {
          icon: 'trending-up',
          title: 'Une projection sur 90 jours',
          text: "Renseignez votre solde actuel une fois, Cantia projette son évolution jour par jour à partir de tout ce qui est déjà dans l'application.",
        },
        {
          icon: 'file-text',
          title: 'Factures clients non encore encaissées',
          text: "Chaque facture envoyée ou partiellement payée apparaît à son échéance, avec un signalement clair si elle est déjà en retard.",
        },
        {
          icon: 'users',
          title: 'Masse salariale estimée',
          text: "Calculée depuis vos profils RH — salaires mensuels et heures déjà saisies ce mois — et placée au jour de paie que vous avez configuré.",
        },
        {
          icon: 'briefcase',
          title: 'Factures sous-traitants impayées',
          text: 'Ce que vous devez encore régler à vos sous-traitants apparaît dans la même timeline, à leur échéance.',
        },
        {
          icon: 'repeat',
          title: 'Abonnements et charges récurrentes',
          text: "Assurances, logiciels, loyers... enregistrez-les une fois, mensuels ou annuels — Cantia les projette automatiquement, mois après mois.",
        },
        {
          icon: 'bell',
          title: 'Rappel avant chaque prélèvement',
          text: 'Un bandeau vous signale les dépenses récurrentes des 7 prochains jours — plus de mauvaise surprise sur le relevé bancaire.',
        },
        {
          icon: 'shield',
          title: 'Aucune connexion bancaire requise',
          text: 'Vous saisissez votre solde manuellement, quand vous le souhaitez — aucun accès à votre compte bancaire n’est nécessaire.',
        },
      ]}
      steps={[
        { title: 'Renseignez votre solde', text: 'Un chiffre, mis à jour quand vous le souhaitez — sans connexion bancaire.' },
        { title: 'Ajoutez vos charges récurrentes', text: 'Abonnements, assurances, loyers — une fois, avec leur fréquence et leur prochaine échéance.' },
        { title: 'Consultez la projection', text: 'Factures, salaires, sous-traitants et charges récurrentes se combinent automatiquement dans une timeline à 90 jours.' },
      ]}
      faq={[
        {
          question: 'Cantia se connecte-t-il à mon compte bancaire ?',
          answer: 'Non. Vous saisissez votre solde manuellement quand vous le souhaitez — aucun accès bancaire n’est demandé ni nécessaire.',
        },
        {
          question: 'D’où viennent les montants de la projection ?',
          answer:
            "Des factures clients non soldées, d'une estimation de la masse salariale (profils RH + heures saisies), des factures sous-traitants impayées et des dépenses récurrentes que vous enregistrez — tout ce que Cantia sait déjà sur votre activité.",
        },
        {
          question: 'Comment fonctionnent les rappels de dépenses récurrentes ?',
          answer:
            'Un bandeau sur l’accueil et la page Trésorerie vous signale les dépenses récurrentes actives qui tombent dans les 7 prochains jours, avant qu’elles ne soient prélevées.',
        },
        {
          question: 'La Trésorerie prévisionnelle est-elle incluse dans le plan gratuit ?',
          answer: 'Elle est disponible à partir du plan Équipe, activable depuis les paramètres de votre organisation.',
        },
      ]}
      related={[
        { href: '/solutions/facturation', label: 'Facturation & QR-facture' },
        { href: '/solutions/rh-salaires', label: 'RH & Salaires' },
        { href: '/solutions/rentabilite', label: 'Rentabilité par chantier' },
      ]}
      closingTitle="Ne découvrez plus un trou de trésorerie a posteriori"
      closingText="Trésorerie prévisionnelle est disponible à partir du plan Équipe — sans connexion bancaire, sans configuration compliquée."
    />
  );
}
