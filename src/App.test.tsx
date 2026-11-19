// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'

const h = vi.hoisted(() => ({
  datos: {} as Record<string, unknown>, llamadas: [] as { t: string; op: string; v: unknown }[],
}))
vi.mock('./lib/supabase', () => {
  const from = (t: string) => {
    const b: Record<string, unknown> = {}
    for (const m of ['select', 'eq', 'order']) b[m] = () => b
    b.maybeSingle = () => Promise.resolve({ data: h.datos[t], error: null })
    b.update = (v: unknown) => { h.llamadas.push({ t, op: 'update', v }); return b }
    b.then = (res: (x: unknown) => unknown) => res({ data: h.datos[t], error: null })
    return b
  }
  return { configured: true, supabase: { from,
    auth: { getSession: () => Promise.resolve({ data: { session: { user: { id: 'u', email: 'a@b.c' } } } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }), signOut: () => Promise.resolve() } } }
})
import App from './App'

const CASA = '11111111-1111-1111-1111-111111111111', GARAJE = '22222222-2222-2222-2222-222222222222'
const prop = (id: string, tipo: string, nombre: string) => ({ id, tipo, nombre, calle: 'calle X 1', codigo_postal: '41001', ciudad: 'Sevilla', provincia: 'Sevilla', gestiona_agua: false, gestiona_luz: true, gestiona_gas: false })

beforeEach(() => {
  h.llamadas.length = 0; location.hash = ''
  h.datos = { perfiles: { nombre: 'Ana', dni: '1', direccion: 'x', telefono: '6', iban: 'ES00', banco: 'B' },
    propiedades: [prop(CASA, 'casa', 'Arjona'), prop(GARAJE, 'garaje', 'Garaje 5')], habitaciones: [], recibos: [] }
})
afterEach(cleanup)

test('tras iniciar sesión se elige propiedad y hay botón para crear', async () => {
  render(<App />)
  expect(await screen.findByText('¿Qué propiedad quieres gestionar?')).toBeTruthy()
  expect(screen.getByText(/Arjona/)).toBeTruthy(); expect(screen.getByText(/Garaje 5/)).toBeTruthy()
  fireEvent.click(screen.getByText('Crear propiedad'))
  expect(await screen.findByText('Nueva propiedad')).toBeTruthy()
})
test('una casa ofrece Recibos, Contrato y Agua, luz y gas', async () => {
  render(<App />); fireEvent.click(await screen.findByText(/Arjona/))
  expect(await screen.findByText('Recibos de alquiler')).toBeTruthy()
  expect(screen.getByText('Contrato')).toBeTruthy(); expect(screen.getByText('Agua, luz y gas')).toBeTruthy()
  expect(screen.getByText('Gestionas: Luz')).toBeTruthy()
})
test('un garaje NO ofrece Agua, luz y gas', async () => {
  location.hash = `/${GARAJE}/menu`; render(<App />)
  expect(await screen.findByText('Recibos de alquiler')).toBeTruthy()
  expect(screen.getByText('Contrato')).toBeTruthy(); expect(screen.queryByText('Agua, luz y gas')).toBeNull()
})
test('Agua, luz y gas guarda los suministros elegidos de la propiedad', async () => {
  location.hash = `/${CASA}/alg`; render(<App />)
  fireEvent.click(await screen.findByLabelText('Agua')); fireEvent.click(screen.getByLabelText('Luz')); fireEvent.click(screen.getByLabelText('Gas'))
  fireEvent.click(screen.getByText('Guardar'))
  await waitFor(() => expect(h.llamadas[h.llamadas.length - 1]).toEqual({ t: 'propiedades', op: 'update', v: { gestiona_agua: true, gestiona_luz: false, gestiona_gas: true } }))
})
test('el contrato se abre con servicios según la propiedad y pide los datos que faltan', async () => {
  location.hash = `/${CASA}/contrato`; render(<App />)
  expect(await screen.findByText(/Contrato de arrendamiento · Arjona/)).toBeTruthy()
  expect((screen.getByLabelText('Servicios independientes de la renta') as HTMLInputElement).value).toBe('Electricidad e Internet')
  expect(screen.getByText(/Falta:/)).toBeTruthy()
  expect((screen.getByText('Descargar contrato PDF') as HTMLButtonElement).disabled).toBe(true)
})
test('Recibos de alquiler sigue mostrando sus pestañas', async () => {
  location.hash = `/${CASA}/recibos`; render(<App />)
  expect(await screen.findByText('Historial')).toBeTruthy(); expect(screen.getByText('Habitaciones')).toBeTruthy()
})
