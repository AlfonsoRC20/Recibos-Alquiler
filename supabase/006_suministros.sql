-- Migración 006: facturas reales de agua, luz y gas de cada vivienda.
-- Ejecutar en Supabase → SQL Editor DESPUÉS de 005_garajes_pagos.sql. Una sola vez.
--
-- Sirve para comparar lo que cobran las compañías con lo que se cobra a los
-- inquilinos en el concepto «suministros» de sus recibos de alquiler.

create table if not exists public.facturas_suministros (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  propiedad_id uuid not null references public.propiedades(id) on delete cascade,
  tipo text not null check (tipo in ('agua', 'luz', 'gas')),
  proveedor text not null default '',
  anio int not null,
  mes int not null check (mes between 0 and 11),
  importe numeric(10,2) not null check (importe >= 0),
  periodo_desde date,
  periodo_hasta date,
  fecha_notificacion date,
  fecha_cobro date,
  nota text not null default '',
  created_at timestamptz not null default now(),
  -- Una sola factura por suministro y mes en cada vivienda.
  unique (propiedad_id, tipo, anio, mes)
);

create index if not exists facturas_suministros_propiedad_idx on public.facturas_suministros (propiedad_id);
create index if not exists facturas_suministros_user_idx on public.facturas_suministros (user_id);
create index if not exists facturas_suministros_periodo_idx on public.facturas_suministros (propiedad_id, anio, mes);

alter table public.facturas_suministros enable row level security;

drop policy if exists "facturas suministros: ver propias" on public.facturas_suministros;
create policy "facturas suministros: ver propias" on public.facturas_suministros for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "facturas suministros: crear propias" on public.facturas_suministros;
create policy "facturas suministros: crear propias" on public.facturas_suministros for insert to authenticated
  with check ((select auth.uid()) = user_id
    and exists (select 1 from public.propiedades p where p.id = propiedad_id and p.user_id = (select auth.uid())));

drop policy if exists "facturas suministros: actualizar propias" on public.facturas_suministros;
create policy "facturas suministros: actualizar propias" on public.facturas_suministros for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id
    and exists (select 1 from public.propiedades p where p.id = propiedad_id and p.user_id = (select auth.uid())));

drop policy if exists "facturas suministros: borrar propias" on public.facturas_suministros;
create policy "facturas suministros: borrar propias" on public.facturas_suministros for delete to authenticated
  using ((select auth.uid()) = user_id);
