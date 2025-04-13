const mongoose = require("mongoose");
const Training = require("../models/trainingmodel");

// Get all training programs
const getTrainings = async (req, res) => {
    try {
        const trainings = await Training.find();
        res.status(200).json(trainings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Add a new training program
const addTraining = async (req, res) => {
    const { programname, trainingtype, time, location } = req.body;

    // Check if any required field is missing
    if (!programname || !trainingtype || !location) {
        return res.status(400).json({ message: "All required fields must be filled!" });
    }

    try {
        // Ensure a unique programid is generated
        const training = new Training({
            programid: new mongoose.Types.ObjectId(),  // Assign a unique ObjectId
            programname,
            trainingtype,
            time,
            location
        });

        const savedTraining = await training.save();

        return res.status(201).json({ training: savedTraining });
    } catch (err) {
        console.error(err);
        
        // Handle duplicate key error specifically
        if (err.code === 11000) {
            return res.status(400).json({ message: "Duplicate programid detected!", error: err.message });
        }

        return res.status(500).json({ message: "Error adding training program", error: err.message });
    }
};


// Get training by ID
const getById = async (req, res) => {
    const id = req.params.id;

    try {
        const training = await Training.findById(id);
        if (!training) {
            return res.status(404).json({ message: "Training program not found" });
        }
        return res.status(200).json({ training });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server error" });
    }
};

// Update training
const updateTraining = async (req, res) => {
    const id = req.params.id;
    const {programname, trainingtype, time, location } = req.body;

    try {
        const training = await Training.findByIdAndUpdate(
            id,
            {programname, trainingtype, time, location },
            { new: true }
        );

        if (!training) {
            return res.status(404).json({ message: "Unable to update training details" });
        }
        return res.status(200).json({ training });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server error" });
    }
};

// Delete training
const deleteTraining = async (req, res) => {
    const id = req.params.id;

    try {
        const training = await Training.findByIdAndDelete(id);
        if (!training) {
            return res.status(404).json({ message: "Unable to delete training details" });
        }
        return res.status(200).json({ message: "Training program deleted successfully" });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server error" });
    }
};

// Export all functions
module.exports = {
    getTrainings,
    addTraining,
    getById,
    updateTraining,
    deleteTraining
};
