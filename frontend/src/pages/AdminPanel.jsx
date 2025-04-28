import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  BsChat, BsTicket, BsTrash, BsSend, BsCheckCircle, 
  BsClockHistory, BsArrowClockwise, BsExclamationCircle,
  BsInbox, BsEnvelope
} from 'react-icons/bs';
import AdminSidebar from "../components/AdminSidebar";
import "../styles/AdminPanel.css";


const BASE_URL = import.meta.env.VITE_API_BASE_URL;

function AdminPanel() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [reply, setReply] = useState({});
  const [sendingReplyId, setSendingReplyId] = useState(null);
  const [activeTab, setActiveTab] = useState('tickets');
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    await Promise.all([fetchFeedbacks(), fetchTickets()]);
    setIsLoading(false);
  };

  const fetchFeedbacks = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/feedback`);
      setFeedbacks(res.data);
    } catch (err) {
      console.error('Error fetching feedbacks:', err);
    }
  };

  const fetchTickets = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/tickets`);
      setTickets(res.data);
    } catch (err) {
      console.error('Error fetching tickets:', err);
    }
  };

  const handleReplyChange = (id, value) => {
    setReply(prev => ({ ...prev, [id]: value }));
  };

  const sendReply = async (id) => {
    if (!reply[id]?.trim()) {
      alert('Reply cannot be empty!');
      return;
    }
    
    try {
      setSendingReplyId(id);
      const res = await axios.post(`${BASE_URL}/api/tickets/reply/${id}`, {
        reply: reply[id],
      });
      
      // Clear the reply field and refresh tickets
      setReply(prev => ({ ...prev, [id]: '' }));
      fetchTickets();
      
      // Show success notification
      showNotification('Reply sent successfully!', 'success');
    } catch (err) {
      console.error('Error sending reply:', err.response?.data || err.message);
      showNotification('Failed to send reply', 'error');
    } finally {
      setSendingReplyId(null);
    }
  };

  const showNotification = (message, type) => {
    // Simple notification implementation
    // In a real app, you might use a notification library
    const notificationDiv = document.createElement('div');
    notificationDiv.className = `notification ${type}`;
    notificationDiv.innerHTML = message;
    document.body.appendChild(notificationDiv);
    
    setTimeout(() => {
      notificationDiv.classList.add('show');
      setTimeout(() => {
        notificationDiv.classList.remove('show');
        setTimeout(() => document.body.removeChild(notificationDiv), 300);
      }, 3000);
    }, 100);
  };

  const deleteFeedback = async (id) => {
    if (window.confirm('Are you sure you want to delete this feedback?')) {
      try {
        await axios.delete(`${BASE_URL}/api/feedback/${id}`);
        setFeedbacks(prev => prev.filter((f) => f._id !== id));
        showNotification('Feedback deleted successfully', 'success');
      } catch (err) {
        console.error('Error deleting feedback:', err);
        showNotification('Failed to delete feedback', 'error');
      }
    }
  };

  const deleteTicket = async (id) => {
    if (window.confirm('Are you sure you want to delete this ticket?')) {
      try {
        await axios.delete(`${BASE_URL}/api/tickets/${id}`);
        setTickets(prev => prev.filter((t) => t._id !== id));
        showNotification('Ticket deleted successfully', 'success');
      } catch (err) {
        console.error('Error deleting ticket:', err);
        showNotification('Failed to delete ticket', 'error');
      }
    }
  };

  const filteredTickets = (Array.isArray(tickets) ? tickets : []).filter(ticket => 
    ticket.subject?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    ticket.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredFeedbacks = (Array.isArray(feedbacks) ? feedbacks : []).filter(feedback =>
    feedback.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    feedback.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    feedback.message?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  

  // Statistics
  const openTickets = tickets.filter(t => t.status !== 'Closed').length;
  const closedTickets = tickets.filter(t => t.status === 'Closed').length;

  return (
    <AdminSidebar>
      <div className="support-dashboard">
        {/* Header */}
        <div className="dashboard-header">
          <div className="header-content">
            <h1>Support Management</h1>
            <p>Manage tickets and feedback submissions</p>
          </div>
          <div className="header-actions">
            <div className="search-container">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <button 
              className="refresh-button" 
              onClick={fetchData}
              disabled={isLoading}
            >
              <BsArrowClockwise className={isLoading ? "spinner" : ""} />
              <span>{isLoading ? "Loading..." : "Refresh"}</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-container">
          <div className="stat-card">
            <div className="stat-icon tickets">
              <BsTicket />
            </div>
            <div className="stat-details">
              <span className="stat-value">{tickets.length}</span>
              <span className="stat-label">Total Tickets</span>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon open">
              <BsClockHistory />
            </div>
            <div className="stat-details">
              <span className="stat-value">{openTickets}</span>
              <span className="stat-label">Open Tickets</span>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon closed">
              <BsCheckCircle />
            </div>
            <div className="stat-details">
              <span className="stat-value">{closedTickets}</span>
              <span className="stat-label">Closed Tickets</span>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon feedback">
              <BsChat />
            </div>
            <div className="stat-details">
              <span className="stat-value">{feedbacks.length}</span>
              <span className="stat-label">Feedback Items</span>
            </div>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="tabs-container">
          <button
            className={`tab-button ${activeTab === 'tickets' ? 'active' : ''}`}
            onClick={() => setActiveTab('tickets')}
          >
            <BsTicket /> Support Tickets
          </button>
          <button
            className={`tab-button ${activeTab === 'feedback' ? 'active' : ''}`}
            onClick={() => setActiveTab('feedback')}
          >
            <BsChat /> Feedback Submissions
          </button>
        </div>

        {/* Tickets Tab */}
        {activeTab === 'tickets' && (
          <div className="panel-card">
            <div className="panel-header">
              <h2><BsTicket /> Support Tickets</h2>
              <div className="counter">{filteredTickets.length} items</div>
            </div>
            
            {isLoading ? (
              <div className="loading-state">
                <div className="loader"></div>
                <p>Loading tickets...</p>
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="empty-state">
                <BsInbox className="empty-icon" />
                <p>No tickets found</p>
                {searchTerm && (
                  <p className="empty-subtext">Try adjusting your search criteria</p>
                )}
              </div>
            ) : (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Subject</th>
                      <th>Description</th>
                      <th>Email</th>
                      <th>Status</th>
                      <th>Created At</th>
                      <th>Reply</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTickets.map((ticket) => (
                      <tr key={ticket._id}>
                        <td className="subject-cell">
                          {ticket.subject || <em className="no-data">No subject</em>}
                        </td>
                        <td className="description-cell">
                          <div className="description-content">
                            {ticket.description || <em className="no-data">No description</em>}
                          </div>
                        </td>
                        <td className="email-cell">
                          <a href={`mailto:${ticket.email}`} className="email-link">
                            {ticket.email || <em className="no-data">No email</em>}
                          </a>
                        </td>
                        <td className="status-cell">
                          <span className={`status-badge ${ticket.status === 'Closed' ? 'closed' : 'open'}`}>
                            {ticket.status === 'Closed' ? (
                              <><BsCheckCircle /> Closed</>
                            ) : (
                              <><BsClockHistory /> Open</>
                            )}
                          </span>
                        </td>
                        <td className="date-cell">
                          {new Date(ticket.createdAt).toLocaleString()}
                        </td>
                        <td className="reply-cell">
                          <textarea
                            value={reply[ticket._id] || ''}
                            onChange={(e) => handleReplyChange(ticket._id, e.target.value)}
                            placeholder={ticket.reply ? "Previous reply sent..." : "Write reply..."}
                            className={`reply-textarea ${ticket.status === 'Closed' ? 'disabled' : ''}`}
                            disabled={ticket.status === 'Closed'}
                          />
                          {ticket.reply && (
                            <div className="previous-reply">
                              <span>Previous reply: </span>
                              {ticket.reply}
                            </div>
                          )}
                        </td>
                        <td className="action-cell">
                          <div className="action-buttons">
                            <button
                              onClick={() => sendReply(ticket._id)}
                              className={`btn btn-send ${ticket.status === 'Closed' ? 'disabled' : ''}`}
                              disabled={!reply[ticket._id] || ticket.status === 'Closed' || sendingReplyId === ticket._id}
                              title={ticket.status === 'Closed' ? "Cannot reply to closed tickets" : "Send reply"}
                            >
                              {sendingReplyId === ticket._id ? (
                                <><div className="btn-spinner"></div> Sending...</>
                              ) : (
                                <><BsSend /> Send</>
                              )}
                            </button>
                            <button
                              onClick={() => deleteTicket(ticket._id)}
                              className="btn btn-delete"
                              title="Delete ticket"
                            >
                              <BsTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Feedback Tab */}
        {activeTab === 'feedback' && (
          <div className="panel-card">
            <div className="panel-header">
              <h2><BsChat /> Feedback Submissions</h2>
              <div className="counter">{filteredFeedbacks.length} items</div>
            </div>
            
            {isLoading ? (
              <div className="loading-state">
                <div className="loader"></div>
                <p>Loading feedback submissions...</p>
              </div>
            ) : filteredFeedbacks.length === 0 ? (
              <div className="empty-state">
                <BsEnvelope className="empty-icon" />
                <p>No feedback submissions found</p>
                {searchTerm && (
                  <p className="empty-subtext">Try adjusting your search criteria</p>
                )}
              </div>
            ) : (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Message</th>
                      <th>Submitted At</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFeedbacks.map((fb) => (
                      <tr key={fb._id}>
                        <td className="name-cell">
                          {fb.name || <em className="no-data">Anonymous</em>}
                        </td>
                        <td className="email-cell">
                          {fb.email ? (
                            <a href={`mailto:${fb.email}`} className="email-link">
                              {fb.email}
                            </a>
                          ) : (
                            <em className="no-data">No email</em>
                          )}
                        </td>
                        <td className="message-cell">
                          <div className="message-content">
                            {fb.message || <em className="no-data">No message</em>}
                          </div>
                        </td>
                        <td className="date-cell">
                          {new Date(fb.createdAt).toLocaleString()}
                        </td>
                        <td className="action-cell">
                          <button
                            onClick={() => deleteFeedback(fb._id)}
                            className="btn btn-delete"
                            title="Delete feedback"
                          >
                            <BsTrash />
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
}

export default AdminPanel;