import { jsPDF } from 'jspdf'
import { letras } from './letras'
import { MESES, type Perfil, type Propiedad } from '../types'

export type DatosReciboGaraje = {
  fecha: string; mes: number; anio: number; precio: number; ipc: number; concepto?: string
}

const eur = (n: number) => n.toFixed(2).replace('.', ',') + ' €'
/** El IPC se aplica sobre el precio mensual de la plaza. */
export const totalGaraje = (precio: number, ipc: number) => Math.round((precio + precio * ipc / 100) * 100) / 100
const limpiar = (s: string) => s.replace(/[\\/:*?"<>|]/g, '')

export const nombreArchivoGaraje = (p: Propiedad, d: DatosReciboGaraje) =>
  `${d.anio} ${String(d.mes + 1).padStart(2, '0')} Alquiler Plaza de garaje ${limpiar(p.nombre)}.pdf`

export function generarReciboGaraje(a: Perfil, p: Propiedad, d: DatosReciboGaraje) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const L = 45, W = 505
  const AZ: [number, number, number] = [221, 231, 243], AM: [number, number, number] = [184, 204, 228]
  const total = totalGaraje(d.precio, d.ipc)
  const ult = new Date(d.anio, d.mes + 1, 0).getDate()
  const mes = MESES[d.mes]
  const t = (s: string | number, x: number, y: number, st = 'normal', z = 9, al?: 'right' | 'center') => {
    doc.setFont('helvetica', st); doc.setFontSize(z); doc.setTextColor(30, 30, 30)
    doc.text(String(s), x, y, al ? { align: al } : undefined)
  }
  const box = (x: number, y: number, w: number, hh: number, c: [number, number, number]) => { doc.setFillColor(...c); doc.rect(x, y, w, hh, 'F') }
  const parrafo = (s: string, x: number, y: number, ancho: number) => {
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(30, 30, 30)
    doc.text(doc.splitTextToSize(s, ancho), x, y)
  }

  box(L, 45, W, 24, AM)
  doc.setTextColor(47, 95, 167); doc.setFont('helvetica', 'bold'); doc.setFontSize(14)
  doc.text('RECIBO DE ALQUILER · PLAZA DE GARAJE', L + 4, 61)
  t(`${mes} ${d.anio}`, L + W - 8, 61, 'bold', 10, 'right')

  box(L, 82, W, 16, AM); t('Arrendador/a:', L + 4, 93, 'bold'); t('Inmueble:', L + W / 2 + 4, 93, 'bold')
  box(L, 98, W, 96, AZ)
  t('Nombre:', L + 4, 116, 'bold'); t(a.nombre, L + 90, 116, 'italic')
  t('DNI:', L + 4, 134, 'bold'); t(a.dni, L + 90, 134, 'italic')
  t('Dirección:', L + 4, 152, 'bold'); parrafo(a.direccion, L + 90, 152, 150)
  t('Teléfono:', L + 4, 180, 'bold'); t(a.telefono, L + 90, 180, 'italic')
  t('Plaza:', L + W / 2 + 4, 116, 'bold'); t(p.nombre, L + W / 2 + 90, 116, 'italic')
  t('Dirección:', L + W / 2 + 4, 134, 'bold'); parrafo([p.calle, [p.codigo_postal, p.ciudad].filter(Boolean).join(' '), p.provincia].filter(Boolean).join(' · ') || 'Sin dirección', L + W / 2 + 90, 134, 150)

  box(L, 208, W, 56, AZ)
  t('Concepto:', L + 4, 226, 'bold'); t(d.concepto || 'Alquiler de plaza de garaje', L + 90, 226, 'italic')
  t('Periodo:', L + 4, 246, 'bold'); t(`01 de ${mes} de ${d.anio} a ${ult} de ${mes} de ${d.anio}`, L + 90, 246, 'italic')

  box(L, 278, W, 102, AZ)
  t('Precio mensual:', L + 4, 298, 'bold'); t(eur(d.precio), L + W - 8, 298, 'normal', 10, 'right')
  t('IPC aplicado:', L + 4, 320, 'bold'); t(`${d.ipc.toFixed(2).replace('.', ',')} %`, L + W - 8, 320, 'normal', 10, 'right')
  doc.setDrawColor(184, 204, 228); doc.line(L + 4, 332, L + W - 4, 332)
  t('Total a pagar:', L + 4, 352, 'bold', 11); t(eur(total), L + W - 8, 352, 'bold', 11, 'right')
  t(letras(total), L + 4, 368, 'italic', 9)

  box(L, 394, W, 22, AZ)
  t('Método de pago:', L + 4, 409, 'bold'); t('Transferencia bancaria.', L + 95, 409, 'italic')
  if (a.iban) { t('IBAN:', L + 250, 409, 'bold'); t(a.iban, L + 290, 409, 'italic') }
  t('Fecha de pago:', L + 4, 438, 'bold'); t(d.fecha.split('-').reverse().join('/'), L + 95, 438, 'italic')

  doc.setDrawColor(80); doc.line(L, 500, L + 180, 500); doc.line(L + W - 180, 500, L + W, 500)
  t('Firma del arrendador/a', L + 90, 514, 'normal', 8, 'center'); t('Firma del arrendatario/a', L + W - 90, 514, 'normal', 8, 'center')

  doc.save(nombreArchivoGaraje(p, d))
}
