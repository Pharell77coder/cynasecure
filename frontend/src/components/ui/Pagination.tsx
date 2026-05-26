import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  page: number;
  total: number;
  perPage: number;
  onChange: (page: number) => void;
  onPerPageChange?: (perPage: number) => void;
}

const PER_PAGE_OPTIONS = [10, 20, 50, 100];

export function Pagination({ page, total, perPage, onChange, onPerPageChange }: Props) {
  const totalPages = Math.ceil(total / perPage);

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

  const btn = (label: React.ReactNode, target: number, disabled: boolean, ariaLabel?: string) => (
    <button
      key={String(label)}
      onClick={() => onChange(target)}
      disabled={disabled}
      aria-label={ariaLabel}
      className="flex items-center justify-center h-8 min-w-8 px-2 text-xs font-mono border border-gray-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed hover:border-blue-500 hover:text-blue-400 text-gray-400"
    >
      {label}
    </button>
  );

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mt-4 px-2">
      <div className="flex items-center gap-3">
        <p className="text-xs text-gray-600 font-mono">
          {total === 0 ? "0" : Math.min((page - 1) * perPage + 1, total)}–{Math.min(page * perPage, total)} / {total}
        </p>

        {onPerPageChange && (
          <label className="flex items-center gap-1.5 text-xs text-gray-600 font-mono">
            <span>par page</span>
            <select
              value={perPage}
              onChange={(e) => { onPerPageChange(Number(e.target.value)); onChange(1); }}
              className="bg-gray-900 border border-gray-800 text-gray-400 text-xs font-mono px-1.5 py-0.5 focus:outline-none focus:border-blue-500"
              aria-label="Éléments par page"
            >
              {PER_PAGE_OPTIONS.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </label>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center gap-1" role="navigation" aria-label="Pagination">
          {btn(<ChevronLeft className="h-3.5 w-3.5" />, page - 1, page === 1, "Page précédente")}

          {pages.map((p, i) =>
            p === "…" ? (
              <span key={`dots-${i}`} className="px-1 text-gray-600 text-xs">…</span>
            ) : (
              <button
                key={p}
                onClick={() => onChange(p)}
                aria-label={`Page ${p}`}
                aria-current={p === page ? "page" : undefined}
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

          {btn(<ChevronRight className="h-3.5 w-3.5" />, page + 1, page === totalPages, "Page suivante")}
        </div>
      )}
    </div>
  );
}
