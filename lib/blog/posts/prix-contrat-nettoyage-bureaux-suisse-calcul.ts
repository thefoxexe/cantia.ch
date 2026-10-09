import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'prix-contrat-nettoyage-bureaux-suisse-calcul',
  question: 'Comment calculer le prix d’un contrat de nettoyage de bureaux en Suisse ?',
  title: 'Calculer le prix d’un contrat de nettoyage de bureaux : la méthode',
  description:
    'Surface, fréquence, cadence, coût horaire complet, produits et marge : la méthode pour chiffrer un contrat d’entretien de bureaux en Suisse sans travailler à perte.',
  excerpt:
    'Un contrat d’entretien se joue sur quelques minutes par passage. Mal estimées, elles transforment un bon client en contrat déficitaire pendant des années.',
  category: 'Services & autres métiers',
  keywords: ['prix nettoyage bureaux Suisse', 'calcul contrat entretien', 'devis nettoyage', 'tarif nettoyage au m2', 'entreprise de nettoyage devis'],
  publishedAt: '2026-10-09',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Un contrat de nettoyage de bureaux se signe souvent pour plusieurs années. Une erreur de dix minutes par passage, répétée deux fois par semaine, finit par coûter plus cher qu’un mauvais chantier ponctuel. Le prix se construit en quatre étapes.',
    },
    { type: 'h2', text: '1. Traduire la surface en heures' },
    {
      type: 'p',
      text: 'Partez de la visite : surface par type de local (bureaux, sanitaires, cuisine, circulations), taux d’occupation et exigences du client. Appliquez ensuite votre cadence réelle, mesurée sur vos propres équipes, en m² par heure et par type de local. Les sanitaires et les cuisines prennent nettement plus de temps au m² que des bureaux ouverts.',
    },
    {
      type: 'list',
      items: [
        'Heures par passage = somme des surfaces ÷ cadence de chaque type de local',
        'Heures par mois = heures par passage × nombre de passages par semaine × 4,33',
        'Ajoutez les déplacements entre sites si l’équipe enchaîne plusieurs clients',
      ],
    },
    { type: 'h2', text: '2. Connaître son coût horaire complet' },
    {
      type: 'p',
      text: 'Le coût d’une heure n’est pas le salaire horaire : il faut y ajouter les charges sociales de l’employeur (AVS/AI/APG, AC, LAA, LPP selon les cas), les vacances, les jours fériés, le 13e salaire s’il est dû, les absences et le temps non productif. Vérifiez aussi les salaires minimaux de la convention collective qui s’applique à votre région.',
    },
    {
      type: 'callout',
      title: 'Le piège du salaire horaire',
      text: 'Facturer « deux fois le salaire » ne suffit pas toujours. Calculez une fois votre coût réel par heure productive et mettez-le à jour chaque année.',
    },
    { type: 'h2', text: '3. Ajouter produits, matériel et frais généraux' },
    {
      type: 'p',
      text: 'Produits, consommables sanitaires fournis au client, usure des machines, véhicules, assurances, administration : répartissez ces coûts sur les heures facturées ou ajoutez-les comme ligne séparée au devis (par exemple « mise à disposition des consommables, par mois »).',
    },
    { type: 'h2', text: '4. Fixer la marge et présenter le prix' },
    {
      type: 'table',
      headers: ['Ligne du devis', 'Unité', 'Exemple'],
      rows: [
        ['Entretien régulier', 'mois', '2 passages par semaine'],
        ['Vitres', 'passage', '4 fois par an'],
        ['Shampooing moquettes', 'passage', '2 fois par an'],
        ['Consommables sanitaires', 'mois', 'selon occupation'],
      ],
    },
    {
      type: 'p',
      text: 'Séparer l’entretien régulier des prestations périodiques rend le devis lisible pour le client et vous permet d’ajuster une ligne sans renégocier tout le contrat. Précisez aussi la durée, le délai de résiliation et ce qui n’est pas compris.',
    },
    { type: 'h2', text: 'Suivre les heures réelles, client par client' },
    {
      type: 'p',
      text: 'Le calcul initial n’est qu’une hypothèse. Comparez chaque mois les heures réellement passées chez le client à celles prévues : c’est le seul moyen de repérer un contrat qui dérive avant qu’il ne coûte une année de marge.',
    },
    {
      type: 'cta',
      title: 'Devis d’entretien, heures par client et factures QR',
      text: 'Cantia reprend vos prestations en catalogue, compare les heures réelles au contrat et prépare la facture chaque mois. Essai gratuit de 14 jours.',
      buttonLabel: 'Essayer 14 jours',
    },
  ],
  faq: [
    {
      question: 'Faut-il facturer le nettoyage au m² ou à l’heure ?',
      answer: 'Les deux existent. Le prix au mois ou au passage, calculé à partir de la surface et de votre cadence, est le plus lisible pour un client régulier ; l’heure convient mieux aux interventions ponctuelles.',
    },
    {
      question: 'Que mettre dans un contrat d’entretien ?',
      answer: 'Les locaux concernés, la fréquence, les prestations comprises et exclues, le prix, la durée, le délai de résiliation et la façon dont les prestations supplémentaires sont facturées.',
    },
    {
      question: 'Comment savoir si un contrat est rentable ?',
      answer: 'En comparant chaque mois les heures réellement passées chez le client à celles prévues dans le calcul du prix.',
    },
  ],
  relatedSlugs: ['facturer-petites-interventions-gerance-conciergerie', 'relancer-client-facture-impayee-sans-perdre-client', 'qr-facture-obligatoire-2026'],
  relatedTradeSlug: 'entreprise-nettoyage',
};
