const express = require("express");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");
const connectDB = require("./shared/db");

const authRoutes = require("./routes/auth");
const tournamentRoutes = require("./routes/tournamentRoutes");
const tournamentRegistrationRoutes = require("./routes/tournamentRegistrationRoutes");
const adminRoutes = require("./routes/adminRoutes");
const trainingRoutes = require("./routes/trainingRoutes");
const playerRoutes = require("./routes/playeroute"); // typo in your import earlier (correct spelling needed if typo exists)
const newsRoutes = require("./routes/NewsRoutes");
const mediaRoutes = require("./routes/MediaRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const ticketRoutes = require("./routes/ticketRoutes");
const incomeRoutes = require("./routes/incomes");
const expenseRoutes = require("./routes/expenseRoutes");
const financeRoutes = require("./routes/financeRoutes");

dotenv.config();

const app = express();

// ================================
// Middleware
// ================================
app.use(express.json());

// Correct CORS setup
app.use(cors({
  origin: ["http://localhost:3000", "https://slsba.onrender.com"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

app.options("*", cors());

// Static files (uploads)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ================================
// API Routes
// ================================
app.use("/api/auth", authRoutes);
app.use("/api/tournaments", tournamentRoutes);
app.use("/api/tournament-registrations", tournamentRegistrationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/training", trainingRoutes);
app.use("/api/players", playerRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/incomes", incomeRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/finance", financeRoutes);

// ✅ Remove this duplicate:
// ❌ app.use("/api/users", require("./routes/auth"));
// (because you already mounted `/api/auth`)

// Health Check Endpoint
app.get("/api/health", (req, res) => {
  res.send("✅ SLSBA API is running");
});

// ================================
// Serve Frontend (for production)
// ================================
const frontendPath = path.join(__dirname, "../frontend/dist");
app.use(express.static(frontendPath));

app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// ================================
// Connect to DB and Start Server
// ================================
const startServer = async () => {
  try {
    await connectDB();
    const PORT = process.env.PORT || 5001;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err);
    process.exit(1);
  }
};

// Handle crashes (good practice)
process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Rejection:", err);
  process.exit(1);
});

startServer();
