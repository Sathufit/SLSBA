import React, { useEffect, useState } from "react";
import "../styles/AdminNewsPanel.css";
import axios from "axios";
import AdminSidebar from "../components/AdminSidebar";
import {
  Calendar as CalendarIcon,
  Edit2 as EditIcon,
  Trash2 as TrashIcon,
  Plus as PlusIcon,
  FileText as NewsIcon,
  Image as ImageIcon,
  Info as InfoIcon,
  AlertCircle as AlertIcon
} from "lucide-react";

const AdminNewsPanel = () => {
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
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("news"); // "news" or "media"
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "" }), 3000);
  };

  const fetchNews = async () => {
    try {
      const res = await axios.get("http://localhost:5001/api/news");
      setNews(res.data.news || []);
    } catch (error) {
      console.error("Failed to fetch news:", error);
      showNotification("Failed to fetch news", "error");
    }
  };

  const fetchMedia = async () => {
    try {
      const res = await axios.get("http://localhost:5001/api/media");
      setMediaList(res.data.media || []);
    } catch (error) {
      console.error("Failed to fetch media:", error);
      showNotification("Failed to fetch media", "error");
    }
  };

  useEffect(() => {
    fetchNews();
    fetchMedia();
  }, []);

  const handleChange = (e) => {
    if (e.target.name === "image") {
      setFormData({ ...formData, image: e.target.files[0] });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key]) data.append(key, formData[key]);
    });

    try {
      if (editingId) {
        await axios.put(`http://localhost:5001/api/news/${editingId}`, data);
        showNotification("News updated successfully", "success");
      } else {
        await axios.post("http://localhost:5001/api/news", data);
        showNotification("News added successfully", "success");
      }

      setFormData({
        title: "",
        content: "",
        category: "",
        author: "",
        publishedDate: "",
        image: null,
      });
      setEditingId(null);
      fetchNews();
    } catch (err) {
      console.error("Error in handleSubmit:", err);
      showNotification("Operation failed", "error");
    }
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setFormData({
      title: item.title,
      content: item.content,
      category: item.category,
      author: item.author,
      publishedDate: item.publishedDate?.split('T')[0] || "",
      image: null,
    });
    setActiveTab("news");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this news article?")) return;
    try {
      await axios.delete(`http://localhost:5001/api/news/${id}`);
      fetchNews();
      showNotification("News deleted successfully", "success");
    } catch (err) {
      console.error(err);
      showNotification("Delete failed", "error");
    }
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

  const handleMediaDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this media item?")) return;
    try {
      await axios.delete(`http://localhost:5001/api/media/${id}`);
      fetchMedia();
      showNotification("Media deleted successfully", "success");
    } catch (err) {
      console.error(err);
      showNotification("Delete failed", "error");
    }
  };

  const handleMediaSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("title", mediaForm.title);
    data.append("description", mediaForm.description);
    mediaForm.images.forEach((img) => data.append("images", img));

    try {
      if (editingMediaId) {
        await axios.put(`http://localhost:5001/api/media/${editingMediaId}`, data);
        showNotification("Media updated successfully", "success");
      } else {
        await axios.post("http://localhost:5001/api/media", data);
        showNotification("Media uploaded successfully", "success");
      }
      setMediaForm({ title: "", description: "", images: [] });
      setEditingMediaId(null);
      fetchMedia();
    } catch (err) {
      console.error(err);
      showNotification("Upload failed", "error");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="admin-layout">
      <AdminSidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />

      <div className={`admin-content ${isCollapsed ? 'expanded' : ''}`}>
        {notification.show && (
          <div className={`notification ${notification.type}`}>
            {notification.type === "error" ? <AlertIcon size={16} /> : <InfoIcon size={16} />}
            {notification.message}
          </div>
        )}

        <div className="page-header">
          <div className="page-title">
            <h1>News & Media Management</h1>
            <p>Create, edit, and manage news articles and event media</p>
          </div>
        </div>

        <div className="tab-navigation">
          <button 
            className={`tab-button ${activeTab === 'news' ? 'active' : ''}`} 
            onClick={() => setActiveTab('news')}
          >
            <NewsIcon size={16} /> News Articles
          </button>
          <button 
            className={`tab-button ${activeTab === 'media' ? 'active' : ''}`} 
            onClick={() => setActiveTab('media')}
          >
            <ImageIcon size={16} /> Media Gallery
          </button>
        </div>

        {/* News Section */}
        {activeTab === 'news' && (
          <div className="content-section">
            <div className="section-header">
              <h2>
                <NewsIcon size={18} />
                {editingId ? "Edit News Article" : "Add News Article"}
              </h2>
              {editingId && (
                <button 
                  className="cancel-edit-btn"
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
                  }}
                >
                  Cancel Edit
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="admin-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Title</label>
                  <input 
                    type="text" 
                    name="title" 
                    value={formData.title} 
                    onChange={handleChange} 
                    required 
                    placeholder="Article title"
                  />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <input 
                    type="text" 
                    name="category" 
                    value={formData.category} 
                    onChange={handleChange} 
                    required 
                    placeholder="News category"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Author</label>
                  <input 
                    type="text" 
                    name="author" 
                    value={formData.author} 
                    onChange={handleChange} 
                    required 
                    placeholder="Author name"
                  />
                </div>
                <div className="form-group">
                  <label>Published Date</label>
                  <input 
                    type="date" 
                    name="publishedDate" 
                    value={formData.publishedDate} 
                    onChange={handleChange} 
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Content</label>
                <textarea 
                  name="content" 
                  value={formData.content} 
                  onChange={handleChange} 
                  required 
                  rows="6"
                  placeholder="Write article content here..."
                />
              </div>
              <div className="form-group">
                <label>Featured Image</label>
                <div className="file-input-wrapper">
                  <input type="file" name="image" accept="image/*" onChange={handleChange} id="news-image" />
                  <label htmlFor="news-image" className="file-input-label">
                    <ImageIcon size={16} /> {formData.image ? formData.image.name : "Choose image"}
                  </label>
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" className="primary-button">
                  {editingId ? <><EditIcon size={16} /> Update Article</> : <><PlusIcon size={16} /> Add Article</>}
                </button>
              </div>
            </form>

            <div className="section-header">
              <h2>
                <NewsIcon size={18} />
                Published News Articles
              </h2>
            </div>

            {news.length === 0 ? (
              <div className="empty-state">
                <NewsIcon size={48} />
                <p>No news articles yet</p>
                <span>Add your first news article using the form above</span>
              </div>
            ) : (
              <div className="data-table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Author</th>
                      <th>Published</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {news.map((item) => (
                      <tr key={item._id}>
                        <td className="title-cell">{item.title}</td>
                        <td><span className="category-badge">{item.category}</span></td>
                        <td>{item.author}</td>
                        <td><CalendarIcon size={14} /> {formatDate(item.publishedDate)}</td>
                        <td className="action-buttons-cell">
                          <button className="action-btn edit" onClick={() => handleEdit(item)}>
                            <EditIcon size={14} /> Edit
                          </button>
                          <button className="action-btn delete" onClick={() => handleDelete(item._id)}>
                            <TrashIcon size={14} /> Delete
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

        {/* Media Section */}
        {activeTab === 'media' && (
          <div className="content-section">
            <div className="section-header">
              <h2>
                <ImageIcon size={18} />
                {editingMediaId ? "Edit Media Gallery" : "Add Media Gallery"}
              </h2>
              {editingMediaId && (
                <button 
                  className="cancel-edit-btn"
                  onClick={() => {
                    setEditingMediaId(null);
                    setMediaForm({ title: "", description: "", images: [] });
                  }}
                >
                  Cancel Edit
                </button>
              )}
            </div>

            <form onSubmit={handleMediaSubmit} encType="multipart/form-data" className="admin-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Title</label>
                  <input 
                    type="text" 
                    name="title" 
                    value={mediaForm.title} 
                    onChange={handleMediaChange} 
                    required 
                    placeholder="Gallery title"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea 
                  name="description" 
                  value={mediaForm.description} 
                  onChange={handleMediaChange} 
                  required 
                  rows="4"
                  placeholder="Gallery description"
                />
              </div>
              <div className="form-group">
                <label>Images (Max 20)</label>
                <div className="file-input-wrapper">
                  <input 
                    type="file" 
                    name="images" 
                    accept="image/*" 
                    multiple 
                    onChange={handleMediaChange} 
                    required 
                    id="media-images" 
                  />
                  <label htmlFor="media-images" className="file-input-label">
                    <ImageIcon size={16} /> {mediaForm.images.length > 0 ? `${mediaForm.images.length} image(s) selected` : "Choose images"}
                  </label>
                </div>
                {mediaForm.images.length > 0 && (
                  <div className="file-names">
                    {mediaForm.images.length} file(s) selected
                  </div>
                )}
              </div>
              <div className="form-actions">
                <button type="submit" className="primary-button">
                  {editingMediaId ? <><EditIcon size={16} /> Update Gallery</> : <><PlusIcon size={16} /> Create Gallery</>}
                </button>
              </div>
            </form>

            <div className="section-header">
              <h2>
                <ImageIcon size={18} />
                Media Galleries
              </h2>
            </div>

            {mediaList.length === 0 ? (
              <div className="empty-state">
                <ImageIcon size={48} />
                <p>No media galleries yet</p>
                <span>Upload your first gallery using the form above</span>
              </div>
            ) : (
              <div className="media-grid">
                {mediaList.map((item) => (
                  <div key={item._id} className="media-card">
                    <div className="media-card-header">
                      <h3>{item.title}</h3>
                      <div className="media-actions">
                        <button className="action-btn edit" onClick={() => handleMediaEdit(item)}>
                          <EditIcon size={14} />
                        </button>
                        <button className="action-btn delete" onClick={() => handleMediaDelete(item._id)}>
                          <TrashIcon size={14} />
                        </button>
                      </div>
                    </div>
                    <p className="media-description">{item.description}</p>
                    <div className="media-preview">
                      {Array.isArray(item.images) && item.images.length > 0 ? (
                        <div className="media-thumbnails">
                          <img 
                            src={`http://localhost:5001/uploads/${item.images[0]}`} 
                            alt={`${item.title} - primary`} 
                            className="primary-thumbnail"
                          />
                          <div className="thumbnail-count">
                            {item.images.length > 1 && `+${item.images.length - 1} more`}
                          </div>
                        </div>
                      ) : (
                        <div className="no-images">
                          <ImageIcon size={32} />
                          <span>No images</span>
                        </div>
                      )}
                    </div>
                    <div className="image-count">
                      {item.images && Array.isArray(item.images) && (
                        <span>{item.images.length} image{item.images.length !== 1 ? 's' : ''}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminNewsPanel;