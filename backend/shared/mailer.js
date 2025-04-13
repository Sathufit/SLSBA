const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendTicketReplyEmail = async (to, subject, reply) => {
  const htmlTemplate = `
    <div style="font-family: 'Segoe UI', sans-serif; background-color: #f9f9f9; padding: 20px;">
      <div style="max-width: 600px; background: white; padding: 30px; border-radius: 8px; margin: auto; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
        <h2 style="color: #0077cc;">🎟️ Your Ticket Has Been Responded To</h2>
        <p>Hi there,</p>
        <p>We've reviewed your ticket and here’s our response:</p>

        <blockquote style="border-left: 4px solid #0077cc; padding-left: 10px; margin: 20px 0; color: #333;">
          ${reply}
        </blockquote>

        <p>If you have any further questions, feel free to reply or submit another ticket.</p>

        <p style="margin-top: 30px;">Best regards,<br/><strong>SLSBA Support Team</strong></p>
        <hr style="margin-top: 30px;" />
        <p style="font-size: 12px; color: #999;">This is an automated message from the Sri Lanka Schools Badminton Association Support System.</p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `"SLSBA Support" <${process.env.EMAIL_USER}>`,
    to,
    subject: `📝 Response to your ticket: ${subject}`,
    html: htmlTemplate,
  });
};

module.exports = { sendTicketReplyEmail };
