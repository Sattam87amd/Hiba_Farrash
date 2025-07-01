import Footer from '@/components/Layout/Footer'
import LoginPage from '@/components/ExpertPanel/RegisterLogin/Login.jsx'
import React from 'react'

const page = () => {
  return (
    <div>
      <LoginPage/>
      <div className='hidden sm:block'>
  <Footer/>
</div>

    </div>
  )
}
export default page