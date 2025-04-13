const Media = require("../models/MediaModel");
const fs = require("fs");
const path = require("path");

// Add media with multiple images
const addMedia = async (req, res) => {
  const { title, description } = req.body;
  const images = req.files ? req.files.map(file => file.filename) : [];

  try {
    const media = new Media({ title, description, images });
    await media.save();
    res.status(201).json({ media });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to upload media" });
  }
};

// Get all media
const getAllMedia = async (req, res) => {
  try {
    const media = await Media.find().sort({ createdAt: -1 });
    res.status(200).json({ media });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch media" });
  }
};

// Update media (replace title/description/images)
const updateMedia = async (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;
  const newImages = req.files ? req.files.map(file => file.filename) : [];

  try {
    const media = await Media.findById(id);
    if (!media) {
      return res.status(404).json({ message: "Media not found" });
    }

    // Optional: delete old images if new ones are uploaded
    if (newImages.length > 0) {
      media.images.forEach(img => {
        const filePath = path.join(__dirname, "..", "uploads", img);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      });
      media.images = newImages;
    }

    media.title = title;
    media.description = description;

    await media.save();
    res.status(200).json({ media });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update media" });
  }
};

// Delete media
const deleteMedia = async (req, res) => {
  const { id } = req.params;
  try {
    const media = await Media.findByIdAndDelete(id);
    if (!media) {
      return res.status(404).json({ message: "Media not found" });
    }

    // Delete image files from server
    media.images.forEach(img => {
      const filePath = path.join(__dirname, "..", "uploads", img);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    });

    res.status(200).json({ message: "Media deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete media" });
  }
};

module.exports = {
  addMedia,
  getAllMedia,
  updateMedia,
  deleteMedia,
};
