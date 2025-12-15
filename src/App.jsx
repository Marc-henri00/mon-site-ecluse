import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import BackButton from './components/BackButton'
import Home from './pages/Home'
import Services from './pages/Services'
import Apropos from './pages/Apropos'
import Contact from './pages/Contact'

export default function App() {
  return (
    <div className="body">
      <Navbar />
      <BackButton />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/apropos" element={<Apropos />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
