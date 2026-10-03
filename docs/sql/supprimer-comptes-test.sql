-- À coller dans Supabase > SQL Editor > New query, puis Run.
-- Supprime les 2 profils partenaires de test et la fiduciaire « Test ».
-- Les comptes de connexion (e-mails) ne sont PAS supprimés.
--   Partenaire « Bastien RYSER » (bastien@cantia.ch), code RCQBVP
--   Partenaire « Bastien Ryser Test » (bastienryser20004@gmail.com), code FDFC8D
--   Fiduciaire « Test » (accès à WebAlp.ch)
-- Vérifié : 0 commission, 0 versement, 0 rattachement d'entreprise.
begin;
delete from public.partner_profiles where id in ('4f3e7690-aac5-4159-a2eb-3d934673295d', 'bbf9ef19-745b-4ca2-8d98-3c78ef8f6568');
delete from public.fiduciary_audit_log where firm_id = 'fad5c8d6-a345-4b5f-bda4-09332e2c2749';
delete from public.fiduciary_firms where id = 'fad5c8d6-a345-4b5f-bda4-09332e2c2749';
commit;
select (select count(*) from public.partner_profiles) as partenaires_restants, (select count(*) from public.fiduciary_firms) as fiduciaires_restantes;
