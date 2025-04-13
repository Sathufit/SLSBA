const mongoose = require("mongoose");

const Schema = mongoose.Schema;

// Define the Expense Schema
const expenseSchema = new Schema({
  tournamentName: {
    type: String,
    required: true,  // Name of the tournament
  },
  tournamentDate: {
    type: Date,
    required: true,  // The date of the tournament
  },
  venueCosts: {
    type: Number,
    required: true,  // Cost of the venue
  },
  staffPayments: {
    type: Number,
    required: true,  // Payment to the staff
  },
  equipmentCosts: {
    type: Number,
    required: true,  // Cost for any equipment needed
  },
  totalExpense: {
    type: Number,
    required: true,  // Total expense for the tournament
    validate: {
      validator: function(v) {
        return v === (this.venueCosts + this.staffPayments + this.equipmentCosts);
      },
      message: 'totalExpense must equal the sum of venueCosts, staffPayments, and equipmentCosts.',
    },
  },
});

// Index the `tournamentDate` field for better query performance
expenseSchema.index({ tournamentDate: 1 });

// Create a model based on the schema
const Expense = mongoose.model('Expense', expenseSchema);

module.exports = Expense;
