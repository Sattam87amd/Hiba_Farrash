'use client';

import Footer from '@/components/Layout/Footer';
import Navbar from '@/components/Layout/Navbar';
import ProductPricing from '@/components/Policies/ProductPricing';
import React from 'react'

const page = () => {
  return (
    <div className='w-screen h-screen overflow-x-hidden'>
        <Navbar/>
        <ProductPricing/>
        <Footer/>
    </div>
  )
}

export default page