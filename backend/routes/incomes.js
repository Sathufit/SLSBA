const express = require('express');
const router = express.Router();
const mongoose = require("mongoose");
const Income = require("../models/income");

// ✅ Add income details
router.post("/add", async (req, res) => {
  try {
    const { tournamentName, tournamentDate, entryFees, ticketSales, sponsorships } = req.body;

    if (!tournamentName || !tournamentDate || entryFees == null || ticketSales == null || sponsorships == null) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const totalIncome = Number(entryFees) + Number(ticketSales) + Number(sponsorships);

    const newIncome = new Income({
      tournamentName,
      tournamentDate,
      entryFees: Number(entryFees),
      ticketSales: Number(ticketSales),
      sponsorships: Number(sponsorships),
      totalIncome,
    });

    const savedIncome = await newIncome.save();
    res.status(201).json({ message: "Income record added successfully", income: savedIncome });

  } catch (err) {
    console.error("Error saving income record:", err);
    res.status(500).json({ message: "Error saving income record", error: err.message });
  }
});

// ✅ Get all income details
router.get("/", async (req, res) => {
  try {
    const data = await Income.find();
    res.json(data);
  } catch (err) {
    console.error("❌ Error fetching income:", err);
    res.status(500).json({ error: "Failed to fetch income" });
  }
});


// ✅ Get single income by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid income ID format" });
    }

    const income = await Income.findById(id);
    if (!income) {
      return res.status(404).json({ message: "Income record not found" });
    }

    res.status(200).json(income);

  } catch (err) {
    console.error("Error fetching income record:", err);
    res.status(500).json({ message: "Error fetching income record", error: err.message });
  }
});







// ✅ Update income details
router.put("/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Received ID:", id); // Debugging

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid income ID format" });
    }

    const { tournamentName, tournamentDate, entryFees, ticketSales, sponsorships } = req.body;

    if (!tournamentName || !tournamentDate || entryFees == null || ticketSales == null || sponsorships == null) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const totalIncome = Number(entryFees) + Number(ticketSales) + Number(sponsorships);

    const updatedIncome = await Income.findByIdAndUpdate(
      id,
      { tournamentName, tournamentDate, entryFees, ticketSales, sponsorships, totalIncome },
      { new: true }
    );

    if (!updatedIncome) {
      return res.status(404).json({ message: "Record not found." });
    }

    res.status(200).json({ message: "Income updated successfully", income: updatedIncome });

  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});





// ✅ Delete income details
router.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid income ID format" });
    }

    const deletedIncome = await Income.findByIdAndDelete(id);
    if (!deletedIncome) {
      console.error(`No income record found with ID: ${id}`);
      return res.status(404).json({ message: "Income record not found" });
    }

    res.status(200).json({ message: "Income record deleted successfully" });

  } catch (err) {
    console.error("Error deleting income record:", err);
    res.status(500).json({ message: "Error deleting income record", error: err.message });
  }
});

module.exports = router;
