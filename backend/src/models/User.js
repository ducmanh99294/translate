const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    passwordHash: {
      type: String,
      required: true,
    },

    plan: {
      type: String,
      enum: ["free", "premium"],
      default: "free",
    },

    premiumExpiresAt: Date,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);