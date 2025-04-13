const Ticket = require('../models/Ticket');
const { sendTicketReplyEmail } = require('../shared/mailer');

exports.createTicket = async (req, res) => {
  try {
    const ticket = new Ticket(req.body);
    await ticket.save();
    res.status(201).json(ticket);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getAllTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find();
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateTicketStatus = async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.json(ticket);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteTicket = async (req, res) => {
  try {
    await Ticket.findByIdAndDelete(req.params.id);
    res.json({ message: 'Ticket deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.replyToTicket = async (req, res) => {
  try {
    const { reply } = req.body;
    console.log("📩 Reply received from frontend:", reply);

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    ticket.reply = reply;
    ticket.status = 'Closed';
    await ticket.save();

    console.log("📧 Sending email to:", ticket.email); // Log email address
    await sendTicketReplyEmail(ticket.email, ticket.subject, reply);

    res.json(ticket);
  } catch (error) {
    console.error('❌ Error replying to ticket:', error.message);
    res.status(400).json({ message: error.message });
  }
};

