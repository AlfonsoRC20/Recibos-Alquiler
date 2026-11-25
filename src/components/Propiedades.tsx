import { useState } from 'react'
import PropiedadForm from './PropiedadForm'
import type { Propiedad } from '../types'

export default function Propiedades({ lista, onAbrir }: { lista: Propiedad[]; onAbrir: (id: string, tipo?: Propiedad['tipo']) => void }) {
  const [creando, setCreando] = useState(false)
  return (
    <div>
      <div className="card">
        <div className="bar"><h2>¿Qué propiedad quieres gestionar?</h2>{!creando && lista.length > 0 && <button className="p" onClick={() => setCreando(true)}>Crear propiedad</button>}</div>
        {lista.length === 0 && !creando && <p className="mu">Aún no tienes ninguna propiedad. Crea la primera (una casa o un garaje).</p>}
        {lista.map(p => (
          <button key={p.id} className="opt" onClick={() => onAbrir(p.id, p.tipo)}>
            <b>{p.tipo === 'casa' ? '🏠' : '🚗'} {p.nombre}</b>
            <span className="mu">{p.tipo === 'casa' ? 'Casa' : 'Garaje'}{p.calle ? ' · ' + p.calle : ''}{p.ciudad ? ', ' + p.ciudad : ''}</span>
          </button>))}
        {lista.length === 0 && !creando && <button className="p" onClick={() => setCreando(true)}>Crear propiedad</button>}
      </div>
      {creando && <PropiedadForm onGuardada={(id, tipo) => { setCreando(false); onAbrir(id, tipo) }} onCancelar={() => setCreando(false)} />}
    </div>
  )
}
