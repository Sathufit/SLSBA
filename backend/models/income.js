const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// Define the Income Schema
const incomeSchema = new Schema({
  tournamentName: {
    type: String,
    required: true,
  },
  tournamentDate: {
    type: Date,
    required: true,
  },
  entryFees: {
    type: Number,
    required: true,
  },
  ticketSales: {
    type: Number,
    required: true,
  },
  sponsorships: {
    type: Number,
    required: true,
  },
  totalIncome: {
    type: Number,
    required: true,
    validate: {
      validator: function(v) {
        return v === (this.entryFees + this.ticketSales + this.sponsorships);
      },
      message: 'totalIncome must equal the sum of entryFees, ticketSales, and sponsorships.'
    }
  },
});

// Index the `tournamentDate` field for better query performance
incomeSchema.index({ tournamentDate: 1 });

// Create a model based on the schema
const Income = mongoose.model('Income', incomeSchema);

module.exports = Income;
