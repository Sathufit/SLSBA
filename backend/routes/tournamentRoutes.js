const express = require("express");
const Tournament = require("../models/Tournament"); 
const TournamentRegistration = require("../models/TournamentRegistration");
const PDFDocument = require('pdfkit');
const XLSX = require("xlsx");

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

router.get("/:id/report", async (req, res) => {
  const tournamentId = req.params.id;

  try {
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return res.status(404).json({ error: "Tournament not found" });
    }

    const teamCount = await TournamentRegistration.countDocuments({ tournament: tournamentId });

    const teamDetails = await TournamentRegistration.find({ tournament: tournamentId })
      .select("schoolName schoolID email players paymentStatus createdAt");

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
router.post("/report/pdf", async (req, res) => {
  const { startDate, endDate, venue, tournamentName } = req.body;
  
  try {
    // Build query
    let query = {};
    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    if (venue) query.venue = { $regex: venue, $options: "i" };
    if (tournamentName) query.tournamentName = { $regex: tournamentName, $options: "i" };

    const tournaments = await Tournament.find(query).sort({ date: 1 });
    if (!tournaments.length) {
      return res.status(404).json({ error: "No tournaments match the filter" });
    }

    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="Tournament_Report.pdf"');
    
    doc.pipe(res);

    const colors = {
      primary: '#1a73e8',
      secondary: '#fa7b17',
      text: '#202124',
      lightText: '#5f6368',
      background: '#ffffff',
      cardBg: '#f8f9fa',
      border: '#dadce0',
      tableHeader: '#f1f3f4',
      success: '#34a853',
      warning: '#fbbc04',
      danger: '#ea4335'
    };

    const formatDate = (date) => {
      if (!date) return '-';
      return new Date(date).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    };

    const drawRoundedRect = (x, y, width, height, radius, color) => {
      doc.roundedRect(x, y, width, height, radius).fill(color);
    };

    const drawTable = (headers, rows, startX, startY, totalWidth) => {
      const rowHeight = 25;
      const columnWidth = totalWidth / headers.length;
      
      doc.rect(startX, startY, totalWidth, rowHeight).fill(colors.tableHeader);
      
      headers.forEach((header, index) => {
        doc
          .fillColor(colors.text)
          .font('Helvetica-Bold')
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
            .font('Helvetica')
            .fontSize(9)
            .text(cell, startX + cellIndex * columnWidth + 5, y + 8, { width: columnWidth - 10 });
        });
      });

      return startY + (rows.length + 1) * rowHeight;
    };

    // --------------- Cover Page --------------- //
    doc.addPage();
    doc.fillColor(colors.primary)
       .fontSize(30)
       .font('Helvetica-Bold')
       .text('Tournament Report', { align: 'center', valign: 'center' });
    
    doc.moveDown(2);

    doc.fontSize(14)
       .fillColor(colors.lightText)
       .font('Helvetica')
       .text(`Generated on: ${new Date().toLocaleString('en-GB')}`, { align: 'center' });

    doc.addPage();

    // --------------- Index Table --------------- //
    doc.fontSize(20)
       .fillColor(colors.primary)
       .font('Helvetica-Bold')
       .text('Tournament Summary', 50, 50);

    const indexHeaders = ['Tournament Name', 'Date', 'Venue', 'Status'];
    const indexRows = tournaments.map(t => [
      t.tournamentName,
      formatDate(t.date),
      t.venue || '-',
      t.status || '-'
    ]);
    let tableBottom = drawTable(indexHeaders, indexRows, 50, 100, 500);

    // --------------- Tournament Details --------------- //
    for (const tournament of tournaments) {
      doc.addPage();

      doc.fontSize(24)
         .fillColor(colors.primary)
         .font('Helvetica-Bold')
         .text(tournament.tournamentName, 50, 50);

      drawRoundedRect(45, 90, 520, 180, 10, colors.cardBg);

      doc.fillColor(colors.text)
         .font('Helvetica')
         .fontSize(12)
         .text(`Date: ${formatDate(tournament.date)}`, 70, 110)
         .text(`Venue: ${tournament.venue || '-'}`, 70, 140)
         .text(`Category: ${tournament.category || '-'}`, 70, 170)
         .text(`Status: ${tournament.status || '-'}`, 70, 200)
         .text(`Coordinator: ${tournament.coordinator || '-'}`, 70, 230);

      const registrations = await TournamentRegistration.find({ tournament: tournament._id })
        .select('schoolName schoolID email players paymentStatus');

      doc.fontSize(18)
         .fillColor(colors.primary)
         .font('Helvetica-Bold')
         .text('Registrations', 50, 300);

      if (registrations.length > 0) {
        const registrationHeaders = ['School Name', 'School ID', 'Email', 'Players', 'Payment'];
        const registrationRows = registrations.map(r => [
          r.schoolName || '-',
          r.schoolID || '-',
          r.email || '-',
          r.players ? r.players.length.toString() : '0',
          r.paymentStatus || '-'
        ]);

        drawTable(registrationHeaders, registrationRows, 50, 340, 500);
      } else {
        doc.fontSize(12)
           .fillColor(colors.lightText)
           .text('No registrations found.', 50, 340);
      }
    }

    // --------------- Add Footer --------------- //
    const pageCount = doc.bufferedPageCount;
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);
      doc.fontSize(10)
         .fillColor(colors.lightText)
         .text(`Page ${i + 1} of ${pageCount}`, 50, 800, { align: 'center' });
    }

    doc.end();

  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ error: 'Error generating PDF report' });
  }
});

// 🎯 Generate Excel Sheet for Tournament Registrations
router.get("/:id/export-excel", async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch tournament details
    const tournament = await Tournament.findById(id);
    if (!tournament) {
      return res.status(404).json({ error: "Tournament not found" });
    }

    // Fetch registrations for the tournament
    const registrations = await TournamentRegistration.find({ tournament: id });

    if (registrations.length === 0) {
      return res.status(404).json({ error: "No registrations found for this tournament" });
    }

    // Prepare data for the "Registrations" sheet
    const registrationData = registrations.map((reg, index) => ({
      "S.No": index + 1,
      "Full Name": reg.fullName,
      "Email": reg.email,
      "School Name": reg.schoolName,
      "School ID": reg.schoolID,
      "Players": reg.players.map((player) => `${player.name} (Age: ${player.age})`).join(", "),
      "Payment Status": reg.paymentStatus,
    }));

    // Prepare data for the "Summary" sheet
    const summaryData = [
      { Key: "Tournament Name", Value: tournament.tournamentName },
      { Key: "Category", Value: tournament.category },
      { Key: "Date", Value: new Date(tournament.date).toLocaleDateString() },
      { Key: "Venue", Value: tournament.venue },
      { Key: "Total Registrations", Value: registrations.length },
      { Key: "Coordinator", Value: tournament.coordinator || "N/A" },
      { Key: "Contact", Value: tournament.contact || "N/A" },
    ];

    // Prepare data for the "Players" sheet
    const playersData = [];
    registrations.forEach((reg, regIndex) => {
      reg.players.forEach((player, playerIndex) => {
        playersData.push({
          "S.No": playersData.length + 1,
          "Player Name": player.name,
          "Age": player.age,
          "School Name": reg.schoolName,
          "Registered By": reg.fullName,
        });
      });
    });

    // Create a new workbook
    const workbook = XLSX.utils.book_new();

    // Add "Summary" sheet
    const summarySheet = XLSX.utils.json_to_sheet(summaryData, { header: ["Key", "Value"] });
    XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");

    // Add "Registrations" sheet
    const registrationSheet = XLSX.utils.json_to_sheet(registrationData);
    XLSX.utils.book_append_sheet(workbook, registrationSheet, "Registrations");

    // Add "Players" sheet
    const playersSheet = XLSX.utils.json_to_sheet(playersData);
    XLSX.utils.book_append_sheet(workbook, playersSheet, "Players");

    // Set response headers
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${tournament.tournamentName}_Registrations.xlsx"`
    );
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

    // Write workbook to response
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
    res.send(buffer);
  } catch (error) {
    console.error("❌ Error generating Excel sheet:", error);
    res.status(500).json({ error: "Failed to generate Excel sheet" });
  }
});

module.exports = router;
