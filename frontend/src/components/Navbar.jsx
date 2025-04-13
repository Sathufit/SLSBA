// src/components/Navbar.jsx
import React from "react";
import { Link } from "react-router-dom";
import "../styles/global.css";

const Navbar = () => {
  return (
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
          <img src="/user-icon.webp" alt="User Icon" className="user-icon" />
        </Link>
      </nav>
    </header>
  );
};

export default Navbar;