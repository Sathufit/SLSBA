const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
require("dotenv").config();

const TournamentRegistration = require("../models/TournamentRegistration");
const Tournament = require("../models/Tournament");

const router = express.Router();

// ✅ Ensure uploads folder exists
const uploadDir = path.join(__dirname, "../uploads/");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ✅ Configure Multer for File Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

// ✅ Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,     
    pass: process.env.EMAIL_PASS,    
  },
});

// ✅ Register for a tournament
router.post("/register", upload.single("paymentFile"), async (req, res) => {
  try {
    console.log("📌 Registration request received:", req.body);

    const { fullName, email, schoolName, schoolID, tournament, players, paymentMethod } = req.body;

    if (!fullName || !email || !schoolName || !schoolID || !tournament || !players || !paymentMethod) {
      return res.status(400).json({ error: "❌ Missing required fields." });
    }

    if (!mongoose.Types.ObjectId.isValid(tournament)) {
      return res.status(400).json({ error: "❌ Invalid tournament ID format." });
    }

    const tournamentExists = await Tournament.findById(tournament);
    if (!tournamentExists) {
      return res.status(404).json({ error: "❌ Tournament not found." });
    }

    const alreadyRegistered = await TournamentRegistration.findOne({ schoolID, tournament });
    if (alreadyRegistered) {
      return res.status(409).json({ error: "❌ School already registered for this tournament." });
    }

    let parsedPlayers;
    try {
      parsedPlayers = typeof players === "string" ? JSON.parse(players) : players;
      if (!Array.isArray(parsedPlayers)) throw new Error("Players must be an array.");
    } catch (err) {
      return res.status(400).json({ error: "❌ Invalid players format.", details: err.message });
    }

    const filePath = req.file ? req.file.filename : "";

    const allowedPaymentMethods = ["upload", "onsite", "stripe"];
    if (!allowedPaymentMethods.includes(paymentMethod)) {
      return res.status(400).json({ error: "❌ Invalid payment method." });
    }

    const newRegistration = new TournamentRegistration({
      fullName,
      email,
      schoolName,
      schoolID,
      tournament,
      players: parsedPlayers,
      paymentMethod,
      paymentFile: filePath,
      paymentStatus: "Pending",
    });

    await newRegistration.save();

    await Tournament.findByIdAndUpdate(tournament, {
      $push: { registrations: newRegistration._id },
    });

    // ✅ Respond to frontend immediately
    res.status(201).json({ message: "✅ Registration successful!", data: newRegistration });

    
try {
  await transporter.sendMail({
    from: `"SLSBA" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "🏸 SLSBA Tournament Registration Confirmation",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px; background-color: #f9f9f9;">
        <h2 style="color: #4F46E5;">Hello ${fullName},</h2>

        <p style="font-size: 16px; color: #333;">
          🎉 We're excited to confirm your registration for the upcoming <strong>SLSBA Tournament</strong>!
        </p>

        <table style="width: 100%; margin-top: 20px; font-size: 15px; color: #333;">
          <tr>
            <td style="padding: 8px 0;"><strong>🏫 School:</strong></td>
            <td>${schoolName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;"><strong>🆔 Tournament ID:</strong></td>
            <td>${tournament}</td>
          </tr>
        </table>

        <p style="margin-top: 20px; font-size: 16px;">
          We'll keep you updated with all tournament-related information as the event approaches.
        </p>

        <p style="margin-top: 30px; font-size: 16px;">Thank you for your participation and best of luck! 🏸</p>

        <p style="margin-top: 40px; font-size: 14px; color: #555;">
          Warm regards,<br />
          <strong>Sri Lanka Schools Badminton Association (SLSBA)</strong><br />
          📧 <a href="mailto:slsba.official@gmail.com" style="color: #4F46E5;">slsba.official@gmail.com</a>
        </p>
      </div>
    `,
  });

  console.log("✅ Confirmation email sent to:", email);
} catch (emailErr) {
  console.error("⚠️ Failed to send confirmation email:", emailErr.message);
}


  } catch (error) {
    console.error("❌ Error during registration:", error);
    res.status(500).json({ error: "❌ Error processing registration.", details: error.message });
  }
});


router.get("/all", async (req, res) => {
  try {
    console.log("📌 Fetching all registrations...");
    const registrations = await TournamentRegistration.find()
      .populate("tournament", "tournamentName date venue category");

    console.log("✅ Registrations Found:", registrations.length);
    res.status(200).json(registrations);
  } catch (error) {
    console.error("❌ Error fetching registrations:", error);
    res.status(500).json({ error: "❌ Error fetching tournament registrations." });
  }
});


// ✅ Fetch registrations by tournament
router.get("/tournament/:id", async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "❌ Invalid tournament ID format." });
  }

  try {
    const tournamentExists = await Tournament.findById(id);
    if (!tournamentExists) {
      return res.status(404).json({ error: "❌ Tournament not found." });
    }

    const registrations = await TournamentRegistration.find({ tournament: id })
      .populate("tournament", "tournamentName date venue category");

    res.status(200).json(registrations);
  } catch (error) {
    console.error("❌ Error fetching tournament registrations:", error);
    res.status(500).json({ error: "❌ Error fetching tournament registrations." });
  }
});

// ✅ Delete a registration
router.delete("/:id", async (req, res) => {
  try {
    const registration = await TournamentRegistration.findByIdAndDelete(req.params.id);
    if (!registration) {
      return res.status(404).json({ message: "❌ Registration not found" });
    }
    res.status(200).json({ message: "✅ Registration deleted successfully!" });
  } catch (error) {
    console.error("❌ Error deleting registration:", error);
    res.status(500).json({ message: "❌ Internal server error", details: error.message });
  }
});

// ✅ Update registration
router.put("/:id", async (req, res) => {
  try {
    const { fullName, email, schoolName, tournament, players, paymentMethod, paymentStatus } = req.body;

    const registration = await TournamentRegistration.findById(req.params.id);
    if (!registration) {
      return res.status(404).json({ message: "❌ Registration not found" });
    }

    let parsedPlayers = players;
    try {
      if (typeof players === "string") {
        parsedPlayers = JSON.parse(players);
        if (!Array.isArray(parsedPlayers)) {
          throw new Error("Players must be an array.");
        }
      }
    } catch (err) {
      return res.status(400).json({ error: "❌ Invalid players format.", details: err.message });
    }

    registration.fullName = fullName || registration.fullName;
    registration.email = email || registration.email;
    registration.schoolName = schoolName || registration.schoolName;
    registration.tournament = tournament || registration.tournament;
    registration.players = parsedPlayers || registration.players;
    registration.paymentMethod = paymentMethod || registration.paymentMethod;
    registration.paymentStatus = paymentStatus || registration.paymentStatus;

    await registration.save();

    res.status(200).json({ message: "✅ Registration updated successfully!", data: registration });
  } catch (error) {
    console.error("❌ Error updating registration:", error);
    res.status(500).json({ message: "❌ Internal server error", details: error.message });
  }
});

module.exports = router;
