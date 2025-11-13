import axios from 'axios'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';

const BASE_URL = import.meta.env.VITE_APP_BASE_URL;

const RegisterForm = () => {
    const navigate = useNavigate()
    const [registerData, setRegisterData] = useState({
        name: '', email: '', password: '', phone: '', interest: ''
    })

    const handleRegister = (e) => {
        const { name, value } = e.target
        setRegisterData({ ...registerData, [name]: value })
    }


    const submitRegister = async (e) => {
        e.preventDefault()
        if (!registerData.name || !registerData.email || !registerData.password || !registerData.phone || !registerData.interest) {
            return alert("All filds are reuqired")
        } else {
            try {
                const resp = await axios.post(`${BASE_URL}/register`, registerData)
                console.log("resp of register new user", resp);
                if (resp?.data?.success) {
                    navigate('/login')
                }
            } catch (error) {
                console.log("user not register");
                
                
            }

        }

    }



    return (
   <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
  <h1 className="text-3xl font-bold mb-6 mt-25">Welcome to Quiz Tech</h1>

  <div className="w-full max-w-md p-6 border rounded-xl shadow-md bg-white">
    <h1 className="text-2xl font-semibold text-center">Register</h1>

    <form className="flex flex-col gap-2">
      {/* Name */}
      <div className="flex flex-col">
        <label htmlFor="name" className="font-medium">Name</label>
        <input
          value={registerData.name}
          name="name"
          onChange={handleRegister}
          type="text"
          id="name"
          placeholder="Enter your name"
          className="border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* Email */}
      <div className="flex flex-col">
        <label htmlFor="email" className="font-medium">Email</label>
        <input
          value={registerData.email}
          name="email"
          onChange={handleRegister}
          type="email"
          id="email"
          placeholder="Enter your email"
          className="border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* Password */}
      <div className="flex flex-col">
        <label htmlFor="password" className="font-medium">Password</label>
        <input
          value={registerData.password}
          name="password"
          onChange={handleRegister}
          type="password"
          id="password"
          placeholder="Enter your password"
          className="border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* Phone */}
      <div className="flex flex-col">
        <label htmlFor="phone" className="font-medium">Phone</label>
        <input
          value={registerData.phone}
          name="phone"
          onChange={handleRegister}
          type="text"
          id="phone"
          placeholder="Enter your phone number"
          className="border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* Interest */}
      <div className="flex flex-col">
        <label htmlFor="interest" className="font-medium">Interest</label>
        <input
          value={registerData.interest}
          name="interest"
          onChange={handleRegister}
          type="text"
          id="interest"
          placeholder="Enter your interests (e.g. DSA, React, Node)"
          className="border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* Submit */}
      <button
        onClick={(e) => submitRegister(e)}
        type="submit"
        className="bg-green-600 text-white font-semibold py-2 rounded-md hover:bg-green-700 mt-3"
      >
        Register
      </button>

      {/* Link to Login */}
      <p className="text-sm text-center mt-2">
        Already have an account?
        <a href="/login" className="text-red-600 hover:underline ml-1">Login</a>
      </p>
    </form>
  </div>
</div>

    )
}

export default RegisterForm
