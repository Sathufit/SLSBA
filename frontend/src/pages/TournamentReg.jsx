import React, { useState, useEffect } from "react"; 
import { Link, useParams, useNavigate } from "react-router-dom";
import { ChevronDown, Plus, Upload } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "../components/Card";
import "../styles/TournamentReg.css";
import axios from "axios";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import CheckoutForm from "../components/CheckoutForm"; 

const stripePromise = loadStripe("pk_test_51R4FPYGfn39KTTSncHeJ7cLe5Is4MOgn6NSvwq7jFN032wcB8w0nHgkyG7dOPk8HHl0aWk2Bpow27mOIFY2h5Fth00khlQqnSo");

const TournamentRegistration = () => {
  const { tournamentId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "", 
    schoolName: "",
    schoolID: "",
    tournament: "",
    players: [],
    paymentMethod: "upload",
    paymentFile: null
  });  
  
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [tournaments, setTournaments] = useState([]);

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const response = await axios.get("http://localhost:5001/api/tournaments/all");
        setTournaments(response.data);
      } catch (error) {
        console.error("❌ Error fetching tournaments:", error);
      }
    };
    fetchTournaments();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "file" ? files[0] : value,
    }));
  };

  const handlePlayerChange = (index, field, value) => {
    setFormData((prev) => {
      const updatedPlayers = [...prev.players];
      updatedPlayers[index][field] = value;
      return { ...prev, players: updatedPlayers };
    });
  };

  const handleAddPlayer = () => {
    setFormData((prev) => ({
      ...prev,
      players: [...prev.players, { name: "", age: "" }],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.paymentMethod === "stripe") {
      navigate("/payment", { state: { amount: 5000, registrationData: formData } });
      return;
    }

    const formattedPlayers = formData.players.map((player) => ({
      name: player.name.trim(),
      age: player.age,
      school: formData.schoolName,
    }));

    const submissionData = new FormData();
    submissionData.append("fullName", formData.fullName);
    submissionData.append("email", formData.email); 
    submissionData.append("schoolName", formData.schoolName);
    submissionData.append("schoolID", formData.schoolID);
    submissionData.append("tournament", formData.tournament);
    submissionData.append("players", JSON.stringify(formattedPlayers));
    submissionData.append("paymentMethod", formData.paymentMethod);

    if (formData.paymentFile) {
      submissionData.append("paymentFile", formData.paymentFile);
    }

    try {
      setLoading(true);
      const response = await axios.post("http://localhost:5001/api/tournament-registrations/register", submissionData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Registration successful!");
      setFormData({
        fullName: "",
        schoolName: "",
        schoolID: "",
        tournament: "",
        players: [],
        paymentMethod: "upload",
        paymentFile: null
      });
    } catch (error) {
      alert("Registration failed. Please check the form inputs.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="home-container">
      {/* Navbar */}
      <header className="navbar">
        <nav>
          <div className="logo1">
            <img src="/logo.png" alt="SLSBA Logo" className="logo" />
            <span className="logo-text">SLSBA</span>
          </div>
          <ul className="nav-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/tournaments">Tournaments</Link></li>
            <li><Link to="/training">Coaching Programs</Link></li>
            <li><Link to="/news">News & Media</Link></li>
            <li><Link to="/contact">Contact Us</Link></li>
          </ul>
          <Link to="/login">
            <img src="/user-icon.webp" alt="User Icon" className="user-icon" />
          </Link>
        </nav>
      </header>

      <div className="registration-container">
        <Card className="registration-card">
          <CardHeader>
            <CardTitle>Tournament Registration</CardTitle>
            <p className="registration-subtitle">Fill in all required fields to complete registration</p>
          </CardHeader>
          <CardContent>
            {message && <p className="form-message">{message}</p>}
            <form onSubmit={handleSubmit} className="registration-form">
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Full Name <span className="required">*</span></label>
                  <input 
                    type="text" 
                    name="fullName" 
                    value={formData.fullName} 
                    onChange={handleChange} 
                    className="form-input" 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email <span className="required">*</span></label>
                  <input 
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">School Name <span className="required">*</span></label>
                  <input 
                    type="text" 
                    name="schoolName" 
                    value={formData.schoolName} 
                    onChange={handleChange} 
                    className="form-input" 
                    required 
                  />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Tournament <span className="required">*</span></label>
                  <div className="select-wrapper">
                    <select 
                      name="tournament" 
                      value={formData.tournament} 
                      onChange={handleChange} 
                      className="form-select" 
                      required
                    >
                      <option value="" disabled>Select Tournament</option>
                      {tournaments.map((tournament) => (
                        <option key={tournament._id} value={tournament._id}>
                          {tournament.tournamentName}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="select-icon" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">School ID <span className="required">*</span></label>
                  <input 
                    type="text" 
                    name="schoolID" 
                    value={formData.schoolID} 
                    onChange={handleChange} 
                    className="form-input" 
                    required 
                  />
                </div>
              </div>

              {/* Players Section */}
              <div className="players-section">
                <h3 className="section-title">Team Players</h3>
                {formData.players.map((player, index) => (
                  <div key={index} className="player-entry form-grid">
                    <div className="form-group">
                      <label className="form-label">Player Name <span className="required">*</span></label>
                      <input
                        type="text"
                        value={player.name}
                        onChange={(e) => handlePlayerChange(index, "name", e.target.value)}
                        className="form-input"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Age <span className="required">*</span></label>
                      <input
                        type="number"
                        value={player.age}
                        onChange={(e) => handlePlayerChange(index, "age", e.target.value)}
                        className="form-input"
                        required
                      />
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddPlayer}
                  className="add-player-btn"
                >
                  <Plus size={16} /> Add Player
                </button>
              </div>

              {/* Payment Section */}
<div className="payment-section">
  <h3 className="section-title">Payment Details</h3>
  
  {/* Payment Method Selection */}
  <div className="form-group">
    <label className="form-label">Payment Method <span className="required">*</span></label>
    <div className="payment-methods">
      <label className={`payment-method ${formData.paymentMethod === "upload" ? "active" : ""}`}>
        <input
          type="radio"
          name="paymentMethod"
          value="upload"
          checked={formData.paymentMethod === "upload"}
          onChange={handleChange}
        />
        <Upload size={20} />
        Upload Receipt
      </label>

      <label className={`payment-method ${formData.paymentMethod === "onsite" ? "active" : ""}`}>
        <input
          type="radio"
          name="paymentMethod"
          value="onsite"
          checked={formData.paymentMethod === "onsite"}
          onChange={handleChange}
        />
        Pay On-site
      </label>

      <label className={`payment-method ${formData.paymentMethod === "stripe" ? "active" : ""}`}>
        <input
          type="radio"
          name="paymentMethod"
          value="stripe"
          checked={formData.paymentMethod === "stripe"}
          onChange={handleChange}
        />
        Pay with Card (Stripe)
      </label>
    </div>
  </div>

  {/* Upload Receipt Section */}
  {formData.paymentMethod === "upload" && (
    <div className="form-group">
      <label className="form-label">Upload Receipt <span className="required">*</span></label>
      <div className="file-upload">
        <input
          type="file"
          name="paymentFile"
          id="paymentFile"
          onChange={handleChange}
          className="file-input"
          required
        />
        <label htmlFor="paymentFile" className="file-label">
          <Upload size={16} />
          {formData.paymentFile ? formData.paymentFile.name : "Choose file..."}
        </label>
      </div>
    </div>
  )}

  {/* Stripe Payment Section */}
  {formData.paymentMethod === "stripe" && (
    <div className="stripe-payment-container">
      <Elements stripe={stripePromise}>
        <CheckoutForm amount={5000} onPaymentSuccess={(paymentId) => {
          setFormData((prev) => ({ ...prev, paymentId }));
          alert("Payment Successful! Payment ID: " + paymentId);
        }} />
      </Elements>
    </div>
  )}
</div>

              {/* Submit Button */}
              <div className="form-actions">
                <button
                  type="submit"
                  className="submit-btn"
                  disabled={loading}
                >
                  {loading ? "Submitting..." : "Submit Registration"}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TournamentRegistration;