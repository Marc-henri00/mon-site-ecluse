import React from 'react'

export default function FloatingCart({ itemsCount, total, onCheckout }) {
  if (itemsCount === 0) return null

  return (
    <div className="floating-cart fixed bottom-6 right-6 bg-indigo-600 text-white rounded-xl shadow-lg p-4 w-64 z-50">
      <h3 className="font-bold text-lg mb-1">🛒 Panier</h3>

      <p>{itemsCount} article(s)</p>

      <p className="font-semibold mt-1">
        Total : {total.toLocaleString()} FCFA
      </p>

      <button
        onClick={onCheckout}
        className="mt-3 w-full bg-white text-indigo-600 font-bold py-2 rounded-md hover:bg-gray-100 transition"
      >
        Commander
      </button>
    </div>
  )
}
