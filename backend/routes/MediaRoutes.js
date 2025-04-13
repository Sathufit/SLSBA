const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const {
  addMedia,
  getAllMedia,
  updateMedia,
  deleteMedia,
} = require("../controllers/MediaController");

// Upload up to 20 images per media entry
router.post("/", upload.array("images", 20), addMedia);
router.get("/", getAllMedia);
router.put("/:id", upload.array("images", 20), updateMedia);
router.delete("/:id", deleteMedia);

module.exports = router;
