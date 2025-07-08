import UserRegisterPage from '@/components/UserPanel/UserLogin/UserRegister'
import React, { Suspense } from 'react'
// import Footer from '@/components/UserPanel/Layout/Footer'
import Footer from '@/components/Layout/Footer'

const page = () => {
  return (
     <Suspense fallback={<div>Loading...</div>}>
      <div>
        <UserRegisterPage />
        <Footer />
      </div>
    </Suspense>
  )
}

export default page