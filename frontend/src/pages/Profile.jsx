import React, { useEffect, useState } from "react";
import { 
  ArrowLeft, Edit, Check, X, User, Mail, Phone, Calendar, MapPin, 
  Trophy, GamepadIcon, CheckCircle, BarChart2, LogOut
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../styles/Profile.css"; 

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Profile = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [activeTab, setActiveTab] = useState("about");
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser) {
      navigate("/login");
    } else {
      setUser(storedUser);
      setFormData(storedUser);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // If canceling edit, reset form data to current user data
      setFormData(user);
    }
    setIsEditing(!isEditing);
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
  
      const res = await fetch(`${BASE_URL}/api/users/${user._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
  
      if (!res.ok) throw new Error("Failed to update user");
  
      const updatedUser = await res.json();
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  if (!user) return null;

  return (
    <div className="profile-container">
      {/* Header */}
      <div className="profile-header">
        <h1 className="profile-title">Profile</h1>
        <button className="back-button" onClick={() => navigate("/")}>
          <ArrowLeft size={18} />
          <span>Back</span>
        </button>
      </div>
      
      {/* Hero Section with Gradient Background */}
      <div className="hero-background">
        <div className="profile-card">
          {/* Profile Avatar */}
          <div className="avatar-container">
            <div className="avatar">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.fullName} />
              ) : (
                <User size={40} />
              )}
              <div className="verified-badge">
                <CheckCircle size={16} className="verified-icon" />
              </div>
            </div>
          </div>
          
          {/* Profile Identity */}
          <h2 className="user-name">{user.fullName}</h2>
          
          {/* Profile Meta */}
          <div className="user-meta">
            <div className="meta-item">
              <Trophy size={16} />
              <span>{user.role || "Professional Player"}</span>
            </div>
            <div className="meta-item">
              <User size={16} />
              <span>{user.schoolName || "Not specified"}</span>
            </div>
            <div className="meta-item">
              <MapPin size={16} />
              <span>{user.location || "Not specified"}</span>
            </div>
          </div>
          
          {/* Profile Actions */}
          <div className="profile-actions">
            {isEditing ? (
              <>
                <button className="save-button" onClick={handleSave}>
                  <Check size={16} />
                  <span>Save</span>
                </button>
                <button className="cancel-button" onClick={handleEditToggle}>
                  <X size={16} />
                  <span>Cancel</span>
                </button>
              </>
            ) : (
              <button className="edit-profile-btn" onClick={handleEditToggle}>
                <Edit size={16} />
                <span>Edit Profile</span>
              </button>
            )}
          </div>
          
          {/* Statistics Cards */}
          <div className="stats-container">
            <div className="stat-card ranking">
              <div className="stat-header">
                <Trophy size={20} />
                <h3>Ranking</h3>
              </div>
              <div className="stat-value">#12</div>
              <div className="stat-label">National Ranking</div>
            </div>
            
            <div className="stat-card games">
              <div className="stat-header">
                <GamepadIcon size={20} />
                <h3>Games</h3>
              </div>
              <div className="stat-value">128</div>
              <div className="stat-label">Total Matches</div>
            </div>
            
            <div className="stat-card wins">
              <div className="stat-header">
                <CheckCircle size={20} />
                <h3>Wins</h3>
              </div>
              <div className="stat-value">89</div>
              <div className="stat-label">Victories</div>
            </div>
            
            <div className="stat-card win-rate">
              <div className="stat-header">
                <BarChart2 size={20} />
                <h3>Win Rate</h3>
              </div>
              <div className="stat-value">69.5%</div>
              <div className="stat-label">Success Rate</div>
            </div>
          </div>
          
          {/* Navigation Tabs */}
          <div className="profile-tabs">
            <button 
              className={`tab-button ${activeTab === "about" ? "active" : ""}`}
              onClick={() => setActiveTab("about")}
            >
              About
            </button>
          </div>
          
          {/* Tab Content */}
          <div className="tab-content">
            {activeTab === "about" && (
              <div className="about-section">
                <h3 className="section-title">Contact Information</h3>
                
                {isEditing ? (
                  <div className="edit-form">
                    <div className="form-group">
                      <label>Email</label>
                      <div className="input-with-icon">
                        <Mail size={16} />
                        <input
                          type="email"
                          name="email"
                          value={formData.email || ""}
                          onChange={handleChange}
                          className="edit-input"
                          placeholder="Email"
                        />
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <label>Phone Number</label>
                      <div className="input-with-icon">
                        <Phone size={16} />
                        <input
                          type="text"
                          name="contactNumber"
                          value={formData.contactNumber || ""}
                          onChange={handleChange}
                          className="edit-input"
                          placeholder="Contact Number"
                        />
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <label>Date of Birth</label>
                      <div className="input-with-icon">
                        <Calendar size={16} />
                        <input
                          type="date"
                          name="dob"
                          value={formData.dob || ""}
                          onChange={handleChange}
                          className="edit-input"
                        />
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <label>Address</label>
                      <div className="input-with-icon">
                        <MapPin size={16} />
                        <input
                          type="text"
                          name="address"
                          value={formData.address || ""}
                          onChange={handleChange}
                          className="edit-input"
                          placeholder="Address"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="contact-details">
                    <div className="contact-item">
                      <div className="icon-container">
                        <Mail size={16} />
                      </div>
                      <div className="contact-info">
                        <div className="contact-label">Email</div>
                        <div className="contact-value">{user.email}</div>
                      </div>
                    </div>
                    
                    <div className="contact-item">
                      <div className="icon-container">
                        <Phone size={16} />
                      </div>
                      <div className="contact-info">
                        <div className="contact-label">Phone</div>
                        <div className="contact-value">{user.contactNumber || "Not provided"}</div>
                      </div>
                    </div>
                    
                    <div className="contact-item">
                      <div className="icon-container">
                        <Calendar size={16} />
                      </div>
                      <div className="contact-info">
                        <div className="contact-label">Birthday</div>
                        <div className="contact-value">{user.dob || "Not provided"}</div>
                      </div>
                    </div>
                    
                    <div className="contact-item">
                      <div className="icon-container">
                        <MapPin size={16} />
                      </div>
                      <div className="contact-info">
                        <div className="contact-label">Address</div>
                        <div className="contact-value">{user.address || "Not provided"}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;