// src/components/TopHeader.jsx
import React from 'react'
import { useNavigate } from 'react-router-dom'

const TopHeader = () => {
  const navigate = useNavigate();

  return (
    <header className="w-full bg-white shadow-md fixed top-0 left-0 z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <h1 
          onClick={() => navigate('/')} 
          className="text-2xl font-bold text-green-600 tracking-wide cursor-pointer"
        >
          Quiz <span className="text-red-500">Tech</span>
        </h1>

        {/* Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => navigate('/register')}
            className="bg-red-500 text-white px-5 py-2 rounded-lg font-medium hover:bg-red-600 transition duration-300"
          >
            Register
          </button>

          <button
            onClick={() => navigate('/login')}
            className="bg-green-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-green-700 transition duration-300"
          >
            Login
          </button>
        </div>
      </div>
    </header>
  )
}

export default TopHeader
