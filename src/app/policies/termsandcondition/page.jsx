import Footer from "@/components/Layout/Footer"
import Navbar from "@/components/Layout/Navbar"
import TermsAndConditions from "@/components/Policies/TermsAndConditions"
import React from "react"

const page = () => {
  return (
    <div className='w-screen h-screen overflow-x-hidden'>
        <Navbar/>
        <TermsAndConditions/>
        <Footer/>
    </div>
  )
}

export default page