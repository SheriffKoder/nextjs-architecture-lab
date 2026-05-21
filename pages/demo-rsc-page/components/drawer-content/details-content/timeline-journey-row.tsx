import { TimelineJourneyItem } from './timeline-journey'

const colorVariants = {
  blue: {
    bg: 'bg-[#1C3851]',
    border: 'border-[#254F74]'
  },
  green: {
    bg: 'bg-[#327D5E]',
    border: 'border-[#385348]'
  },
  red: {
    bg: 'bg-[#573232]',
    border: 'border-[#713D3D]'
  }
}

export const TimelineJourneyRow = ({ item, variant }: { item: TimelineJourneyItem, variant: 'sm' | 'md' | 'lg' }) => {
  const colors = colorVariants[item.color]

  return (
    <div className="flex flex-row gap-4 w-full">
      
      {variant !== 'sm' && (
        <div className="w-[10%] min-w-[100px] my-auto">
          <p className="text-xs sm:text-sm text-foreground/50">{item.date}</p>
        </div>
      )}

      <div className="min-w-[2px] self-stretch bg-slate-500 dark:bg-white relative ml-4 mr-8">
        {/* Circle indicator */}
        <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-slate-500 dark:bg-white border-2 border-slate-500 dark:border-white"
        style={{ top: variant === 'sm' ? 'calc(50% + 12px)' : variant === 'md' ? '50%' : '50%' }}
        ></div>
      </div>

    <div className={`flex flex-col w-full ${variant === 'sm' ? 'my-2' : variant === 'md' ? 'my-4' : 'my-6'}`}>
      {variant === 'sm' && (
        <p className="text-xs sm:text-sm text-foreground/50 mb-1">{item.date}</p>
      )}

      <div className={`flex-1 relative ${colors.bg} border p-3 rounded-md`}
      style={{ borderColor: colors.border }}>
        {/* Triangle tooltip on the left */}
        <div 
          className={`absolute left-[3px] top-1/2 -translate-y-1/2 -translate-x-full w-0 h-0`}
          style={{
            borderTop: '8px solid transparent',
            borderBottom: '8px solid transparent',
            borderRight: `8px solid ${item.color === 'blue' ? '#1C3851' : item.color === 'green' ? '#327D5E' : '#573232'}`
          }}
        ></div>
                
        <div className="flex-1" style={{ fontSize: variant === 'sm' ? '12px' : variant === 'md' ? '14px' : '16px' }}>
          <h3 className="font-semibold mb-1 text-white">{item.title}</h3>
          <p className="font-normal dark:font-light text-white/60 mb-1">{item.description}</p>
        </div>
      </div>
    </div>
    </div>
  )
}
