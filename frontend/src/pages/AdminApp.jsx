import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminSidebar from "../components/AdminSidebar";
import "../styles/AdminApp.css";

const AdminApp = () => {
  const [programs, setPrograms] = useState([]);
  const [players, setPlayers] = useState([]);
  const [form, setForm] = useState({
    programname: "",
    trainingtype: "",
    time: "",
    location: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("programs");
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([fetchPrograms(), fetchPlayers()]);
    } catch (error) {
      showNotification("Failed to load data", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPrograms = async () => {
    try {
      const res = await axios.get("http://localhost:5001/api/training");
      setPrograms(res.data);
      return res.data;
    } catch (err) {
      console.error("Error fetching programs:", err);
      throw err;
    }
  };

  const fetchPlayers = async () => {
    try {
      const res = await axios.get("http://localhost:5001/api/players");
      setPlayers(res.data);
      return res.data;
    } catch (err) {
      console.error("Error fetching players:", err);
      throw err;
    }
  };

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "" });
    }, 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingId) {
        await axios.put(`http://localhost:5001/api/training/${editingId}`, form);
        showNotification("Program updated successfully");
      } else {
        await axios.post("http://localhost:5001/api/training", form);
        showNotification("Program created successfully");
      }
      resetForm();
      await fetchPrograms();
    } catch (err) {
      console.error("Operation failed:", err);
      showNotification("Operation failed. Please try again.", "error");
    }
  };

  const handleEdit = (program) => {
    setForm({
      programname: program.programname,
      trainingtype: program.trainingtype,
      time: program.time,
      location: program.location,
    });
    setEditingId(program._id);
    // Scroll to form
    document.querySelector(".training-program-section").scrollIntoView({ behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    try {
      if (window.confirm("Are you sure you want to delete this program?")) {
        await axios.delete(`http://localhost:5001/api/training/${id}`);
        showNotification("Program deleted successfully");
        await fetchPrograms();
      }
    } catch (err) {
      console.error("Failed to delete program:", err);
      showNotification("Failed to delete program", "error");
    }
  };

  const resetForm = () => {
    setForm({ programname: "", trainingtype: "", time: "", location: "" });
    setEditingId(null);
  };

  // Function to format date strings
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <AdminSidebar>
      <div className="content-wrapper">
        {notification.show && (
          <div className={`notification ${notification.type}`}>
            {notification.message}
          </div>
        )}
        
        <div className="admin-header">
          <h1>SLSBA Admin Dashboard</h1>
          <div className="admin-actions">
            <div className="search-container">
              <input type="text" placeholder="Search..." className="search-input" />
              <button className="search-button">
                <i className="search-icon"></i>
              </button>
            </div>
            <div className="admin-profile">
              <span>Admin</span>
              <div className="profile-avatar">A</div>
            </div>
          </div>
        </div>

        <div className="admin-stats">
          <div className="stat-card">
            <div className="stat-icon programs-icon"></div>
            <div className="stat-content">
              <h3>{programs.length}</h3>
              <p>Active Programs</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon players-icon"></div>
            <div className="stat-content">
              <h3>{players.length}</h3>
              <p>Enrolled Players</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon calendar-icon"></div>
            <div className="stat-content">
              <h3>{new Date().toLocaleDateString('en-US', { month: 'long' })}</h3>
              <p>Current Month</p>
            </div>
          </div>
        </div>

        <section className="training-program-section card-container">
          <h2 className="section-title">
            {editingId ? "Edit Training Program" : "Create New Training Program"}
          </h2>
          <form onSubmit={handleSubmit} className="training-form">
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="programname">Program Name</label>
                <input
                  id="programname"
                  name="programname"
                  placeholder="Enter program name"
                  value={form.programname}
                  onChange={(e) =>
                    setForm({ ...form, programname: e.target.value })
                  }
                  required
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor="trainingtype">Training Type</label>
                <input
                  id="trainingtype"
                  name="trainingtype"
                  placeholder="Enter training type"
                  value={form.trainingtype}
                  onChange={(e) =>
                    setForm({ ...form, trainingtype: e.target.value })
                  }
                  required
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor="time">Time</label>
                <input
                  id="time"
                  name="time"
                  placeholder="Enter schedule time"
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                  required
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor="location">Location</label>
                <input
                  id="location"
                  name="location"
                  placeholder="Enter location"
                  value={form.location}
                  onChange={(e) =>
                    setForm({ ...form, location: e.target.value })
                  }
                  required
                  className="form-input"
                />
              </div>
            </div>
            <div className="form-buttons">
              <button type="submit" className="submit-button">
                {editingId ? "Update Program" : "Add Program"}
              </button>
              {editingId && (
                <button type="button" className="cancel-button" onClick={resetForm}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        <div className="tabs-container">
          <div 
            className={`tab ${activeTab === 'programs' ? 'active' : ''}`}
            onClick={() => setActiveTab('programs')}
          >
            Training Programs
          </div>
          <div 
            className={`tab ${activeTab === 'players' ? 'active' : ''}`}
            onClick={() => setActiveTab('players')}
          >
            Player Enrollments
          </div>
        </div>

        {activeTab === 'programs' && (
          <section className="existing-programs card-container">
            <h2 className="section-title">Existing Programs</h2>
            {isLoading ? (
              <div className="loading-container">
                <div className="loader"></div>
                <p>Loading programs...</p>
              </div>
            ) : programs.length === 0 ? (
              <div className="no-data">
                <p>No training programs available.</p>
                <p>Create your first program using the form above.</p>
              </div>
            ) : (
              <div className="card-grid">
                {programs.map((p) => (
                  <div key={p._id} className="card program-card">
                    <div className="card-badge">{p.trainingtype}</div>
                    <h3>{p.programname}</h3>
                    <div className="card-details">
                      <div className="detail-item">
                        <span className="detail-icon time-icon"></span>
                        <span className="detail-text">{p.time}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-icon location-icon"></span>
                        <span className="detail-text">{p.location}</span>
                      </div>
                    </div>
                    <div className="card-actions">
                      <button className="edit-btn" onClick={() => handleEdit(p)}>
                        Edit
                      </button>
                      <button className="delete-btn" onClick={() => handleDelete(p._id)}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === 'players' && (
          <section className="player-enrollments card-container">
            <h2 className="section-title">Player Enrollments</h2>
            {isLoading ? (
              <div className="loading-container">
                <div className="loader"></div>
                <p>Loading enrollments...</p>
              </div>
            ) : players.length === 0 ? (
              <div className="no-data">
                <p>No players enrolled yet.</p>
                <p>Players will appear here once they enroll in a program.</p>
              </div>
            ) : (
              <div className="players-list">
                <div className="player-table-header">
                  <div className="header-cell">Player Name</div>
                  <div className="header-cell">School</div>
                  <div className="header-cell">Contact</div>
                  <div className="header-cell">Email</div>
                  <div className="header-cell">Guardian</div>
                  <div className="header-cell">Actions</div>
                </div>
                
                {players.map((player, index) => (
                  <div key={index} className="player-row">
                    <div className="player-cell name-cell">
                      <div className="player-avatar">{player.fullname.charAt(0)}</div>
                      <div>
                        <div className="player-name">{player.fullname}</div>
                        <div className="player-detail">
                          {player.gender && `${player.gender.charAt(0).toUpperCase() + player.gender.slice(1)}`}
                          {player.dateofbirth && ` • ${formatDate(player.dateofbirth)}`}
                        </div>
                      </div>
                    </div>
                    <div className="player-cell">{player.schoolname || "-"}</div>
                    <div className="player-cell">{player.contactnumber || "-"}</div>
                    <div className="player-cell">{player.email || "-"}</div>
                    <div className="player-cell">
                      {player.guardianname ? (
                        <div>
                          <div>{player.guardianname}</div>
                          <div className="player-detail">{player.guardiancontact || "-"}</div>
                        </div>
                      ) : "-"}
                    </div>
                    <div className="player-cell actions-cell">
                      <button className="view-btn">View Details</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </AdminSidebar>
  );
};

export default AdminApp;