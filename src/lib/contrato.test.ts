import { expect, test } from 'vitest'
import { INVENTARIO_EJEMPLO, bloques, diaMes, fechaLarga, generarContrato, nombreContrato, textoDe, type DatosContrato } from './contrato'

const base: DatosContrato = {
  lugar: 'Sevilla', fechaContrato: '2026-09-01',
  arrendador: { nombre: 'Ana Propietaria Ejemplo', dni: '00000000A', domicilio: 'Calle Inventada 1, Ciudad', movil: '600000000', iban: 'ES00 0000 0000 0000 0000 0000', banco: 'Banco Ejemplo, en Ciudad' },
  arrendataria: { trato: 'Dña.', nombre: 'Inquilina Uno Ejemplo', nacionalidad: 'italiano', dni: 'AA0000001', domicilio: 'Via Roma 1, Roma, ITALIA', movil: '+39 3000000001' },
  vivienda: { calle: 'calle Falsa 123 portal B, piso 4º letra B', ciudad: 'Sevilla', numHabitaciones: 4 },
  habitacion: { descripcion: 'Habitación principal con balcón', numero: '1' },
  inicio: '2026-09-01', fin: '2027-06-30', renta: 540, suministros: 60,
  servicios: 'Electricidad, Gas Natural e Internet', incluidos: 'agua y cuotas de comunidad ordinarias y extraordinarias',
  fechaReserva: '2026-06-09', reserva: 540, inventario: INVENTARIO_EJEMPLO,
}

test('fechas en texto largo', () => {
  expect(fechaLarga('2026-09-01')).toBe('1 de septiembre de 2026')
  expect(diaMes('2027-06-30')).toBe('30 de junio')
})
test('los campos subrayados del modelo salen en el texto', () => {
  const t = textoDe(bloques(base, 4))
  for (const s of ['a 1 de septiembre de 2026.', 'Dña. Inquilina Uno Ejemplo con Dni italiano: AA0000001', 'Via Roma 1, Roma, ITALIA y móvil +39 3000000001',
    'Habitación principal con balcón - Habitación nº 1', 'desde el 1 de septiembre, del presente año 2026, hasta el 30 de junio de 2027',
    '540,00 € (QUINIENTOS CUARENTA EUROS)', '60,00 € mensuales', 'de los 60,00 € por persona', 'Electricidad, Gas Natural e Internet',
    'un total de 540,00€ (Quinientos cuarenta euros)', 'si no se incorporase en septiembre', 'un total de 600,00€ (Seiscientos euros)', 'una de las cuatro habitaciones', 'constando cada ejemplar de 4 folios'])
    expect(t).toContain(s)
})
test('cambiar la renta cambia todas las menciones (cifra, letra, total)', () => {
  const t = textoDe(bloques({ ...base, renta: 485, suministros: 60, reserva: 485 }, 4))
  expect(t).toContain('485,00 € (CUATROCIENTOS OCHENTA Y CINCO EUROS)')
  expect(t).toContain('un total de 545,00€ (Quinientos cuarenta y cinco euros)')
})
test('sin gastos incluidos y con inquilino masculino', () => {
  const t = textoDe(bloques({ ...base, incluidos: '', arrendataria: { ...base.arrendataria, trato: 'D.' } }, 4))
  expect(t).not.toContain('se incluyen los gastos')
  expect(t).toContain('manifestando expresamente el inquilino')
})
test('genera un PDF de varias páginas con inventario y nombre ordenado', () => {
  const doc = generarContrato(base)
  expect(doc.getNumberOfPages()).toBeGreaterThanOrEqual(4)
  expect(Buffer.from(doc.output('arraybuffer')).subarray(0, 5).toString()).toBe('%PDF-')
  expect(nombreContrato(base, 'Arjona')).toBe('2026 09 01 ARRENDAMIENTO DE VIVIENDA Arjona Inquilina Habitación 1.pdf')
  expect(generarContrato({ ...base, inventario: null }).getNumberOfPages()).toBeLessThan(doc.getNumberOfPages())
})
