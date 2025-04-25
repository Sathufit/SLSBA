import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import '../styles/financialHome.css';
import AdminSidebar from "../components/AdminSidebar";
const BASE_URL = import.meta.env.VITE_API_BASE_URL;


const FinancialHome = () => {
  const [incomes, setIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

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
      
      // Refresh data instead of reloading page
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

  // Function to format date strings
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Calculate summary data
  const totalIncome = incomes.reduce((sum, item) => sum + (item.totalIncome || 0), 0);
  const totalExpense = expenses.reduce((sum, item) => sum + (item.totalExpense || 0), 0);
  const balance = totalIncome - totalExpense;

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
            <div className="stat-icon income-icon"></div>
            <div className="stat-content">
              <h3>${totalIncome.toLocaleString()}</h3>
              <p>Total Income</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon expense-icon"></div>
            <div className="stat-content">
              <h3>${totalExpense.toLocaleString()}</h3>
              <p>Total Expenses</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon balance-icon"></div>
            <div className="stat-content">
              <h3>${balance.toLocaleString()}</h3>
              <p>Current Balance</p>
            </div>
          </div>
        </div>

        <div className="financial-management-container">
          <h2 className="section-title">Financial Management</h2>
          <div className="action-buttons">
            <button 
              className="submit-button1" 
              onClick={() => navigate("/admin/finance/add-income")}
            >
              ➕ Add Income
            </button>

            <button 
              className="submit-button1 secondary" 
              onClick={() => navigate("/admin/finance/add-expense")}
            >
              ➕ Add Expense
            </button>
          </div>

          <div className="tabs-container">
            <button className="tab-button active">Financial Records</button>
          </div>

          <div className="financial-section card-container">
            <div className="panel-header">
              <h2>Income Records</h2>
              <div className="counter">{incomes.length} items</div>
            </div>
            {isLoading ? (
              <div className="loading-container">
                <div className="loader"></div>
                <p>Loading incomes...</p>
              </div>
            ) : incomes.length === 0 ? (
              <div className="empty-state">
                <p>No income records available.</p>
                <p>Add your first income using the 'Add Income' button above.</p>
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
                    {incomes.map((income) => (
                      <tr key={income._id}>
                        <td>{income.tournamentName}</td>
                        <td>{formatDate(income.tournamentDate)}</td>
                        <td>${(income.entryFees || 0).toLocaleString()}</td>
                        <td>${(income.ticketSales || 0).toLocaleString()}</td>
                        <td>${(income.sponsorships || 0).toLocaleString()}</td>
                        <td className="total-column">${income.totalIncome.toLocaleString()}</td>
                        <td className="action-cell">
                          <button 
                            className="edit-btn" 
                            onClick={() => navigate(`/admin/finance/edit-income/${income._id}`)}
                          >
                            Edit
                          </button>
                          <button 
                            className="delete-btn" 
                            onClick={() => handleDelete(income._id, "income")}
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

          <div className="financial-section card-container">
            <div className="panel-header">
              <h2>Expense Records</h2>
              <div className="counter">{expenses.length} items</div>
            </div>
            {isLoading ? (
              <div className="loading-container">
                <div className="loader"></div>
                <p>Loading expenses...</p>
              </div>
            ) : expenses.length === 0 ? (
              <div className="empty-state">
                <p>No expense records available.</p>
                <p>Add your first expense using the 'Add Expense' button above.</p>
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
                    {expenses.map((expense) => (
                      <tr key={expense._id}>
                        <td>{expense.tournamentName}</td>
                        <td>{formatDate(expense.tournamentDate)}</td>
                        <td>${(expense.venueCosts || 0).toLocaleString()}</td>
                        <td>${(expense.staffPayments || 0).toLocaleString()}</td>
                        <td>${(expense.equipmentCosts || 0).toLocaleString()}</td>
                        <td className="total-column">${expense.totalExpense.toLocaleString()}</td>
                        <td className="action-cell">
                          <button 
                            className="edit-btn" 
                            onClick={() => navigate(`/admin/finance/edit-expense/${expense._id}`)}
                          >
                            Edit
                          </button>
                          <button 
                            className="delete-btn" 
                            onClick={() => handleDelete(expense._id, "expense")}
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
        </div>
      </div>
    </AdminSidebar>
  );
};

export default FinancialHome;