import PageHeader from '@/components/layout/page-header'
import Index from '@/features/portfolio-project-board'
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
