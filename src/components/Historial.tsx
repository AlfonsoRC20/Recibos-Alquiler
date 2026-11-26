import { useState } from 'react'
import { generarRecibo } from '../lib/pdf'
import { supabase } from '../lib/supabase'
import { MESES, type Perfil, type Recibo } from '../types'

const eur = (n: number) => Number(n).toFixed(2).replace('.', ',') + ' €'

export default function Historial({ perfil, lista, onChange, filtro, mostrarQuitados = false, titulo = 'Historial de recibos' }:
  { perfil: Perfil; lista: Recibo[]; onChange: () => void; filtro?: { anio: number; mes: number }; mostrarQuitados?: boolean; titulo?: string }) {
  const [msg, setMsg] = useState(''), [verQuitados, setVerQuitados] = useState(mostrarQuitados)
  const base = filtro ? lista.filter(r => r.anio === filtro.anio && r.mes === filtro.mes) : lista
  const quitados = base.filter(r => r.oculto).length
  const visibles = base.filter(r => verQuitados || !r.oculto)
  // ¿hay otro recibo emitido de la misma habitación y mes? (impide desanular)
  const conflicto = (r: Recibo) => r.habitacion_id !== null &&
    lista.some(x => x.id !== r.id && x.estado === 'emitido' && x.habitacion_id === r.habitacion_id && x.anio === r.anio && x.mes === r.mes)

  async function cambiar(r: Recibo, cambios: { estado?: 'emitido' | 'anulado'; oculto?: boolean }, ok: string) {
    const { error } = await supabase.from('recibos').update(cambios).eq('id', r.id)
    if (error) setMsg(error.code === '23505' ? `No se puede desanular el ${r.numero}: ya hay otro recibo emitido de esa habitación y mes.` : error.message)
    else { setMsg(ok); onChange() }
  }
  function descargar(r: Recibo) {
    try {
      generarRecibo(perfil, { numero: r.hab_numero, concepto: r.concepto, renta: Number(r.renta), suministros: Number(r.suministros),
        inq_nombre: r.inq_nombre, inq_dni: r.inq_dni, inq_direccion: r.inq_direccion, inq_telefono: r.inq_telefono },
        { fecha: r.fecha_pago, mes: r.mes, anio: r.anio, renta: Number(r.renta), suministros: Number(r.suministros), numeroRecibo: r.numero })
      setMsg('')
    } catch (e) { setMsg('No se pudo generar el PDF: ' + (e as Error).message) }
  }
  const anular = (r: Recibo) => confirm(`¿Anular el recibo ${r.numero} (Hab. ${r.hab_numero}, ${MESES[r.mes]} ${r.anio})? Se quitará de la lista y podrás recuperarlo en «Mostrar quitados».`)
    && cambiar(r, { estado: 'anulado', oculto: true }, `Recibo ${r.numero} anulado y quitado de la lista.`)
  const quitar = (r: Recibo) => confirm(`¿Quitar el recibo anulado ${r.numero} de la lista? Podrás verlo con «Mostrar quitados».`)
    && cambiar(r, { oculto: true }, `Recibo ${r.numero} quitado de la lista.`)
  async function borrar(r: Recibo) {
    const { error } = await supabase.from('recibos').delete().eq('id', r.id)
    if (error) {
      setMsg(error.code === '42501'
        ? 'No se pudo eliminar definitivamente: ejecuta supabase/007_borrados.sql en Supabase.'
        : 'No se pudo eliminar definitivamente: ' + error.message)
    } else { setMsg(`Recibo ${r.numero} eliminado definitivamente.`); onChange() }
  }
  const eliminar = (r: Recibo) => confirm(`¿Eliminar definitivamente el recibo ${r.numero} (Hab. ${r.hab_numero}, ${MESES[r.mes]} ${r.anio})? Esta acción no se puede deshacer.`)
    && borrar(r)

  return (
    <div className="card"><h2>{titulo}</h2>
      {filtro && <p className="mu">{MESES[filtro.mes]} {filtro.anio} · se muestran también los recibos anulados y quitados.</p>}
      {visibles.length === 0 && <p className="mu">{base.length === 0 ? 'No hay recibos en ese mes.' : 'No hay recibos que mostrar.'}</p>}
      {visibles.map(r => {
        const bloqueado = r.estado === 'anulado' && conflicto(r)
        return (
          <div className="item" key={r.id} style={r.estado === 'anulado' ? { opacity: 0.6 } : undefined}>
            <span><b>{r.numero}</b> · Hab. {r.hab_numero} · {r.inq_nombre}<br />
              <span className="mu">{MESES[r.mes]} {r.anio} · {eur(Number(r.renta) + Number(r.suministros))} · pagado el {r.fecha_pago.split('-').reverse().join('/')}
                {r.estado === 'anulado' ? (r.oculto ? ' · ANULADO (quitado)' : ' · ANULADO') : ''}</span>
              {bloqueado && <><br /><span className="mu">Para desanularlo, anula antes el recibo emitido de ese mes.</span></>}</span>
            <span>
              {r.estado === 'emitido'
                ? <><button onClick={() => descargar(r)}>PDF</button> <button onClick={() => anular(r)}>Anular</button></>
                : <><button disabled={bloqueado} onClick={() => cambiar(r, { estado: 'emitido', oculto: false }, `Recibo ${r.numero} desanulado.`)}>Desanular</button>{' '}
                  {r.oculto
                    ? <><button onClick={() => cambiar(r, { oculto: false }, `Recibo ${r.numero} vuelve a la lista.`)}>Mostrar</button>{' '}
                      <button onClick={() => eliminar(r)}>Eliminar permanentemente</button></>
                    : <button onClick={() => quitar(r)}>Quitar</button>}</>}
            </span>
          </div>)
      })}
      {quitados > 0 && <p><button onClick={() => setVerQuitados(!verQuitados)}>{verQuitados ? 'Ocultar quitados' : `Mostrar quitados (${quitados})`}</button></p>}
      <p className="mu">{msg}</p>
    </div>
  )
}
