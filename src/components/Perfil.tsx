import { useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Perfil } from '../types'

const CAMPOS: [keyof Perfil, string][] = [['nombre', 'Nombre completo'], ['dni', 'DNI'], ['direccion', 'Dirección'], ['telefono', 'Teléfono']]
export default function PerfilForm({ perfil, userId, onSaved }: { perfil: Perfil; userId: string; onSaved: () => void }) {
  const [p, setP] = useState(perfil), [msg, setMsg] = useState('')
  async function guardar() {
    const { error } = await supabase.from('perfiles').upsert({ id: userId, ...p })
    setMsg(error ? error.message : 'Guardado.'); if (!error) onSaved()
  }
  return (
    <div className="card"><h2>Tus datos como arrendador/a</h2>
      {CAMPOS.map(([k, l]) => (<div key={k}><label htmlFor={k}>{l}</label><input id={k} value={p[k]} onChange={e => setP({ ...p, [k]: e.target.value })} /></div>))}
      <p className="mu">{msg}</p><button className="p" onClick={guardar}>Guardar</button>
    </div>
  )
}
