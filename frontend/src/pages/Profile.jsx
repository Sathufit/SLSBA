import React, { useEffect, useState } from "react";
import { 
  LogOut, Mail, Phone, Calendar, MapPin, User, 
  ArrowLeft, Edit, Check, X, Camera, Briefcase, School, Heart, Link
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import '../styles/Profile.css';

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

  const handleSave = () => {
    // Save updated user info to localStorage
    localStorage.setItem("user", JSON.stringify(formData));
    setUser(formData);
    setIsEditing(false);
  };

  if (!user) return null;

  return (
    <div className="profile-page">
      <div className="profile-header">
        <button className="back-button" onClick={() => navigate("/")}>
          <ArrowLeft size={18} />
          <span>Back</span>
        </button>
        <h1>Profile</h1>
        <button className="logout-button" onClick={handleLogout}>
          <LogOut size={18} />
        </button>
      </div>
      
      <div className="profile-hero">
        <div className="profile-cover">
          <div className="profile-avatar">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.fullName} />
            ) : (
              <User size={40} />
            )}
            {isEditing && (
              <button className="change-avatar-btn">
                <Camera size={16} />
              </button>
            )}
          </div>
        </div>
        
        <div className="profile-actions">
          {isEditing ? (
            <>
              <button className="action-button save-button" onClick={handleSave}>
                <Check size={16} />
                <span>Save</span>
              </button>
              <button className="action-button cancel-button" onClick={handleEditToggle}>
                <X size={16} />
                <span>Cancel</span>
              </button>
            </>
          ) : (
            <button className="action-button edit-button" onClick={handleEditToggle}>
              <Edit size={16} />
              <span>Edit Profile</span>
            </button>
          )}
        </div>
        
        <div className="profile-identity">
          {isEditing ? (
            <input
              type="text"
              name="fullName"
              value={formData.fullName || ""}
              onChange={handleChange}
              className="edit-input name-input"
              placeholder="Full Name"
            />
          ) : (
            <h2>{user.fullName}</h2>
          )}
          
          <div className="profile-meta">
            <div className="meta-item">
              <Briefcase size={14} />
              {isEditing ? (
                <input
                  type="text"
                  name="role"
                  value={formData.role || ""}
                  onChange={handleChange}
                  className="edit-input small-input"
                  placeholder="Role"
                />
              ) : (
                <span>{user.role || "No role specified"}</span>
              )}
            </div>
            
            <div className="meta-item">
              <School size={14} />
              {isEditing ? (
                <input
                  type="text"
                  name="schoolName"
                  value={formData.schoolName || ""}
                  onChange={handleChange}
                  className="edit-input small-input"
                  placeholder="School Name"
                />
              ) : (
                <span>{user.schoolName || "No school specified"}</span>
              )}
            </div>
            
            <div className="meta-item">
              <MapPin size={14} />
              {isEditing ? (
                <input
                  type="text"
                  name="location"
                  value={formData.location || ""}
                  onChange={handleChange}
                  className="edit-input small-input"
                  placeholder="Location"
                />
              ) : (
                <span>{user.location || "Sri Lanka"}</span>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="profile-navigation">
        <button 
          className={`nav-button ${activeTab === "about" ? "active" : ""}`}
          onClick={() => setActiveTab("about")}
        >
          About
        </button>
        <button 
          className={`nav-button ${activeTab === "social" ? "active" : ""}`}
          onClick={() => setActiveTab("social")}
        >
          Social
        </button>
        <button 
          className={`nav-button ${activeTab === "interests" ? "active" : ""}`}
          onClick={() => setActiveTab("interests")}
        >
          Interests
        </button>
      </div>
      
      <div className="profile-content">
        {activeTab === "about" && (
          <div className="profile-about">
            <div className="profile-section">
              <h3>Contact Information</h3>
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
                  <div className="detail-item">
                    <div className="detail-icon">
                      <Mail size={16} />
                    </div>
                    <div className="detail-content">
                      <span className="detail-label">Email</span>
                      <span className="detail-value">{user.email}</span>
                    </div>
                  </div>
                  
                  <div className="detail-item">
                    <div className="detail-icon">
                      <Phone size={16} />
                    </div>
                    <div className="detail-content">
                      <span className="detail-label">Phone</span>
                      <span className="detail-value">{user.contactNumber || "Not provided"}</span>
                    </div>
                  </div>
                  
                  <div className="detail-item">
                    <div className="detail-icon">
                      <Calendar size={16} />
                    </div>
                    <div className="detail-content">
                      <span className="detail-label">Birthday</span>
                      <span className="detail-value">{user.dob || "Not provided"}</span>
                    </div>
                  </div>
                  
                  <div className="detail-item">
                    <div className="detail-icon">
                      <MapPin size={16} />
                    </div>
                    <div className="detail-content">
                      <span className="detail-label">Address</span>
                      <span className="detail-value">{user.address || "Not provided"}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {activeTab === "social" && (
          <div className="profile-social">
            <div className="profile-section">
              <h3>Social Links</h3>
              {isEditing ? (
                <div className="edit-form">
                  <div className="form-group">
                    <label>LinkedIn</label>
                    <div className="input-with-icon">
                      <Link size={16} />
                      <input
                        type="text"
                        name="linkedin"
                        value={formData.linkedin || ""}
                        onChange={handleChange}
                        className="edit-input"
                        placeholder="LinkedIn URL"
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>Twitter</label>
                    <div className="input-with-icon">
                      <Link size={16} />
                      <input
                        type="text"
                        name="twitter"
                        value={formData.twitter || ""}
                        onChange={handleChange}
                        className="edit-input"
                        placeholder="Twitter URL"
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>Website</label>
                    <div className="input-with-icon">
                      <Link size={16} />
                      <input
                        type="text"
                        name="website"
                        value={formData.website || ""}
                        onChange={handleChange}
                        className="edit-input"
                        placeholder="Website URL"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="social-links">
                  <div className="detail-item">
                    <div className="detail-icon">
                      <Link size={16} />
                    </div>
                    <div className="detail-content">
                      <span className="detail-label">LinkedIn</span>
                      <span className="detail-value">
                        {user.linkedin ? (
                          <a href={user.linkedin} target="_blank" rel="noopener noreferrer">{user.linkedin}</a>
                        ) : (
                          "Not provided"
                        )}
                      </span>
                    </div>
                  </div>
                  
                  <div className="detail-item">
                    <div className="detail-icon">
                      <Link size={16} />
                    </div>
                    <div className="detail-content">
                      <span className="detail-label">Twitter</span>
                      <span className="detail-value">
                        {user.twitter ? (
                          <a href={user.twitter} target="_blank" rel="noopener noreferrer">{user.twitter}</a>
                        ) : (
                          "Not provided"
                        )}
                      </span>
                    </div>
                  </div>
                  
                  <div className="detail-item">
                    <div className="detail-icon">
                      <Link size={16} />
                    </div>
                    <div className="detail-content">
                      <span className="detail-label">Website</span>
                      <span className="detail-value">
                        {user.website ? (
                          <a href={user.website} target="_blank" rel="noopener noreferrer">{user.website}</a>
                        ) : (
                          "Not provided"
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {activeTab === "interests" && (
          <div className="profile-interests">
            <div className="profile-section">
              <h3>Interests</h3>
              {isEditing ? (
                <div className="edit-form">
                  <div className="form-group">
                    <label>Your Interests (comma separated)</label>
                    <textarea
                      name="interests"
                      value={formData.interests || ""}
                      onChange={handleChange}
                      className="edit-input"
                      placeholder="Design, Photography, Travel, etc."
                    ></textarea>
                  </div>
                </div>
              ) : (
                <div className="interests-container">
                  {user.interests ? 
                    user.interests.split(',').map((interest, index) => (
                      <div key={index} className="interest-tag">
                        <Heart size={12} />
                        <span>{interest.trim()}</span>
                      </div>
                    ))
                    : 
                    <p>No interests added yet.</p>
                  }
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;