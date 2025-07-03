import Footer from '@/components/Layout/Footer'
import Navbar from '@/components/Layout/Navbar'
import PrivacyPolicy from '@/components/Policies/PrivacyPolicy'
import React from 'react'

const page = () => {
  return (
    <div className='w-screen h-screen overflow-x-hidden'>
        <Navbar/>
        <PrivacyPolicy/>
        <Footer/>
    </div>
  )
}

export default page