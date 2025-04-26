const mongoose = require("mongoose");

const TrainingSchema = new mongoose.Schema({
  programid: { type: mongoose.Schema.Types.ObjectId, unique: true, default: () => new mongoose.Types.ObjectId() },
  programname: { type: String, required: true },
  trainingtype: { type: String, required: true },
  time: { type: String, required: true },
  location: { type: String, required: true },
  description: { type: String },   // ✅ added
  capacity: { type: Number },       // ✅ added
  startDate: { type: Date },         // ✅ added
  endDate: { type: Date }            // ✅ added
});

module.exports = mongoose.model("Training", TrainingSchema);
