import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Badge — copied from main app (components/ui/badge.tsx) and extended with
 * reconciliation-specific variants: positive, warning, critical, ai.
 */
const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        // ── Reconciliation-specific variants ──────────────────────────────
        positive:
          "border-[rgba(0,232,157,0.3)] bg-[rgba(0,232,157,0.12)] text-positive",
        neutral:
          "border-[rgba(0,120,255,0.25)] bg-[rgba(0,120,255,0.08)] text-primary",
        warning:
          "border-[rgba(255,89,5,0.25)] bg-[rgba(255,89,5,0.08)] text-warning",
        critical:
          "border-[rgba(255,39,95,0.25)] bg-[rgba(255,39,95,0.08)] text-destructive",
        ai:
          "border-[rgba(0,120,255,0.25)] bg-[rgba(0,120,255,0.08)] text-primary",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
