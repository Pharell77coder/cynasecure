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
    "bg-blue-600 text-white hover:bg-blue-500 active:scale-[0.98] border border-blue-500/40 hover:shadow-lg hover:shadow-blue-600/20",

  outline:
    "border border-gray-700 text-gray-300 hover:border-blue-500 hover:text-blue-400 hover:bg-gray-800/40",

  ghost:
    "text-gray-400 hover:text-white hover:bg-gray-800/40",

  danger:
    "bg-red-600 text-white hover:bg-red-500 active:scale-[0.98] border border-red-500/40",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
  icon: "h-10 w-10 flex items-center justify-center",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", fullWidth, children, ...rest }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-none font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 disabled:opacity-50 disabled:pointer-events-none",
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
