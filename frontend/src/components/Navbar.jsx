import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { useNav } from "../context/NavContext"; // new import

const Icon = ({ name, className = "w-5 h-5" }) => {
  switch (name) {
    case "home":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M3 10.5L12 4l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V10.5z"/>
        </svg>
      );
    case "sessions":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="1.5" />
          <path d="M16 2v4M8 2v4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M3 10h18" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "companies":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <rect x="3" y="7" width="18" height="12" rx="2" ry="2" strokeWidth="1.5" />
          <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "users":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 0 0-3-3.87M7 21v-2a4 4 0 0 1 3-3.87M12 7a4 4 0 1 1 0 8 4 4 0 0 1 0-8z"/>
        </svg>
      );
    case "admin":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M12 2l2.09 4.26L18 8l-4 1.09L12 14l-2-4.91L6 8l3.91-1.74L12 2zM4 20v-2a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v2"/>
        </svg>
      );
    case "logout":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2v1"/>
        </svg>
      );
    case "menu":
    default:
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      );
  }
};

const Navbar = () => {
  const navigate = useNavigate();
  const { auth, setAuth } = useAuth();
  const { collapsed, setCollapsed } = useNav(); // use global nav state

  if (!auth?.accessToken) return null;

  const role = (auth?.role || "").toLowerCase();

  const toggle = () => setCollapsed((c) => !c);

  const handleLogout = async () => {
    try {
      await axios.post("/api/auth/logout", {}, { withCredentials: true });
      setAuth(null);
      navigate("/login");
    } catch (error) {
      console.log("Logout failed", error);
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 h-screen bg-purple-100 shadow-lg flex flex-col py-4 transition-all duration-200 ease-in-out z-40
        ${collapsed ? "w-16" : "w-56"}`}
      aria-label="Main navigation"
    >
      <div className="flex items-center justify-between px-3 mb-6">
        <div className={`flex items-center gap-3 ${collapsed ? "justify-center w-full" : ""}`}>
          {!collapsed && <img src="/src/assets/logo.svg" alt="Fevafit" className="h-8 w-8" />}
          {!collapsed && <span className="text-lg font-bold">Fevafit</span>}
        </div>

        <button
          onClick={toggle}
          aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
          className="p-1 rounded hover:bg-purple-200"
          title={collapsed ? "Expand" : "Collapse"}
        >
          <Icon name="menu" className="w-5 h-5" />
        </button>
      </div>

      <ul className="flex-1 flex flex-col gap-2 px-1">
        <li>
          <Link to="/" className={`flex items-center ${collapsed ? "justify-center" : "gap-3"} py-3 px-3 rounded hover:bg-purple-200 transition`} title="Dashboard">
            <Icon name="home" />
            {!collapsed && <span>Dashboard</span>}
          </Link>
        </li>

        {["admin", "trainer"].includes(role) && (
          <li>
            <Link
              to="/sessions"
              className={`flex items-center ${collapsed ? "justify-center" : "gap-3"} py-3 px-3 rounded hover:bg-purple-200 transition`}
              title="Sessions"
            >
              <Icon name="sessions" />
              {!collapsed && <span>Sessions</span>}
            </Link>
          </li>
        )}

        {["admin", "trainer"].includes(role) && (
          <li>
            <Link
              to="/clients"
              className={`flex items-center ${collapsed ? "justify-center" : "gap-3"} py-3 px-3 rounded hover:bg-purple-200 transition`}
              title="Clients"
            >
              <Icon name="companies" />
              {!collapsed && <span>Clients</span>}
            </Link>
          </li>
        )}

        {role === "admin" && (
          <li>
            <Link
              to="/users"
              className={`flex items-center ${collapsed ? "justify-center" : "gap-3"} py-3 px-3 rounded hover:bg-purple-200 transition`}
              title="Users"
            >
              <Icon name="users" />
              {!collapsed && <span>Users</span>}
            </Link>
          </li>
        )}

        {role === "admin" && (
          <li>
            <Link
              to="/admin"
              className={`flex items-center ${collapsed ? "justify-center" : "gap-3"} py-3 px-3 rounded hover:bg-purple-200 transition`}
              title="Admin"
            >
              <Icon name="admin" />
              {!collapsed && <span>Admin</span>}
            </Link>
          </li>
        )}
      </ul>

      <div className="px-2">
        <button
          onClick={handleLogout}
          className={`w-full flex items-center ${collapsed ? "justify-center" : "justify-center gap-3"} py-2 px-3 rounded bg-red-500 text-white hover:bg-red-700 transition`}
          title="Logout"
        >
          <Icon name="logout" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;