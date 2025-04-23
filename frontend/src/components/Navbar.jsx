import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/global.css";

const Navbar = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    navigate("/login");
  };

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

        {/* ✅ Profile / Login logic */}
        {localStorage.getItem("user") ? (
                <div className="profile-section">
                  <Link to="/profile">
                    <img
                      src="/user-icon.webp"
                      alt="Profile"
                      className="user-icon"
                      style={{ cursor: "pointer" }}
                    />
                  </Link>
                  <button
                    onClick={() => {
                      localStorage.clear();
                      window.location.href = "/login";
                    }}
                    className="logout-btn"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link to="/login">
                  <img
                    src="/user-icon.webp"
                    alt="Login"
                    className="user-icon"
                    style={{ cursor: "pointer" }}
                  />
                </Link>
              )}
      </nav>
    </header>
  );
};

export default Navbar;
