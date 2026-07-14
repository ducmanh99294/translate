const mongoose = require("mongoose");

const textOverlaySchema = new mongoose.Schema(
  {
    chapterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chapter",
      required: true,
    },

    imageOrder: {
      type: Number,
      required: true,
    },

    bbox: {
      x: Number,
      y: Number,
      width: Number,
      height: Number,
    },

    originalText: {
      type: String,
      required: true,
    },

    translatedText: {
      type: String,
      default: "",
    },

    backgroundColor: {
      type: String,
      default: "#FFFFFF",
    },

    fontSizeHint: {
      type: Number,
      default: 16,
    },
  },
  {
    timestamps: true,
  }
);

textOverlaySchema.index({
  chapterId: 1,
  imageOrder: 1,
});

module.exports = mongoose.model("TextOverlay", textOverlaySchema);