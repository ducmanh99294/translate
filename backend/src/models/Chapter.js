const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema(
  {
    order: Number,

    originalUrl: String,

    height: Number,

    width: Number,

    status: {
      type: String,
      enum: ["pending", "ocr_done", "translated", "failed"],
      default: "pending",
    },
  },
  {
    _id: false,
  }
);

const chapterSchema = new mongoose.Schema(
  {
    seriesId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Series",
      required: true,
    },

    chapterNumber: {
      type: Number,
      required: true,
    },

    title: {
      type: String,
      default: "",
    },

    sourceUrl: {
      type: String,
      required: true,
    },

    images: [imageSchema],

    processedAt: Date,
  },
  {
    timestamps: true,
  }
);

chapterSchema.index(
  {
    seriesId: 1,
    chapterNumber: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model("Chapter", chapterSchema);