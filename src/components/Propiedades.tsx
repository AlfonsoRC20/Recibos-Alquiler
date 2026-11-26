import { useState } from 'react'
import PropiedadForm from './PropiedadForm'
import type { Propiedad } from '../types'

export default function Propiedades({ lista, onAbrir, onCreada }:
  { lista: Propiedad[]; onAbrir: (id: string, tipo?: Propiedad['tipo']) => void; onCreada: () => void }) {
  const [creando, setCreando] = useState(false)
  // Al crear solo se muestra el formulario, sin la lista de propiedades encima.
  if (creando) return <PropiedadForm onGuardada={() => { setCreando(false); onCreada() }} onCancelar={() => setCreando(false)} />
  return (
    <div className="card">
      <div className="bar"><h2>¿Qué propiedad quieres gestionar?</h2>{lista.length > 0 && <button className="p" onClick={() => setCreando(true)}>Crear propiedad</button>}</div>
      {lista.length === 0 && <p className="mu">Aún no tienes ninguna propiedad. Crea la primera (una casa o un garaje).</p>}
      {lista.map(p => (
        <button key={p.id} className="opt" onClick={() => onAbrir(p.id, p.tipo)}>
          <b>{p.tipo === 'casa' ? '🏠' : '🚗'} {p.nombre}</b>
          <span className="mu">{p.tipo === 'casa' ? 'Casa' : 'Garaje'}{p.calle ? ' · ' + p.calle : ''}{p.ciudad ? ', ' + p.ciudad : ''}</span>
        </button>))}
      {lista.length === 0 && <button className="p" onClick={() => setCreando(true)}>Crear propiedad</button>}
    </div>
  )
}
