const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const Tournament = require("../models/Tournament"); // Import Tournament Model
const authMiddleware = require("../middleware/authMiddleware")


const router = express.Router();

// ✅ Admin Login Route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ success: false, message: "❌ Admin not found" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);

    console.log("🔹 Entered Password:", password);
    console.log("🔹 Stored Hashed Password in MongoDB:", admin.password);

    if (!isMatch) {
      console.log("❌ Password does NOT match!");
      return res.status(401).json({ success: false, message: "Invalid password" });
    }

    console.log("✅ Password MATCHED!");

    if (!process.env.JWT_SECRET) {
      console.error("❌ JWT_SECRET is missing in the environment variables.");
      return res.status(500).json({ success: false, message: "Server error - Missing JWT secret" });
    }

    let token;
    try {
      token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    } catch (err) {
      console.error("❌ Error signing JWT:", err);
      return res.status(500).json({ success: false, message: "Server error - Unable to generate token" });
    }

    res.json({ success: true, token });
  } catch (error) {
    console.error("❌ Server Error in Login Route:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ✅ **Approve Bank Slip Route**
router.put("/approve-payment/:id", async (req, res) => {
  try {
      const tournament = await Tournament.findById(req.params.id);
      
      if (!tournament) {
          return res.status(404).json({ success: false, message: "❌ Tournament not found" });
      }

      if (tournament.paymentStatus === "Paid") {
          return res.status(400).json({ success: false, message: "✅ Payment is already approved" });
      }

      if (!tournament.paymentFile) {
          return res.status(400).json({ success: false, message: "❌ No bank slip uploaded for this registration" });
      }

      // ✅ Approve payment
      tournament.paymentStatus = "Paid";
      await tournament.save();

      console.log(`✅ Approved Payment for Tournament ID: ${tournament._id}`);
      res.status(200).json({ success: true, message: "✅ Bank slip approved & payment marked as paid!" });

  } catch (error) {
      console.error("❌ Error approving payment:", error);
      res.status(500).json({ success: false, message: "Server error while approving payment" });
  }
});


// ✅ Protected Route Example
router.get("/dashboard", authMiddleware, async (req, res) => {
  res.json({ success: true, message: "✅ Welcome to the Admin Dashboard!" });
});
router.post("/logout", (req, res) => {
  res.json({ success: true, message: "Logged out successfully" });
});


module.exports = router;
