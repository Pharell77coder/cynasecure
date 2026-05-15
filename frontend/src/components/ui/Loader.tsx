import React from "react";

export function Loader({ label = "Chargement..." }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-12 text-gray-400">

      {/* Spinner XDR */}
      <span
        aria-hidden="true"
        className="
          h-5 w-5 border-2 border-gray-700 border-t-blue-500 
          animate-spin rounded-none
        "
      />

      {/* Label */}
      <span className="text-sm font-mono tracking-widest text-gray-300">
        {label}
      </span>
    </div>
  );
}
