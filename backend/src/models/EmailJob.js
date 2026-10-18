
const mongoose = require("mongoose");

const emailJobSchema = new mongoose.Schema(
  {
    to: {
      type: String,
      required: true,
      trim: true,
    },
    subject: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    attachment: {
      filename: String,
      content: Buffer,
      contentType: String,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "sent", "failed"],
      default: "pending",
    },
    attempts: {
      type: Number,
      default: 0,
    },
    nextAttemptAt: {
      type: Date,
      default: Date.now,
    },
    lastError: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

emailJobSchema.index({ status: 1, nextAttemptAt: 1 });

module.exports = mongoose.model("EmailJob", emailJobSchema);
