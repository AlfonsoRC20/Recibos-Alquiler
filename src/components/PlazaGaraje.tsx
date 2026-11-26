import { useState } from 'react'
import { generarReciboGaraje, totalGaraje } from '../lib/pdfGaraje'
import { letras } from '../lib/letras'
import { supabase } from '../lib/supabase'
import { MESES, type Perfil, type Propiedad, type ReciboGaraje } from '../types'

const eur = (n: number) => n.toFixed(2).replace('.', ',') + ' €'

export default function PlazaGaraje({ perfil, p, recibos, onCambio, onEditar }:
  { perfil: Perfil; p: Propiedad; recibos: ReciboGaraje[]; onCambio: () => void; onEditar?: () => void }) {
  const [fecha, setFecha] = useState('')
  const [mes, setMes] = useState<number | ''>(''), [anio, setAnio] = useState<number | ''>('')
  const [precio, setPrecio] = useState<number | ''>(''), [ipc, setIpc] = useState<number | ''>('')
  const [msg, setMsg] = useState(''), [busy, setBusy] = useState(false)
  const [tab, setTab] = useState<'emitir' | 'recibos'>('emitir')

  function cambiarFecha(f: string) { setFecha(f); if (f) { const [y, m] = f.split('-'); setAnio(+y); setMes(+m - 1) } }
  const total = precio === '' ? 0 : totalGaraje(Number(precio), ipc === '' ? 0 : Number(ipc))

  async function guardar() {
    if (!fecha || mes === '' || anio === '' || precio === '' || busy) return
    setBusy(true); setMsg('')
    const datos = { fecha, mes, anio, precio: Number(precio), ipc: ipc === '' ? 0 : Number(ipc), concepto: 'Alquiler de plaza de garaje' }
    // La tabla usa fecha_pago; «fecha» solo se usa para el PDF.
    const { error } = await supabase.from('recibos_garaje').insert({
      propiedad_id: p.id, fecha_pago: fecha, mes, anio, precio: datos.precio, ipc: datos.ipc, concepto: datos.concepto,
    }).select('id').single()
    if (error) {
      setMsg(error.code === '23505' ? 'Ya hay un recibo de esta plaza para ese mes. Elimínalo antes de emitir otro.' : 'No se pudo guardar el recibo: ' + error.message)
    } else {
      try { generarReciboGaraje(perfil, p, datos); setMsg('Recibo guardado y descargado.'); onCambio() }
      catch (e) { setMsg('Recibo guardado, pero falló el PDF: ' + (e as Error).message); onCambio() }
    }
    setBusy(false)
  }

  function descargar(r: ReciboGaraje) {
    try {
      generarReciboGaraje(perfil, p, { fecha: r.fecha_pago, mes: r.mes, anio: r.anio, precio: Number(r.precio), ipc: Number(r.ipc), concepto: r.concepto })
      setMsg('')
    } catch (e) { setMsg('No se pudo generar el PDF: ' + (e as Error).message) }
  }

  async function borrar(r: ReciboGaraje) {
    if (!confirm(`¿Eliminar el recibo de ${MESES[r.mes]} ${r.anio}?`)) return
    const { error } = await supabase.from('recibos_garaje').delete().eq('id', r.id)
    if (error) setMsg(error.message); else { setMsg('Recibo eliminado.'); onCambio() }
  }

  return (
    <div>
      <nav>
        <button className={tab === 'emitir' ? 'on' : ''} onClick={() => setTab('emitir')}>Emitir recibo</button>
        <button className={tab === 'recibos' ? 'on' : ''} onClick={() => setTab('recibos')}>Recibos emitidos{recibos.length ? ` (${recibos.length})` : ''}</button>
      </nav>
      <p className="mu">{msg}</p>
      {tab === 'emitir' && <div className="card"><div className="bar"><h2>Plaza de garaje · {p.nombre}</h2>
        {onEditar && <button onClick={onEditar}>Editar propiedad</button>}</div>
        {!perfil.nombre && <p className="err">Completa tus datos en «Mis datos»: aparecerán como arrendador/a.</p>}
        <p className="mu">{p.calle || 'Sin dirección'}{p.ciudad ? `, ${p.ciudad}` : ''}</p>
        <label htmlFor="gf">Fecha de pago</label>
        <input id="gf" type="date" value={fecha} onChange={e => cambiarFecha(e.target.value)} />
        <div className="row"><div><label htmlFor="gm">Mes</label><select id="gm" value={mes === '' ? '' : mes} onChange={e => setMes(e.target.value === '' ? '' : +e.target.value)}>
          <option value="">Elige…</option>{MESES.map((m, i) => <option key={m} value={i}>{m}</option>)}</select></div>
          <div><label htmlFor="ga">Año</label><input id="ga" type="number" min="2000" value={anio === '' ? '' : anio} onChange={e => setAnio(e.target.value === '' ? '' : +e.target.value)} /></div></div>
        <div className="row"><div><label htmlFor="gp">Precio mensual (€)</label>
          <input id="gp" type="number" min="0" step="0.01" value={precio} onChange={e => setPrecio(e.target.value === '' ? '' : +e.target.value)} /></div>
          <div><label htmlFor="gi">IPC aplicado (%)</label>
            <input id="gi" type="number" min="0" step="0.01" value={ipc} onChange={e => setIpc(e.target.value === '' ? '' : +e.target.value)} /></div></div>
        {precio !== '' && <p className="mu">Total del recibo: <b>{eur(total)}</b> · {letras(total)}</p>}
        <p className="mu">El IPC se calcula sobre el precio mensual.</p>
        <button className="p" disabled={!fecha || mes === '' || anio === '' || precio === '' || busy} onClick={guardar}>Guardar y descargar recibo PDF</button>
      </div>}
      {tab === 'recibos' && <div className="card"><h2>Recibos emitidos</h2>
        {recibos.length === 0 && <p className="mu">Aún no has emitido ningún recibo de esta plaza.</p>}
        {recibos.map(r => {
          const t = totalGaraje(Number(r.precio), Number(r.ipc))
          return <div className="item" key={r.id}>
            <span><b>{MESES[r.mes]} {r.anio}</b> · {eur(t)}<br />
              <span className="mu">Precio {eur(Number(r.precio))} · IPC {Number(r.ipc).toFixed(2).replace('.', ',')} % · pagado el {r.fecha_pago.split('-').reverse().join('/')}</span></span>
            <span><button onClick={() => descargar(r)}>PDF</button> <button onClick={() => borrar(r)}>Eliminar</button></span>
          </div>
        })}
      </div>}
    </div>
  )
}
