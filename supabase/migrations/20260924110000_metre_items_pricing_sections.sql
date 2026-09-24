-- The métré was a flat quantity-only list with no way to price a line and
-- no grouping — "Créer un devis depuis ce métré" always produced devis
-- lines at CHF 0.00, so the transfer only saved retyping descriptions, not
-- the actual pricing work. unit_price lets a line carry a real price
-- (typed, or filled from a catalog match — see lib/catalog.ts), and
-- section groups lines into lots/chapters the way a real métré is
-- structured (gros œuvre, second œuvre, ...) instead of one long list.
alter table public.metre_items
  add column if not exists unit_price numeric(10,2) not null default 0,
  add column if not exists section text;
