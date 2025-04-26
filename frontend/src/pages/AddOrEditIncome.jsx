import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import '../styles/AddOrEditIncome.css';
import AdminSidebar from "../components/AdminSidebar";
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const AddOrEditIncome = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });

  const [form, setForm] = useState({
    tournamentName: "", 
    tournamentDate: "", 
    entryFees: "", 
    ticketSales: "", 
    sponsorships: ""
  });

  const [adminTournaments, setAdminTournaments] = useState([]);

  useEffect(() => {
    if (id) {
      fetchIncomeDetails();
    }
    fetchAdminTournaments();
  }, [id]);

  const fetchAdminTournaments = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/tournaments/all`);
      setAdminTournaments(res.data);
    } catch (error) {
      console.error("Error fetching tournaments:", error);
    }
  };

  const fetchIncomeDetails = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/incomes/${id}`);
      const incomeData = res.data;
  
      const formattedDate = incomeData.tournamentDate
        ? new Date(incomeData.tournamentDate).toISOString().split("T")[0]
        : "";
  
      const clean = (v) =>
        typeof v === "string" ? v.replace(/\$/g, "") : v;
  
      setForm({
        tournamentName: incomeData.tournamentName || "",
        tournamentDate: formattedDate,
        entryFees: clean(incomeData.entryFees),
        ticketSales: clean(incomeData.ticketSales),
        sponsorships: clean(incomeData.sponsorships),
      });
    } catch (error) {
      console.error("Error fetching income details:", error);
      showNotification("Failed to fetch income details", "error");
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
    
    if (!form.tournamentName.trim()) {
      newErrors.tournamentName = "Tournament name is required";
    }

    if (!form.tournamentDate) {
      newErrors.tournamentDate = "Tournament date is required";
    }

    // Validate numeric fields (ensure non-negative)
    const numericFields = ['entryFees', 'ticketSales', 'sponsorships'];
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

    const totalIncome =
      parseFloat(form.entryFees || 0) +
      parseFloat(form.ticketSales || 0) +
      parseFloat(form.sponsorships || 0);

    const data = { ...form, totalIncome };

    setIsLoading(true);

    try {
      if (id) {
        await axios.put(`${BASE_URL}/api/incomes/update/${id}`, data);
        showNotification("Income updated successfully");
      } else {
        await axios.post(`${BASE_URL}/api/incomes/add`, data);
        showNotification("Income added successfully");
      }
      navigate("/admin/finance");
    } catch (error) {
      console.error("Error saving income:", error);
      showNotification("Failed to save income. Please try again.", "error");
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

        <div className="add-edit-income-container">
          <div className="page-header">
            <h2 className="section-title">
              {id ? "Edit Income Record" : "Add New Income Record"}
            </h2>
            <button 
              className="back-button"
              onClick={() => navigate("/admin/finance")}
            >
              <i className="fas fa-arrow-left"></i> Back to Finance
            </button>
          </div>
          
          <div className="card-container">
            <form onSubmit={handleSubmit} className="income-form">
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="tournamentName">Tournament Name</label>
                  <select
                    id="tournamentName"
                    name="tournamentName"
                    value={form.tournamentName}
                    onChange={handleChange}
                    className={`form-input ${errors.tournamentName ? 'is-invalid' : ''}`}
                    required
                  >
                    <option value="">Select a tournament</option>
                    {adminTournaments.map((t) => (
                      <option key={t._id} value={t.tournamentName}>
                        {t.tournamentName}
                      </option>
                    ))}
                  </select>
                  {errors.tournamentName && (
                    <div className="error-message">{errors.tournamentName}</div>
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
                  <label htmlFor="entryFees">Entry Fees ($)</label>
                  <div className="input-with-icon">
                    <span className="currency-icon">$</span>
                    <input 
                      id="entryFees"
                      type="number" 
                      name="entryFees" 
                      value={form.entryFees} 
                      onChange={handleChange} 
                      placeholder="0.00" 
                      min="0"
                      step="0.01"
                      className={`form-input with-icon ${errors.entryFees ? 'is-invalid' : ''}`}
                    />
                  </div>
                  {errors.entryFees && (
                    <div className="error-message">{errors.entryFees}</div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="ticketSales">Ticket Sales ($)</label>
                  <div className="input-with-icon">
                    <span className="currency-icon">$</span>
                    <input 
                      id="ticketSales"
                      type="number" 
                      name="ticketSales" 
                      value={form.ticketSales} 
                      onChange={handleChange} 
                      placeholder="0.00" 
                      min="0"
                      step="0.01"
                      className={`form-input with-icon ${errors.ticketSales ? 'is-invalid' : ''}`}
                    />
                  </div>
                  {errors.ticketSales && (
                    <div className="error-message">{errors.ticketSales}</div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="sponsorships">Sponsorships ($)</label>
                  <div className="input-with-icon">
                    <span className="currency-icon">$</span>
                    <input 
                      id="sponsorships"
                      type="number" 
                      name="sponsorships" 
                      value={form.sponsorships} 
                      onChange={handleChange} 
                      placeholder="0.00" 
                      min="0"
                      step="0.01"
                      className={`form-input with-icon ${errors.sponsorships ? 'is-invalid' : ''}`}
                    />
                  </div>
                  {errors.sponsorships && (
                    <div className="error-message">{errors.sponsorships}</div>
                  )}
                </div>
                
                <div className="form-group total-income">
                  <label>Total Income ($)</label>
                  <div className="calculated-total">
                    ${(
                      parseFloat(form.entryFees || 0) +
                      parseFloat(form.ticketSales || 0) +
                      parseFloat(form.sponsorships || 0)
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
                    (id ? "Update Income Record" : "Add Income Record")}
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

export default AddOrEditIncome;