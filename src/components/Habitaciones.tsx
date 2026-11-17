import { useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Habitacion } from '../types'

const VACIA: Habitacion = { numero: '', concepto: '', renta: 0, suministros: 0, inq_nombre: '', inq_dni: '', inq_direccion: '', inq_telefono: '' }
const CAMPOS: [keyof Habitacion, string, string][] = [
  ['numero', 'Nº de habitación', 'text'], ['concepto', 'Concepto (descripción)', 'text'],
  ['renta', 'Renta mensual (€)', 'number'], ['suministros', 'Suministros (€)', 'number'],
  ['inq_nombre', 'Inquilino/a', 'text'], ['inq_dni', 'DNI / NIE', 'text'],
  ['inq_direccion', 'Dirección del inquilino/a', 'text'], ['inq_telefono', 'Teléfono', 'text']]

export default function Habitaciones({ lista, onChange }: { lista: Habitacion[]; onChange: () => void }) {
  const [ed, setEd] = useState<Habitacion | null>(null), [msg, setMsg] = useState('')
  async function guardar() {
    if (!ed) return
    const { id, ...resto } = ed
    const datos = { ...resto, renta: Number(resto.renta), suministros: Number(resto.suministros) }
    const { error } = id ? await supabase.from('habitaciones').update(datos).eq('id', id) : await supabase.from('habitaciones').insert(datos)
    if (error) return setMsg(error.message)
    setEd(null); setMsg(''); onChange()
  }
  async function borrar(h: Habitacion) {
    if (!h.id || !confirm(`¿Borrar la habitación ${h.numero} y los datos de ${h.inq_nombre}?`)) return
    const { error } = await supabase.from('habitaciones').delete().eq('id', h.id)
    if (error) setMsg(error.message); else onChange()
  }
  return (
    <div className="card">
      <div className="bar"><h2>Habitaciones</h2><button className="p" onClick={() => setEd({ ...VACIA })}>Añadir</button></div>
      {lista.length === 0 && !ed && <p className="mu">Aún no hay habitaciones. Pulsa «Añadir».</p>}
      {lista.map(h => (
        <div className="item" key={h.id}>
          <span><b>Hab. {h.numero}</b> · {h.inq_nombre}<br /><span className="mu">{h.renta} € + {h.suministros} €</span></span>
          <span><button onClick={() => setEd(h)}>Editar</button> <button onClick={() => borrar(h)}>Borrar</button></span>
        </div>))}
      {ed && (<div className="item" style={{ display: 'block' }}>
        {CAMPOS.map(([k, l, ty]) => (<div key={k}><label htmlFor={k}>{l}</label>
          <input id={k} type={ty} step="0.01" value={String(ed[k] ?? '')} onChange={e => setEd({ ...ed, [k]: e.target.value } as Habitacion)} /></div>))}
        <p className="err">{msg}</p>
        <button className="p" disabled={!ed.numero || !ed.inq_nombre} onClick={guardar}>Guardar</button> <button onClick={() => setEd(null)}>Cancelar</button>
      </div>)}
    </div>
  )
}
