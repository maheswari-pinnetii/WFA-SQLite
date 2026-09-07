import * as React from "react"
import { cn } from "../../lib/utils"

const TooltipProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>

const Tooltip = ({ children }: { children: React.ReactNode }) => (
  <div className="group relative inline-block">{children}</div>
)

const TooltipTrigger = ({ children }: { children: React.ReactNode }) => (
  <>{children}</>
)

const TooltipContent = ({ className, children }: { className?: string, children: React.ReactNode }) => (
  <div
    className={cn(
      "absolute z-50 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition duration-300 bottom-full mb-2 left-1/2 -translate-x-1/2 px-3 py-1.5 text-xs text-white bg-slate-900 rounded-md shadow-sm whitespace-nowrap",
      className
    )}
  >
    {children}
    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
  </div>
)

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
