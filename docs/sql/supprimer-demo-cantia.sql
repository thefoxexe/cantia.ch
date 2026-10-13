-- À coller dans Supabase > SQL Editor > New query, puis Run.
--
-- Supprime définitivement :
--   - les entreprises « Démo Cantia », « Cantia démo », « test » et « Test 2.0 »
--     avec tout ce qui en dépend (chantiers, devis, factures, compta, membres…) ;
--   - le partenaire de test au code C87Q5A, son clic et ses 2 rattachements
--     (« test » et « Cantia.ch »). Vérifié : 0 commission, 0 versement.
--
-- Ne touche PAS à :
--   - l'entreprise « Cantia.ch » ;
--   - les comptes de connexion (e-mails). Le compte info@ est le seul
--     propriétaire de « Cantia.ch » : le supprimer supprimerait aussi l'accès
--     à « Cantia.ch ».
begin;
set local statement_timeout = '10min';

delete from public.referral_attributions where partner_id = '9c66a0d4-3d5e-4e9f-9333-88067c509d0a';
delete from public.referral_clicks where code = 'C87Q5A';
delete from public.partner_referral_codes where partner_id = '9c66a0d4-3d5e-4e9f-9333-88067c509d0a';
delete from public.partner_profiles where id = '9c66a0d4-3d5e-4e9f-9333-88067c509d0a';

delete from public.organizations where id in (
  'e42bf60e-5f41-4450-bc69-9a6960e6d1c1', -- Démo Cantia
  '2bef7f80-4e6a-4ec7-8cd3-75e9ca923a70', -- Cantia démo
  '9b70f56b-a88f-46eb-be7f-48598f5fd412', -- test
  '32bdd101-0fd4-4902-b6be-6a73313842f6'  -- Test 2.0
);
commit;

-- Contrôle : attendu 0, 1, 0, 0
select
  (select count(*) from public.organizations where id in ('e42bf60e-5f41-4450-bc69-9a6960e6d1c1','2bef7f80-4e6a-4ec7-8cd3-75e9ca923a70','9b70f56b-a88f-46eb-be7f-48598f5fd412','32bdd101-0fd4-4902-b6be-6a73313842f6')) as entreprises_test_restantes,
  (select count(*) from public.organizations where id = '0e8fd9a7-2a71-41ad-9e1c-09fcba4d69cf') as cantia_ch_gardee,
  (select count(*) from public.partner_profiles where id = '9c66a0d4-3d5e-4e9f-9333-88067c509d0a') as partenaire_test_restant,
  (select count(*) from public.referral_attributions where organization_id = '0e8fd9a7-2a71-41ad-9e1c-09fcba4d69cf') as rattachement_cantia_ch;
