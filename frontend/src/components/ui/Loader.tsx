import React from "react";

export function Loader({ label = "Chargement..." }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-12 text-muted-foreground">
      <span
        className="h-5 w-5 animate-spin rounded-full border-2 border-primary/40 border-t-primary"
        aria-hidden="true"
      />
      <span className="text-sm">{label}</span>
    </div>
  );
}
