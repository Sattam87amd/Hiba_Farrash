import WalletCallbackPage from '@/components/ExpertPanel/wallet/callback/callback'
import WalletFailedPage from '@/components/ExpertPanel/wallet/failed/failed'
import React, { Suspense } from 'react'

const Page = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <WalletFailedPage />
    </Suspense>
  )
}

export default Page
