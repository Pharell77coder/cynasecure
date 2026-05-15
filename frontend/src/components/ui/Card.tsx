import { HTMLAttributes } from "react";
import { cn } from "../../lib/utils";
import React from "react";

export function Card({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        // Base XDR : sombre, carré, technique
        "bg-gray-900 border border-gray-800 rounded-none p-6",

        // Hover discret, professionnel
        "transition-colors hover:bg-gray-800 hover:border-blue-500/30",

        // Ombre très légère, pas de glow
        "shadow-sm",

        className,
      )}
      {...rest}
    />
  );
}
