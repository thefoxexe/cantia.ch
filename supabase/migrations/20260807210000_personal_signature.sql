-- A devis/rapport signature should be the person who actually created that
-- document, not a single org-wide stamp — the org's signature_url (added
-- earlier on organizations) conflated "the company" with "whoever happens
-- to sign", which doesn't hold once an org has more than one member
-- creating documents. Personal, so it lives on organization_members next
-- to full_name/avatar_url, same pattern already used there.
alter table public.organization_members add column signature_url text;
