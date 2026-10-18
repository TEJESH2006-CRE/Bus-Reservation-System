const mongoose = require("mongoose");
const Booking = require("../models/booking");
const Payment = require("../models/payment");
const Seat = require("../models/Seat");
const User = require("../models/User");
const nodemailer = require("nodemailer");
const Trip = require("../models/Trip");

const generatePNR = () => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let pnr = "BR";

  for (let i = 0; i < 8; i++) {
    pnr += characters.charAt(
      Math.floor(Math.random() * characters.length)
    );
  }

  return pnr;
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Mock payment
const makePayment = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const { bookingId } = req.body;

    // Validate booking ID
    if (!bookingId) {
      return res.status(400).json({
        message: "bookingId is required",
      });
    }

    // Find booking
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }
    // Check whether the trip is still available
const trip = await Trip.findById(booking.trip);

if (!trip || trip.status === "cancelled") {
  return res.status(400).json({
    message: "Payment is not allowed for a cancelled trip",
  });
}

    // Find user
    const user = await User.findById(booking.user);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Make sure booking belongs to logged-in customer
    if (String(booking.user) !== String(req.user.id)) {
      return res.status(403).json({
        message: "You cannot make payment for this booking",
      });
    }

    // Prevent duplicate payment
    if (booking.paymentStatus === "paid") {
      return res.status(400).json({
        message: "Booking is already paid",
      });
    }

    // Get booking seats
    const seats = await Seat.find({
      _id: { $in: booking.seats },
      trip: booking.trip,
    });

    // Make sure all booking seats were found
    if (seats.length !== booking.seats.length) {
      return res.status(400).json({
        message: "One or more booking seats were not found",
      });
    }

    // Check all seats are still locked
    const invalidSeats = seats.filter(
      (seat) =>
        seat.status !== "locked" ||
        String(seat.lockedBy) !== String(req.user.id) ||
        !seat.lockedUntil ||
        seat.lockedUntil <= new Date()
    );

    if (invalidSeats.length > 0) {
      return res.status(400).json({
        message: "One or more seats are no longer locked by you",
      });
    }

    // Start transaction
    session.startTransaction();

    // Create payment record
    const transactionId = `MOCK_${Date.now()}`;

    const payment = await Payment.create(
      [
        {
          booking: booking._id,
          amount: booking.totalAmount,
          paymentMethod: "mock",
          transactionId,
          status: "paid",
          paidAt: new Date(),
        },
      ],
      { session }
    );

    // Mark seats as booked
    const seatUpdateResult = await Seat.updateMany(
      {
        _id: { $in: booking.seats },
        status: "locked",
        lockedBy: req.user.id,
      },
      {
        $set: {
          status: "booked",
          lockedUntil: null,
          lockedBy: null,
        },
      },
      { session }
    );

    // Make sure all seats were successfully booked
    if (seatUpdateResult.modifiedCount !== booking.seats.length) {
      throw new Error("Failed to book all selected seats");
    }

    // Generate PNR
    booking.pnr = generatePNR();

    // Confirm booking
    booking.bookingStatus = "confirmed";
    booking.paymentStatus = "paid";

    await booking.save({ session });

    // Commit transaction
    await session.commitTransaction();

    await session.endSession();

    // Send confirmation email after successful transaction
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: "Bus Reservation Booking Confirmed",
        text: `Your bus booking has been confirmed.

PNR: ${booking.pnr}
Booking ID: ${booking._id}
Total Amount: Rs. ${booking.totalAmount}

Thank you for using our Bus Reservation System.`,
      });
    } catch (emailError) {
      console.error(
        "Booking confirmation email failed:",
        emailError.message
      );
    }

    res.status(200).json({
      message: "Payment successful. Booking confirmed.",
      payment: payment[0],
      booking,
    });
  } catch (error) {
    // Roll back transaction if active
    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    await session.endSession();

    console.error("Payment error:", error.message);

    res.status(500).json({
      message: "Payment failed",
    });
  }
};

module.exports = {
  makePayment,
};