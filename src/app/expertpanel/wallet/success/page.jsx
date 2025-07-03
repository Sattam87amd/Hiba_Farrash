import WalletCallbackPage from '@/components/ExpertPanel/wallet/callback/callback'
import WalletSuccessPage from '@/components/ExpertPanel/wallet/success/success'
import React, { Suspense } from 'react'

const Page = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <WalletSuccessPage />
    </Suspense>
  )
}

export default Page
