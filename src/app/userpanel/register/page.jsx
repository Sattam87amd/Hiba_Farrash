import React, { Suspense } from 'react'
import Footer from '@/components/UserPanel/Layout/Footer'
import UserRegisterPage from '@/components/UserPanel/UserRegister/UserRegister'

const Page = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div>
        <UserRegisterPage />
        <Footer />
      </div>
    </Suspense>
  )
}

export default Page
