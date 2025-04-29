const express = require("express");
const Income = require("../models/income");
const Expense = require("../models/expense");
const TournamentRegistration = require("../models/TournamentRegistration"); // ✅ Import the model
const PDFDocument = require("pdfkit");
const mongoose = require("mongoose");

const router = express.Router();

// ✅ Generate Financial Report
router.post("/report/pdf", async (req, res) => {
  const { startDate, endDate, selectedTournament, recordType = "both" } = req.body;

  try {
    let incomeQuery = {};
    let expenseQuery = {};

    if (startDate && endDate) {
      incomeQuery.tournamentDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
      expenseQuery.tournamentDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    if (selectedTournament) {
      incomeQuery.tournamentName = selectedTournament;
      expenseQuery.tournamentName = selectedTournament;
    }

    let incomes = [];
    let expenses = [];

    if (recordType === "income" || recordType === "both") {
      incomes = await Income.find(incomeQuery).sort({ tournamentDate: 1 });
    }
    if (recordType === "expense" || recordType === "both") {
      expenses = await Expense.find(expenseQuery).sort({ tournamentDate: 1 });
    }

    const totalIncome = incomes.reduce((sum, item) => sum + (item.totalIncome || 0), 0);
    const totalExpense = expenses.reduce((sum, item) => sum + (item.totalExpense || 0), 0);
    const balance = totalIncome - totalExpense;

    const doc = new PDFDocument({ margin: 50, size: "A4" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="Financial_Report.pdf"`);
    doc.pipe(res);

    // Styling Functions
    const colors = {
      primary: "#1a73e8",
      text: "#202124",
      lightText: "#5f6368",
      tableHeader: "#f1f3f4",
      background: "#ffffff",
    };

    const formatDate = (date) => {
      if (!date) return "-";
      return new Date(date).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    };

    const drawTable = (headers, rows, startX, startY, totalWidth) => {
      const rowHeight = 25;
      const columnWidth = totalWidth / headers.length;

      doc.rect(startX, startY, totalWidth, rowHeight).fill(colors.tableHeader);

      headers.forEach((header, index) => {
        doc.fillColor(colors.text)
          .font("Helvetica-Bold")
          .fontSize(10)
          .text(header, startX + index * columnWidth + 5, startY + 8, { width: columnWidth - 10 });
      });

      rows.forEach((row, rowIndex) => {
        const y = startY + (rowIndex + 1) * rowHeight;
        doc.rect(startX, y, totalWidth, rowHeight)
          .fill(rowIndex % 2 === 0 ? colors.background : colors.tableHeader);

        row.forEach((cell, cellIndex) => {
          doc.fillColor(colors.text)
            .font("Helvetica")
            .fontSize(9)
            .text(cell, startX + cellIndex * columnWidth + 5, y + 8, { width: columnWidth - 10 });
        });
      });

      return startY + (rows.length + 1) * rowHeight;
    };

    // Generate PDF pages
    doc.addPage();
    doc.fillColor(colors.primary).fontSize(30).font("Helvetica-Bold")
      .text("Financial Report", { align: "center" });

    doc.moveDown(2);
    doc.fontSize(14).fillColor(colors.lightText).font("Helvetica")
      .text(`Generated on: ${new Date().toLocaleString("en-GB")}`, { align: "center" });

    doc.addPage();
    doc.fontSize(20).fillColor(colors.primary).font("Helvetica-Bold")
      .text("Summary", 50, 50);

    doc.fontSize(12).fillColor(colors.text).font("Helvetica")
      .text(`Total Income: $${totalIncome.toLocaleString()}`, 50, 90)
      .text(`Total Expense: $${totalExpense.toLocaleString()}`, 50, 110)
      .text(`Balance: $${balance.toLocaleString()}`, 50, 130);

    if (incomes.length > 0) {
      doc.addPage();
      doc.fontSize(20).fillColor(colors.primary).font("Helvetica-Bold")
        .text("Income Records", 50, 50);

      const incomeHeaders = ["Tournament Name", "Date", "Entry Fees", "Ticket Sales", "Sponsorships", "Total"];
      const incomeRows = incomes.map((income) => [
        income.tournamentName,
        formatDate(income.tournamentDate),
        `$${(income.entryFees || 0).toLocaleString()}`,
        `$${(income.ticketSales || 0).toLocaleString()}`,
        `$${(income.sponsorships || 0).toLocaleString()}`,
        `$${(income.totalIncome || 0).toLocaleString()}`,
      ]);

      drawTable(incomeHeaders, incomeRows, 50, 100, 500);
    }

    if (expenses.length > 0) {
      doc.addPage();
      doc.fontSize(20).fillColor(colors.primary).font("Helvetica-Bold")
        .text("Expense Records", 50, 50);

      const expenseHeaders = ["Tournament Name", "Date", "Venue Costs", "Staff Payments", "Equipment Costs", "Total"];
      const expenseRows = expenses.map((expense) => [
        expense.tournamentName,
        formatDate(expense.tournamentDate),
        `$${(expense.venueCosts || 0).toLocaleString()}`,
        `$${(expense.staffPayments || 0).toLocaleString()}`,
        `$${(expense.equipmentCosts || 0).toLocaleString()}`,
        `$${(expense.totalExpense || 0).toLocaleString()}`,
      ]);

      drawTable(expenseHeaders, expenseRows, 50, 100, 500);
    }

    const pageCount = doc.bufferedPageCount;
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);
      doc.fontSize(10).fillColor(colors.lightText)
        .text(`Page ${i + 1} of ${pageCount}`, 50, 800, { align: "center" });
    }

    doc.end();
  } catch (error) {
    console.error("Error generating financial report:", error);
    res.status(500).json({ error: "Error generating financial report" });
  }
});
router.get("/registrations", async (req, res) => {
  try {
    const registrations = await TournamentRegistration.find()
      .populate({
        path: "tournament",
        select: "tournamentName date",
        strictPopulate: false,
      });

    // 🛑 Additional protection: Remove broken entries manually
    const validRegistrations = registrations.filter(reg => 
      mongoose.Types.ObjectId.isValid(reg.tournament?._id)
    );

    res.status(200).json(validRegistrations);
  } catch (error) {
    console.error("❌ Error fetching finance registrations:", error);
    res.status(500).json({ error: "Server Error", details: error.message });
  }
});

module.exports = router;
