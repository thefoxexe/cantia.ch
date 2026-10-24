const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });
  await page.goto('file://' + path.join(__dirname, 'posts.html'));
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(800);
  const names = { p1: 'cantia-soumission-post-1', p2: 'cantia-soumission-post-2', p3: 'cantia-soumission-post-3' };
  for (const [id, name] of Object.entries(names)) {
    await page.locator('#' + id).screenshot({ path: path.join(__dirname, name + '.png') });
  }
  console.log(await page.evaluate(() => [...document.fonts].filter(f => f.status === 'loaded').map(f => f.family + ' ' + f.weight).join(', ')));
  await browser.close();
})();
