import { useState } from 'react'
import { generarRecibo } from '../lib/pdf'
import { supabase } from '../lib/supabase'
import { MESES, type Perfil, type Recibo } from '../types'

const eur = (n: number) => Number(n).toFixed(2).replace('.', ',') + ' €'

export default function Historial({ perfil, lista, onChange }: { perfil: Perfil; lista: Recibo[]; onChange: () => void }) {
  const [msg, setMsg] = useState('')
  function descargar(r: Recibo) {
    try {
      generarRecibo(perfil, { numero: r.hab_numero, concepto: r.concepto, renta: Number(r.renta), suministros: Number(r.suministros),
        inq_nombre: r.inq_nombre, inq_dni: r.inq_dni, inq_direccion: r.inq_direccion, inq_telefono: r.inq_telefono },
        { fecha: r.fecha_pago, mes: r.mes, anio: r.anio, renta: Number(r.renta), suministros: Number(r.suministros), numeroRecibo: r.numero })
      setMsg('')
    } catch (e) { setMsg('No se pudo generar el PDF: ' + (e as Error).message) }
  }
  async function anular(r: Recibo) {
    if (!confirm(`¿Anular el recibo ${r.numero} (Hab. ${r.hab_numero}, ${MESES[r.mes]} ${r.anio})? No se puede deshacer.`)) return
    const { error } = await supabase.from('recibos').update({ estado: 'anulado' }).eq('id', r.id)
    if (error) setMsg(error.message); else { setMsg(`Recibo ${r.numero} anulado.`); onChange() }
  }
  return (
    <div className="card"><h2>Historial de recibos</h2>
      {lista.length === 0 && <p className="mu">Aún no has emitido ningún recibo.</p>}
      {lista.map(r => (
        <div className="item" key={r.id} style={r.estado === 'anulado' ? { opacity: 0.55 } : undefined}>
          <span><b>{r.numero}</b> · Hab. {r.hab_numero} · {r.inq_nombre}<br />
            <span className="mu">{MESES[r.mes]} {r.anio} · {eur(Number(r.renta) + Number(r.suministros))} · pagado el {r.fecha_pago.split('-').reverse().join('/')}{r.estado === 'anulado' ? ' · ANULADO' : ''}</span></span>
          <span>{r.estado === 'emitido' && <><button onClick={() => descargar(r)}>PDF</button> <button onClick={() => anular(r)}>Anular</button></>}</span>
        </div>))}
      <p className="mu">{msg}</p>
    </div>
  )
}
