import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import "../styles/AdminDashboard.css";

// Import icons
import { 
  Home, Trophy, FileText, BookOpen, DollarSign, 
  Users, HelpCircle, Bell, Search, Menu, Activity,
  BarChart2, TrendingUp, Calendar, LogOut, Settings
} from "lucide-react";

// Sample data for dashboard stats and charts
const mockStats = [
  { title: "Total Users", value: "5,296", icon: <Users size={20} />, change: "+12%" },
  { title: "Revenue", value: "$38,450", icon: <DollarSign size={20} />, change: "+8.3%" },
  { title: "Active Tournaments", value: "24", icon: <Trophy size={20} />, change: "+3" },
  { title: "New Registrations", value: "389", icon: <Activity size={20} />, change: "+22%" },
];

const recentActivities = [
  { id: 1, action: "New tournament created", user: "Admin", time: "2 hours ago" },
  { id: 2, action: "User payment received", user: "John Doe", time: "3 hours ago" },
  { id: 3, action: "New training program published", user: "Admin", time: "5 hours ago" },
  { id: 4, action: "New user registered", user: "Sarah Miller", time: "Yesterday" },
];

const AdminDashboard = () => {
  // State Hooks
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [notifications, setNotifications] = useState(3);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const navigate = useNavigate();

  // Check Login & Auto Logout
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    const loginTime = localStorage.getItem("adminLoginTime");

    if (!token) {
      navigate("/admin/login");
      return;
    }

    setIsLoggedIn(true);

    if (loginTime) {
      const elapsedTime = Date.now() - parseInt(loginTime, 10);
      if (elapsedTime > 3600000) { // 1 hour = 3600000 ms
        handleLogout();
      }
    }

    const interval = setInterval(() => {
      const elapsedTime = Date.now() - parseInt(localStorage.getItem("adminLoginTime"), 10);
      if (elapsedTime > 3600000) {
        handleLogout();
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [navigate]);

  // Simulate Data Loading
  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminLoginTime");
    setIsLoggedIn(false);
    navigate("/admin/login");
  };

  // Sidebar Toggle
  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  // Format Date
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Dashboard Data
  const menuItems = [
    { name: "Dashboard", route: "/admin", icon: <Home size={20} /> },
    { name: "Tournaments", route: "/admin/tournaments", icon: <Trophy size={20} /> },
    { name: "News & Media", route: "/admin/news", icon: <FileText size={20} /> },
    { name: "Training Programs", route: "/admin/add-training", icon: <BookOpen size={20} /> },
    { name: "Finance & Payroll", route: "/admin/finance", icon: <DollarSign size={20} /> },
    { name: "Users", route: "/admin/users", icon: <Users size={20} /> },
    { name: "Analytics", route: "/admin/analytics", icon: <BarChart2 size={20} /> },
<<<<<<< HEAD
    { name: "Settings", route: "/admin/settings", icon: <Settings size={20} /> },
=======
    { name: "Support", route: "/admin/support", icon: <Settings size={20} /> },
>>>>>>> cf00e0e27bb95d12f1c8c467c72a0fc52dc1f5e1
  ];

  if (isLoading) {
    return (
      <div className="admin-loading">
        <motion.div 
          className="spinner"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        />
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Loading SLSBA Dashboard...
        </motion.h2>
      </div>
    );
  }

  return (
    <div className="admin-container">
      {/* Sidebar */}
      <motion.div 
        className={`admin-sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}
        initial={{ x: -300 }}
        animate={{ x: 0, width: isSidebarCollapsed ? '80px' : '280px' }}
        transition={{ duration: 0.3 }}
      >
        <div className="admin-logo">
          {!isSidebarCollapsed ? <h2>SLSBA Admin</h2> : <h2>SL</h2>}
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
              whileHover={{ scale: 1.03, x: 3 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.2 }}
            >
              <span className="icon">{item.icon}</span>
              {!isSidebarCollapsed && <span className="text">{item.name}</span>}
            </motion.li>
          ))}
        </ul>

        <div className="sidebar-footer">
          <motion.button 
            className="logout-btn" 
            onClick={handleLogout}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <LogOut size={20} /> {!isSidebarCollapsed && "Logout"}
          </motion.button>
        </div>
      </motion.div>

      {/* Header */}
      <motion.div 
        className="admin-header"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="header-left">
          <button className="menu-toggle" onClick={toggleSidebar}>
            <Menu size={24} />
          </button>
          <div className="search-container">
            <Search size={18} className="search-icon" />
            <input type="text" placeholder="Search..." className="search-bar" />
          </div>
        </div>
        <div className="header-right">
          <div className="date-display">{formatDate(currentTime)}</div>
          <div className="notification-bell" onClick={() => setShowNotificationPanel(!showNotificationPanel)}>
            <Bell size={20} />
            {notifications > 0 && <span className="notification-badge">{notifications}</span>}
            
            {/* Notification Panel */}
            <AnimatePresence>
              {showNotificationPanel && (
                <motion.div 
                  className="notification-panel"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                >
                  <h3>Notifications</h3>
                  <ul>
                    <li>New tournament registration</li>
                    <li>Payment received from User #1234</li>
                    <li>System update scheduled for tomorrow</li>
                  </ul>
                  <button onClick={() => setNotifications(0)}>Mark all as read</button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="admin-profile">
            <div className="admin-avatar">A</div>
            <span className="admin-name">Admin</span>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className={`admin-content ${isSidebarCollapsed ? 'expanded' : ''}`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="dashboard-welcome">
            <div>
              <h1>Welcome back, Admin</h1>
              <p>Here's what's happening with your tournaments today.</p>
            </div>
            <div className="quick-actions">
              <button className="primary-btn">
                <Trophy size={16} /> New Tournament
              </button>
              <button className="secondary-btn">
                <FileText size={16} /> Generate Report
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="stats-container">
            {mockStats.map((stat, index) => (
              <motion.div
                key={index}
                className="stat-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <div className="stat-icon">{stat.icon}</div>
                <div className="stat-details">
                  <h3>{stat.title}</h3>
                  <h2>{stat.value}</h2>
                  <span className="stat-change">{stat.change}</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Chart and Activity Section */}
          <div className="dashboard-charts">
            <motion.div 
              className="chart-container"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <h2>Tournament Participation</h2>
              <div className="chart-placeholder">
                <p>Bar chart showing tournament participation would render here</p>
                <BarChart2 size={100} className="placeholder-icon" />
              </div>
            </motion.div>

            <motion.div 
              className="recent-activity"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <h2>Recent Activity</h2>
              <ul className="activity-list">
                {recentActivities.map((activity) => (
                  <li key={activity.id} className="activity-item">
                    <div className="activity-dot"></div>
                    <div className="activity-content">
                      <p className="activity-text">{activity.action}</p>
                      <p className="activity-meta">
                        <span className="activity-user">{activity.user}</span>
                        <span className="activity-time">{activity.time}</span>
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
              <button className="view-all-btn">View All Activity</button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;