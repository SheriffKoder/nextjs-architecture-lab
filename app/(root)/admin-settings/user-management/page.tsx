import Index from '@/features/admin-user-management'
import React, { Suspense } from 'react'
import Loading from '@/components/ui/loading'

const page = () => {
  return (
    <Suspense fallback={<Loading />}>
      <Index />
    </Suspense>
  )
}

export default page
