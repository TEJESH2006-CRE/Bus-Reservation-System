const Review = require("../models/Review");
const Booking = require("../models/booking");

// Add a review
const addReview = async (req, res) => {
  try {
    const {
      tripId,
      bookingId,
      rating,
      comment,
    } = req.body;

    if (!tripId || !bookingId || !rating) {
      return res.status(400).json({
        message: "tripId, bookingId and rating are required",
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        message: "Rating must be between 1 and 5",
      });
    }

    // Check booking
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    // Make sure booking belongs to logged-in customer
    if (String(booking.user) !== String(req.user.id)) {
      return res.status(403).json({
        message: "You cannot review this booking",
      });
    }

    // Make sure booking is for the selected trip
    if (String(booking.trip) !== String(tripId)) {
      return res.status(400).json({
        message: "This booking does not belong to the selected trip",
      });
    }

    // Only confirmed bookings can be reviewed
    if (booking.bookingStatus !== "confirmed") {
      return res.status(400).json({
        message: "Only confirmed bookings can be reviewed",
      });
    }

    // Check if user already reviewed this trip
    const existingReview = await Review.findOne({
      user: req.user.id,
      trip: tripId,
    });

    if (existingReview) {
      return res.status(400).json({
        message: "You have already reviewed this trip",
      });
    }

    const review = await Review.create({
      user: req.user.id,
      trip: tripId,
      booking: bookingId,
      rating,
      comment,
    });

    res.status(201).json({
      message: "Review added successfully",
      review,
    });
  } catch (error) {
    console.error("Add review error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};
const getReviews = async (req, res) => {
  try {
    const { tripId } = req.params;

    const reviews = await Review.find({
      trip: tripId,
      isVisible: true,
    })
      .populate("user", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Reviews fetched successfully",
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    console.error("Get reviews error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  addReview,
   getReviews,
};