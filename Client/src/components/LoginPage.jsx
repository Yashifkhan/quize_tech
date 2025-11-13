import axios from 'axios'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';

const BASE_URL = import.meta.env.VITE_APP_BASE_URL;

const LoginPage = () => {
    const navigate=useNavigate()

    const [loginData, setLoginData] = useState({
        email: '', password: ''
    })

    const handleLogin = (e) => {
        const { name, value } = e.target
        setLoginData({ ...loginData, [name]: value })
    }

    const submitLogin = async (e) => {
        console.log("run on every call");
        e.preventDefault()
        if (!loginData.email || !loginData.password) {
            alert("All Fids are required")
        } else {
            try {
                console.log("BASE_URL", BASE_URL);
                const resp = await axios.post(`${BASE_URL}/login`, loginData)
                console.log("resp of login user", resp);

                if(resp.data.success){
                    resp.data.data === "admin" ? navigate('/adminPage') : navigate('/userPage')
                }

            } catch (error) {
                console.log("email and password is not valid");

            }


        }

    }



    return (
       <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
  <h1 className="text-3xl font-bold mb-6">Welcome to Quiz Tech</h1>

  <div className="w-full max-w-md p-6 border rounded-xl shadow-md bg-white">
    <h1 className="text-2xl font-semibold text-center mb-4">Login</h1>

    <form className="flex flex-col gap-3">
      {/* Email */}
      <div className="flex flex-col">
        <label htmlFor="email" className="font-medium">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={loginData.email}
          onChange={handleLogin}
          placeholder="Enter your email"
          className="border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* Password */}
      <div className="flex flex-col">
        <label htmlFor="password" className="font-medium">
          Password
        </label>
        <input
          type="password"
          id="password"
          name="password"
          value={loginData.password}
          onChange={handleLogin}
          placeholder="Enter your password"
          className="border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* Submit */}
      <button
        onClick={(e) => submitLogin(e)}
        type="submit"
        className="bg-green-600 text-white font-semibold py-2 rounded-md hover:bg-green-700 mt-3"
      >
        Login
      </button>

      {/* Link to Register */}
      <p className="text-sm text-center mt-2">
        Don’t have an account?
        <a href="/register" className="text-red-600 hover:underline ml-1">
          Register
        </a>
      </p>
    </form>
  </div>
</div>

    )
}

export default LoginPage
