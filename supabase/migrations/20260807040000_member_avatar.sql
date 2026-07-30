-- Per-person setting, not per-organization: lives on organization_members
-- (the per user+org row) rather than a separate global profiles table,
-- matching how full_name already works for a member's display name in
-- this codebase — a user re-uploads it if they're in more than one org,
-- same as they'd set a different display name per org today.
alter table public.organization_members add column avatar_url text;
