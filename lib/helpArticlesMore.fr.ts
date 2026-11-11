import type { HelpArticleMore } from './helpArticlesMore';

// Extra sections and questions for the help articles (lib/helpArticles.ts),
// French. Only what Cantia really does: check the app before adding a line.
export const HELP_MORE_FR: Record<string, HelpArticleMore> = {
  demarrage: {
    sections: [
      {
        title: 'Par où commencer la première semaine',
        paragraphs: [
          "Commencez par Compte → Entreprise : nom, adresse, IBAN, logo et couleur. Ces informations apparaissent sur chaque devis et chaque facture, c'est donc ce qui donne tout de suite un rendu professionnel à vos documents.",
          "Créez ensuite un premier chantier et un premier devis avec un vrai client. Vous verrez comment les deux se relient, et comment la facture se crée une fois le devis accepté. Si vous avez déjà une liste de clients, importez-la depuis Compte → Import de données (Excel ou CSV) plutôt que de tout ressaisir.",
          "Quand la base tient, invitez l'équipe depuis Compte → Équipe et activez seulement les modules dont vous avez besoin. Mieux vaut quelques modules bien utilisés que tout allumer d'un coup.",
        ],
      },
      {
        title: 'Rôles et permissions',
        paragraphs: [
          "Chaque membre a un rôle. L'administrateur voit et règle tout, un rôle RH gère les heures et les salaires, un employé standard voit ses propres heures, ses chantiers et ce que son rôle autorise. Les rôles se règlent dans Compte → Équipe.",
        ],
      },
    ],
    faq: [
      { q: 'Puis-je utiliser Cantia sur mon téléphone ?', a: "Oui. Cantia fonctionne dans le navigateur du téléphone, et vous pouvez l'ajouter à l'écran d'accueil pour l'ouvrir comme une application." },
      { q: 'Un module désactivé efface-t-il mes données ?', a: "Non. Un module éteint disparaît de la navigation, ses données restent. Si vous le rallumez, tout est là." },
      { q: 'Où trouver de l’aide en cours de route ?', a: "Dans Compte → Aide, avec tous les articles de ce centre d'aide, et par e-mail à info@cantia.ch." },
    ],
  },
  'devis-creation': {
    sections: [
      {
        title: 'Un devis clair, ligne par ligne',
        paragraphs: [
          "Chaque ligne a une description, une quantité, une unité et un prix unitaire. Cantia calcule les totaux, la TVA et le total TTC. Une description déjà utilisée sur un ancien devis est proposée automatiquement avec son unité et son dernier prix (voir l'article sur le Catalogue).",
          "Pour les positions qui reviennent souvent, une trame insère plusieurs lignes d'un coup. Les notes en tête et en pied de devis servent aux conditions : délai de validité, acompte demandé, ce qui n'est pas compris.",
        ],
      },
      {
        title: 'Envoyer et suivre',
        paragraphs: [
          "Une fois le devis prêt, le bouton d'envoi part par e-mail avec le PDF et le lien du portail client, où le client peut signer en ligne. Le devis passe à Envoyé, et vous voyez son statut changer quand le client l'accepte. Avec la formule Entreprise, vous savez aussi quand le client a ouvert le devis.",
          "Si le client demande une modification, dupliquez ou modifiez le devis plutôt que d'en recréer un : l'historique reste rattaché au même client et au même chantier.",
        ],
      },
    ],
    faq: [
      { q: 'Combien de devis puis-je créer ?', a: 'Autant que vous voulez : les devis et les factures sont illimités sur toutes les formules.' },
      { q: 'Le devis peut-il partir en allemand ou en italien ?', a: "Oui, dès la formule Équipe : chaque document peut sortir dans la langue du client." },
      { q: 'Que se passe-t-il quand le client signe ?', a: "Le devis passe à Accepté, la signature est horodatée et la facture correspondante est créée. Vous n'avez rien à recopier." },
    ],
  },
  'devis-trames': {
    sections: [
      {
        title: 'Quand créer une trame',
        paragraphs: [
          "Une trame vaut la peine dès qu'un même groupe de lignes revient d'un devis à l'autre : une salle de bain type, une toiture, un forfait d'entretien annuel. Vous la remplissez une fois avec les bonnes descriptions, unités et prix, puis vous n'adaptez que les quantités.",
          "Une trame ne fige rien : une fois insérée dans un devis, chaque ligne reste modifiable. Si vos prix changent, mettez la trame à jour et les prochains devis partiront avec les nouveaux montants, sans toucher aux devis déjà envoyés.",
        ],
      },
      {
        title: 'Garder une bibliothèque propre',
        paragraphs: [
          "Donnez à chaque trame un nom que toute l'équipe comprend (« Salle de bain complète 6 m² » plutôt que « SDB2 »). Supprimez celles qui ne servent plus : la liste reste courte et on trouve la bonne en quelques secondes. La formule Essentiel compte jusqu'à 40 trames, Équipe et Entreprise n'ont pas de limite.",
        ],
      },
    ],
    faq: [
      { q: 'Une trame modifiée change-t-elle mes anciens devis ?', a: "Non. Les devis déjà créés gardent leurs lignes. La trame ne sert qu'aux prochains devis." },
      { q: 'Puis-je partir d’un devis existant ?', a: 'Oui, avec « Enregistrer comme trame » dans le menu du devis.' },
      { q: 'Toute l’équipe voit-elle les trames ?', a: "Oui, les trames appartiennent à l'entreprise et sont partagées par tous ceux qui créent des devis." },
    ],
  },
  'facturation-acomptes': {
    sections: [
      {
        title: 'Un exemple concret',
        paragraphs: [
          "Devis accepté de CHF 20'000.–. Vous facturez un acompte de 30 % à la commande, soit CHF 6'000.–, puis un deuxième acompte de 30 % à mi-chantier. À la fin, la facture finale reprend le total du devis et déduit les CHF 12'000.– déjà facturés : il reste CHF 8'000.– à payer, plus les éventuels travaux supplémentaires acceptés.",
          "Pour les chantiers longs facturés selon l'avancement, les situations de travaux facturent le pourcentage réellement réalisé à chaque étape, et ne facturent que la différence avec la situation précédente.",
        ],
      },
      {
        title: 'Paiements et statuts',
        paragraphs: [
          "Une facture passe par Brouillon, Prête, Envoyée, Partiellement payée puis Payée. Une facture envoyée dont l'échéance est dépassée est signalée en retard. Chaque paiement enregistré met à jour le solde. Le rapprochement par la référence QR, ou par l'import d'un relevé bancaire, évite de saisir chaque paiement à la main.",
        ],
      },
    ],
    faq: [
      { q: 'Puis-je faire plusieurs acomptes sur un même devis ?', a: 'Oui. La facture finale les déduit tous automatiquement.' },
      { q: 'Et si j’annule un acompte ?', a: 'La déduction est recalculée : le solde de la facture finale reste juste.' },
      { q: 'Les factures ont-elles une QR-facture ?', a: 'Oui, toutes les factures incluent la partie QR suisse avec la référence de paiement.' },
    ],
  },
  'facturation-email-lien': {
    sections: [
      {
        title: 'Le texte de l’e-mail',
        paragraphs: [
          "Le texte qui accompagne un devis, une facture ou un rappel se règle une fois dans Compte → E-mails. Les éléments entre accolades (nom du client, numéro, montant) sont remplis automatiquement à l'envoi. Le PDF joint et le lien sécurisé vers le document sont toujours ajoutés en dessous, vous n'avez pas à les insérer.",
          "Les envois et les réponses des clients se retrouvent dans la section E-mails, avec leur suivi. Si l'adresse du client refuse l'e-mail, vous en êtes averti pour corriger l'adresse et renvoyer.",
        ],
      },
      {
        title: 'Envoyer soi-même ou par Cantia',
        paragraphs: [
          "L'envoi par Cantia garde tout au même endroit : date d'envoi, ouverture du lien, signature. Le lien copié reste utile pour un client qui préfère WhatsApp, mais le suivi d'envoi est alors de votre côté.",
        ],
      },
    ],
    faq: [
      { q: 'Faut-il générer le PDF avant l’envoi ?', a: "Oui, le PDF doit exister pour être joint. Il se génère dès que le document sort du brouillon." },
      { q: 'Le lien expire-t-il ?', a: "Le lien reste valable, mais il ne s'ouvre qu'après vérification de l'adresse e-mail du client inscrite sur le document." },
      { q: 'Le client peut-il payer depuis le lien ?', a: "Il voit le détail, le solde et la QR-facture. Le paiement se fait ensuite depuis sa banque, comme pour toute QR-facture." },
    ],
  },
  'chantiers-rapports': {
    sections: [
      {
        title: 'Tenir le fil au jour le jour',
        paragraphs: [
          "Le fil de chantier fonctionne bien quand chacun y poste ce qu'il fait, au moment où il le fait : une photo avant de refermer un plafond, un message quand une livraison arrive, une note quand le client demande un changement. Ces entrées deviennent la mémoire du chantier, datée et partagée par toute l'équipe.",
          "Les messages se dictent : en fin de journée, dites ce qui a été fait et ce qui reste, Cantia l'écrit pour vous.",
        ],
      },
      {
        title: 'Un rapport prêt à envoyer',
        paragraphs: [
          "Pour un rapport hebdomadaire au maître d'ouvrage ou à l'architecte, sélectionnez les entrées de la semaine et générez le PDF. Le texte de synthèse proposé par l'IA se relit et se corrige avant l'export. Le rapport porte le logo et la couleur de votre entreprise.",
        ],
      },
    ],
    faq: [
      { q: 'Les photos sont-elles datées ?', a: 'Oui, chaque photo du fil est horodatée et géolocalisée, ce qui en fait une preuve utile en cas de contestation.' },
      { q: 'Puis-je travailler sans réseau ?', a: 'Oui, les photos prises hors ligne se synchronisent dès que la connexion revient.' },
      { q: 'Qui voit le fil d’un chantier ?', a: "Les membres de l'entreprise qui ont accès à ce chantier, selon leur rôle." },
    ],
  },
  rentabilite: {
    sections: [
      {
        title: 'Lire la marge d’un chantier',
        paragraphs: [
          "La marge, c'est le montant devisé (devis accepté et travaux supplémentaires acceptés) moins les coûts réels : matériel, main-d'œuvre et sous-traitants. Elle s'affiche en francs et en pourcentage, et se met à jour à chaque dépense ou heure ajoutée.",
          "Pour qu'elle soit juste, deux habitudes suffisent : rattacher chaque dépense au bon chantier, et pointer les heures sur le chantier où elles ont été faites. Le coût horaire moyen, réglé par un administrateur, doit refléter le vrai coût d'une heure (salaire, charges, vacances), pas seulement le salaire.",
        ],
      },
      {
        title: 'Réagir avant la fin',
        paragraphs: [
          "Regarder la rentabilité à mi-chantier, et pas seulement à la fin, permet encore d'agir : facturer un extra oublié par un travaux supplémentaires, revoir l'équipe affectée, ou ajuster le prochain devis du même type.",
        ],
      },
    ],
    faq: [
      { q: 'Quelle formule faut-il ?', a: 'La rentabilité par chantier est incluse dès la formule Équipe.' },
      { q: 'Les heures sont-elles comptées automatiquement ?', a: 'Oui, les heures pointées sur le chantier dans RH & Salaires sont valorisées au coût horaire défini.' },
      { q: 'Les factures de sous-traitants comptent-elles ?', a: "Oui, elles s'ajoutent au coût réel du chantier auquel elles sont liées." },
    ],
  },
  planning: {
    sections: [
      {
        title: 'Organiser la semaine',
        paragraphs: [
          "Le planning se lit par jour ou par semaine. Chaque affectation relie une personne à un chantier sur une ou plusieurs journées. On voit d'un coup d'œil qui est où, qui est libre, et quel chantier manque de monde.",
          "Quand deux chantiers se disputent les mêmes personnes, le planning le montre avant le lundi matin, pas sur place. Déplacer une affectation suffit pour corriger.",
        ],
      },
      {
        title: 'Du planning au chantier',
        paragraphs: [
          "Chaque affectation pointe vers un vrai chantier : depuis le planning, on retrouve directement ses rapports, ses photos et ses devis. Les membres de l'équipe voient leur propre planning sur leur téléphone et savent où ils vont le lendemain.",
          "Pour un chantier découpé en phases, le planning de chantier (diagramme des étapes) proposé par l'IA à partir du devis aide à poser l'ordre des travaux et les durées, que vous ajustez ensuite.",
        ],
      },
    ],
    faq: [
      { q: 'Quelle formule faut-il ?', a: 'Le planning est inclus dès la formule Équipe.' },
      { q: 'Le planning remplace-t-il le pointage des heures ?', a: "Non. Il sert d'estimation tant qu'aucune heure n'est pointée, puis les heures réelles prennent le relais pour la rentabilité." },
      { q: 'Les employés voient-ils le planning ?', a: 'Oui, chacun voit ses affectations depuis son téléphone.' },
    ],
  },
  metre: {
    sections: [
      {
        title: 'Comment ça marche',
        paragraphs: [
          "Le métré se trouve dans chaque chantier. Vous y détaillez les quantités poste par poste : une description, une unité (m², m³, ml, pièce, heure…), et les mesures qui donnent la quantité. Le total de chaque poste et le total du métré se calculent au fur et à mesure.",
          "Sur le chantier, le tableau s'utilise au téléphone, ce qui évite de noter sur un carnet puis de tout recopier au bureau. Les mesures restent attachées au chantier et se retrouvent plus tard si le client conteste une quantité.",
        ],
      },
      {
        title: 'Du métré au devis',
        paragraphs: [
          "Le bouton « Créer un devis depuis ce métré » génère un devis pré-rempli avec une ligne par poste et les quantités mesurées. Il ne reste qu'à vérifier les prix unitaires, souvent déjà proposés par le Catalogue pour les positions que vous avez déjà facturées.",
          "Pour une soumission reçue d'un architecte ou d'un maître d'ouvrage, le module Remplir une soumission (bêta) permet d'importer le document reçu, d'y mettre vos prix et de renvoyer le PDF rempli.",
        ],
      },
    ],
    faq: [
      { q: 'Où activer le métré ?', a: 'Dans les paramètres du chantier, avec les autres outils propres au chantier.' },
      { q: 'Le devis généré reste-t-il modifiable ?', a: "Oui, c'est un devis normal : lignes, prix et textes se modifient avant l'envoi." },
      { q: 'Le métré est-il supprimé avec le chantier ?', a: 'Oui, supprimer un chantier supprime aussi son métré. Les devis déjà créés sont conservés.' },
    ],
  },
  inventaire: {
    sections: [
      {
        title: 'Une base de prix qui se construit seule',
        paragraphs: [
          "Vous n'avez pas besoin de remplir le Catalogue avant de commencer. Chaque devis l'alimente : au bout de quelques semaines, vos positions habituelles y sont, avec leur unité et le dernier prix pratiqué. C'est ce qui permet de chiffrer un nouveau devis en quelques minutes.",
          "Le Catalogue signale aussi un prix qui s'écarte fortement de vos prix habituels pour la même position. Utile pour repérer une faute de frappe avant que le devis parte.",
        ],
      },
      {
        title: 'Importer ce que vous avez déjà',
        paragraphs: [
          "Si vous tenez déjà une liste de prix dans Excel, exportez-la en CSV et importez-la : les colonnes description, unité et prix sont reconnues automatiquement. L'export du Catalogue vous donne à tout moment un fichier à jour, par exemple pour une révision annuelle des prix.",
          "Avec l'intégration Bexio (formule Équipe et plus), les positions de votre catalogue Bexio peuvent aussi être reprises.",
        ],
      },
    ],
    faq: [
      { q: 'Le Catalogue gère-t-il un stock ?', a: "Non. C'est une bibliothèque de positions et de prix, pas un suivi de matériel en stock." },
      { q: 'Modifier une position change-t-il mes anciens devis ?', a: 'Non, seulement les prochains.' },
      { q: 'Puis-je supprimer une position ?', a: 'Oui, depuis le Catalogue, à tout moment.' },
    ],
  },
  'equipe-modules': {
    sections: [
      {
        title: 'Inviter quelqu’un',
        paragraphs: [
          "Dans Compte → Équipe, copiez le lien d'invitation et envoyez-le à votre collègue (e-mail, SMS, WhatsApp). En s'inscrivant avec ce lien, il rejoint directement votre entreprise. Vous choisissez ensuite son rôle : il ne voit que ce que ce rôle autorise.",
          "Le nombre de membres dépend de la formule : jusqu'à 3 avec Essentiel, 10 avec Équipe, 25 avec Entreprise. Au-delà, la formule Sur mesure s'adapte à votre taille.",
        ],
      },
      {
        title: 'Choisir ses modules',
        paragraphs: [
          "Compte → Modules règle les sections visibles pour toute l'équipe. Les outils propres à un chantier (documents, photos, métré, sous-traitants, rentabilité) se choisissent séparément dans les paramètres de chaque chantier. Une petite entreprise peut ainsi garder une application très simple, et en ajouter au fur et à mesure.",
        ],
      },
    ],
    faq: [
      { q: 'Un membre parti garde-t-il l’accès ?', a: "Non, retirez-le de Compte → Équipe et il n'a plus accès. Les documents qu'il a créés restent dans l'entreprise." },
      { q: 'Puis-je créer mes propres rôles ?', a: 'Oui, avec des droits choisis. La formule Essentiel en compte deux, Équipe et Entreprise sans limite.' },
      { q: 'Un module coûte-t-il en plus ?', a: 'Non, les modules inclus dans votre formule sont compris dans le prix.' },
    ],
  },
  'personnalisation-abonnement': {
    sections: [
      {
        title: 'Les trois formules en bref',
        paragraphs: [
          "Essentiel (CHF 39.– par mois) : devis, factures et rapports illimités, QR-facture, comptabilité et TVA, jusqu'à 3 membres et 5 Go. Équipe (CHF 79.–) : planning, rentabilité, trésorerie, salaires, Bexio, documents dans la langue du client, jusqu'à 10 membres et 15 Go. Entreprise (CHF 129.–) : suivi commercial, relances de devis automatiques, jusqu'à 25 membres et 40 Go. La facturation annuelle coûte 20 % de moins.",
          "Vous pouvez changer de formule à tout moment depuis Compte → Abonnement. Le passage à une formule supérieure est immédiat.",
        ],
      },
      {
        title: 'Essai et résiliation',
        paragraphs: [
          "L'essai dure 14 jours avec toutes les fonctions de la formule choisie. Rien n'est débité pendant l'essai, et vous pouvez résilier en ligne avant la fin sans rien payer. Après l'essai, l'abonnement démarre et se gère depuis le même écran, factures comprises.",
        ],
      },
    ],
    faq: [
      { q: 'Les prix incluent-ils la TVA ?', a: 'Les prix affichés sont ceux de la page Tarifs. Votre facture Stripe détaille le montant.' },
      { q: 'Je veux récupérer mes données avant de partir ?', a: "Vos devis et factures existent en PDF, et les listes s'exportent. Pour le reste, écrivez à info@cantia.ch." },
      { q: 'J’ai reçu un code personnel, où l’entrer ?', a: "Sur l'écran de choix de la formule, avec « Vous avez un plan personnalisé ? »." },
    ],
  },
  'tableau-de-bord': {
    sections: [
      {
        title: 'Ce qu’on regarde chaque matin',
        paragraphs: [
          "Le tableau de bord répond à trois questions : qu'est-ce qui attend une réponse (devis envoyés), qu'est-ce qui doit rentrer (factures ouvertes et en retard), et où en sont les chantiers en cours. Chaque indicateur s'ouvre sur la liste correspondante, déjà filtrée.",
          "Une facture en retard ressort tout de suite, avec son montant et le nombre de jours de retard. C'est souvent le moment d'envoyer un rappel, directement depuis la facture.",
        ],
      },
      {
        title: 'Sur téléphone',
        paragraphs: [
          "Sur téléphone, le tableau de bord passe en colonne unique, avec les raccourcis en haut. Le bouton micro en bas de l'écran permet d'ajouter des heures ou une dépense à la voix, sans quitter l'accueil.",
          "Les notifications (cloche en haut) signalent ce qui vient de se passer : un devis signé, un e-mail reçu d'un client, une facture qui passe en retard. Leur réglage se fait dans Compte → Notifications.",
        ],
      },
    ],
    faq: [
      { q: 'Pourquoi je ne vois pas les montants ?', a: "Les chiffres financiers dépendent de votre rôle. Un administrateur peut vous en donner l'accès." },
      { q: 'Les indicateurs sont-ils à jour ?', a: 'Oui, ils sont calculés à chaque ouverture à partir de vos documents.' },
      { q: 'Puis-je recevoir les notifications par e-mail ?', a: "Oui, type par type, dans Compte → Notifications." },
    ],
  },
  'rejoindre-organisation': {
    sections: [
      {
        title: 'Avec un lien d’invitation',
        paragraphs: [
          "Ouvrez le lien reçu, créez votre compte avec votre adresse e-mail, et vous arrivez directement dans l'entreprise. Il n'y a ni formule à choisir ni paiement à faire : c'est l'abonnement de l'entreprise qui vous couvre.",
          "Si le lien ne fonctionne plus, demandez-en un nouveau à l'administrateur : il le copie depuis Compte → Équipe.",
        ],
      },
      {
        title: 'Sans lien',
        paragraphs: [
          "À l'inscription, choisissez de rejoindre une entreprise existante et cherchez-la par son nom. L'administrateur reçoit une notification, accepte ou refuse la demande, et vous êtes prévenu dès qu'il a répondu. En attendant, rien n'est visible de l'entreprise.",
        ],
      },
    ],
    faq: [
      { q: 'Mon patron doit-il payer pour moi ?', a: "Votre accès fait partie de l'abonnement de l'entreprise, dans la limite de membres de sa formule." },
      { q: 'Je me suis trompé d’entreprise, que faire ?', a: "Demandez à l'administrateur de cette entreprise de vous retirer, puis rejoignez la bonne." },
      { q: 'Que voit l’entreprise de mon compte ?', a: 'Votre nom, votre e-mail, et ce que vous saisissez pour elle : heures, frais, messages de chantier.' },
    ],
  },
  'dictee-vocale': {
    sections: [
      {
        title: 'Bien dicter',
        paragraphs: [
          "Parlez comme vous parleriez à un collègue, sans dicter la ponctuation. Pour une ligne de devis, donnez le travail, la quantité, l'unité et le prix dans la même phrase. Pour des heures, donnez le chantier ou le client, les horaires et ce qui a été fait.",
          "La dictée fonctionne en français, en allemand et en italien, et reconnaît la langue toute seule. Un enregistrement dans le bruit d'un chantier passe mieux en rapprochant le téléphone.",
        ],
      },
      {
        title: 'Rien n’est enregistré sans vous',
        paragraphs: [
          "L'assistant affiche toujours ce qu'il a compris avant d'enregistrer : chantier, heures, montant, catégorie. Vous corrigez à la main ou redictez. Les utilisations de l'assistant IA sont comptées par mois : 150 avec Essentiel, 600 avec Équipe, 2'000 avec Entreprise.",
        ],
      },
    ],
    faq: [
      { q: 'Mes enregistrements sont-ils conservés ?', a: "Non. L'audio sert à la transcription, puis le fichier temporaire est supprimé. Seul le texte reste." },
      { q: 'Faut-il une connexion ?', a: 'Oui, au moment de dicter, car la transcription se fait sur des serveurs sécurisés.' },
      { q: 'Ça comprend le suisse romand ?', a: 'Oui, les nombres comme septante ou nonante et le vocabulaire du bâtiment sont compris.' },
    ],
  },
  'chantiers-documents': {
    sections: [
      {
        title: 'Une organisation qui tient dans le temps',
        paragraphs: [
          "Créez les mêmes dossiers sur chaque chantier (plans, autorisations, contrats, fournisseurs, photos de réception) : toute l'équipe sait où chercher, et un chantier repris deux ans plus tard se comprend en quelques minutes.",
          "Les plans peuvent être consultés sur le chantier depuis un téléphone ou une tablette, sans les imprimer à chaque nouvelle version. Gardez l'ancienne version dans un sous-dossier plutôt que de l'écraser, pour savoir sur quelle base un travail a été fait.",
        ],
      },
      {
        title: 'Stockage',
        paragraphs: [
          "Chaque formule a son espace : 5 Go avec Essentiel, 15 Go avec Équipe, 40 Go avec Entreprise. Compte → Stockage montre ce qui prend de la place, par type de fichier. Les fichiers sont hébergés en Suisse.",
        ],
      },
    ],
    faq: [
      { q: 'Puis-je partager un document avec le client ?', a: 'Les devis, factures et travaux supplémentaires se partagent par le portail client. Les autres documents se téléchargent puis se transmettent.' },
      { q: 'Quels fichiers sont acceptés ?', a: 'PDF, images et fichiers Office, entre autres. Les plus courants s’ouvrent en aperçu.' },
      { q: 'Que se passe-t-il si je supprime le chantier ?', a: 'Ses documents et photos sont supprimés avec lui. Les devis et factures sont conservés.' },
    ],
  },
  'chantiers-sous-traitants': {
    sections: [
      {
        title: 'Suivre ce qui est confié',
        paragraphs: [
          "Sur le chantier, l'onglet Sous-traitants liste les entreprises qui y interviennent, avec leurs factures et ce qui reste à payer. En fin de chantier, vous savez exactement combien a coûté la sous-traitance, sans reprendre les classeurs.",
          "Saisissez chaque facture reçue dès son arrivée, avec son échéance : elle apparaît dans la prévision de Trésorerie, ce qui évite les mauvaises surprises en fin de mois.",
        ],
      },
      {
        title: 'Pourquoi c’est utile pour la marge',
        paragraphs: [
          "Une sous-traitance représente souvent une grosse part du coût d'un chantier. Si elle n'est pas comptée, la marge affichée est trop belle. En la rattachant au chantier, l'onglet Rentabilité montre une marge réaliste, à comparer avec celle prévue au devis.",
          "Pour les travaux confiés en partie, gardez aussi dans les documents du chantier le contrat ou l'offre du sous-traitant : c'est la base en cas de désaccord sur ce qui était compris.",
        ],
      },
    ],
    faq: [
      { q: 'Dois-je ressaisir un sous-traitant à chaque chantier ?', a: 'Non, le répertoire des sous-traitants permet de le choisir en quelques clics.' },
      { q: 'Le sous-traitant a-t-il accès à Cantia ?', a: "Non, il apparaît comme un contact. Il n'a pas de compte dans votre entreprise." },
      { q: 'Où activer cet onglet ?', a: 'Dans les paramètres du chantier.' },
    ],
  },
  'travaux-supplementaires': {
    sections: [
      {
        title: 'Le bon réflexe sur place',
        paragraphs: [
          "Le client demande un changement pendant que vous êtes sur le chantier : créez le travaux supplémentaires tout de suite depuis le téléphone, dictez la description et le prix, et envoyez-le. Le client le signe en ligne le jour même, avant que le travail soit fait. Plus de discussion trois mois plus tard sur ce qui avait été dit.",
        ],
      },
      {
        title: 'Suivi et facturation',
        paragraphs: [
          "Chaque travaux supplémentaires garde sa date, sa signature et son statut. Accepté, il se transforme en facture, ou s'ajoute à la facture finale du chantier. La liste des travaux supplémentaires du chantier montre ce qui est signé, en attente ou refusé.",
        ],
      },
    ],
    faq: [
      { q: 'Faut-il un devis d’origine ?', a: "Non, un travaux supplémentaires peut être lié au devis d'origine ou créé seul sur le chantier." },
      { q: 'Le client doit-il créer un compte pour signer ?', a: "Non, il signe depuis le lien reçu par e-mail, après vérification de son adresse." },
      { q: 'La marge du chantier est-elle mise à jour ?', a: 'Oui, un travaux supplémentaires accepté augmente le montant devisé du chantier.' },
    ],
  },
  'rh-heures-salaires': {
    sections: [
      {
        title: 'Mettre en place les salaires',
        paragraphs: [
          "Pour chaque employé, renseignez dans sa fiche le salaire (mensuel ou horaire), les taux de cotisations et, s'il y a lieu, le taux d'impôt à la source. Les valeurs proposées sont indicatives : reprenez celles de votre caisse de compensation, de votre caisse de pension et de votre assureur-accidents.",
          "Pour un salaire horaire sans vacances fixes, l'indemnité de vacances (8,33 % pour 4 semaines, 10,64 % pour 5 semaines) s'ajoute à la fiche. Le 13e salaire se règle aussi par employé.",
        ],
      },
      {
        title: 'Chaque mois',
        paragraphs: [
          "En fin de mois, vérifiez les heures, puis générez les fiches : Cantia calcule du brut au net avec les heures pointées et les frais. Chaque employé reçoit sa fiche et la retrouve dans son espace. L'écriture comptable des salaires peut être générée pour la comptabilité, et le certificat de salaire annuel se prépare à partir des mêmes données.",
        ],
      },
    ],
    faq: [
      { q: 'Quelle formule faut-il ?', a: 'Les salaires sont inclus dès la formule Équipe.' },
      { q: 'Les taux sont-ils à jour ?', a: 'Les taux légaux de base sont préremplis, mais vérifiez toujours ceux de vos caisses et de votre canton.' },
      { q: 'Ma fiduciaire peut-elle voir les salaires ?', a: 'Oui, si vous lui donnez accès depuis Compte → Fiduciaire.' },
    ],
  },
  'rh-heures-guide': {
    sections: [
      {
        title: 'Les bonnes habitudes',
        paragraphs: [
          "Le plus fiable est de pointer chaque jour, en fin de journée, depuis le chantier. Une semaine reconstituée le vendredi oublie toujours quelque chose. Le type de travail (pose, transport, nettoyage…) se choisit à chaque entrée et permet ensuite de facturer par catégorie.",
          "Les frais du jour (repas, kilomètres) s'ajoutent dans la même entrée, ce qui évite les tickets perdus en fin de mois.",
        ],
      },
      {
        title: 'Du pointage à la facture',
        paragraphs: [
          "Pour un chantier facturé en régie, l'onglet Facturation de RH → Heures montre les heures non facturées par chantier et par type. La facture créée reprend les heures et les taux, et les heures facturées ne réapparaissent plus. Pour un chantier au forfait, les mêmes heures servent au calcul de rentabilité.",
        ],
      },
    ],
    faq: [
      { q: 'Un employé peut-il corriger ses heures ?', a: 'Oui, depuis sa feuille d’heures, en ouvrant l’entrée à corriger.' },
      { q: 'Peut-on pointer pour quelqu’un d’autre ?', a: "Un responsable avec le bon rôle peut saisir les heures d'un membre de l'équipe." },
      { q: 'L’export CSV contient quoi ?', a: 'Les heures de la période affichée, avec la date, la personne, le chantier et le type de travail.' },
    ],
  },
  tresorerie: {
    sections: [
      {
        title: 'Lire la courbe',
        paragraphs: [
          "La courbe part du solde que vous avez saisi, ajoute les factures clients attendues à leur échéance, retire les salaires au jour de paie, les factures de sous-traitants et les dépenses récurrentes. Le point le plus bas des 90 jours est celui à surveiller.",
          "Une facture client en retard reste dans la projection, mais elle est signalée : si le creux dépend d'elle, c'est elle qu'il faut relancer en premier.",
        ],
      },
      {
        title: 'Mettre à jour en deux minutes',
        paragraphs: [
          "Une fois par semaine, mettez à jour le solde bancaire et vérifiez les paiements reçus (l'import d'un relevé CAMT les rapproche d'un coup). La projection reste fiable sans y passer plus de temps.",
        ],
      },
    ],
    faq: [
      { q: 'Quelle formule faut-il ?', a: 'La trésorerie est incluse dès la formule Équipe.' },
      { q: 'Cantia accède-t-il à mon compte bancaire ?', a: "Non. Le solde se saisit à la main, et l'import de relevé est un fichier que vous choisissez de charger." },
      { q: 'Les achats ponctuels comptent-ils ?', a: "Non, la projection ne retient que ce qui est récurrent ou attendu. Les achats ponctuels apparaissent dans Dépenses." },
    ],
  },
  depenses: {
    sections: [
      {
        title: 'Scanner un ticket',
        paragraphs: [
          "Prenez en photo le ticket ou la facture fournisseur : le fournisseur, la date et le montant sont lus automatiquement. Vérifiez, choisissez le chantier si l'achat le concerne, et enregistrez. La photo reste attachée à la dépense comme justificatif.",
          "Les dépenses dictées à la voix arrivent au même endroit. Un passage rapide dans la liste en fin de semaine suffit pour vérifier que chaque achat est au bon chantier.",
        ],
      },
      {
        title: 'Pour la comptabilité',
        paragraphs: [
          "Les filtres par période et par chantier donnent un total en un instant, par exemple pour préparer la TVA du trimestre. Votre fiduciaire peut accéder aux justificatifs si vous lui ouvrez l'accès depuis Compte → Fiduciaire, sans envoi de classeurs.",
        ],
      },
    ],
    faq: [
      { q: 'Une dépense peut-elle changer de chantier ?', a: 'Oui, en la modifiant depuis la rentabilité du chantier.' },
      { q: 'Que faire d’un ticket illisible ?', a: 'Saisissez le montant et le fournisseur à la main, la photo reste en justificatif.' },
      { q: 'Les dépenses récurrentes se répètent-elles seules ?', a: 'Oui, avec un rappel avant chaque échéance.' },
    ],
  },
  clients: {
    sections: [
      {
        title: 'Une fiche bien remplie',
        paragraphs: [
          "Renseignez l'adresse de facturation exacte, l'e-mail qui reçoit les documents et la langue du client. Ce sont ces informations qui partent sur chaque devis et facture, et l'e-mail sert aussi à sécuriser l'accès au portail client.",
          "Pour une gérance ou une entreprise, gardez une seule fiche client par société et indiquez l'adresse du chantier sur chaque chantier, plutôt que de créer un client par immeuble.",
        ],
      },
      {
        title: 'Retrouver l’historique',
        paragraphs: [
          "La fiche réunit tous les documents du client, du premier devis à la dernière facture, avec leur statut. Avant de rappeler un client, un coup d'œil suffit pour savoir ce qui est en cours, ce qui a été accepté et ce qui reste à payer.",
          "Vos clients existants s'importent depuis un fichier Excel ou CSV (Compte → Import de données), ou depuis Bexio si vous utilisez l'intégration.",
        ],
      },
    ],
    faq: [
      { q: 'Comment éviter les doublons ?', a: 'Cherchez le client avant d’en créer un nouveau : au moment du devis, Cantia propose les fiches existantes.' },
      { q: 'Le client voit-il sa fiche ?', a: 'Non, il ne voit que les documents que vous lui envoyez, par le portail client.' },
      { q: 'Un particulier et une entreprise, c’est pareil ?', a: 'Oui, une fiche client sert aux deux. Indiquez simplement le nom de la société quand il y en a une.' },
    ],
  },
  'sous-traitants': {
    sections: [
      {
        title: 'Construire son réseau',
        paragraphs: [
          "Ajoutez chaque sous-traitant une fois : nom de l'entreprise, contact, téléphone, e-mail, corps de métier. Le répertoire devient votre carnet d'adresses de partenaires, partagé par toute l'équipe, au lieu d'être dispersé dans les téléphones.",
          "Le corps de métier permet de retrouver vite un électricien ou un ferblantier disponible quand un chantier en a besoin.",
        ],
      },
      {
        title: 'Factures et paiements',
        paragraphs: [
          "Chaque facture reçue s'enregistre avec son montant, son échéance et son statut. Le total à payer à chaque sous-traitant est visible d'un coup d'œil, chantier par chantier. Les montants dus apparaissent aussi dans la prévision de trésorerie.",
          "Pour les gros lots, gardez l'offre et le contrat du sous-traitant dans les documents du chantier, à côté de ses factures.",
        ],
      },
    ],
    faq: [
      { q: 'Où activer le module ?', a: 'Dans Compte → Modules.' },
      { q: 'Puis-je voir tout ce que j’ai payé à un sous-traitant ?', a: "Oui, sa fiche regroupe ses factures sur tous les chantiers." },
      { q: 'Le sous-traitant reçoit-il un accès ?', a: "Non, c'est un contact dans votre répertoire, sans compte Cantia." },
    ],
  },
  'integration-bexio': {
    sections: [
      {
        title: 'Connecter Bexio',
        paragraphs: [
          "Dans Compte → Intégrations, choisissez Bexio et connectez-vous avec votre compte Bexio habituel. Vous autorisez Cantia à échanger les données nécessaires ; Cantia ne voit jamais votre mot de passe. La connexion prend une minute.",
          "Les clients circulent dans les deux sens : un client créé dans Bexio arrive dans Cantia, un client créé dans Cantia part vers Bexio, avec une synchronisation régulière.",
        ],
      },
      {
        title: 'Une répartition claire',
        paragraphs: [
          "Cantia reste l'outil du terrain et des documents (devis, chantiers, heures, factures), Bexio reste celui de la comptabilité. Chaque facture envoyée arrive dans Bexio en brouillon : votre fiduciaire ou vous la validez, ce qui évite d'avoir deux personnes qui comptabilisent la même chose.",
        ],
      },
    ],
    faq: [
      { q: 'Quelle formule faut-il ?', a: "L'intégration Bexio est incluse dès la formule Équipe." },
      { q: 'Faut-il un abonnement Bexio particulier ?', a: "Il faut un compte Bexio qui donne accès à l'API. Les formules actuelles de Bexio le permettent en général, vérifiez la vôtre." },
      { q: 'Que se passe-t-il si je déconnecte ?', a: 'Les échanges s’arrêtent tout de suite. Les données déjà présentes de chaque côté restent.' },
    ],
  },
  'relances-impayes': {
    sections: [
      {
        title: 'Envoyer un rappel',
        paragraphs: [
          "Depuis une facture en retard, le bouton « Envoyer un rappel » envoie au client le texte de relance prévu, avec la facture et le lien sécurisé. Les textes avant et après l'échéance se règlent une fois dans Compte → E-mails, avec le nom du client et le montant remplis automatiquement.",
          "Chaque rappel envoyé apparaît dans la section E-mails, avec sa date : vous savez qui a été relancé et quand.",
        ],
      },
      {
        title: 'Si le client ne paie toujours pas',
        paragraphs: [
          "Après deux rappels sans réponse, un appel téléphonique règle souvent la situation. Si rien ne bouge, la procédure de poursuite reste possible ; le blog de Cantia explique les étapes. Garder les rappels datés dans Cantia aide à montrer que le client a été averti.",
        ],
      },
    ],
    faq: [
      { q: 'Puis-je modifier le texte du rappel ?', a: 'Oui, dans Compte → E-mails, et avant chaque envoi.' },
      { q: 'Cantia ajoute-t-il des intérêts de retard ?', a: "Non, c'est à vous de décider. L'outil gratuit de calcul des intérêts de retard donne le montant." },
      { q: 'Comment éviter de relancer un client qui a payé ?', a: 'Rapprochez les paiements avant de relancer, par la référence QR ou l’import du relevé.' },
    ],
  },
  'import-releve-bancaire': {
    sections: [
      {
        title: 'Obtenir le fichier',
        paragraphs: [
          "Dans votre e-banking, cherchez l'export du relevé au format CAMT.053 (parfois appelé « relevé ISO 20022 » ou « XML »). Choisissez la période depuis le dernier import, téléchargez le fichier, puis importez-le dans Cantia.",
          "Si vous chargez un fichier déjà importé, Cantia vous le signale pour éviter de traiter deux fois les mêmes paiements.",
        ],
      },
      {
        title: 'Vérifier et confirmer',
        paragraphs: [
          "Cantia affiche chaque paiement avec la facture proposée. Les correspondances exactes sont déjà cochées ; celles proposées par ressemblance de nom attendent votre vérification. En confirmant, les factures passent à Payée ou Partiellement payée, et la trésorerie se met à jour.",
          "Les paiements sortants et les entrées sans facture restent à part : vous pouvez les relier à une dépense ou à un salaire déjà enregistrés, ou les ignorer.",
        ],
      },
    ],
    faq: [
      { q: 'Quelles banques sont compatibles ?', a: "Toute banque suisse qui exporte un relevé CAMT.053, ce qui est le cas des principales." },
      { q: 'Cantia se connecte-t-il à ma banque ?', a: "Non, vous chargez vous-même un fichier. Aucun accès à votre compte n'est donné." },
      { q: 'Et si un client paie deux factures d’un coup ?', a: 'Vérifiez la proposition et répartissez le paiement sur les factures concernées.' },
    ],
  },
  'portail-client': {
    sections: [
      {
        title: 'Ce que vit le client',
        paragraphs: [
          "Le client reçoit un e-mail avec votre texte, le PDF et un bouton pour ouvrir le document. Il confirme son adresse e-mail avec un code reçu, puis voit le document à vos couleurs : lignes, totaux, conditions. Sur un devis, il signe en bas de la page, sans rien installer.",
          "La page fonctionne aussi bien sur téléphone que sur ordinateur.",
        ],
      },
      {
        title: 'Ce que vous voyez',
        paragraphs: [
          "Dès que le client signe, le document passe à Accepté dans Cantia et vous recevez une notification. La signature, la date et l'heure sont enregistrées avec le document. Avec la formule Entreprise, vous voyez aussi quand le client a consulté le devis, ce qui aide à choisir le bon moment pour le rappeler.",
        ],
      },
    ],
    faq: [
      { q: 'Le client peut-il refuser ?', a: 'Oui, il peut refuser le devis depuis le portail. Vous en êtes averti.' },
      { q: 'Une signature en ligne a-t-elle de la valeur ?', a: "Elle prouve l'accord du client, avec la date et l'heure. Pour des cas particuliers, demandez conseil à un juriste." },
      { q: 'Que se passe-t-il si le lien est transféré ?', a: "Sans l'accès à l'adresse e-mail du client, le code ne peut pas être reçu et le document ne s'ouvre pas." },
    ],
  },
};
