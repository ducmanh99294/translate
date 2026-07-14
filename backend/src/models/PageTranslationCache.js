const mongoose = require("mongoose");

const pageTranslationCacheSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
      unique: true,
    },

    overlays: [
      {
        bbox: {
          x: Number,
          y: Number,
          width: Number,
          height: Number,
        },

        originalText: String,

        translatedText: String,

        backgroundColor: String,

        fontSizeHint: Number,
      },
    ],

    createdAt: {
      type: Date,
      default: Date.now,
      expires: 60 * 60 * 24 * 30, // tự xóa sau 30 ngày (TTL Index)
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "PageTranslationCache",
  pageTranslationCacheSchema
);