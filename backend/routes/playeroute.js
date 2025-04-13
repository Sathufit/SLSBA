const express = require("express");
const router = express.Router();
const playerController = require("../controllers/playercontroller");

router.get("/", playerController.getPlayer); // ✅ This handles GET /api/players
router.post("/", playerController.addPlayer);
router.get("/:id", playerController.getById);
router.put("/:id", playerController.updateplayer);
router.delete("/:id", playerController.deleteplayer);

module.exports = router;
