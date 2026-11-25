import { existsSync, readFileSync, rmSync } from 'node:fs'
import { expect, test } from 'vitest'
import { generarRecibo, nombreArchivo } from './pdf'

test('genera un PDF válido con nombre ordenado', () => {
  const h = { numero: '2', concepto: 'Habitación de ejemplo', renta: 510, suministros: 60, inq_nombre: 'Inquilina Ejemplo', inq_dni: 'AA000', inq_direccion: 'Calle de ejemplo 1', inq_telefono: '600' }
  const d = { fecha: '2026-11-04', mes: 10, anio: 2026, renta: 510, suministros: 60 }
  const f = nombreArchivo(h, d)
  expect(f).toBe('2026 11 Alquiler Habitación 2.pdf')
  generarRecibo({ nombre: 'Ana', dni: '0', direccion: 'Calle 1', telefono: '6' }, h, d)
  expect(existsSync(f)).toBe(true)
  expect(readFileSync(f).subarray(0, 5).toString()).toBe('%PDF-')
  rmSync(f)
})
