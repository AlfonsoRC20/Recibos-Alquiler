import { jsPDF } from 'jspdf'
import { letras } from './letras'
import { MESES } from '../types'

export type DatosContrato = {
  lugar: string; fechaContrato: string                                   // fechas en formato AAAA-MM-DD
  arrendador: { nombre: string; dni: string; domicilio: string; movil: string; iban: string; banco: string }
  arrendataria: { trato: 'Dña.' | 'D.'; nombre: string; nacionalidad: string; dni: string; domicilio: string; movil: string }
  vivienda: { calle: string; ciudad: string; numHabitaciones: number }
  habitacion: { descripcion: string; numero: string }
  inicio: string; fin: string
  renta: number; suministros: number
  servicios: string; incluidos: string
  fechaReserva: string; reserva: number
  inventario: string | null
}

const fmt = new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
export const eurC = (n: number) => fmt.format(n)
const partes = (iso: string) => iso.split('-').map(Number)
export const fechaLarga = (iso: string) => { const [y, m, d] = partes(iso); return `${d} de ${MESES[m - 1]} de ${y}` }
export const diaMes = (iso: string) => { const [, m, d] = partes(iso); return `${d} de ${MESES[m - 1]}` }
const NUM = ['cero', 'una', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez']

type Run = { t: string; b?: boolean }
export type Bloque = { runs: Run[]; align?: 'left' | 'center' | 'justify'; size?: number; before?: number; after?: number }
const rich = (s: string): Run[] => s.split('**').map((t, i) => ({ t, b: i % 2 === 1 })).filter(r => r.t !== '')
const J = (s: string, after = 8): Bloque => ({ runs: rich(s), align: 'justify', after })
const C = (s: string, size = 10, after = 8): Bloque => ({ runs: rich(s), align: 'center', size, after })
export const textoDe = (bs: Bloque[]) => bs.map(b => b.runs.map(r => r.t).join('')).join('\n')

export function bloques(d: DatosContrato, folios: number): Bloque[] {
  const a = d.arrendador, t = d.arrendataria, total = d.renta + d.suministros
  const mesInicio = MESES[partes(d.inicio)[1] - 1], anioInicio = partes(d.inicio)[0]
  const fem = t.trato === 'Dña.', sumi = `${eurC(d.suministros)} €`
  return [
    C('**CONTRATO DE ARRENDAMIENTO DE VIVIENDA AMUEBLADA**', 13, 14),
    C(`En la ciudad de ${d.lugar}, a ${fechaLarga(d.fechaContrato)}.`, 10, 12),
    C('**SE REUNEN:**', 10, 10),
    J(`**DE UNA PARTE:** Dña. ${a.nombre}, mayor de edad, con DNI nº ${a.dni}, con domicilio a efecto de notificaciones en: ${a.domicilio} y móvil: ${a.movil}, de ahora en adelante, La parte ARRENDADORA.`),
    J(`**Y DE OTRA:** ${t.trato} ${t.nombre} con Dni ${t.nacionalidad}: ${t.dni}, con domicilio a efecto de notificaciones en: ${t.domicilio} y móvil ${t.movil} de ahora en adelante, La parte ARRENDATARIA.`, 12),
    C('**EXPONEN:**', 10, 8),
    J('Que reconociéndose mutuamente la capacidad legal necesaria para otorgar el presente CONTRATO DE ARRENDAMIENTO DE VIVIENDA AMUEBLADA, ambas partes lo llevan a efecto en este acto, con sujeción a las siguientes:', 10),
    C('**CONDICIONES:**', 10, 8),
    J(`**PRIMERA.- OBJETO:** Es objeto de este contrato el arrendamiento de una de las ${NUM[d.vivienda.numHabitaciones] ?? d.vivienda.numHabitaciones} habitaciones que Dña. ${a.nombre}, arrendadora, es propietaria en pleno dominio de la vivienda situada en ${d.vivienda.ciudad}, ${d.vivienda.calle}, manifestando expresamente que la misma cumple todos los requisitos y condiciones necesarias de habitabilidad para satisfacer las necesidades de vivienda, sin que quepa destinarla a cualquier otro uso.`),
    C(`**${d.habitacion.descripcion} - Habitación nº ${d.habitacion.numero}**`, 11, 8),
    J(`Son objeto igualmente del presente arrendamiento cuantos elementos de mobiliario y enseres se contienen en la vivienda que quedan relacionados en inventario que, suscrito por la interviniente, se une a este contrato formando parte del mismo, manifestando expresamente ${fem ? 'la inquilina' : 'el inquilino'}, que recibe todo ello en perfectas condiciones de conservación y uso comprometiéndose a reintegrarlo en igual estado a la finalización del contrato, salvo lo que hubiese perecido o se hubiera menoscabado por el tiempo o por causa inevitable.`),
    J('**SEGUNDA.- DESTINO:** la habitación será destinada única y exclusivamente a vivienda de la parte arrendataria, quedando prohibido su uso para cualquier otra actividad.'),
    J(`**TERCERA.- DURACIÓN:** La duración del presente contrato será desde el **${diaMes(d.inicio)}**, del presente año ${anioInicio}, hasta el **${fechaLarga(d.fin)}**.`),
    J('Este contrato se formaliza conforme a la ley 29/1994 de 24 de Noviembre de 1994 publicada en el BOE nº 382 de fecha 25 de Noviembre de 1994 y con entrada en vigor el 1 de Enero de 1995.'),
    J('Si el arrendatario se propusiera resolver este contrato antes de finalizar el plazo previsto, deberá notificarlo por escrito al arrendador, con al menos **UN mes de antelación**, devolviendo el inmueble al arrendador en buen estado de conservación, **perdiendo la totalidad de la fianza acordada.**'),
    J(`**CUARTA.- PRECIO:** El precio de la renta se estipula en la cantidad de **${eurC(d.renta)} € (${letras(d.renta).toUpperCase()})** mensuales. La renta convenida deberá pagarse los **PRIMEROS 5 días** de cada mes durante toda la duración del presente contrato.${d.incluidos.trim() ? ` En la renta pactada se incluyen los gastos de: ${d.incluidos.trim()}.` : ''}`, 4),
    J(`**Los gastos por servicios de:** ${d.servicios} serán independientes de la renta, estipulados por una cantidad de **${sumi} mensuales**, si el montante de gastos excediera de los ${sumi} por persona, se cobrará aparte, justificando con facturas la parte arrendadora tal diferencia.`),
    J(`La **Renta más los Gastos** acordados, serán abonados mediante transferencia bancaria en el número de cuenta que Dña. ${a.nombre} tiene abierta en la Entidad Bancaria ${a.banco} en la cuenta número:`, 6),
    C(`**IBAN   ${a.iban}**`, 10, 10),
    J('**QUINTA.- ACTUALIZACIÓN:** Si finalizado el contrato, las partes acordaran prorrogar el contrato de arrendamiento, éste se prorrogará por otros 5 meses más. La parte arrendataria deberá notificar a la parte arrendadora, mediante conducto fehaciente, la continuidad del arrendamiento por otro periodo más con al menos 2 meses de preaviso.', 6),
    J('La renta pactada será actualizada (al transcurso de un año de este contrato) aplicándole la variación de doce meses del Índice General de Precios al Consumo u organismo que lo sustituya, tomando como referencia el último índice publicado y como base la renta vigente en el momento de la actualización.'),
    J('**SEXTA.- OBRAS Y MANTENIMIENTO:** Los arrendatarios se obligan a conservar y cuidar la vivienda arrendada con la diligencia debida, y a mantener el buen uso de la misma, a fin de que se encuentre siempre en perfectas condiciones de uso y disfrute, quedando prohibida la organización de fiestas, actividades molestas, insalubres, nocivas, peligrosas, ilícitas o cualquier otra actividad que perturbe la convivencia de los vecinos.', 6),
    J('La parte arrendataria no podrá realizar obra alguna sin autorización previa y escrita de la parte arrendadora.', 6),
    J('El funcionamiento de los electrodomésticos y la reparación de los mismos, correrán a cargo de la parte señalada por la ley de arrendamientos urbanos. Dichos gastos ocasionados se repartirán entre las partes según ley.', 4),
    J('**1/** Los desperfectos, roturas, mal funcionamiento de algún electrodoméstico o mueble de la vivienda, por el simple uso diario de los mismos, correrán a cargo de la parte arrendataria.', 4),
    J('**2/** El NO funcionamiento de electrodomésticos, la imposibilidad del uso de los elementos básicos de la vivienda, por razones no achacables a la parte arrendataria, correrán a cargo de la parte arrendadora.'),
    J('**SÉPTIMA.- CESION O SUBARRIENDO:** Queda expresamente prohibido ceder total o parcialmente el uso de la vivienda, así como traspasarla o subarrendarla.'),
    J('**OCTAVA: LIMPIEZA:** en el caso pactar limpieza con el resto de inquilinas, la parte arrendataria autoriza a la parte arrendadora a la limpieza mensual de la vivienda, permitiendo esta el acceso a la misma en los días de limpieza acordados.'),
    J(`**NOVENA.- PAGO y FIANZA:** se recibe como reserva de alquiler el ${fechaLarga(d.fechaReserva)} **un total de ${eurC(d.reserva)}€ (${letras(d.reserva)})** en concepto de FIANZA; que perdería si no se incorporase en ${mesInicio}, donde abonará el mes y los suministros, un total de **${eurC(total)}€ (${letras(total)})** que se harán mensualmente.`, 6),
    J('La fianza NO podrá ser enjugada en renta y será destinada única y exclusivamente a responder de las obligaciones contraídas por el arrendatario en concepto de contrato. La fianza se devolverá durante los 45 días desde la salida de la vivienda, una vez entregadas las llaves e inspeccionada la vivienda, tras comprobar que se encuentra limpia, que no se ha producido ningún desperfecto en la misma. De la fianza se descontarán 60€ para la limpieza final después del check out.'),
    J('**DÉCIMA.-** La falta de pago de una mensualidad, o de cualquier otro incumplimiento de lo pactado dará lugar a la rescisión del contrato, debiendo dejar el inquilino la habitación libre antes de que finalice el mes NO abonado.'),
    J(`**UNDÉCIMA.-** Para cualquier diferencia sobre los términos de este contrato las partes con renuncia expresa a cualquier otro fuero que pudiera corresponderle se someten a los juzgados y tribunales de ${d.lugar}.`),
    J(`Y manifestando su consentimiento, cumpliendo de buena fe y estando de acuerdo con todo lo expuesto anteriormente, firma el presente contrato de arrendamiento, uno para la parte arrendadora y uno para la parte arrendataria, constando cada ejemplar de ${folios} folios por una sola cara${d.inventario ? ' junto con inventario' : ''} y a un solo efecto, en el lugar y fecha indicados en el encabezamiento.`, 4),
  ]
}

function pasada(d: DatosContrato, folios: number): jsPDF {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const PW = doc.internal.pageSize.getWidth(), PH = doc.internal.pageSize.getHeight()
  const M = 56, W = PW - 2 * M, TOP = 62, BOT = PH - 62
  let y = TOP
  type Pieza = { t: string; b: boolean; w: number }
  const palabras = (runs: Run[], size: number) => {
    const out: Pieza[][] = []; let cur: Pieza[] | null = null; let espacio = true
    for (const r of runs) {
      doc.setFont('helvetica', r.b ? 'bold' : 'normal'); doc.setFontSize(size)
      for (const parte of r.t.split(/(\s+)/)) {
        if (parte === '') continue
        if (/^\s+$/.test(parte)) { espacio = true; continue }
        const p = { t: parte, b: !!r.b, w: doc.getTextWidth(parte) }
        if (espacio || !cur) { cur = [p]; out.push(cur) } else cur.push(p)
        espacio = false
      }
    }
    return out
  }
  const bloque = (b: Bloque) => {
    const size = b.size ?? 10, lh = size * 1.42
    y += b.before ?? 0
    const pal = palabras(b.runs, size)
    doc.setFont('helvetica', 'normal'); doc.setFontSize(size)
    const sp = doc.getTextWidth(' ')
    const lineas: Pieza[][][] = []; let linea: Pieza[][] = [], ancho = 0
    for (const w of pal) {
      const wa = w.reduce((s, p) => s + p.w, 0)
      if (linea.length && ancho + sp + wa > W) { lineas.push(linea); linea = [w]; ancho = wa } else { ancho += (linea.length ? sp : 0) + wa; linea.push(w) }
    }
    if (linea.length) lineas.push(linea)
    lineas.forEach((l, i) => {
      if (y + lh > BOT) { doc.addPage(); y = TOP }
      const aw = l.reduce((s, w) => s + w.reduce((q, p) => q + p.w, 0), 0), huecos = l.length - 1
      let gap = sp, x = M
      if (b.align === 'justify' && i < lineas.length - 1 && huecos > 0) gap = (W - aw) / huecos
      else if (b.align === 'center') x = M + (W - (aw + huecos * sp)) / 2
      for (const w of l) { for (const p of w) { doc.setFont('helvetica', p.b ? 'bold' : 'normal'); doc.setFontSize(size); doc.text(p.t, x, y + size); x += p.w } x += gap }
      y += lh
    })
    y += b.after ?? 8
  }
  bloques(d, folios).forEach(bloque)
  // Firmas
  if (y + 190 > BOT) { doc.addPage(); y = TOP }
  y += 20
  const t = d.arrendataria
  bloque({ runs: rich('**Parte Arrendadora:**'), after: 4 })
  bloque({ runs: rich(`Dña. ${d.arrendador.nombre}.`), after: 70 })
  bloque({ runs: rich('**Parte Arrendataria:**'), after: 4 })
  bloque({ runs: rich(`${t.trato === 'Dña.' ? 'Sra.' : 'Sr.'} ${t.nombre}`), after: 0 })
  // Inventario (página aparte)
  if (d.inventario) {
    doc.addPage(); y = TOP
    doc.setDrawColor(40); doc.rect(M, y, W, 22)
    doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.text('INVENTARIO DE BIENES MUEBLES Y ENSERES', M + 6, y + 15)
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.text(`${d.lugar}, a ${fechaLarga(d.fechaContrato)}`, M + W - 6, y + 15, { align: 'right' })
    y += 38
    bloque(C(`**${d.vivienda.calle.toUpperCase()}**`, 10, 12))
    for (const l of d.inventario.split('\n')) {
      if (l.trim() === '') { y += 6; continue }
      const h = l.startsWith('# ')
      bloque({ runs: [{ t: h ? l.slice(2) : l, b: h }], align: 'left', size: 9.5, before: h ? 6 : 0, after: 2 })
    }
  }
  const n = doc.getNumberOfPages()
  for (let i = 1; i <= n; i++) { doc.setPage(i); doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.text(`Página ${i} de ${n}`, PW / 2, PH - 34, { align: 'center' }) }
  return doc
}

/** Genera el contrato en PDF. Se hace en dos pasadas para escribir en el texto el nº real de folios. */
export function generarContrato(d: DatosContrato): jsPDF { return pasada(d, pasada(d, 0).getNumberOfPages()) }

export function nombreContrato(d: DatosContrato, propiedad: string) {
  const primer = d.arrendataria.nombre.trim().split(/\s+/)[0] ?? ''
  return `${d.inicio.split('-').join(' ')} ARRENDAMIENTO DE VIVIENDA ${propiedad} ${primer} Habitación ${d.habitacion.numero}.pdf`.replace(/[\\/:*?"<>|]/g, '')
}

export const INVENTARIO_EJEMPLO = `# AIRE ACONDICIONADO: nuevo en 2015 y exterior en 2018 (3.700 €)
# COCINA COMPLETA AMUEBLADA con electrodomésticos:
Frigorífico Bosch (nuevo de octubre de 2022): 530 €
Congelador de cajones
Lavadora Bosch (nueva de 02/05/2014): 349 €
Lavavajillas, horno, vitrocerámica, campana y microondas
Termo (nuevo de septiembre de 2023): 1.086 €
Mesa de cocina tablero y patas (21,95 + 17,95): 39,90 € y 4 sillas
# SALÓN
Estantería Enetri (IKEA): 49,95 €
Mesa comedor Bjursta Mesco (IKEA): 298 €
6 sillas de comedor (IKEA): 69 x 6 = 414 €
Aparador (IKEA) de 6 huecos más cajón de tela negro
2 mesas de TV
2 sillones Pello Siln Holm (IKEA) a 25 €: 50 €
Sofá azul chaise-longue: 900 €
Televisión OKI de 32'' (Carrefour 2010): 299 €
# DORMITORIO (revisa y sustituye por el de esta habitación)
Cama de 135 cm (somier y colchón), 4 almohadas, funda de colchón y juego de cama completo
Edredón y fundas nórdicas, cajonera interior ropero, cortinas y perchas
Cómoda y 2 mesitas de noche, mesa de estudio, balda de pared, silla giratoria y papelera
# ENTRADA
Mueble de entrada, balda, perchero, papelera paragüero, caja tapa fusibles
Dos tendederos portátiles, 3 ventiladores de pie, escalera de 3 peldaños
# MENAJE
Batidora Taurus, tostadora Bosch, tabla de planchar y plancha
Platos (llanos, hondos y pequeños), vasos y tazas, cubiertos, sartenes, cazos y ollas
Paños de cocina, cubo de basura y avíos de limpieza (escoba, fregona, recogedor y cubo)`
