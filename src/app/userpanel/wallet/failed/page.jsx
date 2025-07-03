import React, { Suspense } from 'react'
import WalletFailedPage from '@/components/UserPanel/wallet/failed/failed'

const Page = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <WalletFailedPage />
    </Suspense>
  )
}

export default Page
