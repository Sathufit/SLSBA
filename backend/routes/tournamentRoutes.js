const express = require("express");
const Tournament = require("../models/Tournament"); 
const TournamentRegistration = require("../models/TournamentRegistration");
const PDFDocument = require('pdfkit');
const XLSX = require("xlsx");

const router = express.Router();

// ✅ Static/Specific routes FIRST
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

router.get("/pending-payments", async (req, res) => {
  try {
    const pendingRegistrations = await TournamentRegistration.find({ paymentStatus: "Pending" });
    res.status(200).json(pendingRegistrations);
  } catch (error) {
    console.error("❌ Error fetching pending payments:", error.message);
    res.status(500).json({ error: "Server error fetching pending payments." });
  }
});

router.put("/approve-payment/:id", async (req, res) => {
  try {
    const updated = await TournamentRegistration.findByIdAndUpdate(
      req.params.id,
      { paymentStatus: "Paid", isApproved: true },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: "Registration not found." });
    res.status(200).json(updated);
  } catch (error) {
    console.error("❌ Error approving payment:", error.message);
    res.status(500).json({ error: "Server error approving payment." });
  }
});

router.post("/report/pdf", async (req, res) => {
  const { startDate, endDate, venue, tournamentName } = req.body;

  try {
    let query = {};
    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    if (venue) query.venue = { $regex: venue, $options: "i" };
    if (tournamentName) query.tournamentName = { $regex: tournamentName, $options: "i" };

    const tournaments = await Tournament.find(query).sort({ date: 1 });
    if (!tournaments.length) {
      return res.status(404).json({ error: "No tournaments match the filters." });
    }

    const tournamentIds = tournaments.map((t) => t._id);
    const registrations = await TournamentRegistration.find({ tournament: { $in: tournamentIds } }).populate("tournament");

    const doc = new PDFDocument({ margin: 50, size: "A4" });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="Tournament_Report.pdf"`);
    doc.pipe(res);

    // === Styling
    const colors = {
      primary: "#2E86C1",
      text: "#212121",
      lightText: "#555",
      tableHeader: "#D6EAF8",
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

    // === Cover Page
    doc.addPage();
    doc.fillColor(colors.primary).fontSize(30).font("Helvetica-Bold")
      .text("Tournament Registration Report", { align: "center" });

    doc.moveDown(2);
    doc.fontSize(14).fillColor(colors.lightText).font("Helvetica")
      .text(`Generated on: ${new Date().toLocaleString("en-GB")}`, { align: "center" });

    // === Loop through each tournament
    for (const tournament of tournaments) {
      const relatedRegs = registrations.filter(reg => reg.tournament._id.equals(tournament._id));
      doc.addPage();
      doc.fontSize(20).fillColor(colors.primary).font("Helvetica-Bold")
        .text(tournament.tournamentName, 50, 50);

      doc.fontSize(12).fillColor(colors.text).font("Helvetica")
        .text(`Venue: ${tournament.venue}`, 50, 80)
        .text(`Date: ${formatDate(tournament.date)}`, 50, 100)
        .text(`Total Registrations: ${relatedRegs.length}`, 50, 120);

      if (relatedRegs.length > 0) {
        const tableHeaders = ["School Name", "School ID", "Email", "Players", "Payment"];
        const tableRows = relatedRegs.map((reg) => [
          reg.schoolName || "-",
          reg.schoolID || "-",
          reg.email || "-",
          `${reg.players?.length || 0}`,
          reg.paymentStatus || "Pending"
        ]);

        drawTable(tableHeaders, tableRows, 50, 160, 500);
      } else {
        doc.fillColor(colors.lightText).fontSize(12).text("No registrations available.", 50, 160);
      }
    }

    // === Footer Page Numbering
    const pageCount = doc.bufferedPageCount;
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);
      doc.fontSize(10).fillColor(colors.lightText)
        .text(`Page ${i + 1} of ${pageCount}`, 50, 800, { align: "center" });
    }

    doc.end();
  } catch (error) {
    console.error("❌ Error generating styled PDF report:", error);
    res.status(500).json({ error: "Error generating tournament report" });
  }
});


router.get("/:id/report", async (req, res) => {
  const tournamentId = req.params.id;

  try {
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return res.status(404).json({ error: "Tournament not found" });
    }

    const teamCount = await TournamentRegistration.countDocuments({ tournament: tournamentId });
    const teamDetails = await TournamentRegistration.find({ tournament: tournamentId }).select(
      "schoolName schoolID email players paymentStatus createdAt"
    );

    res.status(200).json({
      tournamentName: tournament.tournamentName,
      totalRegistrations: teamCount,
      registeredTeams: teamDetails,
    });
  } catch (err) {
    console.error("❌ Error generating report:", err);
    res.status(500).json({ error: "Failed to generate report" });
  }
});

router.get("/:id/export-excel", async (req, res) => {
  try {
    const { id } = req.params;

    const tournament = await Tournament.findById(id);
    if (!tournament) {
      return res.status(404).json({ success: false, message: "Tournament not found" });
    }

    const registrations = await TournamentRegistration.find({ tournament: id });
    if (!registrations.length) {
      return res.status(404).json({ success: false, message: "No registrations found" });
    }

    // Column headers with separate Player Name and Age columns
    const headers = [
      "Full Name",
      "Email",
      "School Name",
      "School ID",
      "Player Names",
      "Player Ages",
      "Payment Status",
      "Payment Method",
      "Registration Date"
    ];

    // Data rows
    const dataRows = registrations.map(reg => {
      const playerNames = (reg.players || []).map(p => p.name || "N/A").join(", ");
      const playerAges = (reg.players || []).map(p => p.age || "?").join(", ");

      return [
        reg.fullName || "-",
        reg.email || "-",
        reg.schoolName || "-",
        reg.schoolID || "-",
        playerNames,
        playerAges,
        reg.paymentStatus || "Pending",
        reg.paymentMethod || "N/A",
        formatDate(reg.createdAt)
      ];
    });

    const worksheetData = [headers, ...dataRows];
    const buffer = generateExcelBuffer(worksheetData, "Registrations");
    return sendExcelResponse(res, buffer, tournament.tournamentName);

  } catch (error) {
    console.error("❌ Excel export error:", error);
    res.status(500).json({ success: false, message: "Failed to generate Excel export" });
  }
});

// ➕ Utility: Format date
function formatDate(date) {
  return new Date(date).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "2-digit"
  });
}

// ➕ Utility: Generate Excel file buffer
function generateExcelBuffer(data, sheetName) {
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet(data);

  worksheet["!cols"] = calculateColumnWidths(data);
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
}

// ➕ Utility: Auto column widths
function calculateColumnWidths(data) {
  const widths = data[0].map(header => Math.max(10, header.length + 2));
  const maxRows = Math.min(data.length, 100);

  for (let i = 1; i < maxRows; i++) {
    data[i].forEach((cell, j) => {
      const len = String(cell || "").length;
      widths[j] = Math.max(widths[j], Math.min(50, len + 2));
    });
  }

  return widths.map(w => ({ wch: w }));
}

// ➕ Utility: Send file as download
function sendExcelResponse(res, buffer, tournamentName) {
  const safeName = tournamentName.replace(/[^a-zA-Z0-9]/g, "_");
  const filename = `Tournament_Registrations_${safeName}.xlsx`;

  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.send(buffer);
}

// ⚠️ Keep these dynamic ones LAST
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

module.exports = router;
