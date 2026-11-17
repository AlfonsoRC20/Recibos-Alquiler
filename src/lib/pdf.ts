import { jsPDF } from 'jspdf'
import { letras } from './letras'
import { MESES, type Habitacion, type Perfil } from '../types'

export type DatosRecibo = { fecha: string; mes: number; anio: number; renta: number; suministros: number; numeroRecibo?: string }
const eur = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(2).replace('.', ',')) + ' €'
const eur2 = (n: number) => n.toFixed(2).replace('.', ',') + ' €'
export const nombreArchivo = (h: Habitacion, d: DatosRecibo) =>
  `${d.anio} ${String(d.mes + 1).padStart(2, '0')} Alquiler Habitación ${h.numero}.pdf`

export function generarRecibo(a: Perfil, h: Habitacion, d: DatosRecibo) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const L = 45, W = 505, AZ: [number, number, number] = [221, 231, 243], AM: [number, number, number] = [184, 204, 228]
  const total = d.renta + d.suministros
  const ult = new Date(d.anio, d.mes + 1, 0).getDate()
  const mes = MESES[d.mes]
  const t = (s: string | number, x: number, y: number, st = 'normal', z = 9, al?: 'right' | 'center') => {
    doc.setFont('helvetica', st); doc.setFontSize(z); doc.setTextColor(30, 30, 30)
    doc.text(String(s), x, y, al ? { align: al } : undefined)
  }
  const box = (x: number, y: number, w: number, hh: number, c: [number, number, number]) => { doc.setFillColor(...c); doc.rect(x, y, w, hh, 'F') }
  const lin = (s: string, x: number, y: number) => { doc.setFont('helvetica', 'italic'); doc.setFontSize(9); doc.text(doc.splitTextToSize(s, 150), x, y) }
  box(L, 45, W, 22, AM); doc.setTextColor(47, 95, 167); doc.setFont('helvetica', 'bold'); doc.setFontSize(14); doc.text('RECIBO DE ALQUILER', L + 4, 61)
  t(d.numeroRecibo ? 'Nº ' + d.numeroRecibo : d.anio, L + W - 8, 60, 'bold', 10, 'right')
  box(L, 80, W, 16, AM); t('Recibido de:', L + 4, 91, 'bold'); t('Recibido por:', L + W / 2 + 4, 91, 'bold')
  box(L, 102, W, 110, AZ)
  t('Arrendataria:', L + 4, 120, 'bold'); t(h.inq_nombre, L + 90, 120, 'bolditalic', 10)
  t('Arrendadora:', L + W / 2 + 4, 120, 'bold'); t(a.nombre, L + W / 2 + 90, 120, 'italic')
  t('DNI:', L + 4, 145, 'bold'); t(h.inq_dni, L + 90, 145, 'italic')
  t('DNI:', L + W / 2 + 4, 145, 'bold'); t(a.dni, L + W / 2 + 90, 145, 'italic')
  t('Dirección:', L + 4, 160, 'bold'); t('Dirección:', L + W / 2 + 4, 160, 'bold')
  lin(h.inq_direccion, L + 90, 172); lin(a.direccion, L + W / 2 + 90, 172)
  t('Teléfono:', L + 4, 200, 'bold'); t(h.inq_telefono, L + 90, 200, 'italic')
  t('Teléfono:', L + W / 2 + 4, 200, 'bold'); t(a.telefono, L + W / 2 + 90, 200, 'italic')
  box(L, 222, W, 50, AZ)
  t('Cantidad renta:', L + 4, 238, 'bold'); t(eur(d.renta), L + 150, 238, 'bolditalic', 10, 'right'); t(letras(d.renta), L + 158, 238)
  t('Suministros:', L + 4, 256, 'bold'); t(eur(d.suministros), L + 150, 256, 'bolditalic', 10, 'right'); t(letras(d.suministros), L + 158, 256)
  t('Total:', L + 250, 256); t(eur(total), L + 300, 256, 'bold', 11); t(letras(total), L + W / 2 + 4, 266, 'bold')
  box(L, 290, W, 16, AM); t('Concepto:', L + 4, 301, 'bold'); t('HAB Nº', L + W - 6, 301, 'bold', 9, 'right')
  box(L, 306, W, 18, AZ); t(h.concepto, L + 10, 319, 'italic'); t(h.numero, L + W - 20, 319, 'normal', 9, 'center')
  box(L, 338, W, 20, AZ); t('Durante el período:', L + 60, 352, 'bold')
  t(`01 de ${mes} de ${d.anio} a ${ult} de ${mes} de ${d.anio}`, L + 175, 352, 'italic', 8); t(mes, L + W - 8, 352, 'bold', 11, 'right')
  doc.setDrawColor(40, 40, 40); doc.rect(L, 372, W, 22); box(L + W - 110, 373, 109, 20, [225, 236, 200])
  t('Método de Pago:', L + 4, 387, 'bold'); t('Transferencia bancaria.', L + 85, 387, 'italic')
  t('Fecha de pago:', L + 240, 387, 'bold'); t(d.fecha.split('-').reverse().join('/'), L + 345, 387); t(eur2(total), L + W - 6, 387, 'bold', 11, 'right')
  doc.save(nombreArchivo(h, d))
}
