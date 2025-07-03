import React from 'react'
import Navbar from '@/components/Layout/Navbar'
import FaQ from '@/components/ExpertPanel/FaQ/FaQ'
import Footer from '@/components/Layout/Footer'
import FrequentlyAskedQuestions from '@/components/ExpertPanel/FaQ/FrequentlyAskedQuestions'

const page = () => {
  return (
    <div>
        <Navbar/>
        <FaQ/>
        <FrequentlyAskedQuestions/>
        <Footer/>
    </div>
  )
}

export default page