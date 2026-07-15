const mongoose = require("mongoose");

const readingProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    seriesId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Series",
      required: true,
    },

    lastChapterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chapter",
    },

    lastScrollPosition: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

readingProgressSchema.index(
  {
    userId: 1,
    seriesId: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model("ReadingProgress", readingProgressSchema);