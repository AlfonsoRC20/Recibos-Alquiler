-- Migración 004: propiedades (casa/garaje), habitaciones por propiedad, suministros por propiedad y datos bancarios.
-- Ejecutar en Supabase → SQL Editor DESPUÉS de 003_quitar_anulados.sql. Una sola vez.
-- Tus habitaciones y recibos actuales pasan automáticamente a una propiedad llamada «Mi vivienda» (podrás renombrarla).

create table if not exists public.propiedades (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  tipo text not null check (tipo in ('casa', 'garaje')),
  nombre text not null,
  calle text not null default '',
  codigo_postal text not null default '',
  ciudad text not null default '',
  provincia text not null default '',
  gestiona_agua boolean not null default false,
  gestiona_luz boolean not null default false,
  gestiona_gas boolean not null default false,
  created_at timestamptz not null default now(),
  -- Agua, luz y gas solo tienen sentido en una casa.
  constraint propiedades_alg_solo_casa check (tipo = 'casa' or not (gestiona_agua or gestiona_luz or gestiona_gas))
);
create index if not exists propiedades_user_idx on public.propiedades (user_id);
alter table public.propiedades enable row level security;
create policy "propiedades: solo el dueño" on public.propiedades for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- Datos bancarios del arrendador (para los contratos).
alter table public.perfiles add column if not exists iban text not null default '';
alter table public.perfiles add column if not exists banco text not null default '';

-- Relación habitación → propiedad y recibo → propiedad (no se puede borrar una propiedad con habitaciones).
alter table public.habitaciones add column if not exists propiedad_id uuid references public.propiedades(id) on delete restrict;
alter table public.recibos      add column if not exists propiedad_id uuid references public.propiedades(id) on delete restrict;

-- Migración de lo que ya existe: una propiedad «Mi vivienda» por usuario con datos sueltos.
insert into public.propiedades (user_id, tipo, nombre)
select u.user_id, 'casa', 'Mi vivienda'
from (select user_id from public.habitaciones where propiedad_id is null
      union select user_id from public.recibos where propiedad_id is null) u
where not exists (select 1 from public.propiedades p where p.user_id = u.user_id);

update public.habitaciones h set propiedad_id =
  (select p.id from public.propiedades p where p.user_id = h.user_id order by p.created_at limit 1)
where h.propiedad_id is null;
update public.recibos r set propiedad_id = h.propiedad_id
  from public.habitaciones h where r.habitacion_id = h.id and r.propiedad_id is null;
update public.recibos r set propiedad_id =
  (select p.id from public.propiedades p where p.user_id = r.user_id order by p.created_at limit 1)
where r.propiedad_id is null;

alter table public.habitaciones alter column propiedad_id set not null;

-- El número de habitación era único por usuario; ahora debe ser único por propiedad
-- (así puede haber una «Habitación 1» en cada vivienda).
alter table public.habitaciones drop constraint if exists habitaciones_user_id_numero_key;
alter table public.habitaciones drop constraint if exists habitaciones_propiedad_numero_key;
alter table public.habitaciones add constraint habitaciones_propiedad_numero_key unique (propiedad_id, numero);
create index if not exists habitaciones_propiedad_idx on public.habitaciones (propiedad_id);
create index if not exists recibos_propiedad_idx on public.recibos (propiedad_id);

-- Seguridad: una habitación o un recibo solo pueden colgar de una propiedad del propio usuario.
drop policy if exists "habitaciones: solo el dueño" on public.habitaciones;
create policy "habitaciones: solo el dueño" on public.habitaciones for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id
    and exists (select 1 from public.propiedades p where p.id = propiedad_id and p.user_id = (select auth.uid())));

drop policy if exists "recibos: crear propios" on public.recibos;
create policy "recibos: crear propios" on public.recibos for insert to authenticated
  with check ((select auth.uid()) = user_id
    and (propiedad_id is null or exists (select 1 from public.propiedades p where p.id = propiedad_id and p.user_id = (select auth.uid()))));
