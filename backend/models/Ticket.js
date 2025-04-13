// models/Ticket.js
const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  subject: String,
  description: String,
  email: String, 
  status: {
    type: String,
    default: 'Open',
    enum: ['Open', 'In Progress', 'Closed'],
  },
  reply: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Ticket', ticketSchema);
