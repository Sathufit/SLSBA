const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Name is required'] },
  email: { type: String, required: [true, 'Email is required'] },
  message: { type: String, required: [true, 'Message is required'] },
  createdAt: { type: Date, default: Date.now },
});


module.exports = mongoose.model('Feedback', feedbackSchema);
