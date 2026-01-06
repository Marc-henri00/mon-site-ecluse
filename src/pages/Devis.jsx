import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Devis(){
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [details, setDetails] = useState('')
  const [status, setStatus] = useState(null)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus(null)
    try{
      const resp = await fetch('/api/quotes', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ name, email, details }) })
      const j = await resp.json()
      if (!resp.ok) throw new Error(j.message || 'Erreur')
      navigate('/devis/confirmation')
    } catch (err){ setStatus({ type:'error', message: err.message }) }
  }

  return (
    <section className="bloc">
      <h1>Demande de devis</h1>
      <form className="contact-form" onSubmit={handleSubmit}>
        <input required placeholder="Nom" value={name} onChange={e=>setName(e.target.value)} />
        <input required type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <textarea required placeholder="Détails du projet" value={details} onChange={e=>setDetails(e.target.value)} rows={6} />
        <button type="submit">Envoyer la demande</button>
      </form>
      {status && <p style={{ color: status.type==='error'?'#b00020':'#0b6623' }}>{status.message}</p>}
    </section>
  )
}
