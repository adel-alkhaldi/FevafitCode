import React, {useEffect, useState} from "react";
import { useAuth } from "../context/AuthContext"
import axios from "axios"
import { useNav } from "../context/NavContext"; // added

const userDashboard = () => {
    
    const {auth} = useAuth();
    const { collapsed } = useNav(); // added
    const navWidth = collapsed ? "4rem" : "14rem"; // added

    const [profile, setProfile] = useState(null)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchProfile = async () => {
            if (!auth?.accessToken) return;
            try {
                const res = await axios.get("/api/users/me", {
                    headers: {
                        Authorization: `Bearer ${auth?.accessToken}`
                    },
                    withCredentials: true
                })
                setProfile(res.data.user);
            } catch (error) {
                console.error("Failed to fetch user profile", error)
                setError("Failed to fetch user profile")
            }
        }
        fetchProfile();}, [auth])

    return (
        <div style={{ marginLeft: navWidth, transition: "margin-left 200ms ease" }} className="min-h-screen flex items-center justify-center">
            <div className="max-w-md w-full mx-auto p-6 bg-white rounded-lg shadow">
                <h2 className="text-2xl font-bold mb-4 text-center">User Dashboard</h2>
                {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
                {profile && (
                    <div>
                        <h3 className="text-xl font-semibold mb-2 text-center">Profile Information</h3>
                        <p><span className="font-semibold">Username:</span> {profile.fullName}</p>
                        <p><span className="font-semibold">Email:</span> {profile.email}</p>
                        <p><span className="font-semibold">Role:</span> {profile.role}</p>
                        <p><span className="font-semibold">Phone Number:</span> {profile.phoneNumber}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default userDashboard;