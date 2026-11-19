import { useCallback, useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { configured, supabase } from './lib/supabase'
import type { Habitacion, Perfil, Propiedad, Recibo } from './types'
import Login from './components/Login'
import PerfilForm from './components/Perfil'
import Propiedades from './components/Propiedades'
import PropiedadForm from './components/PropiedadForm'
import PropiedadMenu from './components/PropiedadMenu'
import SeccionRecibos from './components/SeccionRecibos'
import Contrato from './components/Contrato'
import Alg from './components/Alg'

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
  const [habs, setHabs] = useState<Habitacion[]>([]), [recs, setRecs] = useState<Recibo[]>([]), [err, setErr] = useState('')
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
    setErr(e ? 'Si acabas de actualizar la aplicación, falta ejecutar supabase/004_propiedades.sql en Supabase. ' + e.message : '')
    setPerfil((p.data as Perfil) ?? PERFIL_VACIO); setProps((pr.data as Propiedad[]) ?? []); setCargadas(true)
  }, [])
  const cargarProp = useCallback(async (id: string) => {
    const [h, r] = await Promise.all([
      supabase.from('habitaciones').select('*').eq('propiedad_id', id).order('numero'),
      supabase.from('recibos').select('*').eq('propiedad_id', id).order('anio', { ascending: false }).order('secuencia', { ascending: false })])
    if (h.error || r.error) setErr((h.error ?? r.error)!.message)
    setHabs((h.data as Habitacion[]) ?? []); setRecs((r.data as Recibo[]) ?? [])
  }, [])
  useEffect(() => { if (session) void cargarGlobal(); else { setPerfil(PERFIL_VACIO); setProps([]); setHabs([]); setRecs([]); setCargadas(false) } }, [session, cargarGlobal])
  useEffect(() => { if (session && ruta.id) void cargarProp(ruta.id); else { setHabs([]); setRecs([]) } }, [session, ruta.id, cargarProp])

  if (!listo) return null
  if (!configured) return <main><div className="card"><h1>Falta configurar Supabase</h1>
    <p>Copia <code>.env.example</code> a <code>.env.local</code>, rellena la URL y la clave, y reinicia. Pasos en el README.</p></div></main>
  if (!session) return <Login />

  const p = ruta.id ? props.find(x => x.id === ruta.id) : undefined
  const recargarTodo = async () => { await cargarGlobal(); if (ruta.id) await cargarProp(ruta.id) }
  let vista
  if (ruta.sec === 'datos') vista = <PerfilForm key={JSON.stringify(perfil)} perfil={perfil} userId={session.user.id} onSaved={cargarGlobal} />
  else if (!ruta.id) vista = <Propiedades lista={props} onAbrir={async id => { await cargarGlobal(); ir(id) }} />
  else if (!cargadas) vista = <p className="mu">Cargando…</p>
  else if (!p) vista = <div className="card"><p>No se encontró esa propiedad.</p><button onClick={() => ir(null)}>Volver a mis propiedades</button></div>
  else vista = (
    <div>
      <div className="bar"><button onClick={() => ir(null)}>← Propiedades</button>{ruta.sec !== 'menu' && <button onClick={() => ir(p.id)}>← {p.nombre}</button>}</div>
      <p />
      {ruta.sec === 'recibos' && <SeccionRecibos perfil={perfil} habs={habs} recs={recs} propiedadId={p.id} onCambio={() => cargarProp(p.id)} />}
      {ruta.sec === 'contrato' && <Contrato key={p.id} perfil={perfil} p={p} habs={habs} />}
      {ruta.sec === 'alg' && (p.tipo === 'casa' ? <Alg key={p.id} p={p} onGuardado={cargarGlobal} /> : <div className="card"><p>Agua, luz y gas solo está disponible para casas.</p></div>)}
      {ruta.sec === 'editar' && <PropiedadForm key={p.id} inicial={p} onGuardada={async () => { await recargarTodo(); ir(p.id) }} onCancelar={() => ir(p.id)} onEliminada={async () => { await cargarGlobal(); ir(null) }} />}
      {!['recibos', 'contrato', 'alg', 'editar'].includes(ruta.sec) && <PropiedadMenu p={p} onIr={sec => ir(p.id, sec)} />}
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
