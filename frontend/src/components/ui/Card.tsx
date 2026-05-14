import { HTMLAttributes } from "react";
import { cn } from "../../lib/utils";
import React from "react";

export function Card({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-surface p-6 transition-colors hover:border-primary/40",
        className,
      )}
      {...rest}
    />
  );
}
