import FeatureHighlights from '@/components/ContactUs/FeatureHighlights'
import GetInTouch from '@/components/ContactUs/GetInTouch'
import Footer from '@/components/Layout/Footer'
import Navbar from '@/components/Layout/Navbar'
import React from 'react'

const page = () => {
  return (
    <div>
        <Navbar/>
        <GetInTouch/>
        <FeatureHighlights/>
        <Footer/>
    </div>
  )
}

export default page