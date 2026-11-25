import type { Propiedad } from '../types'

export const resumenAlg = (p: Propiedad) => {
  const l = [p.gestiona_agua && 'Agua', p.gestiona_luz && 'Luz', p.gestiona_gas && 'Gas'].filter(Boolean)
  return l.length ? 'Gestionas: ' + l.join(', ') : 'Sin configurar'
}
export default function PropiedadMenu({ p, onIr }: { p: Propiedad; onIr: (sec: string) => void }) {
  return (
    <div className="card">
      <h2>{p.tipo === 'casa' ? '🏠' : '🚗'} {p.nombre}</h2>
      <p className="mu">{[p.calle, [p.codigo_postal, p.ciudad].filter(Boolean).join(' '), p.provincia].filter(Boolean).join(' · ') || 'Sin dirección'}</p>
      <p>¿Qué quieres gestionar?</p>
      {p.tipo === 'casa' ? <>
        <button className="opt" onClick={() => onIr('recibos')}><b>Recibos de alquiler</b><span className="mu">Habitaciones, recibos e historial</span></button>
        <button className="opt" onClick={() => onIr('pagos')}><b>Cuadrícula de pagos</b><span className="mu">Consulta y marca los meses pagados de cada habitación</span></button>
        <button className="opt" onClick={() => onIr('contrato')}><b>Contrato</b><span className="mu">Genera el contrato de arrendamiento en PDF</span></button>
        <button className="opt" onClick={() => onIr('alg')}><b>Agua, luz y gas</b><span className="mu">{resumenAlg(p)}</span></button>
      </> : <button className="opt" onClick={() => onIr('plaza')}><b>Plaza de garaje</b><span className="mu">Precio, fecha de pago, IPC y recibo</span></button>}
      <button onClick={() => onIr('editar')}>Editar datos de la propiedad</button>
    </div>
  )
}
