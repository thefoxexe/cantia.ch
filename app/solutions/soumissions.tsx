import { SolutionPage } from '../../components/SolutionPage';
import { ModuleMockup } from '../../components/solutions/ModuleMockup';

export default function SoumissionsSolutionPage() {
  return (
    <SolutionPage
      kicker="Remplir une soumission · Bêta"
      title="La soumission reçue, remplie avec vos prix"
      subtitle="Sans recopier une seule position : l’architecte vous envoie une soumission en PDF, Cantia en reprend les positions, vous mettez vos prix, et vous renvoyez le PDF d’origine rempli : prix unitaires, montants, reports de page et totaux à leur place."
      visual={<ModuleMockup kind="soumissions" />}
      features={[
        {
          icon: 'upload',
          title: 'Le PDF reçu, tel quel',
          text: 'Importez la soumission de l’architecte ou du maître d’ouvrage, CAN ou non. Les chapitres, positions, unités et quantités sont repris automatiquement, même sur un document scanné.',
        },
        {
          icon: 'check-square',
          title: 'Vous vérifiez avant de chiffrer',
          text: 'Un écran de vérification montre ce qui a été lu, position par position, et pose les questions quand un passage est ambigu. Rien n’est ajouté sans vous.',
        },
        {
          icon: 'lock',
          title: 'Les quantités du document restent intactes',
          text: 'Vous remplissez seulement le prix. Les quantités sont celles de l’architecte ; quand le document laisse une quantité à indiquer, vous la saisissez.',
        },
        {
          icon: 'zap',
          title: 'Chiffrer au clavier, vite',
          text: 'Flèches haut et bas pour passer d’une position à l’autre, prix repris de votre catalogue par numéro de position et de vos soumissions précédentes. Le total se recalcule à chaque prix.',
        },
        {
          icon: 'file-text',
          title: 'Le PDF d’origine, rempli',
          text: 'Cantia écrit vos prix unitaires et montants dans le PDF reçu, avec les reports de page, le rabais, l’escompte, la TVA et vos coordonnées d’entreprise. Vous renvoyez le document attendu, pas un tableau à part.',
        },
        {
          icon: 'archive',
          title: 'Rangée dans le chantier',
          text: 'Chaque soumission reste dans son chantier, à côté des documents et des photos, et toutes se retrouvent dans le menu Soumissions.',
        },
      ]}
      steps={[
        { title: 'Importez le PDF', text: 'Depuis un ordinateur, choisissez le chantier puis la soumission reçue.' },
        { title: 'Mettez vos prix', text: 'Position par position, au clavier, avec vos prix habituels proposés.' },
        { title: 'Renvoyez le PDF rempli', text: 'Téléchargez le PDF d’origine complété, prêt à signer et à envoyer.' },
      ]}
      faq={[
        {
          question: 'Qu’est-ce que « Remplir une soumission » dans Cantia ?',
          answer:
            'Une fonction en bêta pour répondre aux soumissions reçues en PDF : Cantia reprend les positions du document, vous mettez vos prix, et vous obtenez le PDF d’origine rempli avec les prix unitaires, montants, reports et totaux.',
        },
        {
          question: 'Dans quels plans la fonction est-elle disponible ?',
          answer: 'Dès le plan Équipe, avec 3 soumissions par mois. Le plan Entreprise les rend illimitées. Elle n’est pas incluse dans le plan Essentiel.',
        },
        {
          question: 'Quelles soumissions peut-on importer ?',
          answer:
            'Les soumissions en PDF, structurées selon le CAN ou non, y compris les documents scannés. Cantia ne crée pas de soumission vierge : la fonction sert à répondre à celles que vous recevez.',
        },
        {
          question: 'Pourquoi la fonction est-elle en bêta ?',
          answer:
            'Chaque architecte met en page ses soumissions à sa façon. La lecture couvre déjà les cas courants ; l’écran de vérification vous laisse corriger ce qui n’a pas été lu correctement, et chaque retour nous aide à l’améliorer.',
        },
        {
          question: 'Peut-on remplir une soumission depuis un téléphone ?',
          answer: 'Sur téléphone, les soumissions se consultent. L’import et la saisie des prix se font sur ordinateur, où l’on voit le document en entier.',
        },
        {
          question: 'Pour quels métiers ?',
          answer: 'Pour les entreprises du bâtiment et du génie civil : maçonnerie, gros œuvre, électricité, sanitaire, chauffage, menuiserie, peinture, plâtrerie et les autres corps de métier qui répondent à des soumissions.',
        },
      ]}
      related={[
        { href: '/solutions/devis', label: 'Devis' },
        { href: '/solutions/planning', label: 'Planning' },
        { href: '/solutions/rentabilite', label: 'Rentabilité par chantier' },
      ]}
      closingTitle="Répondez à plus de soumissions, en moins de soirées"
      closingText="Remplir une soumission est en bêta, dès le plan Équipe (3 soumissions par mois) et illimité avec le plan Entreprise. 14 jours d’essai, sans engagement."
    />
  );
}
