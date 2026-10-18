const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const testRoutes = require("./routes/testRoutes");
const adminRoutes = require("./routes/adminRoutes");
const operatorRoutes = require("./routes/operatorRoutes");
const seatRoutes = require("./routes/seatRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const passengerRoutes = require("./routes/passengerRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const searchRoutes = require("./routes/searchRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const qrRoutes = require("./routes/qrRoutes");
const pdfRoutes = require("./routes/pdfRoutes");
const emailRoutes = require("./routes/emailRoutes");
const smsRoutes = require("./routes/smsRoutes");


const app = express();

app.use(cors());

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Bus Reservation System API is running!",
  });
});

// Auth routes
app.use("/api/auth", authRoutes);

// Test routes
app.use("/api/test", testRoutes);

// Admin routes
app.use("/api/admin", adminRoutes);

// Operator routes
app.use("/api/operator", operatorRoutes);

// Seat routes
app.use("/api/seats", seatRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/passengers", passengerRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/reviews", reviewRoutes);
// QR routes
app.use("/api/qr", qrRoutes);
app.use("/api/pdf", pdfRoutes);
app.use("/api/email", emailRoutes);
app.use("/api/sms", smsRoutes);

module.exports = app;