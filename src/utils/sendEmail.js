const nodeMailer = require("nodemailer");
require("dotenv").config();

const sendEmail = async ({ to, subject, html }) => {
  console.log("📧 Preparing to send email to:", to);
  console.log("Using Email:", process.env.EMAIL_USER);
  console.log("Using Pass:", process.env.EMAIL_PASS);
  console.log("📧 Preparing to send email to:", to);

  try {
    const transporter = nodeMailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("📨 Email sent to", to, "| Message ID:", info.messageId);
  } catch (error) {
    console.error("❌ Failed to send email:", error);
  }
};

module.exports = {
  sendEmail,
};
