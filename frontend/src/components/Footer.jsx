// src/components/Footer.jsx
import React from "react";
import "../styles/global.css";

const Footer = () => {
  return (
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
            <li><a href="/about">About Us</a></li>
            <li><a href="/tournaments">Tournaments</a></li>
            <li><a href="/training">Training Programs</a></li>
            <li><a href="/news">News & Media</a></li>
            <li><a href="/contact">Contact Us</a></li>
          </ul>
        </div>
        <div className="footer-section">
          <h3>Programs</h3>
          <ul>
            <li><a href="#">Beginner's Program</a></li>
            <li><a href="#">Advanced Training</a></li>
            <li><a href="#">Elite Training</a></li>
            <li><a href="#">School Programs</a></li>
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
          <a href="/privacy">Privacy Policy</a>
          <a href="/terms">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;