const express = require("express");

const { protect } = require("../middleware/authMiddleware");
const { generateBookingPDF } = require("../controllers/pdfController");

const router = express.Router();

router.get(
  "/booking/:bookingId",
  protect,
  generateBookingPDF
);

module.exports = router;