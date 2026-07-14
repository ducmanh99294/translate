const mongoose = require("mongoose");

const seriesSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    sourceUrl: {
      type: String,
      required: true,
    },

    sourceSite: {
      type: String,
      required: true,
    },

    originalLanguage: {
      type: String,
      required: true,
      enum: ["ko", "zh", "ja"],
    },

    targetLanguage: {
      type: String,
      default: "vi",
    },

    coverImageUrl: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["ongoing", "completed"],
      default: "ongoing",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Series", seriesSchema);