import { useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Propiedad } from '../types'

type Campos = Pick<Propiedad, 'tipo' | 'nombre' | 'calle' | 'codigo_postal' | 'ciudad' | 'provincia'>
const VACIA: Campos = { tipo: 'casa', nombre: '', calle: '', codigo_postal: '', ciudad: '', provincia: '' }

export default function PropiedadForm({ inicial, onGuardada, onCancelar, onEliminada }:
  { inicial?: Propiedad; onGuardada: (id: string) => void; onCancelar?: () => void; onEliminada?: () => void }) {
  const [f, setF] = useState<Campos>(inicial ?? VACIA), [msg, setMsg] = useState(''), [busy, setBusy] = useState(false)
  const set = (k: keyof Campos, v: string) => setF({ ...f, [k]: v })
  async function guardar() {
    setBusy(true); setMsg('')
    if (inicial) {
      const { tipo: _t, ...resto } = f
      const { error } = await supabase.from('propiedades').update(resto).eq('id', inicial.id)
      if (error) setMsg(error.message); else onGuardada(inicial.id)
    } else {
      const { data, error } = await supabase.from('propiedades').insert(f).select('id').single()
      if (error) setMsg(error.message); else onGuardada(data.id)
    }
    setBusy(false)
  }
  async function eliminar() {
    if (!inicial || !confirm(`¿Eliminar la propiedad «${inicial.nombre}»? Solo es posible si no tiene habitaciones.`)) return
    const { error } = await supabase.from('propiedades').delete().eq('id', inicial.id)
    if (error) setMsg(error.code === '23503' ? 'No se puede eliminar: tiene habitaciones (y sus recibos). Bórralas antes.' : error.message)
    else onEliminada?.()
  }
  return (
    <div className="card"><h2>{inicial ? 'Editar propiedad' : 'Nueva propiedad'}</h2>
      <label htmlFor="pt">Tipo</label>
      <select id="pt" value={f.tipo} disabled={!!inicial} onChange={e => set('tipo', e.target.value)}>
        <option value="casa">Casa / vivienda</option><option value="garaje">Garaje</option></select>
      <label htmlFor="pn">Nombre (para reconocerla)</label><input id="pn" value={f.nombre} placeholder="Ej.: Arjona" onChange={e => set('nombre', e.target.value)} />
      <label htmlFor="pc">Calle y número (como irá en el contrato)</label>
      <input id="pc" value={f.calle} placeholder="Ej.: calle Arjona 11 portal B, piso 4º letra B" onChange={e => set('calle', e.target.value)} />
      <div className="row"><div><label htmlFor="pp">Código postal</label><input id="pp" value={f.codigo_postal} onChange={e => set('codigo_postal', e.target.value)} /></div>
        <div><label htmlFor="pi">Ciudad</label><input id="pi" value={f.ciudad} onChange={e => set('ciudad', e.target.value)} /></div></div>
      <label htmlFor="pv">Provincia</label><input id="pv" value={f.provincia} onChange={e => set('provincia', e.target.value)} />
      <p className="err">{msg}</p>
      <button className="p" disabled={busy || !f.nombre.trim()} onClick={guardar}>{inicial ? 'Guardar' : 'Crear propiedad'}</button>{' '}
      {onCancelar && <button onClick={onCancelar}>Cancelar</button>}{' '}
      {inicial && <button onClick={eliminar}>Eliminar propiedad</button>}
    </div>
  )
}
