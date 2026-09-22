import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'declaration-tva-trimestrielle-artisan-suisse',
  question: 'Comment remplir sa déclaration TVA trimestrielle en tant qu’artisan en Suisse ?',
  title: 'Comment remplir sa déclaration TVA trimestrielle quand on est artisan',
  description:
    'Qui doit déclarer la TVA chaque trimestre, quelles données réunir avant de se connecter au portail AFC, et les erreurs les plus fréquentes chez les artisans indépendants.',
  excerpt:
    'Le trimestre se termine, et il faut boucler le décompte TVA avant l’échéance. Voici ce qu’il faut avoir sous la main et les pièges qui font perdre de l’argent chaque année.',
  category: 'Juridique & normes',
  keywords: [
    'déclaration tva trimestrielle artisan',
    'comment remplir décompte tva suisse',
    'tva artisan indépendant suisse',
    'portail afc tva en ligne',
    'impôt préalable déductible bâtiment',
  ],
  publishedAt: '2026-09-21',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'Dès que le chiffre d’affaires annuel dépasse CHF 100’000, l’assujettissement à la TVA devient obligatoire, et pour la grande majorité des entreprises du bâtiment assujetties selon la méthode effective, le rythme de déclaration est trimestriel. C’est un rendez-vous administratif qui revient quatre fois par an, et qui se prépare bien plus facilement si les bons documents sont classés au fur et à mesure plutôt que reconstitués la veille de l’échéance.',
    },
    { type: 'h2', text: 'Qui est concerné par le décompte trimestriel' },
    {
      type: 'p',
      text: 'Le décompte trimestriel est le rythme par défaut pour les entreprises assujetties selon la méthode effective, c’est-à-dire celles qui calculent précisément la TVA due sur leur chiffre d’affaires et déduisent l’impôt préalable réellement payé sur leurs achats et leurs investissements. Les entreprises qui optent pour le taux de la dette fiscale nette (TDFN) déclarent en principe deux fois par an, un rythme différent avec ses propres règles. Le choix entre les deux méthodes se fait auprès de l’Administration fédérale des contributions (AFC) et engage l’entreprise pour une durée minimale, donc il vaut mieux y réfléchir avant de s’enregistrer.',
    },
    { type: 'h2', text: 'Ce qu’il faut réunir avant de se connecter au portail' },
    {
      type: 'list',
      items: [
        'Le chiffre d’affaires du trimestre, encaissé ou facturé selon la méthode de décompte choisie (contre-prestations reçues ou contre-prestations convenues) — les deux existent et ne se mélangent pas en cours d’exercice.',
        'Le détail des factures émises avec leur taux de TVA respectif, car un chantier peut mélanger travaux au taux normal et éléments soumis à un taux réduit selon la nature de la prestation.',
        'Toutes les factures fournisseurs et sous-traitants du trimestre, pour calculer l’impôt préalable déductible — matériel, location d’engins, carburant professionnel, sous-traitance.',
        'Les factures d’investissement (véhicule utilitaire, machine, outillage lourd), dont la TVA est également récupérable si le bien est affecté à l’activité professionnelle.',
      ],
    },
    { type: 'h2', text: 'Les erreurs qui reviennent le plus souvent chez les artisans' },
    {
      type: 'p',
      text: 'La plus fréquente est d’oublier de récupérer l’impôt préalable sur les achats de matériel, par manque de temps pour trier les factures ou parce qu’un justificatif est resté dans la camionnette. La seconde est d’appliquer le mauvais taux de TVA sur une prestation, notamment sur des travaux qui touchent à la fois de la construction neuve et de la rénovation dans un même devis. La troisième, plus rare mais plus coûteuse, est de rater l’échéance de dépôt : le décompte doit généralement être transmis dans les 60 jours suivant la fin du trimestre, et un retard entraîne un intérêt moratoire même si le montant dû est finalement correct.',
    },
    {
      type: 'callout',
      title: 'Encaissé ou facturé : un choix qui ne se change pas à la légère',
      text: 'La méthode de décompte (contre-prestations reçues ou convenues) doit rester cohérente d’un trimestre à l’autre. La changer en cours d’exercice sans en informer l’AFC crée des écarts difficiles à justifier en cas de contrôle. En cas de doute, mieux vaut consulter sa fiduciaire avant de trancher, pas après.',
    },
    {
      type: 'cta',
      title: 'Le trimestre TVA, sans reconstituer les factures à la dernière minute',
      text: 'Avec Cantia, chaque facture émise et chaque devis sont déjà classés par chantier et par taux de TVA appliqué. Au moment de boucler le décompte, l’essentiel du travail de tri est déjà fait.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Que se passe-t-il si le décompte TVA est déposé en retard ?',
      answer:
        'Un intérêt moratoire est généralement appliqué sur le montant dû, même si le décompte est correct. Il vaut mieux déposer un décompte estimé dans les temps et le corriger ensuite que de déposer un décompte exact en retard.',
    },
    {
      question: 'Peut-on récupérer la TVA sur l’achat d’un véhicule utilitaire ?',
      answer:
        'Oui, dans la mesure où le véhicule est affecté à l’activité professionnelle. La part d’usage privé, si elle existe, doit en revanche être exclue de la déduction ou compensée ensuite.',
    },
    {
      question: 'Faut-il déclarer la TVA même si le chiffre d’affaires du trimestre est nul ?',
      answer:
        'Oui, une entreprise assujettie doit en principe déposer un décompte à chaque échéance, même vide, tant qu’elle reste inscrite au registre TVA. Ne pas le faire peut entraîner une taxation d’office par l’AFC.',
    },
  ],
  relatedSlugs: [
    'mentions-obligatoires-facture-suisse-tva',
    'qr-facture-obligatoire-2026',
    'tva-methode-effective-ou-tdfn-batiment',
    'delai-declaration-tva-suisse-calendrier',
  ],
};
