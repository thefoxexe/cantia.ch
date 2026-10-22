// robots.txt for the three public sites (cantia.ch, accounting.cantia.ch,
// partners.cantia.ch). Search engines and AI assistants are named
// explicitly and allowed, so ChatGPT, Claude, Gemini, Perplexity, Copilot
// and Apple can read and cite the public pages; private paths stay out for
// everyone. A crawler that finds its own group ignores the "*" one, hence
// the same Disallow lines in both groups.
const AI_AND_SEARCH_BOTS = [
  // Search engines (Gemini and Google AI answers rely on Google's index,
  // ChatGPT search and Copilot partly on Bing's).
  'Googlebot',
  'Bingbot',
  'Applebot',
  'DuckDuckBot',
  // Google Gemini
  'Google-Extended',
  // OpenAI ChatGPT
  'OAI-SearchBot',
  'ChatGPT-User',
  'GPTBot',
  // Anthropic Claude
  'ClaudeBot',
  'Claude-SearchBot',
  'Claude-User',
  // Perplexity
  'PerplexityBot',
  'Perplexity-User',
  // Apple Intelligence, Mistral Le Chat, Common Crawl (used by many models)
  'Applebot-Extended',
  'MistralAI-User',
  'CCBot',
];

export function robotsTxt({ disallow = [], sitemap }) {
  const rules = ['Allow: /', ...disallow.map((p) => `Disallow: ${p}`)].join('\n');
  return [
    AI_AND_SEARCH_BOTS.map((bot) => `User-agent: ${bot}`).join('\n'),
    rules,
    '',
    'User-agent: *',
    rules,
    '',
    `Sitemap: ${sitemap}`,
    '',
  ].join('\n');
}
