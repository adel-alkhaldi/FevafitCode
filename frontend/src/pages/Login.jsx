import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.svg";
import authImage from "../assets/auth-image.png";

const Login = () => {
  const navigate = useNavigate();
  const { setAuth, loading: authLoading } = useAuth();

  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!phoneNumber || !password) {
      setError("Phone number and password are required.");
      return;
    }

    try {
      const res = await axios.post(
        "/api/auth/login",
        { phoneNumber, password },
        { withCredentials: true }
      );

      setAuth({
        accessToken: res.data.accessToken,
        role: res.data.user?.role,
        user: res.data.user,
      });

      navigate("/", { replace: true });
    } catch (err) {
      console.error("Login error:", err?.response?.data || err);
      setError(
        (err?.response?.data?.message || err?.response?.data?.error) ||
          "Login failed. Check credentials."
      );
    }
  };

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-white relative">
      {/* Left side - Login Form (will shrink on small screens) */}
      <div className="flex-1 min-h-0 flex flex-col justify-center p-6 md:p-12 lg:p-16">
        <div className="w-full max-w-lg mx-auto flex flex-col gap-6">
          {/* Centered logo/title for the left pane (horizontal layout) */}
          <div className="flex items-center justify-center gap-3 mb-2">
            {logo && <img src={logo} alt="Fevafit" className="h-10 w-10 md:h-12 md:w-12" />}
            <span className="text-2xl md:text-3xl font-bold">Fevafit</span>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-lg shadow-sm p-6 md:p-8 flex-1 flex flex-col justify-center">
            <h1 className="text-2xl md:text-3xl font-semibold mb-1">Login to your account</h1>
            <p className="text-sm md:text-base text-gray-600 mb-6">Enter your details to login</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label htmlFor="phone" className="text-sm font-medium">
                  Phone Number <span className="text-red-600">*</span>
                </label>
                <input
                  id="phone"
                  type="text"
                  placeholder="e.g. +971501234567"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full p-3 md:p-3.5 border rounded text-sm md:text-base"
                  required
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="password" className="text-sm font-medium">
                  Password <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-3 md:p-3.5 border rounded pr-12 text-sm md:text-base"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs md:text-sm text-gray-600"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-purple-600 text-white py-3 rounded disabled:opacity-60 text-sm md:text-base"
              >
                {authLoading ? "Signing in..." : "Login"}
              </button>

              {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
            </form>
          </div>

          {/* Footer */}
          <p className="text-center text-xs md:text-sm text-gray-500 mt-2">@ Fevafit 2025 All rights reserved</p>

          <p className="text-center text-sm text-gray-600 mt-2">
            Don't have an account?{" "}
            <Link to="/register" className="text-purple-600 hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>

      {/* Right side - Hero Image*/}
      <div className="hidden md:flex flex-1 min-h-0 items-center justify-center bg-[#E8E4F3] p-0">
        {authImage && (
          <img
            src={authImage}
            alt="Auth illustration"
            className="w-full h-full object-cover"
          />
        )}
      </div>
    </div>
  );
};

export default Login;