import * as React from "react"

function Input({ className = '', type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={`cursor-pointer px-4 py-2 border border-foreground/10 dark:border-foreground/5 bg-[#f1f1f1] dark:bg-[#131313] text-foreground hover:bg-foreground/5 dark:hover:bg-foreground/10 text-sm font-medium rounded-md transition-colors ${className}`}
      {...props}
    />
  )
}

export { Input }

