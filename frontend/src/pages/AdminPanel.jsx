import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/AdminPanel.css';
import AdminSidebar from "../components/AdminSidebar";
import { BsChat, BsTicket, BsTrash, BsSend, BsCheckCircle, BsClockHistory } from 'react-icons/bs';

function AdminPanel() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [reply, setReply] = useState({});
<<<<<<< HEAD
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('feedback');

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

=======
  const [activeTab, setActiveTab] = useState('feedback');

>>>>>>> cf00e0e27bb95d12f1c8c467c72a0fc52dc1f5e1
  useEffect(() => {
    fetchFeedbacks();
    fetchTickets();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/feedback');
      setFeedbacks(res.data);
    } catch (err) {
      console.error('Error fetching feedbacks:', err);
    }
  };

  const fetchTickets = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/tickets');
      setTickets(res.data);
    } catch (err) {
      console.error('Error fetching tickets:', err);
    }
  };

  const handleReplyChange = (id, value) => {
    setReply({ ...reply, [id]: value });
  };

  const sendReply = async (id) => {
    try {
      await axios.post(`http://localhost:5001/api/tickets/reply/${id}`, {
        reply: reply[id],
      });
      alert('Reply sent and email delivered!');
      fetchTickets();
    } catch (err) {
      console.error('Error sending reply:', err);
      alert('Failed to send reply. Check server log or email config.');
    }
  };

  const deleteFeedback = async (id) => {
    if (window.confirm('Are you sure you want to delete this feedback?')) {
      try {
        await axios.delete(`http://localhost:5001/api/feedback/${id}`);
        setFeedbacks((prev) => prev.filter((f) => f._id !== id));
      } catch (err) {
        console.error('Error deleting feedback:', err);
      }
    }
  };

  const deleteTicket = async (id) => {
    if (window.confirm('Are you sure you want to delete this ticket?')) {
      try {
        await axios.delete(`http://localhost:5001/api/tickets/${id}`);
        setTickets((prev) => prev.filter((t) => t._id !== id));
      } catch (err) {
        console.error('Error deleting ticket:', err);
      }
    }
  };

  const getStatusBadgeClass = (status) => {
    return status === 'Closed' ? 'status-badge closed' : 'status-badge open';
  };

  return (
<<<<<<< HEAD
    <div className="admin-layout">
      <AdminSidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />
      <main className={`admin-panel ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="content-wrapper">
          <div className="tabs-container">
            <button 
              className={`tab-button ${activeTab === 'feedback' ? 'active' : ''}`} 
              onClick={() => setActiveTab('feedback')}
            >
              <BsChat /> Feedback Submissions
            </button>
            <button 
              className={`tab-button ${activeTab === 'tickets' ? 'active' : ''}`} 
              onClick={() => setActiveTab('tickets')}
            >
              <BsTicket /> Support Tickets
            </button>
          </div>

          {activeTab === 'feedback' && (
            <div className="tab-content">
              <div className="panel-header">
                <h2><BsChat /> Feedback Submissions</h2>
                <div className="counter">{feedbacks.length} items</div>
              </div>
              
              {feedbacks.length === 0 ? (
                <div className="empty-state">
                  <p>No feedback submitted yet.</p>
                </div>
              ) : (
                <div className="table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Message</th>
                        <th>Submitted At</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {feedbacks.map((fb) => (
                        <tr key={fb._id}>
                          <td className="name-cell">{fb.name}</td>
                          <td className="email-cell">{fb.email}</td>
                          <td className="message-cell">
                            <div className="message-content">{fb.message}</div>
                          </td>
                          <td className="date-cell">{new Date(fb.createdAt).toLocaleString()}</td>
                          <td className="action-cell">
                            <button 
                              onClick={() => deleteFeedback(fb._id)} 
                              className="icon-button delete-btn"
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

          {activeTab === 'tickets' && (
            <div className="tab-content">
              <div className="panel-header">
                <h2><BsTicket /> Support Tickets</h2>
                <div className="counter">{tickets.length} items</div>
              </div>
              
              {tickets.length === 0 ? (
                <div className="empty-state">
                  <p>No tickets found.</p>
                </div>
              ) : (
                <div className="table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Subject</th>
                        <th>Description</th>
                        <th>Email</th>
                        <th>Status</th>
                        <th>Created At</th>
                        <th>Reply</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tickets.map((ticket) => (
                        <tr key={ticket._id}>
                          <td className="subject-cell">{ticket.subject || <em>—</em>}</td>
                          <td className="description-cell">
                            <div className="description-content">{ticket.description || <em>—</em>}</div>
                          </td>
                          <td className="email-cell">{ticket.email || <em>—</em>}</td>
                          <td className="status-cell">
                            <span className={getStatusBadgeClass(ticket.status)}>
                              {ticket.status === 'Closed' ? <BsCheckCircle /> : <BsClockHistory />} {ticket.status}
                            </span>
                          </td>
                          <td className="date-cell">{new Date(ticket.createdAt).toLocaleString()}</td>
                          <td className="reply-cell">
                            <textarea
                              value={reply[ticket._id] || ''}
                              onChange={(e) => handleReplyChange(ticket._id, e.target.value)}
                              placeholder={ticket.reply || 'Write reply...'}
                              className="reply-textarea"
                            />
                          </td>
                          <td className="action-cell">
                            <div className="action-buttons">
                              <button 
                                onClick={() => sendReply(ticket._id)} 
                                className="btn btn-primary"
                                disabled={!reply[ticket._id] || ticket.status === 'Closed'}
                              >
                                <BsSend /> Send
                              </button>
                              <button
                                onClick={() => deleteTicket(ticket._id)}
                                className="icon-button delete-btn"
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
        </div>
      </main>
    </div>
=======
    <AdminSidebar>
      <div className="content-wrapper">
        <div className="tabs-container">
          <button 
            className={`tab-button ${activeTab === 'feedback' ? 'active' : ''}`} 
            onClick={() => setActiveTab('feedback')}
          >
            <BsChat /> Feedback Submissions
          </button>
          <button 
            className={`tab-button ${activeTab === 'tickets' ? 'active' : ''}`} 
            onClick={() => setActiveTab('tickets')}
          >
            <BsTicket /> Support Tickets
          </button>
        </div>

        {activeTab === 'feedback' && (
          <div className="tab-content">
            <div className="panel-header">
              <h2><BsChat /> Feedback Submissions</h2>
              <div className="counter">{feedbacks.length} items</div>
            </div>
            
            {feedbacks.length === 0 ? (
              <div className="empty-state">
                <p>No feedback submitted yet.</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Message</th>
                      <th>Submitted At</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {feedbacks.map((fb) => (
                      <tr key={fb._id}>
                        <td className="name-cell">{fb.name}</td>
                        <td className="email-cell">{fb.email}</td>
                        <td className="message-cell">
                          <div className="message-content">{fb.message}</div>
                        </td>
                        <td className="date-cell">{new Date(fb.createdAt).toLocaleString()}</td>
                        <td className="action-cell">
                          <button 
                            onClick={() => deleteFeedback(fb._id)} 
                            className="icon-button delete-btn"
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

        {activeTab === 'tickets' && (
          <div className="tab-content">
            <div className="panel-header">
              <h2><BsTicket /> Support Tickets</h2>
              <div className="counter">{tickets.length} items</div>
            </div>
            
            {tickets.length === 0 ? (
              <div className="empty-state">
                <p>No tickets found.</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Subject</th>
                      <th>Description</th>
                      <th>Email</th>
                      <th>Status</th>
                      <th>Created At</th>
                      <th>Reply</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.map((ticket) => (
                      <tr key={ticket._id}>
                        <td className="subject-cell">{ticket.subject || <em>—</em>}</td>
                        <td className="description-cell">
                          <div className="description-content">{ticket.description || <em>—</em>}</div>
                        </td>
                        <td className="email-cell">{ticket.email || <em>—</em>}</td>
                        <td className="status-cell">
                          <span className={getStatusBadgeClass(ticket.status)}>
                            {ticket.status === 'Closed' ? <BsCheckCircle /> : <BsClockHistory />} {ticket.status}
                          </span>
                        </td>
                        <td className="date-cell">{new Date(ticket.createdAt).toLocaleString()}</td>
                        <td className="reply-cell">
                          <textarea
                            value={reply[ticket._id] || ''}
                            onChange={(e) => handleReplyChange(ticket._id, e.target.value)}
                            placeholder={ticket.reply || 'Write reply...'}
                            className="reply-textarea"
                          />
                        </td>
                        <td className="action-cell">
                          <div className="action-buttons">
                            <button 
                              onClick={() => sendReply(ticket._id)} 
                              className="btn btn-primary"
                              disabled={!reply[ticket._id] || ticket.status === 'Closed'}
                            >
                              <BsSend /> Send
                            </button>
                            <button
                              onClick={() => deleteTicket(ticket._id)}
                              className="icon-button delete-btn"
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
      </div>
    </AdminSidebar>
>>>>>>> cf00e0e27bb95d12f1c8c467c72a0fc52dc1f5e1
  );
}

export default AdminPanel;