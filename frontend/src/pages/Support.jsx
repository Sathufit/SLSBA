import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/SupportPage.css';
import axios from 'axios';

const SupportPage = () => {
  const [ticketForm, setTicketForm] = useState({
    email: '',
    subject: '',
    description: ''
  });

  const [feedbackForm, setFeedbackForm] = useState({
    name: '',
    email: '',
    feedback: '',
    rating: 5,
    contact: false
  });

  const [recentFeedback, setRecentFeedback] = useState([]);
  const [ticketSubmitted, setTicketSubmitted] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch recent feedback when component mounts
  useEffect(() => {
    fetchRecentFeedback();
  }, []);

  const fetchRecentFeedback = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('http://localhost:5001/api/feedback');
      setRecentFeedback(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching feedback:', err);
      setError('Failed to load recent feedback. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTicketChange = (e) => {
    const { name, value } = e.target;
    setTicketForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFeedbackChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFeedbackForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleTicketSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5001/api/tickets", ticketForm);
      setTicketSubmitted(true);
      setTimeout(() => setTicketSubmitted(false), 5000);
      setTicketForm({
        email: '',
        subject: '',
        description: ''
      });
    } catch (error) {
      console.error('Ticket submission error:', error);
      alert('Failed to submit ticket. Please try again.');
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    try {
      // Submit feedback to the API
      await axios.post('http://localhost:5001/api/feedback', feedbackForm);
      setFeedbackSubmitted(true);
      setTimeout(() => setFeedbackSubmitted(false), 5000);
      setFeedbackForm({
        name: '',
        email: '',
        feedback: '',
        rating: 5,
        contact: false
      });
      // Refresh the recent feedback list
      fetchRecentFeedback();
    } catch (error) {
      console.error('Feedback submission error:', error);
      alert('Failed to submit feedback. Please try again.');
    }
  };

  // Helper function to get user initials
  const getUserInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  // Helper function to render star rating
  const renderStarRating = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i}>
          {i <= rating ? '★' : '☆'}
        </span>
      );
    }
    return stars;
  };

  // Format date to a readable format
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="support-page">
      <Navbar />
      <section className="hero-section6">
        <div className="hero-content6">
          <h1>Contact Us </h1>
          <p>Get support or share your feedback with our team</p>
        </div>
      </section>
      <div className="support-container">
        <div className="support-column">
          {/* Support Ticket Section */}
          <div className="support-card">
            <h2>Create Support Ticket</h2>
            {ticketSubmitted ? (
              <div className="success-message">
                <i className="success-icon">✓</i>
                <p>Support ticket created successfully!</p>
              </div>
            ) : (
              <form onSubmit={handleTicketSubmit}>
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={ticketForm.email}
                    onChange={handleTicketChange}
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Subject</label>
                  <input
                    type="text"
                    name="subject"
                    value={ticketForm.subject}
                    onChange={handleTicketChange}
                    placeholder="Brief issue description"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={ticketForm.description}
                    onChange={handleTicketChange}
                    placeholder="Provide detailed information about your issue"
                    required
                  />
                </div>
                <button type="submit" className="submit-btn">
                  Create Support Ticket
                </button>
              </form>
            )}
          </div>
          
          {/* Feedback Section */}
          <div className="support-card">
            <h2>Submit Feedback</h2>
            {feedbackSubmitted ? (
              <div className="success-message">
                <i className="success-icon">✓</i>
                <p>Thank you for your feedback!</p>
              </div>
            ) : (
              <form onSubmit={handleFeedbackSubmit}>
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={feedbackForm.name}
                    onChange={handleFeedbackChange}
                    placeholder="Your full name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={feedbackForm.email}
                    onChange={handleFeedbackChange}
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Your Feedback</label>
                  <textarea
                    name="feedback"
                    value={feedbackForm.feedback}
                    onChange={handleFeedbackChange}
                    placeholder="Share your thoughts and suggestions"
                    required
                  />
                </div>
                <div className="form-group checkbox">
                  <input
                    type="checkbox"
                    name="contact"
                    checked={feedbackForm.contact}
                    onChange={handleFeedbackChange}
                    id="contact-permission"
                  />
                  <label htmlFor="contact-permission">
                    I'm open to being contacted for further details
                  </label>
                </div>
                <button type="submit" className="submit-btn">
                  Submit Feedback
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
      
      <div className="recent-feedback-section">
        <div className="container">
          <h2>Recent Feedback</h2>
          
          {isLoading ? (
            <div className="loading-spinner">Loading...</div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : recentFeedback.length === 0 ? (
            <div className="no-feedback-message">No feedback available yet. Be the first to share your experience!</div>
          ) : (
            <div className="feedback-cards">
              {recentFeedback.map((feedback) => (
              <div className="feedback-card" key={feedback._id}>
                <div className="feedback-header">
                  <span className="user-initial">{getUserInitial(feedback.name)}</span>
                  <div>
                    <h4>{feedback.name}</h4>
                    <p className="feedback-date">{formatDate(feedback.createdAt)}</p>
                  </div>
                </div>
                <p className="feedback-message">"{feedback.message}"</p>
              </div>
            ))}
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default SupportPage;