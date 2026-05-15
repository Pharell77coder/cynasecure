import { InputHTMLAttributes, forwardRef, ReactNode } from "react";
import { cn } from "../../lib/utils";
import React from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, ...rest }, ref) => (
    <div className="relative">
      {icon && (
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
          {icon}
        </span>
      )}

      <input
        ref={ref}
        className={cn(
          // Base XDR : sombre, carré, technique
          "h-11 w-full bg-gray-900 border border-gray-800 text-gray-200 text-sm rounded-none",

          // Placeholder
          "placeholder:text-gray-500",

          // Focus state XDR : bleu discret, pas flashy
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:border-blue-500",

          // Transition
          "transition-all duration-150",

          // Gestion de l’icône
          icon ? "pl-10 pr-4" : "px-4",

          className,
        )}
        {...rest}
      />
    </div>
  ),
);

Input.displayName = "Input";
