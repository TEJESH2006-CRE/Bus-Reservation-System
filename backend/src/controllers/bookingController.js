const mongoose = require("mongoose");
const Booking = require("../models/booking");
const Seat = require("../models/Seat");
const Trip = require("../models/Trip");
const Passenger = require("../models/Passenger");
const Payment = require("../models/payment");


// Expire pending bookings whose seat locks have expired
const expirePendingBooking = async (booking) => {
  if (booking.bookingStatus !== "pending") {
    return false;
  }

  const seats = await Seat.find({
    _id: { $in: booking.seats },
  });

  const hasExpiredSeatLock = seats.some(
    (seat) =>
      seat.status !== "locked" ||
      String(seat.lockedBy) !== String(booking.user) ||
      !seat.lockedUntil ||
      seat.lockedUntil <= new Date()
  );

  if (!hasExpiredSeatLock) {
    return false;
  }

  // Release any seats belonging to this pending booking
  await Seat.updateMany(
    {
      _id: { $in: booking.seats },
      status: "locked",
      lockedBy: booking.user,
    },
    {
      $set: {
        status: "available",
        lockedUntil: null,
        lockedBy: null,
      },
    }
  );

  // Mark the pending booking as cancelled
  booking.bookingStatus = "cancelled";
  booking.cancelledAt = new Date();

  await booking.save();

  return true;
};

// Create a booking
const createBooking = async (req, res) => {
  try {
    const { tripId, seatIds } = req.body;

    // Validate input
    if (!tripId || !seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
      return res.status(400).json({
        message: "tripId and at least one seatId are required",
      });
    }

    // Maximum 6 seats per booking
    if (seatIds.length > 6) {
      return res.status(400).json({
        message: "You can book a maximum of 6 seats",
      });
    }

    // Check trip exists
    const trip = await Trip.findById(tripId);

    if (!trip) {
      return res.status(404).json({
        message: "Trip not found",
      });
    }

    // Find selected seats
    const seats = await Seat.find({
      _id: { $in: seatIds },
      trip: tripId,
    });

    // Check all seats exist
    if (seats.length !== seatIds.length) {
      return res.status(400).json({
        message: "One or more seats are invalid for this trip",
      });
    }

    // Check seats are locked by this customer
    const invalidSeats = seats.filter(
      (seat) =>
        seat.status !== "locked" ||
        String(seat.lockedBy) !== String(req.user.id) ||
        !seat.lockedUntil ||
        seat.lockedUntil <= new Date()
    );

    if (invalidSeats.length > 0) {
      return res.status(400).json({
        message:
          "One or more seats are not locked by you or the lock has expired",
      });
    }

    // Calculate total amount based on each seat type
const totalAmount = seats.reduce((total, seat) => {
  if (seat.seatType === "Seater") {
    return total + (trip.seaterFare ?? trip.fare);
  }

  if (seat.seatType === "Sleeper") {
    return total + (trip.sleeperFare ?? trip.fare);
  }

  return total;
}, 0);

    // Create booking
    const booking = await Booking.create({
      user: req.user.id,
      trip: tripId,
      seats: seatIds,
      totalAmount,
      bookingStatus: "pending",
      paymentStatus: "pending",
    });

    res.status(201).json({
      message: "Booking created successfully",
      booking,
    });
  } catch (error) {
    console.error("Create booking error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

const getMyBookings = async (req, res) => {
  try {
    // Pagination
    const page = Math.max(parseInt(req.query.page) || 1, 1);

    const limit = Math.min(
      Math.max(parseInt(req.query.limit) || 10, 1),
      50
    );

    // Booking filter
    const filter = {
      user: req.user.id,
    };

    // Optional status filter
    if (req.query.status) {
      const allowedStatuses = [
        "pending",
        "confirmed",
        "cancelled",
      ];

      if (!allowedStatuses.includes(req.query.status)) {
        return res.status(400).json({
          message: "Invalid booking status",
        });
      }

      filter.bookingStatus = req.query.status;
    }

    // Fetch all matching bookings first
    // so expired pending bookings can be updated.
    const bookingsForExpiry = await Booking.find(filter);

    // Automatically expire stale pending bookings
    for (const booking of bookingsForExpiry) {
      await expirePendingBooking(booking);
    }

    // Count bookings after possible status updates
    const totalBookings = await Booking.countDocuments(filter);

    const totalPages = Math.ceil(
      totalBookings / limit
    );

    // Prevent requesting a page beyond the available range
    const skip = (page - 1) * limit;

    // Fetch paginated bookings
    const bookings = await Booking.find(filter)
  .populate({
    path: "trip",
    populate: {
      path: "route",
    },
  })
  .populate("seats")
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(limit);

    res.status(200).json({
      message: "Bookings fetched successfully",

      pagination: {
        page,
        limit,
        totalBookings,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },

      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error(
      "Get my bookings error:",
      error.message
    );

    res.status(500).json({
      message: "Server error",
    });
  }
};

// Get one booking details
const getBookingById = async (req, res) => {
  try {
    const { bookingId } = req.params;

    // Find booking
    const booking = await Booking.findById(bookingId)
      .populate("trip")
      .populate("seats");

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    // Make sure booking belongs to logged-in customer
    if (String(booking.user) !== String(req.user.id)) {
      return res.status(403).json({
        message: "You cannot view this booking",
      });
    }

    // Automatically expire stale pending booking
    await expirePendingBooking(booking);

    // Refresh booking after possible status update
    const updatedBooking = await Booking.findById(bookingId)
      .populate("trip")
      .populate("seats");

    // Get passengers for this booking
    const passengers = await Passenger.find({
      booking: bookingId,
    }).populate("seat");

    // Get payment details
    const payment = await Payment.findOne({
      booking: bookingId,
    });

    res.status(200).json({
      message: "Booking details fetched successfully",
      booking: updatedBooking,
      passengers,
      payment,
    });
  } catch (error) {
    console.error("Get booking details error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// Cancel a booking
const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    // Find booking
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    // Make sure booking belongs to logged-in customer
    if (String(booking.user) !== String(req.user.id)) {
      return res.status(403).json({
        message: "You cannot cancel this booking",
      });
    }

    // Check booking status
    if (booking.bookingStatus === "cancelled") {
      return res.status(400).json({
        message: "Booking is already cancelled",
      });
    }

    // Only confirmed bookings can be cancelled
    if (booking.bookingStatus !== "confirmed") {
      return res.status(400).json({
        message: "Only confirmed bookings can be cancelled",
      });
    }
    // Calculate refund based on departure time
const trip = await Trip.findById(booking.trip);

if (!trip) {
  return res.status(404).json({
    message: "Trip not found",
  });
}

const departureDateTime = new Date(trip.journeyDate);
const [hours, minutes] = trip.departureTime.split(":").map(Number);

departureDateTime.setHours(hours, minutes, 0, 0);

const currentTime = new Date();
const hoursBeforeDeparture =
  (departureDateTime - currentTime) / (1000 * 60 * 60);

let refundPercentage = 0;

if (hoursBeforeDeparture > 24) {
  refundPercentage = 90;
} else if (hoursBeforeDeparture >= 6) {
  refundPercentage = 50;
}

const refundAmount =
  (booking.totalAmount * refundPercentage) / 100;

    // Release booked seats
   await Seat.updateMany(
  {
    _id: { $in: booking.seats },
  },
  {
    $set: {
      status: "available",
      lockedUntil: null,
      lockedBy: null,
    },
  }
);

// Update booking
booking.bookingStatus = "cancelled";
booking.paymentStatus = "refunded";
booking.refundAmount = refundAmount;
booking.cancelledAt = new Date();

await booking.save();

// Update payment
await Payment.findOneAndUpdate(
  { booking: booking._id },
  {
    $set: {
      status: "refunded",
      refundAmount: refundAmount,
    },
  }
);

res.status(200).json({
  message: "Booking cancelled successfully. Refund amount calculated.",
  refundAmount,
  refundPercentage,
  booking,
});

} catch (error) {
  console.error("Cancel booking error:", error.message);

  res.status(500).json({
    message: "Server error",
  });
}
};


const deleteCompletedBooking = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      await session.abortTransaction();
      return res.status(400).json({
        message: "Invalid booking ID",
      });
    }

    const booking = await Booking.findOne({
      _id: req.params.id,
      user: req.user.id,
    }).session(session);

    if (!booking) {
      await session.abortTransaction();
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    const trip = await Trip.findById(booking.trip).session(session);

    if (!trip || trip.status !== "completed") {
      await session.abortTransaction();
      return res.status(400).json({
        message: "Only bookings for completed trips can be deleted",
      });
    }

    await Booking.deleteOne(
      { _id: booking._id, user: req.user.id },
      { session }
    );

    await session.commitTransaction();

    return res.status(200).json({
      message: "Completed-trip booking deleted successfully",
      bookingId: booking._id,
    });
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    console.error("Delete completed booking error:", error.message);

    return res.status(500).json({
      message: "Server error",
    });
  } finally {
    await session.endSession();
  }
};


module.exports = {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
  deleteCompletedBooking,
};