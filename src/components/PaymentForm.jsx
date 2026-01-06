import React, { useState } from 'react'
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js'

export default function PaymentForm({ clientSecret, onSuccess, onError }){
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!stripe || !elements) return
    setLoading(true)
    try{
      const card = elements.getElement(CardElement)
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card }
      })
      if (error) {
        onError && onError(error.message)
      } else if (paymentIntent && paymentIntent.status === 'succeeded'){
        onSuccess && onSuccess(paymentIntent)
      } else {
        onError && onError('Paiement non terminé')
      }
    } catch (err){ onError && onError(err.message || 'Erreur') }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth:420, margin:'0 auto', display:'flex', flexDirection:'column', gap:12 }}>
      <CardElement options={{ style: { base: { fontSize: '16px' } } }} />
      <button type="submit" disabled={!stripe || loading} style={{ padding:'10px 14px', borderRadius:8, backgroundColor:'#334a60', color:'#fff', fontWeight:700 }}>
        {loading ? 'Confirmation...' : 'Payer'
        }
      </button>
    </form>
  )
}
