-- E-mail "paiement échoué" — même mécanisme d'idempotence que
-- trial_ended_email_sent_at (20260... trial ended email), mais qui doit
-- pouvoir se redéclencher : un même abonnement peut retomber en échec de
-- paiement plusieurs fois dans sa vie (carte expirée un an, puis à nouveau
-- deux ans plus tard), contrairement à la fin d'essai qui n'arrive qu'une
-- fois. stripe-webhook remet cette colonne à null dès que l'accès est
-- retrouvé (hasAccess = true), pour qu'un futur échec puisse renvoyer l'e-mail.
alter table public.organizations
  add column payment_failed_email_sent_at timestamptz;
