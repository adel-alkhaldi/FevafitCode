import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNav } from "../context/NavContext";

const AdminDashboard = () => {
  const { auth } = useAuth();
  const { collapsed } = useNav();

  const navWidth = collapsed ? "4rem" : "14rem";

  return (
    <div style={{ marginLeft: navWidth, transition: "margin-left 200ms ease" }} className="p-8 min-h-screen">
      <h2 className="text-2xl font-bold">Admin Dashboard</h2>
      <p>Welcome, {auth?.user?.fullName}</p>
    </div>
  );
};

export default AdminDashboard;