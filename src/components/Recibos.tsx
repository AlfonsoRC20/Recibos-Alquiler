import { useState } from 'react'
import { generarRecibo } from '../lib/pdf'
import { supabase } from '../lib/supabase'
import { MESES, type Habitacion, type Perfil } from '../types'

export default function Recibos({ perfil, lista, propiedadId, onEmitido }:
  { perfil: Perfil; lista: Habitacion[]; propiedadId: string; onEmitido: () => void }) {
  const [sel, setSel] = useState(''), [fecha, setFecha] = useState('')
  const [mes, setMes] = useState<number | ''>(''), [anio, setAnio] = useState<number | ''>('')
  const [renta, setRenta] = useState<number | ''>(''), [sumi, setSumi] = useState<number | ''>(''), [msg, setMsg] = useState('')
  const h = lista.find(x => x.id === sel)
  function elegir(id: string) { setSel(id); const x = lista.find(y => y.id === id); if (x) { setRenta(Number(x.renta)); setSumi(Number(x.suministros)) } }
  function cambiarFecha(f: string) { setFecha(f); if (f) { const [y, m] = f.split('-'); setAnio(+y); setMes(+m - 1) } }
  const [busy, setBusy] = useState(false)
  async function descargar() {
    if (!h || !h.id || !fecha || mes === '' || anio === '' || busy) return
    setBusy(true); setMsg('')
    const datos = { fecha, mes, anio, renta: Number(renta), suministros: sumi === '' ? 0 : Number(sumi) }
    const { data, error } = await supabase.from('recibos').insert({
      habitacion_id: h.id, propiedad_id: h.propiedad_id ?? propiedadId, anio, mes, fecha_pago: fecha, hab_numero: h.numero, concepto: h.concepto,
      renta: datos.renta, suministros: datos.suministros, inq_nombre: h.inq_nombre, inq_dni: h.inq_dni,
      inq_direccion: h.inq_direccion, inq_telefono: h.inq_telefono }).select('numero').single()
    if (error) {
      setMsg(error.code === '23505' ? 'Ya hay un recibo emitido de esta habitación para ese mes. Si te equivocaste, anúlalo en «Historial» y vuelve a emitirlo.' : 'No se pudo guardar el recibo: ' + error.message)
    } else {
      // Al emitir el recibo se marca el mes como pagado en la cuadrícula (puede desmarcarse después).
      const { error: ePago } = await supabase.from('pagos_habitacion').upsert({
        propiedad_id: h.propiedad_id ?? propiedadId, habitacion_id: h.id, anio, mes, pagado: true, fecha_pago: fecha,
      }, { onConflict: 'habitacion_id,anio,mes' })
      const aviso = ePago ? ' No se pudo marcar el mes como pagado: ' + ePago.message : ''
      try { generarRecibo(perfil, h, { ...datos, numeroRecibo: data.numero }); setMsg(`Recibo ${data.numero} guardado y descargado.${aviso}`); onEmitido() }
      catch (e) { setMsg('Recibo guardado, pero falló el PDF: ' + (e as Error).message + '. Descárgalo desde «Historial».' + aviso); onEmitido() }
    }
    setBusy(false)
  }
  if (lista.length === 0) return <div className="card">Primero añade una habitación en la pestaña «Habitaciones».</div>
  return (
    <div className="card"><h2>Generar recibo</h2>
      {!perfil.nombre && <p className="err">Completa tus datos en «Mis datos»: aparecerán como arrendador/a.</p>}
      <label htmlFor="hab">Habitación</label>
      <select id="hab" value={sel} onChange={e => elegir(e.target.value)}><option value="">Elige…</option>
        {lista.map(x => <option key={x.id} value={x.id}>Hab. {x.numero} · {x.inq_nombre}</option>)}</select>
      <label htmlFor="fe">Fecha de pago (Intro o botón para descargar)</label>
      <input id="fe" type="date" value={fecha} onChange={e => cambiarFecha(e.target.value)} onKeyDown={e => e.key === 'Enter' && void descargar()} />
      <div className="row"><div><label htmlFor="me">Mes</label><select id="me" value={mes === '' ? '' : mes} onChange={e => setMes(e.target.value === '' ? '' : +e.target.value)}>
        <option value="">Elige…</option>{MESES.map((m, i) => <option key={m} value={i}>{m}</option>)}</select></div>
        <div><label htmlFor="an">Año</label><input id="an" type="number" min="2000" value={anio === '' ? '' : anio} onChange={e => setAnio(e.target.value === '' ? '' : +e.target.value)} /></div></div>
      <div className="row"><div><label htmlFor="re">Renta (€)</label><input id="re" type="number" min="0" step="0.01" value={renta} onChange={e => setRenta(e.target.value === '' ? '' : +e.target.value)} /></div>
        <div><label htmlFor="su">Suministros (€)</label><input id="su" type="number" min="0" step="0.01" value={sumi} onChange={e => setSumi(e.target.value === '' ? '' : +e.target.value)} /></div></div>
      <p className="mu">{msg}</p>
      <button className="p" disabled={!h || !fecha || mes === '' || anio === '' || renta === '' || busy} onClick={descargar}>Descargar recibo PDF</button>
    </div>
  )
}
