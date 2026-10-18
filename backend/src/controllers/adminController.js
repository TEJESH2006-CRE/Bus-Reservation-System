const User = require("../models/User");
const Operator = require("../models/Operator");
const Booking = require("../models/booking");
const Seat = require("../models/Seat");
const Payment = require("../models/payment");
const Trip = require("../models/Trip");
const mongoose = require("mongoose");

// Get all users

const getAllUsers = async (req, res) => {
  try {
    const page = Math.max(
      1,
      parseInt(req.query.page, 10) || 1
    );

    const limit = Math.min(
      100,
      Math.max(1, parseInt(req.query.limit, 10) || 10)
    );

    const { role, isActive, search } = req.query;

    const filter = {};

    // Filter by role
    if (role) {
      const allowedRoles = ["customer", "operator", "admin"];

      if (!allowedRoles.includes(role)) {
        return res.status(400).json({
          message: "Invalid role",
        });
      }

      filter.role = role;
    }

    // Filter by account status
    if (isActive !== undefined) {
      if (!["true", "false"].includes(isActive)) {
        return res.status(400).json({
          message: "isActive must be true or false",
        });
      }

      filter.isActive = isActive === "true";
    }

    // Search by name, email or phone
    if (search && search.trim()) {
      const escapedSearch = search.trim().replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

      filter.$or = [
        { name: { $regex: escapedSearch, $options: "i" } },
        { email: { $regex: escapedSearch, $options: "i" } },
        { phone: { $regex: escapedSearch, $options: "i" } },
      ];
    }

    const totalUsers = await User.countDocuments(filter);

    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      message: "Users fetched successfully",
      count: users.length,
      totalUsers,
      currentPage: page,
      totalPages: Math.ceil(totalUsers / limit),
      users,
    });
  } catch (error) {
    console.error("Get users error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};


// Get one user by ID
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      message: "User fetched successfully",
      user,
    });
  } catch (error) {
    console.error("Get user error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// Activate / deactivate user
const updateUserStatus = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
  return res.status(400).json({
    message: "Invalid user ID",
  });
}
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        message: "isActive must be true or false",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      message: "User status updated successfully",
      user,
    });
  } catch (error) {
    console.error("Update user status error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// Get all operators
const getAllOperators = async (req, res) => {
  try {
    const operators = await Operator.find()
      .populate("user", "name email phone role isActive");

    res.status(200).json({
      message: "Operators fetched successfully",
      count: operators.length,
      operators,
    });
  } catch (error) {
    console.error("Get operators error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// Approve / reject operator
const updateOperatorApproval = async (req, res) => {
  try {
    const { isApproved } = req.body;

    if (typeof isApproved !== "boolean") {
      return res.status(400).json({
        message: "isApproved must be true or false",
      });
    }

    const operator = await Operator.findByIdAndUpdate(
      req.params.id,
      { isApproved },
      { new: true }
    ).populate("user", "name email phone role isActive");

    if (!operator) {
      return res.status(404).json({
        message: "Operator not found",
      });
    }

    res.status(200).json({
      message: isApproved
        ? "Operator approved successfully"
        : "Operator rejected successfully",
      operator,
    });
  } catch (error) {
    console.error("Update operator approval error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};
// Get all bookings

const getAllBookings = async (req, res) => {
  try {
    const { bookingStatus } = req.query;

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(
      100,
      Math.max(1, parseInt(req.query.limit, 10) || 10)
    );

    const filter = {};

    if (bookingStatus !== undefined) {
      const allowedStatuses = [
        "pending",
        "confirmed",
        "cancelled",
      ];

      if (!allowedStatuses.includes(bookingStatus)) {
        return res.status(400).json({
          message:
            "bookingStatus must be pending, confirmed or cancelled",
        });
      }

      filter.bookingStatus = bookingStatus;
    }

    const totalBookings = await Booking.countDocuments(filter);

    const bookings = await Booking.find(filter)
      .populate("user", "name email phone")
      .populate({
  path: "trip",
  select: "journeyDate departureTime arrivalTime fare bus route",
  populate: [
    {
      path: "bus",
      select: "busName busNumber",
    },
    {
      path: "route",
      select: "from to distance duration",
    },
  ],
})
      .populate("seats", "seatNumber seatType status")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      message: "Bookings fetched successfully",
      count: bookings.length,
      totalBookings,
      currentPage: page,
      totalPages: Math.ceil(totalBookings / limit),
      bookings,
    });
  } catch (error) {
    console.error("Get bookings error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// Get one booking by ID
const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("user", "name email phone")
      .populate("trip", "journeyDate departureTime arrivalTime fare")
      .populate("seats", "seatNumber seatType status");

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    res.status(200).json({
      message: "Booking fetched successfully",
      booking,
    });
  } catch (error) {
    console.error("Get booking error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};
// Cancel booking by admin

const cancelBookingByAdmin = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
  await session.abortTransaction();

  return res.status(400).json({
    message: "Invalid booking ID",
  });
}

    const booking = await Booking.findById(req.params.id)
      .session(session);

    if (!booking) {
      await session.abortTransaction();
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    if (booking.bookingStatus === "cancelled") {
      await session.abortTransaction();
      return res.status(400).json({
        message: "Booking is already cancelled",
      });
    }

    if (booking.bookingStatus !== "confirmed") {
      await session.abortTransaction();
      return res.status(400).json({
        message: "Only confirmed bookings can be cancelled",
      });
    }

    const trip = await Trip.findById(booking.trip).session(session);

    if (!trip || !trip.journeyDate || !trip.departureTime) {
      await session.abortTransaction();
      return res.status(400).json({
        message: "Valid trip departure details not found",
      });
    }

    const journeyDate = new Date(trip.journeyDate);
    const datePart = journeyDate.toISOString().split("T")[0];

    const departureDateTime = new Date(
      `${datePart}T${trip.departureTime}:00`
    );

    if (Number.isNaN(departureDateTime.getTime())) {
      await session.abortTransaction();
      return res.status(400).json({
        message: "Invalid trip departure date or time",
      });
    }

    const hoursBeforeDeparture =
      (departureDateTime.getTime() - Date.now()) /
      (1000 * 60 * 60);

    let refundPercentage = 0;

    if (hoursBeforeDeparture > 24) {
      refundPercentage = 90;
    } else if (hoursBeforeDeparture >= 6) {
      refundPercentage = 50;
    }

    const refundAmount = Number(
      ((booking.totalAmount * refundPercentage) / 100).toFixed(2)
    );

    // Release only this booking's seats belonging to this trip.
    const seatUpdate = await Seat.updateMany(
      {
        _id: { $in: booking.seats },
        trip: booking.trip,
        status: "booked",
      },
      {
        $set: {
          status: "available",
          lockedUntil: null,
          lockedBy: null,
        },
      },
      { session }
    );

    if (seatUpdate.modifiedCount !== booking.seats.length) {
      throw new Error(
        "Some seats were not booked or do not belong to this trip. Cancellation aborted."
      );
    }

    booking.bookingStatus = "cancelled";
    booking.paymentStatus = "paid";
    booking.refundAmount = refundAmount;
    booking.cancelledAt = new Date();

    await booking.save({ session });

    const payment = await Payment.findOneAndUpdate(
      { booking: booking._id },
      {
        $set: {
          status: "paid",
          refundAmount,
        },
      },
      {
        session,
        new: true,
      }
    );

    if (!payment) {
      throw new Error(
        "Payment record not found. Cancellation aborted."
      );
    }

    await session.commitTransaction();

    return res.status(200).json({
      message:
        "Booking cancelled successfully. Refund calculated only; no gateway refund was processed.",
      refundAmount,
      refundPercentage,
      booking,
    });
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    console.error("Admin cancel booking error:", error.message);

    return res.status(500).json({
      message: "Cancellation failed. No changes were committed.",
    });
  } finally {
    await session.endSession();
  }
};

// Get admin dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: "customer" });

    const totalOperators = await Operator.countDocuments();

    const totalTrips = await Trip.countDocuments();

    const totalBookings = await Booking.countDocuments();

    const confirmedBookings = await Booking.countDocuments({
      bookingStatus: "confirmed",
    });

    const cancelledBookings = await Booking.countDocuments({
      bookingStatus: "cancelled",
    });

    
const totalRevenueResult = await Booking.aggregate([
  {
    $match: {
      bookingStatus: { $in: ["confirmed", "cancelled"] },
      paymentStatus: { $in: ["paid", "refunded"] },
    },
  },
  {
    $group: {
      _id: null,
      totalRevenue: {
        $sum: {
          $cond: [
            { $eq: ["$bookingStatus", "cancelled"] },
            {
              $max: [
                0,
                {
                  $subtract: [
                    "$totalAmount",
                    { $ifNull: ["$refundAmount", 0] },
                  ],
                },
              ],
            },
            "$totalAmount",
          ],
        },
      },
    },
  },
]);


    const totalRevenue =
      totalRevenueResult.length > 0
        ? totalRevenueResult[0].totalRevenue
        : 0;

    res.status(200).json({
      message: "Dashboard statistics fetched successfully",
      statistics: {
        totalUsers,
        totalOperators,
        totalTrips,
        totalBookings,
        confirmedBookings,
        cancelledBookings,
        totalRevenue,
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUserStatus,
  getAllOperators,
  updateOperatorApproval,
  getAllBookings,
  getBookingById,
  cancelBookingByAdmin,
  getDashboardStats,
};