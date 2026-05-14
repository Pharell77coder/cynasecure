import { InputHTMLAttributes, forwardRef, ReactNode } from "react";
import { cn } from "../../lib/utils";
import React from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, ...rest }, ref) => (
    <div className="relative">
      {icon != null && (
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          {icon}
        </span>
      )}
      <input
        ref={ref}
        className={cn(
          "h-11 w-full rounded-lg border border-border bg-input px-4 text-sm text-foreground placeholder:text-muted-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary transition-colors",
          icon != null ? "pl-10" : undefined,
          className,
        )}
        {...rest}
      />
    </div>
  ),
);
Input.displayName = "Input";
