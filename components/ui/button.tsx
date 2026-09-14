import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-sky-500 text-slate-950 font-semibold hover:bg-sky-400 shadow-sm shadow-sky-500/20",
        destructive:
          "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/40",
        outline:
          "border border-slate-700/80 bg-slate-900/60 hover:bg-slate-800 hover:text-slate-100 hover:border-slate-600 text-slate-300",
        secondary:
          "bg-slate-800/80 text-slate-200 hover:bg-slate-700/80 border border-slate-700/40",
        ghost:
          "hover:bg-slate-800/80 hover:text-slate-100 text-slate-400",
        link: "text-sky-400 underline-offset-4 hover:underline",
        glow: "bg-gradient-to-r from-sky-500 to-blue-600 text-slate-950 font-semibold shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 hover:brightness-110",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-11 rounded-lg px-8 text-base",
        icon: "h-9 w-9 p-0",
        iconSm: "h-8 w-8 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
