import { useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Propiedad } from '../types'

type K = 'gestiona_agua' | 'gestiona_luz' | 'gestiona_gas'
const OPC: [K, string][] = [['gestiona_agua', 'Agua'], ['gestiona_luz', 'Luz'], ['gestiona_gas', 'Gas']]

export default function Alg({ p, onGuardado }: { p: Propiedad; onGuardado: () => void }) {
  const [v, setV] = useState<Record<K, boolean>>({ gestiona_agua: p.gestiona_agua, gestiona_luz: p.gestiona_luz, gestiona_gas: p.gestiona_gas })
  const [msg, setMsg] = useState('')
  if (p.tipo !== 'casa') return <div className="card"><p>Agua, luz y gas solo está disponible para casas, no para garajes.</p></div>
  async function guardar() {
    const { error } = await supabase.from('propiedades').update(v).eq('id', p.id)
    if (error) setMsg(error.message); else { setMsg('Guardado.'); onGuardado() }
  }
  return (
    <div className="card"><h2>Agua, luz y gas · {p.nombre}</h2>
      <p>Marca qué suministros se gestionan en esta propiedad. No todas las viviendas tienen los tres.</p>
      {OPC.map(([k, l]) => (
        <label key={k} className="chk"><input type="checkbox" checked={v[k]} onChange={e => setV({ ...v, [k]: e.target.checked })} />{l}</label>))}
      <p className="mu">{msg}</p>
      <button className="p" onClick={guardar}>Guardar</button>
      <p className="mu">El seguimiento de cada suministro (cobro de la compañía, aviso al inquilino y pago del inquilino) llegará en el siguiente paso.</p>
    </div>
  )
}
