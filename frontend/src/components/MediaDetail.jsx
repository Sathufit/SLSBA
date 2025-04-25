// components/MediaDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import "../styles/MediaDetail.css";
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const MediaDetail = () => {
  const { id } = useParams();
  const [gallery, setGallery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/media/${id}`);
        setGallery(res.data);
        if (res.data.images && res.data.images.length > 0) {
          setSelectedImage(res.data.images[0]);
        }
      } catch (err) {
        console.error("Error fetching media gallery:", err);
        setError("Failed to load the gallery. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchGallery();
  }, [id]);

  // Handle image selection
  const handleImageClick = (image, index) => {
    setSelectedImage(image);
    setCurrentIndex(index);
  };

  // Handle navigation
  const handlePrevImage = () => {
    if (!gallery?.images?.length) return;
    const newIndex = (currentIndex - 1 + gallery.images.length) % gallery.images.length;
    setCurrentIndex(newIndex);
    setSelectedImage(gallery.images[newIndex]);
  };

  const handleNextImage = () => {
    if (!gallery?.images?.length) return;
    const newIndex = (currentIndex + 1) % gallery.images.length;
    setCurrentIndex(newIndex);
    setSelectedImage(gallery.images[newIndex]);
  };

  // Loading state
  if (loading) {
    return (
      <div className="media-loading-container">
        <div className="media-loader"></div>
        <p>Loading gallery...</p>
      </div>
    );
  }

  // Error state
  if (error || !gallery) {
    return (
      <div className="media-error-container">
        <div className="media-error-icon">!</div>
        <h2>Gallery Not Found</h2>
        <p>{error || "This gallery may have been removed or is no longer available."}</p>
        <Link to="/media" className="media-primary-button">Return to Galleries</Link>
      </div>
    );
  }

  // Empty gallery
  if (!gallery.images || gallery.images.length === 0) {
    return (
      <div className="media-detail-container">
        <div className="media-breadcrumb">
          <Link to="/media">Galleries</Link> / <span>{gallery.title}</span>
        </div>
        <div className="media-header">
          <h1>{gallery.title}</h1>
          {gallery.date && <p className="media-date">Posted on {new Date(gallery.date).toLocaleDateString()}</p>}
          <p className="media-description">{gallery.description}</p>
        </div>
        <div className="media-empty-state">
          <div className="media-empty-icon">🖼️</div>
          <h3>No Images</h3>
          <p>This gallery doesn't contain any images yet.</p>
        </div>
        <div className="media-actions">
          <Link to="/media" className="media-back-button">
            <span className="media-back-icon">←</span> Back to Galleries
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="media-detail-container">
      <div className="media-breadcrumb">
        <Link to="/media">Galleries</Link> / <span>{gallery.title}</span>
      </div>

      <div className="media-header">
        <h1>{gallery.title}</h1>
        {gallery.date && <p className="media-date">Posted on {new Date(gallery.date).toLocaleDateString()}</p>}
        <p className="media-description">{gallery.description}</p>
        <div className="media-meta">
          <span>{gallery.images.length} image{gallery.images.length !== 1 ? 's' : ''}</span>
          {gallery.category && <span className="media-category">{gallery.category}</span>}
        </div>
      </div>

      {/* Featured Image View */}
      {selectedImage && (
        <div className="media-featured-container">
          <button 
            className="media-nav-button media-prev-button" 
            onClick={handlePrevImage}
            aria-label="Previous image"
          >
            ‹
          </button>
          
          <div className="media-featured-image">
          <img 
            src={`${BASE_URL}/uploads/${selectedImage}`} 
            alt={`${gallery.title} - Featured`} 
          />
            <div className="media-counter">
              {currentIndex + 1} / {gallery.images.length}
            </div>
          </div>
          
          <button 
            className="media-nav-button media-next-button" 
            onClick={handleNextImage}
            aria-label="Next image"
          >
            ›
          </button>
        </div>
      )}

      {/* Thumbnail Gallery */}
      <div className="media-thumbnail-gallery">
        {gallery.images.map((img, i) => (
          <div 
            key={i} 
            className={`media-thumbnail ${i === currentIndex ? 'active' : ''}`}
            onClick={() => handleImageClick(img, i)}
          >
            <img
              src={`${BASE_URL}/uploads/${img}`}
              alt={`${gallery.title} thumbnail ${i + 1}`}
              loading="lazy"
            />
          </div>
        ))}
      </div>

      {/* Gallery Grid */}
      <h2 className="media-section-title">All Images</h2>
      <div className="media-gallery-grid">
        {gallery.images.map((img, i) => (
          <div 
            key={i} 
            className="media-image-box"
            onClick={() => handleImageClick(img, i)}
          >
            <img
              src={`${BASE_URL}/uploads/${img}`}
              alt={`${gallery.title} ${i + 1}`}
              className="media-grid-image"
              loading="lazy"
            />
          </div>
        ))}
      </div>

      <div className="media-actions">
        <Link to="/news" className="media-back-button">
          <span className="media-back-icon">←</span> Back to Galleries
        </Link>
        
        {gallery.downloadAll && (
          <a href={`${BASE_URL}/api/media/${id}/download`} className="media-download-button">
          <span className="media-download-icon">↓</span> Download All
          </a>        
        )}
      </div>
    </div>
  );
};

export default MediaDetail;