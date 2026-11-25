-- Migración 005: cuadrícula de pagos de habitaciones y recibos de plazas de garaje.
-- Ejecutar en Supabase → SQL Editor DESPUÉS de 004_propiedades.sql. Una sola vez.

-- ---------------------------------------------------------------------------
-- 1) Pagos por habitación y mes (cuadrícula mensual)
-- ---------------------------------------------------------------------------
create table if not exists public.pagos_habitacion (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  propiedad_id uuid not null references public.propiedades(id) on delete cascade,
  habitacion_id uuid not null references public.habitaciones(id) on delete cascade,
  anio int not null,
  mes int not null check (mes between 0 and 11),
  pagado boolean not null default false,
  fecha_pago date,
  created_at timestamptz not null default now(),
  unique (habitacion_id, anio, mes)
);
create index if not exists pagos_habitacion_propiedad_idx on public.pagos_habitacion (propiedad_id);
create index if not exists pagos_habitacion_user_idx on public.pagos_habitacion (user_id);

alter table public.pagos_habitacion enable row level security;

drop policy if exists "pagos: ver propios" on public.pagos_habitacion;
create policy "pagos: ver propios" on public.pagos_habitacion for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "pagos: crear propios" on public.pagos_habitacion;
create policy "pagos: crear propios" on public.pagos_habitacion for insert to authenticated
  with check ((select auth.uid()) = user_id
    and exists (select 1 from public.habitaciones h where h.id = habitacion_id and h.user_id = (select auth.uid()))
    and exists (select 1 from public.propiedades p where p.id = propiedad_id and p.user_id = (select auth.uid())));

drop policy if exists "pagos: actualizar propios" on public.pagos_habitacion;
create policy "pagos: actualizar propios" on public.pagos_habitacion for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id
    and exists (select 1 from public.habitaciones h where h.id = habitacion_id and h.user_id = (select auth.uid()))
    and exists (select 1 from public.propiedades p where p.id = propiedad_id and p.user_id = (select auth.uid())));

drop policy if exists "pagos: borrar propios" on public.pagos_habitacion;
create policy "pagos: borrar propios" on public.pagos_habitacion for delete to authenticated
  using ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------------
-- 2) Recibos de plazas de garaje/aparcamiento (precio, fecha de pago e IPC)
-- ---------------------------------------------------------------------------
create table if not exists public.recibos_garaje (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  propiedad_id uuid not null references public.propiedades(id) on delete cascade,
  anio int not null,
  mes int not null check (mes between 0 and 11),
  fecha_pago date not null,
  precio numeric(8,2) not null check (precio >= 0),
  ipc numeric(6,2) not null default 0 check (ipc >= 0),
  concepto text not null default 'Alquiler de plaza de garaje',
  created_at timestamptz not null default now(),
  unique (propiedad_id, anio, mes)
);
create index if not exists recibos_garaje_propiedad_idx on public.recibos_garaje (propiedad_id);
create index if not exists recibos_garaje_user_idx on public.recibos_garaje (user_id);

alter table public.recibos_garaje enable row level security;

drop policy if exists "recibos garaje: ver propios" on public.recibos_garaje;
create policy "recibos garaje: ver propios" on public.recibos_garaje for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "recibos garaje: crear propios" on public.recibos_garaje;
create policy "recibos garaje: crear propios" on public.recibos_garaje for insert to authenticated
  with check ((select auth.uid()) = user_id
    and exists (select 1 from public.propiedades p where p.id = propiedad_id and p.user_id = (select auth.uid())));

drop policy if exists "recibos garaje: actualizar propios" on public.recibos_garaje;
create policy "recibos garaje: actualizar propios" on public.recibos_garaje for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id
    and exists (select 1 from public.propiedades p where p.id = propiedad_id and p.user_id = (select auth.uid())));

drop policy if exists "recibos garaje: borrar propios" on public.recibos_garaje;
create policy "recibos garaje: borrar propios" on public.recibos_garaje for delete to authenticated
  using ((select auth.uid()) = user_id);
