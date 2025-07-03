import RegisterForm from '@/components/ExpertPanel/RegisterForm/RegisterForm'
import Footer from '@/components/Layout/Footer'
import React from 'react'

const page = () => {
  return (
    <div>
      <RegisterForm/>
  
    <div className='hidden sm:block'>
    <Footer/>
  </div>
  </div>
  
  )
}

export default page;