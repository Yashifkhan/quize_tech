import React from 'react'
import RegisterForm from './components/RegisterForm'
import LoginPage from './components/LoginPage'
import { useNavigate } from 'react-router-dom'
import TopHeader from './components/TopHeader'

const Home = () => {
    const naviagat = useNavigate()

    const navigateToRegister = () => {
        naviagat('/register')

    }
    const navigateToLogin = () => {
        naviagat('/login')

    }

    return (
        <div>
            <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
                <TopHeader></TopHeader>
            </div>
        </div>

    )
}

export default Home

