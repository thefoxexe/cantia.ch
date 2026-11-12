import path from 'path';
import { ROOT } from './slides.mjs';

const ASSET = (f) => path.join(ROOT, 'marketing', 'videos', 'assets', f);

// Onboarding wizard, step 1 (shown again on each new visit), filled without filming.
async function fillSetupStep1(page) {
  await page.getByPlaceholder("Rue de l'Exemple 1").fill('Rue des Artisans 12');
  await page.getByPlaceholder('1000', { exact: true }).fill('1400');
  await page.waitForTimeout(800);
  if (!(await page.getByPlaceholder('Lausanne').inputValue())) await page.getByPlaceholder('Lausanne').fill('Yverdon-les-Bains');
  await page.getByPlaceholder('022 000 00 00').fill('024 000 12 34');
  await page.getByPlaceholder('contact@entreprise.ch').fill('info@cantia.ch');
  await page.getByText('Oui', { exact: true }).first().click();
  await page.waitForTimeout(500);
  const tva = page.getByPlaceholder(/CHE/);
  if (await tva.count()) await tva.first().fill('CHE-123.456.789');
  await page.getByPlaceholder('CH93 0076 2011 6238 5295 7').fill('CH93 0076 2011 6238 5295 7');
  await page.getByText('Continuer', { exact: true }).click();
  await page.waitForTimeout(3000);
}

// What each tutorial does in the app, step by step. A part starts on its
// page, already logged in; h.step() shows a caption from that moment on.
// `dry` stops before anything that cannot be undone (used to rehearse).
export const FLOWS = {
  1: {
    parts: [
      {
        name: 'a',
        start: '/onboarding',
        async run(h, page, { dry }) {
          await h.step('Choisissez « Créer une entreprise »', 'Si votre équipe utilise déjà Cantia, choisissez « Rejoindre une entreprise ».');
          await h.hover('Rejoindre une entreprise', 900);
          await h.click('Créer une entreprise', 1500);
          await h.step('Écrivez le nom de votre entreprise', 'Tel qu’il apparaîtra sur vos devis et factures.');
          await h.type(page.getByPlaceholder('Ex : Dupont Sàrl'), 'Atelier Martin SA');
          await h.step('Choisissez votre secteur et vos métiers', 'Plusieurs métiers possibles.');
          await h.click('Choisir un secteur', 1000);
          await h.click('Construction & bâtiment', 1200);
          await h.click('Menuiserie', 500);
          await h.click('Cuisines / agencement', 900);
          await h.scroll(420);
          await h.step('Chantiers, projets ou mandats ?', 'Le mot utilisé partout dans Cantia. Modifiable ensuite.');
          await h.hover(page.getByText('Chantiers', { exact: true }).first(), 1200);
          await h.click('Autre', 900);
          if (dry) return;
          await h.click('Continuer', 3500);
        },
      },
      {
        name: 'b',
        start: '/choose-plan',
        async run(h, page) {
          await h.step('Choisissez votre formule', 'Essentiel, Équipe ou Entreprise, au mois ou à l’année.');
          await h.hover('Facturation annuelle', 1200);
          await h.hover(page.getByText('Essentiel', { exact: true }).first(), 900);
          await h.hover(page.getByText('Équipe', { exact: true }).first(), 900);
          await h.hover(page.getByText('Entreprise', { exact: true }).first(), 1200);
          await h.step('Essayez 14 jours, sans engagement', 'La carte est demandée, puis débitée seulement après l’essai.');
          await h.hover('Choisir Entreprise', 2500);
        },
      },
      {
        name: 'c',
        start: '/onboarding/setup',
        async run(h, page, { dry }) {
          await h.step('Ajoutez votre logo', 'Il apparaît sur vos devis, factures et rapports.');
          await h.upload('Choisir un logo', ASSET('atelier-martin-logo.png'));
          await h.step('Choisissez la couleur de votre marque', 'Prête à l’emploi, tirée de votre site ou sur mesure.');
          await h.hover('Couleurs prêtes', 700);
          await h.hover('Sur mesure', 700);
          await h.scroll(520);
          await h.hover(page.getByText('APERÇU SUR VOS DOCUMENTS').first(), 1500);
          await h.scroll(480);
          await h.step('Indiquez votre adresse et vos contacts', 'Ils figurent sur chaque document.');
          await h.type(page.getByPlaceholder("Rue de l'Exemple 1"), 'Rue des Artisans 12');
          await h.type(page.getByPlaceholder('1000', { exact: true }), '1400', { pause: 1200 });
          // The locality fills itself from the NPA.
          if (!(await page.getByPlaceholder('Lausanne').inputValue())) await h.type(page.getByPlaceholder('Lausanne'), 'Yverdon-les-Bains');
          else await h.hover(page.getByPlaceholder('Lausanne'), 800);
          await h.type(page.getByPlaceholder('022 000 00 00'), '024 000 12 34');
          await h.type(page.getByPlaceholder('contact@entreprise.ch'), 'info@cantia.ch');
          await h.step('TVA et IBAN', 'L’IBAN sert à créer vos QR-factures.');
          await h.click(page.getByText('Oui', { exact: true }).first(), 1000);
          const tva = page.getByPlaceholder(/CHE/);
          if (await tva.count()) await h.type(tva.first(), 'CHE-123.456.789');
          await h.scroll(400);
          await h.type(page.getByPlaceholder('CH93 0076 2011 6238 5295 7'), 'CH93 0076 2011 6238 5295 7');
          if (dry) return;
          await h.click('Continuer', 3000);
        },
      },
      {
        name: 'd',
        start: '/onboarding/setup',
        // Step 1 of the wizard is shown again on a new visit: filled quickly, not filmed.
        prepare: fillSetupStep1,
        async run(h, page, { dry }) {
          await h.step('Choisissez les outils à activer', 'Ils apparaissent dans votre menu. Modifiable à tout moment.');
          await h.click('RH & Salaires', 500);
          await h.click('Trésorerie', 500);
          await h.click('Comptabilité', 700);
          await h.scroll(560);
          await h.step('Et les outils de vos chantiers', 'Ce que chaque nouveau chantier aura d’office.');
          await h.click('Remplir une soumission (bêta)', 500);
          await h.click('Planning de chantier', 500);
          await h.click('Sous-traitants', 500);
          await h.click('Rentabilité', 900);
          if (dry) return;
          await h.click('Continuer', 3500);
        },
      },
      {
        name: 'e',
        start: '/onboarding/setup',
        async prepare(page) {
          await fillSetupStep1(page);
          // The tools chosen in part d are back to the defaults on a new visit.
          for (const t of ['RH & Salaires', 'Trésorerie', 'Comptabilité', 'Remplir une soumission (bêta)', 'Planning de chantier', 'Sous-traitants', 'Rentabilité']) {
            await page.getByText(t, { exact: true }).first().click();
            await page.waitForTimeout(250);
          }
          await page.getByText('Continuer', { exact: true }).click();
          await page.waitForTimeout(3000);
        },
        async run(h, page) {
          await h.step('Vérifiez, puis terminez', 'Tout reste modifiable dans les paramètres.');
          await h.hover(page.getByText('Atelier Martin SA', { exact: true }).first(), 1200);
          await h.hover(page.getByText('OUTILS ACTIVÉS').first(), 1200);
          await h.click('Terminer et accéder à Cantia', 5000);
          await h.step('Votre espace Cantia est prêt', 'Chantiers, devis, planning et tâches, dès l’accueil.');
          await h.moveTo(900, 420);
          await h.wait(2500);
        },
      },
    ],
  },
};
