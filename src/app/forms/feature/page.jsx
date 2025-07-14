"use client"
import React from 'react'      
import Footer from '@/components/Layout/Footer'
import Navbar from '@/components/Layout/Navbar'
// import Chatbot from '@/components/Chatbot/Chatbot'
import Feature from '@/components/Forms/Feature/Feature'


const page = () => {
  return (
   <>
   <Navbar/>
   <Feature/>
   <Footer/>
   {/* <Chatbot/> */}
   </>
  )
}

export default page
