import React, { Suspense } from 'react'
import WalletSuccessPage from '@/components/UserPanel/wallet/success/success'

const Page = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <WalletSuccessPage />
    </Suspense>
  )
}

export default Page
