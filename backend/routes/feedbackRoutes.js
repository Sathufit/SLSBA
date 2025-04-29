const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const PDFDocument = require('pdfkit');
const Ticket = require('../models/Ticket'); // Ensure this model exists
const Feedback = require('../models/Feedback'); // Ensure this model exists

router.post('/', feedbackController.createFeedback);
router.get('/', feedbackController.getAllFeedback);
router.delete('/:id', feedbackController.deleteFeedback); // ✅ Add this

router.get('/report', async (req, res) => {
  try {
    const tickets = await Ticket.find(); // Replace with your ticket model
    const feedbacks = await Feedback.find(); // Replace with your feedback model

    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="Support_Report.pdf"');
    doc.pipe(res);

    doc.fontSize(20).text('Support Report', { align: 'center' });
    doc.moveDown();

    // Tickets Section
    doc.fontSize(16).text('Tickets:', { underline: true });
    tickets.forEach(ticket => {
      doc.fontSize(12).text(`Subject: ${ticket.subject}`);
      doc.text(`Description: ${ticket.description}`);
      doc.text(`Status: ${ticket.status}`);
      doc.text(`Created At: ${new Date(ticket.createdAt).toLocaleString()}`);
      doc.moveDown();
    });

    // Feedback Section
    doc.addPage();
    doc.fontSize(16).text('Feedbacks:', { underline: true });
    feedbacks.forEach(feedback => {
      doc.fontSize(12).text(`Name: ${feedback.name || 'Anonymous'}`);
      doc.text(`Email: ${feedback.email || 'N/A'}`);
      doc.text(`Message: ${feedback.message}`);
      doc.text(`Submitted At: ${new Date(feedback.createdAt).toLocaleString()}`);
      doc.moveDown();
    });

    doc.end();
  } catch (err) {
    console.error('Error generating report:', err);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

router.post('/report/pdf', async (req, res) => {
  const { startDate, endDate, type } = req.body;

  try {
    // Build queries based on filters
    let ticketQuery = {};
    let feedbackQuery = {};

    if (startDate && endDate) {
      const dateFilter = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
      ticketQuery.createdAt = dateFilter;
      feedbackQuery.createdAt = dateFilter;
    }

    const tickets = (type === 'tickets' || type === 'both') ? await Ticket.find(ticketQuery).sort({ createdAt: 1 }) : [];
    const feedbacks = (type === 'feedback' || type === 'both') ? await Feedback.find(feedbackQuery).sort({ createdAt: 1 }) : [];

    if (!tickets.length && !feedbacks.length) {
      return res.status(404).json({ error: 'No data matches the filter criteria' });
    }

    const doc = new PDFDocument({ margin: 50, size: 'A4', bufferPages: true });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="Support_Report.pdf"');
    doc.pipe(res);

    const colors = {
      primary: '#1a73e8',
      text: '#202124',
      lightText: '#5f6368',
      background: '#ffffff',
      tableHeader: '#f1f3f4',
    };

    const formatDate = (date) => {
      if (!date) return '-';
      return new Date(date).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
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
          .fill(rowIndex % 2 === 0 ? colors.background : colors.tableHeader);

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

    // Cover Page
    doc.addPage();
    doc.fillColor(colors.primary)
      .fontSize(30)
      .font('Helvetica-Bold')
      .text('Support Report', { align: 'center', valign: 'center' });

    doc.moveDown(2);
    doc.fontSize(14)
      .fillColor(colors.lightText)
      .font('Helvetica')
      .text(`Generated on: ${new Date().toLocaleString('en-GB')}`, { align: 'center' });

    // Tickets Section
    if (tickets.length > 0) {
      doc.addPage();
      doc.fontSize(20)
        .fillColor(colors.primary)
        .font('Helvetica-Bold')
        .text('Tickets Summary', 50, 50);

      const ticketHeaders = ['Subject', 'Description', 'Email', 'Status', 'Created At'];
      const ticketRows = tickets.map((ticket) => [
        ticket.subject || '-',
        ticket.description || '-',
        ticket.email || '-',
        ticket.status || '-',
        formatDate(ticket.createdAt),
      ]);

      drawTable(ticketHeaders, ticketRows, 50, 100, 500);
    }

    // Feedback Section
    if (feedbacks.length > 0) {
      doc.addPage();
      doc.fontSize(20)
        .fillColor(colors.primary)
        .font('Helvetica-Bold')
        .text('Feedback Summary', 50, 50);

      const feedbackHeaders = ['Name', 'Email', 'Message', 'Submitted At'];
      const feedbackRows = feedbacks.map((feedback) => [
        feedback.name || 'Anonymous',
        feedback.email || 'N/A',
        feedback.message || '-',
        formatDate(feedback.createdAt),
      ]);

      drawTable(feedbackHeaders, feedbackRows, 50, 100, 500);
    }

    // Footer
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

module.exports = router;
