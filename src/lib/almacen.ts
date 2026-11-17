// Dónde se guarda la sesión: por defecto en sessionStorage (se borra al cerrar la pestaña).
// Solo si el usuario marca «Mantener sesión» se usa localStorage (persiste).
export const CLAVE_RECORDAR = 'recibos:recordar'
type Almacen = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

export function crearAlmacen(local: Almacen, sesion: Almacen) {
  const activo = () => (local.getItem(CLAVE_RECORDAR) === '1' ? local : sesion)
  return {
    getItem: (k: string) => activo().getItem(k),
    setItem: (k: string, v: string) => { activo().setItem(k, v) },
    removeItem: (k: string) => { local.removeItem(k); sesion.removeItem(k) },
  }
}
