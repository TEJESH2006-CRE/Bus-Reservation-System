const express = require("express");

const {
  createBooking,
  getMyBookings,
  getBookingById,
  deleteCompletedBooking,
  cancelBooking,
} = require("../controllers/bookingController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Create a booking
router.post(
  "/",
  protect,
  createBooking
);

// Get logged-in customer's bookings
router.get(
  "/my",
  protect,
  getMyBookings
);

router.delete(
  "/my/:id",
  protect,
  deleteCompletedBooking
);

// Get one booking details
router.get(
  "/:bookingId",
  protect,
  getBookingById
);
// Cancel a booking
router.patch(
  "/:bookingId/cancel",
  protect,
  cancelBooking
);

module.exports = router;