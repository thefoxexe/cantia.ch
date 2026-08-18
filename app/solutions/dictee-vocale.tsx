import { SolutionPage } from '../../components/SolutionPage';
import { ModuleMockup } from '../../components/solutions/ModuleMockup';

export default function DicteeVocaleSolutionPage() {
  return (
    <SolutionPage
      kicker="Dictée vocale"
      title="Parlez, Cantia écrit"
      subtitle="Devis, rapports, messages d'équipe : partout dans l'application, un bouton dicter remplace la saisie au clavier. Pratique avec des gants, en voiture entre deux chantiers, ou simplement plus rapide qu'écrire."
      visual={<ModuleMockup kind="dictee-vocale" />}
      features={[
        {
          icon: 'mic',
          title: "Partout dans l'application",
          text: "Notes de rapport, lignes de devis, messages du fil de chantier : le bouton dicter est disponible partout où vous écrivez.",
        },
        {
          icon: 'cpu',
          title: 'Transcription côté serveur',
          text: "La reconnaissance vocale se fait sur des serveurs sécurisés, pas sur votre téléphone — un résultat fiable même dans le bruit d'un chantier.",
        },
        {
          icon: 'zap',
          title: 'Positions de devis générées automatiquement',
          text: "Dictez une liste de travaux, et l'IA en tire des lignes de devis chiffrées à partir de votre catalogue.",
        },
        {
          icon: 'file-text',
          title: 'Devient un rapport rédigé',
          text: "Vos notes vocales sont directement reprises et mises en forme par le rédacteur IA des rapports de chantier.",
        },
        {
          icon: 'users',
          title: "Aussi pour toute l'équipe",
          text: "Chaque membre peut dicter ses messages dans le fil de chantier — pratique pour signaler un imprévu sans s'arrêter de travailler.",
        },
        {
          icon: 'tool',
          title: 'Vocabulaire du bâtiment reconnu',
          text: "Unités, matériaux et tournures du métier sont bien reconnus, pas seulement du vocabulaire générique.",
        },
      ]}
      faq={[
        {
          question: 'La dictée vocale fonctionne-t-elle bien avec le vocabulaire du bâtiment ?',
          answer:
            "Oui, la reconnaissance est adaptée au vocabulaire technique du bâtiment — matériaux, unités, métiers — pas seulement à du langage courant.",
        },
        {
          question: 'Faut-il une connexion internet pour dicter ?',
          answer:
            "Oui, la dictée nécessite une connexion pour la transcription, mais les devis et rapports générés restent consultables une fois créés.",
        },
        {
          question: 'Où peut-on utiliser la dictée vocale dans Cantia ?',
          answer: "Sur les devis, les rapports de chantier et les messages d'équipe du fil d'actualité — partout où vous écrivez.",
        },
        {
          question: 'La dictée vocale est-elle plus rapide que le clavier sur le terrain ?',
          answer:
            "Pour la plupart des artisans sur chantier, oui — parler va plus vite que taper sur un téléphone avec les mains sales ou des gants.",
        },
      ]}
      related={[
        { href: '/solutions/devis', label: 'Devis en ligne' },
        { href: '/solutions/rapports-chantier', label: 'Rapports de chantier' },
      ]}
      closingTitle="Moins de temps à taper, plus de temps sur le chantier"
      closingText="La dictée vocale est incluse dans tous les plans Cantia, y compris le plan gratuit."
    />
  );
}
