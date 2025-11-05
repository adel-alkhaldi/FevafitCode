import React from "react";

/**
 * Pagination
 * Props:
 *  - page: current page (number)
 *  - totalPages: total pages (number)
 *  - onPageChange: fn(newPage)
 *  - showRange (optional) display page range
 */
export default function Pagination({ page = 1, totalPages = 1, onPageChange = () => {}, showRange = true }) {
  if (!totalPages || totalPages <= 1) return null;

  const prev = () => onPageChange(Math.max(1, page - 1));
  const next = () => onPageChange(Math.min(totalPages, page + 1));

  // simple helpers
  const isEllipsis = (p) => p === "...";
  // produce pages similar to [1,2,3,"...",8,9,10] when appropriate
  const getPageItems = (current, total) => {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

    const items = [];
    items.push(1);

    const left = Math.max(2, current - 1);
    const right = Math.min(total - 1, current + 1);

    if (left > 2) items.push("...");
    for (let i = left; i <= right; i++) items.push(i);
    if (right < total - 1) items.push("...");
    items.push(total);
    return items;
  };

  const pages = getPageItems(page, totalPages);

  // small class helper
  const cn = (...args) => args.filter(Boolean).join(" ");

  return (
    <div className="px-4 py-3 border-t border-border flex items-center justify-between">
      <button
        onClick={prev}
        disabled={page <= 1}
        className="px-4 py-2 text-sm font-medium text-foreground hover:bg-muted rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Previous
      </button>

      <div className="flex items-center gap-1">
        {pages.map((p, index) => {
          const isCurrent = p === page;
          const btnClass = cn(
            "min-w-[2rem] h-8 px-2 text-sm font-medium rounded-lg transition-colors",
            isEllipsis(p)
              ? "text-foreground/60 cursor-default"
              : isCurrent
              ? "bg-primary text-primary-foreground"
              : "text-foreground hover:bg-muted"
          );

          return (
            <button
              key={index}
              onClick={() => {
                if (isEllipsis(p)) return;
                onPageChange(Number(p));
              }}
              className={btnClass}
              disabled={isEllipsis(p)}
            >
              {p}
            </button>
          );
        })}
      </div>

      <button
        onClick={next}
        disabled={page >= totalPages}
        className="px-4 py-2 text-sm font-medium text-foreground hover:bg-muted rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
      >
        Next
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}