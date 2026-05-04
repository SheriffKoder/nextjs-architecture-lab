import Index from '@/features/portfolio-investors'
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
