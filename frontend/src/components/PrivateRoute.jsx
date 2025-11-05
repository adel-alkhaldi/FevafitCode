import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

export default function PrivateRoute({ children, allowedRoles }) {
  const { auth, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!auth || !auth.accessToken) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.map(r => r.toLowerCase()).includes((auth.role || "").toLowerCase())) {
    return <Navigate to="/unauthorized" replace />;
  }

  return typeof children === "function" ? children(auth) : children;
}