const mongoose = require("mongoose");



const busSchema = new mongoose.Schema(
  {
    operator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Operator",
      required: true,
    },

    busNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    busName: {
      type: String,
      required: true,
      trim: true,
    },

    busType: {
      type: String,
      enum: ["AC", "Non-AC"],
      required: true,
    },

    seatType: {
      type: String,
      enum: ["Seater", "Sleeper", "Seater-Sleeper"],
      required: true,
    },

    totalSeats: {
      type: Number,
      required: true,
      min: 1,
    },

    amenities: [
      {
        type: String,
        trim: true,
      },
    ],

    boardingPoints: [
      {
        type: String,
        trim: true,
      },
    ],

    droppingPoints: [
      {
        type: String,
        trim: true,
      },
    ],

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Bus", busSchema);