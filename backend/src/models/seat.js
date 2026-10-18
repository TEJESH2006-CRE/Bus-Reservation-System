const mongoose = require("mongoose");

const seatSchema = new mongoose.Schema(
  {
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip",
      required: true,
    },

    seatNumber: {
      type: String,
      required: true,
      trim: true,
    },

    seatType: {
      type: String,
      enum: ["Seater", "Sleeper"],
      required: true,
    },

    position: {
  type: String,
  enum: ["Window", "Aisle", "Upper", "Lower"],
  default: null,
},

    status: {
      type: String,
      enum: ["available", "booked", "locked"],
      default: "available",
    },

    isLadiesOnly: {
      type: Boolean,
      default: false,
    },

    lockedUntil: {
      type: Date,
      default: null,
    },

    lockedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

seatSchema.index(
  { trip: 1, seatNumber: 1 },
  { unique: true }
);

module.exports = mongoose.model("Seat", seatSchema);