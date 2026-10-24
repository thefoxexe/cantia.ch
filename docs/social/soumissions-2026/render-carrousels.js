const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });
  await page.goto('file://' + path.join(__dirname, 'carrousels.html'));
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(800);
  const ids = await page.$$eval('section.s', (els) => els.map((e) => e.id));
  for (const id of ids) {
    const set = id[0] === 'a' ? 'chantier' : 'bureau';
    await page.locator('#' + id).screenshot({ path: path.join(__dirname, 'carrousels', `cantia-nouveautes-${set}-${id.slice(1).padStart(2, '0')}.png`) });
  }
  console.log(ids.length, 'slides');
  await browser.close();
})();
