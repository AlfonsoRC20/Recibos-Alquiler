export type Perfil = { nombre: string; dni: string; direccion: string; telefono: string; iban?: string; banco?: string }
export type Habitacion = {
  id?: string; propiedad_id?: string; numero: string; concepto: string; renta: number; suministros: number
  inq_nombre: string; inq_dni: string; inq_direccion: string; inq_telefono: string
}
export const MESES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']
export type Recibo = {
  id: string; habitacion_id: string | null; oculto: boolean; numero: string; anio: number; mes: number; fecha_pago: string; estado: 'emitido' | 'anulado'
  hab_numero: string; concepto: string; renta: number; suministros: number
  inq_nombre: string; inq_dni: string; inq_direccion: string; inq_telefono: string
}
export type Propiedad = {
  id: string; tipo: 'casa' | 'garaje'; nombre: string; calle: string; codigo_postal: string; ciudad: string; provincia: string
  gestiona_agua: boolean; gestiona_luz: boolean; gestiona_gas: boolean
}
// Cuadrícula de pagos: una fila por habitación y mes. La ausencia de fila equivale a «no pagado».
export type PagoHabitacion = {
  id?: string; propiedad_id: string; habitacion_id: string; anio: number; mes: number; pagado: boolean; fecha_pago?: string | null
}
// Recibos de una plaza de garaje/aparcamiento: precio, fecha de pago e IPC aplicado.
export type ReciboGaraje = {
  id: string; propiedad_id: string; anio: number; mes: number; fecha_pago: string
  precio: number; ipc: number; concepto: string
}
// Facturas reales de suministros (agua, luz y gas) que llegan a la vivienda.
export type TipoSuministro = 'agua' | 'luz' | 'gas'
export type FacturaSuministro = {
  id?: string; propiedad_id: string; tipo: TipoSuministro; proveedor: string
  anio: number; mes: number; importe: number
  periodo_desde?: string | null; periodo_hasta?: string | null
  fecha_notificacion?: string | null; fecha_cobro?: string | null; nota?: string
}
export const NOMBRE_SUMINISTRO: Record<TipoSuministro, string> = { agua: 'Agua', luz: 'Luz', gas: 'Gas' }
