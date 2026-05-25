import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebase'
import Login from './components/Login'
import MainApp from './components/MainApp'
import './App.css'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="splash">
        <div className="splash-logo">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="22" stroke="#00d9ff" strokeWidth="2"/>
            <path d="M14 24C14 18.477 18.477 14 24 14C29.523 14 34 18.477 34 24C34 26.5 33.1 28.8 31.6 30.6L34 36L28 34C26.8 34.6 25.4 35 24 35C18.477 35 14 30.523 14 25" stroke="#00d9ff" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span>ChatApp</span>
        </div>
        <div className="splash-spinner"/>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route path="/*" element={user ? <MainApp user={user} /> : <Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
