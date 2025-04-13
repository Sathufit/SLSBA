import React from "react";
import { Link } from "react-router-dom"; // ✅ Import Link
import { FaUser, FaEnvelope, FaLock } from "react-icons/fa";
import "../styles/LoginPage.css"; // ✅ Ensure the path is correct

const LoginPage = () => {
  return (
    <div className="home-container"> {/* ✅ Fixed class typo */}
      {/* Navbar */}
      <header className="navbar">
        <nav>
          <div className="logo1">
            <img src="/logo.png" alt="SLSBA Logo" className="logo" />
            <span className="logo-text">SLSBA</span>
          </div>
          <ul className="nav-links"> {/* ✅ Corrected <ul> structure */}
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/tournaments">Tournaments</Link></li>
            <li><Link to="/training">Coaching Programs</Link></li>
            <li><Link to="/news">News & Media</Link></li>
            <li><Link to="/contact">Contact Us</Link></li>
          </ul>
          <Link to="/login">
            <img src="/user-icon.webp" alt="User Icon" className="user-icon" />
          </Link>
        </nav>
      </header>

      {/* Login Section */}
      <div className="login-container">
      <div className="content">
  <div className="image-section">
    <img src="/badminton-player.png" alt="Badminton Player" />
    <h2>Login to Your Account</h2>
    <p>Manage your tournaments, registrations, and updates in one place.</p>
  </div>

  <div className="login-form">
    <h3>Sign In</h3>
    <div className="input-group">
      <FaEnvelope className="icon" />
      <input type="email" placeholder="Enter your email" />
    </div>
    <div className="input-group">
      <FaLock className="icon" />
      <input type="password" placeholder="Enter your password" />
    </div>
    <button className="login-btn">Login</button>

    <div className="links">
      <Link to="#">Forgot Password?</Link>
      <Link to="/signup">Register Here</Link>
    </div>

    <p className="or-text">Or continue with</p>
    <div className="social-login">
      <button className="google-btn">Google</button>
      <button className="facebook-btn">Facebook</button>
    </div>
    <p className="security-text">🔒 Your credentials are encrypted for security</p>
  </div>
</div>

      </div>

      {/* Footer */}
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
            <h3>Programs</h3>
            <ul>
              <li><Link to="#">Beginner's Program</Link></li>
              <li><Link to="#">Advanced Training</Link></li>
              <li><Link to="#">Elite Training</Link></li>
              <li><Link to="#">School Programs</Link></li>
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

export default LoginPage;
