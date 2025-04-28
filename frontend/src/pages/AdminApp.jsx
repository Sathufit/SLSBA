import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  BsCalendarCheck, BsPersonBadge, BsGeoAlt, BsClock, 
  BsTrash, BsPencil, BsArrowClockwise, BsExclamationCircle,
  BsBoxArrowInRight, BsPeopleFill, BsPlus, BsCalendar
} from "react-icons/bs";
import AdminSidebar from "../components/AdminSidebar";
import "../styles/AdminApp.css";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

function TrainingProgram() {
  const [programs, setPrograms] = useState([]);
  const [players, setPlayers] = useState([]);
  const [form, setForm] = useState({
    programname: "",
    trainingtype: "",
    time: "",
    location: "",
    description: "",
    capacity: "",
    startDate: "",
    endDate: ""
  });
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("programs");
  const [searchTerm, setSearchTerm] = useState('');
  const [sendingRequest, setSendingRequest] = useState(false);
  const [programName, setProgramName] = useState('');
  const [programList, setProgramList] = useState([]); // For the filter dropdown
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');



  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    await Promise.all([fetchPrograms(), fetchPlayers()]);
    setIsLoading(false);
  };

  const fetchPrograms = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/training`);
      setPrograms(res.data);
      setProgramList(res.data); // ✅ Add this line
    } catch (err) {
      console.error('Error fetching programs:', err);
      showNotification('Failed to load programs', 'error');
    }
  };
  

  const fetchPlayers = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/players`);
      setPlayers(res.data);
    } catch (err) {
      console.error('Error fetching players:', err);
      showNotification('Failed to load players', 'error');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.programname || !form.trainingtype || !form.time || !form.location) {
      showNotification('Please fill in all required fields', 'error');
      return;
    }
    
    try {
      setSendingRequest(true);
      if (editingId) {
        await axios.put(`${BASE_URL}/api/training/${editingId}`, form);
        showNotification('Program updated successfully', 'success');
      } else {
        await axios.post(`${BASE_URL}/api/training`, form);
        showNotification('Program created successfully', 'success');
      }
      resetForm();
      fetchPrograms();
    } catch (err) {
      console.error('Operation failed:', err);
      showNotification('Operation failed. Please try again.', 'error');
    } finally {
      setSendingRequest(false);
    }
  };

  const handleEdit = (program) => {
    setForm({
      programname: program.programname || "",
      trainingtype: program.trainingtype || "",
      time: program.time || "",
      location: program.location || "",
      description: program.description || "",
      capacity: program.capacity || "",
      startDate: program.startDate || "",
      endDate: program.endDate || ""
    });
    setEditingId(program._id);
    
    // Scroll to form
    const formElement = document.querySelector(".program-form-section");
    if (formElement) {
      formElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this program?')) {
      try {
        await axios.delete(`${BASE_URL}/api/training/${id}`);
        setPrograms(prev => prev.filter((p) => p._id !== id));
        showNotification('Program deleted successfully', 'success');
      } catch (err) {
        console.error('Error deleting program:', err);
        showNotification('Failed to delete program', 'error');
      }
    }
  };

  const resetForm = () => {
    setForm({
      programname: "",
      trainingtype: "",
      time: "",
      location: "",
      description: "",
      capacity: "",
      startDate: "",
      endDate: ""
    });
    setEditingId(null);
  };

  const showNotification = (message, type) => {
    // Simple notification implementation
    const notificationDiv = document.createElement('div');
    notificationDiv.className = `notification ${type}`;
    notificationDiv.innerHTML = message;
    document.body.appendChild(notificationDiv);
    
    setTimeout(() => {
      notificationDiv.classList.add('show');
      setTimeout(() => {
        notificationDiv.classList.remove('show');
        setTimeout(() => document.body.removeChild(notificationDiv), 300);
      }, 3000);
    }, 100);
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Filter data based on search term
  const filteredPrograms = programs.filter(program => 
    program.programname?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    program.trainingtype?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    program.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPlayers = players.filter(player =>
    player.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    player.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    player.schoolname?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const handleEditPlayer = (player) => {
    alert(`Edit player: ${player.fullname}`);
    // You can open a modal to edit player details here if you want later
  };
  
  const handleDeletePlayer = async (playerId) => {
    if (window.confirm("Are you sure you want to delete this player?")) {
      try {
        await axios.delete(`${BASE_URL}/api/players/${playerId}`);
        fetchPlayers(); // ✅ Refresh player list after deleting
        showNotification('Player deleted successfully', 'success');
      } catch (err) {
        console.error("Error deleting player:", err);
        showNotification('Failed to delete player', 'error');
      }
    }
  };
  const handleGenerateTrainingReport = async () => {
    setIsLoading(true);
  
    try {
      // Validate date range if both dates are provided
      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (start > end) {
          showToast("❌ Start date cannot be after end date", "error");
          setIsLoading(false);
          return;
        }
      }
  
      const filterData = {
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
        ...(location && { location }),
        ...(programName && { programName }),
      };
  
      showNotification("Generating report...", "info");
  
      const response = await axios.post(
        `${BASE_URL}/api/training/report/pdf`,
        filterData,
        {
          responseType: "blob",
          timeout: 30000,
          headers: { Accept: "application/pdf" },
        }
      );
  
      if (!response.data || response.data.size === 0) {
        throw new Error("Generated PDF is empty");
      }
  
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const filename = `Training_Programs_Report_${new Date().toISOString().split("T")[0]}.pdf`;
  
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
  
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
  
      showToast("✅ Report generated successfully!", "success");
    } catch (error) {
      console.error("❌ Error generating report:", error);
  
      let errorMessage = "❌ Failed to generate report.";
      if (error.response) {
        switch (error.response.status) {
          case 404:
            errorMessage = "❌ No training programs found matching the filters.";
            break;
          case 400:
            errorMessage = "❌ Invalid filter parameters.";
            break;
          case 500:
            errorMessage = "❌ Server error while generating report.";
            break;
        }
      } else if (error.code === "ECONNABORTED") {
        errorMessage = "❌ Request timed out. Please try again.";
      }
  
      showToast(errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  };
  

  // Calculate stats
  const activePlayers = players.length;
  const activePrograms = programs.length;
  
  // Get players by program type (for stats)
  const playersByProgram = programs.reduce((acc, program) => {
    const count = players.filter(player => 
      player.program === program._id || player.programname === program.programname
    ).length;
    return { ...acc, [program.programname]: count };
  }, {});

  return (
    <AdminSidebar>
      <div className="training-dashboard">
        {/* Header */}
        <div className="dashboard-header">
          <div className="header-content">
            <h1>Training Program Management</h1>
            <p>Create and manage training programs and player enrollments</p>
          </div>
          <div className="header-actions">
            <div className="search-container">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <button 
              className="refresh-button" 
              onClick={fetchData}
              disabled={isLoading}
            >
              <BsArrowClockwise className={isLoading ? "spinner" : ""} />
              <span>{isLoading ? "Loading..." : "Refresh"}</span>
            </button>
          </div>
        </div>
        <div className="filter-form">
  {/* Program Name Dropdown */}
  <div className="filter-group">
    <label htmlFor="programName">Program Name</label>
    <select
      id="programName"
      value={programName}
      onChange={(e) => setProgramName(e.target.value)}
    >
      <option value="">All Programs</option>
      {programList.map((program) => (
        <option key={program._id} value={program.programname}>
          {program.programname}
        </option>
      ))}
    </select>
  </div>

  {/* Location Dropdown */}
  <div className="filter-group">
    <label htmlFor="location">Location</label>
    <select
      id="location"
      value={location}
      onChange={(e) => setLocation(e.target.value)}
    >
      <option value="">All Locations</option>
      {[...new Set(programList.map((p) => p.location))].map((loc, index) => (
        <option key={index} value={loc}>
          {loc}
        </option>
      ))}
    </select>
  </div>

  {/* Start Date Picker */}
  <div className="filter-group">
    <label htmlFor="startDate">Start Date</label>
    <input
      id="startDate"
      type="date"
      value={startDate}
      onChange={(e) => setStartDate(e.target.value)}
    />
  </div>

  {/* End Date Picker */}
  <div className="filter-group">
    <label htmlFor="endDate">End Date</label>
    <input
      id="endDate"
      type="date"
      value={endDate}
      onChange={(e) => setEndDate(e.target.value)}
    />
  </div>

  {/* Generate Report Button */}
  <div className="filter-group">
    <button className="generate-btn" onClick={handleGenerateTrainingReport}>
      Generate Report
    </button>
  </div>
</div>


        {/* Stats Cards */}
        <div className="stats-container">
          <div className="stat-card">
            <div className="stat-icon programs">
              <BsCalendarCheck />
            </div>
            <div className="stat-details">
              <span className="stat-value">{activePrograms}</span>
              <span className="stat-label">Active Programs</span>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon players">
              <BsPeopleFill />
            </div>
            <div className="stat-details">
              <span className="stat-value">{activePlayers}</span>
              <span className="stat-label">Enrolled Players</span>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon location">
              <BsGeoAlt />
            </div>
            <div className="stat-details">
              <span className="stat-value">
                {new Set(programs.map(p => p.location).filter(Boolean)).size}
              </span>
              <span className="stat-label">Training Locations</span>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon calendar">
              <BsCalendar />
            </div>
            <div className="stat-details">
              <span className="stat-value">{new Date().toLocaleString('default', { month: 'long' })}</span>
              <span className="stat-label">Current Month</span>
            </div>
          </div>
        </div>
        
        {/* Program Form Section */}
        <div className="program-form-section panel-card">
          <div className="panel-header">
            <h2>{editingId ? <><BsPencil /> Edit Program</> : <><BsPlus /> Create New Program</>}</h2>
          </div>
          <form onSubmit={handleSubmit} className="program-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="programname">Program Name *</label>
                <input
                  type="text"
                  id="programname"
                  name="programname"
                  value={form.programname}
                  onChange={handleInputChange}
                  placeholder="Enter program name"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="trainingtype">Training Type *</label>
                <input
                  type="text"
                  id="trainingtype"
                  name="trainingtype"
                  value={form.trainingtype}
                  onChange={handleInputChange}
                  placeholder="Enter training type"
                  required
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="time">Schedule Time *</label>
                <input
                  type="text"
                  id="time"
                  name="time"
                  value={form.time}
                  onChange={handleInputChange}
                  placeholder="E.g. Mon, Wed 4:00-5:30 PM"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="location">Location *</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={form.location}
                  onChange={handleInputChange}
                  placeholder="Enter training location"
                  required
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="capacity">Capacity</label>
                <input
                  type="number"
                  id="capacity"
                  name="capacity"
                  value={form.capacity}
                  onChange={handleInputChange}
                  placeholder="Maximum participants"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="startDate">Start Date</label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={form.startDate}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="endDate">End Date</label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={form.endDate}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group full-width">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleInputChange}
                  placeholder="Enter program description"
                  rows="3"
                ></textarea>
              </div>
            </div>
            
            <div className="form-actions">
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={sendingRequest}
              >
                {sendingRequest ? (
                  <><div className="btn-spinner"></div> Saving...</>
                ) : (
                  editingId ? "Update Program" : "Create Program"
                )}
              </button>
              
              {editingId && (
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={resetForm}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
        
        {/* Tabs */}
        <div className="tabs-container">
          <button
            className={`tab-button ${activeTab === 'programs' ? 'active' : ''}`}
            onClick={() => setActiveTab('programs')}
          >
            <BsCalendarCheck /> Training Programs
          </button>
          <button
            className={`tab-button ${activeTab === 'players' ? 'active' : ''}`}
            onClick={() => setActiveTab('players')}
          >
            <BsPersonBadge /> Player Enrollments
          </button>
        </div>

        {/* Programs Tab */}
        {activeTab === 'programs' && (
          <div className="panel-card">
            <div className="panel-header">
              <h2><BsCalendarCheck /> Training Programs</h2>
              <div className="counter">{filteredPrograms.length} programs</div>
            </div>
            
            {isLoading ? (
              <div className="loading-state">
                <div className="loader"></div>
                <p>Loading programs...</p>
              </div>
            ) : filteredPrograms.length === 0 ? (
              <div className="empty-state">
                <BsExclamationCircle className="empty-icon" />
                <p>No training programs found</p>
                {searchTerm && (
                  <p className="empty-subtext">Try adjusting your search criteria</p>
                )}
              </div>
            ) : (
              <div className="programs-grid">
                {filteredPrograms.map((program) => (
                  <div key={program._id} className="program-card">
                    <div className="program-badge">{program.trainingtype}</div>
                    <h3 className="program-title">{program.programname}</h3>
                    
                    <div className="program-details">
                      <div className="detail-item">
                        <BsClock className="detail-icon" />
                        <span>{program.time || "Schedule not set"}</span>
                      </div>
                      <div className="detail-item">
                        <BsGeoAlt className="detail-icon" />
                        <span>{program.location || "Location not set"}</span>
                      </div>
                      {program.capacity && (
                        <div className="detail-item">
                          <BsPeopleFill className="detail-icon" />
                          <span>Capacity: {program.capacity}</span>
                        </div>
                      )}
                      {program.startDate && program.endDate && (
                        <div className="detail-item">
                          <BsCalendar className="detail-icon" />
                          <span>{formatDate(program.startDate)} - {formatDate(program.endDate)}</span>
                        </div>
                      )}
                    </div>
                    
                    {program.description && (
                      <p className="program-description">{program.description}</p>
                    )}
                    
                    <div className="enrollment-info">
                      <span className="enrollment-count">
                        <strong>{playersByProgram[program.programname] || 0}</strong> players enrolled
                      </span>
                    </div>
                    
                    <div className="card-actions">
                      <button 
                        onClick={() => handleEdit(program)} 
                        className="btn btn-edit"
                        title="Edit program"
                      >
                        <BsPencil /> Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(program._id)}
                        className="btn btn-delete"
                        title="Delete program"
                      >
                        <BsTrash /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Players Tab */}
        {activeTab === 'players' && (
          <div className="panel-card">
            <div className="panel-header">
              <h2><BsPersonBadge /> Player Enrollments</h2>
              <div className="counter">{filteredPlayers.length} players</div>
            </div>

            {isLoading ? (
              <div className="loading-state">
                <div className="loader"></div>
                <p>Loading player enrollments...</p>
              </div>
            ) : filteredPlayers.length === 0 ? (
              <div className="empty-state">
                <BsPersonBadge className="empty-icon" />
                <p>No player enrollments found</p>
                {searchTerm && (
                  <p className="empty-subtext">Try adjusting your search criteria</p>
                )}
              </div>
            ) : (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Player Name</th>
                      <th>School</th>
                      <th>Contact</th>
                      <th>Email</th>
                      <th>Guardian</th>
                      <th>Program</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPlayers.map((player) => (
                      <tr key={player._id}>
                        <td className="player-cell">
                          <div className="player-avatar">{player.fullname?.[0] || "?"}</div>
                          <div className="player-info">
                            <span className="player-name">{player.fullname || "Unknown"}</span>
                            <span className="player-meta">
                              {player.gender && `${player.gender}`}
                              {player.dateofbirth && ` • ${formatDate(player.dateofbirth)}`}
                            </span>
                          </div>
                        </td>
                        <td className="school-cell">
                          {player.schoolname || <em className="no-data">Not specified</em>}
                        </td>
                        <td>
                          {player.contactnumber || <em className="no-data">No contact</em>}
                        </td>
                        <td className="email-cell">
                          {player.email ? (
                            <a href={`mailto:${player.email}`} className="email-link">
                              {player.email}
                            </a>
                          ) : (
                            <em className="no-data">No email</em>
                          )}
                        </td>
                        <td>
                          {player.guardianname ? (
                            <div className="guardian-info">
                              <div>{player.guardianname}</div>
                              <div className="guardian-contact">
                                {player.guardiancontact || <em className="no-data">No contact</em>}
                              </div>
                            </div>
                          ) : (
                            <em className="no-data">No guardian info</em>
                          )}
                        </td>
                        <td>
                          {player.programname || <em className="no-data">Not enrolled</em>}
                        </td>
                        <td className="action-cell">
                          <button 
                            className="btn btn-edit" 
                            title="Edit Player"
                            onClick={() => handleEditPlayer(player)}
                          >
                            <BsPencil /> Edit
                          </button>
                          <button 
                            className="btn btn-delete"
                            title="Delete Player"
                            onClick={() => handleDeletePlayer(player._id)}
                          >
                            <BsTrash /> Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminSidebar>
  );
}

export default TrainingProgram;