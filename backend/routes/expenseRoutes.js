const express = require("express");
const router = express.Router();
const Expense = require("../models/expense"); // Import the Expense model

// POST: Add expense details
router.post("/add", async (req, res) => {
  let { tournamentName, tournamentDate, venueCosts, staffPayments, equipmentCosts } = req.body;

  // Validate required fields
  if (!tournamentName || !tournamentDate || venueCosts === undefined || staffPayments === undefined || equipmentCosts === undefined) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Ensure the tournamentDate is a valid date
  const parsedDate = new Date(tournamentDate);
  if (isNaN(parsedDate.getTime())) {
    return res.status(400).json({ message: "Invalid tournament date. Please provide a valid date in format YYYY-MM-DD." });
  }

  // Convert cost fields to numbers
  venueCosts = parseFloat(venueCosts);
  staffPayments = parseFloat(staffPayments);
  equipmentCosts = parseFloat(equipmentCosts);

  // Ensure parsed numbers are valid
  if (isNaN(venueCosts) || isNaN(staffPayments) || isNaN(equipmentCosts)) {
    return res.status(400).json({ message: "Cost fields must be valid numbers" });
  }

  // Calculate total expense
  const totalExpense = venueCosts + staffPayments + equipmentCosts;

  try {
    const newExpense = new Expense({
      tournamentName,
      tournamentDate: parsedDate,
      venueCosts,
      staffPayments,
      equipmentCosts,
      totalExpense,
    });

    await newExpense.save();
    res.status(201).json({ message: "Expense record added successfully", expense: newExpense });
  } catch (err) {
    console.error("Error saving expense record:", err);
    res.status(500).json({ message: "Error saving expense record", error: err.message });
  }
});

// GET: Get all expenses
router.get("/", async (req, res) => {
  try {
    const expenses = await Expense.find();
    res.status(200).json(expenses);
  } catch (err) {
    console.error("Error fetching expenses:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET: Get all expense details
router.get("/:id", async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }
    res.status(200).json(expense);
  } catch (err) {
    console.error("Error fetching expense:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


// PUT: Update expense details
router.put("/update/:id", async (req, res) => {
  const expenseId = req.params.id;
  let { tournamentName, tournamentDate, venueCosts, staffPayments, equipmentCosts } = req.body;

  // Validate required fields
  if (
    !tournamentName ||
    !tournamentDate ||
    venueCosts === undefined ||
    staffPayments === undefined ||
    equipmentCosts === undefined
  ) {
    return res.status(400).json({ message: "All fields are required to update the expense" });
  }

  // Ensure the tournamentDate is a valid date
  const parsedDate = new Date(tournamentDate);
  if (isNaN(parsedDate.getTime())) {
    return res.status(400).json({ message: "Invalid tournament date. Please provide a valid date in format YYYY-MM-DD." });
  }

  // Convert cost fields to numbers
  venueCosts = parseFloat(venueCosts);
  staffPayments = parseFloat(staffPayments);
  equipmentCosts = parseFloat(equipmentCosts);

  // Check if any are invalid
  if (isNaN(venueCosts) || isNaN(staffPayments) || isNaN(equipmentCosts)) {
    return res.status(400).json({ message: "Cost fields must be valid numbers" });
  }

  const totalExpense = venueCosts + staffPayments + equipmentCosts;

  try {
    const updatedExpense = await Expense.findByIdAndUpdate(
      expenseId,
      {
        tournamentName,
        tournamentDate: parsedDate,
        venueCosts,
        staffPayments,
        equipmentCosts,
        totalExpense,
      },
      { new: true }
    );

    if (!updatedExpense) {
      return res.status(404).json({ message: "Expense record not found" });
    }

    res.status(200).json({ message: "Expense record updated successfully", expense: updatedExpense });
  } catch (err) {
    console.error("Error updating expense record:", err);
    res.status(500).json({ message: "Error updating expense record", error: err.message });
  }
});


// DELETE: Delete expense details
router.delete("/delete/:id", async (req, res) => {
  const expenseId = req.params.id;

  try {
    const deletedExpense = await Expense.findByIdAndDelete(expenseId);

    if (!deletedExpense) {
      return res.status(404).json({ message: "Expense record not found" });
    }

    res.status(200).json({ message: "Expense record deleted successfully" });
  } catch (err) {
    console.error("Error deleting expense record:", err);
    res.status(500).json({ message: "Error deleting expense record", error: err.message });
  }
});

module.exports = router;
