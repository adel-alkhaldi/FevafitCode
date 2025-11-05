import {Navigate} from "react-router-dom"
import {useAuth} from "../context/AuthContext"

export default function PublicRoute({children, allowWhenAuth = false}) {
    const {auth, loading} = useAuth();

    if(loading) {
        return <div>Loading...</div>
    }

    // If user is authenticated and we do NOT allow access while authenticated => redirect home
    if(auth && auth.accessToken && !allowWhenAuth) {
        return <Navigate to="/" />
    }

    return children
}