import { useCallback, useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { configured, supabase } from './lib/supabase'
import type { FacturaSuministro, Habitacion, PagoHabitacion, Perfil, Propiedad, Recibo, ReciboGaraje } from './types'
import Login from './components/Login'
import PerfilForm from './components/Perfil'
import Propiedades from './components/Propiedades'
import PropiedadForm from './components/PropiedadForm'
import PropiedadMenu from './components/PropiedadMenu'
import SeccionRecibos from './components/SeccionRecibos'
import Contrato from './components/Contrato'
import Alg from './components/Alg'
import PlazaGaraje from './components/PlazaGaraje'

const PERFIL_VACIO: Perfil = { nombre: '', dni: '', direccion: '', telefono: '', iban: '', banco: '' }
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
// La ruta vive en la dirección (#/<propiedad>/<sección>), así funcionan «atrás» y recargar.
type Ruta = { id: string | null; sec: string }
function leerRuta(): Ruta {
  const [a, b] = location.hash.replace(/^#\/?/, '').split('/')
  if (a === 'datos') return { id: null, sec: 'datos' }
  return UUID.test(a ?? '') ? { id: a, sec: b || 'menu' } : { id: null, sec: 'lista' }
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null), [listo, setListo] = useState(false)
  const [perfil, setPerfil] = useState<Perfil>(PERFIL_VACIO), [props, setProps] = useState<Propiedad[]>([]), [cargadas, setCargadas] = useState(false)
  const [habs, setHabs] = useState<Habitacion[]>([]), [recs, setRecs] = useState<Recibo[]>([])
  const [pagos, setPagos] = useState<PagoHabitacion[]>([]), [recsGaraje, setRecsGaraje] = useState<ReciboGaraje[]>([])
  const [facturasSum, setFacturasSum] = useState<FacturaSuministro[]>([])
  const [err, setErr] = useState('')
  const [ruta, setRuta] = useState<Ruta>(leerRuta)

  useEffect(() => { const f = () => setRuta(leerRuta()); window.addEventListener('hashchange', f); return () => window.removeEventListener('hashchange', f) }, [])
  const ir = (id: string | null, sec = 'menu') => { location.hash = id ? `/${id}/${sec}` : sec === 'datos' ? '/datos' : '' }

  useEffect(() => {
    if (!configured) { setListo(true); return }
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setListo(true) })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  const cargarGlobal = useCallback(async () => {
    const [p, pr] = await Promise.all([
      supabase.from('perfiles').select('nombre,dni,direccion,telefono,iban,banco').maybeSingle(),
      supabase.from('propiedades').select('*').order('created_at')])
    const e = p.error ?? pr.error
    setErr(e ? 'Si acabas de actualizar la aplicación, ejecuta las migraciones pendientes de supabase/ (004_propiedades.sql a 007_borrados.sql). ' + e.message : '')
    setPerfil((p.data as Perfil) ?? PERFIL_VACIO); setProps((pr.data as Propiedad[]) ?? []); setCargadas(true)
  }, [])
  const cargarProp = useCallback(async (id: string) => {
    const [h, r, pg, rg, fs] = await Promise.all([
      supabase.from('habitaciones').select('*').eq('propiedad_id', id).order('numero'),
      supabase.from('recibos').select('*').eq('propiedad_id', id).order('anio', { ascending: false }).order('secuencia', { ascending: false }),
      supabase.from('pagos_habitacion').select('*').eq('propiedad_id', id),
      supabase.from('recibos_garaje').select('*').eq('propiedad_id', id).order('anio', { ascending: false }).order('mes', { ascending: false }),
      supabase.from('facturas_suministros').select('*').eq('propiedad_id', id).order('anio', { ascending: false }).order('mes', { ascending: false })])
    const e = h.error ?? r.error ?? pg.error ?? rg.error ?? fs.error
    if (e) setErr('Si acabas de actualizar la aplicación, ejecuta las migraciones pendientes de supabase/ (005_garajes_pagos.sql a 007_borrados.sql) en Supabase. ' + e.message)
    else setErr('')
    setHabs((h.data as Habitacion[]) ?? []); setRecs((r.data as Recibo[]) ?? [])
    setPagos((pg.data as PagoHabitacion[]) ?? []); setRecsGaraje((rg.data as ReciboGaraje[]) ?? [])
    setFacturasSum((fs.data as FacturaSuministro[]) ?? [])
  }, [])
  useEffect(() => { if (session) void cargarGlobal(); else { setPerfil(PERFIL_VACIO); setProps([]); setHabs([]); setRecs([]); setPagos([]); setRecsGaraje([]); setFacturasSum([]); setCargadas(false) } }, [session, cargarGlobal])
  useEffect(() => { if (session && ruta.id) void cargarProp(ruta.id); else { setHabs([]); setRecs([]); setPagos([]); setRecsGaraje([]); setFacturasSum([]) } }, [session, ruta.id, cargarProp])

  if (!listo) return null
  if (!configured) return <main><div className="card"><h1>Falta configurar Supabase</h1>
    <p>Copia <code>.env.example</code> a <code>.env.local</code>, rellena la URL y la clave, y reinicia. Pasos en el README.</p></div></main>
  if (!session) return <Login />

  const p = ruta.id ? props.find(x => x.id === ruta.id) : undefined
  const abrirPropiedad = async (id: string, tipo?: Propiedad['tipo']) => {
    await cargarGlobal()
    const t = tipo ?? props.find(x => x.id === id)?.tipo
    ir(id, t === 'garaje' ? 'plaza' : 'menu')
  }
  const recargarTodo = async () => { await cargarGlobal(); if (ruta.id) await cargarProp(ruta.id) }
  const soloCasas = <div className="card"><p>Esta sección solo está disponible para casas o viviendas.</p><button onClick={() => ir(p?.id ?? null)}>Volver</button></div>
  let vista
  if (ruta.sec === 'datos') vista = <PerfilForm key={JSON.stringify(perfil)} perfil={perfil} userId={session.user.id} onSaved={cargarGlobal} />
  else if (!cargadas) vista = <p className="mu">Cargando…</p>
  else if (!ruta.id) vista = <Propiedades lista={props} onAbrir={abrirPropiedad} onCreada={cargarGlobal} />
  else if (!p) vista = <div className="card"><p>No se encontró esa propiedad.</p><button onClick={() => ir(null)}>Volver a mis propiedades</button></div>
  else vista = (
    <div>
      <div className="bar"><button onClick={() => ir(null)}>← Propiedades</button>{ruta.sec !== 'menu' && p.tipo !== 'garaje' && <button onClick={() => ir(p.id)}>← {p.nombre}</button>}</div>
      <p />
      {(ruta.sec === 'recibos' || ruta.sec === 'pagos') && (p.tipo === 'casa'
        ? <SeccionRecibos key={ruta.sec} perfil={perfil} habs={habs} recs={recs} pagos={pagos} propiedadId={p.id}
            tabInicial={ruta.sec === 'pagos' ? 'pagos' : 'recibos'} onCambio={() => cargarProp(p.id)} />
        : soloCasas)}
      {(ruta.sec === 'plaza' || (ruta.sec === 'menu' && p.tipo === 'garaje')) && (p.tipo === 'garaje'
        ? <PlazaGaraje perfil={perfil} p={p} recibos={recsGaraje} onCambio={() => cargarProp(p.id)} onEditar={() => ir(p.id, 'editar')} />
        : <div className="card"><p>La plaza de garaje solo está disponible para garajes.</p><button onClick={() => ir(p.id)}>Volver</button></div>)}
      {ruta.sec === 'contrato' && (p.tipo === 'casa' ? <Contrato key={p.id} perfil={perfil} p={p} habs={habs} /> : soloCasas)}
      {ruta.sec === 'alg' && (p.tipo === 'casa'
        ? <Alg key={p.id} perfil={perfil} p={p} habs={habs} facturas={facturasSum} onGuardado={() => cargarProp(p.id)} />
        : soloCasas)}
      {ruta.sec === 'editar' && <PropiedadForm key={p.id} inicial={p} onGuardada={async () => { await recargarTodo(); ir(p.id, p.tipo === 'garaje' ? 'plaza' : 'menu') }} onCancelar={() => ir(p.id, p.tipo === 'garaje' ? 'plaza' : 'menu')} onEliminada={async () => { await cargarGlobal(); ir(null) }} />}
      {!['recibos', 'pagos', 'plaza', 'contrato', 'alg', 'editar'].includes(ruta.sec) && p.tipo === 'casa' && <PropiedadMenu p={p} onIr={sec => ir(p.id, sec)} />}
    </div>)
  return (
    <main>
      <div className="bar"><h1>Gestión de alquileres</h1>
        <span><button onClick={() => ir(null, 'datos')}>Mis datos</button> <button onClick={() => supabase.auth.signOut()}>Salir</button></span></div>
      <p className="mu">{session.user.email}</p>
      {ruta.sec === 'datos' && <button onClick={() => ir(null)}>← Propiedades</button>}
      {err && <p className="err">{err}</p>}
      {vista}
    </main>
  )
}
