import WalletCallbackPage from '@/components/ExpertPanel/wallet/callback/callback'
import React, { Suspense } from 'react'

const Page = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <WalletCallbackPage />
    </Suspense>
  )
}

export default Page
  