'use client'
import GlassLoginForm from '@/screens/login/components/glass-login-form'
import '@/screens/login/styles/login-background.css'
import BlurGrid from '@/screens/login/components/blur-grid'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
// import '../features/login/styles/login-background.css'
// import '../features/login/styles/login-background-light.css'
import '../screens/login/styles/main-background.css'

const HOME_PATH = process.env.NEXT_PUBLIC_HOME_PATH || '/dashboard'

const page = () => {
  const router = useRouter()

  const handleSubmit = async (_email: string, _password: string) => {
    router.push(HOME_PATH)
  }

  return (
    <div className='flex h-screen w-full items-center justify-start 
    bg-background
    flex-row'>
            

            {/* <div className='absolute inset-0 login-background-light dark:hidden z-0 left-[30%] blur-3xl opacity-40 lg:opacity-70'></div> */}
            {/* <div className='absolute inset-0 login-background-dark hidden dark:block z-0'></div> */}
            <div className='absolute inset-0 main-background opacity-80 dark:opacity-40 block z-0'></div>

            <div className='absolute inset-0 z-1'>
                <BlurGrid />
            </div>

            <div className='w-full lg:w-[50%] h-full flex flex-col items-center justify-center z-[10] relative'>
                
                {/* Form */}
                <div className='w-[340px] flex flex-col items-center justify-center'>

                    {/* Logo */}
                    <div className='mx-auto mb-8'>
                        <Image src='/images/revilo-logo-full.png' alt='logo' width={200} height={100} />
                    </div>

                    <GlassLoginForm
                        theme='dark'
                        size='md'
                        labelPosition='top'
                        onSubmit={handleSubmit}
                        isLoading={false}
                        error={null}
                    />
                </div>
            </div>


            



    </div>
  )
}

export default page
