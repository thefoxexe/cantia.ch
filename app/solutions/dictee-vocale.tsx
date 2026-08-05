import { SolutionPage } from '../../components/SolutionPage';

export default function DicteeVocaleSolutionPage() {
  return (
    <SolutionPage
      kicker="Dictée vocale"
      title="Parlez, Cantia écrit"
      subtitle="Devis, rapports, messages d'équipe : partout dans l'application, un bouton dicter remplace la saisie au clavier. Pratique avec des gants, en voiture entre deux chantiers, ou simplement plus rapide qu'écrire."
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
      ]}
      closingTitle="Moins de temps à taper, plus de temps sur le chantier"
      closingText="La dictée vocale est incluse dans tous les plans Cantia, y compris le plan gratuit."
    />
  );
}
