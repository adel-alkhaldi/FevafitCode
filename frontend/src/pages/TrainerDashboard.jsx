import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNav } from "../context/NavContext"; // added

const TrainerDashboard = () => {
    const { auth } = useAuth();
    const { collapsed } = useNav(); // added
    const navWidth = collapsed ? "4rem" : "14rem"; // added
    return (
        <div style={{ marginLeft: navWidth, transition: "margin-left 200ms ease" }} className="flex flex-col items-center justify-center min-h-screen">
            <h2 className="text-2xl font-bold mb-4">Hello, {auth?.user?.fullName || "Trainer"}!</h2>
            <p>Welcome to your dashboard.</p>
        </div>
    );
};

export default TrainerDashboard;