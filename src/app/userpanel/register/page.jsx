import UserRegisterPage from '@/components/UserPanel/UserLogin/UserRegister'
import React from 'react'

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