import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEnvelope, FaLock, FaGoogle, FaFacebookF, FaArrowLeft, FaStar, FaTrophy } from "react-icons/fa";
import "../styles/LoginPage.css";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

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
        navigate("/");
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
    <div className="login-page">
      <div className="back-button-container">
        <Link to="/" className="back-button">
          <FaArrowLeft />
          <span>Back to Home</span>
        </Link>
      </div>
      
      <div className="login-content">
        <div className="login-card">
          <div className="login-left">
            <div className="logo-section">
              <img src="/logo.png" alt="SLSBA Logo" className="login-logo" />
              <h2 className="logo-text">SLSBA</h2>
            </div>
            
            <div className="animated-background">
              <div className="animated-pattern">
                <div className="star-icon">
                  <FaStar />
                </div>
                <div className="trophy-icon">
                  <FaTrophy />
                </div>
                <div className="circle-pattern c1"></div>
                <div className="circle-pattern c2"></div>
                <div className="circle-pattern c3"></div>
                <div className="line-pattern l1"></div>
                <div className="line-pattern l2"></div>
              </div>
            </div>
            
            <div className="left-content">
              <h2 className="left-title">Empowering Sri Lanka's Badminton Champions</h2>
              <p className="left-description">Access tournaments, coaching programs, and training resources all in one place.</p>
              
              <div className="feature-list">
                <div className="feature-item">
                  <div className="feature-icon"></div>
                  <span>Tournament Registration</span>
                </div>
                <div className="feature-item">
                  <div className="feature-icon"></div>
                  <span>Coaching Resources</span>
                </div>
                <div className="feature-item">
                  <div className="feature-icon"></div>
                  <span>Player Development</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="login-right">
            <div className="login-form-wrapper">
              <h1 className="login-title">Welcome Back</h1>
              <p className="login-subtitle">Sign in to your account</p>
              
              <form className="login-form" onSubmit={handleLogin}>
                <div className="input-group">
                  <label htmlFor="email">Email</label>
                  <div className="input-field">
                    <FaEnvelope className="field-icon" />
                    <input
                      id="email"
                      type="email"
                      placeholder="Your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div className="input-group">
                  <label htmlFor="password">Password</label>
                  <div className="input-field">
                    <FaLock className="field-icon" />
                    <input
                      id="password"
                      type="password"
                      placeholder="Your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div className="form-options">
                  <div className="remember-option">
                    <input type="checkbox" id="remember" />
                    <label htmlFor="remember">Remember me</label>
                  </div>
                  <Link to="/forgot-password" className="forgot-link">
                    Forgot Password?
                  </Link>
                </div>
                
                <button 
                  type="submit" 
                  className="signin-button" 
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </button>
                
                <div className="separator">
                  <span>or continue with</span>
                </div>
                
                <div className="social-signin">
                  <button type="button" className="social-button google">
                    <FaGoogle />
                  </button>
                  <button type="button" className="social-button facebook">
                    <FaFacebookF />
                  </button>
                </div>
                
                <div className="signup-prompt">
                  <span>Don't have an account?</span>
                  <Link to="/signup" className="signup-link">Create Account</Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;