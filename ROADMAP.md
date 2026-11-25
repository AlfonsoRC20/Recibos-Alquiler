# Hoja de ruta

- [x] **Fase 0.** Generador sin servidor (`legacy/fase0`).
- [x] **Fase 1.** React + Vite + TypeScript, pruebas y CI.
- [~] **Fase 2.** Cuentas y base de datos con RLS. *Escrito; falta probarlo contra un proyecto Supabase real.*
- [~] **Fase 3.** Gestión de habitaciones e inquilinos. *Hecho en una sola tabla; falta separar propiedades, inquilinos y contratos.*
- [~] **Fase 4.** Historial de recibos con numeración correlativa y anulación (hecho). *Pendiente: generación mensual en lote.*
- [x] **Propiedades.** Casas y garajes; menú propio según el tipo de propiedad.
- [x] **Cuadrícula de pagos.** Sección propia del menú: pagado/pendiente por habitación y mes, con acceso a los recibos del mes (activos, anulados y quitados).
- [x] **Plaza de garaje.** Precio mensual, fecha de pago, IPC y recibo PDF. Sin contrato ni suministros.
- [~] **Contrato.** Generación en PDF desde el modelo, con validación de datos críticos. *Pendiente: guardar contratos, parámetros (días de pago, plazos…).*
- [x] **Agua, luz y gas.** Registro de facturas reales por suministro y mes, comparación con lo cobrado a los inquilinos y resumen mensual en PDF. *Pendiente: repercutir automáticamente el gasto real en los recibos y avisos de vencimiento.*
- [ ] **Fase 5.** Editor de plantillas con campos y varios idiomas.
- [ ] **Fase 6.** RGPD: exportar/borrar cuenta, política de privacidad.
- [ ] **Fase 7.** Despliegue y documentación con capturas.
