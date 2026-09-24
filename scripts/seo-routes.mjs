import { BLOG_DATES_FR, BLOG_SEO_DE, HELP_SEO_DE, HELP_SEO_FR, TRADE_SEO_DE } from './de-seo-data.generated.mjs';
import { BLOG_SEO_IT, HELP_SEO_IT, TRADE_SEO_IT } from './it-seo-data.generated.mjs';

const TRADE_SLUGS = new Set([
  'charpentier', 'macon', 'electricien', 'plombier', 'peintre', 'menuisier', 'entreprise-generale',
  'paysagiste', 'couvreur', 'chauffagiste', 'carreleur', 'platrier', 'genie-civil', 'terrassier',
  'entreprise-renovation', 'serrurier', 'ferblantier', 'facadier', 'etancheur', 'construction-bois',
  'vitrier', 'parqueteur', 'echafaudeur', 'demolition',
]);

export const SITE = 'https://cantia.ch';
export const OG_IMAGE = `${SITE}/og-image.jpg`;
export const ORG_LOGO = `${SITE}/pwa-icon-512.png`;

const HOME = {
  path: '',
  title: 'Logiciel de gestion de chantier en Suisse | Cantia',
  description:
    'Cantia centralise devis, factures, planning, rapports, heures et rentabilité pour les artisans et PME du bâtiment en Suisse.',
};

export const ROUTES = [
  HOME,
  {
    path: 'tarifs',
    title: 'Tarifs | Cantia',
    description:
      'Les tarifs de Cantia, le logiciel suisse de gestion pour entreprises du bâtiment : devis, factures, chantiers, RH et trésorerie. Sans engagement, essai gratuit.',
  },
  {
    path: 'logiciel-chantier',
    title: 'Logiciel de gestion de chantier pour entreprises du bâtiment | Cantia',
    description:
      'Devis, factures, rapports de chantier, planning et rentabilité dans un seul logiciel suisse. Essai gratuit 14 jours, sans engagement, hébergé en Suisse.',
    faq: [
      {
        q: 'Combien coûte un logiciel de gestion de chantier avec Cantia ?',
        a: "Les tarifs varient selon la taille de votre équipe. Chaque plan inclut 14 jours d'essai gratuit (carte bancaire requise, aucun débit avant la fin de l'essai) pour tester avant de vous engager.",
      },
      {
        q: 'Ai-je besoin d’installer un logiciel sur mon ordinateur ?',
        a: 'Non. Cantia fonctionne entièrement dans le navigateur, sur ordinateur, tablette ou téléphone — sans rien installer, y compris directement depuis le chantier.',
      },
      {
        q: 'Mes données sont-elles hébergées en Suisse ?',
        a: 'Oui, toutes les données sont hébergées en Suisse (Zurich), chiffrées, jamais revendues.',
      },
      {
        q: 'Y a-t-il un engagement ou une durée minimale ?',
        a: "Aucun. Tous les plans sont résiliables à tout moment depuis Compte → Abonnement, sans justification ni frais de sortie.",
      },
    ],
  },
  {
    path: 'solutions/devis',
    title: 'Devis en ligne pour artisans suisses | Cantia',
    description:
      "Dictez vos lignes de devis à voix haute sur le chantier. Cantia les transforme en positions chiffrées avec vos prix habituels, PDF prêt à envoyer.",
    faq: [
      {
        q: 'Comment faire un devis rapidement en tant qu’artisan ?',
        a: "Dictez vos lignes à voix haute sur le chantier ou en voiture. Cantia les transforme en positions chiffrées avec vos prix habituels, et le PDF est prêt avant même d'avoir quitté le client.",
      },
      {
        q: 'Le devis est-il conforme aux usages suisses (TVA, mise en page) ?',
        a: "Oui : chaque devis reprend votre taux de TVA, vos coordonnées d'entreprise et peut être personnalisé à votre couleur de marque et votre logo.",
      },
      {
        q: 'Peut-on transformer un devis accepté en facture automatiquement ?',
        a: 'Oui, un devis accepté se convertit en facture — avec QR-bill suisse — en un clic, sans ressaisir les lignes.',
      },
      {
        q: 'Cantia est-il gratuit pour faire des devis ?',
        a: "Cantia propose un essai gratuit de 14 jours sur tous les plans (carte bancaire requise, aucun débit avant la fin de l'essai). Une fois abonné, les devis et factures sont illimités sur chaque plan, sans quota mensuel.",
      },
    ],
  },
  {
    path: 'solutions/facturation',
    title: 'Facturation & QR-facture suisse | Cantia',
    description:
      "Chaque facture Cantia intègre automatiquement le QR-bill suisse conforme — IBAN, référence structurée et montant déjà encodés, prêt à scanner.",
    faq: [
      {
        q: 'Comment créer une facture avec QR-facture suisse ?',
        a: "Renseignez votre IBAN une fois dans les paramètres : chaque facture génère ensuite automatiquement le bulletin QR conforme à la norme SIX, IBAN et référence structurée déjà encodés.",
      },
      {
        q: 'Peut-on facturer un acompte avant la fin du chantier ?',
        a: "Oui, Cantia permet d'émettre une facture d'acompte pour un pourcentage du devis, puis déduit automatiquement ce montant de la facture finale.",
      },
      {
        q: 'Comment savoir si une facture a été payée ?',
        a: 'Recherchez et rapprochez un paiement directement par son numéro de référence QR — le statut passe à «payée» sans devoir vérifier votre compte bancaire manuellement.',
      },
      {
        q: 'Combien coûte la facturation avec QR-code via Cantia ?',
        a: "La facturation avec QR-bill suisse est incluse dans tous les plans Cantia, sans exception, dès la formule Essentiel.",
      },
    ],
  },
  {
    path: 'solutions/rapports-chantier',
    title: 'Rapports de chantier | Cantia',
    description:
      "Notes vocales, photos géolocalisées et messages d'équipe : Cantia en tire un rapport rédigé et structuré, prêt à envoyer.",
    faq: [
      {
        q: 'Comment rédiger un rapport de chantier rapidement ?',
        a: "Prenez vos photos et dictez vos notes sur le moment — Cantia assemble tout en un rapport PDF structuré et prêt à envoyer, sans devoir tout retaper le soir.",
      },
      {
        q: 'Les photos sont-elles géolocalisées automatiquement ?',
        a: 'Oui, chaque photo est horodatée et géolocalisée sans action supplémentaire de votre part.',
      },
      {
        q: 'Peut-on personnaliser le rapport avec son logo et sa signature ?',
        a: 'Oui, chaque rapport PDF reprend votre logo, votre couleur de marque et la signature de son rédacteur.',
      },
      {
        q: 'Le rapport de chantier remplace-t-il un carnet de chantier papier ?',
        a: 'Oui — notes, photos et suivi sont centralisés dans un document numérique consultable à tout moment, par chantier.',
      },
    ],
  },
  {
    path: 'solutions/dictee-vocale',
    title: 'Dictée vocale pour le bâtiment | Cantia',
    description:
      "Devis, rapports, messages d'équipe : un bouton dicter remplace la saisie au clavier, partout dans Cantia.",
    faq: [
      {
        q: 'La dictée vocale fonctionne-t-elle bien avec le vocabulaire du bâtiment ?',
        a: 'Oui, la reconnaissance est adaptée au vocabulaire technique du bâtiment — matériaux, unités, métiers — pas seulement à du langage courant.',
      },
      {
        q: 'Faut-il une connexion internet pour dicter ?',
        a: 'Oui, la dictée nécessite une connexion pour la transcription, mais les devis et rapports générés restent consultables une fois créés.',
      },
      {
        q: 'Où peut-on utiliser la dictée vocale dans Cantia ?',
        a: "Sur les devis, les rapports de chantier et les messages d'équipe du fil d'actualité — partout où vous écrivez.",
      },
      {
        q: 'La dictée vocale est-elle plus rapide que le clavier sur le terrain ?',
        a: 'Pour la plupart des artisans sur chantier, oui — parler va plus vite que taper sur un téléphone avec les mains sales ou des gants.',
      },
    ],
  },
  {
    path: 'solutions/planning',
    title: "Planning d'équipe chantier | Cantia",
    description:
      "Un vrai calendrier d'équipe : chaque membre, chaque chantier, chaque jour. Fini les plannings sur papier ou WhatsApp.",
    faq: [
      {
        q: "Comment organiser le planning d'une équipe de chantier ?",
        a: 'Cantia affiche un calendrier hebdomadaire partagé : chaque membre voit qui est sur quel chantier, chaque jour.',
      },
      {
        q: 'Le planning remplace-t-il un tableau Excel ou un groupe WhatsApp ?',
        a: "Oui, toute l'équipe consulte les mêmes informations en temps réel, sans fichier ni message à faire défiler.",
      },
      {
        q: 'Peut-on planifier plusieurs chantiers en parallèle ?',
        a: 'Oui, chaque affectation est liée à un chantier précis et reste visible sur toute la semaine, membre par membre.',
      },
      {
        q: 'Le planning est-il inclus dans tous les plans Cantia ?',
        a: 'Il est disponible à partir du plan Équipe, activable depuis les paramètres de votre organisation.',
      },
    ],
  },
  {
    path: 'solutions/rentabilite',
    title: 'Rentabilité par chantier | Cantia',
    description:
      "Comparez le devis accepté au coût réel — matériel et main d'œuvre — pour savoir si chaque chantier est rentable, en marge serrée ou en perte.",
    faq: [
      {
        q: 'Comment savoir si un chantier est rentable ?',
        a: "Cantia compare le devis accepté (revenu) au coût réel — matériel saisi et main d'œuvre issue du planning — et affiche la marge en CHF et en % en temps réel.",
      },
      {
        q: "D'où vient le calcul du coût de main d'œuvre ?",
        a: "Du planning d'équipe : les jours affectés à un chantier sont multipliés par le coût horaire de votre entreprise, sans pointage séparé.",
      },
      {
        q: 'Peut-on comparer plusieurs chantiers entre eux ?',
        a: 'Oui, chaque chantier affiche sa propre marge, ce qui permet de repérer rapidement les chantiers en perte.',
      },
      {
        q: 'La rentabilité par chantier est-elle incluse dans tous les plans Cantia ?',
        a: 'Elle est disponible à partir du plan Équipe, activable depuis les paramètres de votre organisation.',
      },
    ],
  },
  {
    path: 'solutions/rh-salaires',
    title: 'RH, heures & salaires pour le bâtiment | Cantia',
    description:
      "Chaque employé pointe ses heures par chantier et ses frais professionnels ; la secrétaire ou l'administrateur gère la fiche de salaire de toute l'équipe, du brut au net.",
    faq: [
      {
        q: 'Qui peut voir les salaires dans Cantia ?',
        a: "Uniquement la secrétaire RH et les administrateurs, selon les permissions accordées depuis Équipe. Un employé standard ne voit que ses propres heures et frais.",
      },
      {
        q: 'Cantia calcule-t-il automatiquement les cotisations sociales suisses ?',
        a: "Cantia calcule le salaire net à partir de taux AVS/AC/LPP/LAA et d'un taux d'impôt à la source configurables par employé — les taux par défaut sont indicatifs, à ajuster selon votre caisse de compensation, votre caisse LPP et le canton.",
      },
      {
        q: "Comment un employé exporte-t-il sa feuille d'heures ?",
        a: 'Depuis le module RH & Salaires, en choisissant la granularité — journalière, hebdomadaire ou mensuelle — puis en téléchargeant un fichier CSV.',
      },
      {
        q: 'Le module RH & Salaires est-il inclus dans tous les plans Cantia ?',
        a: 'Il est disponible à partir du plan Équipe, activable depuis les paramètres de votre organisation.',
      },
    ],
  },
  {
    path: 'solutions/travaux-supplementaires',
    title: 'Travaux supplémentaires (TS) pour artisans suisses | Cantia',
    description:
      "Chaque extra demandé en cours de chantier devient un document daté, signé en ligne par le client et transformé automatiquement en facture — fini les extras oubliés ou contestés.",
    faq: [
      {
        q: 'Qu’est-ce qu’un Travaux supplémentaires (TS) dans Cantia ?',
        a: "C'est un document dédié pour tout ce qui est demandé en cours de chantier en plus du devis initial — un mur à déplacer, une prise à ajouter. Il se crée, s'envoie et se signe comme un devis, puis se transforme automatiquement en facture une fois accepté.",
      },
      {
        q: 'Un TS doit-il être rattaché à un devis existant ?',
        a: "Non, c'est optionnel. Vous pouvez le lier au devis d'origine pour garder le contexte, ou le créer seul si le chantier n'a pas de devis initial dans Cantia.",
      },
      {
        q: 'Comment le client valide-t-il un Travaux supplémentaires ?',
        a: "Il reçoit un lien vers un portail sécurisé, consulte le détail chiffré et signe en ligne — l'acceptation est horodatée et déclenche automatiquement la facture correspondante.",
      },
      {
        q: 'Les travaux supplémentaires comptent-ils dans la Rentabilité par chantier ?',
        a: "Oui : dès qu'un TS est accepté, son montant s'ajoute automatiquement au total devisé du chantier dans le module Rentabilité.",
      },
    ],
  },
  {
    path: 'solutions/tresorerie',
    title: 'Trésorerie prévisionnelle pour le bâtiment | Cantia',
    description:
      "Factures à encaisser, salaires, sous-traitants et charges récurrentes réunis en une projection à 90 jours — sans connexion bancaire.",
    faq: [
      {
        q: 'Cantia se connecte-t-il à mon compte bancaire ?',
        a: 'Non. Vous saisissez votre solde manuellement quand vous le souhaitez — aucun accès bancaire n’est demandé ni nécessaire.',
      },
      {
        q: 'D’où viennent les montants de la projection ?',
        a: "Des factures clients non soldées, d'une estimation de la masse salariale (profils RH + heures saisies), des factures sous-traitants impayées et des dépenses récurrentes que vous enregistrez — tout ce que Cantia sait déjà sur votre activité.",
      },
      {
        q: 'Comment fonctionnent les rappels de dépenses récurrentes ?',
        a: 'Un bandeau sur l’accueil et la page Trésorerie vous signale les dépenses récurrentes actives qui tombent dans les 7 prochains jours, avant qu’elles ne soient prélevées.',
      },
      {
        q: 'La Trésorerie prévisionnelle est-elle incluse dans tous les plans Cantia ?',
        a: 'Elle est disponible à partir du plan Équipe, activable depuis les paramètres de votre organisation.',
      },
    ],
  },
  {
    path: 'integrations',
    title: 'Intégrations | Cantia',
    description:
      "Cantia se connecte directement à votre comptabilité : Bexio dès aujourd'hui, clients et articles importés, factures envoyées en un clic, statuts de paiement synchronisés.",
    faq: [
      { q: 'Quelles intégrations Cantia propose-t-il aujourd’hui ?', a: 'Bexio, disponible nativement dès le plan Équipe. D’autres intégrations suivront le même principe de connexion officielle.' },
      { q: 'L’intégration Bexio est-elle payante en plus de l’abonnement ?', a: 'Non — elle est incluse automatiquement à partir du plan Équipe, sans module ni coût supplémentaire.' },
      { q: 'Cantia peut-il envoyer une facture définitive à mon client via Bexio ?', a: 'Non. Chaque facture arrive dans Bexio en brouillon uniquement — la finalisation reste toujours une action manuelle côté Bexio.' },
    ],
  },
  {
    path: 'sur-mesure',
    title: 'Développement sur mesure | Cantia',
    description:
      "Au-delà des modules standards, Cantia peut développer un workflow, une automatisation ou une intégration spécialement pour votre entreprise — sans changer l'expérience des autres clients.",
    faq: [
      { q: 'Un module sur mesure est-il visible par les autres entreprises ?', a: 'Non. Un module développé pour vous est activé uniquement pour votre organisation — les autres clients Cantia ne le voient jamais.' },
      { q: 'Est-ce que je dois changer de logiciel ou installer autre chose ?', a: 'Non — le module vit dans le même Cantia que vous utilisez déjà, avec les mêmes accès et les mêmes mises à jour.' },
      { q: 'Combien coûte un développement sur mesure ?', a: 'Cela dépend entièrement du besoin. On en discute d’abord ensemble, et vous recevez un devis clair avant tout engagement.' },
    ],
  },
  {
    path: 'plans/essentiel',
    title: 'Plan Essentiel — devis & factures illimités | Cantia',
    description:
      "CHF 39/mois : devis, factures et rapports illimités, QR-facture suisse, personnalisation de marque et assistant vocal IA. Découvrez le plan Essentiel.",
    faq: [
      { q: 'Puis-je changer de plan plus tard ?', a: 'Oui, à tout moment depuis les paramètres de votre entreprise. Le changement est immédiat et le montant est ajusté au prorata.' },
      { q: 'Y a-t-il un engagement ?', a: "Non. Tous les plans sont sans engagement, résiliables à tout moment, avec 14 jours d'essai gratuit inclus." },
      { q: 'Le prix inclut-il la TVA ?', a: 'Les prix affichés sont hors TVA. La TVA suisse est ajoutée lors de la facturation.' },
    ],
  },
  {
    path: 'plans/equipe',
    title: 'Plan Équipe — planning, RH & trésorerie | Cantia',
    description:
      "CHF 79/mois : tout Essentiel, plus planning, RH & salaires, rentabilité par chantier, trésorerie et intégration Bexio. Découvrez le plan Équipe.",
    faq: [
      { q: 'Puis-je changer de plan plus tard ?', a: 'Oui, à tout moment depuis les paramètres de votre entreprise. Le changement est immédiat et le montant est ajusté au prorata.' },
      { q: 'Y a-t-il un engagement ?', a: "Non. Tous les plans sont sans engagement, résiliables à tout moment, avec 14 jours d'essai gratuit inclus." },
      { q: 'Le prix inclut-il la TVA ?', a: 'Les prix affichés sont hors TVA. La TVA suisse est ajoutée lors de la facturation.' },
    ],
  },
  {
    path: 'plans/entreprise',
    title: 'Plan Entreprise — pour les structures établies | Cantia',
    description:
      "CHF 129/mois : tout Équipe à plus grande échelle (25 membres, 40 Go), quota IA le plus large, rôles avancés illimités et support prioritaire.",
    faq: [
      { q: 'Puis-je changer de plan plus tard ?', a: 'Oui, à tout moment depuis les paramètres de votre entreprise. Le changement est immédiat et le montant est ajusté au prorata.' },
      { q: 'Y a-t-il un engagement ?', a: "Non. Tous les plans sont sans engagement, résiliables à tout moment, avec 14 jours d'essai gratuit inclus." },
      { q: 'Le prix inclut-il la TVA ?', a: 'Les prix affichés sont hors TVA. La TVA suisse est ajoutée lors de la facturation.' },
    ],
  },
  {
    path: 'blog',
    title: 'Blog | Cantia — Réponses concrètes pour le bâtiment suisse',
    description:
      "Devis, facturation, RH, juridique, comparatifs : des réponses précises aux questions que se posent les artisans et entreprises du bâtiment en Suisse.",
  },
  {
    path: 'blog/calculer-prix-devis-renovation-suisse',
    title: 'Comment calculer le prix d’un devis de rénovation en Suisse | Cantia',
    description:
      "Méthode concrète pour chiffrer un devis de rénovation en Suisse : coût horaire réel, matériel, marge, TVA 8,1 % — avec un exemple chiffré complet.",
    faq: [
      { q: 'Quelle marge appliquer sur un devis de rénovation en Suisse ?', a: 'En général entre 20 et 35 % au total (frais fixes + bénéfice + provision imprévus), à ajuster selon le corps de métier et le niveau d’incertitude du chantier existant.' },
      { q: 'Faut-il inclure les imprévus dans le prix du devis ou les facturer à part ?', a: 'Les deux approches existent : soit une provision intégrée au prix ferme, soit une clause explicite prévoyant une facturation complémentaire sur devis supplémentaire en cas de découverte imprévue.' },
      { q: 'La TVA se calcule sur le prix HT ou TTC du devis ?', a: 'Toujours sur le montant hors taxe (HT). Le taux normal est de 8,1 % depuis 2024 pour la plupart des prestations du bâtiment.' },
    ],
  },
  {
    path: 'blog/norme-sia-118-devis-obligatoire',
    title: 'La norme SIA 118 est-elle obligatoire sur un devis ? | Cantia',
    description:
      "La norme SIA 118 n’est jamais automatique : elle ne s’applique que si le contrat ou le devis la mentionne explicitement. Explications et bonnes pratiques.",
    faq: [
      { q: 'La SIA 118 est-elle une loi suisse ?', a: 'Non. C’est une norme contractuelle privée éditée par la SIA, qui ne s’applique que si le contrat ou le devis y fait explicitement référence.' },
      { q: 'Que se passe-t-il si le devis ne mentionne pas la SIA 118 ?', a: 'Le contrat d’entreprise reste régi par le seul Code des obligations (art. 363 et suivants CO), avec ses propres règles de garantie et de réception.' },
      { q: 'Un particulier peut-il refuser l’application de la SIA 118 ?', a: 'Oui, son intégration résulte d’un accord entre les parties — elle peut être négociée ou remplacée par les règles du CO seul avant signature.' },
    ],
  },
  {
    path: 'blog/qr-facture-obligatoire-2026',
    title: 'QR-facture obligatoire en Suisse : ce qu’il faut savoir en 2026 | Cantia',
    description:
      "Le BVR n’existe plus depuis 2022, la QR-facture est le seul standard. Et depuis fin 2025, un nouveau changement de format menace les QR-factures non conformes.",
    faq: [
      { q: 'Peut-on encore utiliser un bulletin de versement orange en 2026 ?', a: 'Non. Les BVR et BV ne sont plus émis ni acceptés par les banques suisses depuis le 30 septembre 2022.' },
      { q: 'Qu’est-ce qui change avec la version 2.3 de la norme QR-facture ?', a: 'Depuis novembre 2025, seules les adresses structurées sont admises dans le QR-code ; les adresses en texte libre seront rejetées dès le 30 septembre 2026.' },
      { q: 'Quelle est la différence entre IBAN et QR-IBAN ?', a: 'Le QR-IBAN est un numéro dédié utilisé uniquement pour les QR-factures avec référence QR structurée (QRR).' },
    ],
  },
  {
    path: 'blog/delai-paiement-facture-artisan-code-obligations',
    title: 'Délai de paiement d’une facture d’artisan en Suisse | Cantia',
    description:
      "Le Code des obligations ne fixe pas de délai de paiement légal fixe — 30 jours est l’usage, mais tout dépend de ce qui figure sur votre facture.",
    faq: [
      { q: 'La Suisse impose-t-elle un délai de paiement légal de 30 jours ?', a: 'Non. Le Code des obligations ne fixe pas de délai par défaut ; 30 jours est un usage courant à mentionner explicitement sur la facture.' },
      { q: 'Peut-on réclamer des intérêts de retard sans les avoir mentionnés sur la facture ?', a: 'Oui, l’intérêt moratoire de 5 % l’an (art. 104 CO) s’applique de plein droit dès que le débiteur est en demeure.' },
      { q: 'Que faire si une facture ne précise aucune échéance ?', a: 'La créance est en principe exigible immédiatement ; il est recommandé d’envoyer une mise en demeure écrite avec une échéance claire.' },
    ],
  },
  {
    path: 'blog/avs-ai-independant-batiment',
    title: 'AVS/AI pour un indépendant du bâtiment : comment ça marche | Cantia',
    description:
      "Cotisations AVS/AI/APG obligatoires dès 18 ans pour tout indépendant suisse, calculées sur le revenu net et dégressives sous CHF 60’500/an.",
    faq: [
      { q: 'À partir de quel âge un indépendant doit-il cotiser à l’AVS/AI ?', a: 'Dès 18 ans révolus, l’affiliation à l’AVS/AI/APG est obligatoire pour toute activité lucrative indépendante en Suisse.' },
      { q: 'Le taux de cotisation AVS/AI est-il le même pour tous les indépendants ?', a: 'Non — il est dégressif sous un revenu annuel d’environ CHF 60’500, puis atteint un taux plein d’environ 10 % au-delà.' },
      { q: 'Faut-il cotiser même sans bénéfice une année donnée ?', a: 'Oui, une cotisation minimale annuelle reste due même à revenu très faible ou nul.' },
    ],
  },
  {
    path: 'blog/lpp-deuxieme-pilier-independant-batiment',
    title: 'LPP pour un indépendant du bâtiment : obligatoire ou pas ? | Cantia',
    description:
      "Le 2e pilier (LPP) n’est pas obligatoire pour un indépendant suisse — sauf exceptions sectorielles liées à la SUVA dans certains métiers du bâtiment.",
    faq: [
      { q: 'Un indépendant du bâtiment doit-il obligatoirement cotiser au 2e pilier ?', a: 'Non, en règle générale la LPP reste facultative pour tout indépendant en Suisse.' },
      { q: 'La SUVA peut-elle imposer une assurance à un indépendant sans employé ?', a: 'Dans certains métiers du bâtiment à risque, l’affiliation LAA/SUVA peut être obligatoire même pour l’indépendant lui-même.' },
      { q: 'Que devient l’obligation LPP dès qu’on engage un premier salarié ?', a: 'Dès le premier employé, l’employeur doit l’affilier à la LAA obligatoirement, et à la LPP dès que son salaire dépasse le seuil d’entrée.' },
    ],
  },
  {
    path: 'blog/bexio-vs-cantia-logiciel-batiment',
    title: 'Bexio vs Cantia : quel logiciel pour une entreprise du bâtiment ? | Cantia',
    description:
      "Bexio est une comptabilité généraliste suisse. Cantia est pensée spécifiquement pour le chantier : devis dicté à la voix, rentabilité par projet, QR-facture native.",
    faq: [
      { q: 'Cantia peut-il remplacer complètement Bexio ?', a: 'Cantia n’est pas un logiciel de comptabilité générale — pour la tenue comptable complète, la plupart des entreprises gardent un outil dédié ou une fiduciaire.' },
      { q: 'Bexio propose-t-il un module chantier ou rentabilité par projet ?', a: 'Non — Bexio est un ERP généraliste pour PME suisses, sans fonctionnalité dédiée au suivi de chantier.' },
      { q: 'Peut-on utiliser Cantia et Bexio en parallèle ?', a: 'Oui, c’est une combinaison fréquente : Cantia pour le pilotage quotidien des chantiers, Bexio pour la comptabilité générale.' },
    ],
  },
  {
    path: 'blog/integration-bexio-cantia-synchronisation-automatique',
    title: 'Cantia x Bexio : la connexion native qui supprime la double saisie | Cantia',
    description:
      "Cantia se connecte directement à Bexio via son API officielle : clients importés, factures envoyées en un clic, statuts de paiement tenus à jour automatiquement.",
    faq: [
      { q: 'L’intégration Bexio est-elle payante en plus de mon abonnement ?', a: 'Non — elle est incluse automatiquement à partir du plan Équipe, sans coût ni module supplémentaire à activer.' },
      { q: 'Cantia peut-il envoyer une facture définitive à mon client via Bexio ?', a: 'Non. Chaque facture est envoyée vers Bexio en brouillon uniquement — la finalisation reste toujours manuelle côté Bexio.' },
      { q: 'Que se passe-t-il si je déconnecte l’intégration ?', a: 'Les jetons d’accès Bexio sont immédiatement révoqués et aucune donnée n’est plus échangée entre les deux outils.' },
    ],
  },
  {
    path: 'blog/suivre-rentabilite-chantier-sans-excel',
    title: 'Suivre la rentabilité d’un chantier sans tableur Excel | Cantia',
    description:
      "Un tableau Excel de suivi de chantier casse dès qu’une formule change ou qu’une ligne est oubliée. Une méthode plus fiable pour connaître sa rentabilité en temps réel.",
    faq: [
      { q: 'Comment calculer la rentabilité réelle d’un chantier ?', a: 'En comparant le montant vendu au client (devis accepté) au coût réel : heures travaillées, matériel acheté et factures de sous-traitants.' },
      { q: 'Pourquoi un suivi Excel de chantier finit-il souvent abandonné ?', a: 'Parce qu’il repose sur une saisie manuelle a posteriori, fragile aux erreurs de formule et sans lien automatique avec le devis initial.' },
      { q: 'À quel moment du chantier faut-il suivre la rentabilité ?', a: 'Idéalement en continu, dès le démarrage — un suivi fait seulement à la clôture arrive trop tard pour corriger un dépassement.' },
    ],
  },
  {
    path: 'blog/calculer-heures-travail-ouvrier-minutes-decimales',
    title: 'Calculer des heures de travail : pourquoi 4h45 n’est pas 4,45 | Cantia',
    description:
      "Un ouvrier qui a travaillé de 8h à 12h45 a fait 4h45 — pas 4,45 heures décimales (qui vaudrait 4h27). Une erreur de saisie RH fréquente et coûteuse.",
    faq: [
      { q: 'Comment convertir 4h45 de travail en heures décimales ?', a: '45 minutes correspondent à 0,75 heure. 4h45 de travail équivaut donc à 4,75 heures décimales, pas 4,45.' },
      { q: 'Pourquoi tant d’erreurs de paie viennent-elles de la saisie des heures ?', a: 'Parce que la façon naturelle d’écrire une durée ressemble à un nombre décimal, alors que les chiffres après le séparateur représentent des minutes (base 60).' },
      { q: 'Quelle est la méthode la plus sûre pour noter des heures de chantier ?', a: 'Saisir directement l’heure de début et de fin plutôt qu’une durée calculée à la main.' },
    ],
  },
  {
    path: 'blog/sous-traitant-batiment-suisse-contrat-facturation',
    title: 'Sous-traitant bâtiment en Suisse : contrat et facturation | Cantia',
    description:
      "L’entrepreneur principal reste responsable envers le client même quand le travail est sous-traité. Les points à verrouiller avant de sous-traiter.",
    faq: [
      { q: 'Qui est responsable envers le client en cas de malfaçon d’un sous-traitant ?', a: 'L’entrepreneur principal reste responsable envers le client final ; il peut ensuite se retourner contre son sous-traitant.' },
      { q: 'Faut-il vérifier les assurances d’un sous-traitant avant de l’engager ?', a: 'Oui, notamment sa responsabilité civile professionnelle et son affiliation aux assurances sociales pour son personnel.' },
      { q: 'Le contrat de sous-traitance doit-il reprendre la norme SIA 118 du contrat principal ?', a: 'C’est recommandé lorsque le contrat principal y fait lui-même référence, pour éviter un décalage de garanties.' },
    ],
  },
  {
    path: 'blog/duree-conservation-devis-factures-suisse',
    title: 'Combien de temps conserver devis et factures en Suisse | Cantia',
    description:
      "Le Code des obligations (art. 958f) impose une conservation de 10 ans pour les pièces comptables, factures incluses — délai qui court depuis la fin de l’exercice.",
    faq: [
      { q: 'Pendant combien de temps une entreprise suisse doit-elle garder ses factures ?', a: 'Dix ans, conformément à l’art. 958f du Code des obligations.' },
      { q: 'Le délai de 10 ans court-il depuis la date de la facture ?', a: 'Non — il court depuis la fin de l’exercice comptable dans lequel la facture s’inscrit.' },
      { q: 'Peut-on conserver ses factures uniquement en format numérique ?', a: 'Oui, à condition que le lien avec les transactions concernées soit garanti et l’accessibilité assurée pendant toute la durée légale.' },
    ],
  },
  {
    path: 'blog/rediger-devis-qui-inspire-confiance-client',
    title: 'Rédiger un devis qui inspire confiance à un client | Cantia',
    description:
      "Un devis clair, précis et bien présenté rassure autant qu’un prix compétitif. Les éléments concrets qui font la différence aux yeux d’un client particulier.",
    faq: [
      { q: 'Faut-il détailler chaque poste d’un devis ou donner un prix global ?', a: 'Le détail poste par poste est presque toujours préférable : il rassure le client sur ce qui est réellement inclus.' },
      { q: 'Comment gérer les imprévus possibles sur un devis de rénovation ?', a: 'En les mentionnant explicitement comme exclusions ou via une clause claire de facturation complémentaire.' },
      { q: 'La signature électronique d’un devis a-t-elle une valeur en Suisse ?', a: 'Une signature électronique simple vaut acceptation contractuelle dans la plupart des cas pratiques du bâtiment.' },
    ],
  },
  {
    path: 'blog/facturer-acompte-suisse-securiser-solde',
    title: 'Facturer un acompte sans finir à courir après le solde | Cantia',
    description:
      "Un acompte mal structuré protège rarement l’entreprise. Comment répartir les paiements sur un chantier pour ne jamais avancer plus que ce qui est déjà couvert.",
    faq: [
      { q: 'Quel pourcentage d’acompte demander sur un chantier en Suisse ?', a: 'Il n’existe pas de règle légale fixe — 20 à 30 % à la signature est courant, mais l’échéancier complet doit couvrir les dépenses engagées à chaque étape.' },
      { q: 'Un acompte est-il remboursable si le client annule le chantier ?', a: 'Cela dépend des conditions figurant sur le devis signé — une clause d’annulation explicite évite les litiges.' },
      { q: 'Peut-on facturer plusieurs acomptes intermédiaires sur un même chantier ?', a: 'Oui, et c’est recommandé sur les chantiers de plusieurs semaines pour éviter d’avancer trop de trésorerie.' },
    ],
  },
  {
    path: 'blog/relancer-client-facture-impayee-sans-perdre-client',
    title: 'Relancer un client qui ne paie pas, sans perdre le client | Cantia',
    description:
      "La plupart des retards de paiement ne sont pas de la mauvaise foi. Une méthode de relance en trois temps qui récupère l’argent sans casser la relation.",
    faq: [
      { q: 'Combien de temps attendre avant de relancer une facture impayée ?', a: 'Un premier rappel neutre dès le lendemain de l’échéance dépassée est raisonnable.' },
      { q: 'Faut-il mentionner l’intérêt moratoire dès la première relance ?', a: 'Mieux vaut le garder pour la relance ferme, une semaine après le premier rappel.' },
      { q: 'Un plan de paiement en plusieurs fois affaiblit-il la position de l’entreprise ?', a: 'Non, à condition qu’il soit formalisé par écrit avec des dates précises.' },
    ],
  },
  {
    path: 'blog/validite-devis-signe-prix-qui-bouge',
    title: 'Un devis signé engage-t-il si le prix du matériel a changé ? | Cantia',
    description:
      "Un devis sans date de validité engage l’entreprise sans limite dans le temps, même si le prix du matériel a doublé depuis. La clause qui manque sur la plupart des devis.",
    faq: [
      { q: 'Un devis sans date de validité engage-t-il indéfiniment l’entreprise ?', a: 'En principe oui, tant qu’il n’a pas été retiré ou remplacé — d’où l’importance d’une durée de validité explicite.' },
      { q: 'Peut-on répercuter une hausse du prix des matériaux sur un devis déjà signé ?', a: 'Seulement si une clause de révision de prix le prévoit, ou par avenant négocié avec le client.' },
      { q: 'Quelle durée de validité choisir pour un devis de rénovation ?', a: '30 jours est courant pour des matériaux volatils, jusqu’à 90 jours pour des prestations en main-d’œuvre.' },
    ],
  },
  {
    path: 'blog/garantie-travaux-construction-2-ou-5-ans',
    title: 'Garantie travaux de construction en Suisse : 2, 5 ou 10 ans | Cantia',
    description:
      "La garantie légale pour un ouvrage immobilier est de 5 ans, pas 2 — et un changement de droit entré en vigueur en 2026 réduit le délai pour signaler un défaut à 60 jours.",
    faq: [
      { q: 'La garantie sur des travaux de construction est-elle de 2 ans ou 5 ans en Suisse ?', a: '5 ans pour tout ouvrage immobilier ou fixé au bâtiment (art. 371 al. 2 CO). 2 ans seulement pour les objets mobiliers non intégrés.' },
      { q: 'Depuis quand court le délai de garantie de 5 ans ?', a: 'Depuis la réception de l’ouvrage par le client, pas depuis la date de la facture.' },
      { q: 'Quel est le nouveau délai pour signaler un défaut en 2026 ?', a: 'La réforme entrée en vigueur en 2026 fixe un délai de 60 jours pour notifier un défaut après sa découverte.' },
    ],
  },
  {
    path: 'blog/defaut-construction-decouvert-apres-reception-qui-paie',
    title: 'Défaut découvert après réception du chantier : qui paie ? | Cantia',
    description:
      "Un défaut caché découvert des mois après la réception reste à la charge de l’entrepreneur s’il est signalé à temps. Ce que change la réforme du droit de la garantie en 2026.",
    faq: [
      { q: 'Un client peut-il réclamer un défaut découvert un an après la réception ?', a: 'Oui, s’il s’agit d’un défaut caché signalé dans les 60 jours suivant sa découverte, dans le délai de prescription de 5 ans.' },
      { q: 'Que se passe-t-il si un défaut apparent n’a pas été signalé à la réception ?', a: 'Il est en principe réputé accepté par le client, sauf clause contraire.' },
      { q: 'Quel est le délai pour signaler un défaut caché depuis la réforme 2026 ?', a: '60 jours à compter de sa découverte.' },
    ],
  },
  {
    path: 'blog/assurance-rc-professionnelle-batiment-obligatoire',
    title: 'RC professionnelle dans le bâtiment : obligatoire en Suisse ? | Cantia',
    description:
      "Aucune loi fédérale unique n’impose la RC professionnelle à tout artisan — mais plusieurs cantons et donneurs d’ordre l’exigent de fait pour certains métiers. Le point clair.",
    faq: [
      { q: 'La RC professionnelle est-elle obligatoire pour tout artisan suisse ?', a: 'Non, mais plusieurs cantons l’exigent pour certains métiers réglementés, et de nombreux donneurs d’ordre la demandent systématiquement.' },
      { q: 'La RC professionnelle remplace-t-elle la garantie décennale d’un chantier ?', a: 'Non, ce sont deux mécanismes différents : la garantie légale couvre l’ouvrage, la RC pro couvre les dommages à des tiers.' },
      { q: 'Que risque une entreprise sans RC professionnelle en cas de sinistre ?', a: 'Le patrimoine de l’entreprise, voire personnel pour une entreprise individuelle, peut être directement engagé.' },
    ],
  },
  {
    path: 'blog/permis-construire-renovation-quand-necessaire',
    title: 'Permis de construire pour une rénovation : quand c’est nécessaire | Cantia',
    description:
      "Refaire une cuisine ou une salle de bains ne demande en principe pas de permis. Dès que la structure ou l’aspect extérieur changent, la donne change — selon le canton.",
    faq: [
      { q: 'Refaire une cuisine ou une salle de bains nécessite-t-il un permis ?', a: 'En principe non, tant que la structure porteuse et l’usage des locaux ne sont pas modifiés.' },
      { q: 'Quels travaux nécessitent presque toujours un permis ?', a: 'Tout ce qui touche à un mur porteur, à l’aspect extérieur ou à l’affectation d’un local.' },
      { q: 'Les règles de permis sont-elles les mêmes dans tous les cantons ?', a: 'Non, chaque canton fixe ses propres seuils de dispense et procédures.' },
    ],
  },
  {
    path: 'blog/contrat-entreprise-vs-mandat-artisan',
    title: 'Contrat d’entreprise vs mandat : la différence pour un artisan | Cantia',
    description:
      "Un artisan qui pose du carrelage est sous contrat d’entreprise (obligation de résultat). Un architecte qui conseille est souvent sous mandat (obligation de moyens).",
    faq: [
      { q: 'Un artisan du bâtiment travaille-t-il sous contrat d’entreprise ou mandat ?', a: 'Presque toujours sous contrat d’entreprise (art. 363 CO), qui engage sur un résultat.' },
      { q: 'Quelle est la principale différence pratique entre les deux régimes ?', a: 'Le contrat d’entreprise garantit un résultat ; le mandat n’engage que sur les moyens mis en œuvre.' },
      { q: 'Un même chantier peut-il combiner les deux types de contrat ?', a: 'Oui, un architecte sous mandat et des entreprises sous contrat d’entreprise coexistent fréquemment.' },
    ],
  },
  {
    path: 'blog/salaire-minimum-cct-construction-suisse',
    title: 'Salaire minimum bâtiment en Suisse : ce que fixe la CCT | Cantia',
    description:
      "Le salaire minimum du gros œuvre suisse est fixé par la Convention nationale du secteur principal de la construction, pas par une loi fédérale — et la CCT 2026-2031 change plusieurs règles.",
    faq: [
      { q: 'Existe-t-il un salaire minimum légal fédéral en Suisse ?', a: 'Non — dans le bâtiment, ce sont les CCT de branche qui fixent des minima contraignants.' },
      { q: 'Le salaire minimum du bâtiment est-il le même partout en Suisse ?', a: 'Non, il varie selon la région salariale et la qualification.' },
      { q: 'Qu’est-ce qui change avec la CCT construction 2026 ?', a: 'Les salaires restent globalement stables pour 2026 ; le vrai changement porte sur le régime des heures supplémentaires.' },
    ],
  },
  {
    path: 'blog/heures-supplementaires-batiment-majoration-25',
    title: 'Heures supplémentaires bâtiment : ce qui change avec la CCT 2026 | Cantia',
    description:
      "La nouvelle convention collective de la construction change le calcul des heures supplémentaires : jusqu’à 100h reportables, majoration de 25 % au-delà, seuil de 50h incluant les trajets.",
    faq: [
      { q: 'Le temps de trajet compte-t-il dans le calcul des heures supplémentaires ?', a: 'Oui depuis la CCT 2026-2031 : travail et trajets cumulés au-delà de 50h/semaine sont du travail supplémentaire.' },
      { q: 'Combien d’heures peut-on reporter sur l’année suivante ?', a: 'Jusqu’à 100 heures, au-delà elles doivent être payées avec une majoration de 25 %.' },
      { q: 'Heures supplémentaires et heures complémentaires sont-elles la même chose ?', a: 'Non, ce sont deux régimes de compensation distincts.' },
    ],
  },
  {
    path: 'blog/indemnites-kilometriques-2026-nouveau-taux',
    title: 'Indemnités kilométriques 2026 : le taux qui vient de changer | Cantia',
    description:
      "L’Administration fédérale des contributions relève le taux forfaitaire de CHF 0,70 à CHF 0,75/km au 1er janvier 2026 — avec une nouvelle obligation de déclaration.",
    faq: [
      { q: 'Quel est le nouveau taux d’indemnité kilométrique en 2026 ?', a: 'CHF 0,75 par kilomètre depuis le 1er janvier 2026, contre CHF 0,70 auparavant.' },
      { q: 'Une entreprise doit-elle obligatoirement appliquer ce taux ?', a: 'Non, elle reste libre de fixer un taux différent — CHF 0,75/km sert de référence par défaut.' },
      { q: 'Qu’est-ce qui doit désormais figurer sur le certificat de salaire ?', a: 'Une croix à la lettre F signalant le versement d’une indemnité forfaitaire véhicule.' },
    ],
  },
  {
    path: 'blog/calculer-13e-salaire-prorata-employe',
    title: 'Calculer le 13e salaire au prorata en cours d’année | Cantia',
    description:
      "Un employé engagé en avril n’a pas droit à un 13e salaire complet en décembre — le calcul au prorata se fait sur les mois réellement travaillés.",
    faq: [
      { q: 'Comment calculer un 13e salaire pour un employé arrivé en cours d’année ?', a: 'En multipliant le 13e salaire plein par le nombre de mois travaillés divisé par 12.' },
      { q: 'Un employé parti en cours d’année a-t-il droit à un 13e salaire au prorata ?', a: 'Oui, c’est une créance due au moment de son départ.' },
      { q: 'Une absence maladie réduit-elle le 13e salaire au prorata ?', a: 'Cela dépend du contrat et de la CCT applicable.' },
    ],
  },
  {
    path: 'blog/chantier-complet-peut-etre-en-perte-taux-horaire',
    title: 'Un chantier « réussi » peut quand même être en perte | Cantia',
    description:
      "Un chantier livré dans les temps, payé intégralement, peut malgré tout être en perte réelle si le coût horaire employé n’a jamais été comparé aux heures effectivement passées.",
    faq: [
      { q: 'Comment un chantier payé intégralement peut-il être en perte ?', a: 'Si les heures réellement passées dépassent significativement les heures devisées.' },
      { q: 'Pourquoi ce type de perte passe-t-il souvent inaperçu ?', a: 'Parce que la comptabilité générale reste positive grâce à d’autres chantiers plus rentables.' },
      { q: 'À quel moment faut-il vérifier si un chantier dérape en heures ?', a: 'En cours de chantier, pas à la clôture.' },
    ],
  },
  {
    path: 'blog/gerer-plusieurs-chantiers-en-parallele-methode',
    title: 'Gérer plusieurs chantiers en parallèle sans rien perdre | Cantia',
    description:
      "Passer de un à trois chantiers simultanés change la nature du travail : ce n’est plus une question de bras, c’est une question de mémoire et de coordination.",
    faq: [
      { q: 'Pourquoi gérer plusieurs chantiers est-il plus difficile que multiplier un seul chantier ?', a: 'Parce que la difficulté est la coordination et la mémoire des informations, pas la charge de travail.' },
      { q: 'Quel est le signe qu’une entreprise a besoin d’un meilleur système de suivi ?', a: 'Des questions récurrentes comme « c’était pour quel chantier ? ».' },
      { q: 'Un planning WhatsApp suffit-il pour gérer plusieurs chantiers ?', a: 'Ça fonctionne un temps, mais l’information s’y perd vite sans structure par chantier.' },
    ],
  },
  {
    path: 'blog/whatsapp-gestion-equipe-chantier-limites',
    title: 'WhatsApp pour gérer une équipe de chantier : les limites | Cantia',
    description:
      "WhatsApp fonctionne très bien pour deux ou trois personnes. Au-delà, l’information se noie dans le défilement des messages — voici pourquoi, et ce qui prend le relais.",
    faq: [
      { q: 'WhatsApp suffit-il pour gérer une petite équipe de chantier ?', a: 'Pour deux ou trois personnes et un chantier à la fois, oui.' },
      { q: 'Quel est le principal problème de WhatsApp pour plusieurs chantiers ?', a: 'L’absence de structure : aucun lien entre un message et le chantier concerné.' },
      { q: 'Faut-il abandonner WhatsApp complètement ?', a: 'Pas nécessairement — il reste efficace pour l’urgence ponctuelle.' },
    ],
  },
  {
    path: 'blog/devis-oral-valeur-legale-suisse',
    title: 'Devis accepté à l’oral : ça engage, mais ça ne se prouve pas | Cantia',
    description:
      "En droit suisse, un accord oral vaut contrat — le Code des obligations n’exige aucune forme écrite par défaut. Le problème n’est jamais la validité, c’est la preuve.",
    faq: [
      { q: 'Un accord oral pour des travaux est-il valable en droit suisse ?', a: 'Oui — l’art. 11 CO n’exige aucune forme particulière par défaut pour un contrat d’entreprise.' },
      { q: 'Quel est le principal risque d’un devis accepté uniquement à l’oral ?', a: 'La preuve, pas la validité : en cas de désaccord, il devient difficile de démontrer ce qui a été dit.' },
      { q: 'Un simple message écrit suffit-il à sécuriser un accord oral ?', a: 'Dans la majorité des cas pratiques, oui.' },
    ],
  },
  {
    path: 'blog/signature-electronique-devis-suisse-valeur-legale',
    title: 'Signer un devis en ligne : ce que ça vaut devant la loi | Cantia',
    description:
      "La signature électronique simple vaut acceptation contractuelle pour la quasi-totalité des devis du bâtiment. La signature qualifiée n’est nécessaire que dans des cas précis.",
    faq: [
      { q: 'Une signature électronique simple suffit-elle pour un devis de travaux ?', a: 'Oui, dans la quasi-totalité des cas.' },
      { q: 'Quand faut-il une signature électronique qualifiée plutôt que simple ?', a: 'Uniquement pour les actes exigeant légalement une forme écrite qualifiée, rare pour un devis du bâtiment.' },
      { q: 'Un devis signé électroniquement vaut-il plus qu’un PDF imprimé et signé à la main ?', a: 'Les deux ont une valeur de preuve comparable pour un contrat sans forme requise.' },
    ],
  },
  {
    path: 'blog/client-refuse-payer-solde-final-que-faire',
    title: 'Un client refuse de payer le solde final : la méthode | Cantia',
    description:
      "Un refus de paiement sur le solde final n’est presque jamais définitif — c’est souvent un désaccord sur un point précis. Distinguer les deux change toute la stratégie.",
    faq: [
      { q: 'Un client peut-il retenir tout le solde pour un défaut mineur ?', a: 'Une retenue doit rester proportionnée au défaut réel.' },
      { q: 'Quelle est la première étape face à un refus de paiement du solde final ?', a: 'Demander par écrit la raison précise du refus.' },
      { q: 'À quel moment envisager une procédure de poursuite ?', a: 'En dernier recours, après une mise en demeure formelle restée sans réponse.' },
    ],
  },
  {
    path: 'blog/avenant-chantier-plus-value-moins-value',
    title: 'Facturer un avenant en cours de chantier sans se faire piéger | Cantia',
    description:
      "Un client qui demande un changement en cours de chantier ne signe presque jamais d’avenant écrit sur le moment — ce qui transforme un service rendu en travail gratuit.",
    faq: [
      { q: 'Faut-il facturer une petite plus-value demandée en cours de chantier ?', a: 'Oui, systématiquement, pour maintenir une référence claire.' },
      { q: 'Quand faut-il faire valider le prix d’un avenant ?', a: 'Avant de démarrer le travail supplémentaire, pas après.' },
      { q: 'Une moins-value doit-elle aussi être documentée par écrit ?', a: 'Oui, pour éviter toute contestation ultérieure sur le montant final.' },
    ],
  },
  {
    path: 'blog/travail-au-noir-batiment-suisse-risques-controles',
    title: 'Travail au noir dans le bâtiment : ce que risque une entreprise | Cantia',
    description:
      "Le secteur de la construction fait partie des branches les plus contrôlées par la LTN. Plus de 14’000 contrôles d’entreprises ont eu lieu en 2025.",
    faq: [
      { q: 'La construction est-elle particulièrement contrôlée en Suisse ?', a: 'Oui, c’est l’une des branches prioritaires des contrôles LTN.' },
      { q: 'Quelle est la sanction la plus lourde en cas de travail au noir constaté ?', a: 'L’exclusion des marchés publics et la suppression d’aides financières.' },
      { q: 'Une entreprise risque-t-elle quelque chose si son sous-traitant est en infraction ?', a: 'Elle peut se retrouver associée au problème sur son propre chantier.' },
    ],
  },
  {
    path: 'blog/assurance-perte-de-gain-maladie-independant-batiment',
    title: 'Arrêt maladie indépendant : ce qui n’est PAS couvert | Cantia',
    description:
      "La LAMal paie les soins, jamais le revenu perdu. Sans assurance perte de gain maladie souscrite volontairement, un indépendant en arrêt n’a droit à aucun revenu de remplacement.",
    faq: [
      { q: 'La LAMal couvre-t-elle la perte de revenu en cas de maladie pour un indépendant ?', a: 'Non, elle ne couvre que les soins médicaux.' },
      { q: 'Un indépendant est-il obligé de souscrire une assurance perte de gain maladie ?', a: 'Non, cette assurance reste facultative.' },
      { q: 'Que se passe-t-il pour un indépendant sans couverture en cas d’arrêt prolongé ?', a: 'Il ne perçoit aucun revenu de remplacement.' },
    ],
  },
  {
    path: 'blog/photos-chantier-preuve-juridique-litige',
    title: 'Photos de chantier : la preuve la plus solide, si bien prise | Cantia',
    description:
      "Une photo de chantier vaut comme preuve devant un tribunal civil suisse — à condition d’être datée, contextualisée et conservée correctement.",
    faq: [
      { q: 'Une photo de chantier a-t-elle une vraie valeur de preuve devant un tribunal ?', a: 'Oui, si elle est datée de façon fiable et contextualisée.' },
      { q: 'À quels moments du chantier est-il le plus utile de prendre des photos ?', a: 'Avant travaux, avant fermeture d’éléments, et à la réception finale.' },
      { q: 'Pourquoi des photos sur des téléphones personnels sont-elles peu utilisables ?', a: 'Par manque de centralisation et d’horodatage fiable.' },
    ],
  },
  {
    path: 'blog/difference-devis-offre-facture-pro-forma',
    title: 'Devis, offre, facture pro forma : trois usages différents | Cantia',
    description:
      "Les trois termes s’utilisent souvent l’un pour l’autre dans le bâtiment suisse alors qu’ils n’engagent pas de la même façon.",
    faq: [
      { q: 'Un devis et une offre sont-ils la même chose dans le bâtiment ?', a: 'Oui dans la pratique.' },
      { q: 'Une facture pro forma engage-t-elle le client à payer ?', a: 'Non, c’est un document purement informatif.' },
      { q: 'Quelle est la différence entre un devis accepté et une vraie facture ?', a: 'Le devis accepté forme le contrat ; la facture crée une créance exigible.' },
    ],
  },
  {
    path: 'blog/logiciel-gestion-chantier-independant-seul',
    title: 'Logiciel de gestion de chantier en solo : utile ou pas ? | Cantia',
    description:
      "La plupart des outils de gestion de chantier ciblent des équipes. Un indépendant seul a des besoins différents mais tout aussi réels.",
    faq: [
      { q: 'Un logiciel de gestion de chantier est-il utile pour un indépendant sans équipe ?', a: 'Oui, surtout pour le temps administratif récupéré.' },
      { q: 'À partir de combien de devis par mois l’outil devient-il rentable ?', a: 'Dès quelques devis mensuels.' },
      { q: 'Quelles fonctionnalités restent inutiles pour un indépendant seul ?', a: 'Un planning d’équipe multi-personnes ou un système de permissions par rôle.' },
    ],
  },
  {
    path: 'blog/contrat-ecrit-petits-travaux-quand-necessaire',
    title: 'Petits travaux : quand un écrit devient nécessaire | Cantia',
    description:
      "Aucun seuil légal n’impose l’écrit pour un contrat d’entreprise en Suisse. Mais un seuil pratique existe bel et bien.",
    faq: [
      { q: 'Existe-t-il un montant à partir duquel un contrat écrit devient obligatoire ?', a: 'Non, aucun seuil légal n’existe en droit suisse.' },
      { q: 'Pourquoi formaliser par écrit même de petits travaux ?', a: 'Parce que le coût d’un désaccord de mémoire dépasse vite l’effort de rédaction.' },
      { q: 'Un simple SMS de confirmation suffit-il ?', a: 'Dans la plupart des cas pratiques, oui.' },
    ],
  },
  {
    path: 'blog/appel-offres-marches-publics-batiment-suisse',
    title: 'Marchés publics du bâtiment : ce qu’il faut savoir | Cantia',
    description:
      "Dès CHF 2 millions pour des travaux de construction, un marché public doit être publié sur SIMAP selon les seuils AIMP.",
    faq: [
      { q: 'À partir de quel montant un marché de construction doit-il être publié sur SIMAP ?', a: 'Autour de CHF 2 millions selon les seuils AIMP.' },
      { q: 'Les petits chantiers publics sont-ils accessibles aux petites entreprises ?', a: 'Oui, via des procédures de gré à gré sous le seuil de publication.' },
      { q: 'Le prix est-il le seul critère d’adjudication ?', a: 'Non, les critères sont généralement pondérés.' },
    ],
  },
  {
    path: 'blog/estimer-chantier-a-distance-devis-photo',
    title: 'Estimer un chantier à distance : jusqu’où c’est raisonnable | Cantia',
    description:
      "Un déplacement pour chaque demande de prix coûte du temps. Certaines estimations à distance sont fiables ; d’autres sont un pari risqué.",
    faq: [
      { q: 'Peut-on établir un devis ferme uniquement sur la base de photos ?', a: 'C’est risqué pour tout ce qui touche à l’état structurel existant.' },
      { q: 'Quels travaux se prêtent le mieux à une estimation à distance ?', a: 'Les remplacements à l’identique avec dimensions mesurables.' },
      { q: 'Comment limiter le risque d’une estimation à distance fausse ?', a: 'En la présentant comme indicative, non contractuelle.' },
    ],
  },
  {
    path: 'blog/resiliation-contrat-entreprise-chantier-en-cours',
    title: 'Résiliation d’un contrat d’entreprise en cours de chantier (art. 377 CO) | Cantia',
    description:
      "Un maître d’ouvrage peut résilier un contrat d’entreprise à tout moment, même en plein chantier — mais l’art. 377 CO lui impose de vous indemniser intégralement.",
    faq: [
      { q: 'Un client peut-il résilier un contrat de chantier sans raison ?', a: 'Oui, l’art. 377 CO le permet à tout moment tant que l’ouvrage n’est pas terminé.' },
      { q: 'Que doit payer le client qui résilie un chantier en cours ?', a: 'Le travail déjà exécuté, les dépenses engagées, et le gain manqué sur la part non réalisée.' },
      { q: 'Faut-il un motif écrit pour que la résiliation soit valable ?', a: 'Non, mais une notification claire et datée fixe le point de départ du calcul de l’indemnisation.' },
    ],
  },
  {
    path: 'blog/hypotheque-legale-artisans-entrepreneurs-suisse',
    title: 'Hypothèque légale des artisans et entrepreneurs : délai de 4 mois | Cantia',
    description:
      "L’hypothèque légale (art. 837 CC) garantit le paiement de vos travaux sur l’immeuble lui-même — mais elle doit être inscrite au registre foncier dans un délai de 4 mois.",
    faq: [
      { q: 'Qu’est-ce que l’hypothèque légale des artisans et entrepreneurs ?', a: 'Un droit de gage sur l’immeuble construit ou rénové, garantissant le paiement des travaux.' },
      { q: 'Quel est le délai pour l’inscrire ?', a: 'Quatre mois à compter de l’achèvement des travaux, sinon le droit s’éteint définitivement.' },
      { q: 'Un sous-traitant peut-il demander une hypothèque légale ?', a: 'Oui, indépendamment d’un lien contractuel direct avec le propriétaire de l’immeuble.' },
    ],
  },
  {
    path: 'blog/reception-travaux-proces-verbal-chantier',
    title: 'Réception des travaux : pourquoi le procès-verbal est essentiel | Cantia',
    description:
      "La réception des travaux déclenche le délai de garantie et fige les défauts constatés. Sans procès-verbal écrit, ce moment charnière devient impossible à prouver.",
    faq: [
      { q: 'La réception des travaux doit-elle obligatoirement être écrite ?', a: 'Pas de formalisme strict, mais sans écrit, prouver la date et les défauts devient très difficile.' },
      { q: 'Que se passe-t-il si le client refuse de signer le procès-verbal ?', a: 'L’entrepreneur peut l’établir unilatéralement et le notifier au client.' },
      { q: 'Quel est l’effet principal de la réception sur les garanties ?', a: 'Elle déclenche le point de départ du délai de garantie (2 ou 5 ans).' },
    ],
  },
  {
    path: 'blog/poursuite-facture-impayee-procedure-suisse',
    title: 'Facture impayée : la procédure de poursuite en Suisse | Cantia',
    description:
      "Réquisition de poursuite, commandement de payer, opposition, mainlevée : voici comment fonctionne une poursuite pour facture impayée, étape par étape.",
    faq: [
      { q: 'Faut-il un avocat pour lancer une poursuite en Suisse ?', a: 'Non, pour une créance simple et documentée, la démarche se fait sans représentation obligatoire.' },
      { q: 'Que se passe-t-il en cas d’opposition au commandement de payer ?', a: 'Il faut demander la mainlevée au tribunal pour la faire lever.' },
      { q: 'Une poursuite garantit-elle d’être payé ?', a: 'Non, elle peut se terminer par un acte de défaut de biens si le débiteur est insolvable.' },
    ],
  },
  {
    path: 'blog/mentions-obligatoires-facture-suisse-tva',
    title: 'Facture suisse : les mentions obligatoires côté TVA | Cantia',
    description:
      "Numéro TVA, taux applicable, date de prestation, référence QR : une facture incomplète peut être refusée en comptabilité ou contestée par un client.",
    faq: [
      { q: 'Le numéro IDE est-il obligatoire sur toute facture suisse ?', a: 'Oui, dès qu’une entreprise est assujettie à la TVA.' },
      { q: 'Quel taux de TVA s’applique aux travaux du bâtiment en Suisse ?', a: 'Le taux normal de 8,1 % s’applique à la majorité des prestations du bâtiment.' },
      { q: 'Une facture sans TVA détaillée est-elle valable ?', a: 'Au-delà de CHF 400.-, le taux et le montant de TVA doivent apparaître clairement.' },
    ],
  },
  {
    path: 'blog/devis-gratuit-ou-payant-que-dit-la-loi',
    title: 'Devis gratuit ou payant : ce que la loi suisse impose (rien) | Cantia',
    description:
      "Aucune loi suisse n’oblige un artisan à établir un devis gratuit — c’est un usage du marché, pas une obligation légale.",
    faq: [
      { q: 'La loi suisse oblige-t-elle à faire des devis gratuits ?', a: 'Non, aucune loi ne l’impose — c’est un usage du marché.' },
      { q: 'Peut-on déduire le prix d’un devis facturé du montant final ?', a: 'Oui, c’est une pratique courante et bien acceptée par les clients.' },
      { q: 'Faut-il prévenir le client avant de facturer un devis ?', a: 'Oui, dans les faits c’est indispensable pour éviter un litige commercial.' },
    ],
  },
  {
    path: 'blog/licenciement-ouvrier-batiment-delai-conge-cct',
    title: 'Licenciement dans le bâtiment : délais de congé CCT et CO | Cantia',
    description:
      "Le délai de congé d’un ouvrier du bâtiment dépend de son ancienneté et de la CCT applicable — se tromper expose à devoir indemniser la différence.",
    faq: [
      { q: 'Quel est le délai de congé légal pour 3 ans d’ancienneté ?', a: 'Deux mois pour la fin d’un mois selon l’art. 335c CO, sauf disposition CCT plus favorable.' },
      { q: 'Peut-on licencier un employé en arrêt maladie ?', a: 'Non, le congé donné pendant une période de protection est nul.' },
      { q: 'La CCT peut-elle prévoir un délai plus long que le CO ?', a: 'Oui, et dans ce cas elle prime sur le régime légal supplétif.' },
    ],
  },
  {
    path: 'blog/accident-travail-chantier-obligations-employeur-suva',
    title: 'Accident de travail sur chantier : obligations envers la SUVA | Cantia',
    description:
      "Déclaration dans les délais, salaire pendant l’incapacité, reprise du travail : un accident de chantier déclenche des obligations précises pour l’employeur.",
    faq: [
      { q: 'Qui paie le salaire les premiers jours après un accident ?', a: 'L’employeur continue à verser le salaire durant une courte période, avant la prise en charge SUVA.' },
      { q: 'Faut-il déclarer un accident même léger à la SUVA ?', a: 'Oui, dès qu’il entraîne une incapacité de travail ou des soins médicaux.' },
      { q: 'La SUVA est-elle obligatoire dans la construction ?', a: 'Oui, sans possibilité de choisir un autre assureur pour cette couverture.' },
    ],
  },
  {
    path: 'blog/apprenti-batiment-salaire-obligations-employeur',
    title: 'Apprenti dans le bâtiment : salaire et obligations employeur | Cantia',
    description:
      "Former un apprenti implique un salaire progressif fixé par la CCT, un encadrement pédagogique réel et une autorisation cantonale.",
    faq: [
      { q: 'Le salaire d’un apprenti du bâtiment est-il négociable ?', a: 'Non, il suit une grille fixée par la CCT du métier, progressive selon l’année de formation.' },
      { q: 'Faut-il une autorisation pour former un apprenti ?', a: 'Oui, une autorisation de former délivrée par l’autorité cantonale compétente.' },
      { q: 'Un apprenti a-t-il droit à un 13e salaire prorata ?', a: 'En général oui, selon les mêmes règles que les employés qualifiés.' },
    ],
  },
  {
    path: 'blog/vacances-non-prises-fin-annee-batiment-cct',
    title: 'Vacances non prises en fin d’année dans le bâtiment | Cantia',
    description:
      "Le solde de vacances non prises pose une vraie question de droit du travail — les vacances doivent être prises en nature, pas simplement payées.",
    faq: [
      { q: 'Peut-on payer les vacances non prises au lieu de les faire poser ?', a: 'En principe non tant que les rapports de travail durent, sauf cas particuliers.' },
      { q: 'Un employé peut-il reporter ses vacances sur l’année suivante ?', a: 'Oui, dans une mesure raisonnable, mais pas indéfiniment.' },
      { q: 'Qui décide de la date des vacances ?', a: 'L’employeur, en tenant compte des désirs de l’employé dans la mesure compatible avec l’entreprise.' },
    ],
  },
  {
    path: 'blog/calculer-prix-horaire-reel-ouvrier-batiment',
    title: 'Le vrai coût horaire d’un ouvrier du bâtiment | Cantia',
    description:
      "Un devis chiffré sur le seul salaire brut sous-estime systématiquement le vrai coût horaire — charges sociales et temps non facturable doivent entrer dans le calcul.",
    faq: [
      { q: 'Faut-il inclure les charges sociales dans le calcul du coût horaire ?', a: 'Oui, elles représentent généralement 15 à 20 % du salaire brut.' },
      { q: 'Combien d’heures un ouvrier travaille-t-il réellement par an ?', a: 'Autour de 1750 heures facturables en moyenne, une fois absences déduites.' },
      { q: 'Pourquoi le taux horaire de référence est-il souvent trop bas ?', a: 'Parce qu’il est hérité d’une pratique ancienne jamais recalculée.' },
    ],
  },
  {
    path: 'blog/pourquoi-entreprises-batiment-font-faillite-suisse',
    title: 'Pourquoi des entreprises du bâtiment en activité font faillite | Cantia',
    description:
      "Avoir du travail ne suffit pas — les causes les plus fréquentes de faillite dans le bâtiment sont un problème de trésorerie et de marge invisible.",
    faq: [
      { q: 'Un bon carnet de commandes protège-t-il de la faillite ?', a: 'Non, la cause la plus fréquente est un problème de trésorerie ou de marge non mesurée.' },
      { q: 'Pourquoi un chantier rentable peut-il créer une rupture de trésorerie ?', a: 'Parce que les charges se paient mensuellement alors que les clients règlent à 30-90 jours.' },
      { q: 'Quel est le meilleur indicateur de santé financière ?', a: 'La rentabilité mesurée chantier par chantier, pas le chiffre d’affaires global.' },
    ],
  },
  {
    path: 'blog/retard-chantier-meteo-obligations-contractuelles',
    title: 'Retard de chantier causé par la météo : qui est responsable ? | Cantia',
    description:
      "Un délai contractuel dépassé à cause d’intempéries n’est pas automatiquement une faute de l’entrepreneur — mais encore faut-il pouvoir le prouver.",
    faq: [
      { q: 'Un entrepreneur est-il responsable d’un retard causé par la météo ?', a: 'En principe non, tant que le retard reste raisonnable et a été communiqué au client.' },
      { q: 'Faut-il prévenir le client d’un retard dès qu’il devient probable ?', a: 'Oui, c’est la meilleure protection contractuelle.' },
      { q: 'Un relevé météo officiel suffit-il à justifier un retard ?', a: 'Une trace datée de ce qui s’est passé sur le chantier est souvent plus convaincante.' },
    ],
  },
  {
    path: 'blog/excel-vs-logiciel-gestion-chantier-limites',
    title: 'Excel pour gérer ses chantiers : jusqu’où ça tient | Cantia',
    description:
      "Excel fonctionne bien à petite échelle — jusqu’à ce qu’un deuxième employé le modifie en même temps, ou qu’un devis oublié coûte cher.",
    faq: [
      { q: 'Excel est-il suffisant pour une petite entreprise du bâtiment ?', a: 'Pour un usage ponctuel oui, mais les limites deviennent vite problématiques à l’échelle.' },
      { q: 'Quel est le principal risque d’Excel pour la gestion de chantier ?', a: 'L’absence de trace fiable des modifications et de lien automatique devis-facture-paiement.' },
      { q: 'À partir de quand faut-il un vrai logiciel de gestion ?', a: 'Dès que plusieurs chantiers ou plusieurs personnes accèdent aux mêmes informations en même temps.' },
    ],
  },
  {
    path: 'blog/combien-coute-logiciel-gestion-chantier-roi',
    title: 'Logiciel de gestion de chantier : ce qu’il coûte et rapporte | Cantia',
    description:
      "Le prix affiché d’un abonnement n’est qu’une partie du calcul — voici comment évaluer le retour réel d’un logiciel de gestion pour une entreprise du bâtiment.",
    faq: [
      { q: 'Comment évaluer si un logiciel de gestion est rentable ?', a: 'En comparant le temps administratif perdu, valorisé au taux horaire réel, au coût de l’abonnement.' },
      { q: 'Quel est le principal gain d’un logiciel de gestion ?', a: 'Le temps administratif récupéré sur les devis, factures et rapprochements manuels.' },
      { q: 'Un abonnement payant est-il nécessaire dès le départ ?', a: 'Pas forcément, un plan gratuit permet souvent de mesurer le gain réel avant d’investir.' },
    ],
  },
  {
    path: 'blog/assurance-chantier-tous-risques-ectr-obligatoire',
    title: 'Assurance chantier tous risques (ECTR) : obligatoire ou pas ? | Cantia',
    description:
      "Contrairement à la RC professionnelle, l’ECTR n’est imposée par aucune loi fédérale — mais son absence peut coûter très cher en cas de sinistre.",
    faq: [
      { q: 'L’ECTR est-elle obligatoire en Suisse ?', a: 'Non, aucune loi fédérale ne l’impose, mais son absence expose fortement les intervenants.' },
      { q: 'Qui souscrit généralement l’ECTR ?', a: 'Le plus souvent le maître d’ouvrage, au bénéfice de tous les intervenants du chantier.' },
      { q: 'L’ECTR remplace-t-elle la RC professionnelle ?', a: 'Non, ce sont deux couvertures différentes.' },
    ],
  },
  {
    path: 'blog/planning-chantier-eviter-conflits-ressources',
    title: 'Conflits de planning entre chantiers : comment les éviter | Cantia',
    description:
      "Un ouvrier ou une machine réservés deux fois le même jour sur deux chantiers différents — un classique quand le planning vit dans plusieurs têtes.",
    faq: [
      { q: 'Pourquoi les conflits de planning arrivent-ils même en équipe organisée ?', a: 'Parce que le planning existe souvent dans plusieurs endroits séparés, sans vue partagée.' },
      { q: 'Quel est le vrai coût d’un conflit de planning ?', a: 'Un trajet perdu, un client mécontent, et une improvisation plus coûteuse que le temps gagné.' },
      { q: 'Un planning centralisé suffit-il à éviter tous les conflits ?', a: 'Il réduit fortement le risque, à condition d’être mis à jour dès qu’un changement survient.' },
    ],
  },
  {
    path: 'blog/application-hors-ligne-chantier-pourquoi-important',
    title: 'Application de chantier sans réseau : le mode hors ligne | Cantia',
    description:
      "Un sous-sol en béton, une vallée mal couverte, un chantier isolé — le réseau mobile n’est jamais garanti sur un chantier.",
    faq: [
      { q: 'Pourquoi le réseau mobile n’est-il pas fiable sur un chantier ?', a: 'Structures en béton, sous-sols, zones rurales ou saturation locale du réseau.' },
      { q: 'Que se passe-t-il sans mode hors ligne ?', a: 'Photos et rapports risquent d’être perdus, poussant l’équipe à abandonner l’outil.' },
      { q: 'Un vrai mode hors ligne synchronise-t-il automatiquement ?', a: 'Oui, dès que le réseau revient, sans action manuelle de l’utilisateur.' },
    ],
  },
  {
    path: 'blog/facturation-heures-regie-batiment-comment-faire',
    title: 'Facturer en régie dans le bâtiment sans être contesté | Cantia',
    description:
      "Un travail facturé au temps passé plutôt qu’à prix fixe expose davantage à la contestation client — sauf si le détail est réellement traçable.",
    faq: [
      { q: 'Une facture en régie doit-elle détailler les heures jour par jour ?', a: 'Oui, un total global sans détail est bien plus contestable qu’un relevé précis.' },
      { q: 'Faut-il un accord écrit avant de facturer en régie ?', a: 'Pas obligatoire légalement, mais fortement recommandé pour éviter les litiges.' },
      { q: 'Comment se protéger si un client conteste les heures facturées ?', a: 'Avec un relevé d’heures horodaté, saisi au fur et à mesure.' },
    ],
  },
  {
    path: 'blog/sous-effectif-chantier-recruter-ou-sous-traiter',
    title: 'Manque de main-d’œuvre : recruter ou sous-traiter ? | Cantia',
    description:
      "Refuser des chantiers faute de personnel est un mauvais calcul, mais recruter trop vite en est un autre — voici comment trancher.",
    faq: [
      { q: 'Comment savoir s’il faut recruter plutôt que sous-traiter ?', a: 'Si la surcharge est structurelle et concerne une compétence centrale au métier.' },
      { q: 'Quel est le principal risque d’un recrutement précipité ?', a: 'Un salaire fixe qui pèse sur la trésorerie une fois le pic d’activité retombé.' },
      { q: 'La sous-traitance est-elle adaptée à un besoin ponctuel ?', a: 'Oui, elle convient bien à un pic limité dans le temps sans engagement long terme.' },
    ],
  },
  {
    path: 'blog/meilleur-logiciel-devis-facture-batiment-suisse-2026',
    title: 'Meilleur logiciel de devis et facturation bâtiment Suisse | Cantia',
    description:
      "QR-facture native, catalogue de prix, suivi par chantier, hors-ligne sur le terrain : les critères concrets pour choisir un logiciel de devis et facturation adapté au bâtiment suisse.",
    faq: [
      { q: 'Un logiciel de facturation généraliste suffit-il pour une entreprise du bâtiment ?', a: 'Rarement — la plupart n’ont pas de QR-facture native ni de lien devis/chantier.' },
      { q: 'Quel est le critère le plus important pour un logiciel bâtiment en Suisse ?', a: 'La QR-facture native conforme, couplée à un suivi par chantier.' },
      { q: 'Le logiciel doit-il fonctionner hors connexion ?', a: 'Idéalement oui, le réseau n’est jamais garanti sur un chantier.' },
    ],
  },
  {
    path: 'blog/logiciel-facturation-qr-facture-comparatif-suisse',
    title: 'Logiciel de facturation QR-facture : comparatif Suisse | Cantia',
    description:
      "Beaucoup d'outils affichent « QR-facture compatible » sans respecter la norme dans le détail — voici ce qui distingue un vrai support d'un module bricolé.",
    faq: [
      { q: 'Quelle est la différence entre IBAN et QR-IBAN ?', a: 'Le QR-IBAN est dédié aux QR-factures avec référence QR structurée (QRR).' },
      { q: 'Pourquoi une QR-facture peut-elle échouer au scan ?', a: 'Une adresse non structurée ou une zone de quiétude insuffisante peuvent bloquer le scan.' },
      { q: 'Depuis quand l’adresse structurée est-elle obligatoire ?', a: 'Depuis la norme 2.3 en novembre 2025, obligatoire dès le 30 septembre 2026.' },
    ],
  },
  {
    path: 'blog/crm-artisan-batiment-pourquoi-utile',
    title: 'CRM pour artisan du bâtiment : utile ou superflu ? | Cantia',
    description:
      "Un artisan qui gère 30, 50 ou 100 clients a le même problème de mémoire qu'un commercial — voici quand un CRM devient réellement utile.",
    faq: [
      { q: 'Un artisan indépendant a-t-il besoin d’un CRM ?', a: 'Dès qu’il devient difficile de se souvenir de l’historique de chaque client sans chercher dans ses e-mails.' },
      { q: 'Quelle est la différence entre un CRM et un carnet d’adresses ?', a: 'Un CRM relie l’historique complet (devis, factures, chantiers) à chaque client.' },
      { q: 'Faut-il un logiciel séparé pour le CRM et la facturation ?', a: 'Pas nécessairement, un outil qui relie nativement les deux évite la double saisie.' },
    ],
  },
  {
    path: 'blog/duree-validite-devis-non-signe-combien-temps',
    title: 'Combien de temps un devis reste valable en Suisse | Cantia',
    description:
      "Sans mention explicite, un devis non signé n'a pas de durée de validité légale fixe — ce qui expose l'entreprise à devoir honorer un ancien prix.",
    faq: [
      { q: 'Un devis a-t-il une durée de validité légale fixe en Suisse ?', a: 'Non, sans mention explicite le devis peut rester valable indéfiniment.' },
      { q: 'Quelle durée de validité choisir pour un devis de travaux ?', a: '30 jours est l’usage le plus courant dans le bâtiment suisse.' },
      { q: 'Que se passe-t-il si un client accepte un devis après sa date de validité ?', a: 'L’entreprise peut demander une réévaluation du prix.' },
    ],
  },
  {
    path: 'blog/note-de-credit-facture-rectificative-suisse',
    title: 'Corriger une facture envoyée : note de crédit en Suisse | Cantia',
    description:
      "Une erreur sur une facture déjà envoyée ne se corrige jamais en éditant le PDF original — voici la bonne méthode, conforme à la comptabilité suisse.",
    faq: [
      { q: 'Peut-on modifier une facture déjà envoyée à un client ?', a: 'Non, toute correction doit passer par une note de crédit suivie d’une nouvelle facture.' },
      { q: 'Qu’est-ce qu’une note de crédit exactement ?', a: 'Un document qui annule tout ou partie d’une facture déjà émise.' },
      { q: 'Faut-il une note de crédit pour une simple faute de frappe ?', a: 'Pas nécessairement si le montant et la TVA ne changent pas.' },
    ],
  },
  {
    path: 'blog/prescription-facture-impayee-delai-10-ans',
    title: 'Prescription d’une facture impayée en Suisse : le délai | Cantia',
    description:
      "Une créance contractuelle se prescrit en principe par 10 ans en Suisse — mais des actes interruptifs existent, à ne jamais laisser filer.",
    faq: [
      { q: 'Au bout de combien de temps une créance se prescrit-elle en Suisse ?', a: 'En principe 10 ans pour une créance contractuelle (art. 127 CO).' },
      { q: 'Une relance amiable interrompt-elle la prescription ?', a: 'Non, seuls une poursuite, une reconnaissance de dette ou une action en justice l’interrompent.' },
      { q: 'Que se passe-t-il quand une créance est prescrite ?', a: 'Le débiteur peut légalement refuser de payer en invoquant la prescription.' },
    ],
  },
  {
    path: 'blog/numerotation-facture-obligations-legales-suisse',
    title: 'Numérotation des factures en Suisse : la continuité | Cantia',
    description:
      "Un numéro de facture sauté ou réutilisé attire immédiatement l'attention lors d'un contrôle fiscal — la continuité numérique est l'un des premiers points vérifiés.",
    faq: [
      { q: 'La numérotation continue des factures est-elle obligatoire en Suisse ?', a: 'L’AFC attend une série chronologique et traçable, vérifiée en cas de contrôle.' },
      { q: 'Peut-on réutiliser un numéro de facture annulée ?', a: 'Non, une facture annulée doit rester identifiable avec une note de crédit associée.' },
      { q: 'Que risque une entreprise avec une numérotation désordonnée ?', a: 'Un contrôle fiscal peut interpréter les incohérences comme un signe de dissimulation.' },
    ],
  },
  {
    path: 'blog/difference-sia-108-sia-118-devis-contrat',
    title: 'SIA 108 vs SIA 118 : deux normes, deux rôles différents | Cantia',
    description:
      "La SIA 118 régit les relations avec l'entrepreneur, la SIA 108 celles avec les mandataires — les confondre expose à appliquer les mauvaises règles.",
    faq: [
      { q: 'Quelle norme SIA s’applique à un artisan qui exécute des travaux ?', a: 'La SIA 118, qui régit le contrat d’entreprise.' },
      { q: 'Les normes SIA s’appliquent-elles automatiquement à un chantier ?', a: 'Non, elles doivent être explicitement mentionnées dans le contrat ou le devis.' },
      { q: 'Quelle est la différence de régime entre les deux normes ?', a: 'La SIA 118 repose sur une obligation de résultat, la SIA 108 sur une obligation de moyens.' },
    ],
  },
  {
    path: 'blog/degats-voisinage-chantier-qui-est-responsable',
    title: 'Dégâts au voisinage causés par un chantier : qui paie ? | Cantia',
    description:
      "Une fissure chez le voisin après des travaux, de la poussière sur une façade : la responsabilité n'est pas automatique, et se prouve avec un état des lieux préalable.",
    faq: [
      { q: 'Qui est responsable des dégâts causés à un voisin par un chantier ?', a: 'L’entrepreneur répond de sa propre exécution fautive.' },
      { q: 'Comment se protéger contre une accusation de dégât non fondée ?', a: 'En réalisant un état des lieux contradictoire, avec photos datées, avant travaux.' },
      { q: 'L’assurance RC professionnelle couvre-t-elle les dégâts au voisinage ?', a: 'En général oui, si le dommage est correctement documenté.' },
    ],
  },
  {
    path: 'blog/retenue-de-garantie-chantier-consignation',
    title: 'Retenue de garantie sur un chantier : ce qu’elle couvre | Cantia',
    description:
      "Un maître d'ouvrage retient parfois 5 à 10 % du montant final — une pratique qui n'est pas automatique et doit être négociée, pas subie.",
    faq: [
      { q: 'Un maître d’ouvrage peut-il imposer une retenue sans accord préalable ?', a: 'Non, elle doit être négociée et acceptée explicitement.' },
      { q: 'Quel pourcentage est généralement retenu sur un chantier ?', a: 'Entre 5 et 10 % du montant final selon ce qui a été négocié.' },
      { q: 'Existe-t-il une alternative à la retenue en espèces ?', a: 'Oui, une garantie bancaire à première demande.' },
    ],
  },
  {
    path: 'blog/litige-chantier-mediation-ou-tribunal',
    title: 'Litige de chantier : médiation, conciliation ou tribunal | Cantia',
    description:
      "Le tribunal n'est presque jamais la première étape logique — une procédure de conciliation est même obligatoire avant la plupart des actions civiles.",
    faq: [
      { q: 'Faut-il obligatoirement passer par une conciliation avant un procès en Suisse ?', a: 'Oui, pour la majorité des litiges civils, c’est une condition de recevabilité.' },
      { q: 'La médiation est-elle obligatoire pour un litige de chantier ?', a: 'Non, elle est volontaire, contrairement à la conciliation.' },
      { q: 'Qu’est-ce qui accélère le plus une conciliation ?', a: 'Un dossier documentaire solide (devis, échanges, photos).' },
    ],
  },
  {
    path: 'blog/certificat-de-travail-obligation-employeur-batiment',
    title: 'Certificat de travail dans le bâtiment : une obligation | Cantia',
    description:
      "Un employé quittant l'entreprise a le droit d'exiger un certificat de travail à tout moment — le refuser expose l'employeur à un litige.",
    faq: [
      { q: 'Un employeur peut-il refuser de délivrer un certificat de travail ?', a: 'Non, c’est un droit de l’employé prévu par l’art. 330a CO.' },
      { q: 'Quelle est la différence entre certificat complet et attestation simple ?', a: 'Le certificat complet inclut une appréciation, l’attestation non.' },
      { q: 'Peut-on mentionner une maladie dans un certificat de travail ?', a: 'Non, sauf lien direct avec la prestation de travail.' },
    ],
  },
  {
    path: 'blog/demission-employe-batiment-preavis-a-respecter',
    title: 'Démission d’un employé du bâtiment : le délai de préavis | Cantia',
    description:
      "Le préavis de démission suit les mêmes règles que le licenciement — un employé qui part sans le respecter expose l'entreprise à un manque organisationnel.",
    faq: [
      { q: 'Le délai de préavis est-il le même pour une démission et un licenciement ?', a: 'Oui, l’art. 335c CO fixe le même régime dans les deux sens.' },
      { q: 'Que peut faire un employeur si un employé part sans préavis ?', a: 'Il peut réclamer une indemnité équivalente au salaire du délai non respecté.' },
      { q: 'Un employé peut-il partir immédiatement pour justes motifs ?', a: 'Oui, mais cela exige des motifs sérieux et documentés.' },
    ],
  },
  {
    path: 'blog/travailleur-temporaire-interimaire-batiment-regles',
    title: 'Intérimaire dans le bâtiment : règles et pièges à éviter | Cantia',
    description:
      "L'intérim permet d'absorber un pic d'activité rapidement, mais implique une entreprise de location de services soumise à autorisation.",
    faq: [
      { q: 'Peut-on prêter du personnel entre entreprises sans agence ?', a: 'Non, un vrai prêt de main-d’œuvre nécessite une entreprise de location de services autorisée.' },
      { q: 'Un intérimaire est-il soumis à la CCT du chantier ?', a: 'Oui, au même titre qu’un employé fixe.' },
      { q: 'Pourquoi un intérimaire coûte-t-il plus cher à l’heure ?', a: 'Le tarif inclut déjà salaire, charges sociales et marge de l’agence.' },
    ],
  },
  {
    path: 'blog/calculer-prix-de-revient-chantier-batiment',
    title: 'Prix de revient d’un chantier : la méthode de calcul | Cantia',
    description:
      "Le montant facturé n'est pas le prix de revient. Sans additionner main-d'œuvre réelle, matériaux et sous-traitance, impossible de savoir si un chantier a été rentable.",
    faq: [
      { q: 'Le montant facturé est-il le même que le prix de revient ?', a: 'Non, le prix de revient additionne le coût réel de tous les postes.' },
      { q: 'Pourquoi calculer le prix de revient chantier par chantier ?', a: 'Un chiffre d’affaires positif peut masquer des chantiers individuellement perdants.' },
      { q: 'Quelle est la composante la plus souvent sous-estimée ?', a: 'La main-d’œuvre réelle au coût horaire complet.' },
    ],
  },
  {
    path: 'blog/previsionnel-tresorerie-entreprise-batiment',
    title: 'Prévisionnel de trésorerie pour une entreprise du bâtiment | Cantia',
    description:
      "Pas besoin d'un plan financier complexe pour anticiper un creux de trésorerie — un prévisionnel à 30-60-90 jours suffit à voir venir les problèmes.",
    faq: [
      { q: 'Un prévisionnel de trésorerie doit-il être complexe ?', a: 'Non, un prévisionnel simple à 30-60-90 jours suffit pour une PME.' },
      { q: 'À quelle fréquence mettre à jour un prévisionnel ?', a: 'Idéalement à chaque nouvelle facture ou paiement reçu.' },
      { q: 'Quel est le principal bénéfice d’un prévisionnel ?', a: 'Repérer un creux plusieurs semaines à l’avance pour agir à temps.' },
    ],
  },
  {
    path: 'blog/checklist-ouverture-chantier-artisan',
    title: 'Checklist d’ouverture de chantier : avant le premier jour | Cantia',
    description:
      "Un chantier qui démarre mal coûte du temps et de l'argent à rattraper. Une checklist simple évite l'essentiel des mauvaises surprises.",
    faq: [
      { q: 'Pourquoi documenter l’état des lieux avant le chantier ?', a: 'Pour se protéger en cas de contestation ultérieure sur l’état préexistant.' },
      { q: 'Faut-il attendre l’acompte avant de démarrer ?', a: 'C’est fortement recommandé pour éviter un risque financier évitable.' },
      { q: 'Quelle est la cause la plus fréquente de faux départ de chantier ?', a: 'Un point administratif ou logistique oublié.' },
    ],
  },
  {
    path: 'blog/checklist-cloture-chantier-avant-facturation',
    title: 'Checklist de fin de chantier avant la facture finale | Cantia',
    description:
      "Une facture finale envoyée trop vite ouvre la porte à des contestations évitables. Voici les points à cocher avant de clôturer un chantier.",
    faq: [
      { q: 'Pourquoi documenter la réception avant la facture finale ?', a: 'Elle déclenche le délai de garantie et fige les défauts constatés.' },
      { q: 'Que risque-t-on à oublier des travaux supplémentaires ?', a: 'Une perte financière directe et une difficulté à les réclamer après coup.' },
      { q: 'Faut-il archiver le dossier après la facturation finale ?', a: 'Oui, il reste utile pendant toute la période de garantie.' },
    ],
  },
  {
    path: 'blog/logiciel-devis-facture-maconnerie-suisse',
    title: 'Devis et factures pour une entreprise de maçonnerie | Cantia',
    description:
      "Un devis de maçonnerie mal structuré cache souvent une perte : matériaux sous-évalués, heures d'équipe mal comptées, imprévus non provisionnés. Méthode concrète pour chiffrer juste.",
    faq: [
      { q: 'Comment chiffrer un devis de maçonnerie qui mélange plusieurs unités ?', a: 'En détaillant chaque poste avec sa propre unité — m³ pour le béton et les fondations, m² pour les murs et finitions, heures de régie pour la manutention — plutôt qu\'un prix forfaitaire unique qui masque les écarts.' },
      { q: 'Faut-il inclure le prix des matériaux dans le prix au m² de maçonnerie ?', a: 'Il est préférable de les séparer sur le devis : cela permet d\'ajuster facilement si le prix des matériaux change avant le début du chantier, sans devoir refaire tout le calcul.' },
      { q: 'Comment ne pas oublier le temps de manutention dans un devis de maçonnerie ?', a: 'En prévoyant une ligne dédiée en heures de régie pour le transport des matériaux, l\'évacuation des gravats et le nettoyage — un poste qui représente souvent 15 à 20 % du temps total du chantier.' },
    ],
  },
  {
    path: 'blog/gestion-chantier-facturation-electricien-suisse',
    title: 'Électricien indépendant : devis, heures et facturation | Cantia',
    description:
      "Entre les points électriques à chiffrer, les heures réparties sur plusieurs chantiers dans la même journée et les contrôles NIBT à ne pas oublier, la gestion administrative d'un électricien a ses pièges.",
    faq: [
      { q: 'Faut-il facturer un devis d\'électricité au point ou au forfait ?', a: 'Les deux se combinent : le prix unitaire par point électrique convient aux rénovations détaillées, le forfait convient mieux aux circuits complets standardisés où le temps varie peu.' },
      { q: 'Comment un électricien facture-t-il ses déplacements entre plusieurs chantiers ?', a: 'Il n\'existe pas de règle unique — l\'essentiel est de le décider clairement à l\'avance et de le communiquer au client, pas de l\'absorber silencieusement dans la marge.' },
      { q: 'Le contrôle NIBT doit-il figurer sur le devis d\'électricité ?', a: 'Oui — toute installation créée ou modifiée doit être annoncée et contrôlée. L\'intégrer au devis dès le départ évite une facturation d\'urgence, moins avantageuse.' },
    ],
  },
  {
    path: 'blog/devis-facture-plombier-sanitaire-suisse',
    title: 'Plombier-sanitaire : devis planifié et urgence | Cantia',
    description:
      "Entre un devis de salle de bain complète et un dépannage de fuite un dimanche soir, le plombier-sanitaire jongle avec deux logiques de facturation opposées. Comment structurer les deux sans y perdre.",
    faq: [
      { q: 'Comment différencier le tarif d\'un devis planifié et d\'un dépannage en plomberie ?', a: 'En appliquant deux logiques distinctes : un devis détaillé poste par poste pour les chantiers planifiés, et un tarif de dépannage annoncé clairement avant intervention pour les urgences.' },
      { q: 'Peut-on facturer un dépannage plus cher le soir ou le week-end ?', a: 'Oui, c\'est une pratique courante et légitime, à condition que la majoration soit annoncée avant l\'intervention plutôt que découverte sur la facture.' },
      { q: 'Faut-il séparer la fourniture du matériel sanitaire et la pose sur le devis ?', a: 'C\'est recommandé — cela permet au client de comprendre la répartition du prix et facilite les ajustements si le matériel choisi change en cours de projet.' },
    ],
  },
  {
    path: 'blog/devis-peintre-batiment-calcul-surface-suisse',
    title: 'Devis de peinture en bâtiment : calculer la surface | Cantia',
    description:
      "Une surface mal calculée (déductions oubliées, nombre de couches sous-estimé, préparation du support négligée) est la première cause de perte de marge chez les peintres en bâtiment.",
    faq: [
      { q: 'Faut-il déduire les portes et fenêtres du calcul de surface peinture ?', a: 'Oui pour la surface facturée, mais le temps de finition aux bords des ouvertures reste réel — d\'où l\'intérêt d\'un tarif qui tient compte du nombre d\'ouvertures.' },
      { q: 'Comment facturer une deuxième couche de peinture nécessaire mais non prévue ?', a: 'Le mieux est de l\'anticiper dans le devis initial selon le type de support et de changement de teinte prévu, plutôt que de la découvrir sur chantier.' },
      { q: 'Le temps de protection du chantier doit-il être facturé séparément ?', a: 'Ce n\'est pas obligatoire, mais c\'est recommandé sur les chantiers occupés ou avec du mobilier à protéger — ce temps est réel et souvent sous-estimé.' },
    ],
  },
  {
    path: 'blog/devis-carreleur-facturation-au-m2-suisse',
    title: 'Devis de carrelage : au-delà du prix au m² | Cantia',
    description:
      "Format du carreau, motif de pose, découpes, plans de calepinage : autant de facteurs qui font varier fortement le temps de pose d'un carrelage, à surface égale. Comment les intégrer au devis.",
    faq: [
      { q: 'Pourquoi deux devis de carrelage à surface identique peuvent-ils avoir des prix très différents ?', a: 'Le format des carreaux, le motif de pose et le nombre de découpes autour des obstacles font varier fortement le temps de pose réel, même à surface égale.' },
      { q: 'Quelle marge de casse prévoir sur une commande de carrelage ?', a: 'Généralement entre 8 et 12 % selon la complexité de la pose — un motif avec beaucoup de découpes consomme davantage de carreaux qu\'une pose droite simple.' },
      { q: 'Faut-il prévoir le ragréage du support dans le devis initial de carrelage ?', a: 'C\'est recommandé, au moins en option chiffrée à part, car l\'état réel du support n\'est souvent visible qu\'une fois l\'ancien revêtement retiré.' },
    ],
  },
  {
    path: 'blog/devis-charpente-bois-facturation-suisse',
    title: 'Charpente bois : matière, façonnage et pose | Cantia',
    description:
      "Entre le prix du bois qui fluctue, le temps de façonnage en atelier et la pose sur chantier, un devis de charpente additionne trois postes très différents. Comment les structurer.",
    faq: [
      { q: 'Comment se protéger de la variation du prix du bois entre le devis et la commande ?', a: 'En intégrant une clause de révision de prix sur le poste bois, indexée sur la date réelle de commande plutôt que sur la date de signature du devis.' },
      { q: 'Faut-il facturer le levage de charpente séparément de la pose ?', a: 'C\'est recommandé lorsqu\'une grue ou un camion-grue est loué spécifiquement, car ce coût est fixe pour la journée, indépendamment du temps de pose effectif.' },
      { q: 'Comment gérer un report de chantier de charpente pour cause de météo ?', a: 'Idéalement via une clause prévue au devis dès le départ, précisant qui absorbe le coût d\'un report plutôt que de le négocier après coup sous pression.' },
    ],
  },
  {
    path: 'blog/gestion-chantier-devis-couvreur-toiture-suisse',
    title: 'Couvreur : chiffrer une toiture sans se faire piéger | Cantia',
    description:
      "Un chantier de toiture dépend directement de la météo et impose des mesures de sécurité qui ont un coût réel. Comment les intégrer au devis sans les cacher dans une marge invisible.",
    faq: [
      { q: 'Comment intégrer le risque météo dans un devis de toiture ?', a: 'En prévoyant explicitement une clause de report sans pénalité en cas d\'intempérie empêchant le travail en hauteur.' },
      { q: 'Faut-il facturer séparément les dispositifs de sécurité sur un chantier de toiture ?', a: 'C\'est recommandé — échafaudage, ligne de vie et garde-corps ont un coût réel qui doit rester visible, plutôt que d\'être dilué dans le prix au m² de couverture.' },
      { q: 'Peut-on chiffrer une réparation de charpente sans inspection préalable ?', a: 'Non, ou seulement de manière très approximative — l\'état réel d\'une charpente n\'est souvent visible qu\'après dépose de la couverture existante.' },
    ],
  },
  {
    path: 'blog/devis-menuisier-sur-mesure-facturation-suisse',
    title: 'Menuisier-agenceur : chiffrer le sur-mesure | Cantia',
    description:
      "Un agencement sur mesure passe par la prise de cotes, la conception, la fabrication en atelier et le montage sur site — quatre étapes qui méritent chacune leur propre ligne de devis.",
    faq: [
      { q: 'Faut-il facturer la prise de cotes et les plans d\'un agencement sur mesure ?', a: 'C\'est recommandé, au moins comme un forfait d\'étude déductible du prix final si le devis est signé — cela protège un temps de travail réel souvent invisible pour le client.' },
      { q: 'Comment chiffrer le temps de montage d\'un agencement sur mesure ?', a: 'En prévoyant systématiquement une marge par rapport au temps théorique d\'atelier, car les irrégularités du bâti existant allongent presque toujours la pose réelle.' },
      { q: 'Le devis de menuiserie sur mesure doit-il inclure une clause de modification ?', a: 'Oui — un client qui change d\'avis sur une finition ou une dimension après validation des plans doit générer un avenant chiffré, pas une modification silencieuse.' },
    ],
  },
  {
    path: 'blog/devis-facture-facadier-isolation-suisse',
    title: 'Façadier et isolation périphérique : devis et subventions | Cantia',
    description:
      "Un devis d'isolation périphérique (CECB, Programme Bâtiments) implique souvent une demande de subvention en parallèle du chantier. Comment structurer devis et facturation sans bloquer le dossier du client.",
    faq: [
      { q: 'Le devis d\'isolation périphérique doit-il indiquer la valeur U du matériau ?', a: 'C\'est fortement recommandé — les dossiers de subvention cantonaux exigent généralement une valeur d\'isolation précise, pas seulement une désignation commerciale du matériau.' },
      { q: 'Faut-il attendre le versement de la subvention avant de facturer le client ?', a: 'Non — il est préférable de facturer selon l\'avancement normal du chantier, sans lier sa propre trésorerie au calendrier de versement de l\'aide cantonale.' },
      { q: 'Un devis d\'isolation périphérique doit-il avoir une durée de validité plus longue que la moyenne ?', a: 'C\'est conseillé, car le montage d\'un dossier de subvention peut prendre plusieurs semaines.' },
    ],
  },
  {
    path: 'blog/devis-facture-paysagiste-jardinier-suisse',
    title: 'Paysagiste : aménagement ponctuel et entretien récurrent | Cantia',
    description:
      "Un chantier d'aménagement extérieur et un contrat d'entretien de jardin suivent deux logiques de facturation opposées — l'un au projet, l'autre en récurrence. Comment les structurer proprement.",
    faq: [
      { q: 'Faut-il refaire un devis à chaque passage d\'entretien de jardin ?', a: 'Non — un contrat d\'entretien annuel ou saisonnier avec une fréquence de passage définie évite de reproduire un devis à chaque intervention.' },
      { q: 'Comment chiffrer la fourniture de végétaux dans un devis d\'aménagement ?', a: 'En la séparant du temps de plantation, car le prix des végétaux varie fortement selon la saison et la disponibilité.' },
      { q: 'Comment gérer la saisonnalité de l\'activité d\'un paysagiste sur l\'année ?', a: 'En sécurisant une part de revenu récurrent via des contrats d\'entretien à l\'année, qui lissent partiellement les mois plus creux.' },
    ],
  },
  {
    path: 'blog/devis-facture-chauffagiste-cvc-suisse',
    title: 'Chauffagiste CVC : remplacement de chaudière et subvention | Cantia',
    description:
      "Remplacer un chauffage à mazout ou gaz par une pompe à chaleur implique un devis technique, un délai de livraison souvent long, et fréquemment une subvention cantonale. Comment tout intégrer.",
    faq: [
      { q: 'Faut-il attendre l\'octroi de la subvention avant de commencer les travaux de chauffage ?', a: 'Généralement oui — la plupart des programmes cantonaux exigent que le devis soit soumis et l\'aide accordée avant le début des travaux.' },
      { q: 'Comment communiquer un long délai de livraison de pompe à chaleur au client ?', a: 'En l\'indiquant explicitement et par écrit dès le devis, surtout en haute saison où les délais peuvent dépasser deux à trois mois.' },
      { q: 'Le devis de chauffage doit-il inclure l\'adaptation du réseau existant ?', a: 'C\'est recommandé, en particulier pour un passage à une pompe à chaleur, car les radiateurs et la régulation existants ne sont pas toujours compatibles sans ajustement.' },
    ],
  },
  {
    path: 'blog/devis-facture-serrurier-metallier-suisse',
    title: 'Serrurier-métallier : sur-mesure et dépannage urgent | Cantia',
    description:
      "Un garde-corps sur mesure se conçoit tranquillement, une porte forcée se dépanne dans l'heure — le serrurier-métallier vit des deux logiques en parallèle. Comment les structurer sans les confondre.",
    faq: [
      { q: 'Comment facturer un dépannage de serrurerie en urgence sans devis préalable ?', a: 'En annonçant clairement le tarif de déplacement et d\'intervention avant de se rendre sur place, plutôt que d\'établir la facture après coup sans accord préalable.' },
      { q: 'Peut-on majorer le tarif d\'un dépannage de serrurerie hors horaires normaux ?', a: 'Oui, c\'est une pratique courante — généralement entre 30 et 50 % de majoration — à condition que le client en soit informé avant l\'intervention.' },
      { q: 'Faut-il prévoir une clause de révision de prix sur un ouvrage métallique sur mesure ?', a: 'C\'est recommandé lorsque la fabrication s\'étale sur plusieurs semaines, car le cours des matières premières peut varier sensiblement.' },
    ],
  },
  {
    path: 'blog/trouver-clients-artisan-batiment-suisse',
    title: 'Trouver des clients sans budget marketing | Cantia',
    description:
      "Pas besoin d'une grosse campagne publicitaire pour remplir son carnet de commandes. Les canaux qui fonctionnent réellement pour un artisan du bâtiment en Suisse, du bouche-à-oreille au référencement local.",
    faq: [
      { q: 'Quel est le canal d\'acquisition le plus efficace pour un artisan du bâtiment ?', a: 'Le bouche-à-oreille reste généralement le plus efficace, suivi de près par une fiche Google Business bien entretenue avec des photos de chantiers réels.' },
      { q: 'Faut-il un site internet pour trouver des clients en tant qu\'artisan ?', a: 'Ce n\'est pas indispensable, mais un site simple avec des exemples de réalisations rassure un client qui compare plusieurs artisans.' },
      { q: 'Pourquoi la vitesse de réponse à une demande de devis est-elle si importante ?', a: 'Parce qu\'un client qui contacte plusieurs artisans choisit souvent celui qui répond en premier, à qualité équivalente.' },
    ],
  },
  {
    path: 'blog/avis-google-entreprise-construction-suisse',
    title: 'Avis Google pour une entreprise du bâtiment | Cantia',
    description:
      "Avant de contacter un artisan, la plupart des clients regardent ses avis Google. Comment en obtenir davantage sans paraître insistant, et que faire face à un avis négatif.",
    faq: [
      { q: 'Quand faut-il demander un avis Google à un client ?', a: 'Idéalement juste après la réception des travaux, quand la satisfaction est la plus fraîche.' },
      { q: 'Comment répondre à un avis négatif sur une fiche Google d\'entreprise du bâtiment ?', a: 'De manière factuelle et professionnelle, sans agressivité, en expliquant brièvement le contexte ou la solution apportée.' },
      { q: 'Est-il légal de proposer une réduction en échange d\'un avis Google ?', a: 'Non, cette pratique est contraire aux règles de Google et fragilise la crédibilité des avis obtenus.' },
    ],
  },
  {
    path: 'blog/site-internet-artisan-batiment-utile',
    title: 'Un site internet pour un artisan du bâtiment | Cantia',
    description:
      "Un site internet n'est pas indispensable pour trouver des clients, mais il change ce qui se passe après le premier contact. Ce qu'il doit vraiment contenir pour être utile, sans budget démesuré.",
    faq: [
      { q: 'Un artisan indépendant a-t-il vraiment besoin d\'un site internet ?', a: 'Pas indispensable pour trouver des clients directement, mais utile pour rassurer un prospect qui vérifie en ligne avant de contacter un artisan recommandé.' },
      { q: 'Combien de pages doit contenir le site d\'un artisan du bâtiment ?', a: 'Généralement moins de dix suffisent — accueil, réalisations, services proposés et contact.' },
      { q: 'Le référencement local est-il plus important que la publicité payante pour un artisan ?', a: 'Dans la majorité des cas, oui — un site bien référencé localement et une fiche Google Business active rapportent généralement plus qu\'une campagne publicitaire générique.' },
    ],
  },
  {
    path: 'blog/vitesse-reponse-devis-taux-conversion-batiment',
    title: 'La vitesse de réponse à un devis convertit plus que le prix | Cantia',
    description:
      "Un client qui contacte plusieurs artisans en même temps choisit très souvent celui qui répond en premier, avant même de comparer les prix en détail. Comment s'organiser pour ne plus perdre ce client.",
    faq: [
      { q: 'Pourquoi la vitesse de réponse compte-t-elle plus que le prix sur un devis ?', a: 'Parce qu\'un client compare généralement plusieurs artisans en parallèle et retient souvent celui qui a réagi en premier.' },
      { q: 'Faut-il envoyer un devis complet immédiatement pour convertir un client ?', a: 'Pas nécessairement — un accusé de réception rapide suivi d\'un devis réfléchi sous un délai annoncé fonctionne généralement mieux.' },
      { q: 'Combien de temps un client attend-il en moyenne avant de relancer un artisan sans réponse ?', a: 'Très peu de temps en réalité — la plupart des clients ne relancent pas et passent directement à l\'entreprise suivante.' },
    ],
  },
  {
    path: 'blog/parrainage-recommandation-clients-artisan-batiment',
    title: 'Transformer un client satisfait en apporteur d\'affaires | Cantia',
    description:
      "Le bouche-à-oreille ne se décrète pas, mais il s'encourage. Comment mettre en place un système simple de recommandation sans donner l'impression de mendier des clients.",
    faq: [
      { q: 'Quand demander à un client de recommander son artisan ?', a: 'Le meilleur moment est juste après la réception des travaux, quand la satisfaction est la plus fraîche et concrète.' },
      { q: 'Faut-il offrir une récompense financière pour une recommandation ?', a: 'Ce n\'est pas obligatoire — un geste simple de remerciement suffit souvent à entretenir la relation.' },
      { q: 'Pourquoi un client recommandé se convertit-il plus facilement qu\'un prospect classique ?', a: 'Parce que la confiance est déjà en partie établie par le lien avec la personne qui recommande.' },
    ],
  },
  {
    path: 'blog/fixer-prix-artisan-sans-brader-concurrence-suisse',
    title: 'Fixer ses prix sans les brader | Cantia',
    description:
      "Baisser systématiquement ses prix pour rester compétitif finit toujours par fragiliser l'entreprise. Comment construire un prix défendable et le justifier face à un client qui compare des devis.",
    faq: [
      { q: 'Faut-il s\'aligner sur le devis le moins cher d\'un concurrent ?', a: 'Généralement non — un prix construit sur un calcul réel de coût de revient et de marge ne peut pas s\'aligner indéfiniment sans finir par travailler à perte.' },
      { q: 'Comment justifier un prix plus élevé qu\'un devis concurrent ?', a: 'En expliquant concrètement ce que le prix couvre — qualité des matériaux, garantie, assurance, délai — plutôt qu\'en défendant simplement le chiffre.' },
      { q: 'Quelle marge bénéficiaire une entreprise du bâtiment doit-elle viser ?', a: 'Généralement entre 10 et 15 % nets après couverture de tous les coûts réels.' },
    ],
  },
  {
    path: 'blog/portfolio-photos-avant-apres-chantier-vente',
    title: 'Les photos avant/après de chantier, un outil commercial | Cantia',
    description:
      "La plupart des artisans prennent des photos de chantier pour le suivi, sans jamais les réutiliser commercialement. Comment en faire un vrai portfolio qui aide à convertir de nouveaux devis.",
    faq: [
      { q: 'Faut-il l\'accord du client pour publier des photos de son chantier ?', a: 'Oui, en particulier pour un intérieur privé — il est recommandé de demander explicitement l\'accord avant toute publication.' },
      { q: 'Combien de photos avant/après faut-il pour un portfolio efficace ?', a: 'Un petit nombre bien choisi (3 à 5 par type de prestation) est généralement plus efficace qu\'une grande quantité de photos peu organisées.' },
      { q: 'Comment prendre une bonne photo avant/après de chantier ?', a: 'En conservant le même angle exact entre l\'avant et l\'après, avec une lumière naturelle si possible, et un chantier propre au moment de la photo finale.' },
    ],
  },
  {
    path: 'blog/fideliser-ouvriers-qualifies-penurie-batiment-suisse',
    title: 'Fidéliser ses ouvriers qualifiés face à la pénurie | Cantia',
    description:
      "Recruter un ouvrier qualifié coûte cher et prend du temps — en garder un déjà formé coûte presque toujours moins cher. Les leviers concrets de fidélisation dans un secteur en tension.",
    faq: [
      { q: 'Pourquoi la fidélisation des ouvriers est-elle devenue un enjeu stratégique dans le bâtiment ?', a: 'Parce que la pénurie de main-d\'œuvre qualifiée rend le remplacement d\'un bon élément long et coûteux.' },
      { q: 'Le salaire est-il le principal facteur de fidélisation d\'un ouvrier qualifié ?', a: 'C\'est un facteur important, mais rarement le seul — l\'organisation des chantiers et la reconnaissance du travail jouent souvent un rôle tout aussi déterminant.' },
      { q: 'Former un apprenti est-il rentable pour une petite entreprise du bâtiment ?', a: 'Généralement oui sur la durée — un apprenti formé en interne présente souvent un taux de départ plus faible qu\'un profil recruté en externe.' },
    ],
  },
  {
    path: 'blog/logiciel-facturation-gratuit-independant-suisse',
    title: 'Logiciel de facturation gratuit pour indépendant | Cantia',
    description:
      "Un plan gratuit existe presque toujours, mais rarement sans limite. Ce qu'un indépendant suisse doit vérifier avant de miser sur un logiciel de facturation \"gratuit\".",
    faq: [
      { q: 'Un logiciel de facturation gratuit inclut-il la QR-facture suisse ?', a: 'Pas systématiquement — certains plans gratuits la réservent au niveau payant, un point à vérifier avant de choisir.' },
      { q: 'Quelle est la limite la plus courante des logiciels de facturation gratuits ?', a: 'Un plafond de documents émis par mois (souvent 5 à 10), au-delà duquel il faut passer à un plan payant.' },
      { q: 'Vaut-il mieux un outil gratuit limité ou un essai gratuit complet ?', a: 'Un essai gratuit complet donne une idée plus fiable de ce que l\'outil vaut vraiment, plutôt qu\'une version tronquée.' },
    ],
  },
  {
    path: 'blog/meilleur-outil-gestion-independant-suisse',
    title: 'Le meilleur outil de gestion pour un indépendant | Cantia',
    description:
      "Face à la question \"quel outil choisir\", la bonne réponse dépend moins des fonctionnalités listées que de ce qu'un indépendant utilisera vraiment dans les six premiers mois.",
    faq: [
      { q: 'Faut-il plusieurs outils séparés ou un seul outil tout-en-un pour démarrer ?', a: 'Un outil unique couvrant devis, factures et suivi de chantier évite la dispersion de l\'information.' },
      { q: 'Combien de temps faut-il pour prendre en main un logiciel de gestion en tant qu\'indépendant ?', a: 'Avec un bon outil, quelques minutes suffisent généralement pour créer un premier devis conforme.' },
      { q: 'Comment savoir si un outil est vraiment adapté à un indépendant du bâtiment ?', a: 'En vérifiant qu\'il fonctionne directement depuis le chantier, sur mobile, sans ressaisie le soir.' },
    ],
  },
  {
    path: 'blog/logiciel-gestion-tout-en-un-petite-entreprise-suisse',
    title: 'Logiciel de gestion tout-en-un pour petite entreprise | Cantia',
    description:
      "Le terme \"tout-en-un\" est utilisé par presque tous les éditeurs. Ce qu'il recouvre réellement, et comment vérifier qu'un outil l'est vraiment.",
    faq: [
      { q: 'Comment vérifier qu\'un logiciel "tout-en-un" l\'est vraiment ?', a: 'En testant le parcours complet — un devis accepté doit se transformer en facture sans ressaisie.' },
      { q: 'Un logiciel tout-en-un est-il plus cher qu\'un outil de facturation seul ?', a: 'Pas nécessairement — le coût réel d\'outils séparés inclut souvent le temps perdu à les faire communiquer.' },
      { q: 'Un tout-en-un est-il adapté à une toute petite entreprise sans employé ?', a: 'Oui — les modules RH ou planning restent utiles même inutilisés au départ.' },
    ],
  },
  {
    path: 'blog/combien-coute-logiciel-facturation-pas-cher',
    title: 'Combien coûte vraiment un logiciel de facturation pas cher | Cantia',
    description:
      "Les prix affichés vont de zéro à plusieurs centaines de francs par mois. Comment évaluer ce qui est réellement abordable pour une entreprise qui démarre.",
    faq: [
      { q: 'Quel budget prévoir pour un logiciel de facturation en tant que petite entreprise du bâtiment ?', a: 'Généralement entre CHF 30 et 90 par mois pour un outil complet.' },
      { q: 'Pourquoi un logiciel "pas cher" peut-il coûter plus cher au final ?', a: 'Si le prix affiché ne couvre pas la facturation illimitée ou les modules nécessaires, des coûts supplémentaires s\'ajoutent après coup.' },
      { q: 'Faut-il comparer les logiciels uniquement sur leur prix mensuel ?', a: 'Non — le temps administratif réellement économisé compte au moins autant que le prix affiché.' },
    ],
  },
  {
    path: 'blog/devis-gratuit-en-ligne-suisse-outil',
    title: 'Faire un devis gratuit en ligne : options et limites | Cantia',
    description:
      "Générateurs de devis gratuits, modèles Word, outils en ligne — un tour d'horizon de ce que chaque option permet vraiment, et où elle bloque.",
    faq: [
      { q: 'Un modèle Word gratuit suffit-il pour faire des devis en tant qu\'artisan ?', a: 'Pour un premier document ponctuel oui, mais sans calcul de TVA ni suivi de statut la charge augmente vite.' },
      { q: 'Quel est l\'avantage d\'un catalogue de prix dans un outil de devis ?', a: 'Il évite de retaper les mêmes prestations à chaque nouveau devis.' },
      { q: 'Pourquoi suivre le statut de ses devis est-il important ?', a: 'Sans suivi centralisé, il devient difficile de savoir quels devis relancer.' },
    ],
  },
  {
    path: 'blog/quel-logiciel-choisir-demarrer-entreprise-construction',
    title: 'Quel logiciel choisir en démarrant son entreprise de construction | Cantia',
    description:
      "La méthode la plus simple pour choisir un logiciel en démarrant : partir de ce dont on a réellement besoin les trois premiers mois.",
    faq: [
      { q: 'Faut-il choisir un logiciel complet dès la création de son entreprise de construction ?', a: 'Pas nécessairement tout utiliser dès le départ, mais choisir un outil capable de couvrir les besoins futurs.' },
      { q: 'Quels sont les besoins logiciels prioritaires pour une nouvelle entreprise de construction ?', a: 'Émettre des devis conformes, les transformer en factures, et suivre chaque chantier.' },
      { q: 'Pourquoi anticiper la croissance de l\'entreprise dans le choix du logiciel ?', a: 'Changer d\'outil après plusieurs mois fait perdre du temps et de l\'historique.' },
    ],
  },
  {
    path: 'blog/logiciel-facturation-raison-individuelle-suisse',
    title: 'Logiciel de facturation pour raison individuelle | Cantia',
    description:
      "Une raison individuelle n'a pas les mêmes obligations qu'une société de capitaux, mais un logiciel de facturation reste tout aussi utile.",
    faq: [
      { q: 'Une raison individuelle a-t-elle vraiment besoin d\'un logiciel de facturation ?', a: 'Oui, souvent plus qu\'une société avec équipe administrative, faute de personne pour relancer les impayés.' },
      { q: 'Les mentions obligatoires sur une facture changent-elles selon le statut juridique ?', a: 'Non, les mentions légales de base s\'appliquent quel que soit le statut.' },
      { q: 'Un logiciel de comptabilité complète est-il nécessaire pour une raison individuelle ?', a: 'Pas systématiquement — un outil simple couvrant devis, factures et trésorerie suffit souvent.' },
    ],
  },
  {
    path: 'blog/application-gestion-freelance-batiment',
    title: 'Application de gestion pour freelance du bâtiment | Cantia',
    description:
      "Un freelance du bâtiment passe le plus clair de son temps sur chantier — une application de gestion doit être pensée pour ça en priorité.",
    faq: [
      { q: 'Une application de gestion pour freelance du bâtiment doit-elle fonctionner hors-ligne ?', a: 'C\'est fortement recommandé, de nombreux chantiers ayant un réseau faible ou absent.' },
      { q: 'Peut-on créer un devis complet directement depuis un téléphone ?', a: 'Avec une application bien pensée pour le mobile, oui.' },
      { q: 'Quelle est la différence entre une application "responsive" et une vraie application mobile ?', a: 'Une application responsive s\'affiche bien sur téléphone mais n\'est pas forcément pensée pour un usage tactile réel sur chantier.' },
    ],
  },
  {
    path: 'blog/meilleur-logiciel-pas-cher-petit-artisan',
    title: 'Le meilleur logiciel pas cher pour un petit artisan | Cantia',
    description:
      "Pour un artisan qui travaille seul, \"pas cher\" ne doit jamais vouloir dire \"sans les fonctions essentielles\".",
    faq: [
      { q: 'Un plan "solo" pas cher est-il forcément incomplet ?', a: 'Pas nécessairement — un bon plan solo reste complet sur les fonctions essentielles.' },
      { q: 'Peut-on faire évoluer un plan solo le jour d\'une première embauche ?', a: 'Avec un outil bien conçu, oui, sans perdre l\'historique.' },
      { q: 'Comment comparer réellement le prix de deux logiciels pour artisan solo ?', a: 'En comparant ce que chaque prix inclut concrètement, pas seulement le chiffre affiché.' },
    ],
  },
  {
    path: 'blog/gerer-entreprise-sans-comptable-debut',
    title: 'Gérer son entreprise sans comptable au démarrage | Cantia',
    description:
      "Beaucoup d'indépendants démarrent sans fiduciaire pour économiser. Ce qu'il est réaliste de gérer soi-même, et le moment où un accompagnement devient nécessaire.",
    faq: [
      { q: 'Peut-on démarrer son activité sans fiduciaire en Suisse ?', a: 'Oui pour les tâches de base, mais la déclaration TVA et le bouclement annuel demandent généralement un accompagnement.' },
      { q: 'À partir de quel chiffre d\'affaires faut-il envisager un fiduciaire ?', a: 'Le seuil d\'assujettissement à la TVA (généralement CHF 100 000) est souvent le repère qui pousse à un accompagnement.' },
      { q: 'Un bon logiciel de gestion remplace-t-il un fiduciaire ?', a: 'Non, mais il facilite grandement son travail en gardant un historique de documents propre et conforme.' },
    ],
  },
  {
    path: 'blog/logiciel-tout-en-un-devis-facture-chantier-rh',
    title: 'Devis, facture, chantier, RH dans un seul logiciel | Cantia',
    description:
      "Quatre domaines très différents dans un seul outil, ça semble ambitieux — voici ce qui rend ça possible en pratique.",
    faq: [
      { q: 'Un logiciel tout-en-un traite-t-il vraiment les modules de façon connectée ?', a: 'Ça dépend de l\'outil — le vrai test est de vérifier si les heures d\'un chantier alimentent automatiquement sa rentabilité et la paie.' },
      { q: 'Faut-il activer tous les modules dès le départ ?', a: 'Non — une petite entreprise peut commencer avec devis et factures seuls.' },
      { q: 'Quel est l\'avantage de connecter chantier et RH dans le même outil ?', a: 'Les heures travaillées servent à la fois au calcul de la paie et de la rentabilité, sans double saisie.' },
    ],
  },
  {
    path: 'blog/outil-facturation-en-ligne-pme-suisse',
    title: 'Outil de facturation en ligne pour PME suisse | Cantia',
    description:
      "Entre un logiciel installé sur un seul ordinateur et un outil en ligne accessible partout, ce qu'une PME suisse y gagne vraiment.",
    faq: [
      { q: 'Quel est le principal avantage d\'un outil de facturation en ligne ?', a: 'L\'accès depuis n\'importe quel appareil, sans dépendre d\'un seul ordinateur.' },
      { q: 'Un outil en ligne est-il aussi sûr qu\'un logiciel installé localement ?', a: 'Généralement plus sûr grâce aux sauvegardes automatiques, à condition de vérifier l\'hébergement des données.' },
      { q: 'Faut-il installer quelque chose pour utiliser un outil de facturation en ligne ?', a: 'Non, un simple navigateur ou une application mobile suffit.' },
    ],
  },
  {
    path: 'blog/logiciel-simple-debuter-independant-batiment',
    title: 'Un logiciel simple pour débuter dans le bâtiment | Cantia',
    description:
      "La simplicité d'un outil ne se juge pas sur sa page d'accueil, mais sur le temps qu'il faut pour émettre un premier devis.",
    faq: [
      { q: 'Comment savoir si un logiciel de gestion est vraiment simple avant de s\'engager ?', a: 'Le meilleur test est de créer un compte et d\'essayer d\'envoyer un premier devis sans lire de mode d\'emploi.' },
      { q: 'Un outil simple peut-il quand même avoir des fonctions avancées ?', a: 'Oui — la simplicité concerne surtout la prise en main des tâches de base.' },
      { q: 'Faut-il une formation pour utiliser un logiciel de gestion en tant qu\'indépendant débutant ?', a: 'Avec un outil bien conçu, non.' },
    ],
  },
  {
    path: 'blog/gestion-entreprise-sur-mobile-artisan',
    title: 'Gérer son entreprise depuis son téléphone | Cantia',
    description:
      "Devis, factures, photos de chantier, heures d'équipe — ce qui se fait réellement bien sur mobile aujourd'hui, et ce qui reste plus confortable sur ordinateur.",
    faq: [
      { q: 'Peut-on vraiment créer un devis complet depuis son téléphone ?', a: 'Oui, avec un outil bien conçu pour mobile, catalogue de prix inclus.' },
      { q: 'Quelles tâches restent plus faciles sur ordinateur que sur mobile ?', a: 'La construction initiale d\'un catalogue de prix détaillé ou l\'analyse de plusieurs chantiers.' },
      { q: 'Un artisan peut-il se passer complètement d\'ordinateur avec un bon outil mobile ?', a: 'Pour le quotidien, largement oui.' },
    ],
  },
  {
    path: 'blog/budget-logiciel-gestion-demarrage-entreprise',
    title: 'Quel budget logiciel prévoir en démarrant son entreprise | Cantia',
    description:
      "Entre le logiciel de gestion, la comptabilité et les outils annexes, combien une nouvelle entreprise du bâtiment doit-elle réellement prévoir.",
    faq: [
      { q: 'Quel pourcentage du chiffre d\'affaires les outils numériques représentent-ils généralement ?', a: 'Environ 1 à 2 % pour une petite entreprise du bâtiment une fois l\'activité stabilisée.' },
      { q: 'Faut-il inclure le logiciel de gestion dans le business plan de création d\'entreprise ?', a: 'Oui, c\'est une dépense récurrente qui mérite sa propre ligne budgétaire.' },
      { q: 'Un outil tout-en-un coûte-t-il vraiment moins cher que plusieurs outils séparés ?', a: 'Souvent oui, une fois additionnés les prix de chaque outil séparé.' },
    ],
  },
  {
    path: 'blog/meilleures-alternatives-gratuites-bexio',
    title: 'Alternatives à Bexio pour démarrer | Cantia',
    description:
      "Bexio reste une référence en Suisse, mais son positionnement comptable complet n'est pas toujours nécessaire pour une entreprise du bâtiment qui démarre.",
    faq: [
      { q: 'Bexio est-il adapté à une entreprise du bâtiment qui démarre ?', a: 'Il couvre très bien la comptabilité complète, mais une entreprise qui démarre a souvent besoin d\'un outil spécialisé bâtiment plus léger.' },
      { q: 'Peut-on utiliser un outil spécialisé bâtiment en plus de Bexio ?', a: 'Oui — certains outils comme Cantia se synchronisent directement avec Bexio.' },
      { q: 'Faut-il choisir entre un outil bâtiment spécialisé et un outil comptable complet ?', a: 'Pas nécessairement — les deux peuvent se compléter.' },
    ],
  },
  {
    path: 'blog/logiciel-gestion-chantier-abordable-petite-entreprise',
    title: 'Un logiciel de gestion de chantier abordable | Cantia',
    description:
      "Le suivi de chantier a longtemps été réservé aux grandes entreprises avec des outils coûteux. Ce qui a changé.",
    faq: [
      { q: 'Le suivi de chantier numérique est-il réservé aux grandes entreprises ?', a: 'Non — il est aujourd\'hui accessible aux petites structures, souvent inclus dans un abonnement abordable.' },
      { q: 'Quel est le coût typique d\'un suivi de chantier pour une petite entreprise ?', a: 'Généralement entre CHF 30 et 60 par mois, intégré à un outil plus large.' },
      { q: 'Que doit couvrir un suivi de chantier même dans une offre abordable ?', a: 'Au minimum des photos géolocalisées et horodatées, et un accès simple depuis un téléphone.' },
    ],
  },
  {
    path: 'blog/comment-facturer-premiers-clients-debut-activite',
    title: 'Facturer ses premiers clients : les bons réflexes | Cantia',
    description:
      "La première facture donne le ton pour toutes celles qui suivront. Les points à vérifier avant de l'envoyer.",
    faq: [
      { q: 'Quelles mentions ne doivent jamais manquer sur une première facture ?', a: 'Un numéro séquentiel, le taux de TVA, des coordonnées bancaires exactes et un délai de paiement clair.' },
      { q: 'Combien de temps après la fin du chantier faut-il envoyer la facture ?', a: 'Le plus rapidement possible, tant que le client se souvient encore clairement du travail.' },
      { q: 'Un logiciel de facturation aide-t-il à éviter les erreurs de débutant ?', a: 'Oui — il applique automatiquement la numérotation, la TVA et les mentions obligatoires.' },
    ],
  },
  {
    path: 'blog/outil-devis-factures-sans-double-saisie',
    title: 'En finir avec la double saisie devis-facture | Cantia',
    description:
      "Retaper un devis accepté pour en faire une facture est une perte de temps évitable — et une source d'erreurs.",
    faq: [
      { q: 'Pourquoi la double saisie entre devis et facture est-elle risquée ?', a: 'Elle introduit un risque de recopier une erreur de prix ou de quantité qui n\'existait pas dans l\'original.' },
      { q: 'Combien de temps fait gagner un outil qui automatise le passage devis-facture ?', a: 'Généralement 10 à 20 minutes par document.' },
      { q: 'Comment vérifier qu\'un logiciel évite vraiment la double saisie ?', a: 'En testant le passage d\'un devis accepté à une facture — les lignes doivent se reporter automatiquement.' },
    ],
  },
  {
    path: 'blog/logiciel-gestion-societe-individuelle-suisse',
    title: 'Logiciel de gestion pour société individuelle | Cantia',
    description:
      "Une société individuelle a des besoins différents d'une PME avec plusieurs employés. Les critères de choix à privilégier.",
    faq: [
      { q: 'Quelles sont les priorités spécifiques d\'une société individuelle dans le choix d\'un logiciel ?', a: 'La rapidité d\'utilisation, un prix adapté à un seul utilisateur, et un accès mobile complet.' },
      { q: 'Un outil pour société individuelle peut-il évoluer si l\'entreprise grandit ?', a: 'Avec un bon outil, oui, sans perdre l\'historique.' },
      { q: 'Faut-il un logiciel différent selon qu\'on est en société individuelle ou en Sàrl ?', a: 'Pas fondamentalement — les besoins de base restent les mêmes.' },
    ],
  },
  {
    path: 'blog/demarrer-entreprise-batiment-outils-indispensables',
    title: 'Les outils réellement indispensables pour démarrer | Cantia',
    description:
      "Entre ce qui est indispensable et ce qui peut attendre, la liste des outils à avoir dès le premier jour d'une entreprise du bâtiment.",
    faq: [
      { q: 'Quels outils numériques sont vraiment indispensables pour démarrer une entreprise du bâtiment ?', a: 'Principalement un outil de devis/factures conforme et un moyen de documenter les chantiers en photos.' },
      { q: 'Faut-il un module RH dès la création de l\'entreprise ?', a: 'Non, un module RH n\'est utile qu\'à partir de la première embauche.' },
      { q: 'Est-il préférable de s\'équiper progressivement plutôt que tout d\'un coup ?', a: 'Généralement oui — un outil simple bien maîtrisé est plus efficace qu\'une suite complète sous-exploitée.' },
    ],
  },
  {
    path: 'blog/checklist-logiciels-ouverture-societe-construction',
    title: 'Checklist logiciels pour ouvrir sa société de construction | Cantia',
    description:
      "Une liste concrète et ordonnée des outils numériques à mettre en place au moment de créer sa société de construction.",
    faq: [
      { q: 'Quelle est la première étape logicielle à l\'ouverture d\'une société de construction ?', a: 'Configurer un outil de devis/factures avec les bonnes coordonnées et le bon taux de TVA.' },
      { q: 'Faut-il un catalogue de prix complet dès l\'ouverture de la société ?', a: 'Non — il peut se construire progressivement au fil des premiers devis.' },
      { q: 'Est-il utile de tester l\'outil avant le premier vrai client ?', a: 'Oui, pour repérer les ajustements nécessaires sans impact sur un vrai client.' },
    ],
  },
  {
    path: 'blog/logiciel-facturation-conforme-tva-suisse-pas-cher',
    title: 'Facturation conforme TVA suisse à petit prix | Cantia',
    description:
      "La conformité TVA n'est pas réservée aux logiciels chers — voici ce qui doit être présent, même sur un plan économique.",
    faq: [
      { q: 'Un logiciel de facturation pas cher est-il forcément moins conforme sur la TVA ?', a: 'Non — la conformité TVA de base est généralement incluse même sur les plans économiques des outils sérieux.' },
      { q: 'Qu\'est-ce qui différencie un plan premium d\'un plan économique ?', a: 'Généralement des fonctions avancées, pas la conformité TVA de base.' },
      { q: 'Comment vérifier qu\'un logiciel est vraiment conforme avant de s\'engager ?', a: 'En générant une facture test et en vérifiant le taux de TVA, le numéro IDE et la numérotation.' },
    ],
  },
  {
    path: 'blog/meilleur-rapport-qualite-prix-logiciel-pme-batiment',
    title: 'Rapport qualité-prix d\'un logiciel de gestion | Cantia',
    description:
      "Le prix seul ne dit rien du rapport qualité-prix. Une méthode simple pour comparer objectivement plusieurs outils.",
    faq: [
      { q: 'Comment comparer objectivement le rapport qualité-prix de deux logiciels ?', a: 'En listant ses besoins réels et en divisant le prix par le nombre de besoins réellement satisfaits.' },
      { q: 'Le meilleur rapport qualité-prix est-il le même pour toutes les entreprises ?', a: 'Non, il dépend directement du profil de l\'entreprise.' },
      { q: 'Faut-il se fier uniquement aux comparatifs en ligne pour choisir un logiciel ?', a: 'Non, un essai gratuit sur une utilisation réelle donne une image plus fiable.' },
    ],
  },
  {
    path: 'blog/essai-gratuit-logiciel-facturation-suisse',
    title: 'Essai gratuit d\'un logiciel de facturation : bien l\'utiliser | Cantia',
    description:
      "Un essai gratuit ne sert à rien s'il n'est pas utilisé méthodiquement. Comment tester efficacement un outil avant de s'engager.",
    faq: [
      { q: 'Que faut-il tester en priorité pendant un essai gratuit de logiciel de facturation ?', a: 'Créer un vrai devis, le transformer en facture, et vérifier la conformité du PDF généré.' },
      { q: 'Faut-il utiliser l\'essai gratuit régulièrement ou attendre la fin de la période ?', a: 'Il vaut mieux l\'utiliser dès les premiers jours sur de vrais documents.' },
      { q: 'Un essai gratuit doit-il demander une carte bancaire ?', a: 'Pas nécessairement — de nombreux outils sérieux proposent un essai sans carte bancaire.' },
    ],
  },
  {
    path: 'blog/gerer-entreprise-seul-sans-embaucher-outils',
    title: 'Gérer son entreprise seul, avec les bons outils | Cantia',
    description:
      "Certains indépendants préfèrent rester seuls le plus longtemps possible plutôt que d'embaucher trop tôt. Les outils qui rendent ça vraiment tenable.",
    faq: [
      { q: 'Est-il possible de faire grandir son chiffre d\'affaires sans embaucher ?', a: 'Oui, en s\'appuyant sur l\'automatisation administrative et le recours ponctuel à des sous-traitants.' },
      { q: 'Quel est le principal levier pour gérer son entreprise seul efficacement ?', a: 'Automatiser tout ce qui peut l\'être — TVA, numérotation, relances de paiement.' },
      { q: 'Le sous-traitant est-il une bonne alternative à l\'embauche pour un indépendant ?', a: 'Souvent oui, pour absorber un pic d\'activité ponctuel.' },
    ],
  },
  {
    path: 'blog/erreurs-choisir-premier-logiciel-gestion',
    title: 'Les erreurs courantes en choisissant son premier logiciel | Cantia',
    description:
      "Certaines erreurs de choix reviennent sans cesse chez les entreprises qui démarrent — les repérer à l'avance évite une migration forcée.",
    faq: [
      { q: 'Quelle est l\'erreur la plus fréquente en choisissant un premier logiciel de gestion ?', a: 'Choisir uniquement sur le prix affiché, sans jamais tester l\'outil sur des documents réels.' },
      { q: 'Faut-il choisir un outil complexe "au cas où" ?', a: 'Non — un outil trop complexe sous-exploité est souvent moins efficace qu\'un outil simple et évolutif.' },
      { q: 'Combien de temps avant qu\'un mauvais choix de logiciel ne pousse à migrer ?', a: 'Généralement entre 6 et 12 mois.' },
    ],
  },
  {
    path: 'blog/logiciel-gestion-evolutif-grandit-avec-entreprise',
    title: 'Un logiciel qui grandit avec l\'entreprise | Cantia',
    description:
      "Certains outils tiennent la route sur la durée, d'autres montrent leurs limites dès la première embauche. Les signes à repérer.",
    faq: [
      { q: 'Comment savoir si un logiciel de gestion pourra suivre la croissance de l\'entreprise ?', a: 'En vérifiant l\'existence de plans supérieurs, de modules RH/planning et d\'une gestion des rôles.' },
      { q: 'Faut-il payer un plan plus cher dès le départ pour anticiper la croissance ?', a: 'Non — il suffit de choisir un éditeur dont les plans supérieurs restent accessibles sans migration.' },
      { q: 'Quelle question poser à un éditeur pour évaluer l\'évolutivité de son outil ?', a: 'Ce qui se passe en cas de première embauche ou de plusieurs chantiers en parallèle.' },
    ],
  },
  {
    path: 'blog/pourquoi-artisan-independant-besoin-logiciel-des-le-debut',
    title: 'Pourquoi s\'équiper dès le premier jour d\'activité | Cantia',
    description:
      "Beaucoup d'indépendants repoussent l'achat d'un logiciel de gestion \"jusqu'à avoir plus de clients\". Pourquoi c'est souvent l'inverse qui devrait se passer.",
    faq: [
      { q: 'Faut-il attendre d\'avoir plusieurs clients pour investir dans un logiciel de gestion ?', a: 'Non — les habitudes prises dès le début sont difficiles à corriger plus tard.' },
      { q: 'Un bon logiciel est-il plus facile à apprendre au début ou une fois débordé ?', a: 'Au début, avec peu de clients à gérer.' },
      { q: 'Le coût d\'un logiciel de gestion se justifie-t-il dès le premier client ?', a: 'Généralement oui, son coût mensuel restant minime comparé au chiffre d\'affaires d\'un premier chantier.' },
    ],
  },
  {
    path: 'blog/lancer-entreprise-batiment-suisse-par-ou-commencer',
    title: 'Lancer son entreprise du bâtiment en Suisse : par où commencer | Cantia',
    description:
      "Entre le statut juridique, les assurances et les premiers outils, un ordre logique pour ne rien manquer au moment de se lancer.",
    faq: [
      { q: 'Quelle est la première étape pour lancer une entreprise du bâtiment en Suisse ?', a: 'Choisir un statut juridique adapté, puis s\'inscrire au registre du commerce si nécessaire.' },
      { q: 'Faut-il tout avoir en place avant d\'accepter son premier client ?', a: 'Non — le strict nécessaire suffit pour démarrer.' },
      { q: 'À quel moment mettre en place son outil de gestion en lançant son entreprise ?', a: 'Idéalement avant le tout premier client.' },
    ],
  },
  {
    path: 'blog/cantia-adapte-metier-specifique-batiment',
    title: 'Un métier trop spécifique pour un logiciel standard ? | Cantia',
    description:
      "Certains métiers du bâtiment ont des besoins que les outils standards ne couvrent jamais tout à fait. Comment une fonctionnalité sur mesure peut combler cet écart.",
    faq: [
      { q: 'Cantia peut-il développer une fonctionnalité pour un métier très spécifique du bâtiment ?', a: 'Oui — en plus du socle standard, Cantia peut développer des modules sur mesure.' },
      { q: 'Faut-il changer complètement d\'outil pour un besoin métier non standard ?', a: 'Pas nécessairement — une fonctionnalité sur mesure s\'ajoute généralement au socle déjà utilisé.' },
      { q: 'Comment savoir si son besoin spécifique peut être couvert sur mesure ?', a: 'Le plus simple est d\'en discuter directement avec l\'équipe.' },
    ],
  },
  {
    path: 'blog/automatiser-taches-repetitives-entreprise-sans-developpeur',
    title: 'Automatiser sans coder pour une entreprise du bâtiment | Cantia',
    description:
      "L'automatisation n'est plus réservée aux entreprises avec un service informatique. Ce qui peut aujourd'hui être automatisé sans écrire une ligne de code.",
    faq: [
      { q: 'Faut-il des compétences techniques pour automatiser des tâches ?', a: 'Non — de nombreuses automatisations existent déjà de façon standard dans un bon outil de gestion.' },
      { q: 'Quelles tâches peuvent être automatisées en priorité ?', a: 'Les relances de factures impayées, les notifications de devis, et le calcul de rentabilité d\'un chantier.' },
      { q: 'Une automatisation retire-t-elle le contrôle sur les décisions de l\'entreprise ?', a: 'Non, une bonne automatisation reste toujours visible et modifiable manuellement.' },
    ],
  },
  {
    path: 'blog/creer-champ-processus-sur-mesure-logiciel-gestion',
    title: 'Ajouter un champ ou un processus sur mesure | Cantia',
    description:
      "Un formulaire standard ne colle jamais à 100% à la façon de travailler d'une entreprise. Comment un champ ou un processus sur mesure comble ce dernier écart.",
    faq: [
      { q: 'Peut-on ajouter un champ personnalisé à un devis ou une facture dans Cantia ?', a: 'C\'est possible via le développement de fonctionnalités sur mesure.' },
      { q: 'Comment démarre concrètement une demande de champ sur mesure ?', a: 'En général par une discussion directe sur le problème concret rencontré au quotidien.' },
      { q: 'Un champ sur mesure reste-t-il intégré au reste de l\'outil ?', a: 'Oui — il s\'intègre directement aux données existantes, sans ressaisie.' },
    ],
  },
  {
    path: 'blog/logiciel-standard-vs-solution-personnalisee-batiment',
    title: 'Logiciel standard ou 100% sur mesure ? | Cantia',
    description:
      "Entre un outil standard rigide et un développement 100% personnalisé coûteux, il existe une troisième voie : un socle standard complété par du sur-mesure ciblé.",
    faq: [
      { q: 'Un développement logiciel 100% sur mesure est-il un bon choix pour une PME du bâtiment ?', a: 'Rarement, en raison du coût, du délai et de la charge de maintenance à long terme.' },
      { q: 'Quelle est la meilleure option entre logiciel standard et solution personnalisée ?', a: 'Généralement un socle standard bien maintenu, complété par des fonctionnalités sur mesure ciblées.' },
      { q: 'Un outil sur mesure profite-t-il des mises à jour légales comme un outil standard ?', a: 'Si le sur-mesure est développé au-dessus d\'un socle standard bien maintenu, oui.' },
    ],
  },
  {
    path: 'blog/automatiser-rappels-relances-entreprise',
    title: 'Automatiser ses relances : ne plus oublier un impayé | Cantia',
    description:
      "Relancer un client pour une facture impayée ou un devis en attente est souvent la première tâche administrative oubliée. Comment l'automatiser.",
    faq: [
      { q: 'Pourquoi les relances de factures impayées sont-elles souvent oubliées ?', a: 'Parce qu\'elles n\'ont pas de date fixe dans l\'agenda, contrairement à un rendez-vous de chantier.' },
      { q: 'Une relance automatique remplace-t-elle totalement le suivi manuel ?', a: 'Non — une bonne relance automatisée reste modifiable au cas par cas.' },
      { q: 'Quel est l\'impact concret d\'une relance automatique bien calibrée ?', a: 'Généralement 15 à 20 % des factures en retard sont réglées dans les jours suivants.' },
    ],
  },
  {
    path: 'blog/faire-evoluer-outil-gestion-avec-entreprise',
    title: 'Faire évoluer son outil de gestion avec l\'entreprise | Cantia',
    description:
      "Un outil de gestion ne devrait jamais être un frein à la croissance. Comment anticiper ses évolutions plutôt que de les subir.",
    faq: [
      { q: 'Quel est le signal le plus clair qu\'un outil de gestion doit évoluer ?', a: 'L\'apparition d\'un tableur "de secours" à côté de l\'outil principal.' },
      { q: 'Vaut-il mieux anticiper l\'évolution de son outil ou attendre un besoin urgent ?', a: 'Anticiper — cela évite une migration complète, toujours plus coûteuse.' },
      { q: 'À quelle fréquence faire le point sur ses outils de gestion ?', a: 'Une fois par an est une bonne pratique courante.' },
    ],
  },
  {
    path: 'blog/pourquoi-modeles-figes-ne-conviennent-pas-tous-metiers-batiment',
    title: 'Pourquoi un modèle figé ne convient pas à tout le bâtiment | Cantia',
    description:
      "Le bâtiment regroupe des métiers très différents entre eux. Pourquoi un même modèle rigide ne peut logiquement pas convenir à tous en même temps.",
    faq: [
      { q: 'Pourquoi un logiciel générique "bâtiment" ne convient-il pas parfaitement à tous les métiers ?', a: 'Parce que le bâtiment regroupe plus de 15 corps de métier différents, chacun avec ses propres besoins.' },
      { q: 'Qu\'est-ce qui reste commun entre tous les métiers du bâtiment ?', a: 'La grande majorité des besoins de base — devis, factures, conformité TVA, suivi de chantier.' },
      { q: 'Un logiciel doit-il s\'adapter au métier ou l\'inverse ?', a: 'Idéalement l\'outil s\'adapte au métier.' },
    ],
  },
  {
    path: 'blog/demander-fonctionnalite-sur-mesure-editeur-logiciel',
    title: 'Demander une fonctionnalité sur mesure à son éditeur | Cantia',
    description:
      "Beaucoup d'entreprises n'osent jamais demander une fonctionnalité sur mesure. La réalité, et la bonne façon de formuler la demande.",
    faq: [
      { q: 'Une fonctionnalité sur mesure est-elle réservée aux grandes entreprises ?', a: 'Pas nécessairement — cela dépend surtout de la clarté du besoin exprimé.' },
      { q: 'Comment bien formuler une demande de fonctionnalité sur mesure ?', a: 'En décrivant le problème concret rencontré, avec un exemple réel.' },
      { q: 'Que se passe-t-il après avoir formulé une demande sur mesure ?', a: 'Généralement un échange pour cerner précisément le besoin, suivi d\'une proposition concrète.' },
    ],
  },
  {
    path: 'blog/automatiser-suivi-administratif-entreprise-artisanale',
    title: 'Automatiser le suivi administratif, pas que la facturation | Cantia',
    description:
      "L'automatisation se limite souvent, dans l'esprit, à l'envoi de factures. Ce qui peut aussi être automatisé dans le suivi administratif plus large.",
    faq: [
      { q: 'L\'automatisation dans le bâtiment se limite-t-elle à la facturation ?', a: 'Non — le suivi administratif plus large peut aussi être largement automatisé.' },
      { q: 'Quel type d\'automatisation fait généralement le plus gagner de temps ?', a: 'Les automatisations discrètes, en arrière-plan.' },
      { q: 'L\'automatisation du suivi administratif profite-t-elle aussi aux clients ?', a: 'Oui — un rapport de chantier généré rapidement renforce l\'image professionnelle perçue.' },
    ],
  },
  {
    path: 'blog/logiciel-construit-avec-vous-sur-mesure',
    title: 'Un logiciel construit avec vous, pas juste vendu | Cantia',
    description:
      "La différence entre un éditeur qui vend un produit figé et un éditeur qui construit avec ses clients.",
    faq: [
      { q: 'Qu\'est-ce qui différencie un logiciel "construit avec ses clients" d\'un logiciel classique ?', a: 'Les nouvelles fonctionnalités naissent souvent de besoins réels signalés directement par des clients.' },
      { q: 'Un logiciel construit avec ses clients développe-t-il une version différente pour chacun ?', a: 'Non — le socle standard reste commun à tous.' },
      { q: 'Comment un retour client peut-il concrètement influencer l\'évolution de l\'outil ?', a: 'Un problème remonté peut donner naissance à une fonctionnalité qui profite ensuite à tous les utilisateurs.' },
    ],
  },
  {
    path: 'blog/raison-individuelle-sarl-sa-quel-statut-batiment',
    title: 'Raison individuelle, Sàrl ou SA : quel statut pour une entreprise du bâtiment | Cantia',
    description:
      'Raison individuelle, Sàrl ou SA pour se lancer dans le bâtiment en Suisse : capital, responsabilité, coûts de création et le vrai critère de choix, avec un tableau comparatif.',
    faq: [
      { q: 'Peut-on démarrer en raison individuelle et passer en Sàrl plus tard ?', a: 'Oui, c\'est même la trajectoire la plus fréquente dans le bâtiment : démarrer en raison individuelle pour limiter les frais de création, puis basculer vers une Sàrl une fois l\'activité stabilisée et le risque financier devenu significatif.' },
      { q: 'Faut-il un capital minimum pour créer une raison individuelle ?', a: 'Non, aucun capital minimum n\'est exigé pour une raison individuelle, contrairement à la Sàrl (CHF 20’000) ou à la SA (CHF 100’000).' },
      { q: 'La responsabilité illimitée d\'une raison individuelle concerne-t-elle uniquement les biens professionnels ?', a: 'Non, elle engage l\'ensemble du patrimoine personnel de l\'entrepreneur, pas seulement les actifs affectés à l\'activité professionnelle — c\'est la différence essentielle avec une structure à responsabilité limitée.' },
    ],
  },
  {
    path: 'blog/cout-creation-entreprise-construction-suisse',
    title: 'Combien coûte réellement la création d\'une entreprise de construction | Cantia',
    description:
      'Le budget réel pour lancer une entreprise du bâtiment en Suisse : frais d\'inscription, assurances, outillage, trésorerie de départ et le poste que presque personne ne budgète.',
    faq: [
      { q: 'Combien coûte réellement la création d\'une raison individuelle dans le bâtiment ?', a: 'L\'inscription elle-même coûte quasiment rien (numéro IDE gratuit, aucun capital minimum), mais le budget réel de démarrage inclut aussi les assurances, l\'outillage et plusieurs mois de trésorerie de charges fixes, souvent plusieurs milliers de francs au total.' },
      { q: 'Quel est le poste de coût le plus souvent sous-estimé au démarrage ?', a: 'La trésorerie de départ : le délai entre le premier chantier signé et le premier encaissement réel dépasse souvent deux à trois mois, pendant lesquels les charges fixes continuent de tomber.' },
      { q: 'Faut-il souscrire une assurance RC professionnelle dès la création de l\'entreprise ?', a: 'Dans la pratique, presque toujours oui : de nombreux maîtres d\'ouvrage et architectes l\'exigent avant même de signer un premier devis, même quand elle n\'est pas légalement obligatoire pour le métier concerné.' },
    ],
  },
  {
    path: 'blog/immatriculer-entreprise-construction-registre-commerce',
    title: 'Comment immatriculer son entreprise de construction au registre du commerce | Cantia',
    description:
      'La procédure concrète pour inscrire une entreprise du bâtiment au registre du commerce suisse : quand c\'est obligatoire, les étapes, les documents et les délais réels.',
    faq: [
      { q: 'Une raison individuelle doit-elle obligatoirement s\'inscrire au registre du commerce ?', a: 'Seulement à partir de CHF 100’000 de chiffre d\'affaires annuel. En dessous de ce seuil, l\'inscription reste facultative, même si elle peut être utile pour la crédibilité commerciale ou l\'accès à certains marchés.' },
      { q: 'Faut-il un numéro IDE même sans inscription au registre du commerce ?', a: 'Oui, le numéro IDE est nécessaire dès le début de l\'activité indépendante, indépendamment de l\'inscription au registre du commerce, et s\'obtient gratuitement auprès de l\'Office fédéral de la statistique.' },
      { q: 'Combien de temps prend l\'inscription d\'une Sàrl au registre du commerce ?', a: 'Généralement une à trois semaines entre le dépôt du dossier complet chez le notaire et l\'inscription effective, selon le canton et la charge de l\'office du registre du commerce concerné.' },
    ],
  },
  {
    path: 'blog/dix-erreurs-premiere-annee-entreprise-batiment',
    title: 'Les 10 erreurs à éviter la première année d\'une entreprise du bâtiment | Cantia',
    description:
      '10 erreurs qui reviennent le plus souvent chez les jeunes entreprises du bâtiment en Suisse — et comment les éviter, avant qu\'elles ne coûtent une marge entière.',
    faq: [
      { q: 'Quelle est l\'erreur la plus coûteuse la première année d\'une entreprise du bâtiment ?', a: 'Ne pas savoir, chantier par chantier, lequel a réellement fait gagner de l\'argent et lequel a fait perdre : sans ce suivi, une entreprise très occupée peut rester peu rentable sans que personne ne s\'en aperçoive avant la fin de l\'année.' },
      { q: 'Un carnet de commandes plein garantit-il une entreprise rentable ?', a: 'Non, une activité intense peut coexister avec une rentabilité médiocre si certains chantiers sont sous-évalués ou si le suivi financier par chantier n\'existe pas.' },
      { q: 'Combien de temps faut-il prévoir en trésorerie tampon au démarrage ?', a: 'Généralement deux à trois mois de charges fixes, pour couvrir le délai habituel entre le premier chantier signé et le premier encaissement réel.' },
    ],
  },
  {
    path: 'blog/creer-entreprise-batiment-suisse-guide-complet',
    title: 'Créer une entreprise du bâtiment en Suisse : le guide complet | Cantia',
    description:
      'Le parcours complet pour créer une entreprise du bâtiment en Suisse : statut juridique, immatriculation, budget réel, premiers outils, premiers clients et premier employé.',
    faq: [
      { q: 'Par quelle étape commencer pour créer une entreprise du bâtiment en Suisse ?', a: 'Par le choix du statut juridique (raison individuelle, Sàrl ou SA), qui conditionne les démarches d\'immatriculation suivantes et le niveau de risque financier personnel accepté.' },
      { q: 'Faut-il tout mettre en place avant le premier chantier ?', a: 'Non : le statut juridique, l\'assurance RC professionnelle et un outil de devis/factures conforme sont indispensables dès le début, mais le reste (RH, planning multi-équipe, rentabilité fine) peut s\'activer progressivement.' },
      { q: 'Combien de temps prend réellement la création d\'une entreprise du bâtiment en Suisse ?', a: 'Une raison individuelle peut démarrer en quelques jours. Une Sàrl prend généralement une à trois semaines entre le rendez-vous notarial et l\'inscription effective au registre du commerce.' },
    ],
  },
  {
    path: 'blog/application-devis-mobile-artisan',
    title: 'Meilleure application de devis sur mobile pour artisan | Cantia',
    description:
      'Faire un devis directement depuis le chantier change la donne. Ce qu’il faut vérifier avant de choisir une application, et la différence entre une simple calculatrice de devis et un vrai outil de gestion.',
    faq: [
      { q: 'Une application de devis doit-elle vraiment fonctionner hors ligne ?', a: 'Oui, dans la plupart des cas. De nombreux chantiers ont un réseau mobile faible ou inexistant, et une application qui dépend d’une connexion continue devient vite inutilisable sur le terrain.' },
      { q: 'Quelle différence entre une calculatrice de devis et une vraie application de gestion ?', a: 'Une calculatrice se limite généralement à additionner quelques lignes saisies à la main. Un vrai outil de gestion inclut un catalogue de prix réutilisable, un lien direct vers la facturation et un historique par chantier et par client.' },
      { q: 'Peut-on faire signer un devis directement sur le chantier depuis mobile ?', a: 'Oui, avec une application intégrant la signature électronique, le client peut valider le devis sur place, ce qui accélère nettement le passage du devis au chantier confirmé par rapport à un échange de PDF par email.' },
    ],
  },
  {
    path: 'blog/calculer-acomptes-impots-independant-batiment',
    title: 'Comment calculer ses acomptes d’impôts quand on est indépendant du bâtiment | Cantia',
    description:
      'Acomptes provisoires, estimation du revenu, risque de la première année sans historique : comment provisionner correctement ses impôts en tant qu’indépendant du bâtiment.',
    faq: [
      { q: 'Peut-on demander une révision des acomptes en cours d’année ?', a: 'Oui, il est généralement possible de demander une adaptation des acomptes auprès de l’administration fiscale cantonale si le revenu réel s’écarte fortement de l’estimation initiale, à la hausse comme à la baisse.' },
      { q: 'Les acomptes AVS et les acomptes d’impôts se calculent-ils de la même façon ?', a: 'Non, ce sont deux calculs distincts gérés par deux entités différentes : la caisse de compensation pour l’AVS, l’administration fiscale cantonale pour l’impôt. Il ne faut provisionner ni l’un à la place de l’autre, ni un seul des deux.' },
      { q: 'Que se passe-t-il si l’estimation de la première année était trop basse ?', a: 'L’impôt définitif, calculé une fois la déclaration traitée, peut créer un rattrapage important à payer d’un coup. C’est pour cela qu’il vaut mieux provisionner un peu plus que l’estimation initiale plutôt que de viser juste au plus bas.' },
    ],
  },
  {
    path: 'blog/cantia-vs-cresus-facturation',
    title: 'Cantia vs Crésus Facturation : quelle différence pour le bâtiment | Cantia',
    description:
      'Crésus Facturation est un logiciel suisse populaire et abordable, historiquement pensé pour Windows. Cantia est pensée mobile, pour le chantier. Comparaison honnête des deux approches.',
    faq: [
      { q: 'Crésus Facturation suffit-il pour gérer une entreprise du bâtiment ?', a: 'Pour la seule facturation, oui dans bien des cas. Mais Crésus Facturation ne couvre pas le suivi de chantier, la rentabilité par projet ni les devis créés directement sur le terrain, des besoins propres au métier du bâtiment.' },
      { q: 'Quelle est la principale différence entre Crésus Facturation et Cantia ?', a: 'Crésus Facturation est un logiciel généraliste de facturation, simple et abordable. Cantia est pensée spécifiquement pour le déroulement d’un chantier du bâtiment, du devis sur le terrain jusqu’au paiement final.' },
      { q: 'Peut-on utiliser Crésus et Cantia en parallèle ?', a: 'C’est possible pour une période de transition, mais la plupart des entreprises du bâtiment qui adoptent un outil métier comme Cantia finissent par centraliser devis et factures au même endroit pour éviter la double saisie.' },
    ],
  },
  {
    path: 'blog/cantia-vs-klara',
    title: 'Cantia vs Klara : quel logiciel pour une entreprise du bâtiment suisse | Cantia',
    description:
      'Klara est une solution suisse solide de comptabilité et facturation pour indépendants et petites entreprises. Cantia est pensée spécifiquement pour le chantier. Comparaison honnête des deux approches.',
    faq: [
      { q: 'Klara convient-il à une entreprise du bâtiment ?', a: 'Klara peut convenir pour la facturation et la comptabilité générale, mais il n’a pas été conçu spécifiquement pour le bâtiment : pas de suivi de rentabilité par chantier, pas de catalogue de prix métier, pas de rapport de chantier avec photos.' },
      { q: 'Quelle est la principale différence entre Klara et Cantia ?', a: 'Klara est un outil généraliste de comptabilité et facturation pour petites entreprises suisses, tous secteurs confondus. Cantia est pensé spécifiquement pour le déroulement d’un chantier, du premier devis jusqu’au paiement final.' },
      { q: 'Peut-on utiliser Klara et Cantia ensemble ?', a: 'C’est possible : certaines entreprises gardent un outil de comptabilité générale comme Klara pour la clôture annuelle, tout en utilisant Cantia au quotidien pour le pilotage opérationnel des chantiers.' },
    ],
  },
  {
    path: 'blog/cantia-vs-winbiz',
    title: 'Cantia vs Winbiz : comparatif pour artisans du bâtiment | Cantia',
    description:
      'Winbiz est un logiciel suisse établi de comptabilité, facturation et gestion, historiquement orienté poste de travail fixe. Cantia est pensée mobile, pour le chantier. Comparaison factuelle des deux approches.',
    faq: [
      { q: 'Winbiz convient-il à une entreprise du bâtiment ?', a: 'Winbiz couvre bien la comptabilité et la facturation générale, mais il n’a pas été conçu spécifiquement pour le bâtiment ni pour un usage mobile depuis un chantier, contrairement à un outil comme Cantia.' },
      { q: 'Peut-on remplacer Winbiz uniquement par Cantia ?', a: 'Cantia n’est pas un logiciel de comptabilité générale en partie double. Pour la tenue comptable complète, beaucoup d’entreprises gardent un outil dédié comme Winbiz, tout en utilisant Cantia pour le pilotage opérationnel des chantiers.' },
      { q: 'Winbiz fonctionne-t-il bien depuis un chantier, sur mobile ?', a: 'Winbiz reste historiquement plus orienté vers un usage depuis un poste de travail fixe. Pour créer un devis ou documenter un chantier directement sur le terrain, un outil pensé mobile dès le départ, comme Cantia, est généralement plus adapté.' },
    ],
  },
  {
    path: 'blog/checklist-fin-annee-entreprise-batiment',
    title: 'Checklist administrative de fin d’année pour une entreprise du bâtiment | Cantia',
    description:
      'La checklist de fin d’année pour une entreprise du bâtiment en Suisse : impayés, inventaire, certificats de salaire, rentabilité par chantier, acomptes.',
    faq: [
      { q: 'Pourquoi relancer les impayés avant la clôture plutôt qu’après ?', a: 'Parce qu’un impayé identifié et relancé avant la clôture peut encore être encaissé sur l’exercice en cours, alors qu’un impayé reporté sur l’année suivante complique le suivi et retarde d’autant la trésorerie disponible.' },
      { q: 'Comment analyser la rentabilité par chantier en fin d’année ?', a: 'En comparant, pour chaque chantier, le prix facturé au client avec le coût réel (matériel, heures de main-d’œuvre, sous-traitance), pour identifier les types de chantiers qui génèrent effectivement de la marge.' },
      { q: 'Cette checklist remplace-t-elle le travail du fiduciaire ?', a: 'Non, elle prépare le terrain administratif et opérationnel en amont, ce qui rend le travail du fiduciaire sur la clôture comptable proprement dite plus rapide et plus fiable.' },
    ],
  },
  {
    path: 'blog/chomage-intemperies-rht-batiment-suisse',
    title: 'Chômage-intempéries (RHT) dans le bâtiment : comment ça fonctionne | Cantia',
    description:
      'Le mécanisme du chômage-intempéries pour le secteur du bâtiment en Suisse : conditions, démarches auprès de la caisse de chômage, délai de carence et impact sur la trésorerie d’hiver.',
    faq: [
      { q: 'Le chômage-intempéries s’applique-t-il à tous les métiers du bâtiment ?', a: 'Il concerne surtout les travaux extérieurs directement empêchés par les conditions météorologiques, typiquement le gros œuvre et le génie civil. Les métiers qui travaillent principalement en intérieur sont en général moins concernés, sauf si le chantier dans son ensemble est bloqué.' },
      { q: 'Y a-t-il un délai avant que l’indemnisation ne commence ?', a: 'Oui, un délai de carence s’applique généralement en début de période, durant lequel la perte reste à la charge de l’employeur avant que l’indemnisation ne prenne le relais.' },
      { q: 'Faut-il une autorisation préalable pour bénéficier du chômage-intempéries ?', a: 'L’entreprise doit annoncer la perte de travail à la caisse de chômage compétente selon la procédure en vigueur. Il est recommandé de se renseigner à l’avance sur les démarches exactes plutôt que d’attendre la première interruption pour les découvrir.' },
    ],
  },
  {
    path: 'blog/chomage-partiel-entreprise-batiment-suisse',
    title: 'Chômage partiel dans le bâtiment : quand et comment le demander | Cantia',
    description:
      'Réduction de l’horaire de travail (RHT) pour raisons économiques dans le bâtiment : conditions, démarche auprès de l’autorité cantonale, et différence avec le chômage-intempéries.',
    faq: [
      { q: 'Quelle est la différence entre le chômage partiel et le chômage-intempéries ?', a: 'Le chômage-intempéries indemnise l’impossibilité de travailler à cause de conditions météorologiques défavorables, spécifique au bâtiment. Le chômage partiel (RHT) couvre une baisse d’activité pour raisons économiques, indépendamment de la météo.' },
      { q: 'Faut-il l’accord des employés pour mettre en place le chômage partiel ?', a: 'En principe oui, les employés concernés doivent donner leur accord ou à défaut ne pas s’y opposer, selon les modalités applicables. Il est recommandé de bien communiquer avec les équipes avant le dépôt de la demande.' },
      { q: 'Combien de temps avant faut-il déposer une demande de RHT ?', a: 'Un préavis est généralement requis avant la période concernée, mais le délai exact et les démarches varient et sont régulièrement mis à jour par les autorités cantonales. Il est conseillé de se renseigner directement auprès de l’autorité compétente ou de sa fiduciaire.' },
    ],
  },
  {
    path: 'blog/clauses-oubliees-contrat-travail-batiment',
    title: 'Les clauses qu’on oublie dans un contrat de travail du bâtiment | Cantia',
    description:
      'Mobilité entre chantiers, indemnités de déplacement, heures supplémentaires, matériel de service : les clauses fréquemment oubliées dans un contrat de travail du bâtiment.',
    faq: [
      { q: 'Pourquoi la clause de mobilité est-elle importante dans le bâtiment ?', a: 'Parce que, contrairement à un poste de bureau, un employé du bâtiment travaille rarement toujours au même endroit. Sans clause précisant une zone géographique d’affectation, chaque changement de chantier éloigné peut être contesté comme une modification du contrat initial.' },
      { q: 'Faut-il préciser le régime des heures supplémentaires dans le contrat ?', a: 'C’est fortement recommandé, en complément de ce que prévoit la CCT applicable. Préciser comment les heures supplémentaires sont comptabilisées et compensées évite la plupart des désaccords, en particulier sur les chantiers avec des délais serrés.' },
      { q: 'Un modèle de contrat trouvé en ligne est-il suffisant pour une entreprise du bâtiment ?', a: 'Rarement en l’état. Un modèle générique doit être adapté aux spécificités du secteur (mobilité, véhicule de service, indemnités de déplacement) pour offrir une protection réelle, tant à l’employeur qu’à l’employé.' },
    ],
  },
  {
    path: 'blog/declaration-tva-trimestrielle-artisan-suisse',
    title: 'Comment remplir sa déclaration TVA trimestrielle quand on est artisan | Cantia',
    description:
      'Qui doit déclarer la TVA chaque trimestre, quelles données réunir avant de se connecter au portail AFC, et les erreurs les plus fréquentes chez les artisans indépendants.',
    faq: [
      { q: 'Que se passe-t-il si le décompte TVA est déposé en retard ?', a: 'Un intérêt moratoire est généralement appliqué sur le montant dû, même si le décompte est correct. Il vaut mieux déposer un décompte estimé dans les temps et le corriger ensuite que de déposer un décompte exact en retard.' },
      { q: 'Peut-on récupérer la TVA sur l’achat d’un véhicule utilitaire ?', a: 'Oui, dans la mesure où le véhicule est affecté à l’activité professionnelle. La part d’usage privé, si elle existe, doit en revanche être exclue de la déduction ou compensée ensuite.' },
      { q: 'Faut-il déclarer la TVA même si le chiffre d’affaires du trimestre est nul ?', a: 'Oui, une entreprise assujettie doit en principe déposer un décompte à chaque échéance, même vide, tant qu’elle reste inscrite au registre TVA. Ne pas le faire peut entraîner une taxation d’office par l’AFC.' },
    ],
  },
  {
    path: 'blog/delai-declaration-tva-suisse-calendrier',
    title: 'Dates de déclaration TVA en Suisse : le calendrier à ne jamais manquer | Cantia',
    description:
      'Le rythme des échéances TVA en Suisse selon la méthode choisie, la conséquence d’un dépôt tardif, et comment éviter de rater une échéance quand on gère un chantier.',
    faq: [
      { q: 'Que faire si on sait déjà qu’on ne pourra pas respecter l’échéance TVA ?', a: 'Il est possible de demander une prolongation de délai auprès de l’AFC avant l’échéance. Cela évite l’intérêt moratoire automatique lié à un dépôt tardif non annoncé.' },
      { q: 'Le décompte mensuel est-il intéressant pour une petite entreprise du bâtiment ?', a: 'Il peut l’être pour lisser la trésorerie en évitant de provisionner un gros montant trimestriel, mais il multiplie aussi le nombre de démarches administratives dans l’année. C’est un arbitrage à faire selon la taille de l’équipe comptable.' },
      { q: 'L’intérêt moratoire s’applique-t-il même pour quelques jours de retard ?', a: 'Oui, l’intérêt moratoire se calcule généralement dès le lendemain de l’échéance, sans jours de tolérance automatique. Mieux vaut anticiper que compter sur une marge.' },
    ],
  },
  {
    path: 'blog/delai-permis-de-construire-canton-suisse',
    title: 'Délai moyen d’obtention d’un permis de construire, canton par canton | Cantia',
    description:
      'Pourquoi le délai d’obtention d’un permis de construire varie fortement d’un canton et d’une commune à l’autre en Suisse, et comment éviter les principales causes de retard.',
    faq: [
      { q: 'Existe-t-il un délai légal maximal pour traiter un permis de construire en Suisse ?', a: 'Les pratiques varient selon les cantons et les communes, et il n’existe pas de délai unique valable partout en Suisse. Le mieux est de demander directement au service de l’urbanisme concerné le délai indicatif de traitement.' },
      { q: 'Une opposition de voisinage bloque-t-elle automatiquement le chantier ?', a: 'Elle suspend généralement la procédure tant qu’elle n’est pas traitée, ce qui retarde le début du chantier. Le délai final dépend de la nature de l’opposition et de la façon dont elle est résolue, à l’amiable ou par voie de recours.' },
      { q: 'La procédure simplifiée est-elle toujours plus rapide que la procédure ordinaire ?', a: 'En général oui, car elle concerne des projets de faible ampleur avec moins de préavis à recueillir. Mais son éligibilité dépend des critères fixés par chaque canton ou commune, à vérifier avant de compter dessus.' },
    ],
  },
  {
    path: 'blog/devis-facture-ferblantier-suisse',
    title: 'Devis et facturation pour un ferblantier en Suisse | Cantia',
    description:
      'Comment chiffrer un devis et facturer en tant que ferblantier en Suisse : chiffrage au mètre linéaire, lien avec la couverture, coût de la sécurité en hauteur.',
    faq: [
      { q: 'Pourquoi le prix d’une gouttière varie-t-il autant selon le matériau ?', a: 'Le zinc, le cuivre et l’aluminium ont des coûts d’achat et de mise en œuvre différents, et le cuivre en particulier reste nettement plus cher que le zinc, ce qui doit se refléter clairement dans le devis.' },
      { q: 'Faut-il facturer séparément l’échafaudage ou la protection en hauteur ?', a: 'C’est recommandé : cela évite que le client ne compare que le prix au mètre linéaire entre plusieurs devis sans comprendre pourquoi l’un inclut un dispositif de sécurité plus complet que l’autre.' },
      { q: 'Le ferblantier doit-il coordonner son devis avec celui du couvreur ?', a: 'Dans la plupart des cas oui, car les deux interventions se déroulent sur le même échafaudage et souvent dans la même fenêtre de chantier, ce qui permet aussi de mutualiser certains coûts d’accès.' },
    ],
  },
  {
    path: 'blog/devis-facture-frigoriste-climatisation-suisse',
    title: 'Devis et facturation pour un frigoriste-climaticien en Suisse | Cantia',
    description:
      'Comment chiffrer un devis et facturer en tant que frigoriste-climaticien en Suisse : matériel dominant, fluides frigorigènes, contrats d’entretien récurrent.',
    faq: [
      { q: 'Pourquoi le prix d’une climatisation varie-t-il autant entre deux devis ?', a: 'Principalement à cause du matériel : la puissance, la gamme et la technologie de l’unité choisie font varier fortement le prix, bien plus que le temps de pose lui-même.' },
      { q: 'Faut-il facturer le contrat d’entretien séparément de l’installation ?', a: 'C’est recommandé, car cela permet de suivre la rentabilité de chaque activité indépendamment et de lisser le chiffre d’affaires sur l’année plutôt que de tout concentrer sur les mois de forte demande.' },
      { q: 'Qui peut manipuler les fluides frigorigènes lors d’une installation ?', a: 'Uniquement du personnel disposant de la certification professionnelle requise pour ce type de fluide. Le frigoriste doit s’assurer que sa qualification reste valide selon les exigences applicables à son activité.' },
    ],
  },
  {
    path: 'blog/devis-facture-installateur-solaire-suisse',
    title: 'Devis et facturation pour un installateur de panneaux solaires en Suisse | Cantia',
    description:
      'Comment chiffrer un devis et facturer en tant qu’installateur de panneaux solaires en Suisse : poids du matériel, raccordement électrique, subventions et rétribution d’injection.',
    faq: [
      { q: 'Faut-il inclure le raccordement électrique dans le devis solaire ?', a: 'Oui, même si un électricien tiers l’effectue : le client doit voir le prix total de son installation fonctionnelle, raccordement compris, sans découvrir un poste supplémentaire après la pose.' },
      { q: 'Peut-on garantir un montant de subvention sur le devis ?', a: 'Non, ces montants dépendent du canton et du distributeur d’électricité local et peuvent changer. Le devis doit présenter le prix net et renvoyer le client vérifier les conditions exactes avant signature.' },
      { q: 'Comment se protéger d’une hausse du prix du matériel entre le devis et la pose ?', a: 'En limitant la durée de validité du devis, ou en ajoutant une clause de révision si la commande du matériel intervient plusieurs semaines après la signature, ce qui est fréquent sur ce marché en forte demande.' },
    ],
  },
  {
    path: 'blog/devis-facture-platrier-suisse',
    title: 'Devis et facturation pour un plâtrier en Suisse | Cantia',
    description:
      'Comment chiffrer un devis et facturer en tant que plâtrier en Suisse : prix au m² pour cloisons et faux-plafonds, distinction gros-œuvre intérieur et finitions.',
    faq: [
      { q: 'Faut-il séparer le prix des cloisons et celui des enduits sur le devis ?', a: 'Oui, ce sont deux prestations avec des bases de prix différentes. Les regrouper sous un seul prix au m² rend le devis difficile à comparer et à justifier en cas de modification en cours de chantier.' },
      { q: 'Qui décide du niveau de finition attendu avant peinture ?', a: 'Cela doit être précisé au devis, en accord avec le client et si possible avec le peintre qui interviendra ensuite, pour éviter un désaccord sur la qualité du support livré en fin de chantier.' },
      { q: 'Pourquoi deux cloisons de même surface peuvent-elles coûter différemment ?', a: 'La hauteur sous plafond, les découpes autour des ouvertures et l’intégration de gaines techniques font varier le temps de pose réel, indépendamment de la surface brute en m² annoncée.' },
    ],
  },
  {
    path: 'blog/devis-facture-poelier-fumiste-suisse',
    title: 'Devis et facturation pour un poêlier-fumiste en Suisse | Cantia',
    description:
      'Comment chiffrer un devis et facturer en tant que poêlier-fumiste en Suisse : matériel, main-d’œuvre, contrôle du ramoneur officiel, saisonnalité d’automne.',
    faq: [
      { q: 'Qui contrôle une installation de poêle ou de cheminée après la pose ?', a: 'Le ramoneur officiel attribué au secteur, selon les règles cantonales. Ce contrôle est distinct de l’installation elle-même et doit être planifié avec le client dès le devis.' },
      { q: 'Pourquoi les prix des poêles varient-ils autant d’un devis à l’autre ?', a: 'Le matériel est le poste le plus variable : puissance, matériaux, marque et finitions changent fortement le prix d’achat, indépendamment du coût de la pose qui reste plus stable.' },
      { q: 'Comment gérer le pic de demande à l’automne ?', a: 'En incitant les clients à signer leur devis en amont, idéalement avant l’été, pour lisser le planning de pose et sécuriser l’approvisionnement du matériel avant la période de forte demande.' },
    ],
  },
  {
    path: 'blog/devis-facture-ramoneur-suisse',
    title: 'Devis et facturation pour un ramoneur en Suisse | Cantia',
    description:
      'Comment établir devis et factures en tant que ramoneur en Suisse : secteur réglementé par canton, facturation périodique, rapport de contrôle écrit.',
    faq: [
      { q: 'Le ramonage est-il obligatoire partout en Suisse selon les mêmes règles ?', a: 'Le principe d’un contrôle périodique existe largement, mais la fréquence et l’organisation par secteur varient selon le canton. Il est important de vérifier les règles exactes applicables à sa propre zone d’activité.' },
      { q: 'Pourquoi facturer le ramonage par cycle plutôt qu’à l’intervention ?', a: 'Parce que l’activité repose sur des contrôles périodiques récurrents plutôt que sur des chantiers ponctuels, un suivi par cycle facilite à la fois la planification des tournées et la prévisibilité du chiffre d’affaires.' },
      { q: 'Que doit contenir le rapport remis après un contrôle ?', a: 'Un état clair de la conformité de l’installation, daté et signé, remis rapidement au client — ce document peut lui être demandé par son assurance ou lors d’une transaction immobilière.' },
    ],
  },
  {
    path: 'blog/devis-facture-terrassier-suisse',
    title: 'Devis et facturation pour un terrassier en Suisse | Cantia',
    description:
      'Comment chiffrer un devis et facturer en tant que terrassier en Suisse : incertitude sur le terrain, facturation machine et opérateur, clauses pour les imprévus.',
    faq: [
      { q: 'Comment facturer une découverte de roche non prévue au devis ?', a: 'Via un avenant chiffré séparément, à condition que le devis initial mentionne explicitement que le prix se base sur la nature de sol présumée et que toute différence constatée sera facturée en plus.' },
      { q: 'Faut-il facturer le terrassement au forfait ou à l’heure ?', a: 'Un mix des deux est souvent le plus juste : forfait pour les prestations bien définies par les plans, régie horaire (machine et opérateur) pour tout ce qui dépend de la nature réelle du terrain.' },
      { q: 'Pourquoi demander un acompte avant de démarrer un chantier de terrassement ?', a: 'Parce que le terrassier engage des coûts importants de machine et de main-d’œuvre dès le premier jour, souvent avant que le reste du projet soit finalisé, ce qui l’expose davantage en cas d’arrêt du chantier.' },
    ],
  },
  {
    path: 'blog/devis-pompe-a-chaleur-chiffrage',
    title: 'Comment chiffrer un devis d’installation de pompe à chaleur | Cantia',
    description:
      'Comment chiffrer un devis de pompe à chaleur en Suisse : unité, raccordement, forage éventuel, facteurs de variation du prix, lien avec le Programme Bâtiments.',
    faq: [
      { q: 'Pourquoi une pompe à chaleur géothermique coûte-t-elle plus cher qu’une air-eau ?', a: 'Principalement à cause du forage nécessaire pour capter la chaleur du sol, un poste supplémentaire qui n’existe pas pour une solution air-eau, en échange d’un rendement généralement plus stable toute l’année.' },
      { q: 'Faut-il isoler le bâtiment avant d’installer une pompe à chaleur ?', a: 'Ce n’est pas toujours obligatoire, mais l’état de l’isolation conditionne le bon dimensionnement de l’installation. Un diagnostic préalable permet d’éviter une pompe sous- ou surdimensionnée par rapport aux besoins réels.' },
      { q: 'Le remplacement d’un chauffage au mazout par une pompe à chaleur est-il subventionné ?', a: 'Souvent oui, dans le cadre du Programme Bâtiments, mais le montant exact et les conditions dépendent du canton. Le client doit vérifier son éligibilité et le montant précis sur le site cantonal correspondant.' },
    ],
  },
  {
    path: 'blog/diagnostic-amiante-renovation-obligatoire-suisse',
    title: 'Amiante avant rénovation : quand un diagnostic est-il obligatoire | Cantia',
    description:
      'Quels bâtiments sont concernés par le risque amiante avant travaux de rénovation en Suisse, pourquoi c’est la responsabilité de l’entreprise exécutante, et la marche à suivre avant de commencer.',
    faq: [
      { q: 'Un diagnostic amiante est-il obligatoire pour tous les bâtiments anciens ?', a: 'Il est fortement recommandé, et souvent exigé en pratique, dès qu’un bâtiment antérieur aux années 1990 fait l’objet de travaux susceptibles de toucher des matériaux suspects. La prudence s’impose dès le doute, même sans certitude absolue sur la date de construction.' },
      { q: 'Qui doit payer le diagnostic amiante, le maître d’ouvrage ou l’entreprise ?', a: 'Cela dépend généralement de ce qui est convenu contractuellement, mais l’entreprise qui exécute les travaux a intérêt à s’assurer que ce diagnostic existe avant de démarrer, quelle que soit la partie qui le finance.' },
      { q: 'Que faire si de l’amiante est découvert en cours de chantier, sans diagnostic préalable ?', a: 'Il faut arrêter immédiatement les travaux sur la zone concernée, sécuriser le périmètre, et faire intervenir une entreprise spécialisée dans le désamiantage avant toute reprise du chantier.' },
    ],
  },
  {
    path: 'blog/directive-suva-echafaudage-chantier-obligation',
    title: 'Échafaudages de chantier : ce que la directive SUVA impose vraiment | Cantia',
    description:
      'Garde-corps, ancrages, contrôle avant mise en service, formation des utilisateurs : ce que la directive SUVA exige concrètement pour un échafaudage de chantier en Suisse.',
    faq: [
      { q: 'Qui est responsable si un échafaudage loué s’avère non conforme ?', a: 'La responsabilité se partage généralement entre le loueur, qui doit fournir un matériel conforme, et l’entreprise qui l’installe et l’utilise, qui doit vérifier sa conformité avant la mise en service. Le contrat de location précise en principe cette répartition.' },
      { q: 'Faut-il contrôler un échafaudage même s’il n’a pas été touché depuis le montage ?', a: 'Oui, un contrôle régulier reste recommandé même sans intervention apparente, notamment après un épisode de vent fort, car des éléments peuvent se desserrer sans signe visible immédiat.' },
      { q: 'La formation à l’échafaudage est-elle obligatoire pour toute l’équipe de chantier ?', a: 'Elle est surtout exigée pour les personnes qui montent, démontent ou modifient l’échafaudage. Les personnes qui l’utilisent simplement comme poste de travail doivent en revanche être informées des consignes de sécurité de base.' },
    ],
  },
  {
    path: 'blog/etablir-certificat-salaire-lohnausweis-premier-employe',
    title: 'Comment établir un certificat de salaire (Lohnausweis) pour son premier employé | Cantia',
    description:
      'Le certificat de salaire annuel expliqué pour un employeur du bâtiment qui engage son premier employé : contenu obligatoire, formulaire officiel, délai et lien avec la déclaration d’impôts.',
    faq: [
      { q: 'Faut-il établir un certificat de salaire même pour un employé engagé en cours d’année ?', a: 'Oui, un certificat couvre la période réellement travaillée durant l’année civile, même si elle ne fait que quelques mois. Il n’existe pas de seuil minimal de durée d’emploi en dessous duquel l’obligation disparaît.' },
      { q: 'Le certificat de salaire est-il le même document que la déclaration de salaire à la caisse AVS ?', a: 'Non, ce sont deux documents distincts avec des destinataires différents : le certificat de salaire est remis à l’employé pour sa déclaration d’impôts, la déclaration de salaire annuelle est transmise à la caisse de compensation AVS.' },
      { q: 'Comment valoriser l’usage privé d’un véhicule de service sur le certificat de salaire ?', a: 'Une valeur forfaitaire mensuelle est généralement appliquée, calculée sur un pourcentage du prix d’achat du véhicule, sauf si un décompte réel plus précis est tenu. Les règles exactes doivent être vérifiées auprès de sa fiduciaire ou de l’administration fiscale cantonale.' },
    ],
  },
  {
    path: 'blog/facturer-depannage-urgent-sans-devis',
    title: 'Combien facturer un dépannage urgent effectué sans devis préalable | Cantia',
    description:
      'Comment facturer une intervention d’urgence sans devis signé : forfait de déplacement, tarif horaire majoré, documentation de l’intervention et majorations courantes.',
    faq: [
      { q: 'Peut-on facturer un dépannage sans avoir fait signer de devis ?', a: 'Oui, c’est une pratique courante et légale pour les interventions urgentes, à condition de pouvoir démontrer que le client était informé du principe de facturation et, idéalement, d’un ordre de grandeur avant l’intervention. Un bon d’intervention signé sur place reste la meilleure protection.' },
      { q: 'Quel forfait appliquer pour un déplacement d’urgence ?', a: 'Il n’existe pas de montant standard imposé : chaque entreprise définit son propre forfait selon sa zone d’intervention et ses coûts réels. L’essentiel est de l’indiquer clairement dans les conditions générales et de le communiquer au client avant le déplacement.' },
      { q: 'Comment se protéger si le client conteste une facture de dépannage urgent ?', a: 'En documentant systématiquement l’intervention : bon signé, photos, horodatage, et si possible une trace écrite (SMS ou email) informant le client du principe de facturation avant le déplacement. Ces éléments sont souvent décisifs en cas de désaccord.' },
    ],
  },
  {
    path: 'blog/facturer-frais-deplacement-client-artisan',
    title: 'Faut-il facturer les frais de déplacement à ses clients | Cantia',
    description:
      'Forfait kilométrique, tarif horaire incluant le trajet, ou gratuité dans un rayon donné : les pratiques courantes pour facturer le déplacement, et comment le rendre transparent.',
    faq: [
      { q: 'Peut-on facturer le déplacement même pour un petit chantier ?', a: 'Oui, rien ne l’interdit, à condition que ce soit annoncé clairement dans le devis ou dans les conditions générales avant l’intervention. C’est la transparence, plus que le montant, qui détermine si le client l’acceptera sans contester.' },
      { q: 'Vaut-il mieux inclure le déplacement dans le tarif horaire ou le facturer à part ?', a: 'Les deux approches existent et fonctionnent. Inclure le déplacement dans le tarif horaire simplifie le devis mais peut désavantager l’entreprise sur les chantiers proches ; le facturer à part est plus juste sur la distance mais ajoute une ligne à expliquer au client.' },
      { q: 'Comment fixer un forfait de déplacement cohérent ?', a: 'En partant du coût réel (temps de trajet non facturable, carburant, usure du véhicule) plutôt que d’un montant arbitraire copié sur la concurrence. Un forfait par zone de distance est souvent plus simple à gérer qu’un calcul au kilomètre exact.' },
    ],
  },
  {
    path: 'blog/google-sheets-partage-equipe-limites-batiment',
    title: 'Tableur partagé en équipe : pourquoi ça craque à partir de combien de personnes | Cantia',
    description:
      'Un Google Sheets partagé fonctionne bien seul, mais craque dès que plusieurs personnes y touchent en même temps. Conflits d’édition, accès non contrôlé, versions qui divergent : le point de rupture en équipe.',
    faq: [
      { q: 'À partir de combien de personnes un Google Sheets partagé devient-il problématique ?', a: 'Généralement à partir de quatre ou cinq personnes actives sur le même fichier, les conflits d’édition, les versions divergentes et le manque de contrôle d’accès deviennent une gêne régulière plutôt qu’une exception.' },
      { q: 'Un tableur partagé peut-il gérer des accès différents selon l’employé ?', a: 'Pas de façon fiable dans la plupart des cas. Un tableur partagé donne généralement le même niveau de visibilité à tous, sans distinction entre ce qu’un ouvrier et un gérant devraient voir.' },
      { q: 'Le problème vient-il d’une mauvaise utilisation du tableur ?', a: 'Non, il vient surtout de l’outil lui-même : un tableur n’a pas été conçu pour gérer des accès différenciés, des notifications de modification ou un travail simultané à plusieurs sur des données actives.' },
    ],
  },
  {
    path: 'blog/horaires-bruit-chantier-autorises-suisse',
    title: 'Bruit de chantier : les horaires autorisés selon les communes suisses | Cantia',
    description:
      'Pourquoi les horaires de bruit de chantier dépendent de chaque commune en Suisse, les plages généralement admises, et comment réagir face à une plainte de voisinage.',
    faq: [
      { q: 'Existe-t-il une règle fédérale sur les horaires de bruit de chantier en Suisse ?', a: 'Non, la réglementation relève principalement des communes, qui fixent leurs propres horaires dans leur règlement de police des constructions. Il faut donc vérifier au cas par cas, commune par commune.' },
      { q: 'Peut-on obtenir une dérogation pour travailler en dehors des horaires autorisés ?', a: 'C’est possible dans certaines communes, pour des interventions ponctuelles justifiées, mais la demande doit généralement être faite en amont auprès du service communal compétent, pas après coup.' },
      { q: 'Que faire si un voisin se plaint alors que les horaires réglementaires sont respectés ?', a: 'Il est utile de pouvoir démontrer, avec un planning précis, que les horaires communaux ont bien été respectés. Un dialogue direct avec le voisin, accompagné d’une information préalable sur la durée du chantier, permet souvent d’éviter que la situation ne s’envenime.' },
    ],
  },
  {
    path: 'blog/independant-reconnu-avs-batiment',
    title: 'Indépendant reconnu par l’AVS dans le bâtiment : ce que ça change vraiment | Cantia',
    description:
      'Les critères de reconnaissance du statut d’indépendant par la caisse de compensation AVS, et le risque de requalification pour les sous-traitants du bâtiment qui ne sont pas reconnus.',
    faq: [
      { q: 'Un sous-traitant avec un seul client est-il automatiquement requalifié en salarié ?', a: 'Pas automatiquement, mais c’est l’un des critères les plus lourds examinés par la caisse de compensation. Travailler pour un seul donneur d’ordre de façon durable augmente fortement le risque de requalification si les autres critères d’indépendance ne sont pas non plus réunis.' },
      { q: 'Qui paie les cotisations en cas de requalification rétroactive ?', a: 'En général, l’entreprise cliente est considérée comme l’employeur de fait et doit régulariser les cotisations sociales dues sur la période concernée, avec les intérêts moratoires. C’est pour cela que le risque pèse aussi sur le donneur d’ordre, pas uniquement sur le sous-traitant.' },
      { q: 'Comment vérifier qu’un sous-traitant est bien reconnu comme indépendant par l’AVS ?', a: 'En lui demandant son attestation de reconnaissance d’indépendant délivrée par sa caisse de compensation. C’est un document officiel, distinct d’une simple inscription au registre du commerce.' },
    ],
  },
  {
    path: 'blog/instagram-ou-facebook-artisan-batiment',
    title: 'Facebook ou Instagram : quel réseau pour un artisan du bâtiment | Cantia',
    description:
      'Facebook et Instagram ne touchent pas le même public ni le même usage. Lequel privilégier selon sa clientèle, et pourquoi il vaut mieux bien alimenter un seul réseau plutôt que d’en abandonner deux.',
    faq: [
      { q: 'Faut-il être présent sur Facebook et Instagram à la fois ?', a: 'Ce n’est pas nécessaire au démarrage. Mieux vaut choisir le réseau le plus adapté à sa clientèle et l’alimenter régulièrement, plutôt que de se disperser sur deux comptes peu actifs.' },
      { q: 'Instagram est-il utile pour une entreprise du bâtiment qui travaille surtout avec des particuliers locaux ?', a: 'Il peut l’être pour des activités très visuelles comme la rénovation esthétique ou l’aménagement, mais pour une clientèle très locale et orientée recommandation, Facebook et ses groupes de quartier restent souvent plus efficaces.' },
      { q: 'Combien de temps faut-il consacrer aux réseaux sociaux en tant qu’artisan ?', a: 'Généralement très peu si l’activité est déjà documentée par des photos de chantier : quelques minutes suffisent pour publier une photo avant/après avec une légende courte, sans que cela devienne une charge de travail à part entière.' },
    ],
  },
  {
    path: 'blog/lire-fiche-de-salaire-batiment',
    title: 'Comment expliquer une fiche de salaire à un employé du bâtiment | Cantia',
    description:
      'Structure d’une fiche de salaire suisse (brut, déductions AVS/AI/APG, AC, LPP, LAANP, net) et comment l’expliquer simplement à un employé du bâtiment.',
    faq: [
      { q: 'Pourquoi le salaire net est-il tellement inférieur au salaire brut ?', a: 'Parce que plusieurs cotisations sociales obligatoires sont déduites du brut avant versement : AVS/AI/APG, assurance-chômage, prévoyance professionnelle (LPP), et parfois l’assurance accidents non professionnels. Ces déductions financent des prestations sociales concrètes.' },
      { q: 'Toutes les déductions sont-elles identiques d’un employé à l’autre ?', a: 'Non, certaines déductions dépendent du salaire, de l’âge (notamment pour la LPP) ou du statut de l’employé. C’est pourquoi deux fiches de salaire avec un même montant brut peuvent afficher un net légèrement différent.' },
      { q: 'Faut-il expliquer la fiche de salaire à chaque nouvel employé ?', a: 'C’est fortement recommandé, en particulier lors du premier mois. Une explication simple, ligne par ligne, évite la plupart des questions et malentendus récurrents sur l’écart entre salaire brut et salaire net.' },
    ],
  },
  {
    path: 'blog/logiciel-signature-electronique-chantier',
    title: 'Logiciel de gestion chantier avec signature électronique : lequel choisir | Cantia',
    description:
      'Signature sur tablette directement sur le chantier, horodatage automatique, document archivé et retrouvable : ce qu’il faut chercher dans un outil pour éviter les contestations de fin de chantier.',
    faq: [
      { q: 'La signature électronique sur un logiciel de chantier a-t-elle une valeur légale en Suisse ?', a: 'Dans la plupart des cas pour un devis ou un document commercial courant, oui. La question de la valeur légale précise selon le type de document est traitée en détail dans notre article dédié à la signature électronique en Suisse.' },
      { q: 'Pourquoi l’horodatage automatique est-il important ?', a: 'Il fixe de façon fiable le moment exact de la signature, indépendamment de toute modification ultérieure. C’est souvent cet élément, autant que la signature elle-même, qui pèse en cas de contestation.' },
      { q: 'Comment éviter de perdre un document signé quelques mois après le chantier ?', a: 'En choisissant un outil qui archive automatiquement chaque document signé et le rattache directement au chantier concerné, plutôt que de dépendre d’une recherche dans des emails ou des fichiers dispersés.' },
    ],
  },
  {
    path: 'blog/marge-beneficiaire-entreprise-batiment-suisse',
    title: 'Quelle marge bénéficiaire viser dans le bâtiment en Suisse | Cantia',
    description:
      'Marge brute, marge nette, fourchettes réalistes selon le corps de métier, et pourquoi une marge trop basse peut tuer une entreprise malgré un carnet de commandes plein.',
    faq: [
      { q: 'Quelle est la différence entre marge brute et marge nette ?', a: 'La marge brute ne déduit que les coûts directs d’un chantier (matériaux, main-d’œuvre affectée). La marge nette déduit en plus toutes les charges de structure de l’entreprise. Une entreprise peut avoir une bonne marge brute chantier par chantier et une marge nette insuffisante si ses frais fixes sont mal répercutés.' },
      { q: 'Quelle marge nette viser dans le bâtiment en Suisse ?', a: 'Il n’existe pas de chiffre universel, mais une marge nette confortable se situe généralement entre 8 et 15 % du chiffre d’affaires selon le corps de métier et la taille de l’entreprise. Ces repères doivent être ajustés à votre structure de coûts réelle.' },
      { q: 'Pourquoi une entreprise très occupée peut-elle quand même perdre de l’argent ?', a: 'Parce qu’être occupé ne veut pas dire être rentable : si les prix pratiqués ne couvrent pas correctement les coûts réels et les charges de structure, plus l’entreprise travaille, plus elle accumule de la perte sur chaque chantier mal chiffré.' },
    ],
  },
  {
    path: 'blog/negocier-prix-client-compare-plusieurs-devis',
    title: 'Comment répondre à un client qui compare trois devis sans baisser son prix | Cantia',
    description:
      'Baisser systématiquement son prix face à la concurrence est rarement la bonne réponse. Comment défendre son devis avec des arguments concrets, et quand un ajustement reste légitime.',
    faq: [
      { q: 'Faut-il toujours refuser de baisser son prix face à la concurrence ?', a: 'Non, mais une baisse doit se justifier par un changement concret (volume, simplification du travail, conditions de paiement), pas uniquement par la peur de perdre le chantier face à un devis concurrent.' },
      { q: 'Comment réagir si un devis concurrent est anormalement bas ?', a: 'Expliquer factuellement ce que couvre son propre prix (matériaux, assurance, garanties, délai) permet souvent au client de comprendre pourquoi l’écart existe, sans avoir à critiquer directement le concurrent.' },
      { q: 'Un client qui compare plusieurs devis cherche-t-il forcément le moins cher ?', a: 'Pas toujours. Beaucoup de clients comparent surtout pour se rassurer sur le sérieux de l’entreprise choisie. Des références solides et un devis clair pèsent souvent autant que le prix dans la décision finale.' },
    ],
  },
  {
    path: 'blog/norme-aeai-incendie-batiment-obligation',
    title: 'Norme incendie AEAI : ce qu’un artisan doit connaître avant un chantier | Cantia',
    description:
      'Le rôle de l’AEAI dans la protection incendie en Suisse, ce que ça implique concrètement pour un artisan (matériaux classés, cloisons coupe-feu, issues de secours) et le risque d’ignorer la norme.',
    faq: [
      { q: 'Qui vérifie le respect de la norme incendie AEAI sur un chantier ?', a: 'Le contrôle est généralement effectué par l’autorité cantonale compétente en matière de protection incendie ou par un mandataire spécialisé, souvent au moment de la réception de l’ouvrage.' },
      { q: 'Toutes les cloisons d’un bâtiment doivent-elles être coupe-feu ?', a: 'Non, seules certaines zones sont concernées, notamment les séparations entre logements, les cages d’escalier et les gaines techniques. Les exigences précises dépendent de l’usage et de la configuration du bâtiment, à vérifier sur les plans d’exécution.' },
      { q: 'Que risque une entreprise qui pose un matériau non conforme à la norme incendie ?', a: 'Elle risque un refus de réception du chantier et l’obligation de reprendre les travaux à ses frais, en plus d’une responsabilité engagée en cas de sinistre où la non-conformité serait constatée.' },
    ],
  },
  {
    path: 'blog/periode-essai-batiment-duree-legale',
    title: 'Période d’essai dans le bâtiment : durée légale et ce qu’on peut y faire | Cantia',
    description:
      'Durée légale de la période d’essai selon le Code des obligations, possibilité de la prolonger contractuellement, délai de congé raccourci, et spécificités CCT bâtiment.',
    faq: [
      { q: 'Quelle est la durée maximale de la période d’essai dans le bâtiment ?', a: 'Le régime légal par défaut est d’un mois si rien n’est précisé au contrat, mais les parties peuvent convenir par écrit d’une durée allant généralement jusqu’à trois mois. Vérifiez également les éventuelles dispositions spécifiques de la CCT applicable à votre entreprise.' },
      { q: 'Peut-on prolonger la période d’essai en cas de maladie de l’employé ?', a: 'Oui, une absence pour cause de maladie, accident ou service obligatoire pendant la période d’essai peut la prolonger d’une durée équivalente, dans les limites prévues par la loi. Cela permet à l’employeur de disposer réellement du temps d’essai prévu au contrat.' },
      { q: 'Le délai de congé est-il le même pendant et après la période d’essai ?', a: 'Non, le délai de congé pendant la période d’essai est nettement plus court que celui applicable une fois l’essai terminé. Il est recommandé de vérifier le délai exact prévu par le contrat et, le cas échéant, par la CCT applicable.' },
    ],
  },
  {
    path: 'blog/prix-isolation-facade-m2-suisse',
    title: 'Combien coûte une isolation de façade au m² en Suisse | Cantia',
    description:
      'Fourchettes CHF/m² réalistes pour une isolation de façade en Suisse selon le type de système (crépi isolant, bardage ventilé), avec le lien vers les subventions cantonales.',
    faq: [
      { q: 'Quel est le prix moyen d’une isolation de façade au m² en Suisse ?', a: 'Pour une isolation sous crépi, comptez généralement entre CHF 180 et 280 par m², fourniture et pose comprises. Un bardage ventilé coûte plus cher, souvent entre CHF 300 et 450 par m². Ces fourchettes varient selon la région et la complexité de la façade.' },
      { q: 'Les subventions cantonales couvrent-elles une part importante du coût ?', a: 'Cela dépend fortement du canton et évolue régulièrement, généralement via le Programme Bâtiments. Il est recommandé d’orienter le client vers le service cantonal de l’énergie pour connaître les montants et conditions exacts au moment du projet.' },
      { q: 'Le bardage ventilé est-il toujours plus cher que le crépi isolant ?', a: 'Dans la plupart des cas oui, mais le bardage offre une meilleure durabilité dans le temps et davantage de possibilités esthétiques. Le choix dépend souvent autant du budget que du rendu recherché par le client.' },
    ],
  },
  {
    path: 'blog/prix-refection-toiture-suisse',
    title: 'Combien coûte la réfection d’une toiture en Suisse | Cantia',
    description:
      'Fourchettes CHF/m² réalistes pour une réfection de toiture en Suisse selon le matériau (tuiles, ardoise, étanchéité plate), et pourquoi une visite sur place reste indispensable.',
    faq: [
      { q: 'Quel est le prix moyen d’une réfection de toiture en tuiles en Suisse ?', a: 'Pour la couverture seule, comptez généralement entre CHF 250 et 400 par m². Ce montant n’inclut pas une éventuelle intervention sur la charpente, qui peut représenter un coût supplémentaire important selon son état.' },
      { q: 'Pourquoi les devis de toiture donnés par téléphone sont-ils peu fiables ?', a: 'Parce que l’état de la charpente, souvent le facteur de coût le plus variable, ne peut être évalué qu’en inspectant le bâtiment sur place, parfois depuis les combles. Un chiffre donné sans visite reste une estimation très grossière.' },
      { q: 'Faut-il prévoir une clause pour l’état de la charpente dans le devis ?', a: 'C’est fortement recommandé. Une clause précisant qu’un complément pourra être facturé si la charpente se révèle plus dégradée qu’anticipé protège l’entreprise sans surprendre le client, à condition de l’expliquer clairement avant signature.' },
    ],
  },
  {
    path: 'blog/prix-renovation-cuisine-suisse',
    title: 'Prix moyen d’une rénovation de cuisine en Suisse | Cantia',
    description:
      'Fourchettes réalistes pour une rénovation de cuisine en Suisse selon le standing (agencement standard, milieu de gamme, sur mesure), avec le détail poste par poste.',
    faq: [
      { q: 'Quel est le prix moyen d’une cuisine standard posée en Suisse ?', a: 'Pour une cuisine en kit de série avec pose et électroménager d’entrée de gamme, comptez généralement entre CHF 12’000 et 20’000 pour une surface de 8 à 10 m². Le prix grimpe rapidement dès qu’on passe à du semi-sur-mesure.' },
      { q: 'Pourquoi une cuisine sur mesure coûte-t-elle tellement plus cher ?', a: 'Le sur-mesure implique une fabrication spécifique à l’espace (pas de dimensions standardisées), souvent des matériaux plus nobles, et un temps de pose plus long. L’écart avec une cuisine en kit peut atteindre le double ou le triple pour une surface identique.' },
      { q: 'Faut-il inclure l’électroménager dans le devis global de cuisine ?', a: 'C’est fortement recommandé, même sous forme de fourchette indicative si le client n’a pas encore choisi ses appareils. Cela évite les mauvaises surprises et donne une vision réaliste du budget total dès le premier devis.' },
    ],
  },
  {
    path: 'blog/prix-renovation-salle-de-bain-suisse-m2',
    title: 'Prix moyen d’une rénovation de salle de bain en Suisse | Cantia',
    description:
      'Fourchettes réalistes pour une rénovation de salle de bain en Suisse (standard vs haut de gamme), poste par poste : sanitaire, carrelage, plomberie, électricité, étanchéité.',
    faq: [
      { q: 'Quel est le prix d’une salle de bain de 5 m² tout compris en Suisse ?', a: 'Pour une rénovation complète (sanitaires, carrelage, plomberie, électricité) en milieu de gamme, comptez généralement entre CHF 15’000 et 25’000. Le prix varie fortement selon l’état des installations existantes et les matériaux choisis.' },
      { q: 'Pourquoi déplacer un point d’eau coûte-t-il si cher ?', a: 'Déplacer une arrivée ou une évacuation implique de casser la chape existante, de modifier les canalisations et de refaire l’étanchéité sur la zone concernée. C’est un travail qui demande plusieurs corps de métier en cascade, d’où un surcoût souvent significatif par rapport à un remplacement à l’identique.' },
      { q: 'Faut-il prévoir une marge pour imprévus dans un devis de rénovation de salle de bain ?', a: 'Oui, c’est fortement recommandé dès que les murs ou le sol existants sont ouverts : l’état réel des conduites n’est visible qu’après démolition. Une provision explicite dans le devis évite les mauvaises surprises pour le client comme pour l’entreprise.' },
    ],
  },
  {
    path: 'blog/programme-batiments-subvention-renovation-suisse',
    title: 'Le Programme Bâtiments : ce qu’un artisan doit savoir pour ses clients | Cantia',
    description:
      'Le Programme Bâtiments soutient la rénovation énergétique en Suisse : isolation, remplacement de chauffage fossile. Ce qu’un artisan doit savoir pour informer ses clients.',
    faq: [
      { q: 'Le Programme Bâtiments est-il le même dans tous les cantons ?', a: 'Le cadre général est commun à la Confédération et aux cantons, mais chaque canton administre son propre programme avec ses conditions et montants spécifiques. Il faut toujours vérifier les règles du canton concerné.' },
      { q: 'Un artisan peut-il garantir un montant de subvention à son client ?', a: 'Non, ce n’est pas son rôle et les montants exacts dépendent de critères cantonaux qui évoluent. Le client doit vérifier lui-même le montant exact sur le site du programme cantonal avant de compter dessus dans son budget.' },
      { q: 'Faut-il déposer la demande de subvention avant de commencer les travaux ?', a: 'Cela dépend du canton et du type de travaux : certains programmes exigent que la demande soit déposée, voire validée, avant le début du chantier. C’est un point à vérifier systématiquement avant de signer un devis.' },
    ],
  },
  {
    path: 'blog/provoquer-bouche-a-oreille-artisan',
    title: 'Bouche-à-oreille : comment le provoquer plutôt que l’attendre | Cantia',
    description:
      'Le bouche-à-oreille ne se limite pas à la qualité du travail. Le moment où il se déclenche, la dernière impression laissée sur le chantier et les petits déclencheurs qui font vraiment parler.',
    faq: [
      { q: 'Quel est le meilleur moment pour demander une recommandation à un client ?', a: 'Juste après la fin d’un chantier réussi, quand la satisfaction est la plus forte. Attendre trop longtemps réduit fortement les chances d’obtenir une recommandation spontanée.' },
      { q: 'La qualité technique suffit-elle à générer du bouche-à-oreille ?', a: 'Pas toujours. La dernière impression, notamment la propreté et la ponctualité en fin de chantier, joue souvent un rôle au moins aussi important que la qualité technique perçue par un client non expert.' },
      { q: 'Faut-il mettre en place un programme de parrainage pour générer du bouche-à-oreille ?', a: 'Ce n’est pas indispensable pour démarrer. Des déclencheurs simples et non formels (demander une photo, soigner la fin de chantier) suffisent souvent. Un programme structuré avec incitations peut ensuite venir compléter cette base.' },
    ],
  },
  {
    path: 'blog/relancer-client-devis-sans-reponse',
    title: 'Comment relancer un client qui ne répond plus après un devis | Cantia',
    description:
      'Un silence après un devis n’est pas forcément un refus. Le calendrier de relance à respecter, le ton à adopter et les erreurs qui font perdre un chantier encore possible.',
    faq: [
      { q: 'Au bout de combien de temps faut-il relancer un client après un devis ?', a: 'Une première relance quelques jours après l’envoi reste raisonnable, suivie d’une deuxième plus tard, avant l’expiration de la validité du devis. Au-delà, mieux vaut espacer largement plutôt que d’insister trop souvent.' },
      { q: 'Un client qui ne répond pas a-t-il forcément choisi un concurrent ?', a: 'Pas nécessairement. Le silence traduit souvent une décision encore en cours, une comparaison de devis non terminée ou simplement un oubli. Une relance courte et sans pression permet souvent de le savoir.' },
      { q: 'Faut-il baisser le prix dans une relance de devis sans réponse ?', a: 'Non, pas d’emblée. Il est préférable de d’abord comprendre la raison du silence (question technique, délai, budget) avant d’envisager un ajustement, plutôt que de baisser le prix sans savoir ce qui bloque réellement.' },
    ],
  },
  {
    path: 'blog/repondre-appel-offres-public-batiment-etapes',
    title: 'Comment répondre à un appel d’offres public dans le bâtiment, étape par étape | Cantia',
    description:
      'Où trouver les appels d’offres publics, comment monter un dossier complet et sur quels critères les collectivités suisses évaluent réellement les offres. Un guide concret pour se lancer.',
    faq: [
      { q: 'Une petite entreprise a-t-elle vraiment une chance sur un appel d’offres public ?', a: 'Oui, dans la mesure où le prix n’est généralement pas le seul critère : les références, les délais et la qualité du dossier comptent aussi. Une petite structure bien préparée, avec de bonnes références locales, peut tout à fait l’emporter face à une entreprise plus grande.' },
      { q: 'Où surveiller les appels d’offres publics dans le bâtiment en Suisse ?', a: 'Principalement sur les plateformes cantonales dédiées aux marchés publics et sur simap.ch pour les marchés soumis aux accords intercantonaux, en complément des publications communales. Une alerte par mot-clé évite de devoir vérifier manuellement chaque semaine.' },
      { q: 'Que se passe-t-il si un document du dossier est manquant ?', a: 'Dans la plupart des cas, un dossier incomplet ou déposé après le délai est purement et simplement écarté avant même l’évaluation du prix ou des références. La rigueur administrative est donc au moins aussi importante que le contenu de l’offre elle-même.' },
    ],
  },
  {
    path: 'blog/repondre-avis-negatif-google-artisan',
    title: 'Comment répondre à un avis Google négatif quand on est artisan | Cantia',
    description:
      'Un avis négatif fait mal, mais mal y répondre fait plus mal encore. Le ton à adopter, quand passer en message privé, et ce qu’il ne faut jamais faire face à un avis Google défavorable.',
    faq: [
      { q: 'Faut-il toujours répondre à un avis Google négatif ?', a: 'Oui, presque toujours, même brièvement. Une réponse absente est souvent perçue comme un désintérêt, alors qu’une réponse posée rassure les futurs clients qui liront l’avis bien après le client concerné.' },
      { q: 'Peut-on faire supprimer un avis Google négatif ?', a: 'Uniquement s’il enfreint les règles de Google (contenu diffamatoire, faux avis, hors sujet). Un avis légitime, même sévère, doit dans la plupart des cas être traité par une réponse plutôt que par une tentative de suppression.' },
      { q: 'Faut-il proposer un remboursement ou un geste commercial en public ?', a: 'Non, ce type de détail se traite généralement en message privé. La réponse publique doit rester factuelle et courte, et inviter le client à poursuivre l’échange en privé pour trouver une solution.' },
    ],
  },
  {
    path: 'blog/seuil-lpp-affiliation-employe-batiment',
    title: 'À partir de quel salaire un employé doit-il être affilié à la LPP | Cantia',
    description:
      'Le seuil d’entrée LPP, la coordination avec l’AVS, et les démarches concrètes de l’employeur pour affilier correctement un employé du bâtiment à la prévoyance professionnelle.',
    faq: [
      { q: 'Le seuil d’entrée LPP est-il le même pour tous les employeurs ?', a: 'Oui, c’est un seuil fixé au niveau fédéral, applicable de la même façon à toutes les entreprises suisses, quel que soit leur secteur. Seul son montant est révisé chaque année.' },
      { q: 'Un employé en dessous du seuil peut-il quand même être affilié à la LPP ?', a: 'Oui, une affiliation volontaire reste possible dans certains cas, notamment via une institution supplétive, même si elle n’est pas imposée par la loi en dessous du seuil.' },
      { q: 'Qui paie la part employeur de la LPP ?', a: 'L’employeur doit verser une part au moins équivalente à celle retenue sur le salaire de l’employé, selon les règles fixées par la loi et le règlement de la caisse de pension choisie.' },
    ],
  },
  {
    path: 'blog/site-internet-ou-carte-de-visite-artisan',
    title: 'Site internet ou carte de visite : lequel prioriser en premier | Cantia',
    description:
      'Quand le budget et le temps sont limités au démarrage, faut-il investir d’abord dans un site internet ou dans une carte de visite ? Les arguments des deux côtés, et une solution intermédiaire réaliste.',
    faq: [
      { q: 'Peut-on démarrer une entreprise du bâtiment sans site internet ?', a: 'Oui, dans les premiers mois, une carte de visite et une fiche Google Business Profile bien tenue suffisent généralement à couvrir l’essentiel des besoins, en attendant d’avoir le temps ou le budget pour un site plus complet.' },
      { q: 'Quand devient-il vraiment nécessaire d’avoir un site internet ?', a: 'Dès que le bouche-à-oreille commence à amener des clients qui cherchent à vérifier l’entreprise avant de contacter, un site simple avec quelques photos de chantiers devient utile pour rassurer et convertir ces recherches.' },
      { q: 'Une fiche Google Business Profile remplace-t-elle vraiment un site internet ?', a: 'Elle ne le remplace pas complètement, mais elle en couvre l’essentiel pour démarrer : visibilité locale, photos, avis, coordonnées. Un vrai site apporte davantage de contrôle et de contenu par la suite.' },
    ],
  },
  {
    path: 'blog/travailleur-detache-batiment-suisse-regles',
    title: 'Travailleur détaché dans le bâtiment suisse : les règles à connaître | Cantia',
    description:
      'Définition du détachement, procédure d’annonce préalable, respect des conditions de salaire et de travail suisses, et risques en cas de non-respect sur un chantier.',
    faq: [
      { q: 'Faut-il annoncer chaque intervention d’une entreprise étrangère sur un chantier suisse ?', a: 'Dans la plupart des cas oui, via la procédure d’annonce préalable prévue à cet effet, avant le début des travaux. Les modalités exactes et les éventuelles exceptions doivent être vérifiées auprès des autorités compétentes, car elles peuvent évoluer.' },
      { q: 'Un travailleur détaché doit-il être payé selon les conditions suisses ?', a: 'Généralement oui, notamment lorsque le chantier est soumis à une CCT étendue du secteur, qui fixe des conditions de salaire et de travail minimales applicables à tous les intervenants, y compris détachés.' },
      { q: 'Que risque une entreprise qui ne respecte pas les règles du détachement ?', a: 'Des sanctions sont possibles, allant d’amendes à des restrictions temporaires d’intervention sur le marché suisse. Les chantiers du bâtiment font l’objet de contrôles réguliers, ce qui rend le respect de la procédure d’annonce particulièrement important.' },
    ],
  },
  {
    path: 'blog/tva-methode-effective-ou-tdfn-batiment',
    title: 'TVA méthode effective ou taux de la dette fiscale nette : laquelle choisir | Cantia',
    description:
      'Méthode effective ou TDFN pour la TVA d’une entreprise du bâtiment : ce que chaque méthode implique en charge administrative, en impôt préalable déductible, et comment orienter son choix.',
    faq: [
      { q: 'Peut-on changer de méthode TVA en cours d’année ?', a: 'Non, un changement de méthode s’effectue en général au début d’une période fiscale et implique le respect d’un délai minimal avant de pouvoir revenir à l’autre méthode. Toute demande de changement doit passer par l’AFC.' },
      { q: 'Le TDFN dispense-t-il complètement de suivre les factures d’achat ?', a: 'Non, il simplifie le calcul de la TVA due, mais l’entreprise doit tout de même conserver ses factures d’achat et de vente comme n’importe quelle entreprise assujettie, notamment en cas de contrôle.' },
      { q: 'Une petite entreprise du bâtiment a-t-elle intérêt à rester en méthode effective ?', a: 'Cela dépend surtout du volume d’achats de matériel et d’investissements déductibles. Une entreprise qui achète beaucoup de matériel a souvent intérêt à rester en méthode effective pour récupérer l’impôt préalable réel plutôt qu’un taux forfaitaire.' },
    ],
  },
  {
    path: 'blog/vacances-construction-suisse-dates-canton',
    title: 'Vacances de la construction en Suisse : dates par canton et impact sur la facturation | Cantia',
    description:
      'Vacances de la construction en Suisse romande : pourquoi elles existent, comment les dates varient par canton et CCT, et comment anticiper leur impact sur la trésorerie.',
    faq: [
      { q: 'Les vacances de la construction sont-elles identiques dans tous les cantons romands ?', a: 'Non, les dates et l’existence même de cette fermeture dépendent de la convention collective de travail et de la commission paritaire applicables dans chaque canton. Il faut vérifier la situation propre à son canton chaque année.' },
      { q: 'Comment éviter un trou de trésorerie pendant la fermeture estivale ?', a: 'En planifiant les factures d’acompte ou de situation de chantier juste avant la fermeture, plutôt que d’attendre la reprise, et en anticipant ce creux dans son prévisionnel de trésorerie annuel.' },
      { q: 'Où trouver les dates exactes des vacances de la construction pour mon canton ?', a: 'Auprès de la commission paritaire cantonale compétente pour votre secteur d’activité, qui publie les dates applicables chaque année selon la CCT en vigueur.' },
    ],
  },
  {
    path: 'blog/vacances-employe-batiment-cct-jours',
    title: 'Combien de jours de vacances un employé du bâtiment a-t-il droit | Cantia',
    description:
      'Minimum légal de vacances selon le Code des obligations, ce que prévoit en plus la CCT du secteur principal de la construction, et le calcul au prorata pour une année incomplète.',
    faq: [
      { q: 'Quel est le minimum légal de vacances dans le bâtiment en Suisse ?', a: 'Le Code des obligations fixe un minimum de quatre semaines par an pour les travailleurs adultes. Dans la plupart des cas, la CCT du secteur principal de la construction prévoit un nombre de jours plus favorable, à vérifier dans le texte applicable à votre entreprise.' },
      { q: 'La CCT prévoit-elle plus de vacances selon l’âge ou l’ancienneté ?', a: 'C’est généralement le cas, avec des paliers qui peuvent varier selon les dispositions en vigueur. Il est recommandé de vérifier le texte à jour de la CCT applicable plutôt que de se baser sur un chiffre fixe qui pourrait avoir évolué.' },
      { q: 'Comment calculer les vacances d’un employé qui part en cours d’année ?', a: 'Le droit aux vacances se calcule au prorata du nombre de mois réellement travaillés dans l’année. Il faut ensuite comparer ce droit acquis aux jours déjà pris pour déterminer un solde à verser ou, le cas échéant, un trop-perçu à régulariser.' },
    ],
  },
  {
    path: 'blog/modele-devis-gratuit-artisan-batiment-suisse',
    title: 'Modèle de devis gratuit pour artisans du bâtiment | Cantia',
    description:
      'Un modèle de devis gratuit à télécharger, conforme aux usages suisses (TVA, mentions obligatoires), pour tous les corps de métier du bâtiment.',
    faq: [
      { q: 'Ce modèle de devis convient-il à tous les corps de métier du bâtiment ?', a: 'Oui, la structure (coordonnées, positions, TVA, conditions) est neutre et s\'adapte à n\'importe quel corps de métier du bâtiment — seul le détail des prestations change d\'un métier à l\'autre.' },
      { q: 'Le modèle de devis inclut-il le calcul de la TVA suisse ?', a: 'Le modèle prévoit les lignes nécessaires (sous-total HT, TVA, total TTC) mais le calcul reste manuel, contrairement à un outil qui le calcule automatiquement à chaque ligne.' },
      { q: 'Quelles mentions sont obligatoires sur un devis en Suisse ?', a: 'Coordonnées de l\'entreprise (idéalement avec numéro IDE), coordonnées du client, description précise des prestations, prix et TVA, ainsi qu\'une durée de validité de l\'offre.' },
    ],
  },
  {
    path: 'metiers',
    title: 'Cantia pour votre métier | Logiciel de gestion par métier',
    description:
      "Cantia centralise devis, chantiers, équipes et facturation. Découvrez comment il s'adapte au quotidien de votre métier du bâtiment en Suisse.",
  },
  {
    path: 'charpentier',
    title: 'Logiciel de gestion pour charpentiers en Suisse | Cantia',
    description:
      'Gérez vos devis, chantiers, équipes, heures et factures avec Cantia, le logiciel de gestion conçu pour les entreprises de charpente en Suisse.',
    faq: [
      { q: 'Cantia convient-il à une petite entreprise de charpente ?', a: 'Oui, le plan Essentiel couvre devis, chantiers et facturation pour une entreprise qui démarre ou travaille en petite équipe.' },
      { q: 'Puis-je suivre les heures de mes monteurs par chantier ?', a: 'Oui, chaque heure saisie est rattachée à un chantier précis, ce qui permet de comparer le temps prévu au temps réellement passé.' },
      { q: 'Peut-on ajouter des photos depuis le chantier ?', a: 'Oui, directement depuis le téléphone ou la tablette, classées automatiquement par chantier.' },
      { q: 'Cantia permet-il de faire des devis pour des travaux de charpente ?', a: 'Oui, avec un catalogue de prestations réutilisable et un calcul automatique de la TVA et des totaux.' },
      { q: 'Puis-je utiliser Cantia avec Bexio ?', a: 'Oui, l\'intégration native synchronise clients, factures et paiements entre Cantia et Bexio, dès le plan Équipe.' },
    ],
  },
  {
    path: 'macon',
    title: 'Logiciel de gestion pour maçons en Suisse | Cantia',
    description:
      'Suivez vos équipes, vos heures et la rentabilité réelle de vos chantiers avec Cantia, le logiciel de gestion pour les entreprises de maçonnerie en Suisse.',
    faq: [
      { q: 'Cantia convient-il à une entreprise de maçonnerie avec plusieurs équipes ?', a: 'Oui, le planning et les rôles d\'équipe permettent de coordonner plusieurs équipes sur plusieurs chantiers.' },
      { q: 'Peut-on suivre les heures par chantier et par ouvrier ?', a: 'Oui, chaque heure saisie est rattachée à un chantier et à la personne concernée.' },
      { q: 'Comment ajouter un travail supplémentaire découvert en cours de chantier ?', a: 'Il s\'ajoute directement depuis le chantier, avec une remarque ou une photo, jusqu\'à la facturation.' },
      { q: 'Cantia permet-il de voir la rentabilité d\'un chantier avant sa fin ?', a: 'Oui, la comparaison entre montant devisé et coût réel est disponible en continu.' },
      { q: 'Puis-je gérer plusieurs chantiers de maçonnerie en parallèle ?', a: 'Oui, le planning centralise tous vos chantiers actifs et évite les conflits de ressources.' },
    ],
  },
  {
    path: 'electricien',
    title: 'Logiciel de gestion pour électriciens en Suisse | Cantia',
    description:
      'Gérez dépannages, chantiers, planning et facturation avec Cantia, le logiciel de gestion conçu pour les entreprises d\'électricité en Suisse.',
    faq: [
      { q: 'Cantia convient-il à une entreprise d\'électricité avec plusieurs techniciens ?', a: 'Oui, le planning d\'équipe et les rôles personnalisés permettent de coordonner plusieurs techniciens.' },
      { q: 'Peut-on gérer à la fois des dépannages urgents et des chantiers planifiés ?', a: 'Oui, les deux vivent dans le même planning, réorganisable rapidement.' },
      { q: 'Un technicien peut-il voir l\'historique d\'un client depuis le terrain ?', a: 'Oui, la fiche client est accessible depuis le téléphone ou la tablette.' },
      { q: 'Cantia permet-il de facturer rapidement une petite intervention ?', a: 'Oui, une facture QR-suisse peut être générée directement depuis l\'intervention.' },
      { q: 'Puis-je utiliser Cantia avec Bexio pour ma comptabilité ?', a: 'Oui, l\'intégration native synchronise clients, factures et paiements entre Cantia et Bexio.' },
    ],
  },
  {
    path: 'plombier',
    title: 'Logiciel de gestion pour plombiers en Suisse | Cantia',
    description:
      'Centralisez interventions, chantiers et facturation avec Cantia, le logiciel de gestion pour les entreprises de plomberie et sanitaire en Suisse.',
    faq: [
      { q: 'Cantia convient-il à une petite entreprise de sanitaire ou de plomberie ?', a: 'Oui, le plan Essentiel couvre devis, interventions et facturation pour un plombier seul ou en petite équipe.' },
      { q: 'Peut-on facturer un dépannage directement depuis le terrain ?', a: 'Oui, une facture QR-suisse peut être générée sur place, dès la fin de l\'intervention.' },
      { q: 'Cantia gère-t-il la QR-facture suisse pour mes factures ?', a: 'Oui, chaque facture inclut le bulletin QR suisse conforme, sur tous les plans.' },
      { q: 'Puis-je retrouver l\'historique d\'un client rapidement avant une intervention ?', a: 'Oui, la fiche client centralise devis, factures et interventions précédentes.' },
      { q: 'Cantia fonctionne-t-il aussi bien pour les urgences que pour les chantiers planifiés ?', a: 'Oui, dépannages et chantiers vivent dans le même planning.' },
    ],
  },
  {
    path: 'peintre',
    title: 'Logiciel de gestion pour peintres en bâtiment | Cantia',
    description:
      'Préparez vos devis de peinture plus vite et suivez vos surfaces, équipes et travaux supplémentaires avec Cantia, le logiciel de gestion pour la Suisse.',
    faq: [
      { q: 'Cantia convient-il à une entreprise de peinture indépendante ?', a: 'Oui, le plan Essentiel couvre devis, catalogue et facturation pour un peintre qui travaille seul.' },
      { q: 'Puis-je créer un catalogue de mes prestations de peinture habituelles ?', a: 'Oui, chaque prestation chiffrée vient enrichir votre catalogue, réutilisable au chantier suivant.' },
      { q: 'Comment gérer une variante de finition demandée par le client ?', a: 'Elle s\'ajoute directement dans le devis à partir du catalogue et du métré.' },
      { q: 'Cantia permet-il de suivre les heures réelles par rapport au devis ?', a: 'Oui, les heures saisies par chantier sont comparées au montant devisé.' },
      { q: 'Peut-on ajouter des photos avant/après pour chaque chantier ?', a: 'Oui, les photos sont classées automatiquement par chantier.' },
    ],
  },
  {
    path: 'menuisier',
    title: 'Logiciel de gestion pour menuisiers en Suisse | Cantia',
    description:
      'Suivez chaque commande, de l\'atelier à la pose, avec Cantia, le logiciel de gestion conçu pour les entreprises de menuiserie en Suisse.',
    faq: [
      { q: 'Cantia convient-il à un menuisier qui travaille sur commandes personnalisées ?', a: 'Oui, chaque commande devient un chantier avec ses propres mesures, documents et statut.' },
      { q: 'Comment suivre une modification demandée par le client après la prise de mesure ?', a: 'Elle s\'ajoute directement au chantier concerné, visible par l\'atelier comme par l\'équipe de pose.' },
      { q: 'Peut-on coordonner atelier et équipe de pose avec Cantia ?', a: 'Oui, le planning et le statut de chaque commande sont partagés entre les deux.' },
      { q: 'Cantia permet-il de faire des devis avec des prestations sur mesure ?', a: 'Oui, un catalogue réutilisable accélère le chiffrage tout en laissant place à des lignes spécifiques.' },
      { q: 'Puis-je ajouter des photos de fabrication et de pose par projet ?', a: 'Oui, classées automatiquement par chantier.' },
    ],
  },
  {
    path: 'entreprise-generale',
    title: 'Logiciel de gestion pour entreprises générales | Cantia',
    description:
      'Centralisez plusieurs chantiers, sous-traitants et budgets avec Cantia, le logiciel de gestion pour les entreprises générales du bâtiment en Suisse.',
    faq: [
      { q: 'Cantia convient-il à une entreprise générale qui gère plusieurs chantiers en parallèle ?', a: 'Oui, c\'est exactement le cas d\'usage visé par le planning multi-chantiers.' },
      { q: 'Peut-on suivre les sous-traitants et leurs attestations d\'assurance ?', a: 'Oui, un répertoire de sous-traitants réutilisable garde statut et attestations à jour.' },
      { q: 'Cantia permet-il de comparer la rentabilité de plusieurs chantiers ?', a: 'Oui, chaque chantier affiche sa propre marge, comparable entre projets.' },
      { q: 'Peut-on limiter l\'accès de certains employés à certaines informations ?', a: 'Oui, des rôles personnalisés définissent qui accède à quoi.' },
      { q: 'Cantia s\'intègre-t-il avec Bexio pour la comptabilité ?', a: 'Oui, dès le plan Équipe.' },
    ],
  },
  {
    path: 'paysagiste',
    title: 'Logiciel de gestion pour paysagistes en Suisse | Cantia',
    description:
      'Gérez équipes mobiles, chantiers d\'aménagement et contrats d\'entretien avec Cantia, le logiciel de gestion pour les entreprises de paysagisme en Suisse.',
    faq: [
      { q: 'Cantia convient-il à une entreprise de paysagisme avec plusieurs équipes mobiles ?', a: 'Oui, le planning centralisé organise plusieurs équipes sur plusieurs sites.' },
      { q: 'Peut-on gérer à la fois des chantiers d\'aménagement et des contrats d\'entretien ?', a: 'Oui, les deux vivent dans le même outil.' },
      { q: 'Le planning est-il consultable depuis le terrain, sur mobile ?', a: 'Oui, Cantia fonctionne sur téléphone et tablette.' },
      { q: 'Cantia permet-il de facturer rapidement une intervention d\'entretien ?', a: 'Oui, chaque intervention peut être facturée dès sa réalisation.' },
      { q: 'Puis-je ajouter des photos avant/après pour un aménagement ?', a: 'Oui, classées automatiquement par chantier.' },
    ],
  },
  {
    path: 'couvreur',
    title: 'Logiciel de gestion pour couvreurs en Suisse | Cantia',
    description:
      "Documentez et pilotez vos chantiers de toiture avec Cantia, le logiciel de gestion conçu pour les entreprises de couverture en Suisse.",
    faq: [
      { q: 'Cantia convient-il à une entreprise de couverture ?', a: 'Oui, le plan Essentiel couvre devis, chantiers et facturation pour une petite équipe.' },
      { q: 'Puis-je documenter un diagnostic de toiture avec des photos ?', a: 'Oui, géolocalisées automatiquement et liées au chantier.' },
      { q: 'Comment ajouter une découverte imprévue en cours de chantier ?', a: 'Elle s\'ajoute directement au chantier, reprise dans la facturation.' },
      { q: 'Cantia permet-il de garder une trace claire en cas de litige ?', a: 'Oui, chaque photo et document reste daté et centralisé.' },
      { q: 'Puis-je utiliser Cantia avec Bexio ?', a: 'Oui, dès le plan Équipe.' },
    ],
  },
  {
    path: 'chauffagiste',
    title: 'Logiciel de gestion pour chauffagistes en Suisse | Cantia',
    description:
      'Suivez installations, interventions et équipes avec Cantia, le logiciel de gestion conçu pour les entreprises de chauffage en Suisse.',
    faq: [
      { q: 'Cantia convient-il à une entreprise de chauffage avec plusieurs techniciens ?', a: 'Oui, le planning coordonne plusieurs techniciens.' },
      { q: 'Peut-on distinguer entretiens planifiés et dépannages urgents ?', a: 'Oui, les deux vivent dans le même planning.' },
      { q: 'Puis-je documenter les pièces changées lors d\'une intervention ?', a: 'Oui, liées à l\'installation du client.' },
      { q: 'Cantia permet-il de facturer rapidement après un dépannage ?', a: 'Oui, directement depuis l\'intervention.' },
      { q: 'Puis-je utiliser Cantia avec Bexio ?', a: 'Oui, dès le plan Équipe.' },
    ],
  },
  {
    path: 'carreleur',
    title: 'Logiciel de gestion pour carreleurs en Suisse | Cantia',
    description:
      'Suivez surfaces, matériaux et temps de pose avec Cantia, le logiciel de gestion conçu pour les entreprises de carrelage en Suisse.',
    faq: [
      { q: 'Cantia convient-il à un carreleur indépendant ou en petite équipe ?', a: 'Oui, le plan Essentiel couvre devis et facturation.' },
      { q: 'Puis-je intégrer un métré de surfaces directement dans le devis ?', a: 'Oui, avec calcul automatique par pièce ou par zone.' },
      { q: 'Comment gérer une variante de carrelage demandée en cours de chantier ?', a: 'Elle s\'ajoute directement depuis le catalogue.' },
      { q: 'Cantia permet-il de comparer le temps de pose réel au devis ?', a: 'Oui, les heures sont comparées au montant devisé.' },
      { q: 'Puis-je ajouter des photos avant/après pour chaque chantier ?', a: 'Oui, classées automatiquement.' },
    ],
  },
  {
    path: 'platrier',
    title: 'Logiciel de gestion pour plâtriers-plaquistes | Cantia',
    description:
      'Suivez métrés, prestations et heures par chantier avec Cantia, le logiciel de gestion conçu pour les entreprises de plâtrerie en Suisse.',
    faq: [
      { q: 'Cantia convient-il à une entreprise de plâtrerie ou de cloisons sèches ?', a: 'Oui, le plan Essentiel couvre devis, chantiers et facturation.' },
      { q: 'Puis-je intégrer un métré de cloisons au devis ?', a: 'Oui, avec un catalogue de prestations réutilisable.' },
      { q: 'Comment ajouter une modification décidée en cours de chantier ?', a: 'Elle s\'ajoute directement au chantier concerné.' },
      { q: 'Cantia permet-il de coordonner mon planning avec d\'autres corps de métier ?', a: 'Oui, le planning est partagé et centralisé.' },
      { q: 'Puis-je suivre mes heures de pose par chantier ?', a: 'Oui, chaque heure est rattachée à un chantier précis.' },
    ],
  },
  {
    path: 'genie-civil',
    title: 'Logiciel de gestion pour le génie civil | Cantia',
    description:
      'Pilotez plusieurs équipes et chantiers avec une vraie vision financière, avec Cantia, le logiciel de gestion pour le génie civil en Suisse.',
    faq: [
      { q: 'Cantia convient-il à une entreprise gérant plusieurs chantiers de grande ampleur ?', a: 'Oui, le planning multi-chantiers est pensé pour ce cas d\'usage.' },
      { q: 'Peut-on suivre les dépenses de chantier en temps réel ?', a: 'Oui, comparées au montant devisé en continu.' },
      { q: 'Cantia permet-il de comparer la rentabilité de plusieurs chantiers ?', a: 'Oui, chaque chantier affiche sa propre marge.' },
      { q: 'Peut-on centraliser rapports et photos de plusieurs équipes ?', a: 'Oui, tout reste classé par chantier.' },
      { q: 'Cantia s\'intègre-t-il avec Bexio ?', a: 'Oui, dès le plan Équipe.' },
    ],
  },
  {
    path: 'terrassier',
    title: 'Logiciel de gestion pour terrassiers en Suisse | Cantia',
    description:
      'Suivez machines, équipes, heures et travaux supplémentaires avec Cantia, le logiciel de gestion pour les entreprises de terrassement en Suisse.',
    faq: [
      { q: 'Cantia convient-il à une entreprise de terrassement ?', a: 'Oui, le plan Essentiel couvre devis, chantiers et facturation.' },
      { q: 'Peut-on suivre le coût des machines et du carburant par chantier ?', a: 'Oui, comparé au montant devisé.' },
      { q: 'Comment documenter un imprévu de terrain découvert en cours de chantier ?', a: 'Il s\'ajoute directement au chantier avec une photo.' },
      { q: 'Cantia permet-il de connaître la rentabilité d\'un chantier avant sa fin ?', a: 'Oui, disponible en continu.' },
      { q: 'Puis-je suivre les heures de plusieurs collaborateurs par chantier ?', a: 'Oui, par personne et par chantier.' },
    ],
  },
  {
    path: 'entreprise-renovation',
    title: 'Logiciel de gestion pour la rénovation | Cantia',
    description:
      'Gérez vos chantiers de rénovation, imprévus compris, avec Cantia, le logiciel de gestion pour les entreprises du bâtiment en Suisse.',
    faq: [
      { q: 'Cantia convient-il à une entreprise spécialisée en rénovation ?', a: 'Oui, le suivi des travaux supplémentaires répond aux imprévus fréquents.' },
      { q: 'Comment tracer un changement d\'avis du client en cours de chantier ?', a: 'Il s\'ajoute comme un travail supplémentaire chiffré.' },
      { q: 'Puis-je documenter une surprise découverte derrière un mur ?', a: 'Oui, avec une photo liée au chantier.' },
      { q: 'Cantia permet-il d\'ajuster le planning quand les dates changent souvent ?', a: 'Oui, mis à jour en continu.' },
      { q: 'Comment coordonner plusieurs corps de métier sur un même chantier ?', a: 'Le chantier centralise documents, planning et sous-traitants.' },
    ],
  },
  {
    path: 'serrurier',
    title: 'Logiciel de gestion pour serruriers en Suisse | Cantia',
    description:
      'Suivez fabrication, pose et modifications avec Cantia, le logiciel de gestion pour les entreprises de serrurerie et construction métallique.',
    faq: [
      { q: 'Cantia convient-il à une entreprise de serrurerie ou de construction métallique ?', a: 'Oui, le suivi de commande en plusieurs étapes y répond directement.' },
      { q: 'Comment suivre une commande de la mesure jusqu\'à la pose ?', a: 'Le chantier centralise mesures, fabrication et planning de pose.' },
      { q: 'Que se passe-t-il si le client demande une modification après fabrication ?', a: 'Elle s\'ajoute directement au chantier.' },
      { q: 'Peut-on coordonner atelier et équipe de pose avec Cantia ?', a: 'Oui, le statut est partagé entre les deux.' },
      { q: 'Cantia permet-il de faire des devis sur mesure ?', a: 'Oui, avec un catalogue réutilisable.' },
    ],
  },
  {
    path: 'ferblantier',
    title: 'Logiciel de gestion pour ferblantiers en Suisse | Cantia',
    description:
      'Gérez devis, mesures et interventions spécifiques avec Cantia, le logiciel de gestion pour les entreprises de ferblanterie en Suisse.',
    faq: [
      { q: 'Cantia convient-il à une entreprise de ferblanterie ?', a: 'Oui, le plan Essentiel couvre devis, interventions et facturation.' },
      { q: 'Puis-je enregistrer des mesures précises prises sur place ?', a: 'Oui, liées directement au chantier.' },
      { q: 'Comment coordonner une intervention avec d\'autres corps de métier ?', a: 'Le chantier reste partagé et consultable.' },
      { q: 'Cantia permet-il de facturer rapidement une petite intervention ?', a: 'Oui, dès la fin de l\'intervention.' },
      { q: 'Puis-je ajouter des photos avant/après pour chaque intervention ?', a: 'Oui, classées automatiquement.' },
    ],
  },
  {
    path: 'facadier',
    title: 'Logiciel de gestion pour façadiers en Suisse | Cantia',
    description:
      'Suivez surfaces, variantes et avancement avec Cantia, le logiciel de gestion pour les entreprises de façade en Suisse.',
    faq: [
      { q: 'Cantia convient-il à une entreprise de façade ?', a: 'Oui, le plan Essentiel couvre devis, chantiers et facturation.' },
      { q: 'Puis-je intégrer un métré de façade directement dans le devis ?', a: 'Oui, avec un catalogue de prestations réutilisable.' },
      { q: 'Comment gérer une variante de teinte demandée en cours de chantier ?', a: 'Elle s\'ajoute directement dans le devis.' },
      { q: 'Cantia permet-il de partager l\'avancement d\'un chantier avec le client ?', a: 'Oui, via des photos liées au chantier.' },
      { q: 'Puis-je ajouter des photos à chaque étape du chantier ?', a: 'Oui, classées automatiquement.' },
    ],
  },
  {
    path: 'etancheur',
    title: 'Logiciel de gestion pour étancheurs en Suisse | Cantia',
    description:
      "Documentez précisément vos interventions avec Cantia, le logiciel de gestion pour les entreprises d'étanchéité en Suisse.",
    faq: [
      { q: 'Cantia convient-il à une entreprise d\'étanchéité ?', a: 'Oui, le plan Essentiel couvre devis, interventions et facturation.' },
      { q: 'Puis-je géolocaliser les photos de chaque zone traitée ?', a: 'Oui, automatiquement.' },
      { q: 'Comment retrouver l\'historique d\'une intervention en cas de défaut ?', a: 'Chaque chantier garde son historique complet.' },
      { q: 'Cantia permet-il de générer un rapport d\'intervention automatiquement ?', a: 'Oui, depuis les photos et notes prises sur place.' },
      { q: 'Puis-je ajouter des travaux supplémentaires découverts en cours d\'intervention ?', a: 'Oui, repris dans la facturation.' },
    ],
  },
  {
    path: 'construction-bois',
    title: 'Logiciel de gestion pour la construction bois | Cantia',
    description:
      'Coordonnez préparation, fabrication et pose avec Cantia, le logiciel de gestion pour les entreprises de construction bois en Suisse.',
    faq: [
      { q: 'Cantia convient-il à une entreprise de construction bois ?', a: 'Oui, le suivi de projet en plusieurs étapes y répond directement.' },
      { q: 'Comment suivre un projet de l\'étude jusqu\'à la pose ?', a: 'Le chantier centralise chaque étape au même endroit.' },
      { q: 'Que se passe-t-il si une modification est décidée après fabrication ?', a: 'Elle s\'ajoute directement au chantier.' },
      { q: 'Cantia permet-il de partager l\'avancement avec le client ?', a: 'Oui, via des photos et rapports liés au chantier.' },
      { q: 'Puis-je coordonner atelier et équipe de pose avec Cantia ?', a: 'Oui, le planning est partagé entre les deux.' },
    ],
  },
  {
    path: 'vitrier',
    title: 'Logiciel de gestion pour vitriers en Suisse | Cantia',
    description:
      'Organisez mesures, commandes, poses et interventions avec Cantia, le logiciel de gestion pour les entreprises de vitrerie en Suisse.',
    faq: [
      { q: 'Cantia convient-il à une entreprise de vitrerie ?', a: 'Oui, le plan Essentiel couvre devis, interventions et facturation.' },
      { q: 'Puis-je enregistrer des mesures précises prises sur place ?', a: 'Oui, liées directement au chantier.' },
      { q: 'Comment suivre le statut d\'une commande de vitrage en cours de délai ?', a: 'Il est suivi par chantier et visible par toute l\'équipe.' },
      { q: 'Cantia permet-il de gérer une intervention de dépannage urgente ?', a: 'Oui, enregistrée et facturée directement.' },
      { q: 'Puis-je facturer rapidement après un remplacement de vitrage ?', a: 'Oui, dès la fin de la pose.' },
    ],
  },
  {
    path: 'parqueteur',
    title: 'Logiciel de gestion pour soliers-parqueteurs | Cantia',
    description:
      'Suivez surfaces, matériaux, équipes et temps de pose avec Cantia, le logiciel de gestion pour les entreprises de pose de sols en Suisse.',
    faq: [
      { q: 'Cantia convient-il à un solier-parqueteur indépendant ou en petite équipe ?', a: 'Oui, le plan Essentiel couvre devis et facturation.' },
      { q: 'Puis-je intégrer un métré de surfaces directement dans le devis ?', a: 'Oui, directement.' },
      { q: 'Comment gérer une variante de matériau demandée en cours de chantier ?', a: 'Elle s\'ajoute directement depuis le catalogue.' },
      { q: 'Cantia permet-il de comparer le temps de pose réel au devis ?', a: 'Oui, comparé au montant devisé.' },
      { q: 'Puis-je ajouter des photos avant/après pour chaque chantier ?', a: 'Oui, classées automatiquement.' },
    ],
  },
  {
    path: 'echafaudeur',
    title: 'Logiciel de gestion pour échafaudeurs en Suisse | Cantia',
    description:
      "Organisez montage, démontage et équipes avec Cantia, le logiciel de gestion pour les entreprises d'échafaudage en Suisse.",
    faq: [
      { q: 'Cantia convient-il à une entreprise d\'échafaudage ?', a: 'Oui, le plan Essentiel couvre devis, chantiers et facturation.' },
      { q: 'Peut-on coordonner le montage et démontage avec d\'autres corps de métier ?', a: 'Oui, le planning est centralisé et partagé.' },
      { q: 'Comment facturer une prolongation de location imprévue ?', a: 'La durée réelle est suivie par chantier et reprise dans la facturation.' },
      { q: 'Cantia permet-il de documenter l\'état du matériel et la sécurité ?', a: 'Oui, photos et remarques liées au chantier.' },
      { q: 'Puis-je suivre plusieurs chantiers d\'échafaudage en parallèle ?', a: 'Oui, le planning centralise tous vos chantiers actifs.' },
    ],
  },
  {
    path: 'demolition',
    title: 'Logiciel de gestion pour la démolition | Cantia',
    description:
      'Suivez machines, heures, photos et dépenses par chantier avec Cantia, le logiciel de gestion pour les entreprises de démolition en Suisse.',
    faq: [
      { q: 'Cantia convient-il à une entreprise de démolition ?', a: 'Oui, le suivi des dépenses de machines répond directement à ce fonctionnement.' },
      { q: 'Peut-on suivre le coût des machines et de l\'évacuation par chantier ?', a: 'Oui, comparé au montant devisé.' },
      { q: 'Comment documenter un état des lieux avant démolition ?', a: 'Avec des photos géolocalisées, liées au chantier.' },
      { q: 'Cantia permet-il de connaître la rentabilité d\'un chantier avant sa fin ?', a: 'Oui, disponible en continu.' },
      { q: 'Puis-je suivre les heures d\'équipe et de machines par chantier ?', a: 'Oui, par personne ou par machine.' },
    ],
  },
  {
    path: 'telechargement',
    title: 'Télécharger Cantia | App mobile & web',
    description:
      "Cantia fonctionne comme une application web installable, sur ordinateur comme sur téléphone. Applications natives iOS et Android bientôt disponibles.",
  },
  {
    path: 'mentions-legales',
    title: 'Mentions légales | Cantia',
    description: "Mentions légales de Cantia, logiciel de gestion de chantier pour le bâtiment suisse.",
  },
  {
    path: 'confidentialite',
    title: 'Politique de confidentialité | Cantia',
    description:
      "Politique de confidentialité de Cantia : données collectées, hébergement en Suisse, droits des utilisateurs.",
  },
  {
    path: 'conditions-generales',
    title: 'Conditions générales | Cantia',
    description: "Conditions générales d'utilisation et de vente de Cantia : essai gratuit, abonnement, résiliation, droit applicable.",
  },
  {
    path: 'aide',
    title: "Centre d'aide | Cantia",
    description:
      "Toutes les réponses aux questions fréquentes sur Cantia : devis, factures, chantiers, équipe, facturation. Guides et tutoriels vidéo.",
  },
  {
    path: 'contact',
    title: 'Contact | Cantia',
    description: 'Une question, un problème, une suggestion ? Contactez l’équipe Cantia — réponse sous 24h ouvrées.',
  },
  {
    path: 'aide/videos',
    title: "Tutoriels vidéo | Centre d'aide Cantia",
    description:
      'Voir chaque module Cantia en action : devis, factures, chantiers, planning, RH — démonstrations vidéo module par module.',
  },
  {
    path: 'aide/ressources',
    title: "Ressources à télécharger | Centre d'aide Cantia",
    description:
      'Téléchargez le dossier de présentation Cantia en PDF : fonctionnalités, tarifs et bénéfices pour les entreprises du bâtiment en Suisse.',
  },
  ...HELP_SEO_FR,

  {
    path: 'de',
    title: 'Software für Baustellenverwaltung in der Schweiz | Cantia',
    description:
      'Cantia zentralisiert Offerten, Rechnungen, Planung, Berichte, Stunden und Rentabilität für Handwerksbetriebe und KMU im Schweizer Bauwesen.',
  },
  {
    path: 'de/solutions/devis',
    title: 'Offerten online für Schweizer Handwerker | Cantia',
    description:
      'Diktieren Sie Ihre Offertpositionen direkt auf der Baustelle. Cantia wandelt sie mit Ihren gewohnten Preisen in bezifferte Positionen um, PDF versandbereit.',
    faq: [
      { q: 'Wie erstellt man als Handwerker schnell eine Offerte?', a: 'Diktieren Sie Ihre Positionen auf der Baustelle oder im Auto. Cantia wandelt sie mit Ihren gewohnten Preisen in bezifferte Positionen um, und das PDF ist fertig, bevor Sie den Kunden verlassen haben.' },
      { q: 'Ist die Offerte konform mit den Schweizer Gepflogenheiten (MWST, Layout)?', a: 'Ja: Jede Offerte übernimmt Ihren MWST-Satz, Ihre Firmendaten und lässt sich mit Ihrer Markenfarbe und Ihrem Logo personalisieren.' },
      { q: 'Kann eine akzeptierte Offerte automatisch in eine Rechnung umgewandelt werden?', a: 'Ja, eine unterzeichnete Offerte wird mit einem Klick zur Rechnung — inklusive Schweizer QR-Rechnung — ohne die Positionen neu zu erfassen.' },
      { q: 'Ist Cantia für Offerten kostenlos?', a: 'Cantia bietet auf allen Plänen eine 14-tägige kostenlose Testphase (Kreditkarte erforderlich, keine Abbuchung vor Ende der Testphase). Nach dem Abo sind Offerten und Rechnungen auf jedem Plan unbegrenzt, ohne monatliches Kontingent.' },
    ],
  },
  {
    path: 'de/solutions/facturation',
    title: 'Rechnungsstellung & QR-Rechnung Schweiz | Cantia',
    description:
      'Jede Cantia-Rechnung integriert automatisch die konforme Schweizer QR-Rechnung — IBAN, strukturierte Referenz und Betrag bereits codiert, scanbereit.',
    faq: [
      { q: 'Wie erstellt man eine Rechnung mit Schweizer QR-Rechnung?', a: 'Hinterlegen Sie Ihren IBAN einmalig in den Einstellungen: Jede Rechnung generiert danach automatisch den SIX-konformen QR-Einzahlungsschein, IBAN und strukturierte Referenz bereits codiert.' },
      { q: 'Kann man vor Baustellenende eine Anzahlung in Rechnung stellen?', a: 'Ja, Cantia erlaubt die Ausstellung einer Anzahlungsrechnung für einen Prozentsatz der Offerte, die dann automatisch von der Schlussrechnung abgezogen wird.' },
      { q: 'Wie erkennt man, ob eine Rechnung bezahlt wurde?', a: 'Suchen und gleichen Sie eine Zahlung direkt über ihre QR-Referenznummer ab — der Status wechselt auf «bezahlt», ohne Ihr Bankkonto manuell prüfen zu müssen.' },
      { q: 'Was kostet die Rechnungsstellung mit QR-Code über Cantia?', a: 'Die Rechnungsstellung mit Schweizer QR-Rechnung ist in allen Cantia-Plänen enthalten, ausnahmslos, bereits ab dem Essentiel-Plan.' },
    ],
  },
  {
    path: 'de/solutions/rapports-chantier',
    title: 'Baustellenberichte | Cantia',
    description:
      'Sprachnotizen, geolokalisierte Fotos und Team-Nachrichten: Cantia erstellt daraus einen verfassten, strukturierten Bericht, versandbereit.',
    faq: [
      { q: 'Wie verfasst man schnell einen Baustellenbericht?', a: 'Machen Sie Ihre Fotos und diktieren Sie Ihre Notizen vor Ort — Cantia fügt alles zu einem strukturierten PDF-Bericht zusammen, versandbereit, ohne abends alles neu tippen zu müssen.' },
      { q: 'Werden die Fotos automatisch geolokalisiert?', a: 'Ja, jedes Foto wird ohne zusätzlichen Aufwand automatisch mit Zeitstempel und Standort versehen.' },
      { q: 'Kann man den Bericht mit Logo und Unterschrift personalisieren?', a: 'Ja, jeder PDF-Bericht übernimmt Ihr Logo, Ihre Markenfarbe und die Unterschrift des Verfassers.' },
      { q: 'Ersetzt der Baustellenbericht ein Papier-Bautagebuch?', a: 'Ja — Notizen, Fotos und Verlauf sind in einem jederzeit einsehbaren digitalen Dokument pro Baustelle zentralisiert.' },
    ],
  },
  {
    path: 'de/solutions/dictee-vocale',
    title: 'Diktierfunktion für das Bauwesen | Cantia',
    description: 'Offerten, Berichte, Team-Nachrichten: ein Diktier-Button ersetzt die Tastatureingabe, überall in Cantia.',
    faq: [
      { q: 'Funktioniert die Spracherkennung gut mit dem Baugewerbe-Vokabular?', a: 'Ja, die Erkennung ist auf das technische Vokabular des Bauwesens abgestimmt — Materialien, Einheiten, Berufe — nicht nur auf Alltagssprache.' },
      { q: 'Braucht es eine Internetverbindung zum Diktieren?', a: 'Ja, das Diktieren benötigt eine Verbindung zur Transkription, aber die erstellten Offerten und Berichte bleiben nach der Erstellung abrufbar.' },
      { q: 'Wo kann man die Diktierfunktion in Cantia nutzen?', a: 'Bei Offerten, Baustellenberichten und Team-Nachrichten im Aktivitätsstream — überall, wo Sie in Cantia schreiben.' },
      { q: 'Ist Diktieren auf der Baustelle schneller als Tippen?', a: 'Für die meisten Handwerker auf der Baustelle, ja — Sprechen geht schneller als auf einem Telefon mit schmutzigen Händen oder Handschuhen zu tippen.' },
    ],
  },
  {
    path: 'de/solutions/planning',
    title: 'Team-Einsatzplanung Baustelle | Cantia',
    description: 'Ein echter Team-Kalender: jedes Mitglied, jede Baustelle, jeder Tag. Schluss mit Papierplänen oder WhatsApp.',
    faq: [
      { q: 'Wie organisiert man die Planung eines Baustellenteams?', a: 'Cantia zeigt einen geteilten Wochenkalender: jedes Mitglied sieht, wer an welchem Tag auf welcher Baustelle ist.' },
      { q: 'Ersetzt die Planung eine Excel-Tabelle oder eine WhatsApp-Gruppe?', a: 'Ja, das ganze Team sieht dieselben Informationen in Echtzeit, ohne Datei oder Nachrichtenverlauf durchscrollen zu müssen.' },
      { q: 'Kann man mehrere Baustellen parallel planen?', a: 'Ja, jede Zuteilung ist mit einer bestimmten Baustelle verknüpft und bleibt über die ganze Woche, Person für Person, sichtbar.' },
      { q: 'Ist die Planung in allen Cantia-Plänen enthalten?', a: 'Sie ist ab dem Team-Plan verfügbar, aktivierbar in den Einstellungen Ihrer Organisation.' },
    ],
  },
  {
    path: 'de/solutions/rentabilite',
    title: 'Rentabilität pro Baustelle | Cantia',
    description:
      'Vergleichen Sie die akzeptierte Offerte mit den tatsächlichen Kosten — Material und Arbeitszeit —, um zu wissen, ob jede Baustelle rentabel ist, knapp kalkuliert oder defizitär.',
    faq: [
      { q: 'Wie erkennt man, ob eine Baustelle rentabel ist?', a: 'Cantia vergleicht die akzeptierte Offerte (Ertrag) mit den tatsächlichen Kosten — erfasstes Material und Arbeitszeit aus der Planung — und zeigt die Marge in CHF und % in Echtzeit an.' },
      { q: 'Woher stammt die Berechnung der Arbeitskosten?', a: 'Aus der Team-Planung: die einer Baustelle zugeteilten Tage werden mit dem Stundensatz Ihres Unternehmens multipliziert, ohne separate Zeiterfassung.' },
      { q: 'Kann man mehrere Baustellen miteinander vergleichen?', a: 'Ja, jede Baustelle zeigt ihre eigene Marge, was es erlaubt, defizitäre Baustellen rasch zu erkennen.' },
      { q: 'Ist die Rentabilität pro Baustelle in allen Cantia-Plänen enthalten?', a: 'Sie ist ab dem Team-Plan verfügbar, aktivierbar in den Einstellungen Ihrer Organisation.' },
    ],
  },
  {
    path: 'de/solutions/rh-salaires',
    title: 'Personal, Stunden & Löhne im Bauwesen | Cantia',
    description:
      'Jeder Mitarbeitende erfasst seine Stunden pro Baustelle und seine Spesen; die Sekretärin oder der Administrator verwaltet die Lohnabrechnung des ganzen Teams, vom Brutto- zum Nettolohn.',
    faq: [
      { q: 'Wer kann die Löhne in Cantia einsehen?', a: 'Nur die Personalverantwortliche und die Administratoren, je nach den über Team vergebenen Berechtigungen. Ein Standard-Mitarbeitender sieht nur seine eigenen Stunden und Spesen.' },
      { q: 'Berechnet Cantia automatisch die Schweizer Sozialabgaben?', a: 'Cantia berechnet den Nettolohn anhand von konfigurierbaren AHV-/ALV-/BVG-/UVG-Sätzen und einem Quellensteuersatz pro Mitarbeitendem — die Standardsätze sind indikativ und je nach Ausgleichskasse, BVG-Kasse und Kanton anzupassen.' },
      { q: 'Wie exportiert ein Mitarbeitender seine Stundenerfassung?', a: 'Über das Modul Personal & Löhne, mit Wahl der Granularität — täglich, wöchentlich oder monatlich — und anschliessendem Download als CSV-Datei.' },
      { q: 'Ist das Modul Personal & Löhne in allen Cantia-Plänen enthalten?', a: 'Es ist ab dem Team-Plan verfügbar, aktivierbar in den Einstellungen Ihrer Organisation.' },
    ],
  },
  {
    path: 'de/solutions/travaux-supplementaires',
    title: 'Zusatzarbeiten für Schweizer Handwerker | Cantia',
    description:
      'Jeder während der Baustelle angeforderte Extra-Auftrag wird zu einem datierten Dokument, online vom Kunden unterzeichnet und automatisch in eine Rechnung umgewandelt — Schluss mit vergessenen oder bestrittenen Extras.',
    faq: [
      { q: 'Was ist eine Zusatzarbeit in Cantia?', a: 'Es ist ein eigenes Dokument für alles, was während der Baustelle zusätzlich zur ursprünglichen Offerte gewünscht wird — eine zu versetzende Wand, eine zusätzliche Steckdose. Es wird wie eine Offerte erstellt, versandt und unterzeichnet und verwandelt sich nach Annahme automatisch in eine Rechnung.' },
      { q: 'Muss eine Zusatzarbeit an eine bestehende Offerte gekoppelt sein?', a: 'Nein, das ist optional. Sie können sie mit der ursprünglichen Offerte verknüpfen, um den Kontext zu behalten, oder sie eigenständig erstellen, falls die Baustelle keine Offerte in Cantia hat.' },
      { q: 'Wie validiert der Kunde eine Zusatzarbeit?', a: 'Er erhält einen Link zu einem sicheren Portal, prüft die bezifferten Details und unterzeichnet online — die Annahme wird zeitgestempelt und löst automatisch die entsprechende Rechnung aus.' },
      { q: 'Zählen Zusatzarbeiten in die Rentabilität pro Baustelle?', a: 'Ja: sobald eine Zusatzarbeit akzeptiert ist, wird ihr Betrag automatisch zum offerierten Gesamtbetrag der Baustelle im Modul Rentabilität hinzugefügt.' },
    ],
  },
  {
    path: 'de/solutions/tresorerie',
    title: 'Liquiditätsplanung für das Bauwesen | Cantia',
    description: 'Ausstehende Rechnungen, Löhne, Subunternehmer und wiederkehrende Kosten vereint in einer 90-Tage-Projektion — ohne Bankanbindung.',
    faq: [
      { q: 'Verbindet sich Cantia mit meinem Bankkonto?', a: 'Nein. Sie erfassen Ihren Kontostand manuell, wann Sie möchten — es wird kein Bankzugriff verlangt oder benötigt.' },
      { q: 'Woher stammen die Beträge der Projektion?', a: 'Aus unbezahlten Kundenrechnungen, einer Schätzung der Lohnsumme (Personalprofile + erfasste Stunden), offenen Subunternehmer-Rechnungen und den von Ihnen erfassten wiederkehrenden Ausgaben — alles, was Cantia bereits über Ihre Tätigkeit weiss.' },
      { q: 'Wie funktionieren die Erinnerungen an wiederkehrende Ausgaben?', a: 'Ein Banner auf der Startseite und der Seite Liquidität weist Sie auf aktive wiederkehrende Ausgaben hin, die in den nächsten 7 Tagen fällig werden, bevor sie abgebucht werden.' },
      { q: 'Ist die Liquiditätsplanung in allen Cantia-Plänen enthalten?', a: 'Sie ist ab dem Team-Plan verfügbar, aktivierbar in den Einstellungen Ihrer Organisation.' },
    ],
  },
  {
    path: 'de/integrations',
    title: 'Integrationen | Cantia',
    description:
      'Cantia verbindet sich direkt mit Ihrer Buchhaltung: Bexio schon heute, Kunden und Artikel importiert, Rechnungen mit einem Klick versendet, Zahlungsstatus synchronisiert.',
    faq: [
      { q: 'Welche Integrationen bietet Cantia heute an?', a: 'Bexio, nativ verfügbar ab dem Team-Plan. Weitere Integrationen folgen demselben Prinzip der offiziellen Anbindung.' },
      { q: 'Ist die Bexio-Integration zusätzlich zum Abonnement kostenpflichtig?', a: 'Nein — sie ist automatisch ab dem Team-Plan enthalten, ohne zusätzliches Modul oder zusätzliche Kosten.' },
      { q: 'Kann Cantia eine definitive Rechnung an meinen Kunden über Bexio senden?', a: 'Nein. Jede Rechnung kommt nur als Entwurf in Bexio an — die Finalisierung bleibt immer eine manuelle Aktion in Bexio.' },
    ],
  },
  {
    path: 'de/sur-mesure',
    title: 'Massgeschneiderte Entwicklung | Cantia',
    description:
      'Über die Standardmodule hinaus kann Cantia einen Workflow, eine Automatisierung oder eine Integration speziell für Ihr Unternehmen entwickeln — ohne die Erfahrung anderer Kunden zu verändern.',
    faq: [
      { q: 'Ist ein massgeschneidertes Modul für andere Unternehmen sichtbar?', a: 'Nein. Ein für Sie entwickeltes Modul wird nur für Ihre Organisation aktiviert — andere Cantia-Kunden sehen es nie.' },
      { q: 'Muss ich die Software wechseln oder etwas anderes installieren?', a: 'Nein — das Modul lebt im selben Cantia, das Sie bereits nutzen, mit denselben Zugängen und denselben Updates.' },
      { q: 'Was kostet eine massgeschneiderte Entwicklung?', a: 'Das hängt vollständig vom Bedarf ab. Wir besprechen es zunächst gemeinsam, und Sie erhalten eine klare Offerte vor jeder Verpflichtung.' },
    ],
  },
  {
    path: 'de/plans/essentiel',
    title: 'Plan Essentiel — unbegrenzte Offerten & Rechnungen | Cantia',
    description:
      'CHF 39/Monat: unbegrenzte Offerten, Rechnungen und Rapporte, Schweizer QR-Rechnung, Markenanpassung und KI-Sprachassistent. Entdecken Sie den Plan Essentiel.',
    faq: [
      { q: 'Kann ich später den Plan wechseln?', a: 'Ja, jederzeit über die Unternehmenseinstellungen. Der Wechsel erfolgt sofort, der Betrag wird anteilig angepasst.' },
      { q: 'Gibt es eine Mindestlaufzeit?', a: 'Nein. Alle Pläne sind ohne Mindestlaufzeit, jederzeit kündbar, mit 14 Tagen kostenloser Testphase.' },
      { q: 'Ist die MWST im Preis enthalten?', a: 'Die angezeigten Preise verstehen sich exklusive MWST. Die Schweizer MWST wird bei der Rechnungsstellung hinzugefügt.' },
    ],
  },
  {
    path: 'de/plans/equipe',
    title: 'Plan Team — Planung, Personal & Liquidität | Cantia',
    description:
      'CHF 79/Monat: alles aus Essentiel, plus Planung, Personal & Löhne, Rentabilität pro Baustelle, Liquidität und Bexio-Integration. Entdecken Sie den Plan Team.',
    faq: [
      { q: 'Kann ich später den Plan wechseln?', a: 'Ja, jederzeit über die Unternehmenseinstellungen. Der Wechsel erfolgt sofort, der Betrag wird anteilig angepasst.' },
      { q: 'Gibt es eine Mindestlaufzeit?', a: 'Nein. Alle Pläne sind ohne Mindestlaufzeit, jederzeit kündbar, mit 14 Tagen kostenloser Testphase.' },
      { q: 'Ist die MWST im Preis enthalten?', a: 'Die angezeigten Preise verstehen sich exklusive MWST. Die Schweizer MWST wird bei der Rechnungsstellung hinzugefügt.' },
    ],
  },
  {
    path: 'de/plans/entreprise',
    title: 'Plan Business — für etablierte Unternehmen | Cantia',
    description:
      'CHF 129/Monat: alles aus Team in grösserem Massstab (25 Mitglieder, 40 GB), grösstes KI-Kontingent, unbegrenzte erweiterte Rollen und Priority-Support.',
    faq: [
      { q: 'Kann ich später den Plan wechseln?', a: 'Ja, jederzeit über die Unternehmenseinstellungen. Der Wechsel erfolgt sofort, der Betrag wird anteilig angepasst.' },
      { q: 'Gibt es eine Mindestlaufzeit?', a: 'Nein. Alle Pläne sind ohne Mindestlaufzeit, jederzeit kündbar, mit 14 Tagen kostenloser Testphase.' },
      { q: 'Ist die MWST im Preis enthalten?', a: 'Die angezeigten Preise verstehen sich exklusive MWST. Die Schweizer MWST wird bei der Rechnungsstellung hinzugefügt.' },
    ],
  },
  {
    path: 'de/blog',
    title: 'Blog | Cantia — Konkrete Antworten für das Schweizer Bauwesen',
    description:
      'Offerten, Rechnungsstellung, Personal, Recht, Vergleiche: präzise Antworten auf die Fragen, die sich Handwerker und Bauunternehmen in der Schweiz stellen.',
  },
  ...TRADE_SEO_DE,
  {
    path: 'de/metiers',
    title: 'Cantia für Ihr Gewerbe | Verwaltungssoftware nach Beruf',
    description:
      'Cantia zentralisiert Offerten, Baustellen, Teams und Rechnungsstellung. Entdecken Sie, wie es sich an den Alltag Ihres Baugewerbes in der Schweiz anpasst.',
  },
  {
    path: 'de/telechargement',
    title: 'Cantia herunterladen | Mobile & Web-App',
    description: 'Cantia funktioniert als installierbare Web-App, auf dem Computer wie auf dem Telefon. Native iOS- und Android-Apps demnächst verfügbar.',
  },
  {
    path: 'de/mentions-legales',
    title: 'Impressum | Cantia',
    description: 'Impressum von Cantia, Verwaltungssoftware für das Schweizer Bauwesen.',
  },
  {
    path: 'de/confidentialite',
    title: 'Datenschutzerklärung | Cantia',
    description: 'Datenschutzerklärung von Cantia: erhobene Daten, Hosting in der Schweiz, Rechte der Nutzer.',
  },
  {
    path: 'de/conditions-generales',
    title: 'AGB | Cantia',
    description: 'Allgemeine Geschäftsbedingungen von Cantia: kostenlose Testphase, Abonnement, Kündigung, anwendbares Recht.',
  },
  {
    path: 'de/aide',
    title: 'Hilfe-Center | Cantia',
    description: 'Alle Antworten auf häufige Fragen zu Cantia: Offerten, Rechnungen, Baustellen, Team, Abrechnung. Anleitungen und Video-Tutorials.',
  },
  {
    path: 'de/contact',
    title: 'Kontakt | Cantia',
    description: 'Eine Frage, ein Problem, ein Vorschlag? Kontaktieren Sie das Cantia-Team — Antwort innert 24 Werkstunden.',
  },
  {
    path: 'de/aide/videos',
    title: 'Video-Tutorials | Cantia Hilfe-Center',
    description: 'Sehen Sie jedes Cantia-Modul in Aktion: Offerten, Rechnungen, Baustellen, Planung, Personal — Video-Demonstrationen Modul für Modul.',
  },
  {
    path: 'de/aide/ressources',
    title: 'Downloads | Cantia Hilfe-Center',
    description:
      'Laden Sie die Cantia-Produktbroschüre als PDF herunter: Funktionen, Preise und Vorteile für Schweizer Bauunternehmen.',
  },
  ...HELP_SEO_DE,
  ...BLOG_SEO_DE,

  {
    path: 'it',
    title: 'Software di gestione cantieri in Svizzera | Cantia',
    description:
      'Cantia centralizza preventivi, fatture, pianificazione, rapporti, ore e redditività per artigiani e PMI edili in Svizzera.',
  },
  {
    path: 'it/solutions/devis',
    title: 'Preventivi online per artigiani svizzeri | Cantia',
    description:
      "Detti le voci del preventivo a voce alta in cantiere. Cantia le trasforma in posizioni con prezzo, con i Suoi prezzi abituali, PDF pronto per l'invio.",
    faq: [
      { q: 'Come si fa un preventivo velocemente da artigiano?', a: "Detti le Sue righe a voce alta in cantiere o in auto. Cantia le trasforma in posizioni con prezzo usando i Suoi prezzi abituali, e il PDF è pronto ancora prima di aver lasciato il cliente." },
      { q: 'Il preventivo è conforme agli usi svizzeri (IVA, impaginazione)?', a: "Sì: ogni preventivo riprende la Sua aliquota IVA, i Suoi dati aziendali e può essere personalizzato con il colore del Suo marchio e il Suo logo." },
      { q: 'Si può trasformare automaticamente un preventivo accettato in fattura?', a: "Sì, un preventivo accettato si converte in fattura — con fattura QR svizzera — con un clic, senza reinserire le righe." },
      { q: 'Cantia è gratuito per fare i preventivi?', a: "Cantia offre una prova gratuita di 14 giorni su tutti i piani (carta di credito richiesta, nessun addebito prima della fine della prova). Una volta abbonati, preventivi e fatture sono illimitati su ogni piano, senza quota mensile." },
    ],
  },
  {
    path: 'it/solutions/facturation',
    title: 'Fatturazione & fattura QR svizzera | Cantia',
    description:
      "Ogni fattura Cantia integra automaticamente la fattura QR svizzera conforme — IBAN, riferimento strutturato e importo già codificati, pronta per essere scansionata.",
    faq: [
      { q: 'Come si crea una fattura con fattura QR svizzera?', a: "Inserisca il Suo IBAN una sola volta nelle impostazioni: ogni fattura genera poi automaticamente la polizza QR conforme alla norma SIX, con IBAN e riferimento strutturato già codificati." },
      { q: 'Si può fatturare un acconto prima della fine del cantiere?', a: "Sì, Cantia consente di emettere una fattura d'acconto per una percentuale del preventivo, poi deduce automaticamente questo importo dalla fattura finale." },
      { q: 'Come si sa se una fattura è stata pagata?', a: "Cerchi e riconcili un pagamento direttamente dal suo numero di riferimento QR — lo stato passa a «pagata» senza dover verificare manualmente il Suo conto bancario." },
      { q: 'Quanto costa la fatturazione con QR-code tramite Cantia?', a: "La fatturazione con fattura QR svizzera è inclusa in tutti i piani Cantia, senza eccezioni, già a partire dal piano Essentiel." },
    ],
  },
  {
    path: 'it/solutions/rapports-chantier',
    title: 'Rapporti di cantiere | Cantia',
    description:
      "Note vocali, foto geolocalizzate e messaggi di squadra: Cantia ne ricava un rapporto redatto e strutturato, pronto per l'invio.",
    faq: [
      { q: 'Come si redige rapidamente un rapporto di cantiere?', a: "Scatti le Sue foto e detti le Sue note sul momento — Cantia assembla tutto in un rapporto PDF strutturato e pronto per l'invio, senza dover riscrivere tutto la sera." },
      { q: 'Le foto vengono geolocalizzate automaticamente?', a: "Sì, ogni foto viene marcata temporalmente e geolocalizzata senza alcuna azione aggiuntiva da parte Sua." },
      { q: 'Si può personalizzare il rapporto con logo e firma?', a: "Sì, ogni rapporto PDF riprende il Suo logo, il colore del Suo marchio e la firma di chi lo ha redatto." },
      { q: 'Il rapporto di cantiere sostituisce un diario di cantiere cartaceo?', a: "Sì — note, foto e monitoraggio sono centralizzati in un documento digitale consultabile in qualsiasi momento, per cantiere." },
    ],
  },
  {
    path: 'it/solutions/dictee-vocale',
    title: "Dettatura vocale per l'edilizia | Cantia",
    description: "Preventivi, rapporti, messaggi di squadra: un pulsante per dettare sostituisce la digitazione, ovunque in Cantia.",
    faq: [
      { q: 'La dettatura vocale funziona bene con il vocabolario edile?', a: "Sì, il riconoscimento è adattato al vocabolario tecnico dell'edilizia — materiali, unità, mestieri — non solo al linguaggio comune." },
      { q: 'Serve una connessione internet per dettare?', a: "Sì, la dettatura richiede una connessione per la trascrizione, ma i preventivi e i rapporti generati restano consultabili una volta creati." },
      { q: 'Dove si può usare la dettatura vocale in Cantia?', a: "Sui preventivi, sui rapporti di cantiere e sui messaggi di squadra del feed — ovunque Lei scriva." },
      { q: 'La dettatura vocale è più veloce della tastiera sul campo?', a: "Per la maggior parte degli artigiani in cantiere, sì — parlare è più veloce che digitare su un telefono con le mani sporche o i guanti." },
    ],
  },
  {
    path: 'it/solutions/planning',
    title: 'Pianificazione di squadra cantiere | Cantia',
    description: "Un vero calendario di squadra: ogni membro, ogni cantiere, ogni giorno. Basta con i planning su carta o WhatsApp.",
    faq: [
      { q: 'Come organizzare la pianificazione di una squadra di cantiere?', a: 'Cantia mostra un calendario settimanale condiviso: ogni membro vede chi è su quale cantiere, ogni giorno.' },
      { q: 'La pianificazione sostituisce un foglio Excel o un gruppo WhatsApp?', a: "Sì, tutta la squadra consulta le stesse informazioni in tempo reale, senza file né messaggi da scorrere." },
      { q: 'Si possono pianificare più cantieri in parallelo?', a: "Sì, ogni assegnazione è collegata a un cantiere preciso e resta visibile per tutta la settimana, membro per membro." },
      { q: 'La pianificazione è inclusa in tutti i piani Cantia?', a: "È disponibile a partire dal piano Team, attivabile dalle impostazioni della Sua organizzazione." },
    ],
  },
  {
    path: 'it/solutions/rentabilite',
    title: 'Redditività per cantiere | Cantia',
    description:
      "Confronti il preventivo accettato con il costo reale — materiale e manodopera — per sapere se ogni cantiere è redditizio, in margine ristretto o in perdita.",
    faq: [
      { q: 'Come si sa se un cantiere è redditizio?', a: "Cantia confronta il preventivo accettato (ricavo) con il costo reale — materiale registrato e manodopera derivata dalle ore inserite — e mostra il margine in CHF e in % in tempo reale." },
      { q: 'Da dove viene il calcolo del costo della manodopera?', a: "Dalla pianificazione di squadra: i giorni assegnati a un cantiere vengono moltiplicati per il costo orario della Sua azienda, senza registrazione separata." },
      { q: 'Si possono confrontare più cantieri tra loro?', a: "Sì, ogni cantiere mostra il proprio margine, il che permette di individuare rapidamente i cantieri in perdita." },
      { q: 'La redditività per cantiere è inclusa in tutti i piani Cantia?', a: "È disponibile a partire dal piano Team, attivabile dalle impostazioni della Sua organizzazione." },
    ],
  },
  {
    path: 'it/solutions/rh-salaires',
    title: "HR, ore & salari per l'edilizia | Cantia",
    description:
      "Ogni dipendente registra le proprie ore per cantiere e le proprie spese professionali; la segretaria o l'amministratore gestisce la busta paga di tutta la squadra, dal lordo al netto.",
    faq: [
      { q: 'Chi può vedere i salari in Cantia?', a: "Solo la segretaria HR e gli amministratori, secondo i permessi assegnati da Squadra. Un dipendente standard vede solo le proprie ore e spese." },
      { q: 'Cantia calcola automaticamente i contributi sociali svizzeri?', a: "Cantia calcola il salario netto a partire da aliquote AVS/AD/LPP/LAINF configurabili e da un'aliquota d'imposta alla fonte per dipendente — le aliquote predefinite sono indicative, da adattare secondo la Sua cassa di compensazione, la Sua cassa LPP e il cantone." },
      { q: 'Come esporta un dipendente il proprio foglio ore?', a: "Dal modulo HR & Salari, scegliendo la granularità — giornaliera, settimanale o mensile — poi scaricando un file CSV." },
      { q: 'Il modulo HR & Salari è incluso in tutti i piani Cantia?', a: "È disponibile a partire dal piano Team, attivabile dalle impostazioni della Sua organizzazione." },
    ],
  },
  {
    path: 'it/solutions/travaux-supplementaires',
    title: 'Lavori supplementari (LS) per artigiani svizzeri | Cantia',
    description:
      "Ogni extra richiesto durante il cantiere diventa un documento datato, firmato online dal cliente e trasformato automaticamente in fattura — basta con gli extra dimenticati o contestati.",
    faq: [
      { q: "Che cos'è un Lavoro supplementare (LS) in Cantia?", a: "È un documento dedicato per tutto ciò che viene richiesto durante il cantiere in aggiunta al preventivo iniziale — un muro da spostare, una presa da aggiungere. Si crea, si invia e si firma come un preventivo, poi si trasforma automaticamente in fattura una volta accettato." },
      { q: 'Un LS deve essere collegato a un preventivo esistente?', a: "No, è facoltativo. Può collegarlo al preventivo d'origine per mantenere il contesto, oppure crearlo da solo se il cantiere non ha un preventivo iniziale in Cantia." },
      { q: 'Come approva il cliente un Lavoro supplementare?', a: "Riceve un link a un portale sicuro, consulta il dettaglio con i prezzi e firma online — l'accettazione è marcata temporalmente e attiva automaticamente la fattura corrispondente." },
      { q: 'I lavori supplementari contano nella Redditività per cantiere?', a: "Sì: non appena un LS viene accettato, il suo importo si aggiunge automaticamente al totale preventivato del cantiere nel modulo Redditività." },
    ],
  },
  {
    path: 'it/solutions/tresorerie',
    title: "Liquidità previsionale per l'edilizia | Cantia",
    description:
      "Fatture da incassare, salari, subappaltatori e spese ricorrenti riuniti in una proiezione a 90 giorni — senza connessione bancaria.",
    faq: [
      { q: 'Cantia si collega al mio conto bancario?', a: 'No. Inserisce il Suo saldo manualmente quando lo desidera — non viene richiesto né è necessario alcun accesso bancario.' },
      { q: 'Da dove provengono gli importi della proiezione?', a: "Dalle fatture clienti non saldate, da una stima della massa salariale (profili HR + ore inserite), dalle fatture subappaltatori non pagate e dalle spese ricorrenti che Lei registra — tutto ciò che Cantia sa già sulla Sua attività." },
      { q: 'Come funzionano i promemoria delle spese ricorrenti?', a: "Un banner sulla home e sulla pagina Liquidità Le segnala le spese ricorrenti attive in scadenza nei prossimi 7 giorni, prima che vengano addebitate." },
      { q: 'La Liquidità previsionale è inclusa in tutti i piani Cantia?', a: 'È disponibile a partire dal piano Team, attivabile dalle impostazioni della Sua organizzazione.' },
    ],
  },
  {
    path: 'it/integrations',
    title: 'Integrazioni | Cantia',
    description:
      "Cantia si collega direttamente alla Sua contabilità: Bexio già da oggi, clienti e articoli importati, fatture inviate con un clic, stati di pagamento sincronizzati.",
    faq: [
      { q: 'Quali integrazioni offre Cantia oggi?', a: 'Bexio, disponibile nativamente a partire dal piano Team. Altre integrazioni seguiranno lo stesso principio di connessione ufficiale.' },
      { q: "L'integrazione Bexio è a pagamento oltre all'abbonamento?", a: 'No — è inclusa automaticamente a partire dal piano Team, senza modulo né costo aggiuntivo.' },
      { q: 'Cantia può inviare una fattura definitiva al mio cliente tramite Bexio?', a: 'No. Ogni fattura arriva in Bexio solo come bozza — la finalizzazione resta sempre un’azione manuale lato Bexio.' },
    ],
  },
  {
    path: 'it/sur-mesure',
    title: 'Sviluppo su misura | Cantia',
    description:
      "Oltre ai moduli standard, Cantia può sviluppare un flusso di lavoro, un'automazione o un'integrazione appositamente per la Sua azienda — senza cambiare l'esperienza degli altri clienti.",
    faq: [
      { q: 'Un modulo su misura è visibile ad altre aziende?', a: 'No. Un modulo sviluppato per Lei viene attivato solo per la Sua organizzazione — gli altri clienti Cantia non lo vedono mai.' },
      { q: 'Devo cambiare software o installare qualcos’altro?', a: 'No — il modulo vive nello stesso Cantia che già usa, con gli stessi accessi e gli stessi aggiornamenti.' },
      { q: 'Quanto costa uno sviluppo su misura?', a: 'Dipende interamente dalla necessità. Ne discutiamo prima insieme, e riceve un preventivo chiaro prima di ogni impegno.' },
    ],
  },
  {
    path: 'it/plans/essentiel',
    title: 'Piano Essenziale — preventivi e fatture illimitati | Cantia',
    description:
      'CHF 39/mese: preventivi, fatture e rapporti illimitati, QR-fattura svizzera, personalizzazione del marchio e assistente vocale IA. Scopra il piano Essenziale.',
    faq: [
      { q: 'Può cambiare piano in seguito?', a: "Sì, in qualsiasi momento dalle impostazioni della sua azienda. Il cambio è immediato e l'importo viene adeguato pro rata." },
      { q: "C'è un impegno minimo?", a: 'No. Tutti i piani sono senza impegno, disdicibili in qualsiasi momento, con 14 giorni di prova gratuita inclusi.' },
      { q: "Il prezzo include l'IVA?", a: "I prezzi indicati sono al netto dell'IVA. L'IVA svizzera viene aggiunta al momento della fatturazione." },
    ],
  },
  {
    path: 'it/plans/equipe',
    title: 'Piano Team — pianificazione, personale e liquidità | Cantia',
    description:
      'CHF 79/mese: tutto Essenziale, più pianificazione, personale e salari, redditività per cantiere, liquidità e integrazione Bexio. Scopra il piano Team.',
    faq: [
      { q: 'Può cambiare piano in seguito?', a: "Sì, in qualsiasi momento dalle impostazioni della sua azienda. Il cambio è immediato e l'importo viene adeguato pro rata." },
      { q: "C'è un impegno minimo?", a: 'No. Tutti i piani sono senza impegno, disdicibili in qualsiasi momento, con 14 giorni di prova gratuita inclusi.' },
      { q: "Il prezzo include l'IVA?", a: "I prezzi indicati sono al netto dell'IVA. L'IVA svizzera viene aggiunta al momento della fatturazione." },
    ],
  },
  {
    path: 'it/plans/entreprise',
    title: 'Piano Azienda — per le strutture consolidate | Cantia',
    description:
      'CHF 129/mese: tutto Team su scala più ampia (25 membri, 40 GB), il contingente IA più ampio, ruoli avanzati illimitati e supporto prioritario.',
    faq: [
      { q: 'Può cambiare piano in seguito?', a: "Sì, in qualsiasi momento dalle impostazioni della sua azienda. Il cambio è immediato e l'importo viene adeguato pro rata." },
      { q: "C'è un impegno minimo?", a: 'No. Tutti i piani sono senza impegno, disdicibili in qualsiasi momento, con 14 giorni di prova gratuita inclusi.' },
      { q: "Il prezzo include l'IVA?", a: "I prezzi indicati sono al netto dell'IVA. L'IVA svizzera viene aggiunta al momento della fatturazione." },
    ],
  },
  {
    path: 'it/blog',
    title: "Blog | Cantia — Risposte concrete per l'edilizia svizzera",
    description:
      "Preventivi, fatturazione, HR, aspetti legali, confronti: risposte precise alle domande che si pongono gli artigiani e le imprese edili in Svizzera.",
  },
  ...TRADE_SEO_IT,
  {
    path: 'it/metiers',
    title: 'Cantia per il Suo mestiere | Software di gestione per mestiere',
    description:
      'Cantia centralizza preventivi, cantieri, squadra e fatturazione. Scopra come si adatta al quotidiano del Suo mestiere edile in Svizzera.',
  },
  {
    path: 'it/telechargement',
    title: 'Scaricare Cantia | App mobile & web',
    description: "Cantia funziona come un'applicazione web installabile, su computer come su telefono. App native iOS e Android disponibili a breve.",
  },
  {
    path: 'it/mentions-legales',
    title: 'Note legali | Cantia',
    description: "Note legali di Cantia, software di gestione cantieri per l'edilizia svizzera.",
  },
  {
    path: 'it/confidentialite',
    title: 'Informativa sulla privacy | Cantia',
    description:
      "Informativa sulla privacy di Cantia: dati raccolti, hosting in Svizzera, diritti degli utenti.",
  },
  {
    path: 'it/conditions-generales',
    title: 'Condizioni generali | Cantia',
    description: "Condizioni generali di utilizzo e di vendita di Cantia: prova gratuita, abbonamento, disdetta, diritto applicabile.",
  },
  {
    path: 'it/aide',
    title: 'Centro assistenza | Cantia',
    description:
      "Tutte le risposte alle domande frequenti su Cantia: preventivi, fatture, cantieri, squadra, fatturazione. Guide e tutorial video.",
  },
  {
    path: 'it/contact',
    title: 'Contatto | Cantia',
    description: 'Una domanda, un problema, un suggerimento? Contatti il team Cantia — risposta entro 24 ore lavorative.',
  },
  {
    path: 'it/aide/videos',
    title: 'Tutorial video | Centro assistenza Cantia',
    description:
      'Veda ogni modulo Cantia in azione: preventivi, fatture, cantieri, pianificazione, HR — dimostrazioni video modulo per modulo.',
  },
  {
    path: 'it/aide/ressources',
    title: 'Risorse da scaricare | Centro assistenza Cantia',
    description:
      'Scarichi la brochure di presentazione Cantia in PDF: funzionalità, tariffe e vantaggi per le imprese edili in Svizzera.',
  },
  {
    path: 'blog/action-garantie-sous-traitant-entrepreneur-general',
    title: 'Action en garantie entre sous-traitant et entrepreneur général | Cantia',
    description:
      'Comment fonctionne l’action en garantie entre un sous-traitant et un entrepreneur général en cas de défaut, et pourquoi une assurance RC pro propre est essentielle.',
    faq: [
      { q: 'Le maître d’ouvrage peut-il agir directement contre un sous-traitant ?', a: 'En général non, faute de lien contractuel direct entre eux — le maître d’ouvrage agit contre l’entrepreneur général, qui se retourne ensuite lui-même contre le sous-traitant concerné si nécessaire.' },
      { q: 'Dans quel délai une action en garantie peut-elle être engagée ?', a: 'Cela dépend des délais de garantie prévus au contrat et des règles de prescription applicables, qui varient selon les cas. Consultez un avocat pour évaluer les délais précis de votre situation.' },
      { q: 'Une clause contractuelle peut-elle limiter la responsabilité d’un sous-traitant ?', a: 'Dans une certaine mesure, oui, selon ce que prévoit le contrat de sous-traitance. Mais certaines limitations peuvent être contestées selon les circonstances — à vérifier avec un avocat lors de la rédaction du contrat.' },
    ],
  },
  {
    path: 'blog/affacturage-factoring-entreprise-batiment-suisse',
    title: 'L’affacturage (factoring) pour une entreprise du bâtiment : bonne idée ? | Cantia',
    description:
      'Comment fonctionne l’affacturage, ses avantages et ses inconvénients pour une entreprise du bâtiment, et dans quels cas précis il vaut vraiment le coût de la commission.',
    faq: [
      { q: 'L’affacturage est-il réservé aux grandes entreprises ?', a: 'Non, des formules existent aussi pour les PME, mais leur intérêt économique dépend du volume et du montant des factures concernées. En dessous d’un certain seuil, le coût peut ne pas justifier la mise en place.' },
      { q: 'Le client sait-il que sa facture a été cédée à un organisme de factoring ?', a: 'Oui, en général le client est informé et règle directement l’organisme de factoring plutôt que l’entreprise elle-même. Certaines formules plus discrètes existent, mais elles restent moins courantes.' },
      { q: 'L’affacturage couvre-t-il le risque d’impayé total ?', a: 'Cela dépend de la formule choisie : certains contrats transfèrent une partie du risque d’impayé à l’organisme de factoring, d’autres non. C’est un point essentiel à clarifier avant de signer.' },
    ],
  },
  {
    path: 'blog/arbitrage-sia-mediation-professionnelle-batiment',
    title: 'Arbitrage SIA : une alternative au tribunal pour un litige de chantier | Cantia',
    description:
      'Ce qu’est une clause d’arbitrage SIA dans un contrat de construction, ses avantages et inconvénients face à un tribunal ordinaire, et comment savoir si elle s’applique.',
    faq: [
      { q: 'Comment savoir si mon contrat contient une clause d’arbitrage SIA ?', a: 'En relisant les conditions générales ou les clauses particulières du contrat, souvent en référence aux normes SIA 118. En cas de doute, un avocat peut confirmer si la clause s’applique à votre situation.' },
      { q: 'Peut-on refuser l’arbitrage si le contrat le prévoit ?', a: 'Généralement non, une fois la clause acceptée dans le contrat, elle engage les deux parties pour la résolution d’un litige futur, sauf accord mutuel de la modifier.' },
      { q: 'Une sentence arbitrale peut-elle être contestée devant un tribunal ?', a: 'Les possibilités de recours sont généralement très limitées, contrairement à un jugement ordinaire. Consultez un avocat pour connaître les voies de recours applicables à votre situation précise.' },
    ],
  },
  {
    path: 'blog/assurance-bris-machine-outillage-chantier',
    title: 'Assurance bris de machine et vol d’outillage sur chantier | Cantia',
    description:
      'Pourquoi l’outillage laissé sur chantier attire le vol, la différence entre assurance choses classique et couverture outillage mobile, et ce qu’il faut vérifier avant de signer.',
    faq: [
      { q: 'L’assurance de l’entreprise couvre-t-elle automatiquement le vol sur chantier ?', a: 'Pas toujours. Une police d’assurance choses standard couvre en général le matériel dans les locaux de l’entreprise, pas systématiquement sur chantier. Il faut vérifier ou ajouter une extension outillage mobile.' },
      { q: 'Faut-il assurer chaque outil individuellement ?', a: 'Non, la plupart des contrats fonctionnent avec une valeur totale déclarée pour l’ensemble du parc, complétée par un plafond par objet pour les machines les plus coûteuses. L’important est de tenir cette liste à jour.' },
      { q: 'Le bris accidentel est-il couvert de la même façon que le vol ?', a: 'Généralement non, ce sont souvent deux garanties distinctes dans le contrat, avec des conditions et parfois des franchises différentes. Il faut vérifier que les deux sont bien incluses, pas seulement le vol.' },
    ],
  },
  {
    path: 'blog/assurance-cyber-pme-batiment-donnees-clients',
    title: 'Assurance cyber pour une PME du bâtiment : pourquoi y penser | Cantia',
    description:
      'Pourquoi une petite entreprise du bâtiment n’est pas à l’abri d’un incident numérique, ce que couvre en général une assurance cyber, et pourquoi les bonnes pratiques restent la première ligne de défense.',
    faq: [
      { q: 'Une entreprise de quelques employés est-elle vraiment une cible ?', a: 'Oui, les attaques automatisées ne ciblent pas la taille de l’entreprise mais les failles trouvées. Une petite structure avec des accès mal protégés est souvent plus facile à atteindre qu’une grande entreprise mieux équipée.' },
      { q: 'L’assurance cyber couvre-t-elle la rançon elle-même en cas de rançongiciel ?', a: 'Cela dépend entièrement du contrat et de l’assureur, et c’est un point à clarifier explicitement avant de signer. Certains contrats excluent le paiement de rançon, d’autres le couvrent sous conditions strictes.' },
      { q: 'Quelles bonnes pratiques réduisent le plus le risque au quotidien ?', a: 'Des sauvegardes automatiques régulières, des mots de passe différents et robustes par accès, et la méfiance envers les emails inattendus avec pièce jointe ou lien restent les mesures les plus efficaces, avant même de penser à une assurance.' },
    ],
  },
  {
    path: 'blog/assurance-perte-exploitation-chantier-arrete',
    title: 'Assurance perte d’exploitation : que couvre-t-elle si un chantier s’arrête | Cantia',
    description:
      'Différence entre assurance chantier ECTR et perte d’exploitation, quand cette couverture devient pertinente pour une entreprise du bâtiment, et ce qu’il faut vérifier avant de souscrire.',
    faq: [
      { q: 'L’assurance chantier ECTR couvre-t-elle la perte de revenu ?', a: 'Non, l’ECTR couvre en général les dommages physiques au chantier et aux matériaux, pas le manque à gagner lié à l’arrêt de l’activité. Il faut une assurance perte d’exploitation distincte pour couvrir ce second risque.' },
      { q: 'Toutes les entreprises du bâtiment ont-elles besoin d’une perte d’exploitation ?', a: 'Pas nécessairement. Elle devient surtout pertinente pour les entreprises fortement dépendantes d’un client ou d’un chantier unique, où un sinistre isolé peut avoir un impact majeur sur l’ensemble du chiffre d’affaires.' },
      { q: 'Comment est calculé le montant de l’indemnisation ?', a: 'Le calcul se base généralement sur les résultats antérieurs de l’entreprise et sur la durée réelle d’interruption, dans les limites fixées par le contrat. C’est un point à faire préciser clairement par l’assureur avant de signer.' },
    ],
  },
  {
    path: 'blog/assurance-protection-juridique-entreprise-batiment',
    title: 'Assurance protection juridique pour une entreprise du bâtiment : utile ou pas | Cantia',
    description:
      'Ce que couvre en général une protection juridique professionnelle dans le bâtiment, ce qu’elle ne couvre pas, et pourquoi les frais d’avocat dépassent parfois l’enjeu du litige lui-même.',
    faq: [
      { q: 'La protection juridique remplace-t-elle la RC professionnelle ?', a: 'Non. La protection juridique couvre les frais de procédure pour défendre ou faire valoir un droit, tandis que la RC professionnelle couvre le dommage lui-même quand l’entreprise est reconnue responsable. Les deux sont complémentaires, pas interchangeables.' },
      { q: 'Une petite entreprise du bâtiment a-t-elle vraiment besoin de cette assurance ?', a: 'Cela dépend surtout de la fréquence des litiges avec les clients et fournisseurs et du montant moyen des factures. Plus les chantiers sont nombreux et les clients particuliers, plus le risque de contestation ponctuelle est élevé.' },
      { q: 'Les litiges avec les employés sont-ils toujours couverts ?', a: 'Pas systématiquement : cela dépend du contrat souscrit. Il faut vérifier explicitement si le volet droit du travail, côté employeur, est inclus ou proposé en option auprès de l’assureur.' },
    ],
  },
  {
    path: 'blog/assurance-transport-materiel-chantier',
    title: 'Faut-il assurer le transport de matériel et marchandises vers le chantier | Cantia',
    description:
      'Les risques pendant le transport de matériel vers un chantier, la différence entre assurance du véhicule et assurance des marchandises transportées, et quand ça devient pertinent.',
    faq: [
      { q: 'L’assurance du camion suffit-elle à couvrir le matériel transporté ?', a: 'Non, en général l’assurance du véhicule couvre le camion lui-même, pas la valeur de ce qu’il transporte. Une assurance marchandises transportées, distincte, est nécessaire pour couvrir le chargement.' },
      { q: 'Faut-il assurer chaque trajet individuellement ?', a: 'Non, la plupart des contrats fonctionnent sur une base annuelle avec un plafond par trajet ou par sinistre, pas au coup par coup. C’est plus simple à gérer pour une entreprise qui transporte régulièrement du matériel.' },
      { q: 'Que se passe-t-il si le transport est sous-traité à un tiers ?', a: 'La responsabilité et la couverture dépendent alors du contrat du transporteur, dont les plafonds d’indemnisation sont parfois inférieurs à la valeur réelle transportée. Il vaut mieux le vérifier avant d’envoyer un chargement de valeur.' },
    ],
  },
  {
    path: 'blog/bilan-carbone-chantier-construction-suisse',
    title: 'Bilan carbone d’un chantier : de quoi parle-t-on vraiment | Cantia',
    description:
      'Matériaux, transport, énergie et déchets : voici ce qui compose réellement le bilan carbone d’un chantier suisse, et pourquoi ce critère revient de plus en plus dans les cahiers des charges.',
    faq: [
      { q: 'Qu’est-ce qui pèse le plus dans le bilan carbone d’un chantier ?', a: 'En général, la production des matériaux, en particulier le béton et l’acier, représente la part la plus importante, largement devant le transport ou l’énergie consommée directement sur le chantier.' },
      { q: 'Le bilan carbone d’un chantier est-il obligatoire en Suisse ?', a: 'Il n’existe pas d’obligation générale et uniforme, mais certains marchés publics ou projets soumis à des exigences environnementales spécifiques peuvent le demander explicitement dans leur cahier des charges.' },
      { q: 'Quelle différence entre le bilan carbone d’un bâtiment et celui d’un chantier ?', a: 'Le bilan carbone d’un bâtiment couvre toute sa durée de vie, chauffage et entretien compris sur plusieurs décennies, alors que celui d’un chantier se limite à la phase de construction ou de rénovation proprement dite.' },
    ],
  },
  {
    path: 'blog/cautionnement-bancaire-entreprise-generale-suisse',
    title: 'Cautionnement bancaire pour une entreprise générale : à quoi ça sert | Cantia',
    description:
      'Comment fonctionne un cautionnement bancaire exigé sur les gros chantiers et marchés publics, son coût général, et pourquoi il concerne surtout les entreprises générales.',
    faq: [
      { q: 'Le cautionnement bancaire remplace-t-il une assurance chantier ?', a: 'Non, ce sont deux mécanismes différents. Le cautionnement garantit au maître d’ouvrage que l’entreprise honorera ses engagements contractuels, tandis qu’une assurance chantier couvre les dommages physiques survenus pendant les travaux.' },
      { q: 'Une petite entreprise peut-elle obtenir un cautionnement bancaire ?', a: 'Oui, mais cela dépend de sa solidité financière et de son historique auprès de la banque. Une jeune entreprise sans historique long peut avoir plus de difficulté à l’obtenir seule, et se tourner vers un organisme de cautionnement PME en complément.' },
      { q: 'Le coût du cautionnement est-il négociable ?', a: 'La commission dépend généralement du montant garanti, de la durée et du profil de risque de l’entreprise évalué par la banque. Il vaut la peine de comparer plusieurs établissements avant de s’engager sur un gros marché.' },
    ],
  },
  {
    path: 'blog/certificat-energetique-cantonal-geak-batiment',
    title: 'Le CECB/GEAK : le certificat énergétique cantonal des bâtiments | Cantia',
    description:
      'Le CECB, aussi appelé GEAK, note l’efficacité énergétique d’un bâtiment de A à G. Obligatoire dans certains cantons lors d’une vente, il concerne aussi les artisans en rénovation énergétique.',
    faq: [
      { q: 'Le CECB et le GEAK sont-ils la même chose ?', a: 'Oui, ce sont deux noms pour le même certificat : GEAK en allemand (Gebäudeenergieausweis der Kantone) et CECB en français, tous deux désignant le certificat énergétique cantonal des bâtiments.' },
      { q: 'Le CECB est-il obligatoire dans toute la Suisse ?', a: 'Non, les exigences varient selon le canton, avec une obligation fréquente lors d’une vente et parfois lors d’une location, selon les règles cantonales en vigueur. Il faut vérifier la réglementation précise du canton concerné.' },
      { q: 'Le CECB donne-t-il droit à une subvention ?', a: 'Non, le CECB est un outil d’évaluation, pas de subvention. Les aides financières pour la rénovation énergétique relèvent d’autres dispositifs, comme le Programme Bâtiments, qui fonctionne indépendamment du certificat.' },
    ],
  },
  {
    path: 'blog/chantier-copropriete-ppe-facturation-suisse',
    title: 'Chantier en copropriété (PPE) : comment facturer plusieurs propriétaires | Cantia',
    description:
      'Assemblée de copropriétaires, administrateur PPE, répartition des quotes-parts : comment devis et facturation fonctionnent sur un chantier en propriété par étages en Suisse.',
    faq: [
      { q: 'Faut-il un devis signé par chaque copropriétaire individuellement ?', a: 'Non, généralement pas. C’est l’administrateur de la PPE qui signe au nom de la communauté, une fois le devis approuvé par l’assemblée générale des copropriétaires selon la majorité prévue par le règlement.' },
      { q: 'Que faire si un copropriétaire refuse de payer sa quote-part ?', a: 'Cette question relève généralement de la gestion interne de la PPE, pas de la relation entre l’entreprise et la copropriété. L’entreprise facture l’administration de la PPE, qui reste responsable du recouvrement auprès des copropriétaires selon les règles internes.' },
      { q: 'Combien de temps faut-il prévoir avant qu’un devis soit validé en PPE ?', a: 'Cela dépend du règlement de chaque PPE et de la fréquence des assemblées, mais il vaut mieux prévoir plusieurs semaines, voire plus si une assemblée extraordinaire doit être convoquée spécifiquement pour ces travaux.' },
    ],
  },
  {
    path: 'blog/chantier-propre-reduire-nuisances-voisinage',
    title: 'Chantier propre : réduire les nuisances pour le voisinage | Cantia',
    description:
      'Bruit, poussière, accès bloqués : un chantier mal géré crée des tensions durables avec le voisinage. Voici les réflexes concrets pour limiter les nuisances et préserver la réputation de l’entreprise.',
    faq: [
      { q: 'Existe-t-il des horaires légaux à respecter sur un chantier ?', a: 'Les horaires de tranquillité, notamment en soirée, tôt le matin et le dimanche, sont généralement fixés par la réglementation communale ou cantonale, avec des règles qui varient d’une commune à l’autre. Se renseigner localement avant le début du chantier évite les mauvaises surprises.' },
      { q: 'Faut-il prévenir les voisins avant de commencer un chantier ?', a: 'Ce n’est pas toujours une obligation légale, mais c’est une pratique fortement recommandée, en particulier avant une phase bruyante ou un blocage d’accès. Un simple mot informatif suffit souvent à désamorcer une tension avant qu’elle n’apparaisse.' },
      { q: 'Un voisinage mécontent peut-il vraiment nuire à l’entreprise ?', a: 'Oui, un voisin excédé peut se plaindre auprès de la commune, mais aussi laisser un avis négatif en ligne visible par de futurs clients, ce qui pèse directement sur la réputation de l’entreprise au-delà du chantier concerné.' },
    ],
  },
  {
    path: 'blog/comparer-devis-fournisseurs-materiaux-methode',
    title: 'Comment comparer plusieurs devis fournisseurs sans se tromper | Cantia',
    description:
      'La méthode pour comparer plusieurs devis fournisseurs de matériaux sur des bases équivalentes, sans se laisser piéger par le seul prix total.',
    faq: [
      { q: 'Faut-il toujours demander plusieurs devis avant une commande de matériaux ?', a: 'Pour les commandes importantes ou récurrentes, oui. Pour un petit achat ponctuel, le temps passé à comparer peut dépasser le gain potentiel.' },
      { q: 'Comment comparer des devis avec des unités de mesure différentes ?', a: 'Ramenez systématiquement les prix à une unité commune (le mètre carré, le mètre cube, la pièce) avant de comparer, plutôt que de comparer des montants globaux qui masquent des quantités différentes.' },
      { q: 'Un devis fournisseur est-il engageant une fois accepté ?', a: 'Généralement oui, dans les conditions et délais qu’il précise. Vérifiez sa durée de validité, car un prix peut ne plus être garanti au-delà d’une certaine date.' },
    ],
  },
  {
    path: 'blog/construction-modulaire-prefabriquee-suisse',
    title: 'Construction modulaire et préfabriquée : où en est la Suisse | Cantia',
    description:
      'Principe, avantages, limites et impact sur l’organisation d’une entreprise : où en est la construction modulaire et préfabriquée en Suisse en 2026.',
    faq: [
      { q: 'La construction modulaire coûte-t-elle plus cher que la construction traditionnelle ?', a: 'Cela dépend fortement du projet. Le gain de temps et la réduction de la main-d’œuvre sur site compensent souvent un coût de fabrication en atelier plus élevé, mais le calcul reste à faire projet par projet, notamment selon la complexité du transport et du grutage.' },
      { q: 'Peut-on personnaliser un bâtiment modulaire comme une construction classique ?', a: 'La personnalisation est généralement plus limitée qu’en construction traditionnelle, mais l’offre s’est élargie : de nombreux fabricants proposent aujourd’hui des configurations modulables. Il vaut mieux clarifier ce point avec le client dès le devis pour éviter les malentendus.' },
      { q: 'Faut-il des compétences particulières pour travailler sur un chantier modulaire ?', a: 'La compétence clé se déplace vers la préparation : lecture de plans précis, coordination avec l’atelier de fabrication, et gestion logistique du transport et du grutage. Le travail d’assemblage sur site demande une bonne organisation plus qu’un nouveau métier.' },
    ],
  },
  {
    path: 'blog/cooperative-cautionnement-pme-financement-batiment',
    title: 'Cautionnement PME : une alternative pour financer son entreprise du bâtiment | Cantia',
    description:
      'Comment fonctionnent les organismes de cautionnement PME en Suisse, pourquoi ils sont utiles à une jeune entreprise du bâtiment sans historique bancaire, et la démarche pour y accéder.',
    faq: [
      { q: 'Le cautionnement PME est-il réservé aux entreprises du bâtiment ?', a: 'Non, ces organismes accompagnent des PME de nombreux secteurs, mais le bâtiment y recourt fréquemment en raison des besoins d’investissement en matériel et véhicules dès les premières années d’activité.' },
      { q: 'Une raison individuelle peut-elle en bénéficier ?', a: 'Oui, le statut juridique n’est en général pas un critère d’exclusion, mais les critères précis d’éligibilité, montant garanti et conditions varient selon l’organisme régional concerné.' },
      { q: 'Le cautionnement PME accélère-t-il l’obtention du crédit ?', a: 'Pas forcément plus vite qu’un crédit classique accepté directement par une banque, mais il rend possible un financement qui aurait sinon été refusé faute de garanties suffisantes. C’est surtout un accès qu’il facilite, pas nécessairement une rapidité.' },
    ],
  },
  {
    path: 'blog/credit-construction-hypothecaire-entreprise-batiment',
    title: 'Le crédit de construction : ce qu’un entrepreneur doit comprendre | Cantia',
    description:
      'Comment fonctionne un crédit de construction, pourquoi il influence directement le rythme de paiement d’un client, et comment adapter son calendrier de facturation par situations.',
    faq: [
      { q: 'Le crédit de construction concerne-t-il l’entreprise ou uniquement le client ?', a: 'Il est généralement contracté par le maître d’ouvrage, pas par l’entreprise qui réalise les travaux. Mais son rythme de déblocage influence directement la rapidité avec laquelle ce client peut régler les factures de l’entreprise.' },
      { q: 'Pourquoi un client solvable peut-il quand même payer en retard ?', a: 'Parce que le paiement dépend parfois du déblocage d’une tranche de crédit par la banque, qui exige ses propres vérifications d’avancement avant de libérer les fonds. Le retard vient alors du processus bancaire, pas d’un manque de volonté du client.' },
      { q: 'La facturation par situations aide-t-elle vraiment à limiter ce risque ?', a: 'Oui, en alignant ses factures sur les jalons d’avancement que la banque du client va de toute façon vérifier, l’entreprise réduit le décalage entre sa demande de paiement et le moment où le client dispose réellement des fonds.' },
    ],
  },
  {
    path: 'blog/deleguer-sans-tout-controler-patron-artisan',
    title: 'Déléguer sans tout contrôler : le vrai défi du patron artisan | Cantia',
    description:
      'Beaucoup de patrons artisans restent l’unique point de passage de toutes les décisions, même en grandissant. Voici ce que ça coûte réellement, et les premiers pas concrets pour déléguer sans tout lâcher.',
    faq: [
      { q: 'Pourquoi est-il si difficile pour un patron artisan de déléguer ?', a: 'C’est souvent une habitude héritée des débuts de l’entreprise, quand tout contrôler était réellement nécessaire faute d’équipe. Ce réflexe persiste même quand l’entreprise a grandi et que les employés seraient capables de prendre certaines décisions seuls.' },
      { q: 'Par où commencer pour déléguer sans tout lâcher d’un coup ?', a: 'Choisir une tâche complète à faible risque, avec un résultat attendu clair, et accepter qu’elle soit exécutée différemment de sa propre méthode tant que le résultat final convient. Cette première expérience construit progressivement la confiance nécessaire pour aller plus loin.' },
      { q: 'Le manque de délégation limite-t-il vraiment la croissance d’une entreprise du bâtiment ?', a: 'Oui, dans la plupart des cas : une entreprise dont toutes les décisions passent par une seule personne ne peut pas gérer plus de chantiers que ce que cette personne peut superviser directement, ce qui plafonne mécaniquement sa croissance.' },
    ],
  },
  {
    path: 'blog/devis-facture-construction-bois-ossature-suisse',
    title: 'Devis et facturation pour une entreprise de construction bois | Cantia',
    description:
      'Ossature complète plutôt que charpente seule, préfabrication en atelier, délai de montage réduit : comment chiffrer et facturer une construction bois en Suisse.',
    faq: [
      { q: 'Quelle est la différence entre une entreprise de charpente et une entreprise de construction bois ?', a: 'Une entreprise de charpente traditionnelle réalise généralement la structure de toiture d’un bâtiment déjà construit. Une entreprise de construction bois conçoit et réalise l’ossature porteuse complète du bâtiment, murs compris, pas seulement la toiture.' },
      { q: 'La préfabrication en atelier rend-elle le devis plus prévisible ?', a: 'Généralement oui, car une part importante du travail est réalisée dans des conditions contrôlées en atelier, avec moins d’aléas que sur un chantier extérieur. Le montage sur site reste toutefois soumis aux conditions d’accès et à la météo du jour de pose.' },
      { q: 'Une construction bois est-elle plus rapide à livrer qu’une construction maçonnée ?', a: 'Le montage de l’ossature elle-même est généralement plus rapide, souvent quelques jours seulement. Mais le délai de livraison final dépend aussi du second œuvre et des finitions, qui suivent un calendrier comparable à celui d’une construction traditionnelle.' },
    ],
  },
  {
    path: 'blog/devis-facture-demolition-suisse',
    title: 'Devis et facturation pour une entreprise de démolition en Suisse | Cantia',
    description:
      'Accessibilité, évacuation des gravats, diagnostic amiante préalable : comment chiffrer et facturer un chantier de démolition en Suisse sans sous-estimer les postes cachés.',
    faq: [
      { q: 'Le diagnostic amiante est-il obligatoire avant une démolition ?', a: 'Il est généralement requis pour les bâtiments construits avant une certaine période, avant toute démolition. Les règles exactes dépendent du canton et du type de bâtiment : il vaut mieux vérifier auprès des autorités compétentes avant de chiffrer les travaux.' },
      { q: 'Pourquoi le coût d’évacuation des gravats varie-t-il autant d’un chantier à l’autre ?', a: 'Le coût dépend du volume réel de déchets, de leur nature (inertes, dangereux, valorisables) et de la distance jusqu’aux filières de traitement adaptées. Un tri mal anticipé peut aussi faire grimper la facture si des matériaux dangereux sont mélangés aux gravats classiques.' },
      { q: 'Peut-on donner un prix ferme avant d’avoir visité le bâtiment à démolir ?', a: 'Ce n’est généralement pas recommandé. Sans visite et sans diagnostic préalable, mieux vaut présenter une estimation sous réserve, le temps de confirmer la structure réelle, l’accessibilité et l’absence ou la présence de matériaux dangereux.' },
    ],
  },
  {
    path: 'blog/devis-facture-echafaudeur-suisse',
    title: 'Devis et facturation pour un échafaudeur en Suisse | Cantia',
    description:
      'Location à la durée, montage et démontage, dépassement de délai, contrôle de sécurité : comment établir devis et factures en tant qu’échafaudeur en Suisse.',
    faq: [
      { q: 'Comment facturer un échafaudage qui reste plus longtemps que prévu sur un chantier ?', a: 'Le devis initial doit prévoir une clause de dépassement de durée, avec un tarif journalier ou hebdomadaire au-delà de la période contractuelle. Sans cette clause, la négociation devient plus difficile une fois le chantier en cours.' },
      { q: 'Qui est responsable si un échafaudage n’est pas conforme aux normes de sécurité ?', a: 'L’entreprise qui monte l’échafaudage porte généralement la responsabilité de sa conformité au moment de la mise à disposition. Un contrôle documenté avant remise au client protège l’échafaudeur en cas de contrôle ou d’incident ultérieur.' },
      { q: 'Le démontage est-il toujours inclus dans le prix du montage ?', a: 'C’est généralement le cas dans la plupart des devis d’échafaudage, mais il vaut mieux le préciser explicitement dans le devis pour éviter toute ambiguïté, notamment si le démontage doit intervenir dans des conditions différentes de celles prévues au montage.' },
    ],
  },
  {
    path: 'blog/devis-facture-entreprise-renovation-suisse',
    title: 'Devis et facturation pour une entreprise de rénovation générale | Cantia',
    description:
      'Coordination de plusieurs corps de métier, état réel du bâtiment inconnu au devis, clause d’imprévu structurel : comment chiffrer une rénovation générale en Suisse.',
    faq: [
      { q: 'Comment intégrer une clause d’imprévu structurel dans un devis de rénovation ?', a: 'Il faut mentionner explicitement que le devis se base sur l’état visible du bâtiment au moment du chiffrage, et prévoir la procédure en cas de découverte imprévue : arrêt du poste concerné, établissement d’un devis complémentaire, validation du client avant reprise des travaux.' },
      { q: 'Un sondage préalable élimine-t-il tous les risques de découverte imprévue ?', a: 'Non, il les réduit mais ne les élimine jamais complètement, en particulier sur un bâtiment ancien où certains éléments structurels ou techniques ne sont visibles qu’une fois les travaux de démolition partielle engagés.' },
      { q: 'Comment facturer un avenant lié à une découverte imprévue sans perdre la confiance du client ?', a: 'La transparence est essentielle : documenter la découverte avec des photos, expliquer clairement pourquoi elle n’était pas visible au moment du devis initial, et présenter un devis complémentaire détaillé avant de reprendre les travaux, plutôt que de facturer après coup sans explication.' },
    ],
  },
  {
    path: 'blog/devis-facture-etancheur-suisse',
    title: 'Devis et facturation pour un étancheur en Suisse | Cantia',
    description:
      'Toitures plates, terrasses, sous-sols : chiffrage au m² selon le système d’étanchéité et importance de la garantie pour un étancheur en Suisse.',
    faq: [
      { q: 'Quel système d’étanchéité choisir pour une terrasse accessible ?', a: 'Le choix dépend de l’usage prévu et du revêtement final souhaité. Une résine liquide convient souvent bien aux formes complexes et aux points singuliers, tandis qu’une membrane synthétique reste une valeur sûre pour de grandes surfaces exposées. Le conseil d’un professionnel reste indispensable au cas par cas.' },
      { q: 'Combien de temps après les travaux une infiltration peut-elle apparaître ?', a: 'Cela varie fortement selon la cause : un défaut de pose peut se révéler dès les premières fortes pluies, tandis qu’un vieillissement prématuré du matériau peut n’apparaître qu’après plusieurs années. C’est justement pour cela qu’une bonne documentation de l’exécution est essentielle.' },
      { q: 'Faut-il garantir l’étanchéité plus longtemps que les autres travaux du bâtiment ?', a: 'Les garanties légales générales s’appliquent, mais certains fabricants de systèmes d’étanchéité proposent en complément des garanties spécifiques sur leurs produits, sous réserve d’une pose conforme à leurs prescriptions. Il vaut mieux vérifier ces conditions avant de les indiquer au client.' },
    ],
  },
  {
    path: 'blog/devis-facture-genie-civil-suisse',
    title: 'Devis et facturation pour une entreprise de génie civil | Cantia',
    description:
      'Métré de grande envergure, marchés publics, situations d’avancement, cautionnements : comment chiffrer et facturer un chantier de génie civil en Suisse.',
    faq: [
      { q: 'Qu’est-ce qu’une situation d’avancement en génie civil ?', a: 'C’est une facturation périodique, généralement mensuelle, basée sur les quantités de travaux réellement exécutées depuis la dernière facturation, valorisées aux prix unitaires définis dans le contrat. Elle doit généralement être validée par le maître d’œuvre avant paiement.' },
      { q: 'Pourquoi une garantie bancaire est-elle souvent exigée sur ces marchés ?', a: 'Elle protège le maître d’ouvrage en cas de défaillance de l’entreprise en cours de chantier, notamment sur des marchés publics de montant important. Son coût et son délai d’obtention doivent être anticipés avant la remise de l’offre.' },
      { q: 'Le prix d’une soumission de génie civil est-il négociable après attribution ?', a: 'Sur un marché public, la marge de négociation après attribution est généralement très limitée, le prix ayant été fixé lors de la procédure de soumission. Des avenants restent possibles en cours de chantier, mais uniquement pour des travaux réellement supplémentaires ou imprévus.' },
    ],
  },
  {
    path: 'blog/devis-facture-parqueteur-suisse',
    title: 'Devis et facturation pour un parqueteur en Suisse | Cantia',
    description:
      'Chiffrage au m² selon le type de pose et l’essence, délai d’acclimatation du bois, ponçage et vitrification : comment établir devis et factures en tant que parqueteur en Suisse.',
    faq: [
      { q: 'Combien de temps faut-il pour l’acclimatation du bois avant la pose ?', a: 'Le délai varie selon l’essence, le taux d’humidité de la pièce et le type de bois, mais il faut généralement compter plusieurs jours. Le fournisseur du parquet donne généralement une recommandation précise selon le produit livré.' },
      { q: 'Le ponçage d’un parquet ancien peut-il être facturé au même tarif que la pose neuve ?', a: 'Non, ce sont deux prestations différentes avec des logiques de prix distinctes. Le ponçage dépend surtout de l’état du support existant et du nombre de passages nécessaires, alors que la pose neuve dépend de la surface et du type de pose choisi.' },
      { q: 'Un parquet flottant est-il toujours moins cher qu’un parquet collé ?', a: 'Généralement oui en termes de main-d’œuvre, mais pas systématiquement en fourniture : certains parquets flottants haut de gamme peuvent coûter plus cher que des parquets collés d’entrée de gamme. Le devis doit distinguer clairement les deux postes.' },
    ],
  },
  {
    path: 'blog/devis-facture-vitrier-suisse',
    title: 'Devis et facturation pour un vitrier en Suisse | Cantia',
    description:
      'Prise de mesure, délai de fabrication du verre, dépannage urgent ou remplacement planifié : comment chiffrer et facturer un chantier de vitrerie en Suisse.',
    faq: [
      { q: 'Faut-il facturer un devis pour un simple dépannage de vitre cassée ?', a: 'De nombreux vitriers facturent le dépannage directement après intervention plutôt que d’établir un devis préalable, notamment en cas d’urgence. Il reste toutefois recommandé d’indiquer une fourchette de prix au client par téléphone avant le déplacement.' },
      { q: 'Combien de temps prévoir pour la fabrication d’un vitrage sur mesure ?', a: 'Le délai varie selon le fournisseur et le type de vitrage, mais il faut généralement compter plusieurs semaines pour un double ou triple vitrage sur mesure. Ce délai doit être communiqué au client dès la signature du devis.' },
      { q: 'Le verre de sécurité feuilleté est-il obligatoire partout ?', a: 'Il est généralement requis dans certaines situations à risque, comme les garde-corps ou certaines zones de passage, selon les normes en vigueur. En cas de doute sur un cas précis, il vaut mieux vérifier auprès des normes applicables au type de bâtiment concerné.' },
    ],
  },
  {
    path: 'blog/entretien-annuel-employe-batiment-comment-faire',
    title: 'Comment mener un entretien annuel avec un employé du bâtiment | Cantia',
    description:
      'Rare dans un secteur rythmé par les chantiers plutôt que par un calendrier RH, l’entretien annuel reste pourtant un vrai outil de fidélisation. Voici une structure simple pour le rendre utile.',
    faq: [
      { q: 'L’entretien annuel est-il obligatoire dans le bâtiment en Suisse ?', a: 'Non, il ne s’agit pas d’une obligation légale générale, mais d’une bonne pratique de gestion d’équipe qui reste peu répandue dans un secteur où le rythme est dicté par les chantiers plutôt que par un calendrier RH formel.' },
      { q: 'Combien de temps faut-il prévoir pour un entretien annuel efficace ?', a: 'Trente à quarante-cinq minutes suffisent généralement pour couvrir un vrai bilan sans que l’exercice devienne trop lourd, à condition que la discussion reste concrète et centrée sur des faits plutôt que sur des généralités.' },
      { q: 'L’entretien annuel aide-t-il vraiment à fidéliser les employés ?', a: 'Il y contribue, en particulier dans un secteur en pénurie de main-d’œuvre qualifiée, car il montre à l’employé que son parcours est pris en compte au-delà de la seule exécution des tâches quotidiennes sur les chantiers.' },
    ],
  },
  {
    path: 'blog/expertise-judiciaire-malfacon-construction-suisse',
    title: 'Expertise judiciaire en cas de malfaçon : comment ça se passe | Cantia',
    description:
      'Comment se déroule une expertise judiciaire en cas de désaccord sur une malfaçon de construction, et pourquoi bien documenter le chantier facilite tout.',
    faq: [
      { q: 'Qui paie les frais de l’expertise judiciaire ?', a: 'Généralement la partie qui la demande en fait l’avance, puis les frais sont répartis selon l’issue de la procédure. Les règles précises varient selon les cas — consultez un avocat pour votre situation.' },
      { q: 'Peut-on contester les conclusions d’un expert judiciaire ?', a: 'Oui, généralement en demandant un complément d’expertise ou une contre-expertise si les conclusions semblent erronées ou incomplètes, mais cela allonge la procédure. À évaluer avec votre avocat selon le cas.' },
      { q: 'Une expertise amiable, hors tribunal, a-t-elle la même valeur ?', a: 'Une expertise amiable, réalisée d’un commun accord entre les parties, peut suffire à résoudre un désaccord sans procédure judiciaire, mais elle a généralement moins de poids qu’une expertise judiciaire si le litige finit tout de même devant un tribunal.' },
    ],
  },
  {
    path: 'blog/faillite-client-creance-impayee-que-faire',
    title: 'Un client fait faillite : que devient votre créance impayée | Cantia',
    description:
      'Ce que devient une créance impayée lorsqu’un client fait faillite : comment produire sa créance et pourquoi la situation diffère d’un simple impayé.',
    faq: [
      { q: 'Que faire si mon client refuse de payer mais n’est pas en faillite ?', a: 'C’est une situation différente, à traiter par la voie de la poursuite ordinaire pour facture impayée plutôt que par une production de créance. Consultez notre article sur la procédure de poursuite en Suisse pour la marche à suivre.' },
      { q: 'Dans quel délai faut-il produire sa créance lors d’une faillite ?', a: 'Le délai est fixé par la publication officielle de la faillite et varie selon les cas. Il est généralement de l’ordre de quelques semaines — vérifiez la publication précise ou consultez votre fiduciaire ou un avocat pour ne pas le manquer.' },
      { q: 'Peut-on récupérer sa créance plus vite en agissant tôt, avant la faillite ?', a: 'Dans certains cas, oui — une poursuite engagée avant l’ouverture de la faillite peut aboutir à une saisie de biens si le débiteur a encore des actifs. Une fois la faillite ouverte, la procédure devient collective et une démarche individuelle n’est plus possible.' },
    ],
  },
  {
    path: 'blog/formation-continue-obligatoire-batiment-suisse',
    title: 'Formation continue dans le bâtiment : ce qui est obligatoire | Cantia',
    description:
      'Sécurité SUVA, travail en hauteur, conduite d’engins : plusieurs habilitations du bâtiment doivent être recyclées périodiquement. Voici pourquoi les négliger expose l’entreprise en cas d’accident.',
    faq: [
      { q: 'Toutes les formations du bâtiment doivent-elles être recyclées périodiquement ?', a: 'Non, cela concerne surtout les habilitations liées à des travaux considérés à risque particulier, comme le travail en hauteur ou certaines opérations avec des engins spécifiques. La formation de base initiale n’a généralement pas besoin d’être répétée de la même façon.' },
      { q: 'Qui paie les formations de recyclage dans le bâtiment ?', a: 'C’est généralement à l’employeur d’organiser et de financer ces formations, dans le cadre de son obligation générale d’assurer la sécurité de ses employés sur les chantiers.' },
      { q: 'Que risque une entreprise si une habilitation n’est pas à jour lors d’un accident ?', a: 'La situation peut compliquer la prise en charge par l’assurance et engager davantage la responsabilité de l’entreprise, en particulier si l’accident concerne précisément le type de travaux couvert par l’habilitation expirée.' },
    ],
  },
  {
    path: 'blog/gerer-conflit-entre-deux-ouvriers-chantier',
    title: 'Gérer un conflit entre deux ouvriers sur un chantier | Cantia',
    description:
      'Pression des délais, proximité physique, fatigue : les tensions entre ouvriers sont fréquentes sur un chantier. Voici comment intervenir tôt et efficacement, avant que ça ne dégénère.',
    faq: [
      { q: 'Faut-il intervenir immédiatement dès qu’une tension apparaît entre deux ouvriers ?', a: 'Pas nécessairement dès la première friction, mais dès qu’une tension se répète sur plusieurs jours ou commence à affecter le travail, une intervention rapide reste préférable à l’attente d’une résolution spontanée, qui survient rarement.' },
      { q: 'Comment mener la discussion sans prendre parti ?', a: 'Écouter chaque personne séparément d’abord, puis recentrer l’échange commun sur des faits concrets liés au travail plutôt que sur les personnalités, aide à garder une posture neutre et à éviter d’envenimer la situation.' },
      { q: 'Quand faut-il faire appel à une aide extérieure pour un conflit d’équipe ?', a: 'Dès que le conflit touche à du harcèlement, des propos discriminatoires ou dépasse clairement une simple mésentente professionnelle, un accompagnement externe — RH, association professionnelle ou conseil juridique — devient nécessaire.' },
    ],
  },
  {
    path: 'blog/gestion-dechets-chantier-tri-obligatoire-suisse',
    title: 'Gestion des déchets de chantier : le tri obligatoire en Suisse | Cantia',
    description:
      'Le tri des déchets de chantier n’est plus une option en Suisse : béton, bois, métaux et déchets spéciaux doivent être séparés. Voici comment l’organiser sans perdre de temps ni d’argent.',
    faq: [
      { q: 'Le tri des déchets de chantier est-il obligatoire partout en Suisse ?', a: 'Le principe de séparation à la source est très largement appliqué, avec des exigences précises qui varient selon le canton et la commune. Dans le doute, le service cantonal de l’environnement ou le règlement communal de gestion des déchets donne les règles exactes applicables au chantier.' },
      { q: 'Que se passe-t-il si une benne de chantier n’est pas triée ?', a: 'La plupart des centres de traitement appliquent une surtaxe pour une benne mélangée, et certains refusent carrément de l’accepter. Sur un chantier soumis à des exigences contractuelles de tri, cela peut aussi créer un litige avec le maître d’ouvrage.' },
      { q: 'Que faire des matériaux suspectés de contenir de l’amiante ?', a: 'Ces matériaux ne se mélangent jamais avec les autres déchets et suivent une filière spécifique et strictement encadrée. En cas de doute sur la présence d’amiante, faire analyser le matériau avant toute démolition reste la seule approche sûre.' },
    ],
  },
  {
    path: 'blog/gestion-entreprise-generale-sous-traitants-suisse',
    title: 'Gérer une entreprise générale et ses sous-traitants en Suisse | Cantia',
    description:
      'Prix global, coordination multi-corps de métier, responsabilité vis-à-vis du client : comment une entreprise générale pilote ses sous-traitants et suit sa rentabilité en Suisse.',
    faq: [
      { q: 'L’entreprise générale est-elle responsable des malfaçons d’un sous-traitant ?', a: 'Oui, généralement, vis-à-vis du client. Le contrat lie l’entreprise générale au client, qui n’a pas de lien contractuel direct avec les sous-traitants. L’entreprise générale se retourne ensuite, si besoin, contre son sous-traitant selon les termes de leur propre contrat.' },
      { q: 'Comment savoir si un lot sous-traité est rentable ou déficitaire ?', a: 'Il faut comparer, pour chaque lot, le montant facturé au sous-traitant par l’entreprise générale au montant réellement payé à ce sous-traitant, en intégrant les éventuels avenants ou surcoûts. Un suivi chantier par chantier ne suffit pas : le détail doit être fait lot par lot.' },
      { q: 'Faut-il un contrat écrit avec chaque sous-traitant, même pour un petit lot ?', a: 'C’est fortement recommandé, quelle que soit la taille du lot. Un contrat écrit clarifie le périmètre, le prix, les délais et les responsabilités, et protège l’entreprise générale en cas de litige avec le sous-traitant ou de réclamation du client.' },
    ],
  },
  {
    path: 'blog/groupement-achat-artisans-batiment-suisse',
    title: 'Groupement d’achat entre artisans : une idée sous-exploitée | Cantia',
    description:
      'Le principe du groupement d’achat entre artisans indépendants du bâtiment, ses avantages au-delà du prix, et comment en démarrer un à petite échelle.',
    faq: [
      { q: 'Un groupement d’achat nécessite-t-il une structure juridique ?', a: 'Pas au démarrage. Une simple entente informelle entre deux ou trois entreprises suffit pour tester la pratique. Une structure plus formelle (association, coopérative) peut être envisagée si le groupement grandit.' },
      { q: 'Comment répartir la commande groupée entre les entreprises ?', a: 'Généralement au prorata des quantités commandées par chacune, avec une facturation séparée par le fournisseur à chaque entreprise, ou une redistribution interne selon ce qui a été convenu au départ.' },
      { q: 'Un groupement d’achat pose-t-il un problème de concurrence entre les membres ?', a: 'Uniquement si les membres sont en concurrence directe sur les mêmes chantiers. C’est pourquoi les groupements fonctionnent mieux entre métiers complémentaires ou zones géographiques distinctes.' },
    ],
  },
  {
    path: 'blog/leasing-machines-vehicules-chantier-suisse',
    title: 'Leasing ou achat pour les machines et véhicules de chantier | Cantia',
    description:
      'Avantages et inconvénients du leasing et de l’achat pour les machines et véhicules de chantier, et les critères concrets pour trancher selon la situation de l’entreprise.',
    faq: [
      { q: 'Le leasing est-il toujours plus cher que l’achat sur le long terme ?', a: 'En général oui, sur la durée totale de vie du matériel, mais pas systématiquement une fois pris en compte l’entretien, la revente et le risque de panne d’un matériel ancien. Le calcul dépend fortement de l’usage réel.' },
      { q: 'Peut-on mixer leasing et achat au sein d’une même flotte ?', a: 'Oui, c’est même une pratique courante : acheter le matériel utilisé quotidiennement et intensément, et louer en leasing ou à la demande le matériel utilisé ponctuellement ou pour des besoins spécifiques.' },
      { q: 'Le leasing a-t-il un impact sur la capacité d’emprunt de l’entreprise ?', a: 'Cela peut jouer, selon la structure du contrat et la façon dont il est comptabilisé, sur l’appréciation de l’endettement par une banque lors d’une demande de crédit ultérieure. Il vaut la peine d’en discuter avec son fiduciaire.' },
    ],
  },
  {
    path: 'blog/ligne-de-credit-tresorerie-pme-batiment',
    title: 'Ligne de crédit court terme : combler un creux de trésorerie sans paniquer | Cantia',
    description:
      'Différence entre une ligne de crédit et un prêt classique, quand y recourir sereinement pour un creux ponctuel, et quand ce recours révèle un problème de marge plus profond.',
    faq: [
      { q: 'Une ligne de crédit coûte-t-elle cher si elle n’est pas utilisée ?', a: 'En général, les intérêts ne sont dus que sur le montant réellement utilisé, mais certains contrats prévoient des frais fixes de mise à disposition. Il faut vérifier précisément les conditions avant de souscrire.' },
      { q: 'Comment savoir si le recours à une ligne de crédit est sain ou problématique ?', a: 'Un bon signe est un solde qui revient régulièrement à zéro ou proche de zéro entre deux utilisations. Un solde qui augmente en continu, sans jamais redescendre, indique généralement un problème de fond à traiter, pas seulement un besoin ponctuel de trésorerie.' },
      { q: 'Faut-il attendre d’être dans le rouge pour demander une ligne de crédit ?', a: 'Non, c’est même l’inverse : une ligne de crédit se négocie mieux et à de meilleures conditions quand l’entreprise est en bonne santé financière, avant qu’un besoin urgent n’apparaisse.' },
    ],
  },
  {
    path: 'blog/motiver-equipe-chantier-batiment-quotidien',
    title: 'Comment motiver une équipe de chantier au quotidien | Cantia',
    description:
      'La motivation d’une équipe de chantier ne se joue pas qu’au niveau du salaire. Reconnaissance, clarté des attentes et organisation du chantier pèsent souvent bien plus au quotidien.',
    faq: [
      { q: 'Le salaire est-il le principal levier de motivation sur un chantier ?', a: 'C’est un facteur important mais rarement suffisant à lui seul. La reconnaissance du travail, la clarté des attentes et l’organisation concrète du chantier influencent souvent autant l’engagement d’une équipe qu’un ajustement de rémunération.' },
      { q: 'Comment savoir si une équipe de chantier est démotivée ?', a: 'Des signes discrets précèdent souvent une baisse de motivation ouverte : moins d’initiative, des questions qui ne remontent plus, un rythme de travail qui ralentit sans explication apparente. Ces signaux méritent d’être pris au sérieux avant qu’ils ne s’installent.' },
      { q: 'Faut-il communiquer l’avancement du chantier à toute l’équipe ?', a: 'C’est fortement recommandé : une équipe qui comprend où en est le projet et pourquoi certaines décisions sont prises reste généralement plus engagée qu’une équipe qui exécute des tâches sans vision d’ensemble.' },
    ],
  },
  {
    path: 'blog/negocier-prix-fournisseur-materiaux-batiment',
    title: 'Comment négocier ses prix avec un fournisseur de matériaux | Cantia',
    description:
      'Les leviers concrets pour négocier de meilleurs prix avec un fournisseur de matériaux de construction, sans dégrader la relation ni la qualité de service.',
    faq: [
      { q: 'Faut-il toujours privilégier le fournisseur le moins cher ?', a: 'Pas nécessairement. Le prix affiché ne dit rien du délai de livraison, du service après-vente ou de la fiabilité des stocks. Un fournisseur légèrement plus cher mais fiable coûte souvent moins cher au final.' },
      { q: 'Comment aborder la négociation sans dégrader la relation ?', a: 'En présentant des chiffres concrets (volume annuel, régularité, délai de paiement) plutôt qu’en demandant simplement une remise. Un fournisseur négocie plus volontiers face à des arguments qu’face à une pression.' },
      { q: 'Une petite entreprise a-t-elle un vrai pouvoir de négociation ?', a: 'Oui, dans une mesure plus limitée. La régularité des commandes et la rapidité de paiement comptent souvent autant que le volume pour un fournisseur, surtout local.' },
    ],
  },
  {
    path: 'blog/norme-minergie-batiment-explication',
    title: 'Norme Minergie : ce qu’un artisan doit savoir | Cantia',
    description:
      'Minergie n’est pas une loi mais un label suisse de construction basse consommation. Voici ce que ça change concrètement pour un artisan qui exécute des travaux sur un bâtiment labellisé.',
    faq: [
      { q: 'Minergie est-il obligatoire en Suisse ?', a: 'Non, c’est un label privé et volontaire, pas une obligation légale. Certains cantons ou communes peuvent toutefois l’exiger ou le favoriser dans le cadre de certains projets, notamment pour bénéficier de conditions particulières.' },
      { q: 'Quelle différence entre Minergie et Minergie-ECO ?', a: 'Minergie de base porte sur la consommation d’énergie du bâtiment. Minergie-ECO ajoute des critères sur la santé des occupants et l’impact écologique des matériaux, en plus des exigences énergétiques du label standard.' },
      { q: 'Un artisan doit-il être certifié pour travailler sur un chantier Minergie ?', a: 'Pas systématiquement, mais une exécution soignée et conforme aux exigences du label est indispensable, car un contrôle final par un professionnel agréé est généralement requis avant la validation du label.' },
    ],
  },
  {
    path: 'blog/onboarding-nouvel-apprenti-premieres-semaines',
    title: 'Les premières semaines d’un apprenti : ce qui fait la différence | Cantia',
    description:
      'Au-delà du salaire et des obligations légales, les premières semaines d’un apprenti déterminent souvent s’il tiendra jusqu’au CFC. Voici comment structurer un vrai accueil sur le chantier.',
    faq: [
      { q: 'Pourquoi les premières semaines d’un apprenti sont-elles aussi importantes ?', a: 'C’est souvent durant cette période que se joue, implicitement, l’engagement réel de l’apprenti envers le métier. Un accueil structuré donne des repères qui rassurent, alors qu’un accueil négligé peut installer un désengagement difficile à corriger par la suite.' },
      { q: 'Faut-il désigner un référent officiel pour un apprenti ?', a: 'Ce n’est pas toujours une obligation formelle distincte du formateur responsable au sens légal, mais c’est une bonne pratique concrète : avoir une personne identifiée sur le terrain aide l’apprenti à savoir vers qui se tourner au quotidien.' },
      { q: 'Quelle différence entre cet accompagnement et les obligations légales de l’entreprise formatrice ?', a: 'Les obligations légales couvrent le salaire, l’autorisation de former et le suivi pédagogique formel avec l’école professionnelle. L’intégration au quotidien est complémentaire : elle porte sur l’accueil concret sur le chantier, au-delà de ce qu’exige strictement la réglementation.' },
    ],
  },
  {
    path: 'blog/prime-fin-annee-ou-13e-salaire-difference',
    title: 'Prime de fin d’année ou 13e salaire : quelle différence | Cantia',
    description:
      'Le 13e salaire est généralement une obligation fixe, la prime de fin d’année reste discrétionnaire. Confondre les deux peut créer un litige le jour où un employé la considère comme acquise.',
    faq: [
      { q: 'Un employeur est-il obligé de verser une prime de fin d’année ?', a: 'Non, contrairement au 13e salaire quand il est prévu par le contrat ou la CCT, une prime de fin d’année reste en principe discrétionnaire, sauf si l’entreprise l’a explicitement transformée en engagement contractuel.' },
      { q: 'Une prime versée plusieurs années de suite devient-elle obligatoire ?', a: 'Elle peut le devenir dans certaines situations si elle est versée de façon répétée et sans réserve explicite, ce qui peut créer une attente légitime chez l’employé. C’est pour cette raison qu’il vaut mieux formuler clairement son caractère discrétionnaire chaque année.' },
      { q: 'Comment calculer le 13e salaire d’un employé qui a travaillé une partie de l’année seulement ?', a: 'Le calcul suit en général un prorata basé sur la durée effective d’emploi durant l’année, selon les règles précises fixées par le contrat ou la convention collective applicable — un point traité en détail dans un article dédié au calcul du 13e salaire.' },
    ],
  },
  {
    path: 'blog/racheter-entreprise-batiment-existante-suisse',
    title: 'Racheter une entreprise du bâtiment existante : les points à vérifier | Cantia',
    description:
      'Les points essentiels à vérifier avant de racheter une entreprise du bâtiment existante en Suisse : finances, carnet de commandes, matériel et clientèle.',
    faq: [
      { q: 'Vaut-il mieux racheter les parts d’une société ou son fonds de commerce ?', a: 'Cela dépend du passif de l’entreprise. Racheter le fonds de commerce évite généralement d’hériter des dettes ou litiges de l’ancienne structure, mais peut être fiscalement moins avantageux selon les cas — à valider avec une fiduciaire.' },
      { q: 'Comment vérifier que le chiffre d’affaires annoncé est réel ?', a: 'En demandant les comptes des trois derniers exercices, idéalement révisés, et en les croisant avec les décomptes TVA et les relevés bancaires plutôt que de se fier au seul bilan présenté.' },
      { q: 'La clientèle reste-t-elle automatiquement après un rachat ?', a: 'Non, rien ne le garantit. Une partie de la clientèle peut être fidèle au patron sortant plus qu’à l’entreprise. C’est un risque à intégrer dans la valorisation du rachat.' },
    ],
  },
  {
    path: 'blog/reemploi-materiaux-economie-circulaire-batiment',
    title: 'Réemploi de matériaux : l’économie circulaire dans le bâtiment suisse | Cantia',
    description:
      'Récupérer et réutiliser des matériaux de démolition plutôt que les jeter : le réemploi progresse dans le bâtiment suisse. Voici comment ça fonctionne concrètement, et ses vraies limites.',
    faq: [
      { q: 'Le réemploi de matériaux est-il moins cher que des matériaux neufs ?', a: 'Pas systématiquement : le matériau lui-même coûte souvent moins cher, mais le temps de déconstruction soignée, de stockage et de contrôle avant réutilisation peut compenser une partie de l’économie. Tout dépend du type de matériau et de la logistique disponible.' },
      { q: 'Un matériau réemployé bénéficie-t-il d’une garantie ?', a: 'En général non, ou pas dans les mêmes conditions qu’un produit neuf, ce qui explique la prudence de certains professionnels. C’est un point à clarifier explicitement avec le client avant d’intégrer un matériau réemployé dans un chantier.' },
      { q: 'Où trouver des matériaux de réemploi pour un chantier en Suisse ?', a: 'Des réseaux et plateformes d’échange spécialisés se développent progressivement selon les régions, en plus des filières informelles entre professionnels. Se renseigner localement, souvent via des associations ou des acteurs régionaux de la construction durable, reste le point de départ le plus fiable.' },
    ],
  },
  {
    path: 'blog/renovation-apres-sinistre-degat-eau-assurance',
    title: 'Rénovation après sinistre : travailler avec l’assurance du client | Cantia',
    description:
      'Expertise préalable, documentation des dommages, délai de paiement : comment gérer un chantier de rénovation après dégât d’eau ou incendie quand l’assurance du client est impliquée.',
    faq: [
      { q: 'Faut-il attendre l’accord de l’assurance avant de commencer les travaux ?', a: 'Cela dépend de l’urgence et de l’ampleur du sinistre. Pour des mesures conservatoires urgentes, il est souvent possible d’intervenir immédiatement, mais pour des travaux de rénovation complets, mieux vaut généralement attendre la validation de l’assurance ou de son expert pour éviter un refus de remboursement.' },
      { q: 'Qui paie l’entreprise : le client ou directement l’assurance ?', a: 'Les deux cas existent. Certaines assurances remboursent le client après paiement de la facture, d’autres acceptent de régler directement l’entreprise sur présentation des documents. Ce point doit être clarifié avec le client avant le début du chantier.' },
      { q: 'Que faire si l’assurance conteste une partie du devis ?', a: 'Une documentation précise, avec photos datées et description détaillée des dommages, facilite grandement la discussion. En cas de désaccord persistant, le client peut généralement faire appel à un contre-expert, mais cela allonge encore le délai de règlement.' },
    ],
  },
  {
    path: 'blog/renovation-batiment-historique-protege-suisse',
    title: 'Rénover un bâtiment historique ou protégé : les contraintes à connaître | Cantia',
    description:
      'Autorisations plus lourdes, matériaux imposés, délais d’exécution allongés : ce qui change quand un chantier de rénovation touche un bâtiment historique ou protégé en Suisse.',
    faq: [
      { q: 'Comment savoir si un bâtiment est protégé ou classé ?', a: 'L’information figure généralement dans l’inventaire cantonal des biens culturels ou dans le plan d’affectation communal. En cas de doute, il vaut mieux se renseigner directement auprès du service cantonal des monuments historiques ou de la commune avant de chiffrer les travaux.' },
      { q: 'Le surcoût d’une rénovation patrimoniale peut-il être subventionné ?', a: 'Certains cantons et communes proposent des aides pour la restauration de bâtiments protégés, mais les conditions varient fortement. Il faut vérifier au cas par cas auprès de l’autorité cantonale compétente, généralement avant le début des travaux.' },
      { q: 'Peut-on refuser certaines exigences du service des monuments historiques ?', a: 'Les prescriptions liées à un bien protégé sont généralement contraignantes et peu négociables sur le fond, même si des discussions restent possibles sur des détails d’exécution. Mieux vaut les anticiper dès le chiffrage plutôt que de les découvrir en cours de chantier.' },
    ],
  },
  {
    path: 'blog/responsabilite-apres-livraison-travaux-assurance',
    title: 'Responsabilité civile après la livraison des travaux : ce qui change | Cantia',
    description:
      'La responsabilité civile professionnelle reste engagée après la fin d’un chantier. Pourquoi laisser sa police expirer trop tôt est risqué tant que des garanties de travaux courent encore.',
    faq: [
      { q: 'Combien de temps un entrepreneur reste-t-il responsable après la livraison ?', a: 'Cela dépend du délai de garantie applicable au contrat, qui peut s’étendre sur plusieurs années après la réception des travaux. Il est essentiel de vérifier ce délai dans le contrat signé avec le client, pas seulement dans la police d’assurance.' },
      { q: 'Que se passe-t-il si l’entreprise change d’assureur entre-temps ?', a: 'Cela dépend des clauses du contrat, notamment de l’existence d’une couverture subséquente pour les faits survenus avant le changement. Il faut le clarifier explicitement avec le nouvel assureur avant de résilier l’ancienne police.' },
      { q: 'Un artisan indépendant qui cesse son activité reste-t-il responsable ?', a: 'En principe oui, la responsabilité pour un défaut lié à des travaux déjà réalisés ne disparaît pas automatiquement avec la fin de l’activité. C’est pourquoi il vaut mieux anticiper la question de la couverture avant toute cessation.' },
    ],
  },
  {
    path: 'blog/rupture-stock-fournisseur-chantier-que-faire',
    title: 'Rupture de stock fournisseur en plein chantier : que faire | Cantia',
    description:
      'Comment réagir face à une rupture de stock fournisseur en plein chantier, anticiper le risque et protéger votre planning et votre relation client.',
    faq: [
      { q: 'Une rupture de stock fournisseur peut-elle justifier un dépassement de délai contractuel ?', a: 'Cela dépend des termes du contrat. Si le délai était formulé comme indicatif ou si une clause de force majeure ou d’imprévu est prévue, cela peut jouer en votre faveur ; sinon, la responsabilité peut rester engagée. Mieux vaut anticiper la formulation du contrat que de s’appuyer dessus après coup.' },
      { q: 'Faut-il prévenir le client immédiatement en cas de rupture de stock ?', a: 'Oui, dans l’idéal avec une solution ou un nouveau délai déjà envisagé. Un client informé tôt et avec une proposition concrète réagit presque toujours mieux qu’un client qui découvre le retard sur le chantier.' },
      { q: 'Comment choisir un fournisseur de secours pour un matériau critique ?', a: 'Idéalement un fournisseur déjà testé sur d’autres chantiers, avec un délai de livraison comparable, même si son prix est légèrement supérieur au fournisseur principal.' },
    ],
  },
  {
    path: 'blog/saisie-conservatoire-creance-impayee-batiment',
    title: 'Saisie conservatoire : un outil méconnu contre un client qui ne paie pas | Cantia',
    description:
      'Ce qu’est une saisie conservatoire (séquestre), quand l’utiliser face à un client qui ne paie pas, et en quoi elle diffère d’une poursuite ordinaire.',
    faq: [
      { q: 'Faut-il un avocat pour demander une saisie conservatoire ?', a: 'Ce n’est pas toujours obligatoire, mais fortement recommandé compte tenu de la complexité de la démarche et de l’urgence d’agir correctement. Consultez un avocat pour évaluer si votre situation justifie cette mesure.' },
      { q: 'La saisie conservatoire garantit-elle le recouvrement de la créance ?', a: 'Non, elle bloque des actifs identifiés mais ne garantit pas leur valeur suffisante ni l’issue finale de la procédure de recouvrement, qui suit généralement son cours par la suite selon les voies ordinaires.' },
      { q: 'Peut-on demander une saisie conservatoire pour n’importe quel montant impayé ?', a: 'En théorie oui, mais en pratique elle est réservée aux cas où le risque de perte est réel et le montant justifie la démarche, compte tenu de son coût et de sa complexité. Pour un petit montant sans risque particulier, la poursuite ordinaire reste plus adaptée.' },
    ],
  },
  {
    path: 'blog/succession-familiale-entreprise-artisanale-batiment',
    title: 'Succession familiale dans une entreprise artisanale du bâtiment | Cantia',
    description:
      'Comment préparer une succession familiale dans une entreprise artisanale du bâtiment, entre dimension affective et nécessité de formaliser par écrit.',
    faq: [
      { q: 'Un pacte successoral est-il obligatoire pour une succession familiale d’entreprise ?', a: 'Non, mais il est fortement recommandé dès qu’il y a plusieurs héritiers, car il permet de fixer les règles de transmission du vivant du patron et d’éviter des désaccords après son décès.' },
      { q: 'Comment traiter équitablement les enfants qui ne reprennent pas l’entreprise ?', a: 'Généralement par une compensation financière équivalente à leur part successorale, calculée sur la valeur réelle de l’entreprise. Consultez un notaire ou un avocat pour structurer cela selon votre situation précise.' },
      { q: 'Combien de temps faut-il pour préparer un enfant à reprendre l’entreprise ?', a: 'Il n’y a pas de règle fixe, mais une transition progressive sur plusieurs années, avec une prise de responsabilités croissante, donne généralement de bien meilleurs résultats qu’une reprise soudaine.' },
    ],
  },
  {
    path: 'blog/transmettre-entreprise-batiment-retraite',
    title: 'Transmettre son entreprise du bâtiment au moment de la retraite | Cantia',
    description:
      'Les options pour transmettre son entreprise du bâtiment à l’approche de la retraite, et pourquoi anticiper plusieurs années à l’avance change tout.',
    faq: [
      { q: 'Combien de temps avant la retraite faut-il commencer à préparer la transmission ?', a: 'Généralement plusieurs années, souvent trois à cinq, pour avoir le temps d’introduire un repreneur auprès de la clientèle et de structurer la transmission dans de bonnes conditions.' },
      { q: 'Comment estimer la valeur d’une entreprise artisanale du bâtiment ?', a: 'Plusieurs méthodes existent (valeur des actifs, capacité bénéficiaire, multiple du chiffre d’affaires selon le secteur). Un professionnel (fiduciaire, expert en transmission d’entreprise) est généralement nécessaire pour une évaluation fiable.' },
      { q: 'Que faire si aucun repreneur ne se présente ?', a: 'La cessation d’activité reste une option, avec la liquidation des actifs. Dans ce cas, anticiper permet au moins d’organiser la fin de l’activité et les obligations envers les employés et les chantiers en cours dans de bonnes conditions.' },
    ],
  },
  ...HELP_SEO_IT,
  ...BLOG_SEO_IT,
];

for (const route of ROUTES) {
  if (route.publishedAt) continue;
  const slug = route.path.startsWith('blog/') ? route.path.slice('blog/'.length) : null;
  if (slug && BLOG_DATES_FR[slug]) route.publishedAt = BLOG_DATES_FR[slug];
}

const LOCALE_PREFIXES = { de: 'de', it: 'it' };

export function localeAndBareOf(routePath) {
  for (const [locale, prefix] of Object.entries(LOCALE_PREFIXES)) {
    if (routePath === prefix) return { locale, bare: '' };
    if (routePath.startsWith(`${prefix}/`)) return { locale, bare: routePath.slice(prefix.length + 1) };
  }
  return { locale: 'fr', bare: routePath };
}

export function alternatePathFor(routePath, targetLocale) {
  const { bare } = localeAndBareOf(routePath);
  if (targetLocale === 'fr') return bare;
  const prefix = LOCALE_PREFIXES[targetLocale];
  return bare === '' ? prefix : `${prefix}/${bare}`;
}

function humanizeSegment(segment) {
  const words = segment.replace(/-/g, ' ');
  return words.charAt(0).toUpperCase() + words.slice(1);
}

function routeKind(routePath) {
  const { bare } = localeAndBareOf(routePath);
  if (bare === '' || bare === 'blog') return bare.startsWith('blog') ? 'blog-index' : 'product';
  if (bare.startsWith('blog/')) return 'article';
  if (bare.startsWith('solutions/')) return 'product';
  if (TRADE_SLUGS.has(bare) || bare === 'metiers') return 'page';
  return 'page';
}

const LOCALE_TAGS = { fr: 'fr-CH', de: 'de-CH', it: 'it-CH' };
const HOME_LABELS = { fr: 'Accueil', de: 'Startseite', it: 'Home' };

export function jsonLdFor(url, route) {
  const { path: routePath, title, description, faq, publishedAt } = route;
  const { locale: routeLocale } = localeAndBareOf(routePath);
  const locale = LOCALE_TAGS[routeLocale];
  const homeLabel = HOME_LABELS[routeLocale];
  const kind = routeKind(routePath);

  const graph = [
    {
      '@type': 'Organization',
      '@id': `${SITE}/#organization`,
      name: 'Cantia',
      url: `${SITE}/`,
      logo: ORG_LOGO,
      email: 'info@cantia.ch',
      areaServed: { '@type': 'Country', name: 'Switzerland' },
    },
  ];

  if (kind === 'product') {
    graph.push({
      '@type': 'SoftwareApplication',
      name: 'Cantia',
      operatingSystem: 'Android, iOS, Web',
      applicationCategory: 'BusinessApplication',
      description,
      url,
      image: OG_IMAGE,
      inLanguage: locale,
      publisher: { '@id': `${SITE}/#organization` },
      offers: { '@type': 'AggregateOffer', priceCurrency: 'CHF', lowPrice: '39', highPrice: '129', offerCount: '3' },
    });
  } else if (kind === 'article') {
    graph.push({
      '@type': 'Article',
      headline: title.replace(/\s*\|\s*Cantia$/, ''),
      description,
      url,
      image: OG_IMAGE,
      inLanguage: locale,
      ...(publishedAt ? { datePublished: publishedAt, dateModified: publishedAt } : {}),
      author: { '@id': `${SITE}/#organization` },
      publisher: { '@id': `${SITE}/#organization` },
      mainEntityOfPage: url,
    });
  } else {
    graph.push({
      '@type': 'WebPage',
      name: title.replace(/\s*\|\s*Cantia$/, ''),
      description,
      url,
      inLanguage: locale,
      isPartOf: { '@id': `${SITE}/#organization` },
    });
  }

  if (routePath === '' || routePath === 'de' || routePath === 'it') {
    graph.push({
      '@type': 'WebSite',
      '@id': `${SITE}/#website`,
      name: 'Cantia',
      url: `${SITE}/`,
      inLanguage: locale,
      publisher: { '@id': `${SITE}/#organization` },
    });
  } else {
    const { bare } = localeAndBareOf(routePath);
    const segments = bare.split('/').filter(Boolean);
    const homeUrl = routeLocale === 'fr' ? `${SITE}/` : `${SITE}/${LOCALE_PREFIXES[routeLocale]}`;
    const items = [{ '@type': 'ListItem', position: 1, name: homeLabel, item: homeUrl }];
    let acc = homeUrl.endsWith('/') ? homeUrl.slice(0, -1) : homeUrl;
    segments.forEach((seg, i) => {
      acc += `/${seg}`;
      items.push({ '@type': 'ListItem', position: i + 2, name: humanizeSegment(seg), item: acc });
    });
    graph.push({ '@type': 'BreadcrumbList', itemListElement: items });
  }
  if (faq?.length) {
    graph.push({
      '@type': 'FAQPage',
      mainEntity: faq.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: item.a },
      })),
    });
  }
  return { '@context': 'https://schema.org', '@graph': graph };
}
