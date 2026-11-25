import { existsSync, readFileSync, rmSync } from 'node:fs'
import { expect, test } from 'vitest'
import {
  diferenciaSuministros, generarResumenSuministros, nombreArchivoSuministros,
  resumenMensual, totalCobrado, totalFacturas,
} from './pdfSuministros'
import type { FacturaSuministro, Habitacion, Propiedad } from '../types'

const p: Propiedad = {
  id: 'p1', tipo: 'casa', nombre: 'Vivienda', calle: 'Calle prueba prueba nº 1', codigo_postal: '00000',
  ciudad: 'Ciudad', provincia: 'Provincia', gestiona_agua: true, gestiona_luz: true, gestiona_gas: false,
}
const habs: Habitacion[] = [
  { numero: '1', concepto: 'Habitación 1', renta: 500, suministros: 60, inq_nombre: 'Inquilina Uno', inq_dni: 'AA000', inq_direccion: 'Calle 1', inq_telefono: '600' },
  { numero: '2', concepto: 'Habitación 2', renta: 500, suministros: 60, inq_nombre: 'Inquilina Dos', inq_dni: 'AA001', inq_direccion: 'Calle 2', inq_telefono: '601' },
]
const facturas: FacturaSuministro[] = [
  { propiedad_id: 'p1', tipo: 'agua', proveedor: 'EMASESA', anio: 2026, mes: 10, importe: 78.75, periodo_desde: '2026-10-01', periodo_hasta: '2026-10-31', fecha_notificacion: '2026-11-02', fecha_cobro: '2026-11-05' },
  { propiedad_id: 'p1', tipo: 'luz', proveedor: 'Endesa', anio: 2026, mes: 10, importe: 53.86 },
]

test('suma facturas, lo cobrado y la diferencia', () => {
  expect(totalFacturas(facturas)).toBe(132.61)
  expect(totalCobrado(habs)).toBe(120)
  expect(diferenciaSuministros(facturas, habs)).toBe(-12.61)
  expect(resumenMensual(facturas, habs)).toEqual({ totalFacturas: 132.61, totalCobrado: 120, diferencia: -12.61 })
})

test('genera el resumen mensual en PDF con nombre ordenado', () => {
  expect(nombreArchivoSuministros(p, 2026, 10)).toBe('2026 11 Suministros Vivienda.pdf')
  generarResumenSuministros({ nombre: 'Ana', dni: '0', direccion: 'Calle 1', telefono: '6' }, p, habs, facturas, ['agua', 'luz'], 2026, 10)
  const f = '2026 11 Suministros Vivienda.pdf'
  expect(existsSync(f)).toBe(true)
  expect(readFileSync(f).subarray(0, 5).toString()).toBe('%PDF-')
  rmSync(f)
})
