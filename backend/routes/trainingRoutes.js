const express = require("express");
const PDFDocument = require("pdfkit");
const Training = require("../models/trainingmodel");
const Player = require("../models/playermodel"); // ✅ Import the Player model

const router = express.Router();
const trainingController = require("../controllers/trainingcontroller");

router.get("/", trainingController.getTrainings);
router.post("/", trainingController.addTraining);
router.get("/:id", trainingController.getById);
router.put("/:id", trainingController.updateTraining);
router.delete("/:id", trainingController.deleteTraining);

router.post("/report/pdf", async (req, res) => {
  const { startDate, endDate, location, programName } = req.body;

  try {
    // Build query based on filters
    let query = {};
    if (startDate && endDate) {
      query.startDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }
    if (location) query.location = { $regex: location, $options: "i" };
    if (programName) query.programname = { $regex: programName, $options: "i" };

    const programs = await Training.find(query).sort({ startDate: 1 });
    if (!programs.length) {
      return res.status(404).json({ error: "No training programs match the filter" });
    }

    const doc = new PDFDocument({ margin: 50, size: "A4", bufferPages: true });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="Training_Programs_Report.pdf"`);
    doc.pipe(res);

    const colors = {
      primary: "#1a73e8",
      secondary: "#fa7b17",
      text: "#202124",
      lightText: "#5f6368",
      background: "#ffffff",
      cardBg: "#f8f9fa",
      border: "#dadce0",
      tableHeader: "#f1f3f4",
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
        doc
          .fillColor(colors.text)
          .font("Helvetica-Bold")
          .fontSize(10)
          .text(header, startX + index * columnWidth + 5, startY + 8, { width: columnWidth - 10 });
      });

      rows.forEach((row, rowIndex) => {
        const y = startY + (rowIndex + 1) * rowHeight;
        doc
          .rect(startX, y, totalWidth, rowHeight)
          .fill(rowIndex % 2 === 0 ? colors.background : colors.cardBg);

        row.forEach((cell, cellIndex) => {
          doc
            .fillColor(colors.text)
            .font("Helvetica")
            .fontSize(9)
            .text(cell, startX + cellIndex * columnWidth + 5, y + 8, { width: columnWidth - 10 });
        });
      });

      return startY + (rows.length + 1) * rowHeight;
    };

    // Cover Page
    doc.addPage();
    doc.fillColor(colors.primary)
      .fontSize(30)
      .font("Helvetica-Bold")
      .text("Training Programs Report", { align: "center", valign: "center" });

    doc.moveDown(2);
    doc.fontSize(14)
      .fillColor(colors.lightText)
      .font("Helvetica")
      .text(`Generated on: ${new Date().toLocaleString("en-GB")}`, { align: "center" });

    doc.addPage();

    // Training Programs Table
    doc.fontSize(20)
      .fillColor(colors.primary)
      .font("Helvetica-Bold")
      .text("Training Programs Summary", 50, 50);

    const headers = ["Program Name", "Type", "Start Date", "End Date", "Location", "Capacity"];
    const rows = programs.map((p) => [
      p.programname,
      p.trainingtype,
      formatDate(p.startDate),
      formatDate(p.endDate),
      p.location || "-",
      p.capacity || "-",
    ]);

    let tableBottom = drawTable(headers, rows, 50, 100, 500);

    // Add details for each program
    for (const program of programs) {
      doc.addPage();

      // Program Details
      doc.fontSize(24)
        .fillColor(colors.primary)
        .font("Helvetica-Bold")
        .text(program.programname, 50, 50);

      doc.fontSize(12)
        .fillColor(colors.text)
        .font("Helvetica")
        .text(`Type: ${program.trainingtype}`, 50, 90)
        .text(`Start Date: ${formatDate(program.startDate)}`, 50, 110)
        .text(`End Date: ${formatDate(program.endDate)}`, 50, 130)
        .text(`Location: ${program.location || "-"}`, 50, 150)
        .text(`Capacity: ${program.capacity || "-"}`, 50, 170)
        .text(`Description: ${program.description || "No description provided"}`, 50, 190, {
          width: 500,
          align: "justify",
        });

      // Fetch registered players for the program
      const players = await Player.find({ programid: program._id }).select(
        "fullname dateofbirth gender schoolname contactnumber email guardianname guardiancontact"
      );

      doc.fontSize(18)
        .fillColor(colors.primary)
        .font("Helvetica-Bold")
        .text("Registered Players", 50, 250);

      if (players.length > 0) {
        const playerHeaders = ["Name", "DOB", "Gender", "School", "Contact", "Email", "Guardian"];
        const playerRows = players.map((player) => [
          player.fullname || "-",
          formatDate(player.dateofbirth),
          player.gender || "-",
          player.schoolname || "-",
          player.contactnumber || "-",
          player.email || "-",
          player.guardianname || "-",
        ]);

        drawTable(playerHeaders, playerRows, 50, 280, 500);
      } else {
        doc.fontSize(12)
          .fillColor(colors.lightText)
          .text("No players registered for this program.", 50, 280);
      }
    }

    // Footer
    const pageCount = doc.bufferedPageCount;
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);
      doc.fontSize(10)
        .fillColor(colors.lightText)
        .text(`Page ${i + 1} of ${pageCount}`, 50, 800, { align: "center" });
    }

    doc.end();
  } catch (error) {
    console.error("Error generating PDF:", error);

    // Ensure the response stream is not written to after an error
    if (!res.headersSent) {
      res.status(500).json({ error: "Error generating PDF report" });
    }
  }
});

module.exports = router;
