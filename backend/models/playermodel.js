const mongoose = require("mongoose");

const playerSchema = new mongoose.Schema({
  playerid: {
    type: String,
    unique: true,
    required: true,
    default: () => new mongoose.Types.ObjectId().toString()
  },
  fullname: { type: String, required: true },
  dateofbirth: { type: Date, required: true },
  gender: { type: String, required: true },
  schoolname: { type: String, required: true },
  contactnumber: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  address: { type: String, required: true },
  guardianname: { type: String, required: true },
  guardiancontact: { type: String, required: true },
  programid: { type: String }, // Optional for tracking which training
});

const Player = mongoose.model("Player", playerSchema);
module.exports = Player;
