const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    otp: {
      type: String,
      required: true,
    },
    purpose: {
      type: String,
      enum: ["password_reset", "email_verification"],
      default: "password_reset",
    },
    attempts: {
      type: Number,
      default: 0,
    },
    maxAttempts: {
      type: Number,
      default: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 600, // Auto-delete after 10 minutes
    },
  },
  { timestamps: false }
);

module.exports = mongoose.model("OTP", otpSchema);
