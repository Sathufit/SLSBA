import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";
import AdminSidebar from "../components/AdminSidebar";
import {
  DollarSign, Trophy, BookOpen, Users, TrendingUp, HelpCircle
} from "lucide-react";
import "../styles/AdminDashboard.css";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [stats, setStats] = useState({
    revenue: 883000,
    activeTournaments: 3,
    activeTraining: 2,
    feedbackCount: 3,
    totalUsers: 692,
    monthlyIncome: [
      { month: "Jan", amount: 120000 },
      { month: "Feb", amount: 145000 },
      { month: "Mar", amount: 135000 },
      { month: "Apr", amount: 160000 },
      { month: "May", amount: 180000 },
      { month: "Jun", amount: 143000 }
    ]
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { name: "Dashboard", route: "/admin/dashboard" },
    { name: "Tournaments", route: "/admin/tournaments" },
    { name: "News & Media", route: "/admin/news" },
    { name: "Training Programs", route: "/admin/add-training" },
    { name: "Finance & Payroll", route: "/admin/finance" },
    { name: "Users", route: "/admin/users" },
    { name: "Support", route: "/admin/support" },
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
    navigate("/admin/login", { replace: true });
  };

  // Changed to use dummy data instead of API calls for now
  // This ensures the dashboard always renders without getting stuck in loading
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <AdminSidebar>
      <div className="admin-dashboard">
        <div className="dashboard-header">
          <div className="welcome-section">
            <h1>Welcome back, Admin</h1>
            <p>Here's the current system overview for {formatDate(currentTime)}</p>
          </div>
          <div className="header-actions">
            <div className="refresh-button">
              <button onClick={() => window.location.reload()}>
                Refresh Dashboard
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats Section */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon income">
              <DollarSign size={22} />
            </div>
            <div className="stat-details">
              <h3>Total Income</h3>
              <h2>Rs. {Number(stats.revenue).toLocaleString()}</h2>
              <p className="stat-growth positive">
                <TrendingUp size={14} />
                8.5% from last month
              </p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon tournaments">
              <Trophy size={22} />
            </div>
            <div className="stat-details">
              <h3>Active Tournaments</h3>
              <h2>{stats.activeTournaments}</h2>
              <p className="stat-subtitle">2 upcoming</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon training">
              <BookOpen size={22} />
            </div>
            <div className="stat-details">
              <h3>Training Programs</h3>
              <h2>{stats.activeTraining}</h2>
              <p className="stat-subtitle">Active programs</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon users">
              <Users size={22} />
            </div>
            <div className="stat-details">
              <h3>Total Users</h3>
              <h2>{stats.totalUsers}</h2>
              <p className="stat-subtitle">Registered users</p>
            </div>
          </div>
        </div>

        {/* Monthly Income Chart */}
        <div className="chart-section">
          <div className="dashboard-card monthly-income">
            <div className="card-header">
              <h2>Monthly Income</h2>
              <div className="card-actions">
                <select defaultValue="6">
                  <option value="3">Last 3 months</option>
                  <option value="6">Last 6 months</option>
                  <option value="12">Last 12 months</option>
                </select>
              </div>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.monthlyIncome}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`Rs. ${value.toLocaleString()}`, "Income"]} />
                  <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Additional Dashboard Widgets */}
        <div className="widgets-grid">
          {/* Recent Feedback */}
          <div className="dashboard-card feedback-card">
            <div className="card-header">
              <h2>Recent Feedback</h2>
              <div className="feedback-count">
                <HelpCircle size={16} />
                <span>{stats.feedbackCount} new</span>
              </div>
            </div>
            <div className="feedback-content">
              <p>You have {stats.feedbackCount} new feedback submissions to review.</p>
              <button className="view-feedback-btn">View Feedback</button>
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="dashboard-card events-card">
            <div className="card-header">
              <h2>Upcoming Events</h2>
            </div>
            <div className="events-list">
              <div className="event-item">
                <div className="event-date">
                  <span className="day">28</span>
                  <span className="month">Apr</span>
                </div>
                <div className="event-details">
                  <h4>National Championships</h4>
                  <p>Colombo Swimming Complex</p>
                </div>
              </div>
              <div className="event-item">
                <div className="event-date">
                  <span className="day">05</span>
                  <span className="month">May</span>
                </div>
                <div className="event-details">
                  <h4>Judges Training Workshop</h4>
                  <p>SLSBA Training Center</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminSidebar>
  );
};

export default AdminDashboard;