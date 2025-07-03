import React, { Suspense } from 'react'
import WalletCallbackPage from '@/components/UserPanel/wallet/callback/callback.jsx'

const Page = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <WalletCallbackPage />
    </Suspense>
  )
}

export default Page
  