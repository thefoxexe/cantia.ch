// The edge rules of the main site (netlify/edge-functions/trailing-slash.ts)
// and the phone renders (scripts/build-phone-variants.mjs).
import test from 'node:test';
import assert from 'node:assert/strict';
import handler, { isPhone, phonePath, trailingSlashRedirect } from '../netlify/edge-functions/trailing-slash.ts';
import { phoneVariant, rootMarkup } from './build-phone-variants.mjs';

const IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';
const GOOGLEBOT_PHONE = 'Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';
const DESKTOP = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';
const IPAD = 'Mozilla/5.0 (iPad; CPU OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/604.1';

test('one URL per page: the trailing slash answers 301', () => {
  assert.equal(trailingSlashRedirect('https://cantia.ch/tarifs/'), 'https://cantia.ch/tarifs');
  assert.equal(trailingSlashRedirect('https://cantia.ch/blog/x/?utm_source=a'), 'https://cantia.ch/blog/x?utm_source=a');
  assert.equal(trailingSlashRedirect('https://cantia.ch/'), null);
  assert.equal(trailingSlashRedirect('https://partners.cantia.ch/x/'), null);
});

test('phones, including Googlebot smartphone, are recognised; desktops and tablets are not', () => {
  assert.equal(isPhone(new Headers({ 'user-agent': IPHONE })), true);
  assert.equal(isPhone(new Headers({ 'user-agent': GOOGLEBOT_PHONE })), true);
  assert.equal(isPhone(new Headers({ 'user-agent': DESKTOP, 'sec-ch-ua-mobile': '?1' })), true);
  assert.equal(isPhone(new Headers({ 'user-agent': DESKTOP })), false);
  assert.equal(isPhone(new Headers({ 'user-agent': IPAD })), false);
});

test('the phone file of a page', () => {
  assert.equal(phonePath('/'), '/_m/index.html');
  assert.equal(phonePath('/de/tarifs'), '/_m/de/tarifs.html');
  assert.equal(phonePath('/sitemap.xml'), null);
  assert.equal(phonePath('/logo.png'), null);
});

const page = (body) => new Response(body, { headers: { 'content-type': 'text/html; charset=utf-8', 'x-robots-tag': 'noindex, nofollow' } });

test('a phone gets the phone render under the normal URL, indexable, with Vary', async () => {
  const realFetch = globalThis.fetch;
  globalThis.fetch = async (url) => (String(url).endsWith('/_m/tarifs.html') ? page('phone') : new Response('nf', { status: 404 }));
  try {
    const res = await handler(new Request('https://cantia.ch/tarifs', { headers: { 'user-agent': IPHONE } }), { next: async () => page('desktop') });
    assert.equal(await res.text(), 'phone');
    assert.equal(res.headers.get('vary'), 'User-Agent');
    assert.equal(res.headers.get('x-robots-tag'), null);
  } finally {
    globalThis.fetch = realFetch;
  }
});

test('no phone render: the normal page', async () => {
  const realFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response('nf', { status: 404 });
  try {
    const res = await handler(new Request('https://cantia.ch/inconnu', { headers: { 'user-agent': IPHONE } }), { next: async () => new Response('desktop', { headers: { 'content-type': 'text/html' } }) });
    assert.equal(await res.text(), 'desktop');
  } finally {
    globalThis.fetch = realFetch;
  }
});

test('desktops get the desktop page with Vary; files pass through', async () => {
  const res = await handler(new Request('https://cantia.ch/tarifs', { headers: { 'user-agent': DESKTOP } }), { next: async () => new Response('desktop', { headers: { 'content-type': 'text/html' } }) });
  assert.equal(await res.text(), 'desktop');
  assert.equal(res.headers.get('vary'), 'User-Agent');
  assert.equal(await handler(new Request('https://cantia.ch/robots.txt'), { next: async () => new Response('') }), undefined);
});

test('app.cantia.ch pages are never indexed', async () => {
  const res = await handler(new Request('https://app.cantia.ch/login'), { next: async () => new Response('app', { headers: { 'content-type': 'text/html' } }) });
  assert.equal(res.headers.get('x-robots-tag'), 'noindex, nofollow');
  const js = await handler(new Request('https://app.cantia.ch/x.js'), { next: async () => new Response('', { headers: { 'content-type': 'application/javascript' } }) });
  assert.equal(js.headers.get('x-robots-tag'), null);
});

test('the phone variant swaps the markup and the stylesheet, nothing else', () => {
  const desk = '<html lang="fr" data-ssr-viewport="desktop"><head><title>T</title><style id="react-native-stylesheet">.d{}</style></head><body><div id="root"><h1>desk</h1></div>\n<script src="/_expo/a.js"></script></body></html>';
  const phone = '<html lang="fr"><head><style id="react-native-stylesheet">.p{}</style></head><body><div id="root"><h1>phone</h1></div>\n<script src="/_expo/b.js"></script></body></html>';
  assert.equal(rootMarkup(desk), '<div id="root"><h1>desk</h1></div>');
  const out = phoneVariant(desk, phone);
  assert.match(out, /data-ssr-viewport="phone"/);
  assert.match(out, /<h1>phone<\/h1>/);
  assert.match(out, /\.p\{\}/);
  assert.match(out, /<title>T<\/title>/);
  assert.match(out, /\/_expo\/a\.js/);
});
