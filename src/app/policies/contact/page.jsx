
import Footer from '@/components/Layout/Footer'
import Navbar from '@/components/Layout/Navbar'
import ContactUs from '@/components/Policies/ContactUs'
import React from 'react'

const page = () => {
  return (
    <div className='w-screen h-screen overflow-x-hidden'>
        <Navbar/>
        <ContactUs/>
        <Footer/>
    </div>
  )
}

export default page