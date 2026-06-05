import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useToast } from "../../hooks/useToast";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { cn } from "../../lib/utils";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

export function Toast() {
  const { items, dismiss } = useToast();
  const reducedMotion = useReducedMotion();
  const duration = reducedMotion ? 0 : 0.2;

  return (
    <div aria-live="polite" aria-atomic="false" className="pointer-events-none fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      <AnimatePresence mode="popLayout">
        {items.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration, ease: "easeOut" }}
            className={cn(
              "pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-none",
              "bg-gray-900 border border-gray-800 shadow-sm",
              t.variant === "success" && "border-green-500/40 bg-green-500/10",
              t.variant === "error" && "border-red-500/40 bg-red-500/10",
              t.variant === "default" && "border-gray-700",
            )}
          >
            {t.variant === "success" && (
              <CheckCircle2 className="h-5 w-5 text-green-400" />
            )}
            {t.variant === "error" && (
              <AlertCircle className="h-5 w-5 text-red-400" />
            )}

            <span className="text-sm text-gray-200 font-mono tracking-wider">
              {t.message}
            </span>

            <button
              onClick={() => dismiss(t.id)}
              className="text-gray-500 hover:text-white transition"
              aria-label="Fermer"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
