const express = require("express");
const router = express.Router();
const trainingController = require("../controllers/trainingcontroller");

router.get("/", trainingController.getTrainings);
router.post("/", trainingController.addTraining);
router.get("/:id", trainingController.getById);
router.put("/:id", trainingController.updateTraining);
router.delete("/:id", trainingController.deleteTraining);

module.exports = router;
