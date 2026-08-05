import { SolutionPage } from '../../components/SolutionPage';

export default function DevisSolutionPage() {
  return (
    <SolutionPage
      kicker="Devis"
      title="Des devis chiffrés en quelques minutes, pas en fin de soirée"
      subtitle="Dictez vos lignes de devis à voix haute sur le chantier ou en voiture. Cantia les transforme en positions chiffrées, reprend vos prix habituels depuis votre catalogue, et prépare un PDF prêt à envoyer."
      features={[
        {
          icon: 'mic',
          title: 'Dictée vocale intégrée',
          text: "Décrivez le travail à faire normalement, comme à un collègue. La transcription et la mise en positions se font automatiquement.",
        },
        {
          icon: 'database',
          title: 'Votre catalogue, vos prix',
          text: "Chaque description reconnue reprend le prix et l'unité que vous utilisez déjà — un tuyau PVC est proposé au mètre linéaire sans que vous ayez à le préciser.",
        },
        {
          icon: 'alert-triangle',
          title: "Alerte en cas d'écart",
          text: "Si un prix saisi diffère de celui déjà en catalogue, Cantia vous le signale avant l'envoi — jamais de correction silencieuse.",
        },
        {
          icon: 'edit-3',
          title: 'Signature intégrée',
          text: "Chaque devis porte la signature de son auteur et un emplacement pour celle du client, prêt à être accepté et renvoyé.",
        },
        {
          icon: 'trending-up',
          title: 'Suivi de statut',
          text: "Brouillon, envoyé, accepté ou refusé : sachez où en est chaque devis sans rouvrir vos e-mails.",
        },
        {
          icon: 'file-text',
          title: 'Devis → facture en un geste',
          text: "Un devis accepté se transforme directement en facture, sans ressaisir les lignes.",
        },
      ]}
      steps={[
        { title: 'Créez le devis', text: 'Renseignez le client, puis dictez ou tapez vos lignes.' },
        { title: "L'IA structure les positions", text: 'Quantités, unités et prix catalogue sont proposés automatiquement.' },
        { title: 'Vérifiez et envoyez', text: 'Ajustez si besoin, puis générez le PDF — mise en page sobre, à votre couleur de marque.' },
      ]}
      closingTitle="Passez moins de temps sur vos devis, pas moins de temps sur le chantier"
      closingText="Cantia est gratuit pour démarrer, avec un quota de devis mensuel — sans engagement."
    />
  );
}
