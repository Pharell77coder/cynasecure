import React from "react";
import { useToast } from "../../hooks/useToast";
import { cn } from "../../lib/utils";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

export function Toast() {
  const { items, dismiss } = useToast();

  return (
    <div aria-live="polite" aria-atomic="false" className="pointer-events-none fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      {items.map((t) => (
        <div
          key={t.id}
          className={cn(
            // Base XDR : sombre, carré, technique
            "pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-none",
            "bg-gray-900 border border-gray-800 shadow-sm",

            // Animation sobre
            "animate-fade-in transition-all duration-150",

            // Variants XDR
            t.variant === "success" && "border-green-500/40 bg-green-500/10",
            t.variant === "error" && "border-red-500/40 bg-red-500/10",
            t.variant === "default" && "border-gray-700",
          )}
        >
          {/* Icône */}
          {t.variant === "success" && (
            <CheckCircle2 className="h-5 w-5 text-green-400" />
          )}
          {t.variant === "error" && (
            <AlertCircle className="h-5 w-5 text-red-400" />
          )}

          {/* Message */}
          <span className="text-sm text-gray-200 font-mono tracking-wider">
            {t.message}
          </span>

          {/* Bouton fermer */}
          <button
            onClick={() => dismiss(t.id)}
            className="text-gray-500 hover:text-white transition"
            aria-label="Fermer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
