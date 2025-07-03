"use client"
import React from 'react'
import Footer from '@/components/Layout/Footer'
import Navbar from '@/components/Layout/Navbar'
import Chatbot from '@/components/HomePage/ChatBot'
import NewTopic from '@/components/Forms/NewTopic/NewTopic'

const page = () => {
  return (
   <>
   <Navbar/>
   <NewTopic/>
   <Footer/>
   <Chatbot/>
   </>
  )
}

export default page
