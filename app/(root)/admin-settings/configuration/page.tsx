import React from 'react'
import Index from '@/features/admin-configuration'
import Loading from '@/components/ui/loading'
import { Suspense } from 'react'
const page = () => {
  return (
    <Suspense fallback={<Loading />}>
      <Index />
    </Suspense>
  )
}

export default page
