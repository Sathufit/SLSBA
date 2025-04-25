const express = require("express");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");
const authRoutes = require("./routes/auth");
const connectDB = require("./shared/db");

dotenv.config();

const app = express();

// Middleware
app.use(express.json());

app.use(cors({
  origin: ["http://localhost:3000", "https://slsba.onrender.com"], // include hosted origin too
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

app.options("*", cors());

// Serve uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/tournaments", require("./routes/tournamentRoutes"));
app.use("/api/tournament-registrations", require("./routes/tournamentRegistrationRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/training", require("./routes/trainingRoutes"));
app.use("/api/players", require("./routes/playeroute"));
app.use("/api/news", require("./routes/NewsRoutes")); 
app.use("/api/media", require("./routes/MediaRoutes")); 
app.use("/api/feedback", require("./routes/feedbackRoutes"));
app.use("/api/tickets", require("./routes/ticketRoutes"));
app.use("/api/incomes", require("./routes/incomes"));
app.use("/api/expenses", require("./routes/expenseRoutes"));
app.use("/api/users", require("./routes/auth"));

app.get("/api/health", (req, res) => {
  res.send("✅ SLSBA API is running");
});

// 👉 Serve frontend in production
if (process.env.NODE_ENV === "production") {
  const frontendPath = path.join(__dirname, "../frontend/dist");

  app.use(express.static(frontendPath));

  // 🛠️ Catch-all route for React Router
  app.get("*", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
  });
}

// Connect to DB and start server
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

// Handle crashes
startServer();

process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Rejection:", err);
  process.exit(1);
});
