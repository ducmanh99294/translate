const mongoose = require("mongoose");

const glossarySchema = new mongoose.Schema(
  {
    seriesId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Series",
      required: true,
    },

    term: {
      type: String,
      required: true,
      trim: true,
    },

    translation: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: ["character", "place", "term", "sfx"],
      required: true,
    },

    source: {
      type: String,
      enum: ["ai_detected", "admin_manual"],
      default: "ai_detected",
    },

    status: {
      type: String,
      enum: ["pending_review", "approved"],
      default: "pending_review",
    },

    confidence: {
      type: Number,
      min: 0,
      max: 1,
    },

    note: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

glossarySchema.index(
  {
    seriesId: 1,
    term: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model("Glossary", glossarySchema);