import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaCalendarAlt, FaEye, FaEnvelope, FaGoogle, FaFacebookF } from "react-icons/fa";
import "../styles/SignUpPage.css";

const SignUpPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    schoolName: "",
    contactNumber: "",
    dob: "",
    address: "",
    role: "",
    email: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5001/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        alert("Registration successful!");
        navigate("/login");
      } else {
        alert(data.error || "Registration failed.");
      }
    } catch (err) {
      console.error("Registration error:", err);
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-container">
        <div className="signup-sidebar">
          <div className="logo-container">
            <img src="/logo.png" alt="SLSBA Logo" className="logo" />
            <h1>SLSBA</h1>
          </div>
          <h2>Empowering Sri Lanka's Badminton Champions</h2>
          <p>Access tournaments, coaching programs, and training resources all in one place.</p>
          
          <div className="sidebar-links">
            <div className="sidebar-link">Tournament Registration</div>
            <div className="sidebar-link">Coaching Resources</div>
            <div className="sidebar-link">Player Development</div>
          </div>
        </div>

        <div className="signup-form-container">
          <Link to="/" className="back-button">
            <span>&larr;</span> Back to Home
          </Link>
          
          <div className="signup-form-content">
            <h2>Create Your Account</h2>
            <p>Please fill in your details to register</p>

            <form onSubmit={handleSubmit} className="signup-form">
              <div className="form-group">
                <label>Full Name</label>
                <input 
                  type="text" 
                  name="fullName" 
                  placeholder="Full Name" 
                  value={formData.fullName} 
                  onChange={handleChange} 
                  required 
                />
              </div>

              <div className="form-group">
                <label>School Name</label>
                <input 
                  type="text" 
                  name="schoolName" 
                  placeholder="School Name" 
                  value={formData.schoolName} 
                  onChange={handleChange} 
                  required 
                />
              </div>

              <div className="form-row">
                <div className="form-group half">
                  <label>Contact Number</label>
                  <input 
                    type="text" 
                    name="contactNumber" 
                    placeholder="Contact Number" 
                    value={formData.contactNumber} 
                    onChange={handleChange} 
                    required 
                  />
                </div>
                <div className="form-group half">
                  <label>Date of Birth</label>
                  <div className="input-with-icon">
                    <input
                      type="date"
                      name="dob"
                      value={formData.dob}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Address</label>
                <input 
                  type="text" 
                  name="address" 
                  placeholder="Address" 
                  value={formData.address} 
                  onChange={handleChange} 
                  required 
                />
              </div>

              <div className="form-group">
                <label className="label-title">Select Role</label>
                <div className="role-selection">
                  {['player', 'coach', 'parent'].map((role) => (
                    <label key={role} className={`role-option ${formData.role === role ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="role"
                        value={role}
                        onChange={handleChange}
                        checked={formData.role === role}
                      />
                      <span className="role-label">
                        {role === 'player' && '🏸'}
                        {role === 'coach' && '👨‍🏫'}
                        {role === 'parent' && '👪'}
                        {` ${role.charAt(0).toUpperCase() + role.slice(1)}`}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Email</label>
                <div className="input-with-icon">
                  <input 
                    type="email" 
                    name="email" 
                    placeholder="Email Address" 
                    value={formData.email} 
                    onChange={handleChange} 
                    required 
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Password</label>
                <div className="input-with-icon">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    name="password" 
                    placeholder="Password" 
                    value={formData.password} 
                    onChange={handleChange} 
                    required 
                  />
                  <FaEye 
                    className="input-icon clickable" 
                    onClick={() => setShowPassword(!showPassword)} 
                  />
                </div>
              </div>

              <button type="submit" className="signup-btn" disabled={loading}>
                {loading ? "Registering..." : "Sign Up"}
              </button>

              <div className="social-divider">
                <span>or continue with</span>
              </div>

              <div className="social-login">
                <button type="button" className="social-btn google">
                  <FaGoogle />
                </button>
                <button type="button" className="social-btn facebook">
                  <FaFacebookF />
                </button>
              </div>

              <p className="login-link">
                Already have an account? <Link to="/login">Login here</Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;