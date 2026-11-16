# Requisitos de usuario: aplicación de gestión de alquileres

Versión 0.1 · Borrador para revisión · 16 de noviembre de 2026

## 1. Propósito y alcance

La aplicación permite a personas que alquilan habitaciones o viviendas (arrendadores) gestionar sus propiedades, inquilinos y cobros, y generar documentos personalizados, en especial los recibos mensuales en PDF. Cada usuario trabaja únicamente con sus propios datos.

Este documento recoge **qué necesita el usuario**, no cómo se construye. Cada requisito tiene un identificador (RU-xxx) y una prioridad:

- **Imprescindible**: sin esto la aplicación no cumple su función.
- **Importante**: aporta mucho valor, puede entrar en una segunda versión.
- **Deseable**: mejora la experiencia, se hará si hay tiempo.

## 2. Perfiles de usuario

- **Arrendador particular** (perfil principal): alquila 1 a 10 habitaciones o viviendas, sin conocimientos técnicos, usa móvil y ordenador.
- **Arrendador con inquilinos extranjeros**: necesita documentos en varios idiomas (por ejemplo español, italiano e inglés).
- **Gestor o familiar autorizado** (futuro): ayuda a gestionar las propiedades de otra persona con permisos limitados.
- **Inquilino** (futuro): consulta sus recibos y su contrato. No es necesario en la primera versión.

## 3. Cuenta y acceso

- **RU-001 · Imprescindible.** Como usuario, quiero registrarme con mi correo y una contraseña para tener mi cuenta privada.
- **RU-002 · Imprescindible.** Quiero iniciar y cerrar sesión desde cualquier dispositivo.
- **RU-003 · Imprescindible.** Quiero recuperar mi contraseña por correo si la olvido.
- **RU-004 · Importante.** Quiero confirmar mi correo al registrarme, para evitar cuentas falsas.
- **RU-005 · Importante.** Quiero poder cambiar mi correo y mi contraseña.
- **RU-006 · Deseable.** Quiero activar una verificación en dos pasos para proteger mi cuenta.
- **RU-007 · Deseable.** Quiero entrar con mi cuenta de Google.

## 4. Mis datos como arrendador

- **RU-010 · Imprescindible.** Quiero guardar mi nombre, DNI, dirección y teléfono para que aparezcan como arrendador en los documentos.
- **RU-011 · Importante.** Quiero subir mi firma escaneada o mi logotipo para que aparezcan en los documentos.
- **RU-012 · Importante.** Quiero guardar mi cuenta bancaria (IBAN) para incluirla en recibos y cartas de pago.
- **RU-013 · Deseable.** Quiero tener varios perfiles de arrendador (por ejemplo, yo y mi pareja como copropietarios).

## 5. Propiedades y habitaciones

- **RU-020 · Imprescindible.** Quiero crear, editar y borrar propiedades (piso, casa, local) con su nombre y dirección.
- **RU-021 · Imprescindible.** Quiero crear, editar y borrar habitaciones dentro de una propiedad, con número, descripción, renta mensual y suministros.
- **RU-022 · Imprescindible.** Quiero gestionar varias propiedades desde la misma cuenta.
- **RU-023 · Importante.** Quiero indicar si una habitación está ocupada o libre.
- **RU-024 · Importante.** Quiero registrar el historial de cambios de precio de una habitación.
- **RU-025 · Deseable.** Quiero adjuntar un plano o fotos a la propiedad.
- **RU-026 · Deseable.** Quiero indicar el inventario o mobiliario de cada habitación.

## 6. Inquilinos

- **RU-030 · Imprescindible.** Quiero registrar a cada inquilino con nombre, documento de identidad, dirección de notificaciones y teléfono.
- **RU-031 · Imprescindible.** Quiero asignar un inquilino a una habitación durante un periodo.
- **RU-032 · Importante.** Quiero guardar el correo del inquilino y su idioma preferido.
- **RU-033 · Importante.** Quiero guardar el historial de inquilinos anteriores de cada habitación.
- **RU-034 · Importante.** Quiero registrar una persona de contacto de emergencia.
- **RU-035 · Deseable.** Quiero indicar si hay un avalista y sus datos.
- **RU-036 · Deseable.** Quiero anotar observaciones privadas sobre cada inquilino.

## 7. Contratos

- **RU-040 · Imprescindible.** Quiero registrar las condiciones de cada contrato: fechas de inicio y fin, renta, suministros y fianza.
- **RU-041 · Importante.** Quiero generar el contrato en PDF a partir de una plantilla con los datos ya rellenados.
- **RU-042 · Importante.** Quiero guardar el contrato firmado asociado al inquilino.
- **RU-043 · Importante.** Quiero recibir un aviso antes de que un contrato termine o deba renovarse.
- **RU-044 · Importante.** Quiero registrar la fianza (importe, fecha y estado de devolución).
- **RU-045 · Deseable.** Quiero registrar prórrogas y actualizaciones de renta.
- **RU-046 · Deseable.** Quiero un recordatorio de las obligaciones legales ligadas al contrato (por ejemplo, el depósito de la fianza), a validar con un asesor.

## 8. Recibos

- **RU-050 · Imprescindible.** Quiero elegir una habitación e introducir la fecha de pago para descargar el recibo en PDF.
- **RU-051 · Imprescindible.** Quiero que el mes y el año del recibo se deduzcan de la fecha, pero poder cambiarlos.
- **RU-052 · Imprescindible.** Quiero que el importe aparezca también en letras, sin errores.
- **RU-053 · Imprescindible.** Quiero poder modificar la renta o los suministros de un recibo concreto sin alterar el contrato.
- **RU-054 · Importante.** Quiero que se guarde un historial de todos los recibos emitidos.
- **RU-055 · Importante.** Quiero generar de una vez los recibos de todas las habitaciones de un mes.
- **RU-056 · Importante.** Quiero que los recibos tengan numeración correlativa y no se puedan duplicar por error.
- **RU-057 · Importante.** Quiero poder anular un recibo emitido por error, dejando constancia.
- **RU-058 · Importante.** Quiero enviar el recibo al inquilino por correo desde la aplicación.
- **RU-059 · Deseable.** Quiero emitir recibos parciales o de varios meses a la vez.
- **RU-060 · Deseable.** Quiero firmar digitalmente el PDF desde la aplicación.

## 9. Pagos y seguimiento

- **RU-070 · Importante.** Quiero registrar cada pago recibido: fecha, importe y método.
- **RU-071 · Importante.** Quiero ver de un vistazo qué habitaciones han pagado este mes y cuáles no.
- **RU-072 · Importante.** Quiero recibir un aviso cuando un pago se retrase.
- **RU-073 · Importante.** Quiero ver el saldo pendiente de cada inquilino.
- **RU-074 · Deseable.** Quiero importar los movimientos de mi banco (archivo CSV) para cotejar los pagos.
- **RU-075 · Deseable.** Quiero enviar automáticamente un recordatorio amable de pago.

## 10. Documentos personalizados

- **RU-080 · Importante.** Quiero crear mis propias plantillas de documentos con campos automáticos, como nombre del inquilino, renta o fecha.
- **RU-081 · Importante.** Quiero plantillas ya preparadas: recibo, carta de subida de renta, carta de devolución de fianza y aviso de impago.
- **RU-082 · Importante.** Quiero generar cada documento en PDF con los datos de la habitación y el inquilino elegidos.
- **RU-083 · Importante.** Quiero tener las plantillas en varios idiomas y generar el documento en el idioma del inquilino.
- **RU-084 · Deseable.** Quiero previsualizar el documento antes de descargarlo.
- **RU-085 · Deseable.** Quiero poder personalizar el aspecto del recibo: colores, logotipo y textos.
- **RU-086 · Deseable.** Quiero generar documentos de varias habitaciones a la vez y descargarlos en un solo archivo comprimido.

## 11. Informes y datos

- **RU-090 · Importante.** Quiero ver los ingresos por mes, por propiedad y por habitación.
- **RU-091 · Importante.** Quiero registrar gastos (reparaciones, impuestos, suministros) para conocer mi rentabilidad.
- **RU-092 · Deseable.** Quiero un resumen anual para preparar mi declaración de la renta.
- **RU-093 · Deseable.** Quiero exportar mis datos a una hoja de cálculo.
- **RU-094 · Deseable.** Quiero un panel de inicio con ocupación, ingresos del mes e impagos.

## 12. Privacidad y control de datos

- **RU-100 · Imprescindible.** Quiero que nadie más pueda ver mis propiedades, inquilinos ni recibos.
- **RU-101 · Imprescindible.** Quiero poder borrar mi cuenta y todos mis datos de forma definitiva.
- **RU-102 · Importante.** Quiero exportar todos mis datos en un formato legible.
- **RU-103 · Importante.** Quiero leer una política de privacidad clara que explique qué datos se guardan y para qué.
- **RU-104 · Importante.** Quiero poder borrar los datos de un inquilino anterior cuando ya no sean necesarios.
- **RU-105 · Importante.** Quiero guardar solo los datos imprescindibles, sin copias escaneadas de documentos de identidad.
- **RU-106 · Deseable.** Quiero ver un registro de los accesos recientes a mi cuenta.
- **RU-107 · Deseable.** Quiero compartir una propiedad con otra persona con permisos de solo lectura o de edición.

## 13. Requisitos de calidad

- **RU-110 · Imprescindible.** La aplicación debe usarse sin formación, con textos claros en español.
- **RU-111 · Imprescindible.** Debe funcionar bien en móvil y en ordenador.
- **RU-112 · Imprescindible.** Un recibo debe generarse en pocos segundos y con los datos correctos.
- **RU-113 · Importante.** Debe estar disponible en español, y después en italiano e inglés.
- **RU-114 · Importante.** Debe ser accesible: contraste suficiente, uso con teclado y compatibilidad con lectores de pantalla.
- **RU-115 · Importante.** Debe haber copias de seguridad para no perder datos.
- **RU-116 · Importante.** Los errores deben explicarse en lenguaje claro y sin perder lo que el usuario ha escrito.
- **RU-117 · Deseable.** Debe permitir modo oscuro.
- **RU-118 · Deseable.** Debe poder instalarse en el móvil como aplicación.
- **RU-119 · Deseable.** Debe permitir consultar los datos básicos sin conexión.

## 14. Fuera de alcance de la primera versión

- Cobro de alquileres dentro de la aplicación (pasarela de pago).
- Portal para que el inquilino entre con su propia cuenta.
- Anuncios y búsqueda de inquilinos.
- Contabilidad fiscal completa.

## 15. Supuestos

- El arrendador es una persona física que usa la aplicación a título particular.
- Los inquilinos pueden ser extranjeros, por lo que el idioma de los documentos es relevante.
- Los documentos generados son plantillas orientativas y **no sustituyen el asesoramiento legal o fiscal**.
- El arrendador es responsable de los datos personales de sus inquilinos que introduce en la aplicación.

## 16. Preguntas abiertas

1. ¿La aplicación será solo para uso propio o para otras personas? Esto cambia el peso de los requisitos de privacidad y de soporte.
2. ¿Será gratuita, de pago o de código abierto?
3. ¿Qué idiomas son necesarios desde el principio?
4. ¿Se necesita la firma digital de los recibos dentro de la aplicación o basta con subirlos firmados?
5. ¿Se quiere enviar los documentos por correo desde la aplicación o descargarlos y enviarlos aparte?
6. ¿Habrá más de un usuario gestionando las mismas propiedades?

## 17. Correspondencia con el plan de trabajo

- **Ya cubierto en la versión 0.1:** RU-001, RU-002, RU-010, RU-020 a RU-022 (parcialmente), RU-030, RU-031, RU-050 a RU-053 y RU-100 (parcialmente).
- **Siguiente iteración sugerida:** historial de recibos y generación mensual en lote (RU-054, RU-055, RU-056), pagos e impagos (RU-070 a RU-073).
- **Antes de abrir la aplicación a otros usuarios:** RU-003, RU-101 a RU-105.
