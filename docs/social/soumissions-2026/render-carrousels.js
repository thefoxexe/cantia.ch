const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });
  // section id prefix -> file name
  const sets = { a: 'nouveautes-chantier', b: 'nouveautes-bureau', c: 'accounting', p: 'partners', e: 'entreprises' };
  let total = 0;
  for (const file of ['carrousels.html', 'produits.html']) {
    await page.goto('file://' + path.join(__dirname, file));
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(800);
    const ids = await page.$$eval('section.s', (els) => els.map((e) => e.id));
    for (const id of ids) {
      await page.locator('#' + id).screenshot({ path: path.join(__dirname, 'carrousels', `cantia-${sets[id[0]]}-${id.slice(1).padStart(2, '0')}.png`) });
    }
    total += ids.length;
  }
  console.log(total, 'slides');
  await browser.close();
})();
