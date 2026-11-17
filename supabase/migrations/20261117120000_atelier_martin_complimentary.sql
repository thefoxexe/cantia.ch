-- Atelier Martin SA: the demo company, on Entreprise without paying (no
-- Stripe subscription). Counted as « Offert (gratuit à vie) », not as a
-- paying customer. admin-billing-overview only syncs is_complimentary for
-- companies with a Stripe subscription, so this stays.
update public.organizations
   set is_complimentary = true
 where id = '576555a3-0ccc-4500-88d0-aecb82b37b28'
   and stripe_subscription_id is null;
