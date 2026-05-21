

const Column = ({index}: {index: number}) => {
    return (
        <div className='relative h-[100%] flex-1 -mr-[1px]'>
            <div className='backdrop-blur-[20px] dark:backdrop-blur-[200px] h-full w-full bg-gradient-to-r dark:from-[rgba(0,0,0,0.1)] dark:to-[rgba(0,0,0,0.3)] from-[rgba(255,255,255,0.1)] to-[rgba(255,255,255,0.3)] 
            relative'
            >

            </div>
            <div className='absolute inset-0 z-10 pointer-events-none'
            style={{
                boxShadow: '0 1px 4px -1px rgba(255,255,255,0.16) inset',
            }}>
            </div>
        </div>
    )
}


const BlurGrid = () => {
  return (
    <div className='h-full w-full flex items-end justify-center relative' id='blur-grid'>
        
        <div className='absolute bottom-0 right-0 flex flex-row items-center justify-center h-[100vh] z-10 w-[100vw] lg:w-[50vw] overflow-hidden'>
            <Column index={0} />
            <Column index={1} />
            <Column index={2} />
            <Column index={3} />
            <Column index={4} />
            <Column index={5} />
            <Column index={6} />
            <Column index={7} />
            <Column index={8} />

        </div>
      
    </div>
  )
}

export default BlurGrid
