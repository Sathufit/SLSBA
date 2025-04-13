import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import '../styles/AddOrEditExpense.css';
import AdminSidebar from "../components/AdminSidebar";

const AddOrEditExpense = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    tournamentName: "", 
    tournamentDate: "", 
    venueCosts: "", 
    staffPayments: "", 
    equipmentCosts: ""
  });

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  useEffect(() => {
    if (id) {
      setIsLoading(true);
      axios.get(`http://localhost:5001/api/expenses/${id}`)
        .then(res => {
          const expenseData = res.data;
  
          // Convert tournamentDate to "yyyy-MM-dd" for input type="date"
          const formattedDate = new Date(expenseData.tournamentDate)
            .toISOString()
            .split("T")[0];
  
          setForm({
            ...expenseData,
            tournamentDate: formattedDate,
          });
  
          setIsLoading(false);
        })
        .catch(error => {
          console.error("Error fetching expense details:", error);
          setIsLoading(false);
          alert("Failed to fetch expense details");
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
    const numericFields = ['venueCosts', 'staffPayments', 'equipmentCosts'];
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

    const venueCosts = parseFloat(form.venueCosts || 0);
const staffPayments = parseFloat(form.staffPayments || 0);
const equipmentCosts = parseFloat(form.equipmentCosts || 0);
const totalExpense = venueCosts + staffPayments + equipmentCosts;

const data = {
  tournamentName: form.tournamentName,
  tournamentDate: form.tournamentDate,
  venueCosts,
  staffPayments,
  equipmentCosts,
  totalExpense,
};


    setIsLoading(true);

    try {
      if (id) {
        await axios.put(`http://localhost:5001/api/expenses/update/${id}`, data);
        alert("Expense updated successfully");
      } else {
        await axios.post("http://localhost:5001/api/expenses/add", data);
        alert("Expense added successfully");
      }
      navigate("/admin/finance");
    } catch (error) {
      console.error("Error saving expense:", error);
      alert("Failed to save expense. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className={`admin-layout ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
      <AdminSidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />
      <div className="main-content">
        <div className="add-edit-expense-container">
          <h2 className="page-title">
            {id ? "Edit" : "Add"} Expense
          </h2>
          <form onSubmit={handleSubmit} className="expense-form">
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
                className={`form-control ${errors.tournamentDate ? 'is-invalid' : ''}`}
                required 
              />
              {errors.tournamentDate && (
                <div className="error-message">{errors.tournamentDate}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="venueCosts">Venue Costs</label>
              <input 
                id="venueCosts"
                type="number" 
                name="venueCosts" 
                value={form.venueCosts} 
                onChange={handleChange} 
                placeholder="Venue costs amount" 
                min="0"
                step="0.01"
                className={`form-control ${errors.venueCosts ? 'is-invalid' : ''}`}
              />
              {errors.venueCosts && (
                <div className="error-message">{errors.venueCosts}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="staffPayments">Staff Payments</label>
              <input 
                id="staffPayments"
                type="number" 
                name="staffPayments" 
                value={form.staffPayments} 
                onChange={handleChange} 
                placeholder="Staff payments amount" 
                min="0"
                step="0.01"
                className={`form-control ${errors.staffPayments ? 'is-invalid' : ''}`}
              />
              {errors.staffPayments && (
                <div className="error-message">{errors.staffPayments}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="equipmentCosts">Equipment Costs</label>
              <input 
                id="equipmentCosts"
                type="number" 
                name="equipmentCosts" 
                value={form.equipmentCosts} 
                onChange={handleChange} 
                placeholder="Equipment costs amount" 
                min="0"
                step="0.01"
                className={`form-control ${errors.equipmentCosts ? 'is-invalid' : ''}`}
              />
              {errors.equipmentCosts && (
                <div className="error-message">{errors.equipmentCosts}</div>
              )}
            </div>

            <div className="form-actions">
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={isLoading}
              >
                {isLoading ? "Saving..." : `${id ? "Update" : "Add"} Expense`}
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

export default AddOrEditExpense;