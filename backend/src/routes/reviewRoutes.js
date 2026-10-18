const express = require("express");

const {
  addReview,
  getReviews,
} = require("../controllers/reviewController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Add a review
router.post(
  "/",
  protect,
  addReview
);

// Get reviews for a trip
router.get(
  "/trip/:tripId",
  getReviews
);

module.exports = router;