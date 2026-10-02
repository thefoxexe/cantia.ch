import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'calcul-lpp-employe-taux-salaire-coordonne-2026',
  question: 'Comment calculer la cotisation LPP d’un employé en 2026 ?',
  title: 'Calcul LPP 2026 : taux par âge, salaire coordonné et exemples chiffrés',
  description:
    'Seuil d’entrée, déduction de coordination, taux de 7 à 18 % selon l’âge, part employeur et plans dès 18 ans : le calcul de la LPP expliqué pas à pas avec exemples 2026.',
  excerpt:
    'Combien prélever pour le 2e pilier sur la fiche de salaire ? Les montants 2026, la formule complète, quatre exemples chiffrés et les cas où votre caisse fait mieux que la loi.',
  category: 'RH & salaires',
  keywords: [
    'calcul lpp',
    'taux lpp 2026',
    'salaire coordonné lpp',
    'déduction de coordination 2026',
    'bonification de vieillesse lpp',
    'cotisation lpp employeur employé',
    'lpp dès 18 ans',
    'deuxième pilier fiche de salaire',
  ],
  publishedAt: '2026-10-02',
  readMinutes: 8,
  blocks: [
    {
      type: 'p',
      text: 'La LPP (loi sur la prévoyance professionnelle) est le 2e pilier : chaque mois, une partie du salaire est versée à une caisse de pension pour constituer la retraite de l’employé et le couvrir en cas de décès ou d’invalidité. L’employeur et l’employé cotisent ensemble, et l’employeur paie toujours au moins la moitié. Le calcul tient en quatre étapes : vérifier si l’employé est assujetti, déterminer son salaire coordonné, appliquer le taux correspondant à son âge, puis répartir entre employeur et employé.',
    },
    { type: 'h2', text: 'Les montants LPP en vigueur en 2026' },
    {
      type: 'p',
      text: 'Les montants limites sont fixés par le Conseil fédéral et adaptés en principe tous les deux ans, en même temps que les rentes AVS. Ceux de 2025 restent valables en 2026.',
    },
    {
      type: 'table',
      headers: ['Montant', 'Par année', 'Par mois'],
      rows: [
        ['Seuil d’entrée (salaire minimum pour être assuré)', 'CHF 22’680', 'CHF 1’890'],
        ['Déduction de coordination', 'CHF 26’460', 'CHF 2’205'],
        ['Salaire coordonné minimum', 'CHF 3’780', 'CHF 315'],
        ['Salaire annuel maximal pris en compte', 'CHF 90’720', 'CHF 7’560'],
        ['Salaire coordonné maximal (90’720 − 26’460)', 'CHF 64’260', 'CHF 5’355'],
      ],
    },
    { type: 'h2', text: 'Étape 1 : l’employé est-il assujetti ?' },
    {
      type: 'list',
      items: [
        'Salaire annuel inférieur à CHF 22’680 : pas d’affiliation obligatoire, rien n’est prélevé (art. 2 et 7 LPP).',
        'Moins de 18 ans : jamais de LPP obligatoire.',
        'De 18 à 24 ans (dès le 1er janvier qui suit le 17e anniversaire) : la loi impose seulement l’assurance des risques décès et invalidité, sans épargne pour la retraite. Le coût dépend du règlement de la caisse.',
        'Dès 25 ans (dès le 1er janvier qui suit le 24e anniversaire) et jusqu’à l’âge de référence : épargne obligatoire, avec les bonifications de vieillesse ci-dessous.',
      ],
    },
    { type: 'h2', text: 'Étape 2 : le salaire coordonné' },
    {
      type: 'p',
      text: 'On ne cotise pas sur tout le salaire. Une partie est déjà couverte par l’AVS, d’où la déduction de coordination (art. 8 LPP). La formule : salaire annuel (plafonné à CHF 90’720) moins CHF 26’460, avec un minimum de CHF 3’780. C’est ce montant, divisé par 12, qui sert de base mensuelle.',
    },
    {
      type: 'callout',
      title: 'Pourquoi un petit salaire cotise sur CHF 3’780',
      text: 'Un employé à CHF 24’000 par an dépasse le seuil d’entrée, mais 24’000 − 26’460 donne un montant négatif. La loi garantit alors un salaire coordonné minimum de CHF 3’780 : il cotise sur cette base, soit CHF 315 par mois.',
    },
    { type: 'h2', text: 'Étape 3 : le taux selon l’âge (bonifications de vieillesse)' },
    {
      type: 'p',
      text: 'Le taux minimum légal dépend de l’âge de l’employé (art. 16 LPP). L’âge se calcule simplement : année en cours moins année de naissance.',
    },
    {
      type: 'table',
      headers: ['Âge', 'Taux total minimum', 'Part employé (50 %)', 'Part employeur (50 %)'],
      rows: [
        ['18 à 24 ans', 'Risque seulement (selon la caisse)', '—', '—'],
        ['25 à 34 ans', '7 %', '3,5 %', '3,5 %'],
        ['35 à 44 ans', '10 %', '5 %', '5 %'],
        ['45 à 54 ans', '15 %', '7,5 %', '7,5 %'],
        ['55 ans à l’âge de référence', '18 %', '9 %', '9 %'],
      ],
    },
    { type: 'h2', text: 'Étape 4 : la répartition employeur / employé' },
    {
      type: 'p',
      text: 'L’employeur doit payer au moins autant que l’ensemble de ses employés (art. 66 LPP). Beaucoup de plans prévoient davantage, par exemple 60 % employeur et 40 % employé. Le règlement de la caisse fait foi : c’est lui qu’il faut reprendre sur la fiche de salaire.',
    },
    { type: 'h2', text: 'Quatre exemples chiffrés (minimum légal 2026)' },
    {
      type: 'table',
      headers: ['Cas', 'Salaire coordonné / mois', 'Taux', 'Total / mois', 'Employé / mois'],
      rows: [
        ['30 ans, CHF 5’000 / mois', 'CHF 2’795', '7 %', 'CHF 195.65', 'CHF 97.85'],
        ['48 ans, CHF 7’500 / mois', 'CHF 5’295', '15 %', 'CHF 794.25', 'CHF 397.15'],
        ['30 ans, CHF 2’000 / mois', 'CHF 315 (minimum)', '7 %', 'CHF 22.05', 'CHF 11.05'],
        ['58 ans, CHF 9’000 / mois', 'CHF 5’355 (maximum)', '18 %', 'CHF 963.90', 'CHF 481.95'],
      ],
    },
    {
      type: 'p',
      text: 'Détail du premier cas : CHF 5’000 × 12 = CHF 60’000 par an. Salaire coordonné : 60’000 − 26’460 = CHF 33’540, soit CHF 2’795 par mois. Cotisation : 7 % de 2’795 = CHF 195.65 par mois, dont CHF 97.85 retenus sur le salaire (arrondi aux 5 centimes) et le solde payé par l’employeur.',
    },
    { type: 'h2', text: 'Quand votre caisse fait mieux que la loi' },
    {
      type: 'p',
      text: 'Les taux ci-dessus sont des minimums. De nombreuses caisses proposent des plans « surobligatoires » : taux plus élevés, assurance (et parfois épargne) dès 18 ans, part employeur supérieure à 50 %, ou salaire assuré sans déduction de coordination. Dans ce cas, ce sont les taux du règlement de la caisse qui s’appliquent, pas le minimum légal.',
    },
    {
      type: 'callout',
      title: 'Exemple : un plan qui assure dès 18 ans',
      text: 'Employé de 22 ans à CHF 4’200 par mois, caisse à 4 % dès 18 ans, employeur 60 %. Salaire coordonné : 50’400 − 26’460 = CHF 23’940 par an, soit CHF 1’995 par mois. Cotisation : 4 % = CHF 79.80 par mois, dont environ CHF 31.90 pour l’employé et CHF 47.90 pour l’employeur. Selon la loi seule, rien n’aurait été prélevé pour l’épargne avant 25 ans.',
    },
    { type: 'h2', text: 'Comment Cantia calcule la LPP sur la fiche de salaire' },
    {
      type: 'list',
      ordered: true,
      items: [
        'À la création de l’employé, vous indiquez sa date de naissance et son salaire. Cantia déduit l’âge, vérifie le seuil d’entrée et calcule le salaire coordonné avec les montants de l’année.',
        'Par défaut, le minimum légal s’applique : rien avant 25 ans, puis 7 / 10 / 15 / 18 % selon l’âge, réparti moitié-moitié.',
        'Si votre caisse a ses propres taux, ouvrez « Ajuster les taux (avancé) » sur la fiche de l’employé : taux total de la caisse dès 25 ans, taux de la caisse de 18 à 24 ans, et part payée par l’employeur (50 % minimum, une valeur plus basse est automatiquement remontée à 50 %).',
        'La case « Assuré·e à la LPP » permet de l’exclure (par exemple un salaire sous le seuil ou un cas particulier).',
        'L’écran de l’employé affiche le détail, par exemple « LPP 7 % à 30 ans : 3,5 % + 3,5 % », et chaque fiche de salaire reprend exactement ces montants, arrondis aux 5 centimes.',
      ],
    },
    {
      type: 'callout',
      title: 'Faites le calcul pour votre employé',
      text: 'Le calculateur gratuit sur cantia.ch/calculateur-salaire applique exactement ces règles : âge, seuil d’entrée, plan de votre caisse dès 18 ans, part employeur, et donne aussi l’AVS, le chômage, l’assurance accidents, les allocations familiales et l’impôt à la source.',
    },
    {
      type: 'cta',
      title: 'Des fiches de salaire suisses, calculées pour vous',
      text: 'AVS, AC, LPP par âge, accidents, allocations familiales et impôt à la source selon les barèmes officiels : Cantia applique les bons taux et vous indique ce qui manque avant la première fiche.',
      buttonLabel: 'Essayer 14 jours',
    },
  ],
  faq: [
    {
      question: 'À partir de quel salaire faut-il cotiser à la LPP en 2026 ?',
      answer:
        'Dès un salaire annuel de CHF 22’680 (CHF 1’890 par mois) chez le même employeur. En dessous, l’affiliation n’est pas obligatoire.',
    },
    {
      question: 'Quel est le taux LPP minimum pour un employé de 30 ans ?',
      answer:
        '7 % du salaire coordonné au total, en général 3,5 % retenus sur le salaire et 3,5 % payés par l’employeur. La caisse peut prévoir davantage.',
    },
    {
      question: 'Un employé de moins de 25 ans cotise-t-il à la LPP ?',
      answer:
        'La loi n’impose pas d’épargne avant 25 ans, seulement l’assurance des risques décès et invalidité dès 18 ans. Beaucoup de caisses prélèvent donc une petite cotisation dès 18 ans : c’est leur règlement qui fixe le taux.',
    },
    {
      question: 'L’employeur peut-il payer moins de la moitié de la LPP ?',
      answer:
        'Non. L’employeur doit verser au moins la moitié des cotisations de ses employés (art. 66 LPP). Il peut en revanche payer plus, selon le règlement de la caisse.',
    },
    {
      question: 'Que faire si le salaire dépasse CHF 90’720 par an ?',
      answer:
        'Pour le minimum légal, le salaire coordonné est plafonné à CHF 64’260 par an. Au-delà, seule une caisse avec un plan surobligatoire assure la part de salaire supplémentaire.',
    },
  ],
  relatedSlugs: [
    'seuil-lpp-affiliation-employe-batiment',
    'lire-fiche-de-salaire-batiment',
    'lpp-deuxieme-pilier-independant-batiment',
  ],
};
