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
        "rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive",
        className,
      )}
    >
      {message}
    </p>
  );
}
