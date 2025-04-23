import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaEnvelope,
  FaLock,
  FaGoogle,
  FaFacebookF,
  FaArrowLeft,
  FaStar,
  FaTrophy
} from "react-icons/fa";
import "../styles/LoginPage.css";

const UserLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/"); // ✅ Redirect to home if already logged in
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:5001/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/"); // ✅ Redirect to home after login
      } else {
        alert(data.error || "Login failed");
      }
    } catch (err) {
      console.error("Login Error:", err);
      alert("An error occurred during login.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="user-login-page">
      <div className="user-back-button-container">
        <Link to="/" className="user-back-button">
          <FaArrowLeft />
          <span>Back to Home</span>
        </Link>
      </div>

      <div className="user-login-content">
        <div className="user-login-card">
          <div className="user-login-left">
            <div className="user-logo-section">
              <img src="/logo.png" alt="SLSBA Logo" className="user-login-logo" />
              <h2 className="user-logo-text">SLSBA</h2>
            </div>

            <div className="user-animated-background">
              <div className="user-animated-pattern">
                <div className="user-star-icon"><FaStar /></div>
                <div className="user-trophy-icon"><FaTrophy /></div>
                <div className="user-circle-pattern c1"></div>
                <div className="user-circle-pattern c2"></div>
                <div className="user-circle-pattern c3"></div>
                <div className="user-line-pattern l1"></div>
                <div className="user-line-pattern l2"></div>
              </div>
            </div>

            <div className="user-left-content">
              <h2 className="user-left-title">Empowering Sri Lanka's Badminton Champions</h2>
              <p className="user-left-description">
                Access tournaments, coaching programs, and training resources all in one place.
              </p>
              <div className="user-feature-list">
                <div className="user-feature-item"><span>Tournament Registration</span></div>
                <div className="user-feature-item"><span>Coaching Resources</span></div>
                <div className="user-feature-item"><span>Player Development</span></div>
              </div>
            </div>
          </div>

          <div className="user-login-right">
            <div className="user-login-form-wrapper">
              <h1 className="user-login-title">Welcome Back</h1>
              <p className="user-login-subtitle">Sign in to your account</p>

              <form className="user-login-form" onSubmit={handleLogin}>
                <div className="user-input-group">
                  <label htmlFor="user-email">Email</label>
                  <div className="user-input-field">
                    <FaEnvelope className="user-field-icon" />
                    <input
                      id="user-email"
                      type="email"
                      placeholder="Your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="user-input-group">
                  <label htmlFor="user-password">Password</label>
                  <div className="user-input-field">
                    <FaLock className="user-field-icon" />
                    <input
                      id="user-password"
                      type="password"
                      placeholder="Your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="user-form-options">
                  <div className="user-remember-option">
                    <input type="checkbox" id="user-remember" />
                    <label htmlFor="user-remember">Remember me</label>
                  </div>
                  <Link to="/forgot-password" className="user-forgot-link">
                    Forgot Password?
                  </Link>
                </div>

                <button type="submit" className="user-signin-button" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Sign In"}
                </button>

                <div className="user-separator">
                  <span>or continue with</span>
                </div>

                <div className="user-social-signin">
                  <button type="button" className="user-social-button user-google">
                    <FaGoogle />
                  </button>
                  <button type="button" className="user-social-button user-facebook">
                    <FaFacebookF />
                  </button>
                </div>

                <div className="user-signup-prompt">
                  <span>Don't have an account?</span>
                  <Link to="/signup" className="user-signup-link">Create Account</Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserLogin;
