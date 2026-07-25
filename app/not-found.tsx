import { redirect } from 'next/navigation'

const HOME_PATH = process.env.NEXT_PUBLIC_HOME_PATH || '/dashboard'

export default function NotFound() {
  redirect(HOME_PATH)
}
