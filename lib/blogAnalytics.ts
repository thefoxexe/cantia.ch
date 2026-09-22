import { supabase } from './supabase';
import { isMarketingHost } from './appHost';

// Blog conversion tracking — same fire-and-forget, anonymous, insert-only
// pattern as trackPageview in lib/siteAnalytics.ts. Lets admin see which
// articles actually drive CTA clicks and lead-magnet signups, not just
// traffic. Gated to isMarketingHost() like every other marketing-site-only
// analytics call.
export function trackBlogCtaClick(sourceSlug: string, category: string, ctaKind: 'inline' | 'closing' | 'leadmagnet'): void {
  if (typeof window === 'undefined' || !isMarketingHost()) return;
  supabase
    .from('blog_cta_clicks')
    .insert({ source_slug: sourceSlug, category, cta_kind: ctaKind })
    .then(({ error }) => {
      if (error) console.error('[analytics] blog cta click insert failed:', error.message);
    });
}
