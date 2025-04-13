import React from "react";
import { Link } from "react-router-dom";
import "../styles/SignUpPage.css"; // ✅ Import CSS
import { FaUser, FaEnvelope, FaLock, FaCalendarAlt, FaEye } from "react-icons/fa";

const SignUpPage = () => {
  return (
    <div className="signup-container">
      {/* Navigation Bar (Same as Other Pages) */}
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

      {/* Hero Image */}
      <div className="hero-image">
        <img src="/signup-hero.png" alt="Badminton Players" />
      </div>

      {/* Sign Up Form */}
      <div className="signup-form-container">
        <div className="signup-form">
          <h2>Register Now</h2>
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" placeholder="Full Name" />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>School Name</label>
              <input type="text" placeholder="School Name" />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Contact Number</label>
              <input type="text" placeholder="Contact Number" />
            </div>
            
            <div className="form-group">
              <label>Date of Birth</label>
              <div className="input-with-icon">
                <input type="text" placeholder="mm/dd/yyyy" />
                <FaCalendarAlt className="input-icon" />
              </div>
            </div>
          </div>
          
          <div className="form-group">
            <label>Address</label>
            <input type="text" placeholder="Address" />
          </div>

          {/* User Role Selection */}
          <div className="form-group">
            <label>User Role</label>
            <div className="role-options">
              <label className="role-option">
                <input type="radio" name="role" value="player" />
                <span className="role-icon">🏸</span> Player
              </label>
              <label className="role-option">
                <input type="radio" name="role" value="coach" />
                <span className="role-icon">👨‍🏫</span> Coach
              </label>
              <label className="role-option">
                <input type="radio" name="role" value="parent" />
                <span className="role-icon">👪</span> Parent
              </label>
            </div>
          </div>
          
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" placeholder="Email Address" />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <div className="input-with-icon">
              <input type="password" placeholder="Password" />
              <FaEye className="input-icon" />
            </div>
          </div>

          <button className="signup-btn">Sign Up</button>

          <p className="login-text">
            Already have an account? <Link to="/login" className="login-link">Login here</Link>
          </p>
        </div>
      </div>

      {/* Footer (Same as Other Pages) */}
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