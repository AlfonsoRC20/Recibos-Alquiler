# Recibos de alquiler

Aplicación web con cuentas de usuario para gestionar habitaciones o viviendas
de alquiler y generar en PDF los recibos mensuales. Cada usuario solo ve sus
propios datos (seguridad por fila en la base de datos).

> **Estado:** v0.1 (Fases 1-4 parciales). Ver [ROADMAP.md](ROADMAP.md).

## Qué hace ahora

- Registro e inicio de sesión (Supabase Auth).
- Varias propiedades (casas y garajes); dentro de cada una se elige qué gestionar.
- **Casas:** Recibos de alquiler, Contrato y Agua, luz y gas.
- **Garajes:** al abrir uno se entra directamente en su **Plaza de garaje**, con precio mensual, fecha de pago e IPC; sin contrato ni suministros.
- Contrato de arrendamiento en PDF a partir de un modelo con los campos editables.
- Agua, luz y gas: registro de las facturas reales de cada compañía (importe, periodo, fecha de notificación y fecha de cobro), comparación mensual con lo que se cobra a los inquilinos y resumen en PDF.
- Tus datos como arrendador/a, habitaciones, inquilinos y precios.
- Recibo en PDF generado en el navegador, con el importe en letras.
- **Cuadrícula de pagos** como sección propia del menú de cada casa: pagado/pendiente por habitación y mes, con acceso a los recibos activos, anulados y quitados del mes elegido.
- Archivo con nombre ordenado: `2026 11 Alquiler Habitación 2.pdf`.

## Puesta en marcha

1. Crea un proyecto gratuito en [supabase.com](https://supabase.com).
2. En **SQL Editor**, ejecuta, por este orden y una sola vez cada uno: `supabase/schema.sql`, `002_recibos.sql`, `003_quitar_anulados.sql`, `004_propiedades.sql`, `005_garajes_pagos.sql` y `006_suministros.sql` (todos en la carpeta `supabase/`).
3. En **Project Settings → API**, copia la URL y la clave `anon` (pública).
4. `cp .env.example .env.local` y rellena los dos valores.
5. `npm install` y `npm run dev`.

En **Authentication → Sign In / Providers** puedes desactivar la confirmación
por correo mientras pruebas.

## Scripts

| Comando | Función |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm test` | Pruebas (importe en letras, generación de PDF) |
| `npm run build` | Comprobación de tipos y compilación |

## Estructura

```
src/lib/        letras, PDF de recibo, plaza de garaje, suministros, contrato y cliente de Supabase
src/components/ Login, Perfil, Propiedades, Habitaciones, Recibos, Pagos, Historial, Contrato, PlazaGaraje, Agua-luz-gas
supabase/       Esquema SQL con RLS y migraciones 002-006
legacy/fase0/   Versión inicial sin servidor (datos de ejemplo)
```

## Privacidad

Contiene datos personales de terceros (DNI, domicilio). Lee
[SECURITY.md](SECURITY.md). Nunca subas `.env.local`, PDFs ni hojas de cálculo.
El repositorio lo bloquea con `.gitignore` y una comprobación en CI.

## Licencia

MIT.
