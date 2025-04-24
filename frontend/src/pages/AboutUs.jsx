import React, { useState, useEffect } from "react";
import { Users, Award, Target, Calendar, MapPin, Phone, Mail, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import "../styles/AboutPage.css";

const AboutUs = () => {
  const [visible, setVisible] = useState(false);

  // Animation trigger on page load
  useEffect(() => {
    setVisible(true);
  }, []);

  // Leadership team data
  const leadershipTeam = [
    {
      id: 1,
      name: "Dr. Samantha Perera",
      position: "President",
      image: "/two.webp",
      bio: "Dr. Samantha has over 20 years of experience in sports administration and has been instrumental in elevating school badminton in Sri Lanka.",
      achievements: ["Former National Badminton Champion", "Sports Administration PhD", "Ministry of Education Advisor"]
    },
    {
      id: 2,
      name: "Mrs. Malika Waduge",
      position: "Vice President",
      image: "/one.webp",
      bio: "Mrs. Malika brings 15 years of coaching experience and has led multiple school teams to national championships.",
      achievements: ["National Coach Certification", "Former National Player", "Physical Education Specialist"]
    },
    {
      id: 3,
      name: "Mrs. Kumari Fernando",
      position: "Secretary",
      image: "/three.webp",
      bio: "Mrs. Kumari oversees all administrative functions and has been with SLSBA for over a decade, ensuring smooth operations.",
      achievements: ["Sports Management Degree", "Event Organization Specialist", "Former School Coach"]
    },
    {
      id: 4,
      name: "Mr. Anura Bandara",
      position: "Treasurer",
      image: "/four.webp",
      bio: "Mr. Anura manages the association's finances and fundraising efforts, bringing corporate sponsorships to support programs.",
      achievements: ["Chartered Accountant", "Corporate Relations Expert", "Financial Management Professional"]
    }
  ];

  // Milestones data
  const milestones = [
    {
      year: "1985",
      title: "Foundation",
      description: "Establishment of Sri Lanka Schools Badminton Association"
    },
    {
      year: "1992",
      title: "First National Tournament",
      description: "Organized the first all-island schools badminton championship"
    },
    {
      year: "2000",
      title: "International Recognition",
      description: "SLSBA players represented Sri Lanka in Asian School Badminton Championship"
    },
    {
      year: "2008",
      title: "Coaching Excellence",
      description: "Launched standardized coaching programs across all provinces"
    },
    {
      year: "2015",
      title: "Development Center",
      description: "Opened the National School Badminton Development Center in Colombo"
    },
    {
      year: "2023",
      title: "Digital Transformation",
      description: "Introduced online registration system and tournament management platform"
    }
  ];

  // Animation classes
  const fadeInClass = visible ? "opacity-100" : "opacity-0";
  const transitionClass = "transition-all duration-700 ease-out";

  // Achievements Section with CountUp animation
  const AchievementsSection = () => {
    const [isVisible, setIsVisible] = useState(false);
  
    useEffect(() => {
      const handleScroll = () => {
        const section = document.querySelector(".achievements-section");
        if (!section) return;
  
        const rect = section.getBoundingClientRect();
        if (rect.top < window.innerHeight && !isVisible) {
          setIsVisible(true);
        }
      };
  
      window.addEventListener("scroll", handleScroll);
      handleScroll(); // Check on load in case already in view
  
      return () => window.removeEventListener("scroll", handleScroll);
    }, [isVisible]);
  
    const countUp = (target) => {
      const [count, setCount] = useState(0);
  
      useEffect(() => {
        if (!isVisible) return;
  
        let start = 0;
        const end = parseInt(target);
        const duration = 2000;
        const stepTime = Math.abs(Math.floor(duration / end));
  
        const timer = setInterval(() => {
          start += 1;
          setCount(start);
          if (start === end) clearInterval(timer);
        }, stepTime);
  
        return () => clearInterval(timer);
      }, [isVisible, target]);
  
      return count;
    };

    return null; // Add implementation if needed
  };

  return (
    <div className={`about-container ${fadeInClass} ${transitionClass}`}>
      {/* Navbar */}
      <header className="navbar">
        <nav>
          <div className="logo1">
            <img src="/logo.png" alt="SLSBA Logo" className="logo" />
            <span className="logo-text">SLSBA</span>
          </div>
          <ul className="nav-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about" className="active">About Us</Link></li>
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

      {/* Hero Section */}
      <section className="hero-section3">
        <div className="hero-content3">
          <h1>About Us </h1>
          <p>Empowering young badminton talent across Sri Lanka since 1985</p>
        </div>
      </section>

      {/* Our Legacy Section */}
      <section className="legacy-section">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title fade-in">Our Legacy</h2>
            <div className="section-divider"></div>
          </div>

          <div className="legacy-content">
            <div className="legacy-text fade-in delay-1">
              <p>The Sri Lanka Schools Badminton Association has been at the forefront of school-level badminton in Sri Lanka for more than 35 years. Our passion and commitment to developing young talent have established us as the premier school sport organization in the country.</p>
              
              <p>Over the decades, we've produced numerous national champions and international players who have brought glory to our nation. The association strives to identify and nurture promising talent from schools across all provinces, providing them with world-class training and competitive opportunities.</p>
              
              <p>Our comprehensive approach focuses on technical skills, physical conditioning, mental strength, and sportsmanship - creating well-rounded athletes who excel both on and off the court.</p>
            </div>
            
            <div className="legacy-image fade-in delay-2">
              <div className="image-wrapper shine-effect">
                <img src="/champion-player.png" alt="National School Champion" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Milestones Timeline Section */}
      <section className="milestones-section">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title fade-in">Our Journey</h2>
            <div className="section-divider"></div>
          </div>
          
          <div className="timeline">
            {milestones.map((milestone, index) => (
              <div 
                key={index} 
                className={`timeline-item ${index % 2 === 0 ? 'left' : 'right'}`}
                style={{ animationDelay: `${0.2 + index * 0.15}s` }}
              >
                <div className="timeline-content">
                  <div className="year-badge">{milestone.year}</div>
                  <h3>{milestone.title}</h3>
                  <p>{milestone.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Meet the Leadership Team */}
      <section className="leadership-section">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title fade-in">Meet the Leadership Team</h2>
            <div className="section-divider"></div>
          </div>
          
          <div className="team-grid">
            {leadershipTeam.map((member, index) => (
              <div 
                key={member.id} 
                className="team-member fade-in-up"
                style={{ animationDelay: `${0.2 + index * 0.15}s` }}
              >
                <div className="member-avatar">
                  <img src={member.image} alt={member.name} />
                </div>
                <div className="member-info">
                  <h3>{member.name}</h3>
                  <span className="position">{member.position}</span>
                  <p className="bio">{member.bio}</p>
                  <div className="achievements">
                    {member.achievements.map((achievement, i) => (
                      <span key={i} className="achievement-badge">{achievement}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="vision-mission-section">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title fade-in">Our Vision & Mission</h2>
            <div className="section-divider"></div>
          </div>
          
          <div className="vision-mission-content">
            <div className="vision-card fade-in-up">
              <div className="card-icon">
                <Target size={48} />
              </div>
              <h3>Our Vision</h3>
              <p>To be the leading badminton development organization in Asia, creating world-class players who represent Sri Lanka with pride on the international stage.</p>
            </div>
            
            <div className="mission-card fade-in-up" style={{ animationDelay: "0.3s" }}>
              <div className="card-icon">
                <Award size={48} />
              </div>
              <h3>Our Mission</h3>
              <p>Our mission is to develop and promote badminton at the school level, while creating opportunities for young athletes to excel in the sport and represent Sri Lanka on the international stage.</p>
            </div>
          </div>
          
          <div className="core-values">
            <h3 className="values-title fade-in">Core Values</h3>
            <div className="values-grid">
              <div className="value-item fade-in-up" style={{ animationDelay: "0.2s" }}>
                <h4>Excellence</h4>
                <p>Striving for the highest standards in all aspects of our programs and operations</p>
              </div>
              <div className="value-item fade-in-up" style={{ animationDelay: "0.3s" }}>
                <h4>Integrity</h4>
                <p>Maintaining honesty, fairness, and transparency in all our activities</p>
              </div>
              <div className="value-item fade-in-up" style={{ animationDelay: "0.4s" }}>
                <h4>Inclusivity</h4>
                <p>Creating opportunities for all students regardless of background or circumstances</p>
              </div>
              <div className="value-item fade-in-up" style={{ animationDelay: "0.5s" }}>
                <h4>Innovation</h4>
                <p>Continuously improving our methods and embracing new approaches</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Initiatives */}
      <section className="initiatives-section">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title fade-in">Key Initiatives</h2>
            <div className="section-divider"></div>
          </div>
          
          <div className="initiatives-grid">
            <div className="initiative-card fade-in-up">
              <div className="initiative-icon">
                <Users size={40} />
              </div>
              <h3>School Development Program</h3>
              <p>Supporting schools to establish and improve their badminton programs through coach training, equipment grants, and technical assistance.</p>
            </div>
            
            <div className="initiative-card fade-in-up" style={{ animationDelay: "0.3s" }}>
              <div className="initiative-icon">
                <Calendar size={40} />
              </div>
              <h3>Tournament Structure</h3>
              <p>Organizing a comprehensive tournament calendar that provides competitive opportunities for all age groups across the country.</p>
            </div>
            
            <div className="initiative-card fade-in-up" style={{ animationDelay: "0.4s" }}>
              <div className="initiative-icon">
                <Award size={40} />
              </div>
              <h3>Elite Player Program</h3>
              <p>Identifying exceptionally talented players and providing them with specialized training, nutrition support, and international exposure.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section className="achievements-section">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title fade-in">Our Achievements</h2>
            <div className="section-divider"></div>
          </div>
          
          <div className="achievement-stats">
            <div className="stat-card fade-in-up">
              <div className="stat-number">35+</div>
              <div className="stat-label">Years of Excellence</div>
            </div>
            
            <div className="stat-card fade-in-up" style={{ animationDelay: "0.3s" }}>
              <div className="stat-number">150+</div>
              <div className="stat-label">National Champions</div>
            </div>
            
            <div className="stat-card fade-in-up" style={{ animationDelay: "0.4s" }}>
              <div className="stat-number">25+</div>
              <div className="stat-label">International Representatives</div>
            </div>
            
            <div className="stat-card fade-in-up" style={{ animationDelay: "0.5s" }}>
              <div className="stat-number">500+</div>
              <div className="stat-label">Schools Supported</div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA Section */}
      <section className="contact-cta-section">
        <div className="section-container">
          <div className="cta-content fade-in">
            <h2>Get Involved with SLSBA</h2>
            <p>Join us in developing the next generation of badminton champions in Sri Lanka. Whether you're a school administrator, coach, parent, or sponsor, we'd love to hear from you.</p>
            
            <div className="contact-options">
              <div className="contact-option fade-in-up">
                <MapPin size={20} />
                <span>SLSBA Headquarters, Sugathadasa Stadium, Colombo</span>
              </div>
              
              <div className="contact-option fade-in-up" style={{ animationDelay: "0.3s" }}>
                <Phone size={20} />
                <span>+94 11 2334455</span>
              </div>
              
              <div className="contact-option fade-in-up" style={{ animationDelay: "0.4s" }}>
                <Mail size={20} />
                <span>contact@slsba.lk</span>
              </div>
            </div>
            
            <Link to="/contact" className="contact-button">
              Contact Us <ChevronRight size={16} className="inline ml-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* Social Media & Connect */}
      <section className="social-connect-section">
        <div className="section-container">
          <h2 className="connect-title fade-in">Stay Connected</h2>
          
          <div className="social-icons">
            <a href="https://facebook.com" className="social-icon fade-in-up">
              <img src="/facebook.png" alt="Facebook" />
            </a>
            <a href="https://instagram.com" className="social-icon fade-in-up" style={{ animationDelay: "0.2s" }}>
              <img src="/instagram.png" alt="Instagram" />
            </a>
            <a href="https://twitter.com" className="social-icon fade-in-up" style={{ animationDelay: "0.3s" }}>
              <img src="/twitter.png" alt="Twitter" />
            </a>
            <a href="https://youtube.com" className="social-icon fade-in-up" style={{ animationDelay: "0.4s" }}>
              <img src="/youtube.png" alt="YouTube" />
            </a>
          </div>
          
          <div className="join-support-cta">
            <Link to="/join" className="join-button pulse">
              Join Us & Support Young Talent
            </Link>
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

export default AboutUs;