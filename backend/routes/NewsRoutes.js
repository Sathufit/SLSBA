const express = require("express");
const router = express.Router();
const NewsController = require("../controllers/NewsControllers");
const upload = require("../middleware/upload");


router.get("/", NewsController.getAllNews); // ✅ THIS ROUTE
router.post("/", upload.single("image"), NewsController.addNews);
router.get("/:id", NewsController.getByIdNews);
router.put("/:id", NewsController.updateNews);
router.delete("/:id", NewsController.deleteNews);

module.exports = router;
