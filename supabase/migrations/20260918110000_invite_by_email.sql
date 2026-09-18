-- Envoi d'une invitation par e-mail (en plus de copier le lien) : garde la
-- destination sur l'invite elle-même plutôt que de faire confiance à un
-- paramètre passé au moment de l'envoi — l'edge function send-invite-email
-- relit invited_email depuis la ligne, jamais depuis le corps de la
-- requête, pour qu'un appel direct ne puisse pas rediriger l'e-mail vers
-- une autre adresse que celle réellement associée à ce lien d'invitation.
alter table public.organization_invites
  add column invited_email text;
