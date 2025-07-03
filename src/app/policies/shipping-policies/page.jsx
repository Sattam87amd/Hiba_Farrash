'use client';

import Footer from '@/components/Layout/Footer';
import Navbar from '@/components/Layout/Navbar';
import ShippingPolicy from '@/components/Policies/ShippingPolicy';
import React from 'react'

const page = () => {
  return (
    <div className='w-screen h-screen overflow-x-hidden'>
        <Navbar/>
        <ShippingPolicy/>
        <Footer/>
    </div>
  )
}

export default page