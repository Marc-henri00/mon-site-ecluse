import React from 'react'
import { Routes, Route } from 'react-router-dom'

import Navbar from './components/Navbar'
import Footer from './components/Footer'
import BackButton from './components/BackButton'

import Home from './pages/Home'
import Services from './pages/Services'
import Apropos from './pages/Apropos'
import Contact from './pages/Contact'
import Devis from './pages/Devis'
import QuoteConfirm from './pages/QuoteConfirm'
import Checkout from './pages/Checkout'
import OrderConfirm from './pages/OrderConfirm'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'

export default function App() {
  return (
    <div className="body flex flex-col min-h-screen">
      <Navbar />
      <BackButton />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/apropos" element={<Apropos />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/devis" element={<Devis />} />
          <Route path="/devis/confirmation" element={<QuoteConfirm />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/commande/confirmation" element={<OrderConfirm />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </main>

      <Footer />
    </div>
  )
}
