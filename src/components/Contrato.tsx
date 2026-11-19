import { useState } from 'react'
import { INVENTARIO_EJEMPLO, eurC, generarContrato, nombreContrato, type DatosContrato } from '../lib/contrato'
import { letras } from '../lib/letras'
import type { Habitacion, Perfil, Propiedad } from '../types'

const hoy = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` }
// Servicios independientes según lo que se gestiona en la propiedad (agua, luz, gas) + Internet.
function serviciosDe(p: Propiedad) {
  const l = [p.gestiona_agua && 'Agua', p.gestiona_luz && 'Electricidad', p.gestiona_gas && 'Gas Natural'].filter(Boolean) as string[]
  return (l.length ? l : ['Electricidad', 'Gas Natural']).join(', ') + ' e Internet'
}
type Form = {
  habId: string; fechaContrato: string; trato: 'Dña.' | 'D.'; nombre: string; nacionalidad: string; dni: string; domicilio: string; movil: string
  descripcion: string; numero: string; inicio: string; fin: string; renta: string; suministros: string
  servicios: string; incluidos: string; fechaReserva: string; reserva: string; incluirInv: boolean; inventario: string
}

export default function Contrato({ perfil, p, habs }: { perfil: Perfil; p: Propiedad; habs: Habitacion[] }) {
  const [f, setF] = useState<Form>({
    habId: '', fechaContrato: hoy(), trato: 'Dña.', nombre: '', nacionalidad: 'italiano', dni: '', domicilio: '', movil: '',
    descripcion: '', numero: '', inicio: '', fin: '', renta: '', suministros: '60', servicios: serviciosDe(p),
    incluidos: (p.gestiona_agua ? '' : 'agua y ') + 'cuotas de comunidad ordinarias y extraordinarias',
    fechaReserva: '', reserva: '', incluirInv: true, inventario: INVENTARIO_EJEMPLO })
  const [msg, setMsg] = useState('')
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF(x => ({ ...x, [k]: v }))
  function elegir(id: string) {
    const h = habs.find(x => x.id === id)
    if (!h) return set('habId', '')
    setF(x => ({ ...x, habId: id, nombre: h.inq_nombre, dni: h.inq_dni, domicilio: h.inq_direccion, movil: h.inq_telefono,
      descripcion: h.concepto, numero: h.numero, renta: String(h.renta), suministros: String(h.suministros), reserva: String(h.renta) }))
  }
  const renta = Number(f.renta), sumi = Number(f.suministros), reserva = Number(f.reserva)
  const faltan = [
    !perfil.nombre && 'tus datos en «Mis datos»', !perfil.iban && 'tu IBAN en «Mis datos»', !f.nombre && 'nombre de la arrendataria', !f.dni && 'DNI de la arrendataria',
    !f.numero && 'número de habitación', !f.inicio && 'fecha de inicio', !f.fin && 'fecha de fin', !f.fechaReserva && 'fecha de la reserva', !(renta > 0) && 'renta'].filter(Boolean) as string[]
  function descargar() {
    const d: DatosContrato = {
      lugar: p.ciudad || 'Sevilla', fechaContrato: f.fechaContrato,
      arrendador: { nombre: perfil.nombre, dni: perfil.dni, domicilio: perfil.direccion, movil: perfil.telefono, iban: perfil.iban ?? '', banco: perfil.banco ?? '' },
      arrendataria: { trato: f.trato, nombre: f.nombre, nacionalidad: f.nacionalidad, dni: f.dni, domicilio: f.domicilio, movil: f.movil },
      vivienda: { calle: p.calle, ciudad: p.ciudad || 'Sevilla', numHabitaciones: Math.max(habs.length, 1) },
      habitacion: { descripcion: f.descripcion, numero: f.numero }, inicio: f.inicio, fin: f.fin, renta, suministros: sumi,
      servicios: f.servicios, incluidos: f.incluidos, fechaReserva: f.fechaReserva, reserva, inventario: f.incluirInv ? f.inventario : null }
    try { generarContrato(d).save(nombreContrato(d, p.nombre)); setMsg('Contrato descargado.') }
    catch (e) { setMsg('No se pudo generar: ' + (e as Error).message) }
  }
  const T = (k: keyof Form, l: string, tipo = 'text') => (<div><label htmlFor={k}>{l}</label><input id={k} type={tipo} step="0.01" value={String(f[k])} onChange={e => set(k, e.target.value as never)} /></div>)
  return (
    <div>
      <div className="card"><h2>Contrato de arrendamiento · {p.nombre}</h2>
        <p className="mu">Elige una habitación para rellenar los datos del inquilino y revisa lo demás. Los campos son los subrayados en tu modelo.</p>
        <label htmlFor="hab">Habitación (opcional: rellena los datos)</label>
        <select id="hab" value={f.habId} onChange={e => elegir(e.target.value)}><option value="">Rellenar a mano…</option>
          {habs.map(h => <option key={h.id} value={h.id}>Hab. {h.numero} · {h.inq_nombre}</option>)}</select>
        {T('fechaContrato', 'Fecha del contrato', 'date')}</div>
      <div className="card"><h2>Arrendataria</h2>
        <label htmlFor="trato">Tratamiento</label><select id="trato" value={f.trato} onChange={e => set('trato', e.target.value as Form['trato'])}><option>Dña.</option><option>D.</option></select>
        {T('nombre', 'Nombre completo')}{T('nacionalidad', 'Nacionalidad del DNI (ej.: italiano)')}{T('dni', 'DNI / documento')}{T('domicilio', 'Domicilio a efecto de notificaciones')}{T('movil', 'Móvil')}</div>
      <div className="card"><h2>Habitación y duración</h2>
        {T('descripcion', 'Descripción de la habitación')}{T('numero', 'Nº de habitación')}
        <div className="row">{T('inicio', 'Inicio', 'date')}{T('fin', 'Fin', 'date')}</div></div>
      <div className="card"><h2>Precio, servicios y fianza</h2>
        <div className="row">{T('renta', 'Renta mensual (€)', 'number')}{T('suministros', 'Suministros mensuales (€)', 'number')}</div>
        {T('servicios', 'Servicios independientes de la renta')}{T('incluidos', 'Gastos incluidos en la renta (vacío para omitir)')}
        <div className="row">{T('fechaReserva', 'Fecha de la reserva', 'date')}{T('reserva', 'Importe reserva / fianza (€)', 'number')}</div>
        {renta > 0 && <p className="mu">Renta: {eurC(renta)} € ({letras(renta)}) · Primer pago: {eurC(renta + sumi)} € ({letras(renta + sumi)})</p>}</div>
      <div className="card"><h2>Inventario</h2>
        <label className="chk"><input type="checkbox" checked={f.incluirInv} onChange={e => set('incluirInv', e.target.checked)} />Incluir inventario en una página aparte</label>
        {f.incluirInv && <><p className="mu">Texto de ejemplo de tu modelo: revísalo. Las líneas que empiezan por «# » salen en negrita.</p>
          <textarea rows={12} value={f.inventario} onChange={e => set('inventario', e.target.value)} /></>}</div>
      <div className="card">
        {faltan.length > 0 && <p className="err">Falta: {faltan.join(', ')}.</p>}
        <p className="mu">{msg}</p>
        <button className="p" disabled={faltan.length > 0} onClick={descargar}>Descargar contrato PDF</button></div>
    </div>
  )
}
