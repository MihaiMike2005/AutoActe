"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-ring]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[--color-background] disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-[--color-primary] text-[--color-primary-foreground] shadow-sm hover:bg-[--color-primary-dark]",
        secondary:
          "bg-[--color-secondary] text-[--color-secondary-foreground] border border-[--color-border] hover:bg-white",
        outline:
          "border border-[--color-border] bg-transparent text-[--color-foreground] hover:bg-[--color-secondary]",
        ghost:
          "bg-transparent text-[--color-foreground] hover:bg-[--color-secondary]",
        destructive:
          "bg-[--color-danger] text-[--color-danger-foreground] hover:bg-red-600 shadow-sm",
        success:
          "bg-[--color-success] text-[--color-success-foreground] hover:bg-emerald-600 shadow-sm",
        link: "bg-transparent text-[--color-primary] hover:underline underline-offset-4 px-0",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        default: "h-10 px-4",
        lg: "h-12 px-6 text-base",
        xl: "h-14 px-8 text-base",
        icon: "h-10 w-10 p-0",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { buttonVariants };
