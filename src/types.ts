export type Perfil = { nombre: string; dni: string; direccion: string; telefono: string }
export type Habitacion = {
  id?: string; numero: string; concepto: string; renta: number; suministros: number
  inq_nombre: string; inq_dni: string; inq_direccion: string; inq_telefono: string
}
export const MESES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']
