import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors whitespace-nowrap",
  {
    variants: {
      variant: {
        default: "border-transparent bg-[--color-primary]/10 text-[--color-primary]",
        secondary: "border-[--color-border] bg-[--color-secondary] text-[--color-secondary-foreground]",
        success: "border-transparent bg-emerald-500/15 text-emerald-700",
        warning: "border-transparent bg-amber-500/15 text-amber-700",
        danger: "border-transparent bg-red-500/15 text-red-700",
        accent: "border-transparent bg-violet-500/15 text-violet-700",
        outline: "border-[--color-border] bg-transparent text-[--color-foreground]",
        muted: "border-transparent bg-slate-200/60 text-slate-700",
      },
      size: {
        sm: "text-[10px] px-2 py-0",
        default: "text-xs",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant, size }), className)} {...props} />;
}
