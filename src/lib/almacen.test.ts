import { expect, test } from 'vitest'
import { CLAVE_RECORDAR, crearAlmacen } from './almacen'

const falso = () => { const m = new Map<string, string>(); return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v), removeItem: (k: string) => void m.delete(k), m } }

test('por defecto la sesión va a sessionStorage y no persiste', () => {
  const l = falso(), s = falso(), a = crearAlmacen(l, s)
  a.setItem('sb-token', 'abc')
  expect(s.m.get('sb-token')).toBe('abc')
  expect(l.m.has('sb-token')).toBe(false)
})
test('con «mantener sesión» va a localStorage', () => {
  const l = falso(), s = falso(), a = crearAlmacen(l, s)
  l.setItem(CLAVE_RECORDAR, '1')
  a.setItem('sb-token', 'abc')
  expect(l.m.get('sb-token')).toBe('abc')
  expect(a.getItem('sb-token')).toBe('abc')
})
test('cerrar sesión borra de ambos sitios', () => {
  const l = falso(), s = falso(), a = crearAlmacen(l, s)
  l.setItem('sb-token', 'x'); s.setItem('sb-token', 'y')
  a.removeItem('sb-token')
  expect(l.m.has('sb-token') || s.m.has('sb-token')).toBe(false)
})
