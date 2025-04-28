const express = require("express");
const Tournament = require("../models/Tournament"); 
const TournamentRegistration = require("../models/TournamentRegistration");
const PDFDocument = require('pdfkit');


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
    // Build query based on filters
    let query = {};
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }
    if (venue) query.venue = { $regex: venue, $options: "i" };
    if (tournamentName) query.tournamentName = { $regex: tournamentName, $options: "i" };

    const tournaments = await Tournament.find(query).sort({ date: 1 });
    if (!tournaments.length) {
      return res.status(404).json({ error: "No tournaments match the filter" });
    }

    // Set up PDF document
    const doc = new PDFDocument({
      margin: 50,
      size: 'A4',
      bufferPages: true,
      autoFirstPage: false,
    });

    // Handle PDF stream errors
    doc.on('error', (err) => {
      console.error('PDF Generation Error:', err);
      res.status(500).json({ error: 'PDF generation failed' });
    });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Tournament_Report_${new Date().toISOString().split('T')[0]}.pdf"`);
    
    // Pipe the PDF document to the response
    const stream = doc.pipe(res);
    stream.on('error', (err) => {
      console.error('Stream Error:', err);
      res.status(500).json({ error: 'Stream failed' });
    });

    // Define color scheme
    const colors = {
      primary: '#003f7d',
      secondary: '#e15b29',
      text: '#2d3748',
      lightText: '#718096',
      background: '#f7fafc',
      success: '#48bb78',
      warning: '#ed8936',
      border: '#e2e8f0'
    };

    // Date formatter
    const formatDate = (dateString) => {
      if (!dateString) return '-';
      return new Date(dateString).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    };

    // Add cover page
    doc.addPage();
    doc.rect(0, 0, doc.page.width, doc.page.height).fill(colors.background);
    
    // Title Section
    doc.fontSize(32)
       .fillColor(colors.primary)
       .font('Helvetica-Bold')
       .text('Tournament Report', {
         align: 'center',
         y: 150
       });
    
    doc.fontSize(14)
       .fillColor(colors.lightText)
       .text(`Generated on ${new Date().toLocaleDateString('en-GB', { 
         dateStyle: 'full' 
       })}`, {
         align: 'center',
         y: 200
       });

    // Summary Box
    doc.rect(50, 250, doc.page.width - 100, 120)
       .fillAndStroke(colors.primary, colors.primary);
    doc.fontSize(14)
       .fillColor('white')
       .text(`Total Tournaments: ${tournaments.length}`, 70, 270)
       .text(`Date Range: ${formatDate(startDate)} - ${formatDate(endDate)}`, 70, 300)
       .text(`Venue Filter: ${venue || 'All Venues'}`, 70, 330);

    // Tournament Details Pages
    for (const tournament of tournaments) {
      doc.addPage();

      // Tournament Header
      doc.rect(50, 50, doc.page.width - 100, 100)
         .fillAndStroke(colors.primary);
      doc.fontSize(24)
         .fillColor('white')
         .font('Helvetica-Bold')
         .text(tournament.tournamentName, 70, 70);
      doc.fontSize(12)
         .text(`Date: ${formatDate(tournament.date)}`, 70, 100)
         .text(`Venue: ${tournament.venue || '-'}`, 70, 120);

      // Tournament Details
      const detailsY = 180;
      const details = [
        { label: 'Category', value: tournament.category },
        { label: 'Status', value: tournament.status },
        { label: 'Coordinator', value: tournament.coordinator },
        { label: 'Contact', value: tournament.contact },
        { label: 'Max Participants', value: tournament.maxParticipants },
        { label: 'Registration Deadline', value: formatDate(tournament.registrationDeadline) }
      ];

      doc.fontSize(16)
         .fillColor(colors.secondary)
         .font('Helvetica-Bold')
         .text('Tournament Details', 50, detailsY);

      details.forEach((detail, index) => {
        const y = detailsY + 30 + (index * 25);
        doc.fontSize(12)
           .font('Helvetica-Bold')
           .fillColor(colors.text)
           .text(detail.label, 50, y);
        doc.font('Helvetica')
           .fillColor(colors.lightText)
           .text(detail.value || '-', 200, y);
      });

      // Registrations Section
      const registrations = await TournamentRegistration.find({ tournament: tournament._id })
        .select("schoolName schoolID email players paymentStatus");

      if (registrations.length > 0) {
        const registrationY = detailsY + 200;
        doc.fontSize(16)
           .fillColor(colors.secondary)
           .font('Helvetica-Bold')
           .text('Registrations', 50, registrationY);

        registrations.forEach((reg, index) => {
          const yPos = registrationY + 30 + (index * 120);

          // Check if we need a new page
          if (yPos + 100 > doc.page.height - 50) {
            doc.addPage();
            doc.fontSize(16)
               .fillColor(colors.secondary)
               .font('Helvetica-Bold')
               .text('Registrations (Continued)', 50, 50);
            yPos = 80;
          }

          // Registration Card
          doc.rect(50, yPos, doc.page.width - 100, 100)
             .fillAndStroke('white', colors.border);
          
          // School Details
          doc.fontSize(14)
             .font('Helvetica-Bold')
             .fillColor(colors.primary)
             .text(reg.schoolName, 70, yPos + 15);
          
          doc.fontSize(12)
             .font('Helvetica')
             .fillColor(colors.text)
             .text(`ID: ${reg.schoolID}`, 70, yPos + 40)
             .text(`Email: ${reg.email}`, 70, yPos + 60)
             .text(`Players: ${reg.players.length}`, 70, yPos + 80);

          // Payment Status Badge
          const badgeWidth = 80;
          const badgeColor = reg.paymentStatus === 'Paid' ? colors.success : colors.warning;
          doc.rect(doc.page.width - 150, yPos + 15, badgeWidth, 25)
             .fillAndStroke(badgeColor);
          doc.fontSize(12)
             .fillColor('white')
             .text(reg.paymentStatus, doc.page.width - 140, yPos + 20);
        });
      }

      // Footer
      doc.fontSize(10)
         .fillColor(colors.lightText)
         .text(`Tournament ID: ${tournament._id}`, {
           align: 'center',
           y: doc.page.height - 50
         });
    }

    // Add page numbers
    const pageCount = doc.bufferedPageCount;
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);
      doc.fontSize(10)
         .fillColor(colors.lightText)
         .text(`Page ${i + 1} of ${pageCount}`, {
           align: 'right',
           y: doc.page.height - 50
         });
    }

    // Finalize the PDF
    doc.end();

  } catch (err) {
    console.error("❌ Error generating filtered PDF report:", err);
    res.status(500).json({ 
      error: "Failed to generate filtered PDF report", 
      details: err.message 
    });
  }
});

module.exports = router;
