const express = require("express");

const { protect } = require("../middleware/authMiddleware");
const { generateBookingQR } = require("../controllers/qrController");

const router = express.Router();

// Generate QR code for a booking
router.get(
  "/booking/:bookingId",
  protect,
  generateBookingQR
);

module.exports = router;