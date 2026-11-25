import { existsSync, readFileSync, rmSync } from 'node:fs'
import { expect, test } from 'vitest'
import { generarReciboGaraje, nombreArchivoGaraje, totalGaraje } from './pdfGaraje'
import type { Propiedad } from '../types'

const plaza: Propiedad = {
  id: 'p1', tipo: 'garaje', nombre: 'Garaje Centro', calle: 'Calle prueba prueba nº 1', codigo_postal: '00000',
  ciudad: 'Ciudad', provincia: 'Provincia', gestiona_agua: false, gestiona_luz: false, gestiona_gas: false,
}

test('el IPC se aplica sobre el precio mensual', () => {
  expect(totalGaraje(100, 10)).toBe(110)
  expect(totalGaraje(470, 3.5)).toBe(486.45)
  expect(totalGaraje(500, 0)).toBe(500)
})

test('genera el recibo de garaje con nombre ordenado', () => {
  const d = { fecha: '2026-10-05', mes: 9, anio: 2026, precio: 100, ipc: 10, concepto: 'Alquiler de plaza de garaje' }
  expect(nombreArchivoGaraje(plaza, d)).toBe('2026 10 Alquiler Plaza de garaje Garaje Centro.pdf')
  generarReciboGaraje({ nombre: 'Ana', dni: '0', direccion: 'Calle 1', telefono: '6' }, plaza, d)
  expect(existsSync('2026 10 Alquiler Plaza de garaje Garaje Centro.pdf')).toBe(true)
  expect(readFileSync('2026 10 Alquiler Plaza de garaje Garaje Centro.pdf').subarray(0, 5).toString()).toBe('%PDF-')
  rmSync('2026 10 Alquiler Plaza de garaje Garaje Centro.pdf')
})
