const express = require("express");
const Tournament = require("../models/Tournament"); 
const TournamentRegistration = require("../models/TournamentRegistration");

const router = express.Router();

router.post("/create", async (req, res) => {
  try {
    const {
      tournamentName,
      category,
      date,
      registrationDeadline,
      venue,
      maxParticipants,
      status,
      coordinator,
      contact,
      prizes,
      description,
    } = req.body;

    // ✅ Check required fields
    if (!tournamentName || !date || !registrationDeadline || !venue || !maxParticipants) {
      return res.status(400).json({ error: "❌ Missing required fields" });
    }

    const newTournament = new Tournament({
      tournamentName,
      category,
      date,
      registrationDeadline,
      venue,
      maxParticipants,
      status: status || "Registration Open", 
      coordinator,
      contact,
      prizes,
      description,
    });

    await newTournament.save();
    res.status(201).json({ message: "✅ Tournament Created", data: newTournament });
  } catch (err) {
    console.error("❌ Tournament Creation Error:", err);
    res.status(500).json({ error: "❌ Error creating tournament", details: err.message });
  }
});


// 🎯 **Fetch All Tournaments**
router.get("/all", async (req, res) => {
  try {
    console.log("📌 Fetching tournaments...");
    const tournaments = await Tournament.find();
    res.status(200).json(tournaments);
  } catch (error) {
    console.error("❌ Error fetching tournaments:", error);
    res.status(500).json({ error: "❌ Error fetching tournaments", details: error.message });
  }
});

// 🎯 **Fetch a Single Tournament by ID**
router.get("/:id", async (req, res) => {
  try {
    console.log("📌 Fetching tournament by ID...");
    const tournament = await Tournament.findById(req.params.id);

    if (!tournament) {
      return res.status(404).json({ error: "❌ Tournament not found" });
    }

    res.status(200).json(tournament);
  } catch (error) {
    console.error("❌ Error fetching tournament details:", error);
    res.status(500).json({ error: "❌ Error fetching tournament details", details: error.message });
  }
});

// 🎯 **Register a Player for a Tournament**
router.post("/register/:id", async (req, res) => {
  try {
    const { name, age, school } = req.body;
    const tournament = await Tournament.findById(req.params.id);

    if (!tournament) {
      return res.status(404).json({ message: "❌ Tournament not found" });
    }

    if (tournament.players.length >= tournament.maxParticipants) {
      return res.status(400).json({ message: "❌ Tournament is full" });
    }

    tournament.players.push({ name, age, school });
    await tournament.save();

    res.status(200).json({ message: "✅ Player Registered Successfully!", data: tournament });
  } catch (error) {
    res.status(500).json({ error: "❌ Error registering player!", details: error.message });
  }
});

// 🎯 **Get Tournament Bracket**
router.get("/:id/bracket", async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) {
      return res.status(404).json({ message: "❌ Tournament not found" });
    }

    res.status(200).json({ bracket: tournament.bracket });
  } catch (error) {
    res.status(500).json({ error: "❌ Error fetching bracket", details: error.message });
  }
});

// 🎯 **Approve a Bank Slip**
router.put("/approve-payment/:id", async (req, res) => {
  try {
    const registration = await TournamentRegistration.findById(req.params.id);

    if (!registration) {
      return res.status(404).json({ message: "❌ Registration not found" });
    }

    if (registration.paymentStatus === "Paid") {
      return res.status(400).json({ message: "✅ Payment is already approved" });
    }

    if (!registration.paymentFile) {
      return res.status(400).json({ message: "❌ No bank slip uploaded for this registration" });
    }

    registration.paymentStatus = "Paid";
    await registration.save();

    res.status(200).json({ message: "✅ Bank slip approved & payment marked as paid!", data: registration });
  } catch (error) {
    res.status(500).json({ message: "❌ Server error while approving payment" });
  }
});
// 🎯 **Update Tournament**
router.put("/update/:id", async (req, res) => {
  try {
    const updatedTournament = await Tournament.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true } 
    );

    if (!updatedTournament) {
      return res.status(404).json({ error: "❌ Tournament not found" });
    }

    res.status(200).json({ message: "✅ Tournament updated successfully!", data: updatedTournament });
  } catch (error) {
    res.status(500).json({ error: "❌ Error updating tournament", details: error.message });
  }
});
router.delete("/:id", async (req, res) => {
  try {
    console.log("🔴 Deleting Tournament ID:", req.params.id);

    const tournament = await Tournament.findByIdAndDelete(req.params.id);

    if (!tournament) {
      return res.status(404).json({ message: "❌ Tournament not found" });
    }

    res.status(200).json({ message: "✅ Tournament deleted successfully!" });
  } catch (error) {
    console.error("❌ Error deleting tournament:", error);
    res.status(500).json({ message: "❌ Internal server error", details: error.message });
  }
});
// 🎯 Generate a registration report for a tournament
router.get("/:id/report", async (req, res) => {
  try {
    const tournamentId = req.params.id;

    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return res.status(404).json({ error: "❌ Tournament not found" });
    }

    const teamCount = await TournamentRegistration.countDocuments({ tournament: tournamentId });

    const teamDetails = await TournamentRegistration.find({ tournament: tournamentId })
      .select("schoolName schoolID email players paymentStatus createdAt");

    res.status(200).json({
      tournamentName: tournament.tournamentName,
      totalRegistrations: teamCount,
      registeredTeams: teamDetails,
    });
  } catch (error) {
    console.error("❌ Error generating tournament report:", error);
    res.status(500).json({ error: "❌ Failed to generate report", details: error.message });
  }
});


module.exports = router;
