import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/SignUpPage.css";
import { FaCalendarAlt, FaEye, FaEnvelope } from "react-icons/fa";

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
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
    }
  };

  return (
    <div className="signup-container">
      <header className="navbar">
        <nav>
          <div className="logo1">
            <img src="/logo.png" alt="SLSBA Logo" className="logo" />
            <span className="logo-text">SLSBA</span>
          </div>
          <ul className="nav-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/tournaments">Tournaments</Link></li>
            <li><Link to="/training">Coaching Programs</Link></li>
            <li><Link to="/news">News & Media</Link></li>
            <li><Link to="/contact">Contact Us</Link></li>
          </ul>
          <Link to="/login">
            <button className="signin-btn">Sign In</button>
          </Link>
        </nav>
      </header>

      <div className="hero-image">
        <img src="/signup-hero.png" alt="Badminton Players" />
      </div>

      <div className="signup-form-container">
        <div className="signup-form">
          <h2>Register Now</h2>

          <div className="form-group">
            <label>Full Name</label>
            <input type="text" name="fullName" placeholder="Full Name" value={formData.fullName} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>School Name</label>
            <input type="text" name="schoolName" placeholder="School Name" value={formData.schoolName} onChange={handleChange} />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Contact Number</label>
              <input type="text" name="contactNumber" placeholder="Contact Number" value={formData.contactNumber} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Date of Birth</label>
              <div className="input-with-icon">
                <input type="text" name="dob" placeholder="mm/dd/yyyy" value={formData.dob} onChange={handleChange} />
                <FaCalendarAlt className="input-icon" />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Address</label>
            <input type="text" name="address" placeholder="Address" value={formData.address} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>User Role</label>
            <div className="role-options">
              {["player", "coach", "parent"].map(role => (
                <label key={role} className="role-option">
                  <input type="radio" name="role" value={role} onChange={handleChange} checked={formData.role === role} />
                  <span className="role-icon">{role === "player" ? "🏸" : role === "coach" ? "👨‍🏫" : "👪"}</span> {role.charAt(0).toUpperCase() + role.slice(1)}
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-with-icon">
              <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} />
              <FaEye className="input-icon" />
            </div>
          </div>

          <button className="signup-btn" onClick={handleSubmit}>Sign Up</button>

          <p className="login-text">
            Already have an account? <Link to="/login" className="login-link">Login here</Link>
          </p>
        </div>
      </div>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <div className="logo2">
              <img src="/logo.png" alt="SLSBA Logo" />
              <span>SLSBA</span>
            </div>
            <p>Empowering the next generation of badminton champions in Sri Lanka.</p>
          </div>
          <div className="footer-section">
            <h3>Quick Links</h3>
            <ul>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/tournaments">Tournaments</Link></li>
              <li><Link to="/programs">Training Programs</Link></li>
              <li><Link to="/news">News & Media</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
            </ul>
          </div>
          <div className="footer-section">
            <h3>Newsletter</h3>
            <p>Subscribe to our newsletter for updates.</p>
            <input type="email" placeholder="Your email address" />
            <button className="subscribe-btn">Subscribe</button>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2025 Sri Lanka Schools Badminton Association. All rights reserved.</p>
          <div className="footer-links">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SignUpPage;
