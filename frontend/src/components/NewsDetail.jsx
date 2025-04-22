// components/NewsDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import "../styles/NewsDetail.css";

const NewsDetail = () => {
  const { id } = useParams();
  const [newsItem, setNewsItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNewsDetail = async () => {
      try {
        const res = await axios.get(`http://localhost:5001/api/news/${id}`);
        setNewsItem(res.data.news);
      } catch (err) {
        console.error("Error fetching news detail:", err);
        setError("Failed to load the article. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchNewsDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
        <p>Loading article...</p>
      </div>
    );
  }

  if (error || !newsItem) {
    return (
      <div className="error-container">
        <div className="error-icon">!</div>
        <h2>Article Not Found</h2>
        <p>{error || "This article may have been removed or is no longer available."}</p>
        <Link to="/news" className="primary-button">Return to News</Link>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="news-detail-container">
      <div className="news-detail-card">
        <div className="news-breadcrumb">
          <Link to="/news">News</Link> / <span>Article</span>
        </div>
        
        <div className="news-detail-header">
          <h1>{newsItem.title}</h1>
          <div className="meta">
            <div className="meta-item">
              <span className="meta-icon">📅</span>
              <span>{formatDate(newsItem.publishedDate)}</span>
            </div>
            <div className="meta-item">
              <span className="meta-icon">✍️</span>
              <span>{newsItem.author}</span>
            </div>
          </div>
        </div>
        
        {newsItem.image && (
          <div className="news-detail-image">
            <img 
              src={`http://localhost:5001/uploads/${newsItem.image}`} 
              alt={newsItem.title} 
            />
            {newsItem.imageCaption && (
              <p className="image-caption">{newsItem.imageCaption}</p>
            )}
          </div>
        )}
        
        <div className="news-detail-content">
          {/* If content is HTML formatted */}
          {newsItem.contentHtml ? (
            <div dangerouslySetInnerHTML={{ __html: newsItem.contentHtml }} />
          ) : (
            <p>{newsItem.content}</p>
          )}
        </div>
        
        {newsItem.tags && newsItem.tags.length > 0 && (
          <div className="news-tags">
            {newsItem.tags.map((tag, index) => (
              <span key={index} className="tag">{tag}</span>
            ))}
          </div>
        )}
        
        <div className="news-actions">
          <Link to="/news" className="back-button">
            <span className="back-icon">←</span> Back to News
          </Link>
          
          <div className="share-buttons">
            <button className="share-button" title="Share on Facebook">
              <span className="share-icon">f</span>
            </button>
            <button className="share-button" title="Share on Twitter">
              <span className="share-icon">𝕏</span>
            </button>
            <button className="share-button" title="Share via Email">
              <span className="share-icon">✉</span>
            </button>
          </div>
        </div>
      </div>
      
      {newsItem.relatedArticles && newsItem.relatedArticles.length > 0 && (
        <div className="related-articles">
          <h3>Related Articles</h3>
          <div className="related-grid">
            {newsItem.relatedArticles.map((article) => (
              <Link 
                key={article.id} 
                to={`/news/${article.id}`} 
                className="related-item"
              >
                {article.thumbnail && (
                  <img 
                    src={`http://localhost:5001/uploads/${article.thumbnail}`} 
                    alt={article.title} 
                  />
                )}
                <h4>{article.title}</h4>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsDetail;