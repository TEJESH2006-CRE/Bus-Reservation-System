const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema(
  {
    bus: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bus",
      required: true,
    },

    route: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Route",
      required: true,
    },

    journeyDate: {
      type: Date,
      required: true,
    },

    departureTime: {
      type: String,
      required: true,
    },

    arrivalTime: {
      type: String,
      required: true,
    },

    fare: {
  type: Number,
  required: true,
  min: 0,
},

seaterFare: {
  type: Number,
  min: 0,
  default: null,
},

sleeperFare: {
  type: Number,
  min: 0,
  default: null,
},

    status: {
      type: String,
      enum: ["scheduled", "started", "completed", "cancelled"],
      default: "scheduled",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Trip", tripSchema);