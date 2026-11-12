// Screens of the tutorial videos (marketing/videos), taken from the demo
// (EXPO_PUBLIC_DEMO=1, fictional company « Atelier Martin SA »), in French.
//
//   EXPO_PUBLIC_DEMO=1 CI=1 BROWSER=none npx expo start --web --port 8098
//   node scripts/videos/capture-screens.cjs            # every screen, both sizes
//   node scripts/videos/capture-screens.cjs desk /rh   # one screen, one size
//
// desk = 1440×900 at 1.5×, phone = 390×844 at 3×. Written as JPEG to
// marketing/videos/screens/{desk|phone}-<name>.jpg. The demo's « Essayer
// Cantia » pill and dev overlays are hidden: they are not part of the product.
const path = require('path');
const { chromium } = require('playwright');

const OUT = path.join(__dirname, '..', '..', 'marketing', 'videos', 'screens');
const BASE = process.env.DEMO_URL || 'http://localhost:8098';

// route, or [route, text of a tab/button to click first, name]
const SCREENS = [
  '/', '/devis/new', '/devis/d1', '/devis/d9', '/devis/trames', '/devis/inventaire', '/devis/factures', '/devis/factures/f1',
  '/devis/factures/f3', '/devis/factures/new', '/devis/factures/import-releve', '/emails', '/emails/reglages',
  ['/emails/reglages', 'Relances automatiques', 'emails_relances'], ['/emails/reglages', 'Modèles', 'emails_modeles'],
  '/chantiers', '/chantiers/p1', '/chantiers/p1/feed', '/chantiers/p1/reports', '/chantiers/p1/rapport-new',
  '/chantiers/p1/travaux-supplementaires', '/chantiers/p1/profitability', '/chantiers/p1/photos', '/chantiers/p1/documents',
  '/chantiers/p1/gantt', '/chantiers/p1/situations', '/chantiers/p1/subcontractors', '/planning', '/taches', '/rh',
  '/rh/fiches-salaire', '/rh/absences', '/clients', '/clients/c1', '/depenses', '/tresorerie', '/compta/tva', '/compta/bouclement',
  '/soumissions', '/compte/apparence', '/compte/devis', '/compte/equipe', '/compte/fiduciaire', '/compte/integrations',
  '/compte/import', '/installer',
];

function nameOf(route) {
  return route.replace(/[/?=&]+/g, '_').replace(/^_|_$/g, '') || 'home';
}

async function shoot(mode, list) {
  const browser = await chromium.launch();
  const ctx = await browser.newContext(
    mode === 'phone'
      ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true }
      : { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1.5 },
  );
  await ctx.addInitScript(() => {
    try {
      localStorage.setItem('cantia:demo-locale', 'fr');
      localStorage.setItem('opus:hint:dashboard-welcome', '1');
    } catch {}
    document.cookie = 'cantia_cookie_consent=refused; path=/';
  });
  const page = await ctx.newPage();
  for (const item of list) {
    const [route, click, name] = Array.isArray(item) ? item : [item, null, nameOf(item)];
    try {
      await page.goto(BASE + route, { waitUntil: 'networkidle', timeout: 240000 });
      await page.waitForTimeout(2500);
      if (click) {
        await page.getByText(click, { exact: true }).first().click();
        await page.waitForTimeout(1500);
      }
      await page.evaluate(() => {
        for (const el of document.querySelectorAll('div')) {
          const t = (el.textContent || '').trim();
          const r = el.getBoundingClientRect();
          const pos = getComputedStyle(el).position;
          if ((pos === 'absolute' || pos === 'fixed') && t.includes('Essayer Cantia') && r.height < 140) el.style.visibility = 'hidden';
          if (/(Each child in a list|Warning:|Logs for your project)/.test(t) && r.height < 120 && r.width < 700) el.style.visibility = 'hidden';
        }
      });
      await page.screenshot({ path: path.join(OUT, `${mode}-${name}.jpg`), type: 'jpeg', quality: 90 });
      console.log('ok', mode, name);
    } catch (e) {
      console.log('fail', mode, route, String(e).slice(0, 100));
    }
  }
  await browser.close();
}

(async () => {
  const [mode, ...routes] = process.argv.slice(2);
  const list = routes.length ? routes : SCREENS;
  for (const m of mode ? [mode] : ['desk', 'phone']) await shoot(m, list);
})();
