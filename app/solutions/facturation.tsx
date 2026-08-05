import { SolutionPage } from '../../components/SolutionPage';

export default function FacturationSolutionPage() {
  return (
    <SolutionPage
      kicker="Facturation"
      title="Des factures avec vrai bulletin QR suisse, sans logiciel à part"
      subtitle="Chaque facture Cantia intègre automatiquement le QR-bill suisse conforme à la norme — IBAN, référence structurée et montant déjà encodés, prêt à scanner depuis n'importe quelle app bancaire."
      features={[
        {
          icon: 'file-text',
          title: 'QR-facture générée automatiquement',
          text: "Renseignez votre IBAN une fois dans les paramètres : chaque facture reçoit ensuite son bulletin de paiement QR conforme, sans manipulation.",
        },
        {
          icon: 'hash',
          title: 'Référence structurée',
          text: "Chaque facture a sa propre référence (QRR ou SCOR selon votre IBAN), reconnue automatiquement par les banques suisses lors du paiement.",
        },
        {
          icon: 'search',
          title: 'Rapprochement par référence',
          text: "Recherchez et rapprochez un paiement reçu directement par son numéro de référence, sans deviner à quelle facture il correspond.",
        },
        {
          icon: 'pie-chart',
          title: 'Tableau de bord facturation',
          text: "Statuts, échéances et vue d'ensemble de ce qui est encaissé ou en attente, sur tous vos chantiers.",
        },
        {
          icon: 'clipboard',
          title: 'Devis → facture sans ressaisie',
          text: "Un devis accepté devient une facture en un geste, avec les mêmes lignes et le même client.",
        },
        {
          icon: 'percent',
          title: 'Facturez un acompte',
          text: "Émettez une facture d'acompte pour un pourcentage du devis avant de commencer, puis la facture finale déduit automatiquement ce qui a déjà été encaissé.",
        },
        {
          icon: 'layers',
          title: 'Paiements partiels suivis automatiquement',
          text: "Enregistrez chaque versement reçu : le solde restant dû se met à jour tout seul, la facture passe «partiellement payée» puis «payée» dès que le compte y est.",
        },
        {
          icon: 'shield',
          title: 'Hébergé en Suisse',
          text: "Vos factures et données clients restent sur des serveurs situés en Suisse, chiffrées.",
        },
      ]}
      steps={[
        { title: 'Renseignez votre IBAN', text: 'Une seule fois, dans Compte → Profil entreprise.' },
        { title: 'Convertissez ou créez une facture', text: 'Depuis un devis accepté, ou directement.' },
        { title: 'Envoyez le PDF', text: 'Le QR-bill est déjà intégré — votre client scanne et paie depuis son app bancaire.' },
      ]}
      closingTitle="La facturation suisse, sans jongler entre deux outils"
      closingText="Disponible dès le plan gratuit, avec un quota mensuel de factures — sans engagement."
    />
  );
}
