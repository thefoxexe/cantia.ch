-- An imported soumission starts with the VAT rate printed in it ("TVA 7.70 %")
-- instead of the default 8.1 %; the bidder can still change it in the recap.
create or replace function public.tenders_document_vat()
returns trigger language plpgsql set search_path = public as $$
declare
  r numeric;
begin
  if jsonb_typeof(new.metadata -> 'document_vat_rate') = 'number' then
    r := (new.metadata ->> 'document_vat_rate')::numeric;
    if r > 0 and r < 30 then new.vat_rate := round(r, 2); end if;
  end if;
  return new;
end;
$$;

create or replace trigger tenders_document_vat before insert on public.tenders
  for each row when (new.source_type = 'pdf') execute function public.tenders_document_vat();
