interface DetailRowProps {
  label: string
  value: string | number | null | undefined
}

const DetailRow = ({ label, value }: DetailRowProps) => {
  const displayValue = value === null || value === undefined ? 'N/A' : String(value)

  return (
    <div className="flex items-center justify-between px-3 py-2 hover:bg-foreground/5 transition-colors group">
      <span className="text-sm text-foreground group-hover:text-tertiary">{label}</span>
      <span className="text-sm text-foreground/70 font-normal dark:font-normal dark:font-extralight group-hover:text-tertiary">{displayValue}</span>
    </div>
  )
}

export default DetailRow
