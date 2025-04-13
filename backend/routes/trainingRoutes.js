const express = require("express");
const router = express.Router();
const trainingController = require("../controllers/trainingcontroller");

// Define proper routes
router.get("/", trainingController.getTrainings);
router.post("/", trainingController.addTraining);
router.get("/:id", trainingController.getById);
router.put("/:id", trainingController.updateTraining); // ✅ FIXED: should be PUT
router.delete("/:id", trainingController.deleteTraining); // ✅ FIXED: should be DELETE

module.exports = router;
