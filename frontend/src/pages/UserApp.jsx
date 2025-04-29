import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import '../styles/UserApp.css';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const TrainingPrograms = () => {
  const [trainings, setTrainings] = useState([]);
  const [filteredTrainings, setFilteredTrainings] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [selectedLevel, setSelectedLevel] = useState("All Levels");
  const [isLoading, setIsLoading] = useState(true);
  const [registerFormData, setRegisterFormData] = useState({
    fullname: "",
    dateofbirth: "",
    gender: "",
    schoolname: "",
    contactnumber: "",
    email: "",
    address: "",
    guardianname: "",
    guardiancontact: "",
    selectedProgramId: ""
  });
  const [submitStatus, setSubmitStatus] = useState({ show: false, success: false, message: "" });
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(null);

  useEffect(() => {
    const fetchTrainings = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${BASE_URL}/api/training`);
        if (Array.isArray(response.data)) {
          setTrainings(response.data);
          setFilteredTrainings(response.data);
        } else {
          console.error("Unexpected response format:", response.data);
          setTrainings([]);
          setFilteredTrainings([]);
        }
      } catch (error) {
        console.error("Error fetching training programs:", error);
        setTrainings([]);
        setFilteredTrainings([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrainings();
  }, []);

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    filterTrainings(query, selectedCategory, selectedLocation, selectedLevel);
  };

  const handleCategoryFilter = (category) => {
    setSelectedCategory(category);
    filterTrainings(searchQuery, category, selectedLocation, selectedLevel);
  };

  const handleLocationFilter = (location) => {
    setSelectedLocation(location);
    filterTrainings(searchQuery, selectedCategory, location, selectedLevel);
  };

  const handleLevelFilter = (level) => {
    setSelectedLevel(level);
    filterTrainings(searchQuery, selectedCategory, selectedLocation, level);
  };

  const filterTrainings = (query, category, location, level) => {
    let filtered = trainings;

    if (query) {
      filtered = filtered.filter(program => 
        program.programname?.toLowerCase().includes(query.toLowerCase()) ||
        program.trainingtype?.toLowerCase().includes(query.toLowerCase())
      );
    }

    if (category && category !== "All Categories") {
      filtered = filtered.filter(program => program.trainingtype === category);
    }

    if (location && location !== "All Locations") {
      filtered = filtered.filter(program => program.location === location);
    }

    if (level && level !== "All Levels") {
      filtered = filtered.filter(program => program.level === level);
    }

    setFilteredTrainings(filtered);
  };

  const openRegisterForm = (program) => {
    setSelectedProgram(program);
    setRegisterFormData(prev => ({
      ...prev,
      selectedProgramId: program._id
    }));
    setShowRegisterForm(true);
    setTimeout(() => {
      document.getElementById('register-form')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleRegister = (e) => {
    e.preventDefault();
  
    const playerData = {
      fullname: registerFormData.fullname,
      dateofbirth: registerFormData.dateofbirth,
      gender: registerFormData.gender,
      schoolname: registerFormData.schoolname,
      contactnumber: registerFormData.contactnumber,
      email: registerFormData.email,
      address: registerFormData.address,
      guardianname: registerFormData.guardianname,
      guardiancontact: registerFormData.guardiancontact,
      programid: registerFormData.selectedProgramId,
      programname: selectedProgram?.programname,   // ✅ ADD THIS LINE
    };
    
  
    console.log("🔎 Submitting playerData:", playerData);  // <--- ADD THIS
  
    axios.post(`${BASE_URL}/api/players`, playerData)
      .then(() => {
        setSubmitStatus({ show: true, success: true, message: "You've successfully registered!" });
        setRegisterFormData({
          fullname: "",
          dateofbirth: "",
          gender: "",
          schoolname: "",
          contactnumber: "",
          email: "",
          address: "",
          guardianname: "",
          guardiancontact: "",
          selectedProgramId: ""
        });
        setTimeout(() => {
          setSubmitStatus({ show: false, success: false, message: "" });
          setShowRegisterForm(false);
        }, 5000);
      })
      .catch((err) => {
        console.error("❌ Registration failed", err.response?.data || err.message);
        setSubmitStatus({ show: true, success: false, message: "Something went wrong. Try again!" });
        setTimeout(() => {
          setSubmitStatus({ show: false, success: false, message: "" });
        }, 5000);
      });
  };
  

  const categories = ["All Categories", ...new Set(trainings.map(program => program.trainingtype))];
  const locations = ["All Locations", ...new Set(trainings.map(program => program.location))];
  const levels = ["All Levels", "Beginner", "Intermediate", "Advanced"];

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className="training-programs-container">
      <Navbar />

      {/* Hero Section */}
      <div className="hero-section2">
        <div className="hero-content2">
          <h1 className="animate-fade-in">Training Programs</h1>
          <p className="animate-slide-up">Discover and register for upcoming badminton training programs across Sri Lanka</p>
        </div>
      </div>
      
      <div className="training-programs-content">
        {/* Search and Filter Section */}
        <div className="search-filter-container animate-fade-in">
          <div className="search-box">
            <input 
              type="text" 
              placeholder="Search training programs..." 
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
          
          <div className="filter-options">
            <div className="filter-dropdown">
              <select 
                value={selectedCategory} 
                onChange={(e) => handleCategoryFilter(e.target.value)}
                className="custom-select"
              >
                {categories.map((category, index) => (
                  <option key={index} value={category}>{category}</option>
                ))}
              </select>
            </div>
            
            <div className="filter-dropdown">
              <select 
                value={selectedLocation} 
                onChange={(e) => handleLocationFilter(e.target.value)}
                className="custom-select"
              >
                {locations.map((location, index) => (
                  <option key={index} value={location}>{location}</option>
                ))}
              </select>
            </div>
            
            <div className="filter-dropdown">
              <select 
                value={selectedLevel} 
                onChange={(e) => handleLevelFilter(e.target.value)}
                className="custom-select"
              >
                {levels.map((level, index) => (
                  <option key={index} value={level}>{level}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        {/* Training Programs List */}
        <div className="programs-list-section">
          <h2 className="section-title">Upcoming Training Programs <span className="program-count">({filteredTrainings.length})</span></h2>
          
          {isLoading ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Loading programs...</p>
            </div>
          ) : filteredTrainings.length === 0 ? (
            <div className="no-programs">
              <i className="empty-icon fas fa-folder-open"></i>
              <p>No training programs match your search criteria.</p>
              <button className="reset-button" onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All Categories");
                setSelectedLocation("All Locations");
                setSelectedLevel("All Levels");
                setFilteredTrainings(trainings);
              }}>Reset Filters</button>
            </div>
          ) : (
            <div className="programs-grid">
              {filteredTrainings.map((program, index) => (
                <div 
                  key={program._id} 
                  className="program-card animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className={`program-level-badge ${program.level?.toLowerCase() || 'all'}`}>
                    {program.level || 'All Levels'}
                  </div>
                  <div className="program-header">
                    <h3>{program.programname}</h3>
                    <span className="program-type">{program.trainingtype}</span>
                  </div>
                  <div className="program-details">
                    <div className="detail-item">
                      <i className="calendar-icon fas fa-calendar-alt"></i>
                      <span>{program.startdate ? formatDate(program.startdate) : 'Ongoing'}</span>
                    </div>
                    <div className="detail-item">
                      <i className="time-icon fas fa-clock"></i>
                      <span>{program.time || 'Flexible Schedule'}</span>
                    </div>
                    <div className="detail-item">
                      <i className="location-icon fas fa-map-marker-alt"></i>
                      <span>{program.location}</span>
                    </div>
                    <div className="detail-item">
                      <i className="coach-icon fas fa-user-tie"></i>
                      <span>{program.coach || 'Professional Coaches'}</span>
                    </div>
                    <div className="detail-item">
                      <i className="participants-icon fas fa-users"></i>
                      <span>{program.participants || 'Limited Spots'} participants</span>
                    </div>
                  </div>
                  <div className="program-footer">
                    <button 

                      className="register-btn2"
                      onClick={() => openRegisterForm(program)}
                    >
                      Register Now <i className="fas fa-arrow-right"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Registration Form */}
        {showRegisterForm && (
          <div id="register-form" className="registration-form-section animate-slide-up">
            <h2>Register for {selectedProgram?.programname}</h2>
            <div className="selected-program-details">
              <div className="detail-row">
                <span className="detail-label">Program:</span>
                <span className="detail-value">{selectedProgram?.programname}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Type:</span>
                <span className="detail-value">{selectedProgram?.trainingtype}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Location:</span>
                <span className="detail-value">{selectedProgram?.location}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Fee:</span>
                <span className="detail-value">Rs. {selectedProgram?.fee || '5,000'}</span>
              </div>
            </div>
            
            {submitStatus.show && (
              <div className={`status-message ${submitStatus.success ? 'success' : 'error'} animate-fade-in`}>
                <i className={submitStatus.success ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'}></i>
                {submitStatus.message}
              </div>
            )}
            
            <form onSubmit={handleRegister} className="registration-form">
              <div className="form-group">
                <label htmlFor="fullname">Full Name</label>
                <input
                  id="fullname"
                  placeholder="Enter your full name"
                  value={registerFormData.fullname}
                  onChange={(e) => setRegisterFormData({ ...registerFormData, fullname: e.target.value })}
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="dateofbirth">Date of Birth</label>
                  <input
                    id="dateofbirth"
                    type="date"
                    value={registerFormData.dateofbirth}
                    onChange={(e) => setRegisterFormData({ ...registerFormData, dateofbirth: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="gender">Gender</label>
                  <select
                    id="gender"
                    value={registerFormData.gender}
                    onChange={(e) => setRegisterFormData({ ...registerFormData, gender: e.target.value })}
                    required
                    className="custom-select"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="schoolname">School Name</label>
                  <input
                    id="schoolname"
                    placeholder="Enter your school name"
                    value={registerFormData.schoolname}
                    onChange={(e) => setRegisterFormData({ ...registerFormData, schoolname: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="contactnumber">Contact Number</label>
                  <input
                    id="contactnumber"
                    placeholder="Enter your contact number"
                    value={registerFormData.contactnumber}
                    onChange={(e) => setRegisterFormData({ ...registerFormData, contactnumber: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={registerFormData.email}
                  onChange={(e) => setRegisterFormData({ ...registerFormData, email: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="address">Address</label>
                <input
                  id="address"
                  placeholder="Enter your address"
                  value={registerFormData.address}
                  onChange={(e) => setRegisterFormData({ ...registerFormData, address: e.target.value })}
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="guardianname">Guardian Name</label>
                  <input
                    id="guardianname"
                    placeholder="Enter guardian name"
                    value={registerFormData.guardianname}
                    onChange={(e) => setRegisterFormData({ ...registerFormData, guardianname: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="guardiancontact">Guardian Contact</label>
                  <input
                    id="guardiancontact"
                    placeholder="Enter guardian contact"
                    value={registerFormData.guardiancontact}
                    onChange={(e) => setRegisterFormData({ ...registerFormData, guardiancontact: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="form-buttons">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowRegisterForm(false)}
                >
                  <i className="fas fa-times"></i> Cancel
                </button>
                <button
                  type="submit"
                  className="submit-btn"
                >
                  <i className="fas fa-check"></i> Complete Registration
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
      
      {/* Training Benefits Section */}
      <div className="benefits-section">
        <div className="benefits-content">
          <h2 className="section-title animate-fade-in">Why Join Our Training Programs?</h2>
          <div className="benefits-grid">
            <div className="benefit-card animate-slide-up">
              <div className="benefit-icon coach-benefit">
                <i className="fas fa-user-tie"></i>
              </div>
              <h3>Professional Coaches</h3>
              <p>Learn from experienced coaches who have trained national champions</p>
            </div>
            <div className="benefit-card animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="benefit-icon technique-benefit">
                <i className="fas fa-trophy"></i>
              </div>
              <h3>Advanced Techniques</h3>
              <p>Master essential skills and techniques for competitive play</p>
            </div>
            <div className="benefit-card animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <div className="benefit-icon facility-benefit">
                <i className="fas fa-building"></i>
              </div>
              <h3>Modern Facilities</h3>
              <p>Train in state-of-the-art courts with professional equipment</p>
            </div>
            <div className="benefit-card animate-slide-up" style={{ animationDelay: '0.6s' }}>
              <div className="benefit-icon tournament-benefit">
                <i className="fas fa-medal"></i>
              </div>
              <h3>Tournament Preparation</h3>
              <p>Get ready for local and national competitions with specialized training</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Testimonials Section */}
      <div className="testimonials-section">
        <div className="testimonials-content">
          <h2 className="section-title animate-fade-in">What Our Players Say</h2>
          <div className="testimonials-slider">
            <div className="testimonial-card animate-fade-in">
              <div className="testimonial-quote">
                <i className="quote-icon fas fa-quote-left"></i>
                "The training program helped me improve my game tremendously. The coaches are supportive and the facilities are excellent."
              </div>
              <div className="testimonial-author">
                <div className="author-avatar"></div>
                <div className="author-info">
                  <h4>Rajiv Perera</h4>
                  <p>National Junior Champion</p>
                </div>
              </div>
            </div>
            <div className="testimonial-card animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="testimonial-quote">
                <i className="quote-icon fas fa-quote-left"></i>
                "I've been training here for two years and my skills have improved dramatically. The structured approach works very well."
              </div>
              <div className="testimonial-author">
                <div className="author-avatar"></div>
                <div className="author-info">
                  <h4>Amaya Gunawardena</h4>
                  <p>District Level Player</p>
                </div>
              </div>
            </div>
            <div className="testimonial-card animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <div className="testimonial-quote">
                <i className="quote-icon fas fa-quote-left"></i>
                "The coaches focus on individual development which helped me address my weaknesses. Highly recommended!"
              </div>
              <div className="testimonial-author">
                <div className="author-avatar"></div>
                <div className="author-info">
                  <h4>Dinesh Fernando</h4>
                  <p>School Team Captain</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default TrainingPrograms;
