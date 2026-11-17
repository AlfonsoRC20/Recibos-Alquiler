# Recibos de alquiler

Aplicación web con cuentas de usuario para gestionar habitaciones o viviendas
de alquiler y generar en PDF los recibos mensuales. Cada usuario solo ve sus
propios datos (seguridad por fila en la base de datos).

> **Estado:** v0.1 (Fases 1-4 parciales). Ver [ROADMAP.md](ROADMAP.md).

## Qué hace ahora

- Registro e inicio de sesión (Supabase Auth).
- Tus datos como arrendador/a, habitaciones, inquilinos y precios.
- Recibo en PDF generado en el navegador, con el importe en letras.
- Archivo con nombre ordenado: `2026 11 Alquiler Habitación 2.pdf`.

## Puesta en marcha

1. Crea un proyecto gratuito en [supabase.com](https://supabase.com).
2. En **SQL Editor**, ejecuta el contenido de `supabase/schema.sql`.
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
src/lib/        letras, pdf, cliente de Supabase
src/components/ Login, Perfil, Habitaciones, Recibos
supabase/       Esquema SQL con RLS
legacy/fase0/   Versión inicial sin servidor (datos de ejemplo)
```

## Privacidad

Contiene datos personales de terceros (DNI, domicilio). Lee
[SECURITY.md](SECURITY.md). Nunca subas `.env.local`, PDFs ni hojas de cálculo.
El repositorio lo bloquea con `.gitignore` y una comprobación en CI.

## Licencia

MIT.
