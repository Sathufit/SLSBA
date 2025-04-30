import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  BsCalendar, BsPencil, BsTrash, BsPlus, BsFileText, 
  BsImages, BsArrowClockwise, BsCheckCircle, 
  BsExclamationCircle, BsX, BsCheck
} from 'react-icons/bs';
import AdminSidebar from "../components/AdminSidebar";
import "../styles/AdminNewsPanel.css";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

function AdminNewsPanel() {
  const [news, setNews] = useState([]);
  const [mediaList, setMediaList] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "",
    author: "",
    publishedDate: "",
    image: null,
  });
  const [mediaForm, setMediaForm] = useState({
    title: "",
    description: "",
    images: [],
  });
  const [editingId, setEditingId] = useState(null);
  const [editingMediaId, setEditingMediaId] = useState(null);
  const [activeTab, setActiveTab] = useState("news");
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [reportFilters, setReportFilters] = useState({
    startDate: "",
    endDate: "",
    category: "",
    type: "news", // "news" or "media"
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    await Promise.all([fetchNews(), fetchMedia()]);
    setIsLoading(false);
  };

  const fetchNews = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/news`);
      setNews(res.data.news || []);
    } catch (err) {
      console.error('Error fetching news:', err);
      showNotification('Failed to fetch news', 'error');
    }
  };

  const fetchMedia = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/media`);
      setMediaList(res.data.media || []);
    } catch (err) {
      console.error('Error fetching media:', err);
      showNotification('Failed to fetch media', 'error');
    }
  };

  const handleNewsChange = (e) => {
    if (e.target.name === "image") {
      const file = e.target.files[0];
      setFormData({ ...formData, image: file });
      
      // Create image preview
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setImagePreview(null);
      }
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleMediaChange = (e) => {
    if (e.target.name === "images") {
      setMediaForm({ ...mediaForm, images: Array.from(e.target.files) });
    } else {
      setMediaForm({ ...mediaForm, [e.target.name]: e.target.value });
    }
  };

  const handleNewsSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key]) data.append(key, formData[key]);
    });

    try {
      if (editingId) {
        await axios.put(`${BASE_URL}/api/news/${editingId}`, data);
        showNotification('News article updated successfully', 'success');
      } else {
        await axios.post(`${BASE_URL}/api/news`, data);
        showNotification('News article added successfully', 'success');
      }

      setFormData({
        title: "",
        content: "",
        category: "",
        author: "",
        publishedDate: "",
        image: null,
      });
      setImagePreview(null);
      setEditingId(null);
      fetchNews();
    } catch (err) {
      console.error('Error in handleNewsSubmit:', err);
      showNotification('Operation failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMediaSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    const data = new FormData();
    data.append("title", mediaForm.title);
    data.append("description", mediaForm.description);
    mediaForm.images.forEach((img) => data.append("images", img));

    try {
      if (editingMediaId) {
        await axios.put(`${BASE_URL}/api/media/${editingMediaId}`, data);
        showNotification('Media gallery updated successfully', 'success');
      } else {
        await axios.post(`${BASE_URL}/api/media`, data);
        showNotification('Media gallery created successfully', 'success');
      }
      setMediaForm({ title: "", description: "", images: [] });
      setEditingMediaId(null);
      fetchMedia();
    } catch (err) {
      console.error('Error in handleMediaSubmit:', err);
      showNotification('Operation failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewsEdit = (item) => {
    setEditingId(item._id);
    setFormData({
      title: item.title,
      content: item.content,
      category: item.category,
      author: item.author,
      publishedDate: item.publishedDate?.split('T')[0] || "",
      image: null,
    });
    setImagePreview(item.imageUrl ? `${BASE_URL}/uploads/${item.imageUrl}` : null);
    setActiveTab("news");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleMediaEdit = (item) => {
    setEditingMediaId(item._id);
    setMediaForm({
      title: item.title,
      description: item.description,
      images: [],
    });
    setActiveTab("media");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNewsDelete = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/api/news/${id}`);
      setNews(news.filter(item => item._id !== id));
      showNotification('News article deleted successfully', 'success');
    } catch (err) {
      console.error('Error deleting news:', err);
      showNotification('Failed to delete news article', 'error');
    }
    setConfirmDelete(null);
  };

  const handleMediaDelete = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/api/media/${id}`);
      setMediaList(mediaList.filter(item => item._id !== id));
      showNotification('Media gallery deleted successfully', 'success');
    } catch (err) {
      console.error('Error deleting media:', err);
      showNotification('Failed to delete media gallery', 'error');
    }
    setConfirmDelete(null);
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

  const handleGenerateReport = async () => {
    try {
      const response = await axios.post(
        `${BASE_URL}/api/news/report/pdf`,
        reportFilters,
        {
          responseType: "blob",
          headers: { Accept: "application/pdf" },
        }
      );

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${reportFilters.type}_report.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Error generating report:", err);
      showNotification("Failed to generate report", "error");
    }
  };

  // Filter function for search
  const filteredNews = news.filter(item => 
    item.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMedia = mediaList.filter(item => 
    item.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Statistics
  const eventNews = news.filter(item => item.category === 'Event').length;
  const announcementNews = news.filter(item => item.category === 'Announcement').length;
  const totalImages = mediaList.reduce((acc, item) => acc + (item.images?.length || 0), 0);

  return (
    <AdminSidebar>
      <div className="news-dashboard">
        {/* Confirmation Modal */}
        {confirmDelete && (
          <div className="confirm-modal-overlay">
            <div className="confirm-modal">
              <h3>Confirm Deletion</h3>
              <p>Are you sure you want to delete this {confirmDelete.type}? This action cannot be undone.</p>
              <div className="confirm-actions">
                <button className="btn btn-cancel" onClick={() => setConfirmDelete(null)}>
                  <BsX /> Cancel
                </button>
                <button 
                  className="btn btn-delete" 
                  onClick={() => 
                    confirmDelete.type === 'news' 
                      ? handleNewsDelete(confirmDelete.id) 
                      : handleMediaDelete(confirmDelete.id)
                  }
                >
                  <BsTrash /> Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="dashboard-header">
          <div className="header-content">
            <h1>News & Media Management</h1>
            <p>Create and manage news articles and media galleries</p>
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
            <div className="stat-icon news">
              <BsFileText />
            </div>
            <div className="stat-details">
              <span className="stat-value">{news.length}</span>
              <span className="stat-label">News Articles</span>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon events">
              <BsCalendar />
            </div>
            <div className="stat-details">
              <span className="stat-value">{eventNews}</span>
              <span className="stat-label">Events</span>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon announcements">
              <BsExclamationCircle />
            </div>
            <div className="stat-details">
              <span className="stat-value">{announcementNews}</span>
              <span className="stat-label">Announcements</span>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon media">
              <BsImages />
            </div>
            <div className="stat-details">
              <span className="stat-value">{totalImages}</span>
              <span className="stat-label">Media Items</span>
            </div>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="tabs-container">
          <button
            className={`tab-button ${activeTab === 'news' ? 'active' : ''}`}
            onClick={() => setActiveTab('news')}
          >
            <BsFileText /> News Articles
          </button>
          <button
            className={`tab-button ${activeTab === 'media' ? 'active' : ''}`}
            onClick={() => setActiveTab('media')}
          >
            <BsImages /> Media Galleries
          </button>
        </div>

        {/* Filter Form */}
        <div className="filter-form">
          <div className="form-group">
            <label>Start Date</label>
            <input
              type="date"
              value={reportFilters.startDate}
              onChange={(e) => setReportFilters({ ...reportFilters, startDate: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>End Date</label>
            <input
              type="date"
              value={reportFilters.endDate}
              onChange={(e) => setReportFilters({ ...reportFilters, endDate: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Category</label>
            <select
              value={reportFilters.category}
              onChange={(e) => setReportFilters({ ...reportFilters, category: e.target.value })}
            >
              <option value="">All Categories</option>
              <option value="Event">Event</option>
              <option value="Announcement">Announcement</option>
              <option value="Community">Community</option>
              <option value="Project">Project</option>
              <option value="Update">Update</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="form-group">
            <label>Type</label>
            <select
              value={reportFilters.type}
              onChange={(e) => setReportFilters({ ...reportFilters, type: e.target.value })}
            >
              <option value="news">News</option>
              <option value="media">Media</option>
            </select>
          </div>
          <button className="btn btn-submit" onClick={handleGenerateReport}>
            Generate Report
          </button>
        </div>

        {/* News Tab */}
        {activeTab === 'news' && (
          <div className="panel-card">
            <div className="panel-header">
              <h2><BsFileText /> {editingId ? "Edit News Article" : "Add News Article"}</h2>
              {editingId && (
                <button 
                  className="cancel-edit-button"
                  onClick={() => {
                    setEditingId(null);
                    setFormData({
                      title: "",
                      content: "",
                      category: "",
                      author: "",
                      publishedDate: "",
                      image: null,
                    });
                    setImagePreview(null);
                  }}
                >
                  Cancel Editing
                </button>
              )}
            </div>
            
            <form onSubmit={handleNewsSubmit} className="form-grid">
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleNewsChange}
                  placeholder="Enter article title"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleNewsChange}
                  required
                >
                  <option value="" disabled>Select category</option>
                  <option value="Event">Event</option>
                  <option value="Announcement">Announcement</option>
                  <option value="Community">Community</option>
                  <option value="Project">Project</option>
                  <option value="Update">Update</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Author</label>
                <input
                  type="text"
                  name="author"
                  value={formData.author}
                  onChange={handleNewsChange}
                  placeholder="Enter author name"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Published Date</label>
                <input
                  type="date"
                  name="publishedDate"
                  value={formData.publishedDate}
                  onChange={handleNewsChange}
                  required
                />
              </div>
              
              <div className="form-group full-width">
                <label>Content</label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleNewsChange}
                  placeholder="Write article content here..."
                  rows="6"
                  required
                ></textarea>
              </div>
              
              <div className="form-group">
                <label>Featured Image</label>
                <div className="file-upload">
                  <input
                    type="file"
                    name="image"
                    id="image-upload"
                    accept="image/*"
                    onChange={handleNewsChange}
                  />
                  <label htmlFor="image-upload" className="upload-label">
                    <BsImages /> Choose Image
                  </label>
                </div>
                {imagePreview && (
                  <div className="image-preview">
                    <img src={imagePreview} alt="Preview" />
                  </div>
                )}
              </div>
              
              <div className="form-actions">
                <button type="submit" className="btn btn-submit" disabled={isLoading}>
                  {isLoading ? (
                    <><div className="btn-spinner"></div> Processing...</>
                  ) : editingId ? (
                    <><BsPencil /> Update Article</>
                  ) : (
                    <><BsPlus /> Add Article</>
                  )}
                </button>
              </div>
            </form>
            
            <div className="data-section">
              <div className="section-header">
                <h3><BsFileText /> News Articles</h3>
                <div className="counter">{filteredNews.length} articles</div>
              </div>
              
              {isLoading && news.length === 0 ? (
                <div className="loading-state">
                  <div className="loader"></div>
                  <p>Loading news articles...</p>
                </div>
              ) : filteredNews.length === 0 ? (
                <div className="empty-state">
                  <BsFileText className="empty-icon" />
                  <p>No news articles found</p>
                  {searchTerm && (
                    <p className="empty-subtext">Try adjusting your search criteria</p>
                  )}
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Category</th>
                        <th>Author</th>
                        <th>Published Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredNews.map((item) => (
                        <tr key={item._id}>
                          <td className="title-cell">
                            {item.imageUrl && (
                              <div className="article-thumbnail">
                                <img 
                                  src={`${BASE_URL}/uploads/${item.imageUrl}`} 
                                  alt={item.title}
                                />
                              </div>
                            )}
                            <span>{item.title || <em className="no-data">No title</em>}</span>
                          </td>
                          <td className="category-cell">
                            <span className={`category-badge ${item.category?.toLowerCase()}`}>
                              {item.category || <em className="no-data">No category</em>}
                            </span>
                          </td>
                          <td className="author-cell">
                            {item.author || <em className="no-data">No author</em>}
                          </td>
                          <td className="date-cell">
                            {item.publishedDate ? (
                              <span className="date-with-icon">
                                <BsCalendar /> {new Date(item.publishedDate).toLocaleDateString()}
                              </span>
                            ) : (
                              <em className="no-data">No date</em>
                            )}
                          </td>
                          <td className="action-cell">
                            <div className="action-buttons">
                              <button
                                onClick={() => handleNewsEdit(item)}
                                className="btn btn-edit"
                                title="Edit article"
                              >
                                <BsPencil />
                              </button>
                              <button
                                onClick={() => setConfirmDelete({ id: item._id, type: 'news' })}
                                className="btn btn-delete"
                                title="Delete article"
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
          </div>
        )}

        {/* Media Tab */}
        {activeTab === 'media' && (
          <div className="panel-card">
            <div className="panel-header">
              <h2><BsImages /> {editingMediaId ? "Edit Media Gallery" : "Add Media Gallery"}</h2>
              {editingMediaId && (
                <button 
                  className="cancel-edit-button"
                  onClick={() => {
                    setEditingMediaId(null);
                    setMediaForm({
                      title: "",
                      description: "",
                      images: [],
                    });
                  }}
                >
                  Cancel Editing
                </button>
              )}
            </div>
            
            <form onSubmit={handleMediaSubmit} className="form-grid">
              <div className="form-group full-width">
                <label>Gallery Title</label>
                <input
                  type="text"
                  name="title"
                  value={mediaForm.title}
                  onChange={handleMediaChange}
                  placeholder="Enter gallery title"
                  required
                />
              </div>
              
              <div className="form-group full-width">
                <label>Description</label>
                <textarea
                  name="description"
                  value={mediaForm.description}
                  onChange={handleMediaChange}
                  placeholder="Describe this gallery"
                  rows="4"
                  required
                ></textarea>
              </div>
              
              <div className="form-group full-width">
                <label>Upload Images</label>
                <div className="file-upload">
                  <input
                    type="file"
                    name="images"
                    id="gallery-upload"
                    accept="image/*"
                    multiple
                    onChange={handleMediaChange}
                    required={!editingMediaId}
                  />
                  <label htmlFor="gallery-upload" className="upload-label">
                    <BsImages /> Choose Images
                  </label>
                </div>
                {mediaForm.images.length > 0 && (
                  <div className="file-info">
                    <BsCheck /> {mediaForm.images.length} image{mediaForm.images.length !== 1 ? 's' : ''} selected
                  </div>
                )}
              </div>
              
              <div className="form-actions">
                <button type="submit" className="btn btn-submit" disabled={isLoading}>
                  {isLoading ? (
                    <><div className="btn-spinner"></div> Processing...</>
                  ) : editingMediaId ? (
                    <><BsPencil /> Update Gallery</>
                  ) : (
                    <><BsPlus /> Create Gallery</>
                  )}
                </button>
              </div>
            </form>
            
            <div className="data-section">
              <div className="section-header">
                <h3><BsImages /> Media Galleries</h3>
                <div className="counter">{filteredMedia.length} galleries</div>
              </div>
              
              {isLoading && mediaList.length === 0 ? (
                <div className="loading-state">
                  <div className="loader"></div>
                  <p>Loading media galleries...</p>
                </div>
              ) : filteredMedia.length === 0 ? (
                <div className="empty-state">
                  <BsImages className="empty-icon" />
                  <p>No media galleries found</p>
                  {searchTerm && (
                    <p className="empty-subtext">Try adjusting your search criteria</p>
                  )}
                </div>
              ) : (
                <div className="gallery-grid">
                  {filteredMedia.map((item) => (
                    <div key={item._id} className="gallery-card">
                      <div className="gallery-thumbnail">
                        {item.images && item.images.length > 0 ? (
                          <>
                            <img 
                              src={`${BASE_URL}/uploads/${item.images[0]}`} 
                              alt={item.title} 
                            />
                            <div className="image-count">
                              <BsImages /> {item.images.length}
                            </div>
                          </>
                        ) : (
                          <div className="no-image">
                            <BsImages />
                            <span>No Images</span>
                          </div>
                        )}
                      </div>
                      <div className="gallery-info">
                        <h4>{item.title}</h4>
                        <p>{item.description}</p>
                      </div>
                      <div className="gallery-actions">
                        <button
                          onClick={() => handleMediaEdit(item)}
                          className="btn btn-edit"
                          title="Edit gallery"
                        >
                          <BsPencil /> Edit
                        </button>
                        <button
                          onClick={() => setConfirmDelete({ id: item._id, type: 'media' })}
                          className="btn btn-delete"
                          title="Delete gallery"
                        >
                          <BsTrash /> Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminSidebar>
  );
}

export default AdminNewsPanel;