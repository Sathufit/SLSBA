const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const connectDB = require("./shared/db");

const app = express();

// ✅ Body parser middleware
app.use(express.json());

// ✅ Development CORS (allow all origins temporarily)
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: false,
}));

// ✅ Serve uploaded static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Health check route
app.get("/", (req, res) => {
  res.send("✅ SLSBA API is running");
});

// ✅ Core Modules
app.use("/api/tournaments", require("./routes/tournamentRoutes"));
app.use("/api/tournament-registrations", require("./routes/tournamentRegistrationRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/payments", require("./routes/payments"));
app.use("/api/training", require("./routes/trainingRoutes"));
app.use("/api/players", require("./routes/playeroute"));
app.use("/api/news", require("./routes/NewsRoutes")); 
app.use("/api/media", require("./routes/MediaRoutes")); 


// ✅ Feedback and Ticket System
app.use("/api/feedback", require("./routes/feedbackRoutes"));
app.use("/api/tickets", require("./routes/ticketRoutes"));

// ✅ Finance Modules
app.use("/api/incomes", require("./routes/incomes"));
app.use("/api/expenses", require("./routes/expenseRoutes"));

// ✅ Start Server after DB Connect
const startServer = async () => {
  try {
    await connectDB();
    const PORT = process.env.PORT || 5001;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to connect to MongoDB:", err);
    process.exit(1);
  }
};
// ✅ Serve frontend build in production
if (process.env.NODE_ENV === "production") {
  const frontendPath = path.join(__dirname, "../frontend/dist");
  app.use(express.static(frontendPath));

  app.get("*", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
  });
}


startServer();

// ✅ Safety Handlers
process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Promise Rejection:", err);
  process.exit(1);
});
