const Seat = require("../models/Seat");

// Release expired seat locks
const releaseExpiredLocks = async () => {
  await Seat.updateMany(
    {
      status: "locked",
      lockedUntil: { $lte: new Date() },
    },
    {
      $set: {
        status: "available",
        lockedUntil: null,
        lockedBy: null,
      },
    }
  );
};

// Lock a seat for 10 minutes
const lockSeat = async (req, res) => {
  try {
    const { seatId } = req.params;

    const now = new Date();
    const lockedUntil = new Date(Date.now() + 10 * 60 * 1000);

    const seat = await Seat.findOneAndUpdate(
      {
        _id: seatId,
        $or: [
          { status: "available" },
          {
            status: "locked",
            lockedUntil: { $lte: now },
          },
        ],
      },
      {
        $set: {
          status: "locked",
          lockedUntil,
          lockedBy: req.user.id,
        },
      },
      {
        returnDocument: "after",
      }
    );

    if (!seat) {
      const existingSeat = await Seat.findById(seatId);

      if (!existingSeat) {
        return res.status(404).json({
          message: "Seat not found",
        });
      }

      if (existingSeat.status === "booked") {
        return res.status(400).json({
          message: "Seat is already booked",
        });
      }

      return res.status(400).json({
        message: "Seat is temporarily locked by another user",
        lockedUntil: existingSeat.lockedUntil,
      });
    }

    res.status(200).json({
      message: "Seat locked successfully",
      seat: {
        id: seat._id,
        seatNumber: seat.seatNumber,
        status: seat.status,
        lockedUntil: seat.lockedUntil,
        lockedBy: seat.lockedBy,
      },
    });
  } catch (error) {
    console.error("Lock seat error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};


// Release a seat lock
const releaseSeat = async (req, res) => {
  try {
    const { seatId } = req.params;

    const seat = await Seat.findOneAndUpdate(
      {
        _id: seatId,
        status: "locked",
        lockedBy: req.user.id,
      },
      {
        $set: {
          status: "available",
          lockedUntil: null,
          lockedBy: null,
        },
      },
      {
        returnDocument: "after",
      }
    );

    if (!seat) {
      const existingSeat = await Seat.findById(seatId);

      if (!existingSeat) {
        return res.status(404).json({
          message: "Seat not found",
        });
      }

      if (existingSeat.status === "booked") {
        return res.status(400).json({
          message: "Seat is already booked",
        });
      }

      if (existingSeat.status === "locked") {
        return res.status(403).json({
          message: "You cannot release a seat locked by another user",
        });
      }

      return res.status(400).json({
        message: "Seat is not currently locked",
      });
    }

    res.status(200).json({
      message: "Seat lock released successfully",
      seat: {
        id: seat._id,
        seatNumber: seat.seatNumber,
        status: seat.status,
        lockedUntil: seat.lockedUntil,
        lockedBy: seat.lockedBy,
      },
    });
  } catch (error) {
    console.error("Release seat error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};
// Get all seats for a trip
const getSeatsByTrip = async (req, res) => {
  try {
    const { tripId } = req.params;

    const seats = await Seat.find({ trip: tripId })
      .select("seatNumber seatType position status isLadiesOnly lockedUntil lockedBy")
      .lean();

    seats.sort((a, b) => {
      const numA = parseInt(a.seatNumber.replace(/\D/g, ""), 10);
      const numB = parseInt(b.seatNumber.replace(/\D/g, ""), 10);
      return numA - numB;
    });

    res.status(200).json({
      message: "Seats fetched successfully",
      count: seats.length,
      seats,
    });
  } catch (error) {
    console.error("Get seats error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};
module.exports = {
  lockSeat,
  releaseSeat,
  releaseExpiredLocks,
  getSeatsByTrip,
};