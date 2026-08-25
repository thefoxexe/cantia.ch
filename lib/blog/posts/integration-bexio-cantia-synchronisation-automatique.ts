import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'integration-bexio-cantia-synchronisation-automatique',
  question: 'Comment fonctionne l’intégration native entre Cantia et Bexio ?',
  title: 'Cantia x Bexio : la connexion native qui supprime la double saisie',
  description:
    'Cantia se connecte directement à Bexio via son API officielle : clients importés, factures envoyées en un clic, statuts de paiement tenus à jour automatiquement.',
  excerpt:
    'Fini de ressaisir chaque facture dans Bexio après l’avoir créée dans Cantia. La connexion se fait en un clic depuis Compte → Intégrations, et reste à jour toute seule.',
  category: 'Comparatifs & outils',
  keywords: ['bexio', 'intégration bexio', 'synchronisation comptabilité', 'api bexio', 'facture automatique'],
  publishedAt: '2026-08-25',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'Beaucoup d’entreprises du bâtiment gèrent leurs chantiers dans Cantia et confient leur comptabilité à Bexio, à une fiduciaire qui l’utilise, ou aux deux. Jusqu’ici, ça voulait dire une chose : ouvrir une facture terminée dans Cantia, puis la retaper à la main dans Bexio pour que la comptabilité en ait connaissance. Deux systèmes, une seule vérité, et quelqu’un qui doit faire le pont entre les deux à la main, facture après facture.',
    },
    {
      type: 'p',
      text: 'Ce n’est plus nécessaire. Cantia se connecte maintenant directement à Bexio via son API officielle. Une fois la connexion faite, les clients, les réglages de facturation et le statut de paiement de chaque facture circulent automatiquement entre les deux — sans export, sans copier-coller, sans risque de décalage entre ce que dit Cantia et ce que dit Bexio.',
    },
    { type: 'h2', text: 'Ce qui se synchronise, concrètement' },
    {
      type: 'list',
      items: [
        'Vos clients Bexio sont importés dans Cantia dès la connexion, puis tenus à jour à chaque synchronisation — plus besoin de créer un client des deux côtés',
        'Les réglages de facturation (devise, coordonnées bancaires, mode de TVA, mode de paiement) sont récupérés depuis Bexio, jamais saisis en double ni devinés',
        'Une facture Cantia s’envoie vers Bexio en un clic depuis son détail — elle y arrive en brouillon, prête à être vérifiée avant tout envoi ou déclaration',
        'Le statut de paiement fait le chemin inverse : dès qu’une facture est payée dans Bexio, Cantia le sait dans l’heure qui suit, sans action manuelle',
      ],
    },
    {
      type: 'callout',
      title: 'Chaque facture n’existe qu’une fois côté Bexio',
      text: 'Renvoyer une facture déjà synchronisée ne crée jamais de doublon : Cantia retrouve la facture Bexio correspondante et la met à jour. Vous pouvez resynchroniser autant de fois que nécessaire sans jamais polluer votre comptabilité.',
    },
    { type: 'h2', text: 'Se connecter : deux minutes, un administrateur' },
    {
      type: 'p',
      text: 'La connexion se fait depuis Compte → Intégrations. Un administrateur de l’organisation clique sur « Connecter Bexio », se connecte à son compte Bexio comme d’habitude et autorise l’accès — c’est le mécanisme d’authentification officiel de Bexio (OAuth), le même que celui utilisé par les autres intégrations tierces de la plateforme. Cantia ne voit jamais votre mot de passe Bexio et ne stocke aucun identifiant en clair : uniquement un jeton d’accès révocable à tout moment, d’un côté comme de l’autre.',
    },
    {
      type: 'p',
      text: 'Une fois connecté, une synchronisation automatique tourne toutes les heures pour tenir les statuts de paiement à jour, et un bouton « Synchroniser maintenant » reste disponible pour forcer une mise à jour immédiate depuis les réglages d’intégration.',
    },
    { type: 'h2', text: 'Ce que Cantia ne fait pas à la place de Bexio' },
    {
      type: 'p',
      text: 'Cantia ne finalise ni n’envoie jamais une facture au client à votre place côté Bexio, et ne supprime jamais rien côté Bexio : chaque facture arrive en brouillon, pour que la comptabilité garde le contrôle final. Cantia reste ce qu’il a toujours été — l’outil du chantier, pas un logiciel de comptabilité générale — et Bexio reste responsable de la tenue comptable, des déclarations TVA et de tout ce qui touche à la clôture des comptes.',
    },
    {
      type: 'table',
      headers: ['', 'Avant', 'Avec l’intégration'],
      rows: [
        ['Créer un client', 'Une fois dans Cantia, une fois dans Bexio', 'Une fois — importé automatiquement'],
        ['Envoyer une facture en comptabilité', 'Retapée à la main dans Bexio', 'Envoyée en un clic depuis la facture'],
        ['Savoir si une facture est payée', 'À vérifier manuellement dans Bexio', 'Mis à jour automatiquement, chaque heure'],
        ['Risque de doublon ou d’écart', 'Réel, à chaque ressaisie', 'Éliminé — chaque facture n’existe qu’une fois'],
      ],
    },
    {
      type: 'cta',
      title: 'Disponible dès le plan Entreprise',
      text: 'L’intégration Bexio est incluse automatiquement à partir du plan Entreprise, sans module à activer séparément. Connectez-la en deux minutes depuis Compte → Intégrations.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'L’intégration Bexio est-elle payante en plus de mon abonnement ?',
      answer:
        'Non — elle est incluse automatiquement à partir du plan Entreprise (et disponible sur le plan Sur devis), sans coût ni module supplémentaire à activer.',
    },
    {
      question: 'Cantia peut-il envoyer une facture définitive à mon client via Bexio ?',
      answer:
        'Non. Chaque facture est envoyée vers Bexio en brouillon uniquement — c’est toujours vous, ou votre fiduciaire, qui décide de sa finalisation côté Bexio.',
    },
    {
      question: 'Que se passe-t-il si je déconnecte l’intégration ?',
      answer:
        'Les jetons d’accès Bexio sont immédiatement révoqués et aucune donnée n’est plus échangée. Les clients déjà importés et les factures déjà envoyées restent inchangés des deux côtés.',
    },
    {
      question: 'Faut-il ressaisir mes clients existants dans Bexio pour que ça fonctionne ?',
      answer:
        'Non — vos clients Bexio existants sont importés automatiquement dans Cantia dès la connexion, dans le sens Bexio vers Cantia.',
    },
  ],
  relatedSlugs: ['bexio-vs-cantia-logiciel-batiment', 'suivre-rentabilite-chantier-sans-excel', 'qr-facture-obligatoire-2026'],
};
