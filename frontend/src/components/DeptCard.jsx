import React, { useState } from "react";

/**
 * DeptCard - minimal card that displays only department name and a three-dot menu.
 */
export default function DeptCard({ id, name, color, onClick, onEdit, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = (e) => {
    e?.stopPropagation?.();
    setMenuOpen((s) => !s);
  };

  const handleEdit = (e) => {
    e?.stopPropagation?.();
    setMenuOpen(false);
    onEdit?.(id);
  };

  const handleDelete = (e) => {
    e?.stopPropagation?.();
    setMenuOpen(false);
    onDelete?.(id);
  };

  return (
    <div
      onClick={onClick}
      className={`relative bg-card text-card-foreground rounded-lg shadow-card p-4 hover:shadow-lg transition-shadow duration-150 ${onClick ? "cursor-pointer" : ""}`}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* top-right menu */}
      <div className="absolute top-3 right-3 flex items-center gap-2">
        <div className="relative">
          <button
            onClick={toggleMenu}
            aria-haspopup="true"
            aria-expanded={menuOpen}
            className="p-1 rounded hover:bg-gray-100"
            title="More"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <svg className="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <circle cx="5" cy="12" r="2"></circle>
              <circle cx="12" cy="12" r="2"></circle>
              <circle cx="19" cy="12" r="2"></circle>
            </svg>
          </button>

          {menuOpen && (
            <div
              className="absolute right-0 top-full mt-2 w-36 bg-white border rounded shadow-lg z-50"
              onClick={(e) => e.stopPropagation()}
            >
              <button className="w-full text-left px-3 py-2 hover:bg-gray-50" onClick={handleEdit}>Edit</button>
              <button className="w-full text-left px-3 py-2 text-red-600 hover:bg-gray-50" onClick={handleDelete}>Delete</button>
            </div>
          )}
        </div>
      </div>

      {/* dept name only */}
      <div className="flex items-center gap-3">
        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${color || "bg-gray-300"}`}>
          <span className="text-white font-semibold">{(name || "").substring(0,2).toUpperCase()}</span>
        </div>
        <div>
          <div className="text-base font-medium">{name}</div>
        </div>
      </div>
    </div>
  );
}