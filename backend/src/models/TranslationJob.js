const mongoose = require("mongoose");

const translationJobSchema = new mongoose.Schema(
  {
    chapterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chapter",
      required: true,
    },

    status: {
      type: String,
      enum: ["queued", "processing", "done", "failed"],
      default: "queued",
    },

    errorMessage: {
      type: String,
      default: "",
    },

    attempts: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// unique để tránh race condition tạo 2 job trùng cho cùng 1 chapter
translationJobSchema.index(
  {
    chapterId: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model("TranslationJob", translationJobSchema);