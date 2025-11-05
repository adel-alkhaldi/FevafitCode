import React, { useState } from "react";

/**
 * Simple ClientCard (JSX) — uses plain Tailwind. Keeps payload small (no external UI lib).
 */
export default function ClientCard({ id, name, email, program, location, employees, color, logo, status, onClick, onEdit, onDelete }) {
  const [imgError, setImgError] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const showLogo = Boolean(logo) && !imgError;

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
      className={`relative bg-card text-card-foreground rounded-lg shadow-card p-5 hover:shadow-lg transition-shadow duration-200 ${onClick ? "cursor-pointer" : ""}`}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* top-right: status (left) + menu (right) */}
      <div className="absolute top-3 right-3 flex items-center gap-2">
        {/* status badge (left) */}
        <span
          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
            status === "Complete" ? "bg-green-100 text-green-800" :
            status === "In-Progress" ? "bg-yellow-100 text-yellow-800" :
            "bg-gray-100 text-gray-700"
          }`}
        >
          {status || "Not Started"}
        </span>

        {/* menu (right) */}
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
              className="absolute right-0 top-full mt-2 w-40 bg-white border rounded shadow-lg z-50"
              onClick={(e) => e.stopPropagation()}
            >
              <button className="w-full text-left px-3 py-2 hover:bg-gray-50" onClick={handleEdit}>Edit</button>
              <button className="w-full text-left px-3 py-2 text-red-600 hover:bg-gray-50" onClick={handleDelete}>Delete</button>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {showLogo ? (
            <img
              src={logo}
              alt={`${name} logo`}
              className="h-12 w-12 rounded-full object-cover"
              style={{ width: 48, height: 48 }}
              onError={() => setImgError(true)}
            />
          ) : (
            <div className={`h-12 w-12 rounded-full flex items-center justify-center ${color || "bg-gray-400"}`}>
              <span className="text-white font-semibold">{(name || "").substring(0,2).toUpperCase()}</span>
            </div>
          )}
          <div>
            <h3 className="text-lg font-semibold">{name}</h3>
          </div>
        </div>
      </div>

      <div className="space-y-2 text-sm text-muted-foreground">
        {/* 1) Employees row */}
        <div className="flex items-center gap-2">
          {/* users/people icon */}
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M17 21v-2a4 4 0 0 0-3-3.87" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
            <path d="M7 21v-2a4 4 0 0 1 3-3.87" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
            <circle cx="12" cy="7" r="4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></circle>
          </svg>
          <span>Employees: {Number(employees || 0)}</span>
        </div>

        {/* 2) Address row */}
        <div className="flex items-center gap-2">
          {/* map pin */}
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M21 10c0 6-9 11-9 11S3 16 3 10a9 9 0 1 1 18 0z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
            <circle cx="12" cy="10" r="2.5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></circle>
          </svg>
          <span>{location || "-"}</span>
        </div>
      </div>
    </div>
  );
}