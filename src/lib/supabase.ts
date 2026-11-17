import { createClient } from '@supabase/supabase-js'
import { CLAVE_RECORDAR, crearAlmacen } from './almacen'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
export const configured = Boolean(url && key)

// Borra sesiones guardadas de forma persistente (claves "sb-…") en localStorage.
function purgarPersistente() {
  Object.keys(localStorage).filter(k => k.startsWith('sb-')).forEach(k => localStorage.removeItem(k))
}
// Al arrancar: si el usuario no pidió mantener la sesión, se descartan sesiones antiguas persistentes.
if (typeof window !== 'undefined' && localStorage.getItem(CLAVE_RECORDAR) !== '1') purgarPersistente()

/** Llamar justo antes de iniciar sesión: decide si la sesión persistirá al cerrar la pestaña. */
export function fijarMantenerSesion(si: boolean) {
  if (si) localStorage.setItem(CLAVE_RECORDAR, '1')
  else { localStorage.removeItem(CLAVE_RECORDAR); purgarPersistente() }
}

export const supabase = createClient(url ?? 'http://localhost', key ?? 'sin-configurar', {
  auth: { storage: typeof window !== 'undefined' ? crearAlmacen(window.localStorage, window.sessionStorage) : undefined },
})
