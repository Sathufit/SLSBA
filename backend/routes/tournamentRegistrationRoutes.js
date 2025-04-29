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

    const allowedPaymentMethods = ["upload", "onsite", "Bank Transfer", "Credit Card", "PayPal"];
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
      isApproved: false // explicitly defaulting here
    });

    await newRegistration.save();

    await Tournament.findByIdAndUpdate(tournament, {
      $push: { registrations: newRegistration._id },
    });

    // ✅ Respond to frontend immediately
    res.status(201).json({ message: "✅ Registration successful!", data: newRegistration });

    // ✅ Send confirmation email
    try {
      const emailTemplate = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px; background-color: #f9f9f9;">
          <!-- Header with Logo -->
          <div style="text-align: center; margin-bottom: 30px; padding: 20px; background-color: #003f7d; border-radius: 8px;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">🏸 SLSBA Tournament</h1>
            <p style="color: #e15b29; margin: 10px 0 0 0; font-size: 18px;">Registration Confirmation</p>
          </div>

          <!-- Welcome Message -->
          <div style="background-color: #ffffff; padding: 25px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #2d3748; margin-bottom: 15px;">Welcome, ${fullName}! 👋</h2>
            <p style="color: #4a5568; line-height: 1.6; font-size: 16px;">
              Thank you for registering for the <strong>${tournamentExists.tournamentName}</strong>. We're excited to have you participate!
            </p>
          </div>

          <!-- Registration Details -->
          <div style="background-color: #f7fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #2d3748; margin-bottom: 15px; font-size: 18px;">Registration Details 📝</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #718096; width: 140px;">School Name:</td>
                <td style="padding: 8px 0; color: #2d3748; font-weight: 500;">${schoolName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #718096;">School ID:</td>
                <td style="padding: 8px 0; color: #2d3748; font-weight: 500;">${schoolID}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #718096;">Tournament:</td>
                <td style="padding: 8px 0; color: #2d3748; font-weight: 500;">${tournamentExists.tournamentName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #718096;">Date:</td>
                <td style="padding: 8px 0; color: #2d3748; font-weight: 500;">${new Date(tournamentExists.date).toLocaleDateString('en-GB', { 
                  day: '2-digit', 
                  month: 'long', 
                  year: 'numeric' 
                })}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #718096;">Venue:</td>
                <td style="padding: 8px 0; color: #2d3748; font-weight: 500;">${tournamentExists.venue}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #718096;">Players:</td>
                <td style="padding: 8px 0; color: #2d3748; font-weight: 500;">${parsedPlayers.length} registered</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #718096;">Payment:</td>
                <td style="padding: 8px 0; color: #2d3748; font-weight: 500;">${paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1)}</td>
              </tr>
            </table>
          </div>

          <!-- Next Steps -->
          <div style="background-color: #ebf8ff; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #2c5282; margin-bottom: 15px; font-size: 18px;">Next Steps 🎯</h3>
            <ul style="color: #2c5282; margin: 0; padding-left: 20px; line-height: 1.6;">
              <li>Keep this email for your records</li>
              <li>Complete payment (if not done already)</li>
              <li>Prepare your team for the tournament</li>
              <li>Check your email regularly for updates</li>
            </ul>
          </div>

          <!-- Footer -->
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eaeaea;">
            <div style="text-align: center; color: #718096;">
              <p style="margin-bottom: 10px; font-weight: bold;">Sri Lanka Schools Badminton Association</p>
              <div style="margin-bottom: 20px;">
                <p style="margin: 5px 0;">📧 slsba.official@gmail.com</p>
                <p style="margin: 5px 0;">📞 +94 XX XXX XXXX</p>
                <p style="margin: 5px 0;">🌐 www.slsba.lk</p>
              </div>
              <p style="font-size: 12px; color: #a0aec0;">This is an automated message. Please do not reply to this email.</p>
            </div>
          </div>
        </div>
      `;

      await transporter.sendMail({
        from: `"SLSBA Tournament Management" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `🏸 Registration Confirmed: ${tournamentExists.tournamentName}`,
        html: emailTemplate,
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
    const registrations = await TournamentRegistration.find()
      .populate("tournament", "tournamentName date venue category");
    res.status(200).json(registrations);
  } catch (error) {
    res.status(500).json({ error: "❌ Error fetching tournament registrations." });
  }
});

router.get("/tournament/:id", async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "❌ Invalid tournament ID format." });
  }
  try {
    const registrations = await TournamentRegistration.find({ tournament: id })
      .populate("tournament", "tournamentName date venue category");
    res.status(200).json(registrations);
  } catch (error) {
    res.status(500).json({ error: "❌ Error fetching tournament registrations." });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const registration = await TournamentRegistration.findByIdAndDelete(req.params.id);
    if (!registration) {
      return res.status(404).json({ message: "❌ Registration not found" });
    }
    res.status(200).json({ message: "✅ Registration deleted successfully!" });
  } catch (error) {
    res.status(500).json({ message: "❌ Internal server error", details: error.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { fullName, email, schoolName, tournament, players, paymentMethod, paymentStatus } = req.body;

    const registration = await TournamentRegistration.findById(req.params.id);
    if (!registration) {
      return res.status(404).json({ message: "❌ Registration not found" });
    }

    let parsedPlayers = players;
    if (typeof players === "string") {
      parsedPlayers = JSON.parse(players);
      if (!Array.isArray(parsedPlayers)) {
        return res.status(400).json({ error: "❌ Invalid players format." });
      }
    }

    registration.fullName = fullName || registration.fullName;
    registration.email = email || registration.email;
    registration.schoolName = schoolName || registration.schoolName;
    registration.tournament = tournament || registration.tournament;
    registration.players = parsedPlayers || registration.players;
    registration.paymentMethod = paymentMethod || registration.paymentMethod;
    registration.paymentStatus = paymentStatus || registration.paymentStatus;

    // ✅ Auto-approve if paid
    registration.isApproved = paymentStatus === "Paid";

    await registration.save();

    res.status(200).json({ message: "✅ Registration updated successfully!", data: registration });
  } catch (error) {
    res.status(500).json({ message: "❌ Internal server error", details: error.message });
  }
});

router.post("/:id/notify", async (req, res) => {
  const { id } = req.params;
  const { subject, message } = req.body;

  if (!subject || !message) {
    return res.status(400).json({ 
      error: "❌ Subject and message are required fields." 
    });
  }

  try {
    // 1. Fetch tournament details
    const tournament = await Tournament.findById(id);
    if (!tournament) {
      return res.status(404).json({ 
        error: "❌ Tournament not found." 
      });
    }

    // 2. Fetch registrations
    const registrations = await TournamentRegistration.find({ tournament: id });
    if (registrations.length === 0) {
      return res.status(404).json({ 
        error: "❌ No registered participants found for this tournament." 
      });
    }

    // 3. Configure transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // 4. Prepare sending emails
    const emailPromises = registrations.map(reg => {
      if (!reg.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(reg.email)) {
        console.warn(`⚠️ Skipping invalid email: ${reg.email}`);
        return Promise.resolve(); // Skip invalid emails
      }

      const emailTemplate = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px; background-color: #f9f9f9;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #003f7d; margin-bottom: 10px;">🏸 SLSBA Tournament Update</h1>
            <h2 style="color: #e15b29;">${tournament.tournamentName}</h2>
          </div>

          <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #2d3748; margin-bottom: 15px;">Hello ${reg.fullName},</h2>
            <div style="color: #4a5568; line-height: 1.6; margin-bottom: 20px;">
              ${message}
            </div>
            <div style="background-color: #f7fafc; padding: 15px; border-radius: 6px; margin-top: 20px;">
              <h3 style="color: #2d3748; margin-bottom: 10px;">Tournament Details</h3>
              <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date(tournament.date).toLocaleDateString()}</p>
              <p style="margin: 5px 0;"><strong>Venue:</strong> ${tournament.venue}</p>
              <p style="margin: 5px 0;"><strong>Category:</strong> ${tournament.category}</p>
            </div>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eaeaea; color: #718096;">
            <p style="margin-bottom: 5px;">🏸 Best Regards,</p>
            <p style="font-weight: bold; color: #2d3748;">Sri Lanka Schools Badminton Association (SLSBA)</p>
            <div style="margin-top: 15px; font-size: 0.9em;">
              <p>📧 Email: slsba.official@gmail.com</p>
              <p>📞 Contact: +94 77 123 4567</p>
            </div>
          </div>

          <div style="text-align: center; margin-top: 20px; font-size: 0.8em; color: #a0aec0;">
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      `;

      return transporter.sendMail({
        from: `"SLSBA Tournament Management" <${process.env.EMAIL_USER}>`,
        to: reg.email,
        subject: `🏸 ${subject}`,
        text: `Hello ${reg.fullName},\n\n${message}\n\nTournament Details:\nDate: ${new Date(tournament.date).toLocaleDateString()}\nVenue: ${tournament.venue}\nCategory: ${tournament.category}\n\n🏸 Best Regards,\nSri Lanka Schools Badminton Association (SLSBA)`,
        html: emailTemplate,
      });
    });

    // 5. Send all emails
    await Promise.all(emailPromises);

    // 6. Success response
    console.log(`✅ Successfully sent notifications to ${registrations.length} participants.`);
    res.status(200).json({ 
      message: `✅ Notifications sent successfully to ${registrations.length} participants!` 
    });

  } catch (error) {
    console.error("❌ Error sending notifications:", error.message);
    res.status(500).json({ 
      error: "❌ Failed to send notifications.",
      details: error.message 
    });
  }
});

module.exports = router;
