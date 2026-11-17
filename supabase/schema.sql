-- Esquema v0.1. Ejecutar en Supabase → SQL Editor. Seguridad: cada usuario solo ve sus filas (RLS).

create table if not exists public.perfiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre text not null default '', dni text not null default '',
  direccion text not null default '', telefono text not null default ''
);

create table if not exists public.habitaciones (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  numero text not null,
  concepto text not null default '',
  renta numeric(8,2) not null check (renta >= 0),
  suministros numeric(8,2) not null default 0 check (suministros >= 0),
  inq_nombre text not null, inq_dni text not null default '',
  inq_direccion text not null default '', inq_telefono text not null default '',
  created_at timestamptz not null default now(),
  unique (user_id, numero)
);
create index if not exists habitaciones_user_idx on public.habitaciones(user_id);

alter table public.perfiles enable row level security;
alter table public.habitaciones enable row level security;

create policy "perfil: solo el dueño" on public.perfiles
  for all to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create policy "habitaciones: solo el dueño" on public.habitaciones
  for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
