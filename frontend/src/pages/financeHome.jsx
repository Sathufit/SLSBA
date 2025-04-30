import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import '../styles/financialHome.css';
import AdminSidebar from "../components/AdminSidebar";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const FinancialHome = () => {
  const [incomes, setIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });
  const [searchQuery, setSearchQuery] = useState(""); // State for search query

  const navigate = useNavigate();
  const [pendingPayments, setPendingPayments] = useState([]);

  const fetchPendingPayments = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/tournaments/pending-payments`);
      setPendingPayments(response.data);
    } catch (error) {
      console.error("❌ Error fetching pending payments:", error.response?.data || error.message);
    }
  };
  
  

  useEffect(() => {
    fetchData();
    fetchPendingPayments();
    fetchFinanceRegistrations();
  }, []);

  const [financeRegistrations, setFinanceRegistrations] = useState([]);

    const fetchFinanceRegistrations = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/finance/registrations`);
        setFinanceRegistrations(response.data);
      } catch (error) {
        console.error("❌ Error fetching finance registrations:", error);
      }
    };



  const fetchData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([fetchIncomes(), fetchExpenses()]);
    } catch (error) {
      showNotification("Failed to load data", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchIncomes = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/incomes`);
      setIncomes(res.data);
      return res.data;
    } catch (err) {
      console.error("Error fetching incomes:", err);
      throw err;
    }
  };
  const [selectedTournament, setSelectedTournament] = useState("");
  const [recordType, setRecordType] = useState("both"); // 'income', 'expense', or 'both'
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const onSubmit = () => {
    handleGenerateReport({ selectedTournament, recordType, startDate, endDate });
  };

  const fetchExpenses = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/expenses`);
      setExpenses(res.data);
      return res.data;
    } catch (err) {
      console.error("Error fetching expenses:", err);
      throw err;
    }
  };

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "" });
    }, 3000);
  };

  const handleDelete = async (id, type) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    
    const url = type === "income"
      ? `${BASE_URL}/api/incomes/delete/${id}`
      : `${BASE_URL}/api/expenses/delete/${id}`;
      
    try {
      await axios.delete(url);
      showNotification(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully`);
      
      if (type === "income") {
        await fetchIncomes();
      } else {
        await fetchExpenses();
      }
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
      showNotification(`Failed to delete ${type}`, "error");
    }
  };
  const handleGenerateReport = async (filters) => {
    const { selectedTournament, recordType, startDate, endDate } = filters;
  
    setIsLoading(true);
  
    try {
      // Only send startDate and endDate to backend
      const payload = {
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
        ...(selectedTournament && { selectedTournament }), // ✅ Include tournament
        ...(recordType && { recordType }), // ✅ Include recordType (income/expense/both)
      };
      
  
      const response = await axios.post(
        `${BASE_URL}/api/finance/report/pdf`,
        payload,
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
      const filename = `Financial_Report_${new Date().toISOString().split("T")[0]}.pdf`;
  
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
  
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
  
      showNotification("✅ Report generated successfully!", "success");
    } catch (error) {
      console.error("❌ Error generating report:", error);
      showNotification("❌ Failed to generate report.", "error");
    } finally {
      setIsLoading(false);
    }
  };
  // Combine all tournaments from incomes and expenses
  const tournamentOptions = [...new Set([
  ...incomes.map(item => item.tournamentName),
  ...expenses.map(item => item.tournamentName)
  ].filter(Boolean))];

  // Function to format date strings
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Calculate summary data
  const totalIncome = incomes.reduce((sum, item) => sum + (item.totalIncome || 0), 0);
  const totalExpense = expenses.reduce((sum, item) => sum + (item.totalExpense || 0), 0);
  const balance = totalIncome - totalExpense;

  const [activeTab, setActiveTab] = useState("records");

  const approvePayment = async (paymentId) => {
    try {
      const response = await axios.put(`${BASE_URL}/api/tournaments/approve-payment/${paymentId}`);
      if (response.status === 200) {
        showNotification("✅ Payment approved successfully!", "success");

        // Update the state for pendingPayments
        setPendingPayments((prev) =>
          prev.map((payment) =>
            payment._id === paymentId ? { ...payment, paymentStatus: "Paid" } : payment
          )
        );

        // Update the state for financeRegistrations
        setFinanceRegistrations((prev) =>
          prev.map((reg) =>
            reg._id === paymentId ? { ...reg, paymentStatus: "Paid" } : reg
          )
        );
      } else {
        showNotification("❌ Failed to approve payment.", "error");
      }
    } catch (error) {
      console.error("❌ Error approving payment:", error.response?.data || error.message);
      showNotification("❌ Error approving payment.", "error");
    }
  };

  // Filter incomes and expenses based on the search query
  const filteredIncomes = incomes.filter((income) =>
    income.tournamentName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredExpenses = expenses.filter((expense) =>
    expense.tournamentName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminSidebar>
      <div className="finance-content-wrapper">
        {notification.show && (
          <div className={`notification ${notification.type}`}>
            {notification.message}
          </div>
        )}
        
        {/* Header with search and profile */}
        <div className="admin-header">
          <div className="admin-actions">
            <div className="date-display">
              {new Date().toLocaleDateString(undefined, {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
            <div className="notification-icon">
              <span className="notification-badge">2</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
            </div>
            <div className="admin-profile">
              <div className="profile-avatar">A</div>
              <span className="profile-name">Admin</span>
            </div>
          </div>
        </div>

        {/* Finance Management Title */}
        <div className="finance-management-header">
          <h2>Finance Management</h2>
          <p>Manage income and expense records</p>
          
          <div className="search-refresh-container">
            <div className="finance-search">
              <input type="text" placeholder="Search..." />
            </div>
            <button className="refresh-button" onClick={fetchData}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 4v6h-6"></path>
                <path d="M1 20v-6h6"></path>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10"></path>
                <path d="M20.49 15a9 9 0 0 1-14.85 3.36L1 14"></path>
              </svg>
              Refresh
            </button>
          </div>
        </div>
        <div className="finance-report-filter">
        <div className="filter-group">
          <label htmlFor="tournamentName">Tournament Name</label>
          <select
            id="tournamentName"
            value={selectedTournament}
            onChange={(e) => setSelectedTournament(e.target.value)}
          >
            <option value="">All Tournaments</option>
            {[...new Set([
              ...incomes.map(item => item.tournamentName),
              ...expenses.map(item => item.tournamentName)
            ].filter(Boolean))].map((tournamentName, index) => (
              <option key={index} value={tournamentName}>
                {tournamentName}
              </option>
            ))}
          </select>
        </div>
      <div className="filter-group">
        <label htmlFor="recordType">Record Type</label>
        <select
          id="recordType"
          value={recordType}
          onChange={(e) => setRecordType(e.target.value)}
        >
          <option value="both">Income + Expense</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="startDate">Start Date</label>
        <input
          type="date"
          id="startDate"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
      </div>

      <div className="filter-group">
        <label htmlFor="endDate">End Date</label>
        <input
          type="date"
          id="endDate"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>

      <button className="generate-btn" onClick={onSubmit}>
        Generate Report
      </button>
    </div>

        {/* Statistics Cards */}
        <div className="finance-stats">
          <div className="stat-card">
            <div className="stat-icon-wrapper income">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
            </div>
            <div className="stat-content">
              <h3>Rs.{totalIncome.toLocaleString()}</h3>
              <p>Total Income</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon-wrapper expense">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
            </div>
            <div className="stat-content">
              <h3>Rs.{totalExpense.toLocaleString()}</h3>
              <p>Total Expenses</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon-wrapper balance">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
              </svg>
            </div>
            <div className="stat-content">
              <h3>Rs.{balance.toLocaleString()}</h3>
              <p>Current Balance</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon-wrapper records">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="12" y1="18" x2="12" y2="12"></line>
                <line x1="9" y1="15" x2="15" y2="15"></line>
              </svg>
            </div>
            <div className="stat-content">
              <h3>{incomes.length + expenses.length}</h3>
              <p>Total Records</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button className="action-button primary" onClick={() => navigate("/admin/finance/add-income")}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Add Income
          </button>
          <button className="action-button secondary" onClick={() => navigate("/admin/finance/add-expense")}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Add Expense
          </button>
        </div>

        {/* Tabs */}
        <div className="tabs-container">
          <button 
            className={`tab-button ${activeTab === "records" ? "active" : ""}`} 
            onClick={() => setActiveTab("records")}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            Financial Records
          </button>
          <button 
            className={`tab-button ${activeTab === "submissions" ? "active" : ""}`} 
            onClick={() => setActiveTab("submissions")}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
            </svg>
            Budget Requests
          </button>
          <button 
            className={`tab-button ${activeTab === "payments" ? "active" : ""}`} 
            onClick={() => setActiveTab("payments")}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
            </svg>
            All Payment Submissions
          </button>
        </div>

        {/* Income Records Section */}
        <div className="finance-section card-container">
          <div className="panel-header">
            <div className="panel-title">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 3v18h18"></path>
                <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"></path>
              </svg>
              <h2>Income Records</h2>
            </div>
            <div className="counter">{filteredIncomes.length} items</div>
          </div>
          
          {isLoading ? (
            <div className="loading-container">
              <div className="loader"></div>
              <p>Loading income records...</p>
            </div>
          ) : filteredIncomes.length === 0 ? (
            <div className="empty-state">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="12" y1="18" x2="12" y2="12"></line>
                <line x1="9" y1="15" x2="15" y2="15"></line>
              </svg>
              <p>No income records available</p>
              <button 
                className="empty-state-action" 
                onClick={() => navigate("/admin/finance/add-income")}
              >
                Add your first income record
              </button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="financial-table">
                <thead>
                  <tr>
                    <th>Tournament Name</th>
                    <th>Date</th>
                    <th>Entry Fees</th>
                    <th>Ticket Sales</th>
                    <th>Sponsorships</th>
                    <th>Total</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredIncomes.map((income) => (
                    <tr key={income._id}>
                      <td className="tournament-name">{income.tournamentName}</td>
                      <td>{formatDate(income.tournamentDate)}</td>
                      <td>Rs.{(income.entryFees || 0).toLocaleString()}</td>
                      <td>Rs.{(income.ticketSales || 0).toLocaleString()}</td>
                      <td>Rs.{(income.sponsorships || 0).toLocaleString()}</td>
                      <td className="total-column">Rs.{income.totalIncome.toLocaleString()}</td>
                      <td className="action-cell">
                        <button
                          className="edit-btn"
                          onClick={() => navigate(`/admin/finance/edit-income/${income._id}`)}
                          title="Edit"
                        >
                           Edit
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => handleDelete(income._id, "income")}
                          title="Delete"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Expense Records Section */}
        <div className="finance-section card-container">
          <div className="panel-header">
            <div className="panel-title">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 3v18h18"></path>
                <path d="M13 17h.01"></path>
                <path d="M13 10h.01"></path>
                <path d="M20 17h.01"></path>
                <path d="M20 10h.01"></path>
                <path d="M6 17h.01"></path>
                <path d="M6 10h.01"></path>
              </svg>
              <h2>Expense Records</h2>
            </div>
            <div className="counter">{filteredExpenses.length} items</div>
          </div>
          
          {isLoading ? (
            <div className="loading-container">
              <div className="loader"></div>
              <p>Loading expense records...</p>
            </div>
          ) : filteredExpenses.length === 0 ? (
            <div className="empty-state">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="12" y1="18" x2="12" y2="12"></line>
                <line x1="9" y1="15" x2="15" y2="15"></line>
              </svg>
              <p>No expense records available</p>
              <button 
                className="empty-state-action" 
                onClick={() => navigate("/admin/finance/add-expense")}
              >
                Add your first expense record
              </button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="financial-table">
                <thead>
                  <tr>
                    <th>Tournament Name</th>
                    <th>Date</th>
                    <th>Venue Costs</th>
                    <th>Staff Payments</th>
                    <th>Equipment Costs</th>
                    <th>Total</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExpenses.map((expense) => (
                    <tr key={expense._id}>
                      <td className="tournament-name">{expense.tournamentName}</td>
                      <td>{formatDate(expense.tournamentDate)}</td>
                      <td>Rs.{(expense.venueCosts || 0).toLocaleString()}</td>
                      <td>Rs.{(expense.staffPayments || 0).toLocaleString()}</td>
                      <td>Rs.{(expense.equipmentCosts || 0).toLocaleString()}</td>
                      <td className="total-column">Rs.{expense.totalExpense.toLocaleString()}</td>
                      <td className="action-cell">
                        <button
                          className="edit-btn"
                          onClick={() => navigate(`/admin/finance/edit-expense/${expense._id}`)}
                          title="Edit"
                        >
                          Edit
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => handleDelete(expense._id, "expense")}
                          title="Delete"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        {activeTab === "payments" && (
          <div className="finance-section card-container">
            <div className="panel-header">
              <h2>All Payment Submissions</h2>
              <div className="counter">{financeRegistrations.length} items</div>
            </div>

            {isLoading ? (
              <div className="loading-container">
                <div className="loader"></div>
                <p>Loading...</p>
              </div>
            ) : financeRegistrations.length === 0 ? (
              <div className="empty-state">
                <p>No payment submissions found.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="financial-table">
                  <thead>
                    <tr>
                      <th>School Name</th>
                      <th>Email</th>
                      <th>Tournament</th>
                      <th>Players</th>
                      <th>Payment</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {financeRegistrations.map((reg) => (
                      <tr key={reg._id}>
                        <td>{reg.schoolName}</td>
                        <td>{reg.email}</td>
                        <td>{reg.tournament?.tournamentName || "-"}</td>
                        <td>{reg.players?.length}</td>
                        <td>
                          {reg.paymentFile ? (
                              <a
                              href={`${BASE_URL}/uploads/${reg.paymentFile}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="view-file-link"
                            >
                              View Upload
                            </a>
                          ) : (
                            "No Upload"
                          )}
                        </td>
                        <td>
                          <span
                            className={`status-badge ${
                              reg.paymentStatus?.toLowerCase() || "unknown"
                            }`}
                          >
                            {reg.paymentStatus || "Unknown"}
                          </span>
                        </td>
                        <td>
                        <button
                          className="approve-btn"
                          disabled={reg.paymentStatus === "Paid"}
                          onClick={() => approvePayment(reg._id)}
                        >
                          {reg.paymentStatus === "Paid" ? "Approved" : "Approve"}
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
};

export default FinancialHome;