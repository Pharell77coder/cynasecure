import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  page: number;
  total: number;
  perPage: number;
  onChange: (page: number) => void;
}

export function Pagination({ page, total, perPage, onChange }: Props) {
  const totalPages = Math.ceil(total / perPage);
  if (totalPages <= 1) return null;

  const pages: (number | "…")[] = [];

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push("…");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      pages.push(i);
    }
    if (page < totalPages - 2) pages.push("…");
    pages.push(totalPages);
  }

  const btn = (label: React.ReactNode, target: number, disabled: boolean) => (
    <button
      key={String(label)}
      onClick={() => onChange(target)}
      disabled={disabled}
      className="flex items-center justify-center h-8 min-w-8 px-2 text-xs font-mono border border-gray-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed hover:border-blue-500 hover:text-blue-400 text-gray-400"
    >
      {label}
    </button>
  );

  return (
    <div className="flex items-center justify-between mt-4 px-2">
      <p className="text-xs text-gray-600 font-mono">
        {Math.min((page - 1) * perPage + 1, total)}–{Math.min(page * perPage, total)} / {total}
      </p>

      <div className="flex items-center gap-1">
        {btn(<ChevronLeft className="h-3.5 w-3.5" />, page - 1, page === 1)}

        {pages.map((p, i) =>
          p === "…" ? (
            <span key={`dots-${i}`} className="px-1 text-gray-600 text-xs">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onChange(p)}
              className={`h-8 min-w-8 px-2 text-xs font-mono border transition-colors ${
                p === page
                  ? "bg-blue-600 border-blue-600 text-white"
                  : "border-gray-800 text-gray-400 hover:border-blue-500 hover:text-blue-400"
              }`}
            >
              {p}
            </button>
          )
        )}

        {btn(<ChevronRight className="h-3.5 w-3.5" />, page + 1, page === totalPages)}
      </div>
    </div>
  );
}
