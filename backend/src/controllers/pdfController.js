const PDFDocument = require("pdfkit");
const Booking = require("../models/booking");
const Passenger = require("../models/Passenger");
const Bus = require("../models/Bus");
const Route = require("../models/Route");

const generateBookingPDF = async (req, res) => {
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

    if (String(booking.user) !== String(req.user.id)) {
      return res.status(403).json({
        message: "You cannot access this ticket",
      });
    }

    if (booking.bookingStatus !== "confirmed") {
      return res.status(400).json({
        message: "PDF ticket is available only for confirmed bookings",
      });
    }

    if (!booking.pnr) {
      return res.status(400).json({
        message: "PNR not available for this booking",
      });
    }

    const passengers = await Passenger.find({
      booking: bookingId,
    });

    const bus = await Bus.findById(booking.trip.bus);
    const route = await Route.findById(booking.trip.route);

    if (!bus || !route) {
      return res.status(404).json({
        message: "Bus or route details not found",
      });
    }

    const doc = new PDFDocument({
      margin: 50,
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="ticket-${booking.pnr}.pdf"`
    );

    doc.pipe(res);

    // Title
    doc
      .fontSize(22)
      .text("BUS RESERVATION TICKET", {
        align: "center",
      });

    doc.moveDown();

    // PNR
    doc
      .fontSize(14)
      .text(`PNR: ${booking.pnr}`, {
        align: "center",
      });

    doc.moveDown(2);

    // Booking details
    doc.fontSize(12).text("BOOKING DETAILS", {
      underline: true,
    });

    doc.moveDown(0.5);

    doc.text(`Booking ID: ${booking._id}`);
    doc.text(`Booking Status: ${booking.bookingStatus}`);
    doc.text(`Payment Status: ${booking.paymentStatus}`);
    doc.text(`Total Amount: Rs. ${booking.totalAmount}`);

    doc.moveDown();

    // Bus details
    doc.fontSize(12).text("BUS DETAILS", {
      underline: true,
    });

    doc.moveDown(0.5);

    doc.text(`Bus Name: ${bus.busName}`);
    doc.text(`Bus Number: ${bus.busNumber}`);
    doc.text(`Bus Type: ${bus.busType}`);
    doc.text(`Seat Type: ${bus.seatType}`);

    doc.moveDown();

    // Journey details
    doc.fontSize(12).text("JOURNEY DETAILS", {
      underline: true,
    });

    doc.moveDown(0.5);

    doc.text(`From: ${route.from}`);
    doc.text(`To: ${route.to}`);
    doc.text(
      `Journey Date: ${booking.trip.journeyDate.toISOString().split("T")[0]}`
    );
    doc.text(`Departure: ${booking.trip.departureTime}`);
    doc.text(`Arrival: ${booking.trip.arrivalTime}`);

    doc.moveDown();

    // Seat details
    doc.fontSize(12).text("SEAT DETAILS", {
      underline: true,
    });

    doc.moveDown(0.5);

    const seatNumbers = booking.seats
      .map((seat) => seat.seatNumber)
      .join(", ");

    doc.text(`Seats: ${seatNumbers}`);

    doc.moveDown();

    // Passenger details
    doc.fontSize(12).text("PASSENGER DETAILS", {
      underline: true,
    });

    doc.moveDown(0.5);

    if (passengers.length === 0) {
      doc.text("No passenger details added.");
    } else {
      passengers.forEach((passenger, index) => {
        doc.text(`Passenger ${index + 1}`);
        doc.text(`Name: ${passenger.name}`);
        doc.text(`Age: ${passenger.age}`);
        doc.text(`Gender: ${passenger.gender}`);
        doc.text(`Phone: ${passenger.phone}`);
        doc.moveDown(0.5);
      });
    }

    doc.moveDown();

    doc
      .fontSize(10)
      .text(
        "Thank you for using our Bus Reservation System!",
        {
          align: "center",
        }
      );

    doc.end();
  } catch (error) {
    console.error("Generate PDF error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  generateBookingPDF,
};