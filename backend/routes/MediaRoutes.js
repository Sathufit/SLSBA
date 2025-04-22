const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");


const Media = require("../models/MediaModel"); // ✅ Add this to fetch by ID

const {
  addMedia,
  getAllMedia,
  updateMedia,
  deleteMedia,
} = require("../controllers/MediaController");

// Upload up to 20 images per media entry
router.post("/", upload.array("images", 20), addMedia);
router.get("/", getAllMedia);

// ✅ New route to get a single media gallery by ID
router.get("/:id", async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);
    if (!media) {
      return res.status(404).json({ message: "Gallery not found" });
    }
    res.json(media); // ✅ return the media object directly
  } catch (err) {
    console.error("Error fetching media by ID:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/:id", upload.array("images", 20), updateMedia);
router.delete("/:id", deleteMedia);

module.exports = router;
