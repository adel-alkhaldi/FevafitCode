import Navbar from "./components/Navbar";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { NavProvider } from "./context/NavContext"; // added
import PublicRoute from "./components/PublicRoute";
import RegisterUser from "./pages/RegisterUser";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";
import TrainerDashboard from "./pages/TrainerDashboard";
import ViewerDashboard from "./pages/ViewerDashboard";
import PrivateRoute from "./components/PrivateRoute";
import UserList from "./pages/UserList";
import Unauthorized from "./pages/Unauthorized";
import Sessions from "./pages/Sessions";
import Clients from "./pages/ClientCompanies"; // <-- existing
import CompanyDept from "./pages/CompanyDept"; // <-- add this import
import SessionParticipants from "./pages/SessionParticipants"; // <-- add this import

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NavProvider>
          <Navbar />
          <Routes>
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                // allow access to register even when already authenticated (used by Admin page)
                <PublicRoute allowWhenAuth={true}>
                  <RegisterUser />
                </PublicRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <PrivateRoute allowedRoles={["admin"]}>
                  <AdminDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/attendee"
              element={
                <PrivateRoute allowedRoles={["attendee"]}>
                  <UserDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/trainer"
              element={
                <PrivateRoute allowedRoles={["trainer"]}>
                  <TrainerDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/viewer"
              element={
                <PrivateRoute allowedRoles={["viewer"]}>
                  <ViewerDashboard />
                </PrivateRoute>
              }
            />
            <Route path="/users" element={<PrivateRoute allowedRoles={["admin"]}><UserList/></PrivateRoute>} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route
              path="/sessions"
              element={
                <PrivateRoute allowedRoles={["admin", "trainer"]}>
                  <Sessions />
                </PrivateRoute>
              }
            />
            <Route
              path="/sessions/:sessionId/participants"
              element={
                <PrivateRoute allowedRoles={["admin", "trainer"]}>
                  <SessionParticipants />
                </PrivateRoute>
              }
            />
            <Route path="/clients" element={<PrivateRoute allowedRoles={["admin","trainer"]}><Clients/></PrivateRoute>} />
            <Route path="/clients/:companyId" element={<PrivateRoute allowedRoles={["admin","trainer"]}><CompanyDept/></PrivateRoute>} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  {(auth) => {
                    switch ((auth.role || "").toLowerCase()) {
                      case "admin":
                        return <AdminDashboard />;
                      case "attendee":
                        return <UserDashboard />;
                      case "trainer":
                        return <TrainerDashboard />;
                      case "viewer":
                        return <ViewerDashboard />;
                      default:
                        return <Navigate to="/unauthorized" replace />;
                    }
                  }}
                </PrivateRoute>
              }
            />
          </Routes>
        </NavProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
