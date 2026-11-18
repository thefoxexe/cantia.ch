import { SolutionPage } from '../../components/SolutionPage';
import { ModuleMockup } from '../../components/solutions/ModuleMockup';

// The Métrés module (post-calcul): after the soumission, the quantities
// executed and the real costs, compared with what was sold (app/(app)/metres).
export default function MetresSolutionPage() {
  return (
    <SolutionPage
      kicker="Métrés · Post-calcul"
      title="Après la soumission, savoir si le chantier a vraiment rapporté"
      subtitle="La soumission dit ce que vous avez vendu. Le métré dit ce que vous avez réellement exécuté et ce que ça vous a coûté. Dans Cantia, vous reprenez la soumission du chantier, vous mettez les quantités exécutées et vos coûts réels, et vous voyez le bénéfice position par position."
      visual={<ModuleMockup kind="metres" />}
      features={[
        { icon: "clipboard", title: "Partir de la soumission", text: "Choisissez le chantier puis la soumission qui sert de base : le métré en reprend les chapitres, positions, unités et quantités. Rien à recopier." },
        { icon: "edit-3", title: "Les quantités réellement exécutées", text: "Corrigez chaque quantité avec ce qui a vraiment été fait. Le facturable suit : quantité exécutée × prix unitaire de la soumission." },
        { icon: "dollar-sign", title: "Vos coûts réels par unité", text: "À la place du prix de vente, mettez ce que la position vous a coûté : main-d’œuvre, matériel, sous-traitance. Les prix de vente restent dans la soumission." },
        { icon: "plus-circle", title: "Les travaux en plus", text: "Un travail non prévu ? Ajoutez la position dans le métré : son coût est compté, et elle est signalée hors soumission pour être facturée à part." },
        { icon: "bar-chart-2", title: "Le bénéfice, position par position", text: "Offre, facturable, coût réel, bénéfice et marge pour tout le chantier, puis par chapitre et par position. Les positions en perte ressortent en rouge et se filtrent d’un clic." },
        { icon: "repeat", title: "Mieux chiffrer la prochaine fois", text: "Vous voyez quelles positions vous font gagner de l’argent et lesquelles vous en coûtent : de quoi ajuster vos prix sur la prochaine soumission." },
      ]}
      steps={[
        { title: "Remplissez la soumission", text: "Importez la soumission reçue, mettez vos prix et renvoyez-la." },
        { title: "Créez le métré", text: "Une fois le chantier en cours ou terminé, choisissez la soumission comme base." },
        { title: "Mettez le réel", text: "Quantités exécutées et coûts réels : le bénéfice s’affiche aussitôt." },
      ]}
      faq={[
        { question: "Quelle différence entre une soumission et un métré dans Cantia ?", answer: "La soumission contient ce que vous avez offert : quantités et prix de vente. Le métré reprend la même soumission avec ce qui a été réellement exécuté et ce que chaque position vous a coûté. Cantia compare les deux." },
        { question: "Comment le bénéfice est-il calculé ?", answer: "Le facturable correspond aux quantités exécutées multipliées par les prix unitaires de la soumission, après rabais et escompte, sans TVA. Le bénéfice est le facturable moins le coût réel (quantités exécutées multipliées par vos coûts par unité)." },
        { question: "Faut-il ressaisir la soumission ?", answer: "Non. Le métré reprend toutes les positions et quantités de la soumission choisie ; vous corrigez seulement ce qui a changé." },
        { question: "Peut-on ajouter des positions qui n’étaient pas dans la soumission ?", answer: "Oui, dans chaque chapitre. Leur coût compte dans le bénéfice et elles sont signalées hors soumission, pour être facturées à part." },
        { question: "Comment activer les métrés ?", answer: "Dans Paramètres › Modules, activez « Métrés ». Le module est destiné aux entreprises du bâtiment ; il apparaît ensuite dans le menu, sous Soumissions." },
        { question: "Les métrés comptent-ils dans le quota de soumissions ?", answer: "Non : seul l’import d’une soumission PDF compte. Créer un métré à partir d’une soumission déjà importée ne consomme rien." },
        { question: "Peut-on l’utiliser sur téléphone ?", answer: "Sur téléphone, la comparaison se consulte. La saisie des quantités et des coûts se fait sur ordinateur." },
      ]}
      related={[
        { href: "/solutions/soumissions", label: "Remplir une soumission" },
        { href: "/solutions/rentabilite", label: "Rentabilité par chantier" },
        { href: "/solutions/travaux-supplementaires", label: "Travaux supplémentaires" },
      ]}
      closingTitle="Sachez ce que chaque chantier vous a vraiment rapporté"
      closingText="Le module Métrés s’active dans Paramètres › Modules, pour les entreprises du bâtiment. 14 jours d’essai, sans engagement."
    />
  );
}
