import React, { useState } from 'react'

export default function Contact(){
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const form = e.target
    const email = form.email.value.trim()
    const whatsapp = form.whatsapp.value.trim()

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)){
      setStatus({ type: 'error', message: 'Veuillez entrer un email valide.' })
      return
    }

    setLoading(true)
    setStatus(null)

    try {
      const resp = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, whatsapp })
      })
      const data = await resp.json()
      if (!resp.ok) throw new Error(data.message || 'Erreur')
      setStatus({ type: 'success', message: data.message || 'Message envoyé.' })
      form.reset()
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Erreur lors de l\'envoi.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="bloc contact">
      <h1>Contactez-nous</h1>
      <form className="contact-form" onSubmit={handleSubmit} aria-describedby="contact-feedback">
        <label htmlFor="email" className="sr-only">Email</label>
        <input id="email" type="email" name="email" placeholder="Email" aria-label="Email" required />

        <label htmlFor="whatsapp" className="sr-only">Whatsapp</label>
        <input id="whatsapp" type="text" name="whatsapp" placeholder="Whatsapp" aria-label="Whatsapp" />

        <button type="submit" disabled={loading}>
          {loading ? 'Envoi...' : 'Envoyer'}
        </button>
      </form>

      <div id="contact-feedback" aria-live="polite">
        {status && (
          <p style={{ color: status.type === 'error' ? '#b00020' : '#0b6623' }}>{status.message}</p>
        )}
      </div>
    </section>
  )
}
