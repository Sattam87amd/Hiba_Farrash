import Footer from '@/components/Layout/Footer'
import Navbar from '@/components/Layout/Navbar'
import RefundPolicy from '@/components/Policies/RefundPolicy'
import React from 'react'

const page = () => {
  return (
    <div className='w-screen h-screen overflow-x-hidden'>
        <Navbar/>
        <RefundPolicy/>
        <Footer/>
    </div>
  )
}

export default page