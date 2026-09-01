import type { TranslationDict } from './fr';

// German — Sie-form throughout (standard business register), Swiss
// spelling (ss, not ß). Keys must mirror fr.ts exactly; TranslationDict
// enforces that at compile time so a missing key is a type error, not a
// silent runtime fallback.
export const de: TranslationDict = {
  common: {
    save: 'Speichern',
    saving: 'Wird gespeichert…',
    cancel: 'Abbrechen',
    language: 'Sprache',
  },
  profil: {
    title: 'Mein Profil',
    changePhoto: 'Tippen, um Ihr Foto zu ändern',
    uploading: 'Wird hochgeladen…',
    displayName: 'Angezeigter Name',
    displayNamePlaceholder: 'Ihr Name',
    signatureTitle: 'Meine Unterschrift',
    signatureHint: 'Wird auf Ihren Offerten (neben dem Unterschriftsfeld für den Kunden) und auf Ihren Baustellenrapporten verwendet.',
    draw: 'Zeichnen',
    importPhoto: 'Foto importieren',
    saveSignature: 'Diese Unterschrift speichern',
    currentSignature: 'Aktuelle Unterschrift:',
    signaturePhotoHint: 'Für ein sauberes Ergebnis fotografieren oder scannen Sie Ihre Unterschrift auf einem weissen Blatt, gut ausgerichtet, ohne Schatten.',
    changeSignature: 'Tippen, um Ihre Unterschrift zu ändern',
    addSignature: 'Tippen, um Ihre Unterschrift hinzuzufügen',
    languageTitle: 'Sprache',
    languageHint: 'Die Sprache der App, nur für Sie persönlich — betrifft Ihre Kolleginnen und Kollegen nicht.',
    languageFrench: 'Französisch',
    languageGerman: 'Deutsch',
  },
};
