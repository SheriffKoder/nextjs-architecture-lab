import React from 'react'
import Index from '@/features/reports-newsletter-tracker'
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
