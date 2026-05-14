import React from "react";
import { useToast } from "../../hooks/useToast";
import { cn } from "../../lib/utils";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

export function Toast() {
  const { items, dismiss } = useToast();

  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      {items.map((t) => (
        <div
          key={t.id}
          className={cn(
            "pointer-events-auto flex items-center gap-3 rounded-lg border bg-background px-4 py-3 shadow-sm transition-all",
            t.variant === "success" && "border-success/40",
            t.variant === "error" && "border-destructive/40",
            t.variant === "default" && "border-border",
          )}
        >
          {/* Icone */}
          {t.variant === "success" && (
            <CheckCircle2 className="h-5 w-5 text-success" />
          )}
          {t.variant === "error" && (
            <AlertCircle className="h-5 w-5 text-destructive" />
          )}

          {/* Message */}
          <span className="text-sm text-foreground">{t.message}</span>

          {/* Bouton fermer */}
          <button
            onClick={() => dismiss(t.id)}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Fermer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
