import Index from '@/features/reports-distributions'
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
