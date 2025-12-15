import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

export default function BackButton(){
  const navigate = useNavigate()
  const location = useLocation()

  const handleBack = () => {
    // If there's history, go back; otherwise go to home
    if (window.history.length > 1) navigate(-1)
    else navigate('/')
  }

  // hide on home page
  if (location.pathname === '/') return null

  return (
    <button className="back-button" onClick={handleBack} aria-label="Retour">
      ← Retour
    </button>
  )
}
