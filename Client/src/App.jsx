import { useState } from 'react'
import Home from './Home'
import React from 'react'
import { BrowserRouter, Route, Router, Routes } from 'react-router-dom'
import LoginPage from './components/LoginPage'
import RegisterForm from './components/RegisterForm'
import AdminPage from './adminComponents/AdminPage'
import UserPage from './userComponents/UserPage'
import TopHeader from './components/TopHeader'

function App() {

  return (
    <>

    <BrowserRouter>
      <TopHeader></TopHeader>
    <Routes>
      <Route path='/' element={<Home></Home>}></Route>
      <Route path='/login' element={<LoginPage></LoginPage>}></Route>
      <Route path='/register' element={<RegisterForm></RegisterForm>}></Route>
      <Route path='/adminPage' element={<AdminPage></AdminPage>}></Route>
      <Route path='/userPage' element={<UserPage></UserPage>}></Route>
    </Routes>
       
    </BrowserRouter>
    </>
  )
}

export default App
