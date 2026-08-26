-- Bexio was gated to plan Entreprise (pro) and above; the user now wants it
-- available starting from the plan Équipe too.
update public.plans set has_bexio_integration = true where id = 'equipe';
