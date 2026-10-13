-- Cantia Relief v2: the onboarding is now a guided set of answers (activity,
-- process steps with who leads them and how long they take, team roles, how
-- the company quotes and invoices, anything else dictated), kept so the
-- owner can redo the world from where they left it.

alter table public.relief_worlds add column if not exists answers jsonb;
