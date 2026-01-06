import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FloatingCart from '../components/FloatingCart'

export default function Services() {
  const navigate = useNavigate()
  

  // Liste des services
  const services = [
    { id: 1, nom: 'Bâche', prix: 10000, image: '/image/Bache.jpeg' },
    { id: 2, nom: 'Chaise', prix: 1500, image: '/image/chaisevip.jpg' },
    { id: 3, nom: 'Assiette creuse', prix: 300, image: '/image/assiettecreuse.jpeg' },
    { id: 4, nom: 'Assiette plate', prix: 300, image: '/image/assietteplate.jpeg' },
    { id: 5, nom: 'Cuillère à soupe', prix: 150, image: '/image/cuillere-a-soupe.jpg' },
    { id: 6, nom: 'Fourchette', prix: 150, image: '/image/fourchette.jpg' },
    { id: 7, nom: 'Couteau', prix: 200, image: '/image/couteau-table.jpg' },
    { id: 8, nom: 'Verre à eau', prix: 200, image: '/image/verre-a-eau.jpg' },
    { id: 9, nom: 'Verre à vin', prix: 250, image: '/image/verres-a-vin.jpg' },
    { id: 10, nom: 'Tréteau', prix: 5000, image: '/image/treteau.jpg' },
    { id: 11, nom: 'Sono', prix: 20000, image: '/image/sono.jpg' },
    { id: 12, nom: 'Fût', prix: 3000, image: '/image/fut.jpg' }
  ]

  // Quantités
  const [quantites, setQuantites] = useState(
    Object.fromEntries(services.map(s => [s.id, 0]))
  )

  // Total
  const total = services.reduce(
    (sum, s) => sum + s.prix * quantites[s.id],
    0
  )

  // Nombre d’articles sélectionnés
  const itemsCount = Object.values(quantites).reduce(
    (sum, q) => sum + (q > 0 ? 1 : 0),
    0
  )

  const handleChange = (id, value) => {
    setQuantites(prev => ({ ...prev, [id]: Number(value) }))
  }

  const handleCheckout = () => {
    const items = services
      .filter(s => quantites[s.id] > 0)
      .map(s => ({ ...s, quantite: quantites[s.id] }))

    if (items.length === 0) {
      alert('Sélectionnez au moins un article')
      return
    }

    navigate('/checkout', { state: { items, total } })
  }

  return (
    <section className="max-w-6xl mx-auto p-8 bg-[#eef2e6] min-h-screen">
      <h1 className="text-4xl font-bold text-center mb-10">
        Nos Services
      </h1>

      {/* GRILLE DES ARTICLES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {services.map(service => (
          <div
            key={service.id}
            className="bg-white rounded-xl shadow-md p-4 flex flex-col items-center hover:shadow-xl transition"
          >
            {/* IMAGE AVEC ZOOM */}
            <div className="w-full aspect-square rounded-xl overflow-hidden bg-gray-100">
              <img
                src={service.image}
                alt={service.nom}
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
              />
            </div>

            {/* INFOS */}
            <h2 className="mt-4 text-lg font-semibold text-center">
              {service.nom}
            </h2>

            <p className="text-indigo-600 font-bold mt-1">
              {service.prix.toLocaleString()} FCFA
            </p>

            {/* QUANTITÉ */}
            <input
              type="number"
              min="0"
              value={quantites[service.id]}
              onChange={e => handleChange(service.id, e.target.value)}
              className="mt-3 w-20 text-center border rounded-md py-1 focus:ring-2 focus:ring-indigo-400"
            />
          </div>
        ))}
      </div>

      {/* TOTAL */}
      <div className="mt-10 flex flex-col items-end">
        <p className="text-2xl font-bold">
          Total : {total.toLocaleString()} FCFA
        </p>

      
      </div>

      {/* PANIER FLOTTANT */}
      <FloatingCart
        itemsCount={itemsCount}
        total={total}
        onCheckout={handleCheckout}
      />
    </section>
  )
}
