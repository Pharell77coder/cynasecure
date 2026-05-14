import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "../../lib/utils";
import React from "react";

type Variant = "primary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg" | "icon";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-primary text-primary-foreground hover:bg-primary/90",
  outline:
    "border border-border text-foreground hover:border-primary hover:text-primary bg-transparent",
  ghost:
    "text-muted-foreground hover:text-foreground hover:bg-muted",
  danger:
    "bg-destructive text-destructive-foreground hover:bg-destructive/90",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
  icon: "h-10 w-10",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", fullWidth, children, ...rest }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  ),
);

Button.displayName = "Button";
