import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import '../styles/AddOrEditExpense.css';
import AdminSidebar from "../components/AdminSidebar";

const AddOrEditExpense = () => {
  const { id } = useParams();
  const navigate = useNavigate();
<<<<<<< HEAD
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
=======
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });

>>>>>>> cf00e0e27bb95d12f1c8c467c72a0fc52dc1f5e1

  const [form, setForm] = useState({
    tournamentName: "", 
    tournamentDate: "", 
    venueCosts: "", 
    staffPayments: "", 
    equipmentCosts: ""
  });

<<<<<<< HEAD
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
  
=======
  useEffect(() => {
    if (id) {
      fetchExpenseDetails();
    }
  }, [id]);
  const [adminTournaments, setAdminTournaments] = useState([]);

useEffect(() => {
  fetchAdminTournaments();
}, []);

const fetchAdminTournaments = async () => {
  try {
    const res = await axios.get("http://localhost:5001/api/tournaments/all");
    setAdminTournaments(res.data);
  } catch (error) {
    console.error("Error fetching tournaments:", error);
  }
};

  
  

  const fetchExpenseDetails = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`http://localhost:5001/api/expenses/${id}`);
      const expenseData = res.data;

      // Convert tournamentDate to "yyyy-MM-dd" for input type="date"
      const formattedDate = new Date(expenseData.tournamentDate)
        .toISOString()
        .split("T")[0];

      setForm({
        ...expenseData,
        tournamentDate: formattedDate,
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
>>>>>>> cf00e0e27bb95d12f1c8c467c72a0fc52dc1f5e1

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
<<<<<<< HEAD
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

=======
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
>>>>>>> cf00e0e27bb95d12f1c8c467c72a0fc52dc1f5e1

    setIsLoading(true);

    try {
      if (id) {
        await axios.put(`http://localhost:5001/api/expenses/update/${id}`, data);
<<<<<<< HEAD
        alert("Expense updated successfully");
      } else {
        await axios.post("http://localhost:5001/api/expenses/add", data);
        alert("Expense added successfully");
=======
        showNotification("Expense updated successfully");
      } else {
        await axios.post("http://localhost:5001/api/expenses/add", data);
        showNotification("Expense added successfully");
>>>>>>> cf00e0e27bb95d12f1c8c467c72a0fc52dc1f5e1
      }
      navigate("/admin/finance");
    } catch (error) {
      console.error("Error saving expense:", error);
<<<<<<< HEAD
      alert("Failed to save expense. Please try again.");
=======
      showNotification("Failed to save expense. Please try again.", "error");
    } finally {
>>>>>>> cf00e0e27bb95d12f1c8c467c72a0fc52dc1f5e1
      setIsLoading(false);
    }
  };

  return (
<<<<<<< HEAD
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
=======
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

        <div className="add-edit-expense-container card-container">
          <h2 className="section-title">
            {id ? "Edit Expense" : "Add New Expense"}
          </h2>
          <form onSubmit={handleSubmit} className="expense-form">
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
>>>>>>> cf00e0e27bb95d12f1c8c467c72a0fc52dc1f5e1
              {errors.tournamentName && (
                <div className="error-message">{errors.tournamentName}</div>
              )}
            </div>
<<<<<<< HEAD

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
=======
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
                <label htmlFor="venueCosts">Venue Costs</label>
                <input 
                  id="venueCosts"
                  type="number" 
                  name="venueCosts" 
                  value={form.venueCosts} 
                  onChange={handleChange} 
                  placeholder="Enter venue costs" 
                  min="0"
                  step="0.01"
                  className={`form-input ${errors.venueCosts ? 'is-invalid' : ''}`}
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
                  placeholder="Enter staff payments" 
                  min="0"
                  step="0.01"
                  className={`form-input ${errors.staffPayments ? 'is-invalid' : ''}`}
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
                  placeholder="Enter equipment costs" 
                  min="0"
                  step="0.01"
                  className={`form-input ${errors.equipmentCosts ? 'is-invalid' : ''}`}
                />
                {errors.equipmentCosts && (
                  <div className="error-message">{errors.equipmentCosts}</div>
                )}
              </div>
            </div>
            
            <div className="form-buttons">
              <button 
                type="submit" 
                className="submit-button"
                disabled={isLoading}
              >
                {isLoading ? "Saving..." : (id ? "Update Expense" : "Add Expense")}
              </button>
              <button 
                type="button" 
                className="cancel-button"
                onClick={() => navigate("/admin/finance")}
>>>>>>> cf00e0e27bb95d12f1c8c467c72a0fc52dc1f5e1
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
<<<<<<< HEAD
    </div>
=======
    </AdminSidebar>
>>>>>>> cf00e0e27bb95d12f1c8c467c72a0fc52dc1f5e1
  );
};

export default AddOrEditExpense;