import { useState } from 'react'
import Habitaciones from './Habitaciones'
import Historial from './Historial'
import Pagos from './Pagos'
import Recibos from './Recibos'
import type { Habitacion, PagoHabitacion, Perfil, Recibo } from '../types'

type Tab = 'recibos' | 'pagos' | 'historial' | 'habitaciones'
const ETIQUETA: Record<Tab, string> = { recibos: 'Recibos', pagos: 'Pagos', historial: 'Historial', habitaciones: 'Habitaciones' }

export default function SeccionRecibos({ perfil, habs, recs, pagos, propiedadId, onCambio, tabInicial = 'recibos' }:
  { perfil: Perfil; habs: Habitacion[]; recs: Recibo[]; pagos: PagoHabitacion[]; propiedadId: string; onCambio: () => void; tabInicial?: Tab }) {
  const [tab, setTab] = useState<Tab>(tabInicial)
  return (
    <div>
      <nav>{(['recibos', 'pagos', 'historial', 'habitaciones'] as Tab[]).map(t =>
        <button key={t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>{ETIQUETA[t]}</button>)}</nav>
      {tab === 'recibos' && <Recibos perfil={perfil} lista={habs} propiedadId={propiedadId} onEmitido={onCambio} />}
      {tab === 'pagos' && <Pagos perfil={perfil} habs={habs} recs={recs} pagos={pagos} propiedadId={propiedadId} onChange={onCambio} />}
      {tab === 'historial' && <Historial perfil={perfil} lista={recs} onChange={onCambio} />}
      {tab === 'habitaciones' && <Habitaciones lista={habs} propiedadId={propiedadId} onChange={onCambio} />}
    </div>
  )
}
