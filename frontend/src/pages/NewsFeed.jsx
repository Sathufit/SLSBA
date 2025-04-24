import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { ChevronRight, Calendar, MapPin, Users, Filter, Clock } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/NewsFeed.css";

const NewsFeed = () => {
  const [news, setNews] = useState([]);
  const [media, setMedia] = useState([]);
  const [category, setCategory] = useState("All Categories");
  const [loading, setLoading] = useState(true);
  const [expandedNews, setExpandedNews] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const newsResponse = await axios.get("http://localhost:5001/api/news");
        const mediaResponse = await axios.get("http://localhost:5001/api/media");
        
        setNews(newsResponse.data.news);
        setMedia(mediaResponse.data.media);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleNewsExpand = (newsId) => {
    setExpandedNews(expandedNews === newsId ? null : newsId);
  };

  const categories = ["All Categories", "Tournament Updates", "Training", "Player Spotlight"];

  return (
    <>
      <Navbar />

      {/* Hero Section */}
      <div className="hero-section5">
        <div className="hero-content5">
          <h1>News & Media</h1>
          <p>Stay updated with the latest badminton news and event highlights across Sri Lanka</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="content-container">
        {/* Search and Filter Section */}
        <div className="search-filter-container">
          <div className="search-box">
            <input type="text" placeholder="Search news..." />
          </div>
          <div className="filter-options">
            <div className="filter-group">
              <Filter size={16} />
              <select 
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading-spinner">Loading...</div>
        ) : (
          <>
            {/* Latest News Section */}
            <section className="content-section">
              <div className="section-header">
                <h2>Latest News</h2>
                <Link to="/news" className="view-all-link">
                  View All <ChevronRight size={16} />
                </Link>
              </div>

              <div className="news-grid">
                {news
                  .filter(item => category === "All Categories" || item.category === category)
                  .map((item) => (
                    <div key={item._id} className="news-card">
                      {item.image && (
                        <div className="news-image-container">
                          <img
                            src={`http://localhost:5001/uploads/${item.image}`}
                            alt={item.title}
                            className="news-image"
                          />
                          <span className="news-category">{item.category}</span>
                        </div>
                      )}
                      <div className="news-content">
                        <h3 className="news-title">{item.title}</h3>
                        
                        <div className="news-meta">
                          <div className="meta-item">
                            <Clock size={14} />
                            <span>{item.publishedDate}</span>
                          </div>
                          <div className="meta-item">
                            <span>By {item.author}</span>
                          </div>
                        </div>
                        
                        <div className="news-excerpt">
                          {expandedNews === item._id ? (
                            <p>{item.content}</p>
                          ) : (
                            <p>{`${item.content.slice(0, 120)}...`}</p>
                          )}
                        </div>
                        
                        <div className="news-actions">
                          <button 
                            onClick={() => toggleNewsExpand(item._id)}
                            className="text-button"
                          >
                            {expandedNews === item._id ? "Show Less" : "Read More"}
                          </button>
                          <Link to={`/news/${item._id}`} className="primary-button">
                            Full Article
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </section>

            {/* Media Gallery Section */}
            <section className="content-section">
              <div className="section-header">
                <h2>Event Gallery</h2>
                <Link to="/media" className="view-all-link">
                  View All <ChevronRight size={16} />
                </Link>
              </div>

              <div className="media-grid">
                {media.map((item) => (
                  <div key={item._id} className="media-card">
                    <h3 className="media-title">{item.title}</h3>
                    <p className="media-description">{item.description}</p>
                    
                    <div className="media-images">
                      {item.images?.slice(0, 4).map((img, i) => (
                        <div key={i} className="media-image-container">
                          <img
                            src={`http://localhost:5001/uploads/${img}`}
                            alt={`${item.title} ${i + 1}`}
                            className="media-image"
                          />
                        </div>
                      ))}
                      {item.images?.length > 4 && (
                        <div className="more-images">
                          <span>+{item.images.length - 4} more</span>
                        </div>
                      )}
                    </div>
                    
                    <Link to={`/media/${item._id}`} className="view-gallery-link">
                      View Full Gallery
                    </Link>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </div>

      <Footer />
    </>
  );
};

export default NewsFeed;