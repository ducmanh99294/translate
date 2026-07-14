const ReadingProgress = require("../models/ReadingProgress");
const Chapter = require("../models/Chapter");

/**
 * GET /api/progress/:seriesId
 */
exports.getProgress = async (req, res) => {
  try {
    const { seriesId } = req.params;

    const progress = await ReadingProgress.findOne({
      userId: req.user.id,
      seriesId,
    }).populate("lastChapterId");

    if (!progress) {
      return res.json({
        success: true,
        data: null,
      });
    }

    res.json({
      success: true,
      data: progress,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * PUT /api/progress/:seriesId
 */
exports.updateProgress = async (req, res) => {
  try {
    const { seriesId } = req.params;
    const {
      lastChapterId,
      lastScrollPosition,
    } = req.body;

    if (lastChapterId) {
      const chapter = await Chapter.findById(lastChapterId);

      if (!chapter) {
        return res.status(404).json({
          success: false,
          message: "Chapter không tồn tại",
        });
      }
    }

    const progress = await ReadingProgress.findOneAndUpdate(
      {
        userId: req.user.id,
        seriesId,
      },
      {
        lastChapterId,
        lastScrollPosition,
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    res.json({
      success: true,
      message: "Đã cập nhật tiến độ đọc",
      data: progress,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};