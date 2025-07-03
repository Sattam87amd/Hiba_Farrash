'use client';
import Footer from '@/components/Layout/Footer';
import Navbar from '@/components/Layout/Navbar';
import CancellationPolicy from '@/components/Policies/CancellationPolicy';
import React from 'react'

const page = () => {
  return (
    <div className='w-screen h-screen overflow-x-hidden'>
        <Navbar/>
        <CancellationPolicy/>
        <Footer/>
    </div>
  )
}

export default page