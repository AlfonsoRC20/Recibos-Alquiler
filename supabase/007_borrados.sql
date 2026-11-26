-- Migración 007: borrado definitivo de recibos y de propiedades.
-- Ejecutar en Supabase → SQL Editor DESPUÉS de 006_suministros.sql. Una sola vez.
--
-- 1) Permite borrar un recibo de verdad. La aplicación solo muestra el botón
--    «Eliminar permanentemente» en los recibos quitados/anulados.
-- 2) Al borrar una propiedad se borran en cascada sus habitaciones, recibos,
--    pagos y facturas de suministros (antes las claves foráneas lo impedían).

-- ---------------------------------------------------------------------------
-- 1) Borrado definitivo de recibos
-- ---------------------------------------------------------------------------
drop policy if exists "recibos: borrar propios" on public.recibos;
create policy "recibos: borrar propios" on public.recibos for delete to authenticated
  using ((select auth.uid()) = user_id);

grant delete on public.recibos to authenticated;

-- ---------------------------------------------------------------------------
-- 2) Borrado en cascada de todo lo que cuelga de una propiedad
-- ---------------------------------------------------------------------------
alter table public.habitaciones drop constraint if exists habitaciones_propiedad_id_fkey;
alter table public.habitaciones add constraint habitaciones_propiedad_id_fkey
  foreign key (propiedad_id) references public.propiedades(id) on delete cascade;

alter table public.recibos drop constraint if exists recibos_propiedad_id_fkey;
alter table public.recibos add constraint recibos_propiedad_id_fkey
  foreign key (propiedad_id) references public.propiedades(id) on delete cascade;
