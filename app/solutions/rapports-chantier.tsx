import { SolutionPage } from '../../components/SolutionPage';

export default function RapportsChantierSolutionPage() {
  return (
    <SolutionPage
      kicker="Rapports de chantier"
      title="Le rapport se rédige pendant que vous êtes encore sur le chantier"
      subtitle="Notes vocales, photos géolocalisées et messages du fil d'actualité : Cantia rassemble tout et en tire un rapport rédigé, structuré et prêt à envoyer — vous n'avez plus qu'à relire."
      features={[
        {
          icon: 'mic',
          title: 'Dicté à la voix',
          text: "Racontez ce qui s'est passé normalement — Cantia transcrit et le rédacteur IA en tire un texte professionnel, sans fautes ni tournures orales.",
        },
        {
          icon: 'message-square',
          title: 'Depuis le fil de chantier',
          text: "Les notes et messages vocaux échangés dans le fil d'actualité de l'équipe peuvent nourrir directement le rapport, sans tout retaper.",
        },
        {
          icon: 'camera',
          title: 'Photos géolocalisées',
          text: "Chaque photo garde sa position GPS et son horodatage, organisées automatiquement en grille dans le PDF.",
        },
        {
          icon: 'map',
          title: 'Localisation des photos',
          text: "Quand les photos sont prises à plusieurs endroits du chantier, un schéma de localisation relative les situe les unes par rapport aux autres.",
        },
        {
          icon: 'edit-3',
          title: 'Signature du rédacteur',
          text: "Le rapport porte la signature personnelle de la personne qui l'a rédigé, pas un tampon générique de l'entreprise.",
        },
        {
          icon: 'droplet',
          title: 'Un rendu pour tous les métiers',
          text: "Que vous soyez maçon, peintre, électricien ou géomètre, le même gabarit sobre s'adapte à votre couleur de marque.",
        },
      ]}
      steps={[
        { title: 'Notez sur le terrain', text: 'À la voix, en texte, ou depuis le fil de chantier partagé avec votre équipe.' },
        { title: "L'IA rédige", text: 'Notes brutes, légendes de photos et localisation sont assemblées en un texte clair.' },
        { title: 'Relisez et générez le PDF', text: 'Ajustez si nécessaire, puis exportez un rapport prêt à envoyer au client.' },
      ]}
      closingTitle="Un rapport professionnel, sans y passer la soirée"
      closingText="Inclus dans tous les plans, y compris le plan gratuit."
    />
  );
}
