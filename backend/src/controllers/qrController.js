const QRCode = require("qrcode");
const Booking = require("../models/booking");

const generateBookingQR = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId)
      .populate("trip")
      .populate("seats");

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    // Make sure the booking belongs to the logged-in customer
    if (String(booking.user) !== String(req.user.id)) {
      return res.status(403).json({
        message: "You cannot access this booking QR code",
      });
    }

    // Only confirmed bookings can have a QR code
    if (booking.bookingStatus !== "confirmed") {
      return res.status(400).json({
        message: "QR code is available only for confirmed bookings",
      });
    }

    if (!booking.pnr) {
      return res.status(400).json({
        message: "PNR not available for this booking",
      });
    }

    const qrData = JSON.stringify({
      bookingId: booking._id,
      pnr: booking.pnr,
      tripId: booking.trip._id,
      seats: booking.seats.map((seat) => seat.seatNumber),
      totalAmount: booking.totalAmount,
    });

    const qrCode = await QRCode.toDataURL(qrData);

    res.status(200).json({
      message: "QR code generated successfully",
      pnr: booking.pnr,
      qrCode,
    });
  } catch (error) {
    console.error("Generate QR error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  generateBookingQR,
};