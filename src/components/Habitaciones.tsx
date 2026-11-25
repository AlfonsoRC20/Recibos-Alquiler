import { useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Habitacion } from '../types'

type FormHab = Omit<Habitacion, 'renta' | 'suministros'> & { renta: string; suministros: string }
const VACIA: FormHab = {
  numero: '', concepto: '', renta: '', suministros: '',
  inq_nombre: '', inq_dni: '', inq_direccion: '', inq_telefono: '',
}
const CAMPOS: [keyof FormHab, string, string][] = [
  ['numero', 'Nº de habitación', 'text'], ['concepto', 'Concepto (descripción)', 'text'],
  ['renta', 'Renta mensual (€)', 'number'], ['suministros', 'Suministros (€, opcional)', 'number'],
  ['inq_nombre', 'Inquilino/a', 'text'], ['inq_dni', 'DNI / NIE', 'text'],
  ['inq_direccion', 'Dirección del inquilino/a', 'text'], ['inq_telefono', 'Teléfono', 'text']]

function aForm(h: Habitacion): FormHab {
  return { ...h, renta: String(h.renta), suministros: String(h.suministros) }
}

export default function Habitaciones({ lista, onChange, propiedadId }: { lista: Habitacion[]; onChange: () => void; propiedadId: string }) {
  const [ed, setEd] = useState<FormHab | null>(null), [msg, setMsg] = useState('')
  async function guardar() {
    if (!ed) return
    const renta = ed.renta.trim() === '' ? NaN : Number(ed.renta)
    const suministros = ed.suministros.trim() === '' ? 0 : Number(ed.suministros)
    if (!Number.isFinite(renta) || renta < 0) return setMsg('Indica una renta mensual válida.')
    if (!Number.isFinite(suministros) || suministros < 0) return setMsg('Los suministros no pueden ser negativos.')
    const { id, ...resto } = ed
    const datos = { ...resto, propiedad_id: propiedadId, renta, suministros }
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
          <span><button onClick={() => setEd(aForm(h))}>Editar</button> <button onClick={() => borrar(h)}>Borrar</button></span>
        </div>))}
      {ed && (<div className="item" style={{ display: 'block' }}>
        {CAMPOS.map(([k, l, ty]) => (<div key={k}><label htmlFor={k}>{l}</label>
          <input id={k} type={ty} min={ty === 'number' ? 0 : undefined} step={ty === 'number' ? '0.01' : undefined}
            value={String(ed[k] ?? '')} onChange={e => setEd({ ...ed, [k]: e.target.value } as FormHab)} /></div>))}
        <p className="err">{msg}</p>
        <button className="p" disabled={!ed.numero.trim() || !ed.inq_nombre.trim() || ed.renta.trim() === ''} onClick={guardar}>Guardar</button>{' '}
        <button onClick={() => { setEd(null); setMsg('') }}>Cancelar</button>
      </div>)}
    </div>
  )
}
