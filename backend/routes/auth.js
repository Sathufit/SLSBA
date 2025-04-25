const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// ✅ Register Route (no manual hashing — let model handle it)
router.post("/register", async (req, res) => {
  try {
    const { email, password, ...rest } = req.body;

    // Only pass plain password — User model will hash via .pre("save")
    const user = await User.create({ ...rest, email, password });

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ✅ Login Route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("🟡 Login attempt:", email, password);

    const user = await User.findOne({ email });
    if (!user) {
      console.log("❌ No user found");
      return res.status(401).json({ error: "User not found" });
    }

    console.log("🔐 Stored hash:", user.password);

    const isMatch = await bcrypt.compare(password, user.password);
    console.log("✅ Password match:", isMatch);

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, "SECRET_KEY", { expiresIn: "1d" });
    res.json({ token, user });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: err.message });
  }
});
router.put("/:id", async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(updatedUser);
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ error: "Failed to update user" });
  }
});

module.exports = router;
