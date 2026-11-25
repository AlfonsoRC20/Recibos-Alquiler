import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { MESES, type Habitacion, type PagoHabitacion, type Perfil, type Recibo } from '../types'
import Historial from './Historial'

const hoy = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` }

export default function Pagos({ perfil, habs, recs, pagos, propiedadId, onChange }:
  { perfil: Perfil; habs: Habitacion[]; recs: Recibo[]; pagos: PagoHabitacion[]; propiedadId: string; onChange: () => void }) {
  const ahora = new Date()
  const [anio, setAnio] = useState(ahora.getFullYear())
  const [mesSel, setMesSel] = useState(ahora.getMonth())
  const [msg, setMsg] = useState('')

  // Se considera pagado si existe una marca expresa; si aún no hay fila, se usa el recibo emitido.
  function estaPagado(h: Habitacion, mes: number) {
    if (!h.id) return false
    const p = pagos.find(x => x.habitacion_id === h.id && x.anio === anio && x.mes === mes)
    if (p) return p.pagado
    return recs.some(r => r.estado === 'emitido' && r.habitacion_id === h.id && r.anio === anio && r.mes === mes)
  }

  async function alternar(h: Habitacion, mes: number) {
    if (!h.id) return
    const pagado = estaPagado(h, mes)
    const { error } = await supabase.from('pagos_habitacion').upsert({
      propiedad_id: propiedadId, habitacion_id: h.id, anio, mes, pagado: !pagado, fecha_pago: pagado ? null : hoy(),
    }, { onConflict: 'habitacion_id,anio,mes' })
    if (error) setMsg('No se pudo guardar el pago: ' + error.message)
    else { setMsg(pagado ? `Hab. ${h.numero} · ${MESES[mes]} ${anio} marcado como pendiente.` : `Hab. ${h.numero} · ${MESES[mes]} ${anio} marcado como pagado.`); setMesSel(mes); onChange() }
  }

  if (habs.length === 0) return <div className="card">Primero añade una habitación en la pestaña «Habitaciones».</div>

  return (
    <>
      <div className="card">
        <div className="bar"><h2>Cuadrícula de pagos · {anio}</h2>
          <span><button onClick={() => setAnio(anio - 1)} aria-label="Año anterior">←</button>{' '}
            <button onClick={() => setAnio(ahora.getFullYear())}>Este año</button>{' '}
            <button onClick={() => setAnio(anio + 1)} aria-label="Año siguiente">→</button></span></div>
        <p className="mu">Pulsa un mes de una habitación para marcarlo como pagado o pendiente. Pulsa la cabecera de un mes para ver sus recibos (activos, anulados y quitados).</p>
        <div className="tabla-scroll">
          <table className="pagos">
            <thead><tr><th scope="col">Habitación</th>
              {MESES.map((m, i) => <th key={m} scope="col">
                <button className={mesSel === i ? 'on' : ''} onClick={() => setMesSel(i)} title={`Ver recibos de ${m}`}>{m.slice(0, 3)}</button>
              </th>)}</tr></thead>
            <tbody>{habs.map(h => <tr key={h.id}>
              <th scope="row">Hab. {h.numero}<br /><span className="mu">{h.inq_nombre}</span></th>
              {MESES.map((m, i) => {
                const pagado = estaPagado(h, i)
                return <td key={m}>
                  <button className={pagado ? 'pagado' : ''} disabled={!h.id} aria-pressed={pagado}
                    aria-label={`${pagado ? 'Marcar pendiente' : 'Marcar pagado'} Habitación ${h.numero}, ${m} ${anio}`}
                    title={`${pagado ? 'Pagado' : 'Pendiente'} · Hab. ${h.numero} · ${m} ${anio}`}
                    onClick={() => void alternar(h, i)}>{pagado ? '✓' : ''}</button>
                </td>
              })}
            </tr>)}</tbody>
          </table>
        </div>
        <p className="mu">✓ Pagado · casilla vacía = pendiente. Al emitir un recibo, el mes se marca como pagado automáticamente.</p>
        <p className="mu">{msg}</p>
      </div>
      <Historial perfil={perfil} lista={recs} onChange={onChange} filtro={{ anio, mes: mesSel }} mostrarQuitados
        titulo={`Recibos de ${MESES[mesSel]} ${anio}`} />
    </>
  )
}
