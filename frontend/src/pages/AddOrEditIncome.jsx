import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import '../styles/AddOrEditIncome.css';
import AdminSidebar from "../components/AdminSidebar";

const AddOrEditIncome = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    tournamentName: "", 
    tournamentDate: "", 
    entryFees: "", 
    ticketSales: "", 
    sponsorships: ""
  });

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  useEffect(() => {
    if (id) {
      setIsLoading(true);
      axios.get(`http://localhost:5001/api/incomes/${id}`)
        .then(res => {
          const incomeData = res.data;
  
          // ✅ Format date
          const formattedDate = incomeData.incomeDate
            ? new Date(incomeData.incomeDate).toISOString().split("T")[0]
            : "";
  
          // ✅ Clean numeric fields from "$" if it accidentally exists
          const clean = (v) =>
            typeof v === "string" ? v.replace(/\$/g, "") : v;
  
          setForm({
            ...incomeData,
            incomeDate: formattedDate,
            entryFees: clean(incomeData.entryFees),
            ticketSales: clean(incomeData.ticketSales),
            sponsorships: clean(incomeData.sponsorships),
          });
  
          setIsLoading(false);
        })
        .catch(error => {
          console.error("Error fetching income details:", error);
          setIsLoading(false);
          alert("Failed to fetch income details");
        });
    }
  }, [id]);
  
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
        newErrors[field] = `${field.replace(/([A-Z])/g, ' $1')} must be non-negative`;
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
        await axios.put(`http://localhost:5001/api/incomes/update/${id}`, data);
        alert("Income updated successfully");
      } else {
        await axios.post("http://localhost:5001/api/incomes/add", data);
        alert("Income added successfully");
      }
      navigate("/admin/finance");
    } catch (error) {
      console.error("Error saving income:", error);
      alert("Failed to save income. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className={`admin-layout ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
      <AdminSidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />
      <div className="main-content">
        <div className="add-edit-income-container">
          <h2 className="page-title">
            {id ? "Edit" : "Add"} Income
          </h2>
          <form onSubmit={handleSubmit} className="income-form">
            <div className="form-group">
              <label htmlFor="tournamentName">Tournament Name</label>
              <input 
                id="tournamentName"
                name="tournamentName" 
                value={form.tournamentName} 
                onChange={handleChange} 
                placeholder="Enter tournament name" 
                className={`form-control ${errors.tournamentName ? 'is-invalid' : ''}`}
                required 
              />
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
              className="form-control"
            />
              {errors.tournamentDate && (
                <div className="error-message">{errors.tournamentDate}</div>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="entryFees">Entry Fees</label>
              <input 
                id="entryFees"
                type="number" 
                name="entryFees" 
                value={form.entryFees} 
                onChange={handleChange} 
                placeholder="Entry fees amount" 
                min="0"
                step="0.01"
                className={`form-control ${errors.entryFees ? 'is-invalid' : ''}`}
              />
              {errors.entryFees && (
                <div className="error-message">{errors.entryFees}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="ticketSales">Ticket Sales</label>
              <input 
                id="ticketSales"
                type="number" 
                name="ticketSales" 
                value={form.ticketSales} 
                onChange={handleChange} 
                placeholder="Ticket sales amount" 
                min="0"
                step="0.01"
                className={`form-control ${errors.ticketSales ? 'is-invalid' : ''}`}
              />
              {errors.ticketSales && (
                <div className="error-message">{errors.ticketSales}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="sponsorships">Sponsorships</label>
              <input 
                id="sponsorships"
                type="number" 
                name="sponsorships" 
                value={form.sponsorships} 
                onChange={handleChange} 
                placeholder="Sponsorship amount" 
                min="0"
                step="0.01"
                className={`form-control ${errors.sponsorships ? 'is-invalid' : ''}`}
              />
              {errors.sponsorships && (
                <div className="error-message">{errors.sponsorships}</div>
              )}
            </div>

            <div className="form-actions">
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={isLoading}
              >
                {isLoading ? "Saving..." : `${id ? "Update" : "Add"} Income`}
              </button>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => navigate("/")}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddOrEditIncome;