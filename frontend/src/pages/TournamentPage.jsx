import React, { useState, useEffect } from "react";
import {
  Calendar,
  MapPin,
  Filter,
  Search,
  ChevronRight,
  ChevronDown,
  Users,
} from "lucide-react";
import "../styles/global.css";
import "../styles/TournamentPage.css";
import { Link } from "react-router-dom";
import axios from "axios";

const Tournaments = () => {
  const [category, setCategory] = useState("All Categories");
  const [region, setRegion] = useState("All Regions");
  const [timeframe, setTimeframe] = useState("Upcoming");
  const [searchQuery, setSearchQuery] = useState("");
  const [visible, setVisible] = useState(false);
  const [expandedTournament, setExpandedTournament] = useState(null);
  const [tournaments, setTournaments] = useState([]);

  // Animation trigger on page load
  useEffect(() => {
    setVisible(true);
    fetchTournaments();
  }, []);

  // Fetch tournaments from backend
  const fetchTournaments = async () => {
    try {
      const res = await axios.get("http://localhost:5001/api/tournaments/all");
      console.log("📌 User Page Tournaments:", res.data);
      setTournaments(res.data);
    } catch (error) {
      console.error("❌ Error fetching tournaments:", error);
    }
  };

  // Filter tournaments based on selections and search query
  const filteredTournaments = tournaments.filter((tournament) => {
    const matchesCategory =
      category === "All Categories" || tournament.category === category;
    const matchesRegion =
      region === "All Regions" || tournament.venue?.includes(region);
    const matchesSearch =
      searchQuery === "" ||
      tournament.tournamentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tournament.venue?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesRegion && matchesSearch;
  });

  // Toggle tournament details
  const toggleTournamentDetails = (id) => {
    setExpandedTournament(expandedTournament === id ? null : id);
  };

  const fadeInClass = visible ? "opacity-100" : "opacity-0";
  const transitionClass = "transition-all duration-700 ease-out";

  return (
    <div className={`tournaments-container ${fadeInClass} ${transitionClass}`}>
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
            <li><Link to="/tournaments" className="active">Tournaments</Link></li>
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

      {/* Page Banner */}
      <section className="hero-section4">
        <div className="hero-content4">
          <h1>Tournament </h1>
          <p>Discover and register for upcoming badminton tournaments across Sri Lanka</p>
        </div>
      </section>
      {/* Filter Section */}
      <section className="filter-section">
        <div className="search-bar">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Search tournaments..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="filter-controls">
          <div className="filter-item">
            <Filter size={16} />
            <select 
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
            >
              <option>All Categories</option>
              <option>Under 13</option>
              <option>Under 15</option>
              <option>Under 17</option>
              <option>Under 19</option>
              <option>Open</option>
            </select>
          </div>
          <div className="filter-item">
            <MapPin size={16} />
            <select 
              value={region} 
              onChange={(e) => setRegion(e.target.value)}
            >
              <option>All Regions</option>
              <option>Colombo</option>
              <option>Kandy</option>
              <option>Galle</option>
              <option>Jaffna</option>
            </select>
          </div>
          <div className="filter-item">
            <Calendar size={16} />
            <select 
              value={timeframe} 
              onChange={(e) => setTimeframe(e.target.value)}
            >
              <option>Upcoming</option>
              <option>Past Events</option>
              <option>This Month</option>
              <option>Next Month</option>
            </select>
          </div>
        </div>
      </section>

      {/* 🏸 Tournaments List */}
<section className="tournaments-list-section">
  <h2>
    Upcoming Tournaments{" "}
    <span className="count">({filteredTournaments.length})</span>
  </h2>

  <div className="tournaments-list">
    {filteredTournaments.length > 0 ? (
      filteredTournaments.map((tournament, index) => (
        <div
          key={tournament._id}
          className={`tournament-item ${
            expandedTournament === tournament._id ? "expanded" : ""
          }`}
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          {/* ➤ Tournament Header */}
          <div
            className="tournament-main"
            onClick={() => toggleTournamentDetails(tournament._id)}
          >
            <div className="tournament-header">
              <span className="category-badge">{tournament.category}</span>
              <span className={`status-badge ${tournament.status?.toLowerCase().replace(" ", "-")}`}>
                {tournament.status}
              </span>
            </div>
            <h3>{tournament.tournamentName}</h3>
            <div className="tournament-basic-info">
              <div className="info-item">
                <Calendar size={16} />
                <span>{new Date(tournament.date).toLocaleDateString()}</span>
              </div>
              <div className="info-item">
                <MapPin size={16} />
                <span>{tournament.venue}</span>
              </div>
              <div className="info-item">
                <Users size={16} />
                <span>{tournament.maxParticipants} participants</span>
              </div>
            </div>
            <div className="expand-indicator">
              <ChevronDown
                size={20}
                className={expandedTournament === tournament._id ? "rotate" : ""}
              />
            </div>
          </div>

          {/* ➤ Tournament Details (Expanded) */}
          {expandedTournament === tournament._id && (
              <div className="tournament-details">
                <div className="details-grid">
                  <div className="detail-item">
                    <h4>Description</h4>
                    <p>{tournament.description || "No description provided."}</p>
                  </div>
                  <div className="detail-item">
                    <h4>Registration Deadline</h4>
                    <p>
                      {tournament.registrationDeadline
                        ? new Date(tournament.registrationDeadline).toLocaleDateString()
                        : "—"}
                    </p>
                  </div>
                  <div className="detail-item">
                    <h4>Coordinator</h4>
                    <p>{tournament.coordinator || "—"}</p>
                  </div>
                  <div className="detail-item">
                    <h4>Contact</h4>
                    <p>{tournament.contact || "—"}</p>
                  </div>
                  <div className="detail-item">
                    <h4>Prizes</h4>
                    <p>{tournament.prizes || "—"}</p>
                  </div>
                </div>

                <div className="details-actions">
                  <Link to={`/tournamentReg/${tournament._id}`} className="register-btn1">
                    Register Now <ChevronRight size={16} />
                  </Link>
                  <button className="details-btn">
                    Full Details <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
        </div>
      ))
    ) : (
      <div className="no-results">
        <h3>No tournaments found</h3>
        <p>Try adjusting your filters or search criteria</p>
      </div>
    )}
  </div>
</section>


      {/* Calendar Section */}
      <section className="tournament-calendar-section">
        <h2>Tournament Calendar</h2>
        <p>Plan ahead with our comprehensive tournament schedule for the year 2025</p>
        
        <div className="calendar-cta">
          <button className="download-btn">
            Download 2025 Calendar
          </button>
          <button className="ical-btn">
            Add to iCal/Google Calendar
          </button>
        </div>
      </section>

      {/* Registration Information */}
      <section className="registration-info-section">
        <h2>Registration Information</h2>
        
        <div className="info-cards">
          <div className="info-card">
            <h3>How to Register</h3>
            <ol>
              <li>Create an account or login to your existing account</li>
              <li>Find your desired tournament and click "Register Now"</li>
              <li>Fill in the required participant details</li>
              <li>Pay the registration fee</li>
              <li>Receive confirmation email with details</li>
            </ol>
          </div>
          
          <div className="info-card">
            <h3>Registration Requirements</h3>
            <ul>
              <li>☑️ Valid school ID or affiliation letter</li>
              <li>☑️ Parent/guardian consent for under 18 players</li>
              <li>☑️ Medical clearance certificate</li>
              <li>☑️ Copy of birth certificate (for age verification)</li>
              <li>☑️ Recent passport-sized photograph</li>
            </ul>
          </div>
          
          <div className="info-card">
            <h3>Registration Fees</h3>
            <table className="fees-table">
              <tbody>
                <tr>
                  <td>Under 13 Category</td>
                  <td>Rs. 1,000 per player</td>
                </tr>
                <tr>
                  <td>Under 15 Category</td>
                  <td>Rs. 1,500 per player</td>
                </tr>
                <tr>
                  <td>Under 17 Category</td>
                  <td>Rs. 2,000 per player</td>
                </tr>
                <tr>
                  <td>Under 19 Category</td>
                  <td>Rs. 2,500 per player</td>
                </tr>
                <tr>
                  <td>Open Category</td>
                  <td>Rs. 3,000 per player</td>
                </tr>
              </tbody>
            </table>
            <p className="fees-note">* Doubles events require both players to register separately</p>
          </div>
        </div>
      </section>

      {/* Past Tournament Results Section */}
      <section className="past-tournament-results-section">
        <h2 className="section-title fade-in">Past Tournament Results <span className="count">({pastResults.length})</span></h2>
        <p className="section-description fade-in delay-1">View and download results from our previous tournaments</p>
        
        <div className="results-list">
          {pastResults.map((result, index) => (
            <div 
              key={result.id}
              className="result-item fade-in-up"
              style={{ animationDelay: `${0.1 + index * 0.1}s` }}
            >
              <div className="result-main">
                <div className="result-header">
                  <span className="category-badge">{result.category}</span>
                  <span className="date-badge">{result.date}</span>
                </div>
                <h3 className="result-title">{result.title}</h3>
                <div className="result-details">
                  <div className="venue">
                    <MapPin size={16} />
                    <span>{result.venue}</span>
                  </div>
                  <div className="winners">
                    <div className="winner">
                      <span className="label">Winner:</span> 
                      <span className="value">{result.winner}</span>
                    </div>
                    <div className="runner-up">
                      <span className="label">Runner-up:</span> 
                      <span className="value">{result.runnerUp}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="result-actions">
                <a href={result.downloadUrl} className="download-results-btn">
                  Download Results <ChevronRight size={16} className="inline ml-1" />
                </a>
              </div>
            </div>
          ))}
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

// Sample past tournament results data
const pastResults = [
  {
    id: 101,
    title: "National School Championship 2024",
    date: "March 18-23, 2024",
    venue: "Sugathadasa Stadium, Colombo",
    category: "Under 17",
    winner: "Royal College, Colombo",
    runnerUp: "Ananda College, Colombo",
    downloadUrl: "/results/Tournament_Results.pdf"
  },
  {
    id: 102,
    title: "Provincial Tournament - Western Province 2024",
    date: "April 7-10, 2024",
    venue: "Royal College Sports Complex, Colombo",
    category: "Under 15",
    winner: "Vishaka Vidyalaya, Colombo",
    runnerUp: "Sirimavo Bandaranaike Vidyalaya, Colombo",
    downloadUrl: "/results/western-province-2024.pdf"
  },
  {
    id: 103,
    title: "All Island School Games 2024",
    date: "May 5-9, 2024",
    venue: "Kandy Sports Complex, Kandy",
    category: "Under 19",
    winner: "Trinity College, Kandy",
    runnerUp: "Royal College, Colombo",
    downloadUrl: "/results/all-island-school-games-2024.pdf"
  },
  {
    id: 104,
    title: "Junior Development Series 2024",
    date: "February 18-20, 2024",
    venue: "Galle National Stadium, Galle",
    category: "Under 13",
    winner: "Richmond College, Galle",
    runnerUp: "Mahinda College, Galle",
    downloadUrl: "/results/junior-development-series-2024.pdf"
  },
  {
    id: 105,
    title: "Inter-School Championship 2024",
    date: "June 12-17, 2024",
    venue: "Jaffna Central College Courts, Jaffna",
    category: "Open",
    winner: "Jaffna Central College, Jaffna",
    runnerUp: "St. Patrick's College, Jaffna",
    downloadUrl: "/results/inter-school-championship-2024.pdf"
  }
];

export default Tournaments;