import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import '../styles/financialHome.css';
import AdminSidebar from "../components/AdminSidebar";

const Home = () => {
  const [incomes, setIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    axios.get("http://localhost:5001/api/incomes").then((res) => setIncomes(res.data));
    axios.get("http://localhost:5001/api/expenses").then((res) => setExpenses(res.data));
  }, []);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleDelete = async (id, type) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    const url =
      type === "income"
        ? `http://localhost:5001/api/incomes/delete/${id}`
        : `http://localhost:5001/api/expenses/delete/${id}`;
    
    try {
      await axios.delete(url);
      alert("Deleted successfully");
      window.location.reload();
    } catch (error) {
      console.error("Error deleting record:", error);
      alert("Failed to delete record");
    }
  };

  return (
    <div className={`admin-layout ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
      <AdminSidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />
      <div className="main-content">
        <div className="financial-management-container">
          <h1 className="page-title">Financial Management</h1>
          <div className="action-buttons">
          <button 
            className="btn btn-primary" 
            onClick={() => navigate("/admin/finance/add-income")}
          >
            ➕ Add Income
          </button>

          <button 
            className="btn btn-secondary" 
            onClick={() => navigate("/admin/finance/add-expense")}
          >
            ➕ Add Expense
          </button>

          </div>

          <div className="financial-section">
            <h2 className="section-title">Incomes</h2>
            <div className="table-responsive">
              <table className="financial-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Date</th>
                    <th>Total</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {incomes.map((i) => (
                    <tr key={i._id}>
                      <td>{i.tournamentName}</td>
                      <td>{new Date(i.tournamentDate).toLocaleDateString()}</td>
                      <td>${i.totalIncome.toLocaleString()}</td>
                      <td className="action-cell">
                      <Link to={`/admin/finance/edit-income/${i._id}`} className="btn btn-edit">
                        Edit
                      </Link>
                        <button 
                          onClick={() => handleDelete(i._id, "income")} 
                          className="btn btn-delete"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="financial-section">
            <h2 className="section-title">Expenses</h2>
            <div className="table-responsive">
              <table className="financial-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Date</th>
                    <th>Total</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((e) => (
                    <tr key={e._id}>
                      <td>{e.tournamentName}</td>
                      <td>{new Date(e.tournamentDate).toLocaleDateString()}</td>
                      <td>${e.totalExpense.toLocaleString()}</td>
                      <td className="action-cell">
                      <Link to={`/admin/finance/edit-expense/${e._id}`} className="btn btn-edit">
                        Edit
                      </Link>

                        <button 
                          onClick={() => handleDelete(e._id, "expense")} 
                          className="btn btn-delete"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;