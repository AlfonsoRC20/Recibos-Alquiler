import { jsPDF } from 'jspdf'
import {
  MESES, NOMBRE_SUMINISTRO,
  type FacturaSuministro, type Habitacion, type Perfil, type Propiedad, type TipoSuministro,
} from '../types'

const eur = (n: number) => n.toFixed(2).replace('.', ',') + ' €'
const redondo = (n: number) => Math.round(n * 100) / 100
const fecha = (f?: string | null) => (f ? f.split('-').reverse().join('/') : '—')
const limpiar = (s: string) => s.replace(/[\\/:*?"<>|]/g, '')

/** Suma de las facturas reales del mes. */
export const totalFacturas = (facturas: FacturaSuministro[]) =>
  redondo(facturas.reduce((s, f) => s + Number(f.importe || 0), 0))

/** Lo que se cobra a los inquilinos por el concepto «suministros» de sus fichas. */
export const totalCobrado = (habs: Habitacion[]) =>
  redondo(habs.reduce((s, h) => s + Number(h.suministros || 0), 0))

/** Diferencia entre lo cobrado y la factura real: negativa = la pagas tú. */
export const diferenciaSuministros = (facturas: FacturaSuministro[], habs: Habitacion[]) =>
  redondo(totalCobrado(habs) - totalFacturas(facturas))

export const nombreArchivoSuministros = (p: Propiedad, anio: number, mes: number) =>
  `${anio} ${String(mes + 1).padStart(2, '0')} Suministros ${limpiar(p.nombre)}.pdf`

export type ResumenSuministros = { totalFacturas: number; totalCobrado: number; diferencia: number }
export const resumenMensual = (facturas: FacturaSuministro[], habs: Habitacion[]): ResumenSuministros => ({
  totalFacturas: totalFacturas(facturas), totalCobrado: totalCobrado(habs),
  diferencia: diferenciaSuministros(facturas, habs),
})

export function generarResumenSuministros(
  a: Perfil, p: Propiedad, habs: Habitacion[], facturas: FacturaSuministro[],
  tipos: TipoSuministro[], anio: number, mes: number,
) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const L = 45, W = 505, FIN = L + W
  const AZ: [number, number, number] = [221, 231, 243], AM: [number, number, number] = [184, 204, 228]
  const { totalFacturas: totF, totalCobrado: totC, diferencia } = resumenMensual(facturas, habs)
  let y = 0

  const t = (s: string | number, x: number, yy: number, st = 'normal', z = 9, al?: 'right' | 'center') => {
    doc.setFont('helvetica', st); doc.setFontSize(z); doc.setTextColor(30, 30, 30)
    doc.text(String(s), x, yy, al ? { align: al } : undefined)
  }
  const box = (x: number, yy: number, w: number, hh: number, c: [number, number, number]) => {
    doc.setFillColor(...c); doc.rect(x, yy, w, hh, 'F')
  }
  const linea = (yy: number) => { doc.setDrawColor(184, 204, 228); doc.line(L + 4, yy, FIN - 4, yy) }
  const salto = (necesita: number) => {
    if (y + necesita <= 760) return
    doc.addPage(); y = 50
    t('Resumen de suministros (continuación)', L + 4, y, 'bold', 11)
    y += 16
  }

  box(L, 45, W, 24, AM)
  doc.setTextColor(47, 95, 167); doc.setFont('helvetica', 'bold'); doc.setFontSize(14)
  doc.text('AGUA, LUZ Y GAS · RESUMEN MENSUAL', L + 4, 61)
  t(`${MESES[mes]} ${anio}`, FIN - 8, 61, 'bold', 10, 'right')

  box(L, 80, W, 16, AM); t('Arrendador/a:', L + 4, 91, 'bold'); t('Vivienda:', L + W / 2 + 4, 91, 'bold')
  box(L, 96, W, 52, AZ)
  t('Nombre:', L + 4, 113, 'bold'); t(a.nombre, L + 70, 113, 'italic')
  t('DNI:', L + 4, 130, 'bold'); t(a.dni, L + 70, 130, 'italic')
  t('Teléfono:', L + 4, 147, 'bold'); t(a.telefono, L + 70, 147, 'italic')
  t('Vivienda:', L + W / 2 + 4, 113, 'bold'); t(p.nombre, L + W / 2 + 70, 113, 'italic')
  t('Dirección:', L + W / 2 + 4, 130, 'bold')
  t([p.calle, [p.codigo_postal, p.ciudad].filter(Boolean).join(' '), p.provincia].filter(Boolean).join(' · ') || 'Sin dirección',
    L + W / 2 + 70, 130, 'italic', 8)
  t('Municipio:', L + W / 2 + 4, 147, 'bold'); t(p.ciudad || '—', L + W / 2 + 70, 147, 'italic')

  y = 174
  t('Facturas del mes', L + 4, y, 'bold', 11)
  y += 10
  box(L, y, W, 18, AM)
  t('Suministro', L + 4, y + 12, 'bold', 8)
  t('Proveedor', L + 72, y + 12, 'bold', 8)
  t('Periodo', L + 192, y + 12, 'bold', 8)
  t('Notificada', L + 306, y + 12, 'bold', 8)
  t('Cobro', L + 372, y + 12, 'bold', 8)
  t('Importe', FIN - 8, y + 12, 'bold', 8, 'right')
  y += 18

  const tiposMostrar = [...new Set<TipoSuministro>([...tipos, ...facturas.map(f => f.tipo)])]
  const orden: TipoSuministro[] = ['agua', 'luz', 'gas']
  tiposMostrar.sort((x, z) => orden.indexOf(x) - orden.indexOf(z))
  for (const tipo of tiposMostrar) {
    salto(24)
    const f = facturas.find(x => x.tipo === tipo)
    box(L, y, W, 22, AZ)
    t(NOMBRE_SUMINISTRO[tipo], L + 4, y + 14, 'bold')
    t(f?.proveedor || 'Sin factura registrada', L + 72, y + 14, f ? 'normal' : 'italic', 8)
    t(f ? `${fecha(f.periodo_desde)} – ${fecha(f.periodo_hasta)}` : '—', L + 192, y + 14, 'normal', 8)
    t(f ? fecha(f.fecha_notificacion) : '—', L + 306, y + 14, 'normal', 8)
    t(f ? fecha(f.fecha_cobro) : '—', L + 372, y + 14, 'normal', 8)
    t(f ? eur(Number(f.importe)) : '—', FIN - 8, y + 14, 'bold', 9, 'right')
    y += 22
  }
  salto(24)
  t('Total facturas', FIN - 150, y + 14, 'bold', 10)
  t(eur(totF), FIN - 8, y + 14, 'bold', 11, 'right')
  y += 24; linea(y); y += 8

  t('Cobrado a los inquilinos', L + 4, y + 8, 'bold', 11)
  y += 16
  box(L, y, W, 18, AM)
  t('Habitación', L + 4, y + 12, 'bold', 8); t('Inquilino/a', L + 90, y + 12, 'bold', 8)
  t('Suministros', FIN - 8, y + 12, 'bold', 8, 'right')
  y += 18
  if (habs.length === 0) {
    box(L, y, W, 20, AZ); t('No hay habitaciones dadas de alta en esta vivienda.', L + 4, y + 13, 'italic', 9)
    y += 20
  } else {
    for (const h of habs) {
      salto(22)
      box(L, y, W, 20, AZ)
      t('Hab. ' + h.numero, L + 4, y + 13, 'bold')
      t(h.inq_nombre || '—', L + 90, y + 13)
      t(eur(Number(h.suministros || 0)), FIN - 8, y + 13, 'normal', 9, 'right')
      y += 20
    }
  }
  salto(22)
  t('Total cobrado', FIN - 150, y + 13, 'bold', 10)
  t(eur(totC), FIN - 8, y + 13, 'bold', 11, 'right')
  y += 22; linea(y); y += 10

  const color: [number, number, number] = diferencia < 0 ? [192, 57, 43] : diferencia > 0 ? [46, 125, 50] : [30, 30, 30]
  doc.setTextColor(...color); doc.setFont('helvetica', 'bold'); doc.setFontSize(12)
  doc.text('Diferencia (cobrado − facturas): ' + (diferencia > 0 ? '+' : '') + eur(diferencia), L + 4, y + 8)
  y += 24
  doc.setTextColor(93, 107, 130); doc.setFont('helvetica', 'italic'); doc.setFontSize(8)
  doc.text(doc.splitTextToSize('Este resumen compara las facturas reales de las compañías con la cantidad fija de suministros que figura en la ficha de cada habitación. Una diferencia negativa indica que la vivienda paga más de lo que se repercute a los inquilinos.', W - 8), L + 4, y + 8)
  t('Documento generado desde la aplicación de gestión de alquileres.', L + 4, 800, 'normal', 7)
  t(p.nombre, FIN - 8, 800, 'normal', 7, 'right')

  doc.save(nombreArchivoSuministros(p, anio, mes))
}
