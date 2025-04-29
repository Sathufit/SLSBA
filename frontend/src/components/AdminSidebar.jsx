import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home, Trophy, FileText, BookOpen, DollarSign,
  Users, Bell, Search, Menu, LogOut, Settings
} from "lucide-react";
import "../styles/AdminSidebar.css";
import { useNavigate, useLocation } from "react-router-dom";

const menuItems = [
  { name: "Dashboard", route: "/admin/dashboard", icon: <Home size={20} /> },
  { name: "Tournaments", route: "/admin/tournaments", icon: <Trophy size={20} /> },
  { name: "News & Media", route: "/admin/news", icon: <FileText size={20} /> },
  { name: "Training Programs", route: "/admin/add-training", icon: <BookOpen size={20} /> },
  { name: "Finance", route: "/admin/finance", icon: <DollarSign size={20} /> },
  { name: "Users", route: "/admin/users", icon: <Users size={20} /> },
  { name: "Support", route: "/admin/support", icon: <Settings size={20} /> },
];

const AdminLayout = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [notifications, setNotifications] = useState(3);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminLoginTime");
    navigate("/admin/login", { replace: true });
  };

  const location = useLocation();


  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  return (
    <div className="admin-container">
      <motion.div
        className={`admin-sidebar ${isSidebarCollapsed ? "collapsed" : ""}`}
        initial={{ x: -300 }}
        animate={{ x: 0, width: isSidebarCollapsed ? "80px" : "280px" }}
        transition={{ duration: 0.3 }}
      >
        <div className="admin-logo">
          {!isSidebarCollapsed ? <h2>SLSBA Admin</h2> : <h2>SL</h2>}
        </div>
        <ul className="admin-menu">
          {menuItems.map((item, i) => (
            <motion.li
              key={i}
              className={location.pathname === item.route ? "active" : ""}
              onClick={() => navigate(item.route)}
              whileHover={{ scale: 1.03, x: 3 }}
              whileTap={{ scale: 0.97 }}
            >
              <span className="icon">{item.icon}</span>
              {!isSidebarCollapsed && <span className="text">{item.name}</span>}
            </motion.li>
          ))}
        </ul>
        <div className="sidebar-footer">
          <motion.button className="logout-btn" onClick={handleLogout}>
            <LogOut size={20} /> {!isSidebarCollapsed && "Logout"}
          </motion.button>
        </div>
      </motion.div>

      <motion.div className="admin-header">
        <div className="header-left">
          <button className="menu-toggle" onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}>
            <Menu size={24} />
          </button>
        </div>
        <div className="header-right">
          <div className="date-display">{formatDate(currentTime)}</div>
          <div className="notification-bell" onClick={() => setShowNotificationPanel(!showNotificationPanel)}>
            <Bell size={20} />
            {notifications > 0 && <span className="notification-badge">{notifications}</span>}
            <AnimatePresence>
              {showNotificationPanel && (
                <motion.div className="notification-panel">
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

      <div className={`admin-content ${isSidebarCollapsed ? "expanded" : ""}`}>
        {children}
      </div>
    </div>
  );
};

export default AdminLayout;
