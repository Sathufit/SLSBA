import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FiUser,
  FiLock,
  FiArrowLeft,
  FiAlertCircle,
  FiShield
} from "react-icons/fi";
import "../styles/AdminLogin.css";

const AdminLogin = () => {
  const [email, setEmail] = useState(localStorage.getItem("adminEmail") || "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(!!localStorage.getItem("adminEmail"));
  const [redirectNow, setRedirectNow] = useState(false);

  const navigate = useNavigate();

  // ✅ Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      setRedirectNow(true);
    }
  }, []);

  useEffect(() => {
    if (redirectNow) {
      navigate("/admin/dashboard");
    }
  }, [redirectNow, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5001/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("adminToken", data.token);
        navigate("/admin/dashboard", { replace: true });


        if (rememberMe) {
          localStorage.setItem("adminEmail", email);
        } else {
          localStorage.removeItem("adminEmail");
        }

        setRedirectNow(true); // ✅ triggers smooth dashboard transition
      } else {
        setError(data.message || "Login failed. Please check your credentials.");
      }
    } catch (err) {
      console.error("Login Error:", err);
      setError("An error occurred during login. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <div className="admin-login-left">
          <div className="admin-login-overlay">
            <div className="admin-login-left-content">
              <div className="admin-shield-icon">
                <FiShield size={40} />
              </div>
              <h2>SLSBA Admin Portal</h2>
              <p>Secure management dashboard for authorized administrators.</p>
            </div>
          </div>
        </div>

        <div className="admin-login-right">
          <div className="admin-login-header">
            <div className="admin-logo">
              <img src="/logo.png" alt="SLSBA Logo" />
            </div>
            <h1>Admin Login</h1>
            <p>Enter your credentials to continue</p>
          </div>

          {error && (
            <div className="admin-error">
              <FiAlertCircle /> {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="admin-form">
            <div className="form-group">
              <label htmlFor="admin-email">Email Address</label>
              <div className="input-wrapper">
                <FiUser className="input-icon" />
                <input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <div className="password-label-wrapper">
                <label htmlFor="admin-password">Password</label>
                <Link to="/admin/forgot-password" className="forgot-password">
                  Forgot password?
                </Link>
              </div>
              <div className="input-wrapper">
                <FiLock className="input-icon" />
                <input
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="form-options">
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                />
                <span className="checkmark"></span>
                <span>Remember me</span>
              </label>
            </div>

            <button
              type="submit"
              className={`login-button ${loading ? "loading" : ""}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  <span>Authenticating...</span>
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <div className="admin-security-note">
            <p>This is a secure area for authorized personnel only.</p>
            <p>All login attempts are monitored and recorded.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
