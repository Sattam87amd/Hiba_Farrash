"use client"
import React from 'react'
import Feedback from '@/components/Forms/Feedback/Feedback'
import Footer from '@/components/Layout/Footer'
import Navbar from '@/components/Layout/Navbar'
// import Chatbot from '@/components/HomePage/ChatBot'

const page = () => {
  return (
   <>
   <Navbar/>
   <Feedback/>
   <Footer/>
   {/* <Chatbot/> */}
   </>
  )
}

export default page
