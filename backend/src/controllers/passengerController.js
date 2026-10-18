const Passenger = require("../models/Passenger");
const Booking = require("../models/booking");
const Seat = require("../models/Seat");

// Add passenger details
const addPassenger = async (req, res) => {
  try {
    const {
      bookingId,
      seatId,
      name,
      age,
      gender,
      phone,
    } = req.body;

    // Validate required fields
    if (!bookingId || !seatId || !name || !age || !gender || !phone) {
      return res.status(400).json({
        message: "All passenger details are required",
      });
    }

    // Check booking exists
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    // Make sure booking belongs to logged-in customer
    if (String(booking.user) !== String(req.user.id)) {
      return res.status(403).json({
        message: "You cannot add passenger details to this booking",
      });
    }
    // Passenger details can only be added to a confirmed booking
if (booking.bookingStatus !== "confirmed") {
  return res.status(400).json({
    message: "Passenger details can only be added to a confirmed booking",
  });
}

    // Check seat belongs to booking
    const seatBelongsToBooking = booking.seats.some(
      (seat) => String(seat) === String(seatId)
    );

    if (!seatBelongsToBooking) {
      return res.status(400).json({
        message: "This seat is not part of the booking",
      });
    }

    // Check seat exists
    const seat = await Seat.findById(seatId);

    if (!seat) {
      return res.status(404).json({
        message: "Seat not found",
      });
    }
    // Seat must be booked before passenger details are added
if (seat.status !== "booked") {
  return res.status(400).json({
    message: "Passenger details can only be added to a booked seat",
  });
}

    // Check if passenger already exists for this seat
    const existingPassenger = await Passenger.findOne({
      booking: bookingId,
      seat: seatId,
    });

    if (existingPassenger) {
      return res.status(400).json({
        message: "Passenger details already added for this seat",
      });
    }

    // Create passenger
    const passenger = await Passenger.create({
      booking: bookingId,
      seat: seatId,
      name,
      age,
      gender,
      phone,
    });

    res.status(201).json({
      message: "Passenger details added successfully",
      passenger,
    });
  } catch (error) {
    console.error("Add passenger error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  addPassenger,
};