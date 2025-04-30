import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import '../styles/AddOrEditExpense.css';
import AdminSidebar from "../components/AdminSidebar";
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const AddOrEditExpense = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });

  const [form, setForm] = useState({
    tournamentId: "",
    tournamentDate: "",
    venueCosts: "",
    staffPayments: "",
    equipmentCosts: ""
  });

  const [adminTournaments, setAdminTournaments] = useState([]);

  useEffect(() => {
    fetchAdminTournaments();
    
    if (id) {
      fetchExpenseDetails();
    }
  }, [id]);

  const fetchAdminTournaments = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/tournaments/all`);
      setAdminTournaments(res.data);
    } catch (error) {
      console.error("Error fetching tournaments:", error);
      showNotification("Failed to fetch tournaments", "error");
    }
  };

  const fetchExpenseDetails = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/expenses/${id}`);
      const expenseData = res.data;
  
      // Format date properly
      const formattedDate = expenseData.tournamentDate
        ? new Date(expenseData.tournamentDate).toISOString().split("T")[0]
        : "";
  
      // Find matching tournament by name
      const matchingTournament = adminTournaments.find(
        t => t.tournamentName === expenseData.tournamentName
      );
  
      // Clean currency values
      const clean = (v) =>
        typeof v === "string" ? v.replace(/\$/g, "") : v?.toString() || "";
  
      setForm({
        tournamentId: matchingTournament?._id || "",
        tournamentDate: formattedDate,
        venueCosts: clean(expenseData.venueCosts),
        staffPayments: clean(expenseData.staffPayments),
        equipmentCosts: clean(expenseData.equipmentCosts)
      });
    } catch (error) {
      console.error("Error fetching expense details:", error);
      showNotification("Failed to fetch expense details", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "" });
    }, 3000);
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!form.tournamentId.trim()) {
      newErrors.tournamentId = "Tournament selection is required";
    }

    if (!form.tournamentDate) {
      newErrors.tournamentDate = "Tournament date is required";
    }

    // Validate numeric fields (ensure non-negative)
    const numericFields = ['venueCosts', 'staffPayments', 'equipmentCosts'];
    numericFields.forEach(field => {
      if (form[field] && parseFloat(form[field]) < 0) {
        newErrors[field] = `${field.replace(/([A-Z])/g, ' $1').charAt(0).toUpperCase() + field.replace(/([A-Z])/g, ' $1').slice(1)} must be non-negative`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prevForm => ({
      ...prevForm, 
      [name]: value
    }));

    // Clear specific field error when user starts typing
    if (errors[name]) {
      setErrors(prevErrors => {
        const newErrors = {...prevErrors};
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    const venueCosts = parseFloat(form.venueCosts || 0);
    const staffPayments = parseFloat(form.staffPayments || 0);
    const equipmentCosts = parseFloat(form.equipmentCosts || 0);
    const totalExpense = venueCosts + staffPayments + equipmentCosts;
    
    // Get tournament name from selected tournament ID
    const selectedTournament = adminTournaments.find(t => t._id === form.tournamentId);

    const data = {
      tournamentId: form.tournamentId,
      tournamentName: selectedTournament?.tournamentName || "",
      tournamentDate: form.tournamentDate,
      venueCosts,
      staffPayments,
      equipmentCosts,
      totalExpense
    };

    setIsLoading(true);

    try {
      if (id) {
        await axios.put(`${BASE_URL}/api/expenses/update/${id}`, data);
        showNotification("Expense updated successfully");
      } else {
        await axios.post(`${BASE_URL}/api/expenses/add`, data);
        showNotification("Expense added successfully");
      }
      navigate("/admin/finance");
    } catch (error) {
      console.error("Error saving expense:", error);
      showNotification("Failed to save expense. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
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
          <h1>Finance Management</h1>
          <div className="admin-actions">
            <div className="search-container">
              <input type="text" placeholder="Search..." className="search-input" />
              <button className="search-button">
                <i className="fas fa-search"></i>
              </button>
            </div>
            <button className="refresh-button" onClick={() => window.location.reload()}>
              <i className="fas fa-sync-alt"></i> Refresh
            </button>
            <div className="admin-profile">
              <span>Admin</span>
              <div className="profile-avatar">A</div>
            </div>
          </div>
        </div>

        <div className="add-edit-expense-container">
          <div className="page-header">
            <h2 className="section-title">
              {id ? "Edit Expense Record" : "Add New Expense Record"}
            </h2>
            <button 
              className="back-button"
              onClick={() => navigate("/admin/finance")}
            >
              <i className="fas fa-arrow-left"></i> Back to Finance
            </button>
          </div>
          
          <div className="card-container">
            <form onSubmit={handleSubmit} className="expense-form">
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="tournamentId">Tournament Name</label>
                  <select
                    id="tournamentId"
                    name="tournamentId"
                    value={form.tournamentId}
                    onChange={handleChange}
                    className={`form-input ${errors.tournamentId ? 'is-invalid' : ''}`}
                    required
                  >
                    <option value="">Select a tournament</option>
                    {adminTournaments.map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.tournamentName}
                      </option>
                    ))}
                  </select>
                  {errors.tournamentId && (
                    <div className="error-message">{errors.tournamentId}</div>
                  )}
                </div>
                
                <div className="form-group">
                  <label htmlFor="tournamentDate">Tournament Date</label>
                  <input
                    id="tournamentDate"
                    type="date"
                    name="tournamentDate"
                    value={form.tournamentDate}
                    onChange={handleChange}
                    className={`form-input ${errors.tournamentDate ? 'is-invalid' : ''}`}
                    required
                  />
                  {errors.tournamentDate && (
                    <div className="error-message">{errors.tournamentDate}</div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="venueCosts">Venue Costs (Rs.)</label>
                  <div className="input-with-icon">
                    <span className="currency-icon">Rs.</span>
                    <input 
                      id="venueCosts"
                      type="number" 
                      name="venueCosts" 
                      value={form.venueCosts} 
                      onChange={handleChange} 
                      placeholder="0.00" 
                      min="0"
                      step="0.01"
                      className={`form-input with-icon ${errors.venueCosts ? 'is-invalid' : ''}`}
                    />
                  </div>
                  {errors.venueCosts && (
                    <div className="error-message">{errors.venueCosts}</div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="staffPayments">Staff Payments (Rs.)</label>
                  <div className="input-with-icon">
                    <span className="currency-icon">Rs.</span>
                    <input 
                      id="staffPayments"
                      type="number" 
                      name="staffPayments" 
                      value={form.staffPayments} 
                      onChange={handleChange} 
                      placeholder="0.00" 
                      min="0"
                      step="0.01"
                      className={`form-input with-icon ${errors.staffPayments ? 'is-invalid' : ''}`}
                    />
                  </div>
                  {errors.staffPayments && (
                    <div className="error-message">{errors.staffPayments}</div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="equipmentCosts">Equipment Costs (Rs.)</label>
                  <div className="input-with-icon">
                    <span className="currency-icon">Rs.</span>
                    <input 
                      id="equipmentCosts"
                      type="number" 
                      name="equipmentCosts" 
                      value={form.equipmentCosts} 
                      onChange={handleChange} 
                      placeholder="0.00" 
                      min="0"
                      step="0.01"
                      className={`form-input with-icon ${errors.equipmentCosts ? 'is-invalid' : ''}`}
                    />
                  </div>
                  {errors.equipmentCosts && (
                    <div className="error-message">{errors.equipmentCosts}</div>
                  )}
                </div>
                
                <div className="form-group total-expense">
                  <label>Total Expense (Rs.)</label>
                  <div className="calculated-total">
                  Rs.{(
                      parseFloat(form.venueCosts || 0) +
                      parseFloat(form.staffPayments || 0) +
                      parseFloat(form.equipmentCosts || 0)
                    ).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              <div className="form-buttons">
                <button 
                  type="submit" 
                  className="submit-button"
                  disabled={isLoading}
                >
                  {isLoading ? 
                    <>
                      <i className="fas fa-spinner fa-spin"></i> {id ? "Updating..." : "Saving..."}
                    </> : 
                    (id ? "Update Expense Record" : "Add Expense Record")}
                </button>
                <button 
                  type="button" 
                  className="cancel-button"
                  onClick={() => navigate("/admin/finance")}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AdminSidebar>
  );
};

export default AddOrEditExpense;