-- Migración 003: quitar recibos anulados de la lista y poder desanular.
-- Ejecutar en Supabase → SQL Editor DESPUÉS de 002_recibos.sql. Ejecutar una sola vez.

alter table public.recibos add column if not exists oculto boolean not null default false;

-- Solo un recibo anulado puede estar oculto.
alter table public.recibos drop constraint if exists recibos_oculto_solo_anulados;
alter table public.recibos add constraint recibos_oculto_solo_anulados check (not oculto or estado = 'anulado');

-- Ahora se puede cambiar el estado y el ocultar; nada más (importes, número, fechas… siguen protegidos).
revoke update on public.recibos from authenticated;
grant update (estado, oculto) on public.recibos to authenticated;

-- Desanular un recibo respeta la regla "un solo recibo emitido por habitación y mes":
-- el índice único recibos_unico_mes (migración 002) hace fallar la operación si ya hay otro emitido.
