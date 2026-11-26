import { useState } from 'react'
import { generarResumenSuministros, resumenMensual } from '../lib/pdfSuministros'
import { supabase } from '../lib/supabase'
import {
  MESES, NOMBRE_SUMINISTRO,
  type FacturaSuministro, type Habitacion, type Perfil, type Propiedad, type TipoSuministro,
} from '../types'

type K = 'gestiona_agua' | 'gestiona_luz' | 'gestiona_gas'
const OPC: [K, string][] = [['gestiona_agua', 'Agua'], ['gestiona_luz', 'Luz'], ['gestiona_gas', 'Gas']]
const CAMPO: Record<TipoSuministro, K> = { agua: 'gestiona_agua', luz: 'gestiona_luz', gas: 'gestiona_gas' }
const TIPOS: TipoSuministro[] = ['agua', 'luz', 'gas']

const eur = (n: number) => n.toFixed(2).replace('.', ',') + ' €'
const redondo = (n: number) => Math.round(n * 100) / 100

export default function Alg({ perfil, p, habs, facturas = [], onGuardado }:
  { perfil: Perfil; p: Propiedad; habs: Habitacion[]; facturas?: FacturaSuministro[]; onGuardado: () => void }) {
  const ahora = new Date()
  const [cfg, setCfg] = useState<Record<K, boolean>>({
    gestiona_agua: p.gestiona_agua, gestiona_luz: p.gestiona_luz, gestiona_gas: p.gestiona_gas,
  })
  const [msg, setMsg] = useState('')
  const [anio, setAnio] = useState(ahora.getFullYear())
  const [mes, setMes] = useState(ahora.getMonth())
  const [tipo, setTipo] = useState<TipoSuministro>('agua')
  const [importe, setImporte] = useState<number | ''>('')
  const [proveedor, setProveedor] = useState('')
  const [desde, setDesde] = useState(''), [hasta, setHasta] = useState('')
  const [notif, setNotif] = useState(''), [cobro, setCobro] = useState('')
  const [nota, setNota] = useState(''), [busy, setBusy] = useState(false)

  const tipos = TIPOS.filter(t => cfg[CAMPO[t]])
  const tipoActivo = (tipos.includes(tipo) ? tipo : tipos[0]) as TipoSuministro | undefined
  const delAnio = facturas.filter(f => f.anio === anio)
  const delMes = delAnio.filter(f => f.mes === mes)
  const resumen = resumenMensual(delMes, habs)

  if (p.tipo !== 'casa') return <div className="card"><p>Agua, luz y gas solo está disponible para casas, no para garajes.</p></div>

  async function guardarCfg() {
    const { error } = await supabase.from('propiedades').update(cfg).eq('id', p.id)
    if (error) setMsg(error.message); else { setMsg('Configuración guardada.'); onGuardado() }
  }

  function limpiar() {
    setImporte(''); setProveedor(''); setDesde(''); setHasta(''); setNotif(''); setCobro(''); setNota('')
  }

  function editar(f: FacturaSuministro) {
    setMes(f.mes); setAnio(f.anio); setTipo(f.tipo); setImporte(Number(f.importe)); setProveedor(f.proveedor || '')
    setDesde(f.periodo_desde ?? ''); setHasta(f.periodo_hasta ?? '')
    setNotif(f.fecha_notificacion ?? ''); setCobro(f.fecha_cobro ?? ''); setNota(f.nota ?? '')
    setMsg('Editando la factura de ' + NOMBRE_SUMINISTRO[f.tipo].toLowerCase() + ' de ' + MESES[f.mes] + '.')
  }

  async function guardarFactura() {
    if (!tipoActivo || importe === '' || busy) return
    setBusy(true); setMsg('')
    const { error } = await supabase.from('facturas_suministros').upsert({
      propiedad_id: p.id, tipo: tipoActivo, anio, mes, importe: Number(importe), proveedor: proveedor.trim(),
      periodo_desde: desde || null, periodo_hasta: hasta || null,
      fecha_notificacion: notif || null, fecha_cobro: cobro || null, nota: nota.trim(),
    }, { onConflict: 'propiedad_id,tipo,anio,mes' })
    if (error) setMsg('No se pudo guardar la factura: ' + error.message)
    else {
      setMsg(`Factura de ${NOMBRE_SUMINISTRO[tipoActivo].toLowerCase()} de ${MESES[mes]} ${anio} guardada.`)
      limpiar(); onGuardado()
    }
    setBusy(false)
  }

  async function borrar(f: FacturaSuministro) {
    if (!f.id || !confirm(`¿Eliminar la factura de ${NOMBRE_SUMINISTRO[f.tipo].toLowerCase()} de ${MESES[f.mes]} ${f.anio}?`)) return
    const { error } = await supabase.from('facturas_suministros').delete().eq('id', f.id)
    if (error) setMsg(error.message); else { setMsg('Factura eliminada.'); onGuardado() }
  }

  function descargar() {
    if (delMes.length === 0) return
    try { generarResumenSuministros(perfil, p, habs, delMes, tipos, anio, mes); setMsg('Resumen descargado.') }
    catch (e) { setMsg('No se pudo generar el PDF: ' + (e as Error).message) }
  }

  const activo = delMes.find(f => f.tipo === tipoActivo)

  return (
    <div>
      <div className="card"><h2>Agua, luz y gas · {p.nombre}</h2>
        <p>Marca qué suministros tiene la vivienda. Después registra aquí las facturas reales de cada compañía.</p>
        {OPC.map(([k, l]) => (
          <label key={k} className="chk"><input type="checkbox" checked={cfg[k]} onChange={e => setCfg({ ...cfg, [k]: e.target.checked })} />{l}</label>))}
        <p className="mu">{msg}</p>
        <button onClick={guardarCfg}>Guardar</button>
      </div>

      <div className="card">
        <div className="bar"><h2>Facturas de suministros</h2>
          <span><button onClick={() => setAnio(anio - 1)} aria-label="Año anterior">←</button>{' '}
            <button onClick={() => setAnio(ahora.getFullYear())}>Este año</button>{' '}
            <button onClick={() => setAnio(anio + 1)} aria-label="Año siguiente">→</button></span></div>
        <p className="mu">Año <b>{anio}</b>. Pulsa un mes para ver o añadir sus facturas.</p>
        {tipos.length === 0
          ? <p className="err">Marca al menos un suministro y pulsa «Guardar».</p>
          : <div className="tabla-scroll">
            <table className="pagos">
              <thead><tr><th scope="col">Mes</th>
                {tipos.map(t => <th key={t} scope="col">{NOMBRE_SUMINISTRO[t]}</th>)}
                <th scope="col">Facturas</th><th scope="col">Cobrado</th><th scope="col">Diferencia</th></tr></thead>
              <tbody>{MESES.map((m, i) => {
                const fs = delAnio.filter(f => f.mes === i)
                const r = resumenMensual(fs, habs)
                return <tr key={m} className={mes === i ? 'sel' : ''} onClick={() => setMes(i)}>
                  <th scope="row">{m}</th>
                  {tipos.map(t => {
                    const f = fs.find(x => x.tipo === t)
                    return <td key={t}>{f ? eur(Number(f.importe)) : '—'}</td>
                  })}
                  <td>{r.totalFacturas ? eur(r.totalFacturas) : '—'}</td>
                  <td>{eur(r.totalCobrado)}</td>
                  <td className={r.diferencia < 0 ? 'err' : ''}>{r.diferencia > 0 ? '+' : ''}{eur(r.diferencia)}</td>
                </tr>
              })}</tbody>
              <tfoot><tr><th scope="row">Total {anio}</th>
                {tipos.map(t => <td key={t}>{eur(redondo(delAnio.filter(f => f.tipo === t).reduce((s, f) => s + Number(f.importe), 0)))}</td>)}
                <td>{eur(redondo(delAnio.reduce((s, f) => s + Number(f.importe), 0)))}</td>
                <td>{eur(redondo(resumen.totalCobrado * 12))}</td>
                <td>{(() => {
                  const d = redondo(resumen.totalCobrado * 12 - delAnio.reduce((s, f) => s + Number(f.importe), 0))
                  return (d > 0 ? '+' : '') + eur(d)
                })()}</td></tr></tfoot>
            </table>
          </div>}
        <p className="mu">«Cobrado» es la suma de los suministros de las fichas de las habitaciones. El total anual usa las habitaciones actuales. Una diferencia negativa significa que pagas más de lo que repercutes.</p>
      </div>

      <div className="card"><h2>{MESES[mes]} {anio} · facturas y recibo</h2>
        {delMes.length === 0 && <p className="mu">Este mes todavía no tiene facturas registradas.</p>}
        {delMes.map(f => (
          <div className="item" key={f.id}>
            <span><b>{NOMBRE_SUMINISTRO[f.tipo]}</b> · {f.proveedor || 'Sin proveedor'} · {eur(Number(f.importe))}<br />
              <span className="mu">Periodo {f.periodo_desde ? new Date(f.periodo_desde + 'T00:00:00').toLocaleDateString('es-ES') : '—'} – {f.periodo_hasta ? new Date(f.periodo_hasta + 'T00:00:00').toLocaleDateString('es-ES') : '—'}
                {f.fecha_notificacion && ` · notificada ${new Date(f.fecha_notificacion + 'T00:00:00').toLocaleDateString('es-ES')}`}
                {f.fecha_cobro && ` · cobro ${new Date(f.fecha_cobro + 'T00:00:00').toLocaleDateString('es-ES')}`}</span></span>
            <span><button onClick={() => editar(f)}>Editar</button> <button onClick={() => borrar(f)}>Eliminar</button></span>
          </div>
        ))}
        <div className="row">
          <div><label htmlFor="st">Suministro</label>
            <select id="st" value={tipoActivo ?? ''} onChange={e => setTipo(e.target.value as TipoSuministro)} disabled={tipos.length === 0}>
              {tipos.length === 0 && <option value="">Sin suministros</option>}
              {tipos.map(t => <option key={t} value={t}>{NOMBRE_SUMINISTRO[t]}</option>)}
            </select></div>
          <div><label htmlFor="sm">Mes</label>
            <select id="sm" value={mes} onChange={e => setMes(+e.target.value)}>
              {MESES.map((m, i) => <option key={m} value={i}>{m}</option>)}</select></div>
        </div>
        <div className="row">
          <div><label htmlFor="sa">Año</label>
            <input id="sa" type="number" min="2000" value={anio} onChange={e => setAnio(e.target.value === '' ? ahora.getFullYear() : +e.target.value)} /></div>
          <div><label htmlFor="si">Importe de la factura (€)</label>
            <input id="si" type="number" min="0" step="0.01" value={importe} onChange={e => setImporte(e.target.value === '' ? '' : +e.target.value)} /></div>
        </div>
        <label htmlFor="sp">Compañía (opcional)</label>
        <input id="sp" value={proveedor} placeholder="Ej.: EMASESA, Naturgy, Endesa…" onChange={e => setProveedor(e.target.value)} />
        <div className="row">
          <div><label htmlFor="sd">Periodo desde</label><input id="sd" type="date" value={desde} onChange={e => setDesde(e.target.value)} /></div>
          <div><label htmlFor="sh">Periodo hasta</label><input id="sh" type="date" value={hasta} onChange={e => setHasta(e.target.value)} /></div>
        </div>
        <div className="row">
          <div><label htmlFor="sn">Fecha de notificación</label><input id="sn" type="date" value={notif} onChange={e => setNotif(e.target.value)} /></div>
          <div><label htmlFor="sc">Fecha de cobro</label><input id="sc" type="date" value={cobro} onChange={e => setCobro(e.target.value)} /></div>
        </div>
        <label htmlFor="sx">Nota (opcional)</label>
        <input id="sx" value={nota} placeholder="Ej.: factura estimada, revisión de contador…" onChange={e => setNota(e.target.value)} />
        <p className="mu">{activo ? 'Ya hay una factura de este suministro y mes: al guardar se actualiza.' : 'Se añadirá una factura nueva.'}</p>
        <button className="p" disabled={!tipoActivo || importe === '' || busy} onClick={guardarFactura}>
          {activo ? 'Actualizar factura' : 'Añadir factura'}
        </button>{' '}
        <button disabled={delMes.length === 0} onClick={descargar}>Descargar resumen PDF</button>
        <p className="mu">El PDF compara las facturas reales del mes con los suministros que se cobran a los inquilinos.</p>
      </div>
    </div>
  )
}
