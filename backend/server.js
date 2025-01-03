import express from "express";
import bodyParser from "body-parser";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import cors from "cors"; // Import CORS middleware

dotenv.config();

const app = express();

// Enable CORS for all origins (you can also specify specific origins)
app.use(cors());

app.use(bodyParser.json());

// Email Sending Endpoint
app.post("/send-email", async (req, res) => {
  const { email, orderName, address, quantity } = req.body;

  if (!email || !orderName || !address || !quantity) {
    return res.status(400).send("Missing order details.");
  }

  // Configure Nodemailer
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER, // Your email address
      pass: process.env.EMAIL_PASS, // Your email password
    },
  });

  // Compose Email
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Order Confirmation",
    html: `
      <h1>Order Confirmation</h1>
      <p><strong>Order Name:</strong> ${orderName}</p>
      <p><strong>Quantity:</strong> ${quantity}</p>
      <p><strong>Address:</strong> ${address}</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).send("Email sent successfully!");
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).send("Failed to send email.");
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
