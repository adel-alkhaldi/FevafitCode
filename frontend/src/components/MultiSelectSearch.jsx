import React, { useState, useMemo, useRef, useEffect } from "react";

/**
 * MultiSelectSearch
 * props:
 *  - options: [{ _id, name }]
 *  - selected: array of ids
 *  - onChange: (newSelectedIds) => void
 *  - placeholder: string
 */
export default function MultiSelectSearch({ options = [], selected = [], onChange, placeholder = "Select..." }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    const onDoc = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  const selectedMap = useMemo(() => {
    const m = new Map();
    (options || []).forEach((o) => m.set(String(o._id), o));
    return m;
  }, [options]);

  const filtered = useMemo(() => {
    const q = (query || "").trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => (o.name || "").toLowerCase().includes(q));
  }, [options, query]);

  const toggle = (id) => {
    const exists = selected.includes(id);
    const next = exists ? selected.filter((s) => String(s) !== String(id)) : [...selected, id];
    onChange?.(next);
  };

  return (
    <div ref={ref} className="relative">
      <div
        className="min-h-[44px] w-full bg-white border border-gray-200 rounded px-2 py-1 flex items-center gap-2 cursor-text"
        onClick={() => setOpen((s) => !s)}
      >
        <div className="flex flex-wrap gap-1 items-center">
          {selected.map((id) => (
            <span key={id} className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded">
              <span>{selectedMap.get(String(id))?.name || id}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggle(id);
                }}
                className="text-gray-500 hover:text-gray-700"
                aria-label="remove"
              >
                ×
              </button>
            </span>
          ))}
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={selected.length === 0 ? placeholder : ""}
            className="outline-none px-1 py-0.5 text-sm"
            onFocus={() => setOpen(true)}
            style={{ minWidth: 80 }}
          />
        </div>
        <div className="ml-auto text-gray-400 text-xs">{open ? "▴" : "▾"}</div>
      </div>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border rounded shadow max-h-60 overflow-auto">
          {filtered.length === 0 ? (
            <div className="p-2 text-sm text-gray-500">No results</div>
          ) : (
            filtered.map((opt) => {
              const checked = selected.some((s) => String(s) === String(opt._id));
              return (
                <label key={opt._id} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(opt._id)}
                    onClick={(e) => e.stopPropagation()}
                    className="form-checkbox"
                  />
                  <span className="text-sm">{opt.name}</span>
                </label>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}