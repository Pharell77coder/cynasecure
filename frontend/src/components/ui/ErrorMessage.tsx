import { cn } from "../../lib/utils";
import React from "react";

export function ErrorMessage({
  message,
  className,
}: {
  message?: string | null;
  className?: string;
}) {
  if (!message) return null;

  return (
    <p
      role="alert"
      className={cn(
        // Style XDR : sombre, carré, technique
        "border border-red-500/30 bg-red-500/10 text-red-400 font-mono tracking-widest p-3 rounded-none text-sm",

        // Hover discret (optionnel)
        "transition-colors hover:border-red-500/50",

        className,
      )}
    >
      {message}
    </p>
  );
}
