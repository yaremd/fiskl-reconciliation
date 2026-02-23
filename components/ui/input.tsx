// Copied from main app: components/ui/input.tsx
import * as React from "react"
import { cn } from "@/lib/utils"

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  selectAllOnFocus?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, onFocus, selectAllOnFocus = true, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "dark:bg-input/30 border-input focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 disabled:bg-input/50 dark:disabled:bg-input/80 h-10 rounded-lg border bg-transparent px-2.5 py-1 text-base transition-colors file:h-6 file:text-sm file:font-medium focus-visible:ring-3 aria-invalid:ring-3 md:text-sm file:text-foreground placeholder:text-muted-foreground w-full min-w-0 outline-none file:inline-flex file:border-0 file:bg-transparent disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        onFocus={(e) => {
          if (selectAllOnFocus) e.currentTarget.select();
          onFocus?.(e);
        }}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
