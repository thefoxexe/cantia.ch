-- organizations is updated column by column (grants per column): the
-- address position and offsets added in 20261106120000 need their own
-- grant, or the whole Compte → Apparence save is refused. (Applied on
-- production on 6 Nov 2026.)
grant update (client_address_position, client_address_offset_x_mm, client_address_offset_y_mm) on public.organizations to authenticated;
