-- Migración 002: historial de recibos con numeración correlativa (por usuario y año del periodo).
-- Ejecutar en Supabase → SQL Editor DESPUÉS de schema.sql.

create table if not exists public.recibos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  habitacion_id uuid references public.habitaciones(id) on delete set null,
  anio int not null,                       -- año del periodo cobrado
  secuencia int not null,                  -- la asigna el trigger, no el cliente
  numero text generated always as (anio::text || '-' || lpad(secuencia::text, 4, '0')) stored,
  mes int not null check (mes between 0 and 11),
  fecha_pago date not null,
  -- copia de los datos en el momento de emitir (el historial no cambia si luego editas la habitación)
  hab_numero text not null, concepto text not null default '',
  renta numeric(8,2) not null check (renta >= 0),
  suministros numeric(8,2) not null default 0 check (suministros >= 0),
  inq_nombre text not null, inq_dni text not null default '',
  inq_direccion text not null default '', inq_telefono text not null default '',
  estado text not null default 'emitido' check (estado in ('emitido', 'anulado')),
  created_at timestamptz not null default now(),
  unique (user_id, anio, secuencia)
);
-- Un solo recibo "emitido" por habitación y mes (si te equivocas, anúlalo y emite otro).
create unique index if not exists recibos_unico_mes
  on public.recibos (user_id, habitacion_id, anio, mes)
  where estado = 'emitido' and habitacion_id is not null;

create or replace function public.recibos_asignar_secuencia() returns trigger
language plpgsql set search_path = public as $$
begin
  perform pg_advisory_xact_lock(hashtext(new.user_id::text));   -- evita números repetidos en altas simultáneas
  select coalesce(max(secuencia), 0) + 1 into new.secuencia
    from public.recibos where user_id = new.user_id and anio = new.anio;
  return new;
end $$;
drop trigger if exists recibos_secuencia on public.recibos;
create trigger recibos_secuencia before insert on public.recibos
  for each row execute function public.recibos_asignar_secuencia();

alter table public.recibos enable row level security;
create policy "recibos: ver propios" on public.recibos for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "recibos: crear propios" on public.recibos for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "recibos: actualizar propios" on public.recibos for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
-- No hay política de borrado: los recibos no se borran, se anulan. Y solo se puede cambiar el estado.
revoke update on public.recibos from authenticated;
grant update (estado) on public.recibos to authenticated;
