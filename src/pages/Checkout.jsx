import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import PaymentForm from '../components/PaymentForm'

// Protect against missing publishable key to avoid the "empty string" IntegrationError
const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || null
const stripePromise = stripeKey ? loadStripe(stripeKey) : null

export default function Checkout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { items = [], total = 0 } = location.state || {}

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [amount, setAmount] = useState(total)
  const [method, setMethod] = useState('stripe')
  const [status, setStatus] = useState(null)
  const [clientSecret, setClientSecret] = useState(null)
  
  // Après confirmation Stripe, créer la commande côté serveur
  const handleStripeSuccess = async (paymentIntent) => {
    try {
      const orderResp = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyerName: name,
          email,
          items,
          payment: { method: 'stripe', id: paymentIntent.id, status: paymentIntent.status }
        })
      })
      const oj = await orderResp.json()
      if (!orderResp.ok) throw new Error(oj.message || 'Erreur création commande')
      navigate('/commande/confirmation')
    } catch (err) {
      setStatus({ type: 'error', message: err.message })
    }
  }

  // Initialisation Stripe
  const initStripe = async () => {
    setStatus(null)
    try {
      const resp = await fetch('/api/checkout/stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
      })
      const j = await resp.json()
      if (!resp.ok) throw new Error(j.message || 'Erreur Stripe')
      setClientSecret(j.clientSecret)
    } catch (err) {
      setStatus({ type: 'error', message: err.message })
    }
  }

  // Paiement Paystack ou Flutterwave
  const handlePaystackOrFlutter = async () => {
    setStatus(null)
    try {
      if (method === 'paystack') {
        const resp = await fetch('/api/checkout/paystack', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, amount })
        })
        const j = await resp.json()
        if (!resp.ok) throw new Error(j.message || 'Erreur Paystack')
        setStatus({ type: 'info', message: 'Redirection vers Paystack...' })
      } else if (method === 'flutterwave') {
        const resp = await fetch('/api/checkout/flutterwave', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tx_ref: `tx_${Date.now()}`,
            amount,
            currency: 'XAF',
            redirect_url: window.location.href
          })
        })
        const j = await resp.json()
        if (!resp.ok) throw new Error(j.message || 'Erreur Flutterwave')
        setStatus({ type: 'info', message: 'Redirection vers Flutterwave...' })
      }
      // Création commande en attente
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyerName: name,
          email,
          items,
          payment: { method, simulated: method !== 'stripe' },
          status: 'pending'
        })
      })
      navigate('/commande/confirmation')
    } catch (err) {
      setStatus({ type: 'error', message: err.message })
    }
  }

  // Demande de devis via WhatsApp
  const demanderDevis = () => {
    let message = `Bonjour, je souhaite un devis pour :\nNom : ${name}\nEmail : ${email}\nMontant estimé : ${amount} FCFA\nArticles :\n`
    items.forEach(item => {
      message += `- ${item.nom} x ${item.quantite}\n`
    })
    message += `Méthode de paiement souhaitée : ${method}`

    window.open(`https://wa.me/225XXXXXXXXX?text=${encodeURIComponent(message)}`)
  }

  return (
    <section className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-xl mt-10">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Commander / Paiement / Devis</h1>

      {items.length > 0 ? (
        <div className="bg-gray-100 p-4 rounded-md mb-4">
          <h2 className="font-semibold text-lg mb-2">Récapitulatif des articles :</h2>
          <ul>
            {items.map((item, idx) => (
              <li key={idx} className="flex justify-between border-b py-1">
                <span>{item.nom} x {item.quantite}</span>
                <span>{(item.prix * item.quantite).toLocaleString()} FCFA</span>
              </li>
            ))}
          </ul>
          <p className="font-bold text-right mt-2">Total : {total.toLocaleString()} FCFA</p>
        </div>
      ) : (
        <p className="text-red-600 mb-4 text-center">Aucun article sélectionné.</p>
      )}

      <form className="space-y-4" onSubmit={e => e.preventDefault()}>
        <input
          className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          required
          placeholder="Nom"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <input
          className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          required
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />

        <label className="font-semibold text-gray-700">Méthode de paiement</label>
        <select
          className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          value={method}
          onChange={e => setMethod(e.target.value)}
        >
          <option value="stripe">Carte (Stripe)</option>
          <option value="paystack">Paystack</option>
          <option value="flutterwave">Flutterwave</option>
        </select>

        {/* Boutons Paiement et Devis */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          {method === 'stripe' ? (
            <>
              {!clientSecret ? (
                    <>
                      {!stripeKey ? (
                        <p className="text-red-600">Clé publique Stripe manquante. Définissez `VITE_STRIPE_PUBLISHABLE_KEY` dans votre `.env`.</p>
                      ) : (
                        <button
                          type="button"
                          onClick={initStripe}
                          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-md transition"
                        >
                          Initialiser Stripe
                        </button>
                      )}
                    </>
              ) : (
                    <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <PaymentForm
                    clientSecret={clientSecret}
                    onSuccess={paymentIntent => handleStripeSuccess(paymentIntent)}
                    onError={m => setStatus({ type: 'error', message: m })}
                  />
                </Elements>
              )}
            </>
          ) : (
            <button
              type="button"
              onClick={handlePaystackOrFlutter}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-md transition"
            >
              {method === 'paystack' ? 'Payer avec Paystack' : 'Payer avec Flutterwave'}
            </button>
          )}

          <button
            type="button"
            onClick={demanderDevis}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-md transition"
          >
            Demander un devis WhatsApp
          </button>
        </div>
      </form>

      {status && (
        <p
          className={`mt-4 font-semibold ${
            status.type === 'error' ? 'text-red-600' : 'text-green-700'
          }`}
        >
          {status.message}
        </p>
      )}
    </section>
  )
}
