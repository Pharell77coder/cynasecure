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
    "bg-gradient-to-br from-blue-600 to-blue-700 text-white " +
    "hover:from-blue-500 hover:to-blue-600 " +
    "active:scale-[0.97] active:from-blue-700 active:to-blue-800 " +
    "shadow-sm hover:shadow-md hover:shadow-blue-600/20 " +
    "border border-blue-500/30",

  outline:
    "border border-gray-700 text-gray-300 bg-transparent " +
    "hover:border-blue-500/60 hover:text-blue-400 hover:bg-blue-500/5 " +
    "active:scale-[0.97]",

  ghost:
    "text-gray-400 bg-transparent " +
    "hover:text-white hover:bg-white/8 " +
    "active:scale-[0.97]",

  danger:
    "bg-gradient-to-br from-red-600 to-red-700 text-white " +
    "hover:from-red-500 hover:to-red-600 " +
    "active:scale-[0.97] border border-red-500/30",
};

const sizes: Record<Size, string> = {
  sm:   "h-9 px-3.5 text-sm gap-1.5",
  md:   "h-11 px-5 text-sm gap-2",
  lg:   "h-12 px-6 text-sm gap-2",
  icon: "h-10 w-10 flex items-center justify-center",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", fullWidth, children, ...rest }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-none font-semibold",
        "transition-all duration-200 ease-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-1 focus-visible:ring-offset-transparent",
        "disabled:opacity-50 disabled:pointer-events-none",
        "cursor-pointer",
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
