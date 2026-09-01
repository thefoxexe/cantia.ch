import { SolutionPage } from '../../components/SolutionPage';
import { ModuleMockup } from '../../components/solutions/ModuleMockup';

export default function TravauxSupplementairesSolutionPage() {
  return (
    <SolutionPage
      kicker="Travaux supplémentaires"
      title="Les extras du chantier, enfin traçables — et payés"
      subtitle="« Tant que vous y êtes… » Ce qui se décide à l'oral sur le chantier finit oublié ou contesté à la fin. Cantia transforme chaque extra en document daté, signé et facturé — sans repasser par un devis complet."
      visual={<ModuleMockup kind="travaux-supplementaires" />}
      features={[
        {
          icon: 'plus-circle',
          title: 'Un document dédié, pas une note perdue',
          text: "Chaque extra devient un Travaux supplémentaires numéroté (TS-2026-004), lié au chantier — fini le post-it ou le SMS qui se perd dans la journée.",
        },
        {
          icon: 'link',
          title: "Rattaché au devis existant, ou pas",
          text: "Créez un TS depuis un devis en cours pour garder le fil, ou de façon indépendante si le chantier n'a pas de devis initial dans Cantia.",
        },
        {
          icon: 'edit-3',
          title: 'Signature client à distance',
          text: "Le client reçoit un lien, consulte le détail chiffré et signe en ligne — l'accord est horodaté, fini le « je n'ai jamais validé ça ».",
        },
        {
          icon: 'file-text',
          title: 'Transformé en facture automatiquement',
          text: "Dès que le client accepte, une facture dédiée est générée avec les mêmes lignes — rien à ressaisir, rien à oublier de facturer.",
        },
        {
          icon: 'database',
          title: 'Le même catalogue que vos devis',
          text: "Les lignes de TS alimentent le catalogue de prix partagé avec vos devis — la cohérence de vos tarifs reste garantie, même pour un extra décidé sur le pouce.",
        },
        {
          icon: 'trending-up',
          title: 'Intégrés à la Rentabilité par chantier',
          text: "Un TS accepté s'ajoute automatiquement au montant devisé du chantier dans le module Rentabilité — la marge réelle ne néglige plus les extras.",
        },
        {
          icon: 'alert-triangle',
          title: "La fuite d'argent invisible, enfin visible",
          text: "Sur un chantier de rénovation, les extras non facturés se comptent souvent en milliers de francs à la fin — Cantia les rend impossibles à oublier.",
        },
      ]}
      steps={[
        { title: "Notez l'extra depuis le chantier", text: 'Créez un Travaux supplémentaires en quelques lignes — comme un devis, en plus rapide.' },
        { title: 'Envoyez au client', text: 'Lien sécurisé par e-mail ou copié directement — le client consulte et signe en ligne.' },
        { title: 'La facture part toute seule', text: "Dès l'acceptation, une facture dédiée est générée et le montant s'ajoute à la rentabilité du chantier." },
      ]}
      faq={[
        {
          question: 'Qu’est-ce qu’un Travaux supplémentaires (TS) dans Cantia ?',
          answer:
            "C'est un document dédié pour tout ce qui est demandé en cours de chantier en plus du devis initial — un mur à déplacer, une prise à ajouter. Il se crée, s'envoie et se signe comme un devis, puis se transforme automatiquement en facture une fois accepté.",
        },
        {
          question: 'Un TS doit-il être rattaché à un devis existant ?',
          answer:
            "Non, c'est optionnel. Vous pouvez le lier au devis d'origine pour garder le contexte, ou le créer seul si le chantier n'a pas de devis initial dans Cantia.",
        },
        {
          question: 'Comment le client valide-t-il un Travaux supplémentaires ?',
          answer:
            "Il reçoit un lien vers un portail sécurisé, consulte le détail chiffré et signe en ligne — l'acceptation est horodatée et déclenche automatiquement la facture correspondante.",
        },
        {
          question: 'Les travaux supplémentaires comptent-ils dans la Rentabilité par chantier ?',
          answer: "Oui : dès qu'un TS est accepté, son montant s'ajoute automatiquement au total devisé du chantier dans le module Rentabilité.",
        },
      ]}
      related={[
        { href: '/solutions/devis', label: 'Devis' },
        { href: '/solutions/facturation', label: 'Facturation & QR-facture' },
        { href: '/solutions/rentabilite', label: 'Rentabilité par chantier' },
      ]}
      closingTitle="Ne laissez plus un seul extra filer entre les mailles"
      closingText="Travaux supplémentaires est inclus dans tous les plans Cantia, avec le même suivi illimité que vos devis et factures."
    />
  );
}
