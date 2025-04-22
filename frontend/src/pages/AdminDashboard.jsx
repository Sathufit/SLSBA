import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";
import { motion } from "framer-motion";
import "../styles/AdminDashboard.css";

import {
  Home, Trophy, FileText, BookOpen, DollarSign,
  Users, HelpCircle, Bell, Search, Menu, Activity, LogOut
} from "lucide-react";

const AdminDashboard = ({ setIsAdminLoggedIn }) => {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { name: "Dashboard", route: "/admin/dashboard", icon: <Home size={20} /> },
    { name: "Tournaments", route: "/admin/tournaments", icon: <Trophy size={20} /> },
    { name: "News & Media", route: "/admin/news", icon: <FileText size={20} /> },
    { name: "Training Programs", route: "/admin/add-training", icon: <BookOpen size={20} /> },
    { name: "Finance & Payroll", route: "/admin/finance", icon: <DollarSign size={20} /> },
    { name: "Users", route: "/admin/users", icon: <Users size={20} /> },
    { name: "Support", route: "/admin/support", icon: <HelpCircle size={20} /> },
  ];

  useEffect(() => {
    const path = location.pathname;
    const active = menuItems.find((item) => item.route === path);
    if (active) setActiveTab(active.name);
  }, [location.pathname]);

  const formatDate = (date) =>
    date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminLoginTime");
    setIsAdminLoggedIn(false);
    navigate("/admin/login");
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [incomeRes, tournamentRes, trainingRes, feedbackRes] = await Promise.all([
          axios.get("http://localhost:5001/api/incomes"),
          axios.get("http://localhost:5001/api/tournaments/all"),
          axios.get("http://localhost:5001/api/training"),
          axios.get("http://localhost:5001/api/feedback")
        ]);

        const totalIncome = incomeRes.data.reduce((sum, i) => sum + i.totalIncome, 0);
        const monthlyMap = {};
        incomeRes.data.forEach(entry => {
          const month = new Date(entry.tournamentDate).toLocaleString("default", { month: "short" });
          monthlyMap[month] = (monthlyMap[month] || 0) + entry.totalIncome;
        });
        const monthlyIncome = Object.entries(monthlyMap).map(([month, amount]) => ({
          month,
          amount
        }));

        const activeTournaments = tournamentRes.data.filter(t => t.status === "Registration Open").length;
        const activeTraining = trainingRes.data.length;
        const feedbackCount = feedbackRes.data.length;

        setStats({
          revenue: totalIncome,
          monthlyIncome,
          activeTournaments,
          activeTraining,
          feedbackCount
        });
      } catch (err) {
        console.error("Error fetching stats:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading || !stats) {
    return (
      <div className="admin-loading">
        <motion.div className="spinner" animate={{ rotate: 360 }} />
        <motion.h2>Loading SLSBA Dashboard...</motion.h2>
      </div>
    );
  }

  return (
    <div className="admin-container">
      {/* Sidebar */}
      <motion.div
        className={`admin-sidebar ${isSidebarCollapsed ? "collapsed" : ""}`}
        animate={{ width: isSidebarCollapsed ? "80px" : "280px" }}
      >
        <div className="admin-logo">
          {!isSidebarCollapsed ? <h2>SLSBA Admin</h2> : <h2>SL</h2>}
        </div>
        <ul className="admin-menu">
          {menuItems.map((item, i) => (
            <motion.li
              key={i}
              className={activeTab === item.name ? "active" : ""}
              onClick={() => {
                setActiveTab(item.name);
                navigate(item.route);
              }}
            >
              <span className="icon">{item.icon}</span>
              {!isSidebarCollapsed && <span className="text">{item.name}</span>}
            </motion.li>
          ))}
        </ul>
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={20} /> {!isSidebarCollapsed && "Logout"}
          </button>
        </div>
      </motion.div>

      {/* Header */}
      <div className="admin-header">
        <div className="header-left">
          <button className="menu-toggle" onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}>
            <Menu size={24} />
          </button>
          <div className="search-container">
            <Search size={18} className="search-icon" />
            <input type="text" placeholder="Search..." className="search-bar" />
          </div>
        </div>
        <div className="header-right">
          <div className="date-display">{formatDate(currentTime)}</div>
          <div className="admin-profile">
            <div className="admin-avatar">A</div>
            <span className="admin-name">Admin</span>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className={`admin-content ${isSidebarCollapsed ? "expanded" : ""}`}>
        <div className="dashboard-welcome">
          <div>
            <h1>Welcome back, Admin</h1>
            <p>Here’s the current system overview.</p>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-container">
          <div className="stat-card">
            <div className="stat-icon"><DollarSign size={20} /></div>
            <div className="stat-details">
              <h3>Total Income</h3>
              <h2>Rs. {Number(stats.revenue).toLocaleString()}</h2>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon"><Trophy size={20} /></div>
            <div className="stat-details">
              <h3>Active Tournaments</h3>
              <h2>{stats.activeTournaments}</h2>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon"><BookOpen size={20} /></div>
            <div className="stat-details">
              <h3>Training Programs</h3>
              <h2>{stats.activeTraining}</h2>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon"><HelpCircle size={20} /></div>
            <div className="stat-details">
              <h3>Feedback Received</h3>
              <h2>{stats.feedbackCount}</h2>
            </div>
          </div>
        </div>

          {/* Bar Chart */}
          <div className="dashboard-charts">
            <div className="chart-container">
              <h2>Monthly Income</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.monthlyIncome}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="amount" fill="#3a7bd5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    );
  };

export default AdminDashboard;
