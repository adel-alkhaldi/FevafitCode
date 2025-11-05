import React, { useState, useRef, useEffect, useMemo } from "react";

/**
 * SearchSelect - single-select searchable combo
 * props:
 *  - options: [{ _id, name }]
 *  - value: selected id or null
 *  - onChange: (id|null) => void
 *  - placeholder: string
 */
export default function SearchSelect({ options = [], value = null, onChange = () => {}, placeholder = "Select..." }) {
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

  const mapById = useMemo(() => {
    const m = new Map();
    (options || []).forEach((o) => m.set(String(o._id), o));
    return m;
  }, [options]);

  const filtered = useMemo(() => {
    const q = (query || "").trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => (o.name || "").toLowerCase().includes(q));
  }, [options, query]);

  const handleSelect = (id) => {
    onChange(id === value ? null : id);
    setOpen(false);
    setQuery("");
  };

  return (
    <div ref={ref} className="relative">
      <div
        onClick={() => setOpen((s) => !s)}
        className="min-h-[44px] w-full bg-white border border-gray-200 rounded px-3 py-2 flex items-center gap-2 cursor-text"
      >
        <div className="flex-1 text-sm text-foreground">
          {value ? (mapById.get(String(value))?.name || value) : <span className="text-gray-500">{placeholder}</span>}
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder=""
          className="outline-none text-sm w-0 flex-shrink-0"
          style={{ opacity: 0, position: "absolute", left: -9999 }}
        />
        <div className="text-gray-400 text-xs">{open ? "▴" : "▾"}</div>
      </div>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border rounded shadow max-h-60 overflow-auto">
          <div className="p-2">
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search..."
              className="w-full p-2 border rounded text-sm"
            />
          </div>

          <div>
            {filtered.length === 0 ? (
              <div className="p-2 text-sm text-gray-500">No results</div>
            ) : (
              filtered.map((opt) => {
                const selected = String(value) === String(opt._id);
                return (
                  <button
                    type="button"
                    key={opt._id}
                    onClick={() => handleSelect(opt._id)}
                    className={`w-full text-left px-3 py-2 hover:bg-gray-50 ${selected ? "bg-primary text-primary-foreground" : ""}`}
                  >
                    <div className="text-sm">{opt.name}</div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}