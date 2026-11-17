import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [email, setEmail] = useState(''), [pass, setPass] = useState('')
  const [nuevo, setNuevo] = useState(false), [msg, setMsg] = useState(''), [busy, setBusy] = useState(false)
  async function enviar() {
    setBusy(true); setMsg('')
    const { error, data } = nuevo ? await supabase.auth.signUp({ email, password: pass }) : await supabase.auth.signInWithPassword({ email, password: pass })
    if (error) setMsg(error.message)
    else if (nuevo && !data.session) setMsg('Cuenta creada. Revisa tu correo para confirmarla y luego inicia sesión.')
    setBusy(false)
  }
  return (
    <main><div className="card">
      <h1>Recibos de alquiler</h1>
      <p className="mu">{nuevo ? 'Crea tu cuenta' : 'Inicia sesión'}. Tus datos solo los ves tú.</p>
      <label htmlFor="em">Correo</label><input id="em" type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" />
      <label htmlFor="pw">Contraseña (mín. 8 caracteres)</label><input id="pw" type="password" value={pass} onChange={e => setPass(e.target.value)} autoComplete={nuevo ? 'new-password' : 'current-password'} />
      <p className="err">{msg}</p>
      <div className="bar">
        <button className="p" disabled={busy || !email || pass.length < 8} onClick={enviar}>{nuevo ? 'Registrarme' : 'Entrar'}</button>
        <button onClick={() => setNuevo(!nuevo)}>{nuevo ? 'Ya tengo cuenta' : 'Crear cuenta'}</button>
      </div>
    </div></main>
  )
}
