const mongoose = require("mongoose");
const Player = require("../models/playermodel");

// Get all players
const getPlayer = async (req, res) => {
  try {
    const players = await Player.find();
    res.status(200).json(players);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addPlayer = async (req, res) => {
  const {
    fullname,
    dateofbirth,
    gender,
    schoolname,
    contactnumber,
    email,
    address,
    guardianname,
    guardiancontact,
    programid,
  } = req.body;

  try {
    const existingPlayer = await Player.findOne({ email });
    if (existingPlayer) {
      return res.status(400).json({ message: "A player with this email already exists." });
    }

    const newPlayer = new Player({
      fullname,
      dateofbirth,
      gender,
      schoolname,
      contactnumber,
      email,
      address,
      guardianname,
      guardiancontact,
      programid,
    });

    const savedPlayer = await newPlayer.save();
    return res.status(200).json(savedPlayer);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error adding player", error: err.message });
  }
};

// Get player by ID
const getById = async (req, res) => {
  try {
    const player = await Player.findById(req.params.id);
    if (!player) {
      return res.status(404).json({ message: "Player not found" });
    }
    res.status(200).json(player);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update player
const updateplayer = async (req, res) => {
  const id = req.params.id;
  const { playerid, fullname, dateofbirth, gender, schoolname, contactnumber, email, address, guardianname, guardiancontact } = req.body;

  try {
    const player = await Player.findByIdAndUpdate(
      id,
      {
        playerid,
        fullname,
        dateofbirth,
        gender,
        schoolname,
        contactnumber,
        email,
        address,
        guardianname,
        guardiancontact,
      },
      { new: true }
    );

    if (!player) {
      return res.status(400).json({ message: "Unable to update player details" });
    }

    return res.status(200).json(player);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};

// Delete player
const deleteplayer = async (req, res) => {
  const id = req.params.id;

  try {
    const player = await Player.findByIdAndDelete(id);
    if (!player) {
      return res.status(400).json({ message: "Unable to delete player" });
    }

    return res.status(200).json({ message: "Player deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getPlayer,
  addPlayer,
  getById,
  updateplayer,
  deleteplayer
};
