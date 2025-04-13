const mongoose = require("mongoose");

const TournamentSchema = new mongoose.Schema({
  tournamentName: {
    type: String,
    required: [true, "Tournament name is required"],
    trim: true,
  },
  category: {
    type: String,
    enum: ["Under 13", "Under 15", "Under 17", "Under 19", "Open"],
    required: [true, "Category is required"],
  },
  date: {
    type: Date,
    required: [true, "Tournament date is required"],
  },
  registrationDeadline: {
    type: Date,
    required: [true, "Registration deadline is required"],
  },
  venue: {
    type: String,
    required: [true, "Venue is required"],
    trim: true,
  },
  maxParticipants: {
    type: Number,
    default: 16,
    min: [2, "At least 2 participants required"],
    max: [500, "Maximum 500 participants allowed"],
  },
  description: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ["Registration Open", "Coming Soon", "Completed"],
    default: "Registration Open",
  },
  coordinator: {
    type: String,
    trim: true,
  },
  contact: {
    type: String,
    trim: true,
    required: true,
    match: [/^\d{10}$/, "Contact number must be exactly 10 digits"]
  },  
  prizes: {
    type: String,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Tournament", TournamentSchema);
