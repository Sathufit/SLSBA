import React, { useEffect, useState } from "react";
import { 
  LogOut, Mail, Phone, Calendar, MapPin, User, 
  ArrowLeft, Edit, Check, X
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../styles/Profile.css";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
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
    <div className="profile-container">
      <div className="profile-header">
        <button className="back-button" onClick={() => navigate("/")}>
          <ArrowLeft size={20} />
          <span>Back to Home</span>
        </button>
      </div>
      <div className="profile-card">
        <div className="profile-banner"></div>
        <div className="profile-avatar-container">
          <div className="profile-avatar">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.fullName} className="avatar-image" />
            ) : (
              <User size={64} />
            )}
          </div>
          <button 
            className={`profile-action-button ${isEditing ? "save-button" : "edit-button"}`}
            onClick={isEditing ? handleSave : handleEditToggle}
          >
            {isEditing ? <Check size={16} /> : <Edit size={16} />}
          </button>
          {isEditing && (
            <button className="profile-action-button cancel-button" onClick={handleEditToggle}>
              <X size={16} />
            </button>
          )}
        </div>
        <div className="profile-info">
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
            <h2 className="profile-name">{user.fullName}</h2>
          )}
          
          <div className="profile-location">
            <MapPin size={14} />
            {isEditing ? (
              <input
                type="text"
                name="location"
                value={formData.location || ""}
                onChange={handleChange}
                className="edit-input location-input"
                placeholder="Location"
              />
            ) : (
              <span>{user.location || "Sri Lanka"}</span>
            )}
          </div>
          
          <div className="profile-badges">
            {isEditing ? (
              <input
                type="text"
                name="role"
                value={formData.role || ""}
                onChange={handleChange}
                className="edit-input badge-input primary-badge"
                placeholder="Role"
              />
            ) : (
              <div className="badge primary-badge">{user.role}</div>
            )}
            
            {isEditing ? (
              <input
                type="text"
                name="schoolName"
                value={formData.schoolName || ""}
                onChange={handleChange}
                className="edit-input badge-input secondary-badge"
                placeholder="School Name"
              />
            ) : (
              <div className="badge secondary-badge">{user.schoolName}</div>
            )}
          </div>
        </div>
        
        <div className="profile-section">
          <h3 className="section-title">Contact Information</h3>
          {isEditing ? (
            <div className="profile-details edit-form">
              <div className="form-group">
                <label className="form-label">Email</label>
                <div className="input-with-icon">
                  <Mail size={18} />
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
                <label className="form-label">Phone Number</label>
                <div className="input-with-icon">
                  <Phone size={18} />
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
                <label className="form-label">Date of Birth</label>
                <div className="input-with-icon">
                  <Calendar size={18} />
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
                <label className="form-label">Address</label>
                <div className="input-with-icon">
                  <MapPin size={18} />
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
            <div className="profile-details">
              <div className="profile-detail">
                <Mail size={18} />
                <span>{user.email}</span>
              </div>
              
              <div className="profile-detail">
                <Phone size={18} />
                <span>{user.contactNumber || "Not provided"}</span>
              </div>
              
              <div className="profile-detail">
                <Calendar size={18} />
                <span>{user.dob || "Not provided"}</span>
              </div>
              
              <div className="profile-detail">
                <MapPin size={18} />
                <span>{user.address || "Not provided"}</span>
              </div>
            </div>
          )}
        </div>
        
        <div className="profile-actions">
          <button className="logout-button" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;