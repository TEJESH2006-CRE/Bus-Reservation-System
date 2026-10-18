const mongoose = require("mongoose");

const routeSchema = new mongoose.Schema(
  {
    from: {
      type: String,
      required: true,
      trim: true,
    },

    to: {
      type: String,
      required: true,
      trim: true,
    },

    distance: {
      type: Number,
      min: 0,
    },

    duration: {
      type: String,
      trim: true,
    },

    stops: [
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

module.exports = mongoose.model("Route", routeSchema);