import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import "../styles/AdminTournament.css";
import TournamentBracket from "./TournamentBracket";

// Import icons from Lucide
import { 
  Home, Trophy, FileText, BookOpen, DollarSign, 
  Users, HelpCircle, Bell, Search, Menu, Filter,
  Download, Plus, RefreshCw, ChevronDown, 
  Edit, Trash2, Save, X, CreditCard, DollarSign as PaymentIcon,
  ExternalLink, Check, AlertCircle, CheckCircle
} from "lucide-react";

const AdminTournaments = () => {
  const navigate = useNavigate();
  
  // State for UI controls
  const [activeTab, setActiveTab] = useState("Tournaments");
  const [notifications, setNotifications] = useState(3);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [expandedRow, setExpandedRow] = useState(null);
  const [showBracket, setShowBracket] = useState(null);
  
  // State for data
  const [tournaments, setTournaments] = useState([]);
  const [tournamentList, setTournamentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // State for tournament registration editing
  const [editingTournament, setEditingTournament] = useState(null);
  const [editedData, setEditedData] = useState({
    fullName: "",
    email: "",
    schoolName: "",
    schoolID: "",
    tournament: "",
    players: [],
    paymentMethod: "Credit Card",
    paymentStatus: "Pending"
  });
  
  const [editingRegistration, setEditingRegistration] = useState(null); // Registration editing
  const handleEditRegistrationClick = (registration) => {
    setEditingRegistration(registration);
    setEditedData({
      fullName: registration.fullName,
      email : registration.email,
      schoolName: registration.schoolName,
      tournament: registration.tournament?._id || "",
      players: registration.players || [],
      paymentMethod: registration.paymentMethod || "Credit Card",
      paymentStatus: registration.paymentStatus || "Pending"
    });
  };
  const handleSaveRegistrationEdit = async () => {
    if (!editingRegistration || !editingRegistration._id) {
      alert("❌ Error: No registration selected for editing");
      return;
    }
  
    try {
      const response = await axios.put(
        `http://localhost:5001/api/tournament-registrations/${editingRegistration._id}`, 
        editedData
      );
  
      if (response.status === 200) {
        showToast("✅ Registration updated successfully!");
        setEditingRegistration(null);
        fetchRegistrations(); // ✅ Refresh registration list
      } else {
        console.error("⚠️ Unexpected response:", response);
        alert("❌ Failed to update registration. Try again.");
      }
    } catch (error) {
      console.error("❌ Edit Error:", error.response?.data || error.message);
      alert("❌ Error updating registration");
    }
  };
  
  // State for creating new tournaments
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTournament, setNewTournament] = useState({
    tournamentName: "",
    category: "Under 17",
    date: "",
    venue: "",
    maxParticipants: 16,
    paymentMethod: "Bank Transfer",
  });
  
  // Toast notification state
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  
  // State for view switching
  const [activeView, setActiveView] = useState("tournaments");
  const [registrations, setRegistrations] = useState([]);
  

  const fetchTournaments = async () => {
    try {
      console.log("📌 Fetching tournaments...");
      setIsLoading(true);
      const res = await axios.get("http://localhost:5001/api/tournaments/all");
      console.log("✅ API Response:", res.status, res.data); // Debugging
      setTournaments(res.data);
      setIsLoading(false);
    } catch (error) {
      console.error("❌ Error fetching tournaments:", error.response?.data || error.message);
      setError("Failed to load tournaments.");
      setIsLoading(false);
    }
  };
  
  const fetchRegistrations = async () => {
    try {
      console.log("📌 Fetching tournament registrations...");
      setIsLoading(true);
      const res = await axios.get("http://localhost:5001/api/tournament-registrations/all");
      console.log("✅ API Response:", res.status, res.data);
      setRegistrations(res.data);
    } catch (error) {
      console.error("❌ Error fetching registrations:", error.response?.data || error.message);
      setError("Failed to load registrations.");
    } finally {
      setIsLoading(false);  // ✅ Ensures the page does not get stuck
    }
  };
  
  
  const filteredRegistrations = registrations.filter(reg => {
    const matchesSearch = 
      (reg.fullName && reg.fullName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (reg.email && reg.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (reg.schoolName && reg.schoolName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (reg.tournament && reg.tournament.tournamentName.toLowerCase().includes(searchQuery.toLowerCase())); // ✅ Fix: Get tournament name
  
    const matchesPaymentFilter = 
      paymentFilter === "all" || 
      (reg.paymentStatus && reg.paymentStatus.toLowerCase() === paymentFilter);
  
    return matchesSearch && matchesPaymentFilter;
  });
  
  // Fetch tournament list
  const fetchTournamentList = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5001/api/tournaments/all");  // ✅ FIXED
      setTournamentList(res.data);
      setLoading(false);
    } catch (error) {
      console.error("❌ Failed to fetch tournament list:", error.response?.data || error.message);
      setError("Failed to fetch tournament list. Please try again.");
      setLoading(false);
    }
  };
  
  
  // Random payment status for demo
  const randomPaymentStatus = () => {
    const statuses = ["Paid", "Pending", "Failed"];
    return statuses[Math.floor(Math.random() * statuses.length)];
  };

  useEffect(() => {
    console.log("🔄 useEffect triggered, activeView:", activeView);
    if (activeView === "tournaments") {
      fetchTournaments();
    } else if (activeView === "registrations") {
      fetchRegistrations();
    }
  }, [activeView]);
  
  
  

  // Menu items for sidebar
  const menuItems = [
    { name: "Dashboard", route: "/admin/dashboard", icon: <Home size={20} /> },
    { name: "Tournaments", route: "/admin/tournaments", icon: <Trophy size={20} /> },
    { name: "News & Media", route: "/admin/news", icon: <FileText size={20} /> },
    { name: "Training Programs", route: "/admin/training", icon: <BookOpen size={20} /> },
    { name: "Finance & Payroll", route: "/admin/finance", icon: <DollarSign size={20} /> },
    { name: "Users", route: "/admin/users", icon: <Users size={20} /> },
    { name: "Support", route: "/admin/support", icon: <HelpCircle size={20} /> },
  ];

  // Toggle sidebar collapse
  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  // Format date for display
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const handleEditTournamentClick = (tournament) => {
    console.log("🧩 Tournament object passed to edit:", tournament);
    
    if (!tournament || !tournament._id) {
      alert("Tournament ID is missing. Cannot edit.");
      return;
    }
  
    setEditedData(tournament);
    setEditingTournament(tournament._id);
  };
  
     

// 🎯 **Save Tournament Edits**
const handleSaveTournamentEdit = async () => {
  if (!editingTournament) {
    console.error("No tournament selected for editing.");
    alert("No tournament selected for editing.");
    return;
  }  

  try {
    const res = await axios.put(
      `http://localhost:5001/api/tournaments/update/${editingTournament}`,
      editedData
    );
    if (res.status === 200) {
      showToast("✅ Tournament updated successfully!");
      setEditingTournament(null);
      fetchTournamentList(); // Refresh list
    }
  } catch (err) {
    console.error("Edit Error:", err);
    alert("Error updating tournament.");
  }
};



  // Delete tournament registration
  const handleDeleteTournament = async (id) => {
    if (!id) {
      console.error("⚠️ Invalid tournament ID:", id);
      return;
    }
  
    if (window.confirm("Are you sure you want to delete this tournament?")) {
      try {
        const response = await axios.delete(`http://localhost:5001/api/tournaments/${id}`);
  
        if (response.status === 200) {
          showToast("✅ Tournament deleted successfully!");
          fetchTournaments(); // ✅ Refresh the list after deletion
        } else {
          console.error("⚠️ Unexpected response:", response);
          alert("❌ Failed to delete tournament. Try again.");
        }
      } catch (error) {
        console.error("❌ Error deleting tournament:", error.response?.data || error.message);
        alert("❌ Error deleting tournament.");
      }
    }
  };  
  
  // Show toast notification
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };
  
  // Filter tournaments based on search query and payment filter
  const filteredTournaments = tournaments.filter(tournament => {
    const matchesSearch = 
      (tournament.fullName && tournament.fullName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (tournament.email && tournament.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (tournament.schoolName && tournament.schoolName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (tournament.tournament && tournament.tournament.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesPaymentFilter = 
      paymentFilter === "all" || 
      (tournament.paymentStatus && tournament.paymentStatus.toLowerCase() === paymentFilter);
      
    return matchesSearch && matchesPaymentFilter;
  });
  
  // Filter tournament list based on search
  const filteredTournamentList = tournamentList.filter(tournament => {
    return tournament.tournamentName && tournament.tournamentName.toLowerCase().includes(searchQuery.toLowerCase());
  });
  
  // Toggle expanded row
  const toggleExpandRow = (id) => {
    if (expandedRow === id) {
      setExpandedRow(null);
    } else {
      setExpandedRow(id);
    }
  };
  
  // Get payment status badge color
  const getPaymentStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'paid':
        return { bg: '#ECFDF5', color: '#10B981' }; // Green
      case 'pending':
        return { bg: '#FEF3C7', color: '#D97706' }; // Yellow
      case 'failed':
        return { bg: '#FEE2E2', color: '#EF4444' }; // Red
      default:
        return { bg: '#F3F4F6', color: '#6B7280' }; // Gray
    }
  };

  // Get payment method icon
  const getPaymentMethodIcon = (method) => {
    switch(method?.toLowerCase()) {
      case 'credit card':
        return <CreditCard size={16} />;
      case 'bank transfer':
        return <DollarSign size={16} />;
      case 'paypal':
        return <PaymentIcon size={16} />;
      default:
        return <CreditCard size={16} />;
    }
  };
  
  // Create new tournament
  const handleCreateTournament = async () => {
    if (
      !newTournament.tournamentName || 
      !newTournament.date || 
      !newTournament.venue || 
      !newTournament.registrationDeadline
    ) {
      alert("Please fill in all required fields.");
      return;
    }
  
    try {
      const response = await axios.post("http://localhost:5001/api/tournaments/create", newTournament);
  
      if (response.status === 201 || response.status === 200) {
        showToast("Tournament created successfully!");
        setShowCreateModal(false);
        setNewTournament({
          tournamentName: "",
          category: "Under 17",
          date: "",
          registrationDeadline: "",
          venue: "",
          maxParticipants: 16,
          status: "Registration Open",
          coordinator: "",
          contact: "",
          prizes: "",
          description: "",
          paymentMethod: "Bank Transfer",
        });
        fetchTournamentList();
      } else {
        console.error("Unexpected response:", response);
        alert("Failed to create tournament. Try again.");
      }
    } catch (error) {
      console.error("Error creating tournament:", error.response?.data || error.message);
      alert("Error creating tournament");
    }
  };
  

  const handleDelete = async (id) => {
    if (!id) {
      console.error("⚠️ Invalid registration ID:", id);
      return;
    }
  
    if (window.confirm("Are you sure you want to delete this registration?")) {
      try {
        const response = await axios.delete(`http://localhost:5001/api/tournament-registrations/${id}`);
  
        if (response.status === 200) {
          showToast("✅ Registration deleted successfully!");
          fetchRegistrations(); // ✅ Refresh list after deletion
        } else {
          console.error("⚠️ Unexpected response:", response);
          alert("❌ Failed to delete registration. Try again.");
        }
      } catch (error) {
        console.error("❌ Error deleting registration:", error.response?.data || error.message);
        alert("❌ Error deleting registration.");
      }
    }
  };
  const updatePlayerField = (index, field, value) => {
    setEditedData((prevData) => {
      const updatedPlayers = [...prevData.players]; // Copy players array
      updatedPlayers[index] = { ...updatedPlayers[index], [field]: value }; // Update specific field
  
      return {
        ...prevData,
        players: updatedPlayers, // Update state with new players list
      };
    });
  };
  // 🎯 Function to add a new player field
const addNewPlayerField = () => {
  setEditedData((prevData) => ({
    ...prevData,
    players: [...(prevData.players || []), { name: "", age: "" }] // Add new player field
  }));
  
};


  return (
    <div className="admin-container">
      {/* Bracket Modal */}
      <AnimatePresence>
        {showBracket && (
          <motion.div 
            className="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowBracket(null)}
          >
            <motion.div 
              className="bracket-modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>Tournament Bracket</h2>
                <button className="close-btn" onClick={() => setShowBracket(null)}>
                  <X size={20} />
                </button>
              </div>
              <TournamentBracket tournamentId={showBracket} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast notification */}
      <AnimatePresence>
        {toast.show && (
          <motion.div 
            className={`toast-notification ${toast.type}`}
            initial={{ opacity: 0, y: -50, x: "-50%" }}
            animate={{ opacity: 1, y: 20 }}
            exit={{ opacity: 0, y: -50 }}
          >
            {toast.type === "success" ? (
              <CheckCircle size={18} />
            ) : (
              <AlertCircle size={18} />
            )}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div 
        className={`admin-sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}
        initial={{ x: -300 }}
        animate={{ x: 0, width: isSidebarCollapsed ? '80px' : '280px' }}
        transition={{ duration: 0.3 }}
      >
        <div className="admin-logo">
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {isSidebarCollapsed ? "SLSBA" : "SLSBA Admin"}
          </motion.h2>
        </div>
        <ul className="admin-menu">
          {menuItems.map((item, index) => (
            <motion.li
              key={index}
              className={activeTab === item.name ? "active" : ""}
              onClick={() => {
                setActiveTab(item.name);
                navigate(item.route);
              }}
              whileHover={{ scale: 1.05, x: 5 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.2 }}
            >
              <span className="icon">{item.icon}</span>
              {!isSidebarCollapsed && (
                <motion.span 
                  className="text"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 + (0.05 * index) }}
                >
                  {item.name}
                </motion.span>
              )}
            </motion.li>
          ))}
        </ul>
      </motion.div>

      {/* Main Content */}
      <div className={`admin-content ${isSidebarCollapsed ? 'expanded' : ''}`}>
        <motion.div 
          className="admin-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <button className="menu-toggle" onClick={toggleSidebar}>
            <Menu size={24} />
          </button>
          <div className="search-container">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="header-actions">
            <motion.div 
              className="notifications-icon"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Bell size={20} />
              {notifications > 0 && <span className="notification-badge">{notifications}</span>}
            </motion.div>
            <div className="date-display">{formatDate(currentTime)}</div>
          </div>
        </motion.div>

        {/* Page Header with Title and Actions */}
        <motion.div 
          className="page-header"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <div className="page-title">
            <h1><Trophy size={24} /> Tournament Management</h1>
            <p>Manage tournaments and participant registrations</p>
          </div>
          <div className="page-tabs">
          <button 
            className={`tab-btn ${activeView === 'tournaments' ? 'active' : ''}`} 
            onClick={() => setActiveView('tournaments')}
          >
              <Trophy size={16} /> Tournaments
            </button>
            <button 
            className={`tab-btn ${activeView === 'registrations' ? 'active' : ''}`} 
            onClick={() => setActiveView('registrations')}
          >
              <Users size={16} /> Registrations
            </button>
          </div>
          <div className="page-actions">
            <motion.button 
              className="action-btn secondary-btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilterOpen(!filterOpen)}
            >
              <Filter size={16} />
              Filter
            </motion.button>
            <motion.button 
              className="action-btn secondary-btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={activeView === 'tournaments' ? fetchTournamentList : fetchTournaments}
            >
              <RefreshCw size={16} />
              Refresh
            </motion.button>
            <motion.button 
              className="action-btn primary-btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateModal(true)}
            >
              <Plus size={16} />
              {activeView === 'tournaments' ? 'New Tournament' : 'New Registration'}
            </motion.button>
          </div>
        </motion.div>

        {/* Filter Dropdown */}
        <AnimatePresence>
          {filterOpen && (
            <motion.div 
              className="filter-dropdown"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {activeView === 'registrations' && (
                <div className="filter-group">
                  <label>Payment Status</label>
                  <div className="filter-options">
                    <button 
                      className={`filter-option ${paymentFilter === 'all' ? 'active' : ''}`}
                      onClick={() => setPaymentFilter('all')}
                    >
                      All
                    </button>
                    <button 
                      className={`filter-option ${paymentFilter === 'paid' ? 'active' : ''}`}
                      onClick={() => setPaymentFilter('paid')}
                    >
                      Paid
                    </button>
                    <button 
                      className={`filter-option ${paymentFilter === 'pending' ? 'active' : ''}`}
                      onClick={() => setPaymentFilter('pending')}
                    >
                      Pending
                    </button>
                    <button 
                      className={`filter-option ${paymentFilter === 'failed' ? 'active' : ''}`}
                      onClick={() => setPaymentFilter('failed')}
                    >
                      Failed
                    </button>
                  </div>
                </div>
              )}
              {activeView === 'tournaments' && (
                <div className="filter-group">
                  <label>Category</label>
                  <div className="filter-options">
                    <button className="filter-option active">All</button>
                    <button className="filter-option">Under 13</button>
                    <button className="filter-option">Under 15</button>
                    <button className="filter-option">Under 17</button>
                    <button className="filter-option">Under 19</button>
                    <button className="filter-option">Open</button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tournaments or Registrations Content */}
        <motion.div 
          className="tournament-container"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
        >
          {loading ? (
            <div className="loading-state">
              <RefreshCw size={40} className="loading-icon" />
              <p>Loading data...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <AlertCircle size={40} />
              <p>{error}</p>
              <button className="retry-btn" onClick={activeView === 'tournaments' ? fetchTournamentList : fetchTournaments}>
                Try Again
              </button>
            </div>
          ) : (
            <>
              {/* Tournament List View */}
              {activeView === 'tournaments' && (
  <div className="tournaments-table-wrapper-scroll">
    <div className="tournaments-list-wrapper">
      <table className="tournaments-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Category</th>
            <th>Date</th>
            <th>Registration Deadline</th>
            <th>Venue</th>
            <th>Max Participants</th>
            <th>Status</th>
            <th>Coordinator</th>
            <th>Contact</th>
            <th>Prizes</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredTournamentList.length === 0 ? (
            <tr>
              <td colSpan="12" className="no-data">
                No tournaments found
              </td>
            </tr>
          ) : (
            filteredTournamentList.map((tournament, index) => (
              <motion.tr
                key={tournament._id || index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <td>{tournament.tournamentName}</td>
                <td>{tournament.category}</td>
                <td>{new Date(tournament.date).toLocaleDateString()}</td>
                <td>{new Date(tournament.registrationDeadline).toLocaleDateString()}</td>
                <td>{tournament.venue}</td>
                <td>{tournament.maxParticipants}</td>
                <td>{tournament.status}</td>
                <td>{tournament.coordinator}</td>
                <td>{tournament.contact}</td>
                <td>{tournament.prizes}</td>
                <td className="description-cell">
                  {tournament.description?.length > 100
                    ? tournament.description.slice(0, 100) + "..."
                    : tournament.description}
                </td>
                <td>
                  <div className="action-buttons-cell">
                    <motion.button
                      className="table-action-btn view-btn"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowBracket(tournament._id)}
                    >
                      View Bracket
                    </motion.button>

                    <motion.button
                      className="table-action-btn edit-btn"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleEditTournamentClick(tournament)}
                    >
                      <Edit size={14} /> Edit
                    </motion.button>

                    <motion.button
                      className="table-action-btn delete-btn"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDeleteTournament(tournament._id)}
                    >
                      <Trash2 size={14} /> Delete
                    </motion.button>
                  </div>
                </td>
              </motion.tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </div>
)}

              
              {/* Tournament Registrations View */}
{activeView === 'registrations' && (
  <div className="tournaments-table-wrapper">
    <table className="tournaments-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>School</th>
          <th>Tournament</th>
          <th>Players</th>
          <th>Payment</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {filteredRegistrations.length === 0 ? (
          <tr>
            <td colSpan="6" className="no-data">No tournament registrations found</td>
          </tr>
        ) : (
          filteredRegistrations.map((registration, index) => (
            <React.Fragment key={registration._id || index}>
              {/* Main Registration Row */}
              <motion.tr
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                className={expandedRow === registration._id ? 'expanded-row' : ''}
              >
                <td>{registration.fullName}</td>
                <td>{registration.email}</td>
                <td>{registration.schoolName}</td>
                <td>{registration.tournament?.tournamentName || "Unknown"}</td>
                <td>
                  {registration.players?.length > 0 ? (
                    <button
                      className="players-toggle-btn"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent row click interference
                        toggleExpandRow(registration._id);
                      }}
                    >
                      <span>{registration.players.length} players</span>
                      <ChevronDown
                        size={16}
                        className={`chevron-icon ${expandedRow === registration._id ? 'rotated' : ''}`}
                      />
                    </button>
                  ) : (
                    <span className="no-players">No players</span>
                  )}
                </td>
                <td>
                  <div className="payment-info">
                    <div
                      className="payment-badge"
                      style={{
                        backgroundColor: getPaymentStatusColor(registration.paymentStatus).bg,
                        color: getPaymentStatusColor(registration.paymentStatus).color
                      }}
                    >
                      {registration.paymentStatus || "Pending"}
                    </div>
                    <div className="payment-method">
                      {getPaymentMethodIcon(registration.paymentMethod)}
                      <span>{registration.paymentMethod || "Credit Card"}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="action-buttons-cell">
                  <motion.button 
                    className="table-action-btn edit-btn"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditRegistrationClick(registration); // ✅ Use correct function
                    }}
                  >
                    <Edit size={14} /> Edit
                  </motion.button>
                    <motion.button 
                        className="table-action-btn delete-btn"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation(); // ✅ Prevents row click interference
                          handleDelete(registration._id);
                        }}
                      >
                        <Trash2 size={14} /> Delete
                      </motion.button>
                  </div>
                </td>
              </motion.tr>

              {/* Expanded Player Details Row */}
              {expandedRow === registration._id && (
                <motion.tr
                  className="expanded-details-row"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <td colSpan="6">
                    <div className="expanded-details-content">
                      <h3>Player Details</h3>
                      {registration.players?.length > 0 ? (
                        <div className="players-table-container">
                          <table className="players-table">
                            <thead>
                              <tr>
                                <th>Player Name</th>
                                <th>Age</th>
                              </tr>
                            </thead>
                            <tbody>
                              {registration.players.map((player, idx) => (
                                <tr key={idx}>
                                  <td>{player.name}</td>
                                  <td>{player.age}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="no-data-message">No players added to this registration</p>
                      )}
                    </div>
                  </td>
                </motion.tr>
              )}
            </React.Fragment>
          ))
        )}
      </tbody>
    </table>
  </div>
)}

            </>
          )}
        </motion.div>
      </div>

      {/* 🎯 Tournament Editing Modal */}
      <AnimatePresence>
  {editingTournament && (
    <motion.div
      className="modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="edit-modal"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>Edit Tournament</h2>
          <button className="close-btn" onClick={() => setEditingTournament(null)}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label>Tournament Name</label>
            <input
              type="text"
              value={editedData.tournamentName || ""}
              onChange={(e) =>
                setEditedData({ ...editedData, tournamentName: e.target.value })
              }
            />
          </div>

          <div className="form-group">
            <label>Category</label>
            <select
              value={editedData.category || "Under 17"}
              onChange={(e) =>
                setEditedData({ ...editedData, category: e.target.value })
              }
            >
              <option value="Under 13">Under 13</option>
              <option value="Under 15">Under 15</option>
              <option value="Under 17">Under 17</option>
              <option value="Under 19">Under 19</option>
              <option value="Open">Open</option>
            </select>
          </div>

          <div className="form-group">
  <label>Date</label>
  <input
    type="date"
    value={
      editedData.date
        ? new Date(editedData.date).toISOString().split("T")[0]
        : ""
    }
    onChange={(e) =>
      setEditedData({ ...editedData, date: e.target.value })
    }
  />
</div>


<div className="form-group">
  <label>Registration Deadline</label>
  <input
    type="date"
    value={
      editedData.registrationDeadline
        ? new Date(editedData.registrationDeadline).toISOString().split("T")[0]
        : ""
    }
    onChange={(e) =>
      setEditedData({ ...editedData, registrationDeadline: e.target.value })
    }
  />
</div>


          <div className="form-group">
            <label>Venue</label>
            <input
              type="text"
              value={editedData.venue || ""}
              onChange={(e) =>
                setEditedData({ ...editedData, venue: e.target.value })
              }
            />
          </div>

          <div className="form-group">
            <label>Max Participants</label>
            <input
              type="number"
              min="2"
              max="128"
              value={editedData.maxParticipants || 16}
              onChange={(e) =>
                setEditedData({
                  ...editedData,
                  maxParticipants: parseInt(e.target.value),
                })
              }
            />
          </div>

          <div className="form-group">
            <label>Status</label>
            <select
  value={editedData.status || "Registration Open"}
  onChange={(e) => setEditedData({ ...editedData, status: e.target.value })}
>
  <option value="Registration Open">Registration Open</option>
  <option value="Coming Soon">Coming Soon</option>
  <option value="Completed">Completed</option>
</select>

          </div>

          <div className="form-group">
            <label>Coordinator</label>
            <input
              type="text"
              value={editedData.coordinator || ""}
              onChange={(e) =>
                setEditedData({ ...editedData, coordinator: e.target.value })
              }
            />
          </div>

          <div className="form-group">
            <label>Contact Number</label>
            <input
              type="text"
              value={editedData.contact || ""}
              onChange={(e) =>
                setEditedData({ ...editedData, contact: e.target.value })
              }
            />
          </div>

          <div className="form-group">
            <label>Prizes</label>
            <textarea
              rows="2"
              value={editedData.prizes || ""}
              onChange={(e) =>
                setEditedData({ ...editedData, prizes: e.target.value })
              }
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              rows="3"
              value={editedData.description || ""}
              onChange={(e) =>
                setEditedData({ ...editedData, description: e.target.value })
              }
            />
          </div>
        </div>

        <div className="modal-footer">
          <button className="cancel-btn" onClick={() => setEditingTournament(null)}>
            Cancel
          </button>
          <button className="save-btn" onClick={handleSaveTournamentEdit}>
            <Save size={14} /> Save Changes
          </button>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
<AnimatePresence>
  {editingRegistration && (
    <motion.div 
      className="modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="edit-modal"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>Edit Tournament Registration</h2>
          <button className="close-btn" onClick={() => setEditingRegistration(null)}>
            <X size={20} />
          </button>
        </div>
        <div className="modal-body">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="fullName">Full Name</label>
              <input 
                type="text" 
                id="fullName" 
                value={editedData.fullName || ''}
                onChange={(e) => setEditedData({...editedData, fullName: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label htmlFor="schoolName">School Name</label>
              <input 
                type="text" 
                id="schoolName" 
                value={editedData.schoolName || ''}
                onChange={(e) => setEditedData({...editedData, schoolName: e.target.value})}
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="tournament">Tournament</label>
              <input 
                type="text" 
                id="tournament" 
                value={editedData.tournament || ''}
                onChange={(e) => setEditedData({...editedData, tournament: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label htmlFor="paymentMethod">Payment Method</label>
              <select 
                id="paymentMethod"
                value={editedData.paymentMethod || 'Credit Card'}
                onChange={(e) => setEditedData({...editedData, paymentMethod: e.target.value})}
              >
                <option value="Credit Card">Credit Card</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="PayPal">PayPal</option>
              </select>
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="paymentStatus">Payment Status</label>
              <select 
                id="paymentStatus"
                value={editedData.paymentStatus || 'Pending'}
                onChange={(e) => setEditedData({...editedData, paymentStatus: e.target.value})}
              >
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
                <option value="Failed">Failed</option>
              </select>
            </div>
          </div>

          {/* ✅ Player Editing Section */}
          <div className="form-section">
            <div className="section-header">
              <h3>Players</h3>
              <button 
  type="button" 
  className="add-player-btn"
  onClick={addNewPlayerField} // ✅ Ensure function is defined
>
  <Plus size={14} /> Add Player
</button>

            </div>

            <div className="players-list">
              {editedData.players.length === 0 ? (
                <p className="no-players-msg">No players added yet</p>
              ) : (
                editedData.players.map((player, index) => (
                  <div className="player-item" key={index}>
                    <div className="player-form-row">
                      <div className="form-group">
                        <label>Name</label>
                        <input 
                          type="text" 
                          value={player.name || ''}
                          onChange={(e) => updatePlayerField(index, 'name', e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>Age</label>
                        <input 
                          type="number" 
                          value={player.age || ''}
                          onChange={(e) => updatePlayerField(index, 'age', e.target.value)}
                        />
                      </div>
                      <button 
                        type="button" 
                        className="remove-player-btn"
                        onClick={() => removePlayerField(index)}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button 
            className="cancel-btn" 
            onClick={() => setEditingRegistration(null)}
          >
            Cancel
          </button>
          <button 
            className="save-btn" 
            onClick={handleSaveRegistrationEdit}
          >
            <Save size={14} /> Save Changes
          </button>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>

      {/* Tournament Creation Modal */}
      <AnimatePresence>
  {showCreateModal && (
    <motion.div
      className="modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="create-modal"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>Create New Tournament</h2>
          <button className="close-btn" onClick={() => setShowCreateModal(false)}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label>Tournament Name</label>
            <input
              type="text"
              value={newTournament.tournamentName}
              onChange={(e) =>
                setNewTournament({ ...newTournament, tournamentName: e.target.value })
              }
              required
            />
          </div>

          <div className="form-group">
            <label>Category</label>
            <select
              value={newTournament.category}
              onChange={(e) =>
                setNewTournament({ ...newTournament, category: e.target.value })
              }
            >
              <option value="Under 13">Under 13</option>
              <option value="Under 15">Under 15</option>
              <option value="Under 17">Under 17</option>
              <option value="Under 19">Under 19</option>
              <option value="Open">Open</option>
            </select>
          </div>

          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              value={newTournament.date}
              onChange={(e) => setNewTournament({ ...newTournament, date: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Registration Deadline</label>
            <input
              type="date"
              value={newTournament.registrationDeadline}
              onChange={(e) =>
                setNewTournament({ ...newTournament, registrationDeadline: e.target.value })
              }
              required
            />
          </div>

          <div className="form-group">
            <label>Venue</label>
            <input
              type="text"
              value={newTournament.venue}
              onChange={(e) => setNewTournament({ ...newTournament, venue: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
  <label>Maximum Participants</label>
  <input
    type="number"
    min="2"
    max="128"
    value={
      newTournament.maxParticipants === 0 || newTournament.maxParticipants
        ? newTournament.maxParticipants
        : ""
    }
    onChange={(e) => {
      const value = e.target.value;
      setNewTournament({
        ...newTournament,
        maxParticipants: value === "" ? "" : parseInt(value),
      });
    }}
  />
</div>


          <div className="form-group">
            <label>Status</label>
            <select
              value={newTournament.status}
              onChange={(e) => setNewTournament({ ...newTournament, status: e.target.value })}
            >
              <option value="Registration Open">Registration Open</option>
              <option value="Coming Soon">Coming Soon</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div className="form-group">
            <label>Registration Payment Method</label>
            <select
              value={newTournament.paymentMethod}
              onChange={(e) =>
                setNewTournament({ ...newTournament, paymentMethod: e.target.value })
              }
            >
              <option value="Credit Card">Credit Card</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="PayPal">PayPal</option>
            </select>
          </div>

          <div className="form-group">
            <label>Coordinator</label>
            <input
              type="text"
              value={newTournament.coordinator}
              onChange={(e) => setNewTournament({ ...newTournament, coordinator: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Contact Number</label>
            <input
              type="text"
              value={newTournament.contact}
              onChange={(e) => setNewTournament({ ...newTournament, contact: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Prizes</label>
            <textarea
              rows="2"
              value={newTournament.prizes}
              onChange={(e) => setNewTournament({ ...newTournament, prizes: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              rows="3"
              value={newTournament.description}
              onChange={(e) => setNewTournament({ ...newTournament, description: e.target.value })}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button className="cancel-btn" onClick={() => setShowCreateModal(false)}>
            Cancel
          </button>
          <button className="save-btn" onClick={handleCreateTournament}>
            <Save size={14} /> Create Tournament
          </button>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>


      {/* Initial Loading Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div 
            className="loading-overlay"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="logo-container">
              <Trophy size={50} className="logo-icon" />
              <h1>SLSBA Admin</h1>
            </div>
            <motion.div 
              className="loading-spinner"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <RefreshCw size={40} />
            </motion.div>
            <p>Loading dashboard...</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminTournaments;