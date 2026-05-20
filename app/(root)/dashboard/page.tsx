'use client'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import React from 'react'

const page = () => {
    const router = useRouter()
  return (
    <div className='flex flex-col items-center justify-center h-screen'>
      {/* button to demo-rsc-page */}
      <Button variant="outline" onClick={() => router.push('/demo-rsc-page')}>Demo RSC Page</Button>
    </div>
  )
}

export default page
