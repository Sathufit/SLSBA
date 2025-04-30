const express = require("express");
const PDFDocument = require("pdfkit");
const News = require("../models/NewsModel");
const Media = require("../models/MediaModel");

const router = express.Router();
const NewsController = require("../controllers/NewsControllers");
const upload = require("../middleware/upload");

router.get("/", NewsController.getAllNews); // ✅ THIS ROUTE
router.post("/", upload.single("image"), NewsController.addNews);
router.get("/:id", NewsController.getByIdNews);
router.put("/:id", upload.single("image"), NewsController.updateNews);
router.delete("/:id", NewsController.deleteNews);

router.post("/report/pdf", async (req, res) => {
  const { startDate, endDate, category, type = "news" } = req.body;

  try {
    let query = {};
    if (startDate && endDate) {
      query.publishedDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    if (category) {
      query.category = category;
    }

    let data = [];
    if (type === "news") {
      data = await News.find(query).sort({ publishedDate: 1 });
    } else if (type === "media") {
      data = await Media.find(query).sort({ createdAt: 1 });
    }

    if (!data.length) {
      return res.status(404).json({ error: "No data found for the selected filters." });
    }

    const doc = new PDFDocument({ margin: 50, size: "A4" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${type}_report.pdf"`);
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
      .text(`${type === "news" ? "News Articles" : "Media Galleries"} Report`, { align: "center" });

    doc.moveDown(2);
    doc.fontSize(14).fillColor(colors.lightText).font("Helvetica")
      .text(`Generated on: ${new Date().toLocaleString("en-GB")}`, { align: "center" });

    if (type === "news") {
      const headers = ["Title", "Category", "Author", "Published Date"];
      const rows = data.map((item) => [
        item.title || "Untitled",
        item.category || "N/A",
        item.author || "N/A",
        formatDate(item.publishedDate),
      ]);

      drawTable(headers, rows, 50, 100, 500);
    } else if (type === "media") {
      const headers = ["Title", "Description", "Images", "Created At"];
      const rows = data.map((item) => [
        item.title || "Untitled",
        item.description || "N/A",
        `${item.images.length || 0} images`,
        formatDate(item.createdAt),
      ]);

      drawTable(headers, rows, 50, 100, 500);
    }

    const pageCount = doc.bufferedPageCount;
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);
      doc.fontSize(10).fillColor(colors.lightText)
        .text(`Page ${i + 1} of ${pageCount}`, 50, 800, { align: "center" });
    }

    doc.end();
  } catch (error) {
    console.error("Error generating report:", error);
    res.status(500).json({ error: "Error generating report." });
  }
});

module.exports = router;
