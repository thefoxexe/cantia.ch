-- Italian was added as a full app locale (translations, PDF generation —
-- see lib/translations/it.ts and pdf-i18n.ts) but these five CHECK
-- constraints were never updated to match, so any Italian-speaking user
-- signing up (create_organization() copies auth.users' locale straight
-- into organization_members.locale) hit a hard DB error instead of an
-- account. Same gap on organizations/devis/factures/extra_works, which
-- would have blocked the per-document locale override feature for 'it'.
alter table public.organizations drop constraint organizations_locale_check;
alter table public.organizations add constraint organizations_locale_check check (locale = any (array['fr','de','it']));

alter table public.organization_members drop constraint organization_members_locale_check;
alter table public.organization_members add constraint organization_members_locale_check check (locale = any (array['fr','de','it']));

alter table public.devis drop constraint devis_locale_check;
alter table public.devis add constraint devis_locale_check check (locale = any (array['fr','de','it']));

alter table public.factures drop constraint factures_locale_check;
alter table public.factures add constraint factures_locale_check check (locale = any (array['fr','de','it']));

alter table public.extra_works drop constraint extra_works_locale_check;
alter table public.extra_works add constraint extra_works_locale_check check (locale = any (array['fr','de','it']));
