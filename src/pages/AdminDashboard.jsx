import React, { useEffect, useState } from 'react'

function authFetch(url, opts){
  const token = localStorage.getItem('admin_token')
  return fetch(url, { ...(opts||{}), headers: { ...(opts && opts.headers), Authorization: token ? `Bearer ${token}` : '' } })
}

export default function AdminDashboard(){
  const [orders, setOrders] = useState([])
  const [quotes, setQuotes] = useState([])
  const [err, setErr] = useState(null)

  useEffect(()=>{ load() }, [])
  async function load(){
    try{
      const o = await (await authFetch('/api/admin/orders')).json()
      const q = await (await authFetch('/api/admin/quotes')).json()
      if (!o.ok) throw new Error(o.message || 'Erreur')
      if (!q.ok) throw new Error(q.message || 'Erreur')
      setOrders(o.orders)
      setQuotes(q.quotes)
    } catch (err){ setErr(err.message) }
  }

  const updateOrder = async (id, status) => {
    await authFetch(`/api/admin/orders/${id}/validate`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ status }) })
    load()
  }

  return (
    <section className="bloc">
      <h1>Administration</h1>
      {err && <p style={{color:'#b00020'}}>{err}</p>}
      <h2>Commandes</h2>
      <ul>
        {orders.map(o=> (
          <li key={o.id} style={{ marginBottom: 8 }}>
            <strong>{o.buyerName}</strong> — {o.email} — <em>{o.status}</em>
            <div>Montant: {o.items && o.items[0] ? o.items[0].amount : '—'}</div>
            <div>Paiement: {o.payment ? `${o.payment.method} (${o.payment.status || '—'})` : '—'}</div>
            <div style={{ marginTop:6 }}>
              <button onClick={()=>updateOrder(o.id,'validated')}>Valider</button>
              <button onClick={()=>updateOrder(o.id,'cancelled')} style={{ marginLeft:8 }}>Annuler</button>
            </div>
          </li>
        ))}
      </ul>

      <h2>Devis</h2>
      <ul>
        {quotes.map(q=> (
          <li key={q.id}>{q.name} — {q.email} — {q.status} — <button onClick={()=>alert('Répondre : implémenter email')}>Répondre</button></li>
        ))}
      </ul>
    </section>
  )
}
