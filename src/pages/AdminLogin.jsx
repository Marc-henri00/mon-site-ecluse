import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function AdminLogin(){
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [err, setErr] = useState(null)
  const navigate = useNavigate()

  const handle = async (e) => {
    e.preventDefault(); setErr(null)
    try{
      const resp = await fetch('/api/auth/login', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ username: user, password: pass }) })
      const j = await resp.json()
      if (!resp.ok) throw new Error(j.message || 'Erreur')
      localStorage.setItem('admin_token', j.token)
      navigate('/admin')
    } catch (err){ setErr(err.message) }
  }

  return (
    <section className="bloc">
      <h1>Admin — Connexion</h1>
      <form className="contact-form" onSubmit={handle}>
        <input placeholder="Utilisateur" value={user} onChange={e=>setUser(e.target.value)} />
        <input placeholder="Mot de passe" type="password" value={pass} onChange={e=>setPass(e.target.value)} />
        <button type="submit">Se connecter</button>
      </form>
      {err && <p style={{color:'#b00020'}}>{err}</p>}
    </section>
  )
}
