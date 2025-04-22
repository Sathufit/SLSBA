import React, { useState, useEffect } from "react";
import { Calendar, MapPin, Phone, Mail, ChevronRight } from "lucide-react";
import "../styles/global.css"; 
import { Link } from "react-router-dom";

const Home = () => {
  const [category, setCategory] = useState("All Categories");
  const [region, setRegion] = useState("All Regions");
  const [visible, setVisible] = useState(false);

  // Animation trigger on page load
  useEffect(() => {
    setVisible(true);
  }, []);

  const [tournaments, setTournaments] = useState([]);

useEffect(() => {
  setVisible(true);
  fetchTournaments();
}, []);


const fetchTournaments = async () => {
  try {
    const res = await fetch("http://localhost:5001/api/tournaments/all"); // 👈 Use correct endpoint
    if (!res.ok) throw new Error("Failed to fetch");
    const data = await res.json();
    setTournaments(data);
  } catch (err) {
    console.error("Failed to fetch tournaments", err);
  }
};


  // Animation classes
  const fadeInClass = visible ? "opacity-100" : "opacity-0";
  const transitionClass = "transition-all duration-700 ease-out";

  return (
    <div className={`home-container ${fadeInClass} ${transitionClass}`}>
      {/* Navbar */}
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

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Welcome to Sri Lanka Schools Badminton Association</h1>
          <p>Empowering the next generation of champions</p>
        </div>
      </section>
      {/* Tournaments Section */}
      <section className="tournaments-section">
        <div className="section-header">
          <h2>Upcoming Tournaments</h2>
          <div className="filters">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option>All Categories</option>
              <option>Under 15</option>
              <option>Under 17</option>
              <option>Under 19</option>
            </select>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
            >
              <option>All Regions</option>
              <option>Colombo</option>
              <option>Kandy</option>
            </select>
          </div>
        </div>

        <div className="tournaments-grid">
            {tournaments
              .filter(t => 
                (category === "All Categories" || t.category === category) &&
                (region === "All Regions" || t.venue?.toLowerCase().includes(region.toLowerCase()))
              )
              .map((tournament) => (
                <div key={tournament._id} className="tournament-card">
                  <span className="category">{tournament.category}</span>
                  <h3>{tournament.tournamentName}</h3>
                  <div className="tournament-info">
                    <Calendar size={16} />
                    <span>{new Date(tournament.date).toLocaleDateString()}</span>
                  </div>
                  <div className="tournament-info">
                    <MapPin size={16} />
                    <span>{tournament.venue}</span>
                  </div>
                  <Link to={`/tournamentReg/${tournament._id}`} className="register-btn1">
                  Register Now <ChevronRight size={16} className="inline ml-1" />
                  </Link>
                </div>
            ))}
          </div>
      </section>

      {/* Training Programs Section */}
      <section className="training-section">
        <h2>Training Programs</h2>
        <div className="training-grid">
          <div className="training-card">
            <img src="/training1.png" alt="Beginner's Program" />
            <div className="training-content">
              <h3>Beginner's Program</h3>
              <ul>
                <li>☑️ Basic techniques and rules</li>
                <li>☑️ Footwork training</li>
                <li>☑️ Equipment guidance</li>
              </ul>
              <Link to={`/training`} className="register-btn1">
                  Join Now <ChevronRight size={16} className="inline ml-1" />
              </Link>
            </div>
          </div>
          <div className="training-card">
            <img src="/training2.png" alt="Advanced Training" />
            <div className="training-content">
              <h3>Advanced Training</h3>
              <ul>
                <li>☑️ Advanced strategies</li>
                <li>☑️ Competition preparation</li>
                <li>☑️ Physical conditioning</li>
              </ul>
              <Link to={`/training`} className="register-btn1">
                  Join Now <ChevronRight size={16} className="inline ml-1" />
              </Link>
            </div>
          </div>
          <div className="training-card">
            <img src="/training3.png" alt="Elite Training" />
            <div className="training-content">
              <h3>Elite Training</h3>
              <ul>
                <li>☑️ Professional coaching</li>
                <li>☑️ Performance analysis</li>
                <li>☑️ Tournament support</li>
              </ul>
              <Link to={`/training`} className="register-btn1">
                  Join Now <ChevronRight size={16} className="inline ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact-section">
        <h2>Office Location</h2>
        <div className="contact-info">
          <div className="info-item">
            <MapPin />
            <div>
              <h4>Address</h4>
              <p>123 Badminton Avenue, Colombo 07, Sri Lanka</p>
            </div>
          </div>
          <div className="info-item">
            <Phone />
            <div>
              <h4>Phone</h4>
              <p>+94 11 2345678</p>
            </div>
          </div>
          <div className="info-item">
            <Mail />
            <div>
              <h4>Email</h4>
              <p>info@slsba.lk</p>
            </div>
          </div>
        </div>
      </section>

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
              <li><a href="/about">About Us</a></li>
              <li><a href="/tournaments">Tournaments</a></li>
              <li><a href="/programs">Training Programs</a></li>
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
    </div>
  );
};

export default Home;