// French — the app's default language. Grows one screen at a time as
// hardcoded JSX strings get converted to t() calls; not every screen is
// covered yet (see lib/translations/index.ts for how a missing key falls
// back to showing the key itself, so an unconverted screen never silently
// shows a blank).
export const fr = {
  common: {
    save: 'Enregistrer',
    saving: 'Enregistrement…',
    cancel: 'Annuler',
    language: 'Langue',
  },
  profil: {
    title: 'Mon profil',
    changePhoto: 'Touchez pour changer votre photo',
    uploading: 'Envoi en cours…',
    displayName: 'Nom affiché',
    displayNamePlaceholder: 'Votre nom',
    signatureTitle: 'Ma signature',
    signatureHint: "Utilisée sur les devis que vous créez (à côté de l'emplacement pour la signature du client) et sur vos rapports de chantier.",
    draw: 'Dessiner',
    importPhoto: 'Importer une photo',
    saveSignature: 'Enregistrer cette signature',
    currentSignature: 'Signature actuelle :',
    signaturePhotoHint: 'Pour un rendu propre, prenez en photo ou scannez votre signature sur une feuille blanche, bien cadrée, sans ombre.',
    changeSignature: 'Touchez pour changer votre signature',
    addSignature: 'Touchez pour ajouter votre signature',
    languageTitle: 'Langue',
    languageHint: "La langue de l'application, pour vous seul — n'affecte pas vos collègues.",
    languageFrench: 'Français',
    languageGerman: 'Allemand',
  },
};

export type TranslationDict = typeof fr;
