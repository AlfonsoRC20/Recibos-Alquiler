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
const prop = (id: string, tipo: string, nombre: string) => ({ id, tipo, nombre, calle: 'Calle prueba prueba nº 1', codigo_postal: '00000', ciudad: 'Ciudad', provincia: 'Provincia', gestiona_agua: false, gestiona_luz: true, gestiona_gas: false })

beforeEach(() => {
  h.llamadas.length = 0; location.hash = ''
  h.datos = { perfiles: { nombre: 'Ana', dni: '1', direccion: 'x', telefono: '6', iban: 'ES00', banco: 'B' },
    propiedades: [prop(CASA, 'casa', 'Vivienda de prueba'), prop(GARAJE, 'garaje', 'Garaje 5')],
    habitaciones: [], recibos: [], pagos_habitacion: [], recibos_garaje: [], facturas_suministros: [] }
})
afterEach(cleanup)

test('tras iniciar sesión se elige propiedad y hay botón para crear', async () => {
  render(<App />)
  expect(await screen.findByText('¿Qué propiedad quieres gestionar?')).toBeTruthy()
  expect(screen.getByText(/Vivienda de prueba/)).toBeTruthy(); expect(screen.getByText(/Garaje 5/)).toBeTruthy()
  fireEvent.click(screen.getByText('Crear propiedad'))
  expect(await screen.findByText('Nueva propiedad')).toBeTruthy()
})
test('una casa ofrece Recibos, Contrato y Agua, luz y gas', async () => {
  render(<App />); fireEvent.click(await screen.findByText(/Vivienda de prueba/))
  expect(await screen.findByText('Recibos de alquiler')).toBeTruthy()
  expect(screen.getByText('Cuadrícula de pagos')).toBeTruthy()
  expect(screen.getByText('Contrato')).toBeTruthy(); expect(screen.getByText('Agua, luz y gas')).toBeTruthy()
  expect(screen.getByText('Gestionas: Luz')).toBeTruthy()
})
test('al abrir un garaje se va directamente a la plaza de garaje', async () => {
  render(<App />); fireEvent.click(await screen.findByText(/Garaje 5/))
  expect(await screen.findByText(/Plaza de garaje · Garaje 5/)).toBeTruthy()
  expect(screen.queryByText('Recibos de alquiler')).toBeNull()
  expect(screen.queryByText('Contrato')).toBeNull()
  expect(screen.queryByText('Agua, luz y gas')).toBeNull()
})
test('un garaje ofrece Plaza de garaje y no contrato ni suministros', async () => {
  location.hash = `/${GARAJE}/menu`; render(<App />)
  expect(await screen.findByText(/Plaza de garaje · Garaje 5/)).toBeTruthy()
  expect(screen.queryByText('Recibos de alquiler')).toBeNull()
  expect(screen.queryByText('Contrato')).toBeNull()
  expect(screen.queryByText('Agua, luz y gas')).toBeNull()
})
test('la plaza de garaje abre su formulario de precio, fecha e IPC', async () => {
  location.hash = `/${GARAJE}/plaza`; render(<App />)
  expect(await screen.findByText(/Plaza de garaje · Garaje 5/)).toBeTruthy()
  expect(screen.getByLabelText('Fecha de pago')).toBeTruthy()
  expect(screen.getByLabelText('Precio mensual (€)')).toBeTruthy()
  expect(screen.getByLabelText('IPC aplicado (%)')).toBeTruthy()
})
test('Agua, luz y gas guarda los suministros elegidos de la propiedad', async () => {
  location.hash = `/${CASA}/alg`; render(<App />)
  fireEvent.click(await screen.findByLabelText('Agua')); fireEvent.click(screen.getByLabelText('Luz')); fireEvent.click(screen.getByLabelText('Gas'))
  fireEvent.click(screen.getByText('Guardar'))
  await waitFor(() => expect(h.llamadas[h.llamadas.length - 1]).toEqual({ t: 'propiedades', op: 'update', v: { gestiona_agua: true, gestiona_luz: false, gestiona_gas: true } }))
})
test('Agua, luz y gas registra facturas y muestra el resumen mensual', async () => {
  const anio = new Date().getFullYear(), mes = new Date().getMonth()
  h.datos.habitaciones = [
    { id: 'h1', numero: '1', concepto: '', renta: 500, suministros: 60, inq_nombre: 'Inquilina Uno', inq_dni: '', inq_direccion: '', inq_telefono: '' },
    { id: 'h2', numero: '2', concepto: '', renta: 500, suministros: 60, inq_nombre: 'Inquilina Dos', inq_dni: '', inq_direccion: '', inq_telefono: '' },
  ]
  h.datos.facturas_suministros = [{ id: 'f1', propiedad_id: CASA, tipo: 'agua', proveedor: 'EMASESA', anio, mes, importe: 78.75, nota: '' }]
  location.hash = `/${CASA}/alg`; render(<App />)
  expect(await screen.findByText('Facturas de suministros')).toBeTruthy()
  expect(screen.getByText('Cobrado')).toBeTruthy()
  expect(screen.getByText('Total ' + anio)).toBeTruthy()
  expect(screen.getByLabelText('Importe de la factura (€)')).toBeTruthy()
})
test('el contrato se abre vacío, sin valores de ejemplo, y pide los datos que faltan', async () => {
  location.hash = `/${CASA}/contrato`; render(<App />)
  expect(await screen.findByText(/Contrato de arrendamiento · Vivienda de prueba/)).toBeTruthy()
  expect((screen.getByLabelText('Servicios independientes de la renta') as HTMLInputElement).value).toBe('')
  expect((screen.getByLabelText('Nacionalidad del DNI') as HTMLInputElement).value).toBe('')
  expect(screen.getByText(/Falta:/)).toBeTruthy()
  expect((screen.getByText('Descargar contrato PDF') as HTMLButtonElement).disabled).toBe(true)
})
test('Recibos de alquiler mantiene sus pestañas propias', async () => {
  location.hash = `/${CASA}/recibos`; render(<App />)
  expect(await screen.findByText('Recibos')).toBeTruthy()
  expect(screen.getByText('Historial')).toBeTruthy(); expect(screen.getByText('Habitaciones')).toBeTruthy()
  expect(screen.queryByText('Cuadrícula de pagos')).toBeNull()
})
test('la cuadrícula de pagos es una sección aparte y permite marcar una habitación', async () => {
  h.datos.habitaciones = [{ id: 'h1', numero: '1', concepto: '', renta: 500, suministros: 50, inq_nombre: 'Inquilina', inq_dni: '', inq_direccion: '', inq_telefono: '' }]
  location.hash = `/${CASA}/pagos`; render(<App />)
  expect(await screen.findByText(/Cuadrícula de pagos/)).toBeTruthy()
  expect(screen.getByLabelText(/Marcar pagado Habitación 1, enero \d{4}/)).toBeTruthy()
})
