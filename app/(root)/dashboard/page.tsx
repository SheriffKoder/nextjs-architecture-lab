import { connection } from 'next/server'
import Index from '@/features/dashboard'

export default async function Page() {
  await connection()
  return <Index />
}
