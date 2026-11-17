import { useCallback, useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { configured, supabase } from './lib/supabase'
import type { Habitacion, Perfil, Recibo } from './types'
import Login from './components/Login'
import PerfilForm from './components/Perfil'
import Habitaciones from './components/Habitaciones'
import Recibos from './components/Recibos'
import Historial from './components/Historial'

const PERFIL_VACIO: Perfil = { nombre: '', dni: '', direccion: '', telefono: '' }
type Tab = 'recibos' | 'historial' | 'habitaciones' | 'perfil'

export default function App() {
  const [session, setSession] = useState<Session | null>(null), [listo, setListo] = useState(false)
  const [perfil, setPerfil] = useState<Perfil>(PERFIL_VACIO), [habs, setHabs] = useState<Habitacion[]>([]), [recs, setRecs] = useState<Recibo[]>([])
  const [tab, setTab] = useState<Tab>('recibos'), [err, setErr] = useState('')

  useEffect(() => {
    if (!configured) { setListo(true); return }
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setListo(true) })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  const cargar = useCallback(async () => {
    const [p, h, r] = await Promise.all([
      supabase.from('perfiles').select('nombre,dni,direccion,telefono').maybeSingle(),
      supabase.from('habitaciones').select('*').order('numero'),
      supabase.from('recibos').select('*').order('anio', { ascending: false }).order('secuencia', { ascending: false })])
    const e = p.error ?? h.error ?? r.error
    setErr(e ? (r.error && !p.error && !h.error ? 'Falta ejecutar supabase/002_recibos.sql en Supabase. ' : '') + e.message : '')
    setPerfil((p.data as Perfil) ?? PERFIL_VACIO); setHabs((h.data as Habitacion[]) ?? []); setRecs((r.data as Recibo[]) ?? [])
  }, [])
  useEffect(() => { if (session) void cargar(); else { setPerfil(PERFIL_VACIO); setHabs([]); setRecs([]) } }, [session, cargar])

  if (!listo) return null
  if (!configured) return <main><div className="card"><h1>Falta configurar Supabase</h1>
    <p>Copia <code>.env.example</code> a <code>.env.local</code>, rellena la URL y la clave <i>anon</i>, y reinicia. Pasos en el README.</p></div></main>
  if (!session) return <Login />
  return (
    <main>
      <div className="bar"><h1>Recibos de alquiler</h1><button onClick={() => supabase.auth.signOut()}>Salir</button></div>
      <p className="mu">{session.user.email}</p>
      <nav>{(['recibos', 'historial', 'habitaciones', 'perfil'] as Tab[]).map(t =>
        <button key={t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>{t === 'perfil' ? 'Mis datos' : t[0].toUpperCase() + t.slice(1)}</button>)}</nav>
      {err && <p className="err">{err}</p>}
      {tab === 'recibos' && <Recibos perfil={perfil} lista={habs} onEmitido={cargar} />}
      {tab === 'historial' && <Historial perfil={perfil} lista={recs} onChange={cargar} />}
      {tab === 'habitaciones' && <Habitaciones lista={habs} onChange={cargar} />}
      {tab === 'perfil' && <PerfilForm key={perfil.nombre + perfil.dni} perfil={perfil} userId={session.user.id} onSaved={cargar} />}
    </main>
  )
}
