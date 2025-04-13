const mongoose = require("mongoose");

const TrainingSchema = new mongoose.Schema({
    programid: { type: mongoose.Schema.Types.ObjectId, unique: true, default: () => new mongoose.Types.ObjectId() },
    programname: { type: String, required: true },
    trainingtype: { type: String, required: true },
    time: { type: String, required: true },
    location: { type: String, required: true }
});

module.exports = mongoose.model("Training", TrainingSchema);
