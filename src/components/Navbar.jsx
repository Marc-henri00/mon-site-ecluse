import React, { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const location = useLocation()

  // Close mobile menu on navigation
  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  return (
    <header className="header">
      <nav className="navbar" role="navigation" aria-label="Main Navigation">
        <div className="logo">
          <img src="/image/logo.png" alt="Logo Ecluse d'Azur" />
          <span>Ecluse d'Azur</span>
        </div>

        <ul className={`nav-links ${open ? 'show' : ''}`}>
          <li>
            <NavLink to="/apropos" className={({isActive}) => isActive ? 'active' : ''}>A propos</NavLink>
          </li>
          <li>
            <NavLink to="/services" className={({isActive}) => isActive ? 'active' : ''}>Services</NavLink>
          </li>
          <li>
            <NavLink to="/contact" className={({isActive}) => isActive ? 'active' : ''}>Contact</NavLink>
          </li>
        </ul>

        <button className="hamburger" aria-label="Ouvrir le menu" aria-expanded={open} onClick={() => setOpen(!open)}>
          <span></span>
          <span></span>
          <span></span>
        </button>
      </nav>
    </header>
  )
}
