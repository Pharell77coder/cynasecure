import { HTMLAttributes } from "react";
import { cn } from "../../lib/utils";
import React from "react";

export function Card({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        // Base XDR : sombre, carré, technique
        "bg-gray-900 border border-gray-800 rounded-none p-6",

        "transition-[colors,transform,box-shadow] duration-200 hover:bg-gray-800 hover:border-white/10 hover:-translate-y-0.5 hover:ring-1 hover:ring-white/10 hover:shadow-md",

        "shadow-sm",

        className,
      )}
      {...rest}
    />
  );
}
