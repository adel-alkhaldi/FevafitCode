import { createContext, useContext, useState, useEffect } from "react";

const NavContext = createContext();

export const NavProvider = ({ children }) => {
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("navCollapsed")) ?? false;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("navCollapsed", JSON.stringify(collapsed));
    } catch {}
  }, [collapsed]);

  return (
    <NavContext.Provider value={{ collapsed, setCollapsed }}>
      {children}
    </NavContext.Provider>
  );
};

export const useNav = () => useContext(NavContext);